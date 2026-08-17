'use client';

import React, { useState } from 'react';
import { Check, Clapperboard, RefreshCcw, Timer } from 'lucide-react';
import type { DraftedShot } from '@/types/video';
import { cn } from '@/lib/utils';
import { ShotDialogueCard } from './shot-dialogue-card';
import { NegativePromptField } from './negative-prompt-field';

interface ShotDraftCardProps {
  draft: DraftedShot;
  disabled?: boolean;
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
export function ShotDraftCard({ draft, disabled, onApprove, onRevise }: ShotDraftCardProps) {
  // Local editable copy — the director can tighten dialogue / negative terms
  // before Approve, and the approved shot carries those edits.
  const [draftState, setDraftState] = useState<DraftedShot>(draft);
  const clampedFrom = draftState.durationClampedFrom;

  const patchDraft = (patch: Partial<DraftedShot>) => setDraftState((prev) => ({ ...prev, ...patch }));

  return (
    <div className="mt-2 w-full rounded-xl border border-brand/25 bg-brand/5 p-3.5 space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-brand/10 text-brand border border-brand/25">
          <Clapperboard className="w-3 h-3" aria-hidden="true" />
          Shot {draftState.shotNumber} draft
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-surface-muted text-text-secondary border border-border tabular-nums">
          <Timer className="w-3 h-3 text-accent" aria-hidden="true" />
          {draftState.durationSeconds}s
        </span>
      </div>

      {draftState.description && (
        <p className="text-xs font-semibold text-text-primary leading-relaxed">{draftState.description}</p>
      )}

      {/* The 6-part shot prompt */}
      <pre className="whitespace-pre-wrap break-words rounded-lg bg-surface-code border border-border p-2.5 text-[11px] leading-relaxed text-text-secondary font-mono max-h-56 overflow-y-auto scrollbar-thin">
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
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all',
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
