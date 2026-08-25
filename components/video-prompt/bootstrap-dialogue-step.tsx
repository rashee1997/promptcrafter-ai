'use client';

import React, { useState } from 'react';
import { Check, MessageSquare, RefreshCw } from 'lucide-react';
import type { ScriptDialogueDraft } from '@/types/video';
import { cn } from '@/lib/utils';

interface BootstrapDialogueStepProps {
  data: ScriptDialogueDraft;
  busy: boolean;
  onRevise: (prompt: string) => void;
  onConfirm: () => void;
}

/**
 * Stage 2 review — script dialogue. Shows each scene's goal, spoken exchanges,
 * and action summary. No camera language (spec-script discipline).
 */
export function BootstrapDialogueStep({ data, busy, onRevise, onConfirm }: BootstrapDialogueStepProps) {
  const [revision, setRevision] = useState('');

  const handleRevise = () => {
    if (!revision.trim() || busy) return;
    onRevise(revision.trim());
    setRevision('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-1">
        <MessageSquare className="w-3 h-3 text-accent" aria-hidden="true" />
        {data.scenes.length} scene{data.scenes.length !== 1 ? 's' : ''} — spoken lines &amp; action (no camera directions)
      </div>

      {data.scenes.map((scene) => (
        <div key={scene.sceneNumber} className="rounded-xl border border-border bg-surface-card/60 p-4 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="shrink-0 w-6 h-6 rounded-lg bg-accent/10 border border-accent/30 text-accent text-[10px] font-bold flex items-center justify-center tabular-nums">
              {scene.sceneNumber}
            </span>
            <p className="text-xs font-semibold text-text-primary">{scene.sceneGoal}</p>
          </div>

          {/* Exchanges */}
          <div className="space-y-1.5 ml-8">
            {scene.exchanges.map((ex, i) => (
              <div key={i} className="text-xs leading-relaxed">
                <span className="font-bold text-text-primary">{ex.speaker}:</span>{' '}
                <span className="text-text-secondary">&ldquo;{ex.line}&rdquo;</span>
                {ex.subtext && (
                  <span className="block text-[10px] text-text-muted italic mt-0.5">
                    subtext: {ex.subtext}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Action */}
          <div className="ml-8">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-0.5">Action</p>
            <p className="text-xs text-text-secondary leading-relaxed">{scene.actionSummary}</p>
          </div>
        </div>
      ))}

      {/* Revision + confirm */}
      <div className="flex flex-col gap-2.5">
        <div className="flex gap-2">
          <input
            type="text"
            value={revision}
            onChange={(e) => setRevision(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleRevise(); }}
            placeholder={'Revise dialogue — e.g. "make the exchange in Scene 2 more tense"'}
            aria-label="Revision note for the dialogue"
            className="flex-1 px-3 py-2 rounded-xl text-xs bg-surface-input border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/70 transition-shadow"
          />
          <button
            type="button"
            onClick={handleRevise}
            disabled={!revision.trim() || busy}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors shrink-0',
              revision.trim() && !busy
                ? 'bg-surface-muted text-text-secondary border-border hover:border-brand/40 hover:text-brand'
                : 'opacity-40 cursor-not-allowed'
            )}
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            Revise
          </button>
        </div>
        <div className="flex justify-end">
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
            Confirm dialogue
          </button>
        </div>
      </div>
    </div>
  );
}
