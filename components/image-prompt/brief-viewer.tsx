'use client';

import React from 'react';
import { motion } from 'motion/react';
import { BookOpenCheck, Copy, RefreshCw, Save } from 'lucide-react';
import { Tooltip } from '../tooltip';
import { cn } from '@/lib/utils';
import { buildOutputTabs, ImagePromptSections } from '@/lib/image-prompts';

interface BriefViewerProps {
  sections: ImagePromptSections;
  activeTab: keyof ImagePromptSections | 'raw';
  onTabChange: (tab: keyof ImagePromptSections | 'raw') => void;
  onCopy: (text: string, label: string) => void;
  onSave: () => void;
  onNew: () => void;
}

/** Parsed brief viewer: section tabs, active pane with copy, and action buttons. */
export function BriefViewer({ sections, activeTab, onTabChange, onCopy, onSave, onNew }: BriefViewerProps) {
  const tabs = buildOutputTabs(sections);
  const activeContent =
    activeTab !== 'raw' ? (sections[activeTab as keyof ImagePromptSections] ?? '') : '';
  const activeLabel = tabs.find((t) => t.key === activeTab)?.label ?? 'Prompt';

  return (
    <div className="space-y-3">
      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="Brief sections"
        className="flex items-center gap-1 p-1 rounded-xl bg-surface-sunken border border-border overflow-x-auto scrollbar-thin"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
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
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active pane */}
      <div className="rounded-xl border border-border bg-surface-code overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border/60 bg-surface-muted/50">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <BookOpenCheck className="w-3 h-3 text-brand" />
            {activeLabel}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-text-muted tabular-nums">
              {activeContent.length.toLocaleString()} chars
            </span>
            <Tooltip label="Copy this section">
              <button
                type="button"
                onClick={() => onCopy(activeContent, activeLabel)}
                className="p-1.5 rounded-lg bg-surface-card border border-border text-text-secondary hover:text-brand hover:border-brand/40 transition-colors"
                aria-label="Copy this section"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          </div>
        </div>
        <div className="p-4 max-h-[420px] overflow-y-auto scrollbar-thin">
          <p className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-text-primary">
            {activeContent}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => sections.master && onCopy(sections.master, 'Master prompt')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-br from-brand to-accent hover:brightness-110 text-white shadow-glow transition-all active:scale-[0.985]"
        >
          <Copy className="w-3.5 h-3.5" />
          Copy master prompt
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
    </div>
  );
}
