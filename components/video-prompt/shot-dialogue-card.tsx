'use client';

import React from 'react';
import { MessageSquareText, Plus, X } from 'lucide-react';
import type { DialogueLine } from '@/types/video';
import { cn } from '@/lib/utils';

interface ShotDialogueCardProps {
  dialogue: DialogueLine[];
  /** Read-only on confirmed ShotCards; editable on the pre-approval draft. */
  editable?: boolean;
  onChange?: (next: DialogueLine[]) => void;
  /** The shot's target clip length — drives the ~2–3 words/second pacing hint. */
  durationSeconds?: number;
}

/** Rough spoken-word ceiling for a clip (~3 words/second, worst case). */
function wordCeiling(durationSeconds?: number): number {
  return Math.max(4, Math.floor((durationSeconds ?? 12) * 3));
}

/**
 * Dialogue card — a distinct block under the shot prompt (never inside the
 * same <pre> as promptText). One row per spoken line: exact speaker name,
 * the line itself, and an optional delivery tone. Pre-approval the director
 * can tighten a line that reads too long for the clip; the ~2–3 words/second
 * rule surfaces a warning when a line exceeds the ceiling.
 */
export function ShotDialogueCard({
  dialogue,
  editable = false,
  onChange,
  durationSeconds,
}: ShotDialogueCardProps) {
  const ceiling = wordCeiling(durationSeconds);

  const updateLine = (index: number, patch: Partial<DialogueLine>) => {
    if (!onChange) return;
    onChange(dialogue.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  };

  const removeLine = (index: number) => {
    if (!onChange) return;
    onChange(dialogue.filter((_, i) => i !== index));
  };

  const addLine = () => {
    if (!onChange) return;
    onChange([...dialogue, { speaker: '', line: '' }]);
  };

  if (dialogue.length === 0 && !editable) return null;

  return (
    <div className="mt-2 w-full rounded-xl border border-border bg-surface-card/60 p-3.5 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-accent/10 text-accent border border-accent/30">
          <MessageSquareText className="w-3 h-3" aria-hidden="true" />
          Dialogue
        </span>
        <span className="text-[9px] text-text-muted">
          {durationSeconds ? `≈ ${ceiling} words max for ${durationSeconds}s` : 'Keep lines speakable'}
        </span>
      </div>

      {dialogue.length === 0 && editable ? (
        <p className="text-[11px] text-text-muted leading-relaxed">
          No spoken lines yet — a silent shot stays silent. Add one only if the beat motivates it.
        </p>
      ) : (
        <div className="space-y-2">
          {dialogue.map((d, i) => {
            const words = d.line.trim() ? d.line.trim().split(/\s+/).length : 0;
            const tooLong = words > ceiling;
            return (
              <div
                key={i}
                className={cn(
                  'rounded-lg border border-border bg-surface-muted/40 p-2 space-y-1.5',
                  tooLong && 'border-warning/40'
                )}
              >
                <div className="flex items-center gap-1.5">
                  {editable ? (
                    <>
                      <input
                        type="text"
                        value={d.speaker}
                        onChange={(e) => updateLine(i, { speaker: e.target.value })}
                        placeholder="Speaker (exact Story Bible name)"
                        aria-label={`Speaker for dialogue line ${i + 1}`}
                        className="min-w-0 flex-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-surface-input border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/70 transition-shadow"
                      />
                      <input
                        type="text"
                        value={d.tone ?? ''}
                        onChange={(e) => updateLine(i, { tone: e.target.value })}
                        placeholder="Delivery (optional)"
                        aria-label={`Delivery tone for dialogue line ${i + 1}`}
                        className="min-w-0 flex-1 px-2 py-1 rounded-md text-[10px] bg-surface-input border border-border text-text-secondary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/70 transition-shadow"
                      />
                      <button
                        type="button"
                        onClick={() => removeLine(i)}
                        aria-label={`Remove dialogue line ${i + 1}`}
                        className="shrink-0 rounded-md p-1 text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                      >
                        <X className="w-3 h-3" aria-hidden="true" />
                      </button>
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-brand/10 text-brand border border-brand/25 shrink-0">
                      {d.speaker}
                    </span>
                  )}
                </div>

                {editable ? (
                  <textarea
                    value={d.line}
                    onChange={(e) => updateLine(i, { line: e.target.value })}
                    rows={1}
                    placeholder="The exact words spoken — short enough for the clip"
                    aria-label={`Dialogue line ${i + 1} text`}
                    className="w-full px-2 py-1 rounded-md text-xs bg-surface-input border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/70 transition-shadow resize-y scrollbar-thin"
                  />
                ) : (
                  <p className="text-xs text-text-primary leading-relaxed">
                    &ldquo;{d.line}&rdquo;
                    {d.tone ? <span className="text-text-muted"> — {d.tone}</span> : null}
                  </p>
                )}

                {tooLong && (
                  <p className="text-[9px] text-warning font-semibold">
                    {words} words — likely too long for {durationSeconds ?? 12}s ({ceiling} word ceiling). Trim it or
                    extend the shot.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {editable && (
        <button
          type="button"
          onClick={addLine}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border border-dashed border-border text-text-muted hover:border-brand/50 hover:text-brand transition-colors"
        >
          <Plus className="w-3 h-3" aria-hidden="true" />
          Add line
        </button>
      )}
    </div>
  );
}
