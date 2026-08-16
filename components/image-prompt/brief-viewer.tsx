'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Check, Copy, LayoutGrid, PanelTop, RefreshCw, Save, Wand2 } from 'lucide-react';
import { Tooltip } from '../tooltip';
import { cn } from '@/lib/utils';
import { buildOutputTabs, ImagePromptSections, PLATFORM_OPTIONS } from '@/lib/image-prompts';
import { useInlineCopy } from '@/lib/use-inline-copy';
import { StudioMode } from './studio-types';

interface BriefViewerProps {
  sections: ImagePromptSections;
  activeTab: keyof ImagePromptSections | 'raw';
  onTabChange: (tab: keyof ImagePromptSections | 'raw') => void;
  onSave: () => void;
  onNew: () => void;
  /** Studio mode — remix suggestions are tuned to the brief anatomy. */
  mode: StudioMode;
  /** Remix suggestions (Related-Prompts pattern) re-run generation with a tweak applied. */
  onRefineSuggestion?: (suggestion: string) => void;
  isGenerating: boolean;
}

type BriefView = 'tab' | 'all';

const VIEW_KEY = 'pc:img-brief-view';

function readView(): BriefView {
  if (typeof window === 'undefined') return 'tab';
  try {
    return window.localStorage.getItem(VIEW_KEY) === 'all' ? 'all' : 'tab';
  } catch {
    return 'tab';
  }
}

/** Accent dot color per platform section; brand for master/negative/research. */
function platformColor(key: string): string | undefined {
  return PLATFORM_OPTIONS.find((p) => p.id === key)?.color;
}

const IMAGE_REFINE_SUGGESTIONS = [
  { id: 'light', label: 'More cinematic lighting' },
  { id: 'color', label: 'Warmer color grade' },
  { id: 'text', label: 'Add bold in-image text' },
];

const LOGO_REFINE_SUGGESTIONS = [
  { id: 'flat', label: 'Simplify to a flat vector lockup' },
  { id: 'mono', label: 'Try a single-color version' },
  { id: 'emblem', label: 'Wrap it in an emblem / badge frame' },
  { id: 'bold', label: 'Use a bolder, heavier wordmark' },
];

/**
 * Card-based brief viewer: every platform prompt is its own card with its own
 * copy button, organized by tabs (single card at a time) with an "all cards"
 * view for comparing every dialect at once. Research-backed UX: feedback near
 * the action (inline "Copied ✓"), recognition over recall (tabs + labels),
 * and Related-Prompts-style remix suggestions after generation.
 */
