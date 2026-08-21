'use client';

import React, { useState } from 'react';
import { Check, Clapperboard, RefreshCw } from 'lucide-react';
import type { DirectionPlan } from '@/types/video';
import { cn } from '@/lib/utils';

interface BootstrapDirectionStepProps {
  data: DirectionPlan;
  busy: boolean;
  onRevise: (prompt: string) => void;
  onConfirm: () => void;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-xs">
      <dt className="shrink-0 w-28 text-[10px] font-bold uppercase tracking-wide text-text-muted pt-0.5">
        {label}
      </dt>
      <dd className="text-text-secondary leading-relaxed">{value}</dd>
    </div>
  );
}

/**
 * Stage 4 review — direction plan. Shows camera language, lens philosophy,
 * colour palette, lighting, sound design, visual motif, pacing, and
 * per-scene shooting notes.
 */
export function BootstrapDirectionStep({ data, busy, onRevise, onConfirm }: BootstrapDirectionStepProps) {
  const [revision, setRevision] = useState('');

  const handleRevise = () => {
    if (!revision.trim() || busy) return;
    onRevise(revision.trim());
    setRevision('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-1">
        <Clapperboard className="w-3 h-3 text-brand" aria-hidden="true" />
        Director&apos;s plan — camera, lens, lighting, sound &amp; pacing
      </div>

      {/* Overview grid */}
      <div className="rounded-xl border border-border bg-surface-card/60 p-4 space-y-2.5">
        <Row label="Camera language" value={data.cameraLanguage} />
        <Row label="Lens philosophy" value={data.lensPhilosophy} />
        <Row label="Colour palette" value={data.colourPalette} />
        <Row label="Lighting" value={data.lightingApproach} />
        <Row label="Sound design" value={data.soundDesign} />
        <Row label="Visual motif" value={data.visualMotif} />
        <Row label="Pacing" value={data.pacingRhythm} />
      </div>

      {/* Per-scene notes */}
      {data.perSceneNotes.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">Per-scene direction</p>
          <div className="grid gap-2">
            {data.perSceneNotes.map((note) => (
              <div key={note.sceneNumber} className="flex gap-3 rounded-xl border border-border bg-surface-card/60 p-3">
                <span className="shrink-0 w-6 h-6 rounded-lg bg-brand/10 border border-brand/25 text-brand text-[10px] font-bold flex items-center justify-center tabular-nums">
                  {note.sceneNumber}
                </span>
                <div className="min-w-0">
                  <span className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold bg-accent/15 text-accent border border-accent/30 uppercase tracking-wider mb-1">
                    {note.shotFunction}
                  </span>
                  <p className="text-xs text-text-secondary leading-relaxed">{note.approach}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revision + confirm */}
      <div className="flex flex-col gap-2.5">
        <div className="flex gap-2">
          <input
            type="text"
            value={revision}
            onChange={(e) => setRevision(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleRevise(); }}
            placeholder={'Revise direction — e.g. "warmer colour palette, more handheld in Act II"'}
            aria-label="Revision note for the direction plan"
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
            Confirm direction
          </button>
        </div>
      </div>
    </div>
  );
}
