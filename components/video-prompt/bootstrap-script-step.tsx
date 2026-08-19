'use client';

import React, { useState } from 'react';
import { Check, Clapperboard, RefreshCw, ScrollText } from 'lucide-react';
import type { ScriptTreatment } from '@/lib/video/bootstrap/types';
import { cn } from '@/lib/utils';

interface BootstrapScriptStepProps {
  data: ScriptTreatment;
  busy: boolean;
  onRevise: (prompt: string) => void;
  onConfirm: () => void;
}

const BEAT_LABELS = ['Act I — Setup', 'Act II — Confrontation', 'Act III — Resolution'];

/**
 * Stage 1 review — the confirmed script treatment. Shows the logline, the
 * three act beats as cards, the narrative tone badge, and the overview, with
 * a revision input ("regenerate with a note") and a confirm action.
 */
export function BootstrapScriptStep({
  data,
  busy,
  onRevise,
  onConfirm,
}: BootstrapScriptStepProps) {
  const [revision, setRevision] = useState('');

  const handleRevise = () => {
    if (!revision.trim() || busy) return;
    onRevise(revision.trim());
    setRevision('');
  };

  return (
    <div className="space-y-4">
      {/* Logline */}
      <div className="rounded-xl border border-brand/30 bg-brand/5 p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-brand flex items-center gap-1.5">
          <ScrollText className="w-3 h-3" aria-hidden="true" />
          Logline
        </p>
        <p className="mt-1.5 text-sm text-text-primary leading-relaxed">{data.logline}</p>
      </div>

      {/* Act beats */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-2">
          Act beats
        </p>
        <div className="grid gap-2">
          {data.actBeats.map((beat, i) => (
            <div
              key={i}
              className="flex gap-3 rounded-xl border border-border bg-surface-card/60 p-3.5"
            >
              <span className="shrink-0 w-7 h-7 rounded-lg bg-brand/10 border border-brand/25 text-brand text-[10px] font-bold flex items-center justify-center tabular-nums">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-text-muted">
                  {BEAT_LABELS[i]}
                </p>
                <p className="mt-0.5 text-xs text-text-secondary leading-relaxed">{beat}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tone + overview */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="rounded-xl border border-border bg-surface-card/60 p-3.5 sm:w-44 shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Narrative tone</p>
          <span className="mt-1.5 inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent-soft text-text-primary border border-accent/30">
            {data.tone}
          </span>
        </div>
        <div className="flex-1 rounded-xl border border-border bg-surface-card/60 p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Overview</p>
          <p className="mt-1 text-xs text-text-secondary leading-relaxed">{data.overview}</p>
        </div>
      </div>

      {/* Revision + confirm */}
      <div className="flex flex-col gap-2.5">
        <div className="flex gap-2">
          <input
            type="text"
            value={revision}
            onChange={(e) => setRevision(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRevise();
            }}
            placeholder="Revise the treatment — e.g. \u201cmake the heist more tense and claustrophobic\u201d"
            aria-label="Revision note for the script treatment"
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
              'inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl text-white',
              'bg-brand hover:bg-brand-hover shadow-glow active:scale-[0.985] transition-all',
              busy && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Check className="w-4 h-4" aria-hidden="true" />
            Confirm script
          </button>
        </div>
      </div>
    </div>
  );
}