export function BriefViewer({
  sections,
  activeTab,
  onTabChange,
  onSave,
  onNew,
  mode,
  onRefineSuggestion,
  isGenerating,
}: BriefViewerProps) {
  const tabs = buildOutputTabs(sections);
  const refineSuggestions = mode === 'logo' ? LOGO_REFINE_SUGGESTIONS : IMAGE_REFINE_SUGGESTIONS;
  const [view, setView] = useState<BriefView>('tab');
  const { copiedKey, copy } = useInlineCopy();

  useEffect(() => {
    setView(readView());
  }, []);

  const persistView = (v: BriefView) => {
    setView(v);
    try {
      window.localStorage.setItem(VIEW_KEY, v);
    } catch {
      // storage unavailable — view simply won't persist
    }
  };

  // Safety: never render a raw/unknown tab — fall back to the first section.
  const activeTabKey = tabs.some((t) => t.key === activeTab) ? activeTab : (tabs[0]?.key ?? 'master');
  const activeLabel = tabs.find((t) => t.key === activeTabKey)?.label ?? 'Prompt';

  const fullDocument = useMemo(
    () =>
      tabs
        .map((t) => `## ${t.label}\n\n${sections[t.key] ?? ''}`)
        .join('\n\n'),
    [tabs, sections]
  );

  const renderCard = (key: keyof ImagePromptSections, label: string) => {
    const content = sections[key] ?? '';
    const copied = copiedKey === key;
    const color = platformColor(String(key));
    return (
      <div key={key} className="rounded-xl border border-border bg-surface-code overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border/60 bg-surface-muted/50">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted min-w-0">
            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', color ?? 'bg-brand')} />
            <span className="truncate">{label}</span>
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-mono text-text-muted tabular-nums">
              {content.length.toLocaleString()} chars
            </span>
            <button
              type="button"
              onClick={() => copy(content, key)}
              aria-label={`Copy ${label} prompt`}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all active:scale-[0.97]',
                copied
                  ? 'bg-success/10 border-success/40 text-success'
                  : 'bg-surface-card border-border text-text-secondary hover:text-brand hover:border-brand/40'
              )}
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
        <div className="p-4 max-h-[380px] overflow-y-auto scrollbar-thin">
          <p className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-text-primary">{content}</p>
        </div>
      </div>
    );
  };

  const copyAllCopied = copiedKey === '__all__';

  return (
    <div className="space-y-3">
      {/* Tab bar + view toggle */}
      <div className="flex items-center gap-2">
        <div
          role="tablist"
          aria-label="Brief sections"
          className="flex items-center gap-1 p-1 rounded-xl bg-surface-sunken border border-border overflow-x-auto scrollbar-thin flex-1 min-w-0"
        >
          {tabs.map((tab) => {
            const isActive = view === 'tab' && activeTabKey === tab.key;
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(tab.key)}
                className={cn(
                  'relative flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg whitespace-nowrap transition-colors duration-200 shrink-0',
                  isActive ? 'text-brand' : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="img-studio-tab-pill"
                    className="absolute inset-0 rounded-lg bg-surface-card border border-border shadow-sm shadow-brand/10"
                    transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
                  />
                )}
                <span
                  className={cn(
                    'relative z-10 w-1.5 h-1.5 rounded-full',
                    platformColor(String(tab.key)) ?? 'bg-brand/70'
                  )}
                />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
        <div
          role="group"
          aria-label="Output view"
          className="flex items-center gap-0.5 p-0.5 rounded-xl bg-surface-sunken border border-border shrink-0"
        >
          <Tooltip label="One card at a time">
            <button
              type="button"
              onClick={() => persistView('tab')}
              aria-pressed={view === 'tab'}
              className={cn(
                'p-1.5 rounded-lg transition-all',
                view === 'tab'
                  ? 'bg-surface-card text-brand border border-border shadow-sm'
                  : 'text-text-muted hover:text-text-primary border border-transparent'
              )}
              aria-label="Single card view"
            >
              <PanelTop className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
          <Tooltip label="All cards at once">
            <button
              type="button"
              onClick={() => persistView('all')}
              aria-pressed={view === 'all'}
              className={cn(
                'p-1.5 rounded-lg transition-all',
                view === 'all'
                  ? 'bg-surface-card text-brand border border-border shadow-sm'
                  : 'text-text-muted hover:text-text-primary border border-transparent'
              )}
              aria-label="All cards view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Cards */}
      {view === 'tab' ? (
        renderCard(activeTabKey, activeLabel)
      ) : (
        <div className="space-y-3">{tabs.map((t) => renderCard(t.key, t.label))}</div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => copy(fullDocument, '__all__')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-[0.985]',
            copyAllCopied
              ? 'bg-success/10 border border-success/40 text-success'
              : 'bg-gradient-to-br from-brand to-accent hover:brightness-110 text-white shadow-glow'
          )}
        >
          {copyAllCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copyAllCopied ? 'Copied all prompts' : 'Copy all prompts'}
        </button>
        <button
          type="button"
          onClick={onSave}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-surface-muted border border-border text-text-primary hover:border-brand/40 transition-colors"
        >
          <Save className="w-3.5 h-3.5 text-brand" />
          Save to gallery
        </button>
        <button
          type="button"
          onClick={onNew}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-surface-muted border border-border text-text-secondary hover:border-brand/40 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          New brief
        </button>
      </div>

      {/* Remix suggestions — Related-Prompts pattern */}
      {onRefineSuggestion && (
        <div className="flex items-center gap-2 flex-wrap rounded-xl border border-border bg-surface-muted/40 p-2.5">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
            <Wand2 className="w-3.5 h-3.5 text-brand" />
            Remix
          </span>
          {refineSuggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              disabled={isGenerating}
              onClick={() => onRefineSuggestion(s.label)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-surface-card border border-border text-text-secondary hover:text-brand hover:border-brand/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
