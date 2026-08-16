'use client';

import React from 'react';
import { Check, Cpu, Globe, LayoutGrid, Sparkles, X } from 'lucide-react';
import { GlassCard } from '../glass-card';
import { cn } from '@/lib/utils';
import { ASPECT_RATIOS, EXAMPLE_TOPICS, PLATFORM_OPTIONS, STYLE_PRESETS } from '@/lib/image-prompts';
import { ProviderConfig } from '@/types';
import { ActionBar } from './action-bar';
import { ArtDirection } from './art-direction';
import { CHIP_DOTS, ChipRow } from './chip-row';
import { StudioFormHandlers, StudioFormState } from './studio-types';

interface PromptFormProps {
  state: StudioFormState;
  handlers: StudioFormHandlers;
  isGenerating: boolean;
  activeProvider: ProviderConfig;
  providerModels: string[];
  onSelectActiveModel?: (model: string) => void;
  onSubmit: () => void;
}

/** Left card: subject, research toggle, style/ratio/platform presets, art direction, action bar. */
export function PromptForm({
  state,
  handlers,
  isGenerating,
  activeProvider,
  providerModels,
  onSelectActiveModel,
  onSubmit,
}: PromptFormProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <GlassCard variant="default" className="p-5 sm:p-6 space-y-5">
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} onKeyDown={handleKeyDown} className="space-y-5">
        {/* Subject hero input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="img-subject" className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-warning" />
              What should the image show?
            </label>
            {state.subject && (
              <button
                type="button"
                onClick={() => handlers.setSubject('')}
                className="text-xs text-text-muted hover:text-text-primary flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
          <div className="relative">
            <textarea
              id="img-subject"
              value={state.subject}
              onChange={(e) => handlers.setSubject(e.target.value)}
              placeholder="e.g. A lone lighthouse keeper on a storm-wracked cliff at night"
              rows={3}
              className="w-full p-3.5 text-sm rounded-xl border border-border bg-surface-input text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/80 focus:border-brand transition-all shadow-inner resize-y leading-relaxed"
            />
            <span className="absolute right-3 bottom-3 text-[11px] text-text-muted pointer-events-none hidden sm:flex items-center gap-2">
              <span>⌘+Enter to research</span>
              <span>•</span>
              <span>{state.subject.length} chars</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLE_TOPICS.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => handlers.setSubject(ex)}
                className="px-2 py-1 rounded-lg text-[10px] font-medium bg-surface-muted border border-border text-text-muted hover:text-brand hover:border-brand/40 transition-colors"
              >
                {ex.length > 46 ? `${ex.slice(0, 46)}…` : ex}
              </button>
            ))}
          </div>
        </div>

        {/* Deep research toggle */}
        <button
          type="button"
          onClick={() => handlers.setDeepResearch(!state.deepResearch)}
          aria-pressed={state.deepResearch}
          className={cn(
            'w-full flex items-start gap-3 p-3 rounded-xl border transition-all text-left',
            state.deepResearch
              ? 'bg-success/10 border-success/30'
              : 'bg-surface-card/50 border-border hover:border-brand/40'
          )}
        >
          <span
            className={cn(
              'mt-0.5 flex items-center justify-center w-8 h-8 rounded-lg shrink-0 border',
              state.deepResearch ? 'bg-success/15 border-success/40' : 'bg-surface-muted border-border'
            )}
          >
            <Globe className={cn('w-4 h-4', state.deepResearch ? 'text-success' : 'text-text-muted')} />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-xs font-bold text-text-primary flex items-center gap-2">
              Deep web research
              <span className={cn('relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors', state.deepResearch ? 'bg-success' : 'bg-surface-hover border border-border')}>
                <span
                  className={cn(
                    'inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform',
                    state.deepResearch ? 'translate-x-3.5' : 'translate-x-0.5'
                  )}
                />
              </span>
            </span>
            <span className="block mt-0.5 text-[11px] text-text-secondary leading-relaxed">
              Grounds the brief in live Google Search results about the subject&apos;s visual canon,
              reference styles, and common generation pitfalls. Off = instant knowledge-based research.
            </span>
          </span>
        </button>

        {/* Style presets */}
        <div className="space-y-2">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
            <LayoutGrid className="w-3.5 h-3.5 text-brand" />
            Visual style
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {STYLE_PRESETS.map((s, i) => {
              const selected = state.style === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handlers.setStyle(s.id)}
                  title={s.hint}
                  aria-pressed={selected}
                  className={cn(
                    'flex items-center gap-1.5 p-2 rounded-lg text-[11px] font-medium border transition-all text-left',
                    selected
                      ? 'bg-brand/15 border-brand text-text-primary ring-1 ring-brand/40 shadow-sm'
                      : 'bg-surface-card/50 border-border text-text-secondary hover:border-brand/40 hover:bg-surface-hover'
                  )}
                >
                  <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', CHIP_DOTS[i % CHIP_DOTS.length])} />
                  <span className="truncate">{s.label}</span>
                  {selected && <Check className="w-3 h-3 text-brand ml-auto shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Aspect ratio */}
        <ChipRow
          label="Aspect ratio"
          icon={<LayoutGrid className="w-3.5 h-3.5 text-brand" />}
          options={ASPECT_RATIOS}
          value={state.aspectRatio}
          onChange={handlers.setAspectRatio}
        />

        {/* Platform dialects */}
        <div className="space-y-2">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
            <Cpu className="w-3.5 h-3.5 text-brand" />
            Tune prompts for
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PLATFORM_OPTIONS.map((p) => {
              const selected = state.platforms.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlers.togglePlatform(p.id)}
                  title={p.hint}
                  aria-pressed={selected}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all',
                    selected
                      ? 'bg-brand/15 border-brand text-text-primary ring-1 ring-brand/40 shadow-sm'
                      : 'bg-surface-card/50 border-border text-text-secondary hover:border-brand/40 hover:bg-surface-hover'
                  )}
                >
                  <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', p.color)} />
                  {p.label}
                  {selected && <Check className="w-3 h-3 text-brand shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Art direction accordion */}
        <ArtDirection state={state} handlers={handlers} />

        {/* Sticky action bar */}
        <ActionBar
          state={state}
          isGenerating={isGenerating}
          activeProvider={activeProvider}
          providerModels={providerModels}
          onSelectActiveModel={onSelectActiveModel}
        />
      </form>
    </GlassCard>
  );
}
