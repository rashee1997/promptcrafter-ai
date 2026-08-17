'use client';

import React from 'react';
import { Check, Palette, RefreshCw } from 'lucide-react';
import type { StyleCandidate } from '@/lib/video/bootstrap/types';
import { cn } from '@/lib/utils';

interface BootstrapStyleStepProps {
  data: StyleCandidate[];
  selectedId: string | null;
  busy: boolean;
  onSelect: (id: string) => void;
  onRegenerate: () => void;
  onConfirm: () => void;
}

function StyleCard({
  option,
  selected,
  onSelect,
}: {
  option: StyleCandidate;
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
        <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-brand to-accent text-white flex items-center justify-center shadow-glow">
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
        <Row label="Look & mood" value={option.lookAndMood} />
        <Row label="Color grade" value={option.colorGrade} />
        <Row label="Film stock" value={option.filmStock} />
        <Row label="Aspect ratio" value={option.aspectRatio} />
      </dl>
    </button>
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
 * Stage 4 review — visual style candidates as single-choice radio cards.
 * Selecting an option here locks the Visual Style for the whole production
 * when the stage is confirmed.
 */
export function BootstrapStyleStep({
  data,
  selectedId,
  busy,
  onSelect,
  onRegenerate,
  onConfirm,
}: BootstrapStyleStepProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
          <Palette className="w-3 h-3 text-brand" aria-hidden="true" />
          Choose one look — it locks the visual direction
        </p>
        <button
          type="button"
          onClick={onRegenerate}
          disabled={busy}
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

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.map((option) => (
          <StyleCard
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
            'bg-gradient-to-br from-brand to-accent shadow-glow hover:brightness-110 active:scale-[0.985] transition-all',
            (busy || !selectedId) && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Check className="w-4 h-4" aria-hidden="true" />
          Confirm visual style
        </button>
      </div>
    </div>
  );
}
