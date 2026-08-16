'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChipOption } from '@/lib/image-prompts';

/** Subtle per-chip accent dots so the preset grids read at a glance. */
export const CHIP_DOTS = [
  'bg-brand',
  'bg-accent',
  'bg-success',
  'bg-warning',
  'bg-danger',
  'bg-[#e0529c]',
];

interface ChipRowProps {
  label: string;
  icon: React.ReactNode;
  options: ChipOption[];
  value: string | undefined;
  onChange: (id: string) => void;
}

/** Single-select chip row (label + icon + selectable options). */
export function ChipRow({ label, icon, options, value, onChange }: ChipRowProps) {
  return (
    <div className="space-y-2">
      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
        {icon}
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt, i) => {
          const selected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              title={opt.hint}
              aria-pressed={selected}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all',
                selected
                  ? 'bg-brand/15 border-brand text-text-primary ring-1 ring-brand/40 shadow-sm'
                  : 'bg-surface-card/50 border-border text-text-secondary hover:border-brand/40 hover:bg-surface-hover'
              )}
            >
              <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', CHIP_DOTS[i % CHIP_DOTS.length])} />
              {opt.label}
              {selected && <Check className="w-3 h-3 text-brand shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface MultiChipRowProps {
  label: string;
  icon: React.ReactNode;
  options: ChipOption[];
  /** Selected option ids. */
  values: string[];
  onChange: (ids: string[]) => void;
  /** Optional helper text under the row. */
  helper?: string;
}

/** Multi-select chip row — same visual language, toggling membership in a list. */
export function MultiChipRow({ label, icon, options, values, onChange, helper }: MultiChipRowProps) {
  const toggle = (id: string) =>
    onChange(values.includes(id) ? values.filter((v) => v !== id) : [...values, id]);
  return (
    <div className="space-y-2">
      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
        {icon}
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt, i) => {
          const selected = values.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggle(opt.id)}
              title={opt.hint}
              aria-pressed={selected}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all',
                selected
                  ? 'bg-brand/15 border-brand text-text-primary ring-1 ring-brand/40 shadow-sm'
                  : 'bg-surface-card/50 border-border text-text-secondary hover:border-brand/40 hover:bg-surface-hover'
              )}
            >
              <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', CHIP_DOTS[i % CHIP_DOTS.length])} />
              {opt.label}
              {selected && <Check className="w-3 h-3 text-brand shrink-0" />}
            </button>
          );
        })}
      </div>
      {helper && <p className="text-[10px] text-text-muted leading-relaxed">{helper}</p>}
    </div>
  );
}
