'use client';

import React from 'react';
import { SlidersHorizontal, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionToggleProps {
  /** Undefined = neither side chosen yet — matches "nothing renders until the user picks a side". */
  value: 'manual' | 'ai' | undefined;
  onChange: (value: 'manual' | 'ai') => void;
  /** Section name, used as the toggle group's aria-label (not rendered visibly — mirrors the Mode-toggle group in prompt-form.tsx). */
  label: string;
}

/**
 * Manual/AI Generated segmented control for a toggle-gated section (Refine,
 * Art direction). Visually mirrors the existing Studio mode-toggle grid
 * (`grid-cols-2 gap-1 p-1 rounded-xl bg-surface-sunken border border-border`)
 * in prompt-form.tsx. Renders nothing else — the parent decides what shows
 * below based on `value`.
 */
export function SectionToggle({ value, onChange, label }: SectionToggleProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-surface-sunken border border-border"
    >
      <button
        type="button"
        onClick={() => onChange('manual')}
        aria-pressed={value === 'manual'}
        className={cn(
          'flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all',
          value === 'manual'
            ? 'bg-surface-card border-brand/40 text-text-primary ring-1 ring-brand/40 shadow-sm'
            : 'border-transparent text-text-muted hover:text-text-primary'
        )}
      >
        <SlidersHorizontal className="w-3.5 h-3.5 text-brand" />
        Manual
      </button>
      <button
        type="button"
        onClick={() => onChange('ai')}
        aria-pressed={value === 'ai'}
        className={cn(
          'flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all',
          value === 'ai'
            ? 'bg-surface-card border-brand/40 text-text-primary ring-1 ring-brand/40 shadow-sm'
            : 'border-transparent text-text-muted hover:text-text-primary'
        )}
      >
        <Sparkles className="w-3.5 h-3.5 text-warning" />
        AI Generated
      </button>
    </div>
  );
}
