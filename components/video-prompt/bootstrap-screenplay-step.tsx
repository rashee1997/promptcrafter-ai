'use client';

import React, { useState } from 'react';
import { Check, Film, RefreshCw } from 'lucide-react';
import type { ScreenplayScene } from '@/types/video';
import { cn } from '@/lib/utils';

interface BootstrapScreenplayStepProps {
  data: ScreenplayScene[];
  busy: boolean;
  onRevise: (prompt: string) => void;
  onConfirm: () => void;
}

/**
 * Stage 3 review — screenplay scenes. Shows sluglines, INT/EXT, time of day,
 * characters present, action, and estimated shot count.
 */
export function BootstrapScreenplayStep({ data, busy, onRevise, onConfirm }: BootstrapScreenplayStepProps) {
  const [revision, setRevision] = useState('');

  const handleRevise = () => {
    if (!revision.trim() || busy) return;
    onRevise(revision.trim());
    setRevision('');
  };

  const totalShots = data.reduce((sum, s) => sum + s.estimatedShots, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-1">
        <Film className="w-3 h-3 text-brand" aria-hidden="true" />
        {data.length} scene{data.length !== 1 ? 's' : ''} · ~{totalShots} estimated shot{totalShots !== 1 ? 's' : ''}
      </div>

      {data.map((scene) => (
        <div key={scene.sceneNumber} className="rounded-xl border border-border bg-surface-card/60 p-4 space-y-2">
          {/* Slugline header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="shrink-0 px-2 py-0.5 rounded-lg bg-brand/10 border border-brand/25 text-brand text-[10px] font-bold tabular-nums">
                SC {scene.sceneNumber}
              </span>
              <span className="text-xs font-mono font-bold text-text-primary truncate">{scene.slugline}</span>
            </div>
            <span className="shrink-0 text-[10px] font-semibold text-text-muted tabular-nums">
              ~{scene.estimatedShots} shot{scene.estimatedShots !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 text-[10px]">
            <span className="px-1.5 py-0.5 rounded border border-border bg-surface-muted text-text-secondary font-semibold">
              {scene.interiorExterior}
            </span>
            <span className="text-text-muted">{scene.timeOfDay}</span>
            {scene.presentCharacterIds.length > 0 && (
              <span className="text-text-muted">
                Cast: {scene.presentCharacterIds.join(', ')}
              </span>
            )}
          </div>

          {/* Action */}
          <p className="text-xs text-text-secondary leading-relaxed">{scene.action}</p>
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
            placeholder={'Revise screenplay — e.g. "combine scenes 3 and 4"'}
            aria-label="Revision note for the screenplay"
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
            Confirm screenplay
          </button>
        </div>
      </div>
    </div>
  );
}
