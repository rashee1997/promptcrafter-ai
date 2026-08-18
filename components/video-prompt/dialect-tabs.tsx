'use client';

import React, { useRef } from 'react';
import { Check } from 'lucide-react';
import { VIDEO_DIALECTS, type VideoDialect } from '@/lib/video/model-dialects';
import { cn } from '@/lib/utils';

/**
 * Chip order for the storyboard card — target dialects first, with Universal
 * (the stored source of truth) as the default tab / copy target.
 */
const CHIP_ORDER: VideoDialect['id'][] = ['veo', 'higgsfield', 'kling', 'seedance', 'universal'];

interface DialectTabsProps {
  value: VideoDialect['id'];
  onChange: (id: VideoDialect['id']) => void;
  disabled?: boolean;
  /** Unique per-card suffix so tab ids don't collide across storyboard cards. */
  groupId?: string;
}

/**
 * Phase 5 — the dialect selector chip group on each storyboard card. A
 * role="tablist" group with arrow-key navigation (mirrors the app's domain
 * selector pattern): Left/Right cycle, Home/End jump, Enter/Space activate.
 */
export function DialectTabs({ value, onChange, disabled, groupId = 'dialect' }: DialectTabsProps) {
  const tabPrefix = `dialect-tab-${groupId}`;
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const chips = CHIP_ORDER.map((id) => VIDEO_DIALECTS.find((d) => d.id === id)).filter(
    (d): d is VideoDialect => Boolean(d)
  );

  const focusTab = (index: number) => {
    const el = tabRefs.current[index];
    el?.focus();
    const id = chips[index]?.id;
    if (id) onChange(id);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    if (e.key === 'Home') focusTab(0);
    else if (e.key === 'End') focusTab(chips.length - 1);
    else if (e.key === 'ArrowLeft') focusTab((index - 1 + chips.length) % chips.length);
    else focusTab((index + 1) % chips.length);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <div
        role="tablist"
        aria-label="Prompt dialect"
        aria-orientation="horizontal"
        className="flex flex-wrap items-center gap-1.5"
      >
      {chips.map((dialect, i) => {
        const selected = dialect.id === value;
        return (
          <button
            key={dialect.id}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${tabPrefix}-${dialect.id}`}
            aria-selected={selected}
            aria-controls={`dialect-preview-${groupId}`}
            tabIndex={selected ? 0 : -1}
            title={dialect.hint}
            disabled={disabled}
            onClick={() => onChange(dialect.id)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className={cn(
              'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60',
              selected
                ? 'bg-brand/10 text-brand border-brand/40'
                : 'bg-surface-muted text-text-secondary border-border hover:border-brand/40 hover:text-brand',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {selected && <Check className="w-3 h-3 shrink-0" aria-hidden="true" />}
            {dialect.label}
          </button>
        );
      })}
      </div>
      <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-mono text-text-muted/60 border border-border/50 bg-surface-muted/30 select-none">
        ← →
      </kbd>
    </div>
  );
}
