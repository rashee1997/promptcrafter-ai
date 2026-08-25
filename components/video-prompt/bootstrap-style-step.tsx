'use client';

import React, { useState } from 'react';
import { Check, Palette, Sparkles, Info } from 'lucide-react';
import type { StyleCandidate } from '@/lib/video/bootstrap/types';
import {
  VIDEO_STYLE_LIBRARY,
  STYLE_FAMILY_LABELS,
  getVisualStyle,
  groupStylesByFamily,
  type VisualStyle,
} from '@/lib/video/styles';
import { cn } from '@/lib/utils';



interface BootstrapStyleStepProps {
  /** Currently confirmed VideoStyle candidate (after tailoring or defaults). */
  selectedId: string | null;
  /** The tailored/defaulted style data for display. */
  tailoredStyle: StyleCandidate | null;
  /** Raw library entry id the director picked (before tailoring). */
  libraryStyleId: string | null;
  /** Whether the style has been generated (defaults or AI-tailored). */
  tailored: boolean;
  busy: boolean;
  /** Called when the director picks a library entry (sets libraryStyleId). */
  onSelectLibrary: (libraryId: string) => void;
  /** Called when the director wants to tailor with AI (sends revision note). */
  onTailor: (note?: string) => void;
  /** Called when the director confirms without AI tailoring (use library defaults). */
  onUseDefaults: () => void;
  onConfirm: () => void;
  hasDownstreamWork?: boolean;
}

// ── Library card ────────────────────────────────────────────────────────────

function LibraryStyleCard({
  style,
  selected,
  onSelect,
}: {
  style: VisualStyle;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'group relative rounded-2xl border p-4 text-left transition-all duration-200 text-start',
        selected
          ? 'border-brand/50 bg-brand/5 shadow-lg shadow-brand/10'
          : 'border-border bg-surface-card/60 hover:border-brand/30 hover:bg-surface-card'
      )}
    >
      {selected && (
        <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-brand text-[var(--brand-foreground)] flex items-center justify-center shadow-glow">
          <Check className="w-3.5 h-3.5" aria-hidden="true" />
        </span>
      )}
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-bold text-text-primary">{style.label}</h4>
        <span
          aria-hidden="true"
          className={cn(
            'w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors',
            selected ? 'border-brand bg-brand/20' : 'border-border'
          )}
        >
          {selected && <span className="w-1.5 h-1.5 rounded-full bg-brand" />}
        </span>
      </div>
      <p className="mt-1.5 text-xs text-text-secondary leading-relaxed">{style.summary}</p>
      <p className="mt-2 text-[10px] text-text-muted leading-relaxed">
        <span className="font-semibold text-text-secondary">Best for:</span> {style.bestFor}
      </p>
    </button>
  );
}

// ── Tailored result card ────────────────────────────────────────────────────

function TailoredStyleCard({ option }: { option: StyleCandidate }) {
  return (
    <div className="rounded-2xl border border-brand/30 bg-brand/5 p-4">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand/15 text-brand">
          <Check className="w-3 h-3" aria-hidden="true" />
          Style locked
        </span>
        <h4 className="text-sm font-bold text-text-primary">{option.name}</h4>
      </div>
      <dl className="space-y-1.5">
        <Row label="Look & mood" value={option.lookAndMood} />
        <Row label="Color grade" value={option.colorGrade} />
        <Row label="Film stock" value={option.filmStock} />
        <Row label="Aspect ratio" value={option.aspectRatio} />
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-xs">
      <dt className="shrink-0 w-20 text-[10px] font-bold uppercase tracking-wide text-text-muted pt-0.5">
        {label}
      </dt>
      <dd className="text-text-secondary leading-relaxed">{value}</dd>
    </div>
  );
}

/**
 * Phase E4 — Style selection from curated library with optional AI tailoring.
 *
 * Flow:
 * 1. Director browses the library (grouped by family, with bestFor lines).
 * 2. Director selects one entry.
 * 3. Director optionally enters a revision note and clicks "Tailor with AI".
 *    Or clicks "Use as-is" to skip AI tailoring.
 * 4. After tailoring/defaults, the locked style is shown for review.
 * 5. Director confirms to lock it.
 */
