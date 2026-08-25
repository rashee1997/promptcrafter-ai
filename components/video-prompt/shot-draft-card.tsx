'use client';

import React, { useState } from 'react';
import { Check, Clapperboard, RefreshCcw, Timer, X } from 'lucide-react';
import type { DraftedShot, PromptForm, VideoProject, VideoTargetPlatform } from '@/types/video';
import { cn } from '@/lib/utils';
import { PROMPT_FORM_LABELS } from '@/lib/video/system-prompt';
import { getPlatformSpec } from '@/lib/video/platforms';
import { detectStyleConflicts, compositionGuard } from '@/lib/video/styles';
import { ShotDialogueCard } from './shot-dialogue-card';
import { NegativePromptField } from './negative-prompt-field';

const PROMPT_FORM_OPTIONS: { value: PromptForm | 'auto'; label: string }[] = [
  { value: 'auto', label: 'Let AI choose' },
  { value: 'flowing-prose', label: 'Flowing prose' },
  { value: 'minimal-labeled', label: 'Minimal labeled' },
  { value: 'time-coded', label: 'Time-coded' },
  { value: 'reference-directive', label: 'Reference directive' },
];

const PLATFORM_OPTIONS: { value: VideoTargetPlatform; label: string }[] = [
  { value: 'veo', label: 'Veo' },
  { value: 'kling', label: 'Kling' },
  { value: 'seedance', label: 'Seedance' },
  { value: 'higgsfield', label: 'Higgsfield' },
  { value: 'runway', label: 'Runway' },
  { value: 'luma', label: 'Luma' },
  { value: 'pika', label: 'Pika' },
];

/** Platforms that lack native multi-shot support — triggers smart-suggest. */
const NO_MULTI_SHOT_PLATFORMS = new Set<VideoTargetPlatform>(['runway', 'luma', 'pika']);

interface ShotDraftCardProps {
  draft: DraftedShot;
  disabled?: boolean;
  /** The project's target platform — for smart-suggest. */
  targetPlatform?: VideoTargetPlatform | null;
  /** Phase 6 — the full project for style-lock and composition guard checks. */
  project?: VideoProject;
  onApprove: (draft: DraftedShot) => void;
  onRevise: (draft: DraftedShot) => void;
}

/**
 * Phase 4 — the assistant's drafted shot rendered as a storyboard card with
 * explicit Approve / Request Revision actions. Approving persists the shot
 * into the project (dialogue + negative prompt ride along); revising
 * re-drafts it. Dialogue and the negative prompt are editable inline before
 * Approve — separate cards, never merged into the promptText well.
 */
