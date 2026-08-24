'use client';

import React, { useState } from 'react';
import { AlertTriangle, Check, RefreshCw, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getImageConfigAssist } from '@/lib/ai-client';
import {
  CAMERA_PRESETS,
  COLOR_GRADE_PRESETS,
  COMPOSITION_PRESETS,
  LIGHTING_PRESETS,
  MOOD_PRESETS,
  PLATFORM_OPTIONS,
  RESOLUTION_OPTIONS,
  ChipOption,
} from '@/lib/image-prompts';
import {
  LOGO_BOLDNESS_PRESETS,
  LOGO_CONCEPT_PRESETS,
  LOGO_HIDDEN_MEANING_PRESETS,
  LOGO_INDUSTRY_PRESETS,
  LOGO_LOCKUP_PRESETS,
  LOGO_MARK_TYPES,
  LOGO_PALETTE_PRESETS,
  LOGO_TYPOGRAPHY_PRESETS,
  LOGO_SHAPE_PRESETS,
  LOGO_USAGE_PRESETS,
} from '@/lib/logo-prompts';
import { CHIP_DOTS } from './chip-row';
import { CustomChipEditor, useCustomChipEntry } from './use-custom-chip-entry';
import { ImageConfigAssistFieldOption, ImagePromptInput, ImagePromptLintIssue, ImagePromptReferenceImage } from '@/types';

interface AiConfigAssistProps {
  mode: 'image' | 'logo';
  section: 'refine' | 'artDirection';
  input: ImagePromptInput;
  referenceImages?: { dataUrl: string; purpose: ImagePromptReferenceImage['purpose'] }[];
  /** Called only on explicit Apply, with exactly the currently-selected/edited chip values per field key. */
  onApply: (fieldValues: Record<string, string>) => void;
}

/** Option shape shared by both the AI-proposed chips and the static fallback chips. */
type OptionLike = { value: string; label: string; hint?: string; confidence?: number };

/**
 * Static per-field option lists, mirrored 1:1 from the Manual side of the
 * same field in prompt-form.tsx (Refine) and art-direction.tsx (Art
 * direction) — used both as the `getImageConfigAssist` field domain and as
 * the fallback render when `fields === null`. `platforms` is sourced from
 * `PLATFORM_OPTIONS` (image/logo Refine); the rest come straight from the
 * same `lib/image-prompts.ts` / `lib/logo-prompts.ts` preset arrays the
 * Manual chip rows already use.
 */
const STATIC_FIELD_OPTIONS: Record<'refine' | 'artDirection', Record<'image' | 'logo', Record<string, ChipOption[]>>> = {
  refine: {
    image: { platforms: PLATFORM_OPTIONS },
    logo: {
      industry: LOGO_INDUSTRY_PRESETS,
      logoType: LOGO_MARK_TYPES,
      concept: LOGO_CONCEPT_PRESETS,
      palette: LOGO_PALETTE_PRESETS,
      platforms: PLATFORM_OPTIONS,
    },
  },
  artDirection: {
    image: {
      lighting: LIGHTING_PRESETS,
      mood: MOOD_PRESETS,
      composition: COMPOSITION_PRESETS,
      camera: CAMERA_PRESETS,
      colorGrade: COLOR_GRADE_PRESETS,
      resolution: RESOLUTION_OPTIONS as ChipOption[],
    },
    logo: {
      shapeLanguage: LOGO_SHAPE_PRESETS,
      typography: LOGO_TYPOGRAPHY_PRESETS,
      lockup: LOGO_LOCKUP_PRESETS,
      hiddenMeaning: LOGO_HIDDEN_MEANING_PRESETS,
      usage: LOGO_USAGE_PRESETS,
      boldness: LOGO_BOLDNESS_PRESETS,
      mood: MOOD_PRESETS,
      resolution: RESOLUTION_OPTIONS as ChipOption[],
    },
  },
};