export function BootstrapStyleStep({
  selectedId,
  tailoredStyle,
  libraryStyleId,
  tailored,
  busy,
  onSelectLibrary,
  onTailor,
  onUseDefaults,
  onConfirm,
  hasDownstreamWork,
}: BootstrapStyleStepProps) {
  const [note, setNote] = useState('');
  const [confirmRegen, setConfirmRegen] = useState(false);
  const grouped = groupStylesByFamily();
  const selectedLib = libraryStyleId ? getVisualStyle(libraryStyleId) : null;

  // ── Phase: show locked result after tailoring ──
  if (tailored && selectedId) {
    return (
      <div className="space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
          <Palette className="w-3 h-3 text-brand" aria-hidden="true" />
          Visual style locked — confirm to continue
        </p>

        {tailoredStyle && <TailoredStyleCard option={tailoredStyle} />}

        {/* E5 — style consistency hint */}
        <div className="flex items-start gap-2 rounded-xl border border-border bg-surface-muted/50 px-3 py-2">
          <Info className="w-3.5 h-3.5 text-text-muted mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-[11px] text-text-muted leading-relaxed">
            A style should serve the story, not be chosen decoratively. Claymation can make a brand
            feel human, but it should not be used just because it looks cute.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasDownstreamWork && confirmRegen ? (
            <p className="text-[11px] text-warning font-semibold rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 flex-1">
              Later stages may reference this style — changing it will replace the current selection.
              <button
                type="button"
                onClick={() => {
                  setConfirmRegen(false);
                  onSelectLibrary('');
                }}
                className="ml-2 underline hover:text-warning/80"
              >
                Change style
              </button>
              {' '}or{' '}
              <button
                type="button"
                onClick={() => setConfirmRegen(false)}
                className="underline hover:text-warning/80"
              >
                Cancel
              </button>
            </p>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (hasDownstreamWork) setConfirmRegen(true);
                else onSelectLibrary('');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-border bg-surface-muted text-text-secondary hover:border-brand/40 hover:text-brand transition-colors"
            >
              Change style
            </button>
          )}
          <div className="flex-1" />
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={cn(
              'inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl text-[var(--brand-foreground)]',
              'bg-brand hover:bg-brand-hover shadow-glow active:scale-[0.985] transition-all',
              busy && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Check className="w-4 h-4" aria-hidden="true" />
            Confirm visual style
          </button>
        </div>
      </div>
    );
  }

  // ── Phase: library picker + optional tailoring ──
  return (
    <div className="space-y-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
        <Palette className="w-3 h-3 text-brand" aria-hidden="true" />
        Pick a style from the curated library
      </p>

      {/* Grouped library cards */}
      <div className="space-y-5">
        {grouped.map((group) => (
          <div key={group.family}>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">
              {group.label}
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.styles.map((style) => (
                <LibraryStyleCard
                  key={style.id}
                  style={style}
                  selected={libraryStyleId === style.id}
                  onSelect={() => onSelectLibrary(style.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* E5 — style consistency hint */}
      <div className="flex items-start gap-2 rounded-xl border border-border bg-surface-muted/50 px-3 py-2">
        <Info className="w-3.5 h-3.5 text-text-muted mt-0.5 shrink-0" aria-hidden="true" />
        <p className="text-[11px] text-text-muted leading-relaxed">
          A style should serve the story, not be chosen decoratively. Claymation can make a brand
          feel human, but it should not be used just because it looks cute.
        </p>
      </div>

      {/* Tailoring controls — only visible after a library entry is selected */}
      {selectedLib && (
        <div className="rounded-2xl border border-border bg-surface-card/50 p-4 space-y-3">
          <p className="text-xs font-semibold text-text-primary">
            Selected: {selectedLib.label}
          </p>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            {selectedLib.summary}
          </p>

          {/* Camera vocabulary note */}
          <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
            <span className="font-semibold">Camera:</span>
            {selectedLib.cameraVocabulary === 'cinematic'
              ? 'Lens, film-stock, and aperture language will be used in shot prompts.'
              : selectedLib.cameraVocabulary === 'animated'
                ? 'Framing and movement language will be used — no film-stock or lens specs.'
                : 'Composition and transition language only — no lens or camera movement details.'}
          </div>

          {/* Revision note input + action buttons */}
          <div className="flex gap-2">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && note.trim()) onTailor(note.trim());
              }}
              placeholder="Optional: tailor to this project — e.g. “keep the grade but make it warmer”"
              aria-label="Revision note for AI tailoring"
              className="flex-1 px-3 py-2 rounded-xl text-xs bg-surface-input border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/70 transition-shadow"
            />
            <button
              type="button"
              onClick={() => onTailor(note.trim() || undefined)}
              disabled={busy}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors shrink-0',
                !busy
                  ? 'bg-surface-muted text-text-secondary border-border hover:border-brand/40 hover:text-brand'
                  : 'opacity-40 cursor-not-allowed'
              )}
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              Tailor with AI
            </button>
            <button
              type="button"
              onClick={onUseDefaults}
              disabled={busy}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors shrink-0',
                !busy
                  ? 'bg-surface-muted text-text-secondary border-border hover:border-brand/40 hover:text-brand'
                  : 'opacity-40 cursor-not-allowed'
              )}
            >
              Use as-is
            </button>
          </div>

          {/* Revision-note-only regeneration confirmation */}
          {confirmRegen && (
            <p className="text-[11px] text-warning font-semibold rounded-lg border border-warning/30 bg-warning/5 px-3 py-2">
              Later stages may reference this style — regenerating will replace the current selection.
              {' '}
              <button
                type="button"
                onClick={() => {
                  setConfirmRegen(false);
                  onTailor(note.trim() || undefined);
                }}
                className="underline hover:text-warning/80"
              >
                Confirm regen
              </button>
              {' '}or{' '}
              <button
                type="button"
                onClick={() => setConfirmRegen(false)}
                className="underline hover:text-warning/80"
              >
                Cancel
              </button>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
