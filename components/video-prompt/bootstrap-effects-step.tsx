'use client';

import React, { useState } from 'react';
import { Check, RefreshCw, Zap } from 'lucide-react';
import type { EffectsCandidate } from '@/lib/video/bootstrap/types';
import { cn } from '@/lib/utils';

interface BootstrapEffectsStepProps {
  data: EffectsCandidate[];
  selectedId: string | null;
  busy: boolean;
  onSelect: (id: string) => void;
  /** Regenerate the options; an optional director note is threaded through as
   *  the revisionPrompt ("same direction, heavier particle density"). */
  onRegenerate: (note?: string) => void;
  onConfirm: () => void;
}

function EffectsCard({
  option,
  selected,
  onSelect,
}: {
  option: EffectsCandidate;
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
        <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center shadow-glow">
          <Check className="w-3.5 h-3.5" aria-hidden="true" />
        </span>
      )}
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-bold text-text-primary">{option.name}</h4>
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
      <dl className="mt-2.5 space-y-1.5">
        <Row label="Direction" value={option.vfxDirection} />
        <Row label="Particle density" value={option.particleDensity} />
        <Row label="Pacing" value={option.pacing} />
      </dl>
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-xs">
      <dt className="shrink-0 w-24 text-[10px] font-bold uppercase tracking-wide text-text-muted pt-0.5">
        {label}
      </dt>
      <dd className="text-text-secondary leading-relaxed">{value}</dd>
    </div>
  );
}

/**
 * Stage 5 review — VFX direction candidates as single-choice radio cards.
 * Confirming here locks the VFX direction and activates the project.
 */
export function BootstrapEffectsStep({
  data,
  selectedId,
  busy,
  onSelect,
  onRegenerate,
  onConfirm,
}: BootstrapEffectsStepProps) {
  const [note, setNote] = useState('');

  const handleRegenerate = () => {
    onRegenerate(note.trim() || undefined);
    setNote('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-warning" aria-hidden="true" />
          Choose one VFX direction — it locks effects for every shot
        </p>
        <button
          type="button"
          onClick={() => onRegenerate()}
          disabled={busy}
          title="Reroll without a note"
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors shrink-0',
            'bg-surface-muted text-text-secondary border-border hover:border-brand/40 hover:text-brand',
            busy && 'opacity-40 cursor-not-allowed'
          )}
        >
          <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
          Regenerate
        </button>
      </div>

      {/* D1 — regenerate with a director note instead of a blind reroll */}
      <div className="flex gap-2">
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRegenerate();
          }}
          placeholder="Direct the reroll — e.g. \u201csame direction, heavier particle density\u201d"
          aria-label="Revision note for the VFX direction options"
          className="flex-1 px-3 py-2 rounded-xl text-xs bg-surface-input border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/70 transition-shadow"
        />
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={!note.trim() || busy}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors shrink-0',
            note.trim() && !busy
              ? 'bg-surface-muted text-text-secondary border-border hover:border-brand/40 hover:text-brand'
              : 'opacity-40 cursor-not-allowed'
          )}
        >
          <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
          Reroll with note
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.map((option) => (
          <EffectsCard
            key={option.id}
            option={option}
            selected={selectedId === option.id}
            onSelect={() => onSelect(option.id)}
          />
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy || !selectedId}
          className={cn(
            'inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl text-white',
            'bg-brand hover:bg-brand-hover shadow-glow active:scale-[0.985] transition-all',
            (busy || !selectedId) && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Check className="w-4 h-4" aria-hidden="true" />
          Confirm VFX &amp; activate
        </button>
      </div>
    </div>
  );
}