/** Human-readable label per field key, for the row heading. Mirrors the labels used by the Manual ChipRows in prompt-form.tsx / art-direction.tsx. */
const FIELD_LABELS: Record<string, string> = {
  platforms: 'Tune prompts for',
  industry: 'Industry & audience',
  logoType: 'Mark type',
  concept: 'Concept & meaning',
  palette: 'Color palette',
  lighting: 'Lighting',
  mood: 'Mood',
  composition: 'Composition & framing',
  camera: 'Camera & lens',
  colorGrade: 'Color grade & film stock',
  resolution: 'Output resolution',
  shapeLanguage: 'Shape language',
  typography: 'Typography direction',
  lockup: 'Lockup layout',
  hiddenMeaning: 'Hidden meaning',
  usage: 'Where the logo must work',
  boldness: 'Concept boldness',
};

/** Skeleton row matching ChipRow's chip-grid layout, shown while a request is in flight. */
function ChipRowSkeleton({ label }: { label: string }) {
  return (
    <div className="space-y-2">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">{label}</span>
      <div className="flex flex-wrap items-center gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="skeleton inline-block h-[26px] w-20 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

/**
 * One field row shared by both the AI-proposed chips and the static fallback
 * chips — selectable option chips (reusing CHIP_DOTS styling), editable
 * inline via the existing CustomChipEditor/useCustomChipEntry pattern once
 * picked. Purely local: selecting/editing here only updates the parent
 * AiConfigAssist's `values` map, nothing is written upstream until Apply.
 */
function AssistFieldRow({
  field,
  mode,
  label,
  options,
  value,
  onValueChange,
  onReroll,
  isRerolling,
}: {
  field: string;
  mode: 'image' | 'logo';
  label: string;
  options: OptionLike[];
  value: string | undefined;
  onValueChange: (value: string) => void;
  /** Regenerates just this field's options, if AI generation is active (undefined on the static fallback). */
  onReroll?: (field: string) => void;
  isRerolling?: boolean;
}) {
  // Local-only custom entry — inline edit of a starting value, not persisted
  // to saved presets (nothing is written anywhere before Apply).
  const custom = useCustomChipEntry({ field: `assist-${field}`, mode });

  const handleConfirm = () => {
    const v = custom.confirmDraft();
    if (v !== null) onValueChange(v);
  };

  const showsCustomChip = value !== undefined && value !== '' && !options.some((o) => o.value === value);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">{label}</span>
        {onReroll && (
          <button
            type="button"
            disabled={isRerolling}
            onClick={() => onReroll(field)}
            title="Regenerate this field only"
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-text-muted hover:text-brand transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RefreshCw className={cn('w-3 h-3', isRerolling && 'animate-spin')} />
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {options.map((opt, i) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onValueChange(opt.value)}
              title={opt.hint}
              aria-pressed={selected}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all',
                selected
                  ? 'bg-brand/15 border-brand text-text-primary ring-1 ring-brand/40 shadow-sm'
                  : 'bg-surface-card/50 border-border text-text-secondary hover:border-brand/40 hover:bg-surface-hover'
              )}
            >
              <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', CHIP_DOTS[i % CHIP_DOTS.length])} />
              {opt.label}
              {typeof opt.confidence === 'number' && opt.confidence >= 0.8 && (
                <span className="text-[9px] font-semibold px-1 py-0.5 rounded bg-brand/20 text-brand shrink-0">
                  {Math.round(opt.confidence * 100)}%
                </span>
              )}
              {selected && <Check className="w-3 h-3 text-brand shrink-0" />}
            </button>
          );
        })}

        {/* Selected value that isn't one of the option chips (edited inline) renders as its own selected chip. */}
        {showsCustomChip && (
          <button
            type="button"
            onClick={() => onValueChange(value as string)}
            title="Edited value"
            aria-pressed
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border bg-brand/15 border-brand text-text-primary ring-1 ring-brand/40 shadow-sm"
          >
            <span className="max-w-[160px] truncate">{value}</span>
            <Check className="w-3 h-3 text-brand shrink-0" />
          </button>
        )}

        {custom.entering ? (
          <CustomChipEditor
            draft={custom.draft}
            onDraftChange={custom.changeDraft}
            onConfirm={handleConfirm}
            onSave={handleConfirm}
            onCancel={custom.cancel}
          />
        ) : (
          <button
            type="button"
            onClick={custom.begin}
            aria-label={`Edit ${label.toLowerCase()} value`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border border-dashed border-border text-text-muted hover:text-brand hover:border-brand/40 transition-all"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Review-before-apply panel for one toggle-gated section's AI side. Does NOT
 * call `getImageConfigAssist` on mount — only after the user presses
 * "Generate options" (mirrors art-direction.tsx's negative-prompt Suggest
 * button convention: "Manual (button press) only: auto-firing would be too
 * disruptive"). On `{fields: null}`, falls back to the same static option
 * lists the Manual side renders for this field set, so the section stays
 * fully usable via Apply either way — nothing is written to parent/lifted
 * state until Apply is pressed.
 */
export function AiConfigAssist({ mode, section, input, referenceImages, onApply }: AiConfigAssistProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'unavailable'>('idle');
  const [fields, setFields] = useState<Record<string, ImageConfigAssistFieldOption[]>>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const [lintIssues, setLintIssues] = useState<ImagePromptLintIssue[]>([]);
  const [rerollingField, setRerollingField] = useState<string | null>(null);

  const fieldDomain = STATIC_FIELD_OPTIONS[section][mode];
  const fieldKeys = Object.keys(fieldDomain);

  const handleGenerate = async () => {
    setStatus('loading');
    const response = await getImageConfigAssist({ mode, section, input, referenceImages });
    if (response.fields === null) {
      setStatus('unavailable');
      return;
    }
    setFields(response.fields);
    setLintIssues(response.lintIssues ?? []);
    setStatus('ready');
  };

  const handleReroll = async (field: string) => {
    setRerollingField(field);
    const response = await getImageConfigAssist({ mode, section, input, referenceImages, targetFields: [field] });
    if (response.fields?.[field]) {
      setFields((prev) => ({ ...prev, [field]: response.fields![field] }));
      setLintIssues((prev) => [
        ...prev.filter((issue) => !issue.message.includes(`"${field}"`)),
        ...(response.lintIssues ?? []),
      ]);
    }
    setRerollingField(null);
  };

  const handleApply = () => {
    onApply(values);
  };

  const optionsFor = (key: string): OptionLike[] =>
    status === 'ready'
      ? fields[key] ?? []
      : STATIC_FIELD_OPTIONS[section][mode][key].map((o) => ({ value: o.id, label: o.label, hint: o.hint }));

  return (
    <div className="space-y-3 p-3 rounded-xl bg-surface-muted/40 border border-border">
      {status === 'idle' && (
        <button
          type="button"
          onClick={handleGenerate}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-gradient-to-r from-brand/20 to-accent/20 hover:from-brand/30 hover:to-accent/30 text-brand border border-brand/35 shadow-xs transition-all"
        >
          <Sparkles className="w-3 h-3 text-brand" />
          Generate options
        </button>
      )}

      {status === 'loading' && (
        <div className="space-y-4">
          {fieldKeys.map((key) => (
            <ChipRowSkeleton key={key} label={FIELD_LABELS[key] ?? key} />
          ))}
        </div>
      )}

      {status === 'unavailable' && (
        <p className="text-[10px] text-warning font-medium leading-relaxed">
          AI suggestions unavailable — showing manual presets instead.
        </p>
      )}

      {(status === 'ready' || status === 'unavailable') && (
        <div className="space-y-4">
          {fieldKeys.map((key) => (
            <AssistFieldRow
              key={key}
              field={key}
              mode={mode}
              label={FIELD_LABELS[key] ?? key}
              options={optionsFor(key)}
              value={values[key]}
              onValueChange={(v) => setValues((prev) => ({ ...prev, [key]: v }))}
              onReroll={status === 'ready' ? handleReroll : undefined}
              isRerolling={rerollingField === key}
            />
          ))}
          {lintIssues.length > 0 && (
            <ul className="space-y-1 bg-warning/10 p-2.5 rounded-lg border border-warning/20">
              {lintIssues.map((issue, i) => (
                <li key={i} className="text-[11px] flex items-start gap-1.5">
                  <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5 text-warning" />
                  <span className="text-warning">{issue.message}</span>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={handleApply}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-brand text-white hover:bg-brand-hover shadow-sm transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