export function ShotDraftCard({ draft, disabled, targetPlatform, project, onApprove, onRevise }: ShotDraftCardProps) {
  // Local editable copy — the director can tighten dialogue / negative terms
  // before Approve, and the approved shot carries those edits.
  const [draftState, setDraftState] = useState<DraftedShot>(draft);
  const clampedFrom = draftState.durationClampedFrom;

  const patchDraft = (patch: Partial<DraftedShot>) => setDraftState((prev) => ({ ...prev, ...patch }));

  // Phase 4 — smart-suggest for multi-beat content on non-multi-shot platforms.
  const [dismissedSuggestion, setDismissedSuggestion] = useState(false);
  const effectivePlatform = draftState.platformOverride ?? targetPlatform;
  const multiBeatPattern = /\b(beat\s*[123]|shot\s*[123]|sequence|combo|flurry|barrage|rapid[- ]?fire)\b/i;
  const showsMultiBeat = multiBeatPattern.test(draftState.promptText) || multiBeatPattern.test(draftState.description);
  const showPlatformSuggestion =
    !dismissedSuggestion &&
    effectivePlatform &&
    NO_MULTI_SHOT_PLATFORMS.has(effectivePlatform) &&
    showsMultiBeat;

  // Phase 6 — style-lock enforcement: detect contradictions.
  const [dismissedStyleConflict, setDismissedStyleConflict] = useState(false);
  const styleConflicts = project?.storyBible?.style?.styleId
    ? detectStyleConflicts(draftState.promptText + ' ' + draftState.description, project.storyBible.style.styleId)
    : [];
  const showStyleConflict = !dismissedStyleConflict && styleConflicts.length > 0;

  // Phase 6 — two-character composition guard.
  const [dismissedComposition, setDismissedComposition] = useState(false);
  const charCount = (() => {
    if (!project) return 0;
    const chars = project.storyBible?.characters ?? [];
    const lower = (draftState.promptText + ' ' + draftState.description).toLowerCase();
    return chars.filter((c) => lower.includes(c.name.toLowerCase())).length;
  })();
  const compositionWarning = compositionGuard(charCount);
  const showCompositionWarning = !dismissedComposition && !!compositionWarning;

  return (
    <div className="mt-2 w-full rounded-xl border border-brand/25 bg-brand/5 p-3.5 space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-brand/10 text-brand border border-brand/25">
          <Clapperboard className="w-3 h-3" aria-hidden="true" />
          Shot {draftState.shotNumber} draft
        </span>
        {draftState.shotFunction && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-accent/15 text-accent border border-accent/30">
            {draftState.shotFunction}
          </span>
        )}
        {draftState.promptForm && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-brand/10 text-brand border border-brand/25">
            {PROMPT_FORM_LABELS[draftState.promptForm] ?? draftState.promptForm}
          </span>
        )}
        {draftState.emotion && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-surface-muted text-text-secondary border border-border italic">
            {draftState.emotion}
          </span>
        )}
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-surface-muted text-text-secondary border border-border tabular-nums">
          <Timer className="w-3 h-3 text-accent" aria-hidden="true" />
          {draftState.durationSeconds}s
        </span>
      </div>

      {draftState.description && (
        <p className="text-xs font-semibold text-text-primary leading-relaxed">{draftState.description}</p>
      )}

      {/* Phase 6 — style-lock enforcement: style conflict warning */}
      {showStyleConflict && (
        <div className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/5 p-2.5">
          <X className="w-3.5 h-3.5 text-danger mt-0.5 shrink-0" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-danger">Style conflict detected</p>
            <p className="text-[10px] text-text-secondary leading-relaxed mt-0.5">
              This shot contains language that contradicts the locked visual style: {styleConflicts.map((k) => `"${k}"`).join(', ')}. Please revise to use language consistent with the style family.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDismissedStyleConflict(true)}
            className="p-0.5 rounded text-text-muted hover:text-text-secondary transition-colors shrink-0"
            aria-label="Dismiss style conflict warning"
          >
            <X className="w-3 h-3" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Phase 6 — two-character composition guard */}
      {showCompositionWarning && (
        <div className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/5 p-2.5">
          <X className="w-3.5 h-3.5 text-warning mt-0.5 shrink-0" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-warning">Composition note</p>
            <p className="text-[10px] text-text-secondary leading-relaxed mt-0.5">
              {compositionWarning}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDismissedComposition(true)}
            className="p-0.5 rounded text-text-muted hover:text-text-secondary transition-colors shrink-0"
            aria-label="Dismiss composition warning"
          >
            <X className="w-3 h-3" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Phase 4 — smart-suggest: platform recommendation */}
      {showPlatformSuggestion && (
        <div className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/5 p-2.5">
          <X className="w-3.5 h-3.5 text-warning mt-0.5 shrink-0" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-warning">Platform suggestion</p>
            <p className="text-[10px] text-text-secondary leading-relaxed mt-0.5">
              This shot contains multi-beat action content. Consider overriding to Kling or Seedance for better multi-shot results.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDismissedSuggestion(true)}
            className="p-0.5 rounded text-text-muted hover:text-text-secondary transition-colors shrink-0"
            aria-label="Dismiss suggestion"
          >
            <X className="w-3 h-3" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Phase 4 — shot-level customization controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Prompt form override selector */}
        <div className="relative">
          <label className="sr-only" htmlFor={`draft-form-${draftState.shotNumber}`}>Prompt form override</label>
          <select
            id={`draft-form-${draftState.shotNumber}`}
            value={draftState.promptFormOverride ?? 'auto'}
            onChange={(e) => patchDraft({ promptFormOverride: e.target.value as PromptForm | 'auto' })}
            className="appearance-none px-2 py-1 pr-5 rounded-lg text-[9px] font-semibold bg-surface-muted text-text-secondary border border-border hover:border-brand/40 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/50"
            title="Override the AI's prompt form choice for this shot"
          >
            {PROMPT_FORM_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Custom label chip (for minimal-labeled form) */}
        {(draftState.promptFormOverride === 'minimal-labeled' || draftState.promptForm === 'minimal-labeled') && (
          <input
            type="text"
            value={draftState.customLabel ?? ''}
            onChange={(e) => patchDraft({ customLabel: e.target.value || undefined })}
            placeholder="Add a label (e.g. Sound cue)"
            aria-label="Custom label for minimal-labeled form"
            className="px-2 py-1 rounded-lg text-[9px] font-semibold bg-surface-muted text-text-secondary border border-border hover:border-brand/40 transition-colors focus:outline-none focus:ring-2 focus:ring-brand/50 w-36 placeholder:text-text-muted"
          />
        )}

        {/* Platform override selector */}
        <div className="relative">
          <label className="sr-only" htmlFor={`draft-platform-${draftState.shotNumber}`}>Platform override</label>
          <select
            id={`draft-platform-${draftState.shotNumber}`}
            value={draftState.platformOverride ?? ''}
            onChange={(e) => patchDraft({ platformOverride: (e.target.value as VideoTargetPlatform) || undefined })}
            className="appearance-none px-2 py-1 pr-5 rounded-lg text-[9px] font-semibold bg-surface-muted text-text-secondary border border-border hover:border-brand/40 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/50"
            title="Override the project's platform for this shot only"
          >
            <option value="">Inherit project</option>
            {PLATFORM_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* The 6-part shot prompt */}
      <pre className="whitespace-pre-wrap break-words rounded-lg bg-surface-code border border-border p-2.5 text-[11px] leading-relaxed text-text-secondary font-mono max-h-56 overflow-y-auto scrollbar-thin overflow-x-hidden">
        {draftState.promptText}
      </pre>

      {/* A5 — the model asked for a longer clip than the 8–30s ceiling. */}
      {clampedFrom !== undefined && (
        <p className="rounded-lg border border-warning/30 bg-warning/5 px-2.5 py-1.5 text-[10px] text-warning font-medium">
          Clamped from {clampedFrom}s → {draftState.durationSeconds}s (8–30s ceiling).
        </p>
      )}

      {/* Dialogue — a separate card, never inside the promptText well */}
      <ShotDialogueCard
        dialogue={draftState.dialogue}
        editable
        onChange={(dialogue) => patchDraft({ dialogue })}
        durationSeconds={draftState.durationSeconds}
      />

      {/* Negative prompt — separate field, editable before Approve */}
      <NegativePromptField
        value={draftState.negativePrompt}
        onChange={(negativePrompt) => patchDraft({ negativePrompt })}
        hasDialogue={draftState.dialogue.length > 0}
        promptText={draftState.promptText}
      />

      {draftState.continuityHandoff && (
        <p className="text-[11px] text-text-muted leading-relaxed">
          <span className="font-bold uppercase tracking-wider text-text-muted">Handoff: </span>
          {draftState.continuityHandoff}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-0.5">
        <button
          type="button"
          onClick={() => onApprove(draftState)}
          disabled={disabled}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--brand-foreground)] transition-all',
            'bg-brand hover:bg-brand-hover shadow-glow active:scale-[0.985]',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Check className="w-3.5 h-3.5" aria-hidden="true" />
          Approve &amp; Add to Storyboard
        </button>
        <button
          type="button"
          onClick={() => onRevise(draftState)}
          disabled={disabled}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
            'bg-surface-muted text-text-secondary border-border hover:border-brand/40 hover:text-brand',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <RefreshCcw className="w-3.5 h-3.5" aria-hidden="true" />
          Request Revision
        </button>
      </div>
    </div>
  );
}
