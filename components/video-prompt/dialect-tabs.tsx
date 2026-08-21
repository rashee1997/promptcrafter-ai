'use client';

import React, { useRef } from 'react';
import { Check } from 'lucide-react';
import { VIDEO_DIALECTS, type VideoDialect } from '@/lib/video/model-dialects';
import type { VideoTargetPlatform } from '@/types/video';
import { cn } from '@/lib/utils';

/**
 * Chip order for the storyboard card — target dialects first, with Universal
 * (the stored source of truth) as the default tab / copy target.
 */
const CHIP_ORDER: VideoDialect['id'][] = ['veo', 'higgsfield', 'kling', 'seedance', 'universal'];

/** IDs that directly map to a video target platform. */
const PLATFORM_TO_DIALECT: Record<string, VideoDialect['id'] | undefined> = {
  veo: 'veo',
  kling: 'kling',
  seedance: 'seedance',
  higgsfield: 'higgsfield',
};

interface DialectTabsProps {
  value: VideoDialect['id'];
  onChange: (id: VideoDialect['id']) => void;
  disabled?: boolean;
  /** Unique per-card suffix so tab ids don't collide across storyboard cards. */
  groupId?: string;
  /**
   * The project's target platform. When set, that dialect is shown first in
   * the chip row and any non-target tab is marked as secondary / unverified.
   */
  targetPlatform?: VideoTargetPlatform | null;
}

/**
 * Phase 5 — the dialect selector chip group on each storyboard card. A
 * role="tablist" group with arrow-key navigation (mirrors the app's domain
 * selector pattern): Left/Right cycle, Home/End jump, Enter/Space activate.
 */
export function DialectTabs({ value, onChange, disabled, groupId = 'dialect', targetPlatform }: DialectTabsProps) {
  const tabPrefix = `dialect-tab-${groupId}`;
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  /** When a target platform is active, reorder chips so its dialect comes first. */
  const targetDialectId = targetPlatform ? PLATFORM_TO_DIALECT[targetPlatform] : undefined;
  const orderedIds = targetDialectId
    ? [targetDialectId, ...CHIP_ORDER.filter((id) => id !== targetDialectId)]
    : CHIP_ORDER;
  const chips = orderedIds.map((id) => VIDEO_DIALECTS.find((d) => d.id === id)).filter(
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
        className="flex overflow-x-auto scrollbar-thin snap-x snap-mandatory gap-1.5"
      >
      {chips.map((dialect, i) => {
        const selected = dialect.id === value;
        const isSecondary = !!targetDialectId && dialect.id !== targetDialectId && !selected;
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
            title={isSecondary ? `${dialect.hint} — secondary, not verified against this platform` : dialect.hint}
            disabled={disabled}
            onClick={() => onChange(dialect.id)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className={cn(
              'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors shrink-0 snap-start',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60',
              selected
                ? 'bg-brand/10 text-brand border-brand/40'
                : isSecondary
                  ? 'bg-surface-muted/60 text-text-muted border-border/60 hover:border-brand/40 hover:text-brand'
                  : 'bg-surface-muted text-text-secondary border-border hover:border-brand/40 hover:text-brand',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {selected && <Check className="w-3 h-3 shrink-0" aria-hidden="true" />}
            {dialect.label}
            {isSecondary && (
              <span className="text-[8px] font-medium text-text-muted/70 ml-0.5">secondary</span>
            )}
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
