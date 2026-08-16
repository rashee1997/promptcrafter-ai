'use client';

import React from 'react';
import { Cpu, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PLATFORM_OPTIONS, STYLE_PRESETS } from '@/lib/image-prompts';
import { ProviderConfig } from '@/types';
import { StudioFormState } from './studio-types';

interface ActionBarProps {
  state: StudioFormState;
  isGenerating: boolean;
  activeProvider: ProviderConfig;
  providerModels: string[];
  onSelectActiveModel?: (model: string) => void;
}

/** Sticky action bar: live summary chips, active-model picker, and submit button. */
export function ActionBar({
  state,
  isGenerating,
  activeProvider,
  providerModels,
  onSelectActiveModel,
}: ActionBarProps) {
  const platformLabels = PLATFORM_OPTIONS.filter((p) => state.platforms.includes(p.id));

  return (
    <div className="sticky bottom-3 z-20 pt-1">
      <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-surface-card/90 backdrop-blur-md p-3 shadow-xl shadow-black/15">
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-text-secondary">
          <span className="px-2 py-1 rounded-md bg-surface-muted border border-border">
            {STYLE_PRESETS.find((s) => s.id === state.style)?.label ?? state.style}
          </span>
          <span className="px-2 py-1 rounded-md bg-surface-muted border border-border">{state.aspectRatio}</span>
          <span className="px-2 py-1 rounded-md bg-surface-muted border border-border">
            {platformLabels.map((p) => p.label).join(' · ')}
          </span>
          {activeProvider && onSelectActiveModel && providerModels.length > 0 && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-surface-muted border border-border">
              <Cpu className="w-3 h-3 text-brand shrink-0" />
              <select
                value={activeProvider.model}
                onChange={(e) => onSelectActiveModel(e.target.value)}
                disabled={isGenerating}
                className="bg-transparent text-xs font-mono text-text-secondary focus:outline-none disabled:opacity-50 cursor-pointer"
                title={`Model · ${activeProvider.name}`}
                aria-label="Active model"
              >
                {providerModels.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={isGenerating || !state.subject.trim()}
          className={cn(
            'w-full py-3 px-6 rounded-xl font-bold text-sm bg-gradient-to-br from-brand to-accent',
            'hover:brightness-110 text-white shadow-glow flex items-center justify-center gap-2.5',
            'disabled:opacity-50 transition-all duration-300 transform active:scale-[0.985]'
          )}
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generating…</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate prompt</span>
              <kbd className="ml-1 rounded-md border border-white/25 bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold opacity-80">
                ⌘⏎
              </kbd>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
