'use client';

import React from 'react';
import { Building2, Check, ChevronDown, Cpu, Image as ImageIcon, LayoutGrid, Lightbulb, Palette as PaletteIcon, PenTool, RefreshCw, Shapes, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { GlassCard } from '../glass-card';
import { Expandable } from '../expandable';
import { cn } from '@/lib/utils';
import { useDynamicExamples } from '@/hooks/use-dynamic-examples';
import { ASPECT_RATIOS, EXAMPLE_TOPICS, PLATFORM_OPTIONS, STYLE_PRESETS } from '@/lib/image-prompts';
import { LOGO_CONCEPT_PRESETS, LOGO_EXAMPLE_TOPICS, LOGO_INDUSTRY_PRESETS, LOGO_MARK_TYPES, LOGO_PALETTE_PRESETS, LOGO_STYLE_PRESETS } from '@/lib/logo-prompts';
import { ProviderConfig } from '@/types';
import { ActionBar } from './action-bar';
import { ArtDirection } from './art-direction';
import { CHIP_DOTS, ChipRow } from './chip-row';
import { StudioFormHandlers, StudioFormState, StudioMode } from './studio-types';

interface PromptFormProps {
  state: StudioFormState;
  handlers: StudioFormHandlers;
  isGenerating: boolean;
  activeProvider: ProviderConfig;
  providerModels: string[];
  onSelectActiveModel?: (model: string) => void;
  onSubmit: () => void;
}

/**
 * Left card — settings column, tiered into three levels of disclosure:
 *   TIER 1 Essentials   — mode toggle, subject + example chips, style grid, aspect ratio (always visible).
 *   TIER 2 Refine       — collapsed accordion: platform dialects + a logo-only "Brand" sub-card.
 *   TIER 3 Art direction — the existing accordion in art-direction.tsx.
 */
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

  const isLogo = state.mode === 'logo';
  const exampleTopics = isLogo ? LOGO_EXAMPLE_TOPICS : EXAMPLE_TOPICS;
  // Hybrid demo prompts: static chips render instantly, then quietly upgrade to
  // AI-refreshed suggestions matched to the current mode/settings.
  const { examples: dynamicExamples, isRefreshing: examplesRefreshing, refresh: refreshExamples } =
    useDynamicExamples(state.mode, state, exampleTopics);
  // The style grid is shared between modes — only the option pool and active value differ.
  const styleOptions = isLogo ? LOGO_STYLE_PRESETS : STYLE_PRESETS;
  const activeStyle = isLogo ? state.logoStyle : state.style;
  const selectStyle = (id: string) => (isLogo ? handlers.setLogoStyle(id) : handlers.setStyle(id));

  /** Tier-2 collapsed summary — same .filter(Boolean).join(' · ') pattern as art-direction.tsx. */
  const platformLabels = PLATFORM_OPTIONS.filter((p) => state.platforms.includes(p.id)).map((p) => p.label);
  const refineSummary = isLogo
    ? [
        LOGO_INDUSTRY_PRESETS.find((i) => i.id === state.industry)?.label,
        LOGO_MARK_TYPES.find((m) => m.id === state.logoType)?.label,
        LOGO_CONCEPT_PRESETS.find((c) => c.id === state.concept)?.label,
        LOGO_PALETTE_PRESETS.find((p) => p.id === state.palette)?.label,
        state.brandName.trim() || undefined,
      ]
        .filter(Boolean)
        .join(' · ') || 'Industry · mark · concept · palette'
    : platformLabels.join(' · ') || 'Platforms';

  const renderModeButton = (m: StudioMode) => {
    const selected = state.mode === m;
    const isLogoMode = m === 'logo';
    return (
      <button
        key={m}
        type="button"
        onClick={() => handlers.setMode(m)}
        aria-pressed={selected}
        className={cn(
          'flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold border transition-all',
          selected
            ? 'bg-surface-card border-brand/40 text-text-primary ring-1 ring-brand/40 shadow-sm'
            : 'border-transparent text-text-muted hover:text-text-primary'
        )}
      >
        {isLogoMode ? <PenTool className="w-4 h-4 text-warning" /> : <ImageIcon className="w-4 h-4 text-brand" />}
        {isLogoMode ? 'Logo' : 'Image'}
        <span className="text-[9px] font-medium text-text-muted hidden sm:inline">
          {isLogoMode ? 'brand marks' : 'photos & scenes'}
        </span>
      </button>
    );
  };

  return (
    <GlassCard variant="default" className="p-5 sm:p-6 space-y-5">
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} onKeyDown={handleKeyDown} className="space-y-5">
        {/* ── TIER 1 · ESSENTIALS — always visible ── */}

        {/* Mode toggle */}
        <div
          role="group"
          aria-label="Studio mode"
          className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-surface-sunken border border-border"
        >
          {(['image', 'logo'] as const).map(renderModeButton)}
        </div>

        {/* Subject hero input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="img-subject" className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-warning" />
              {isLogo ? 'What should the logo represent?' : 'What should the image show?'}
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
              placeholder={isLogo ? 'e.g. A specialty coffee roaster called Ember & Oak — artisan, warm, craft' : 'e.g. A lone lighthouse keeper on a storm-wracked cliff at night'}
              rows={3}
              className="w-full p-3.5 text-sm rounded-xl border border-border bg-surface-input text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/80 focus:border-brand transition-all shadow-inner resize-y leading-relaxed"
            />
            <span className="absolute right-3 bottom-3 text-[11px] text-text-muted pointer-events-none hidden sm:flex items-center gap-2">
              <span>⌘+Enter to generate</span>
              <span>•</span>
              <span>{state.subject.length} chars</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <div
              className={cn(
                'flex flex-wrap gap-1.5 transition-opacity duration-300',
                examplesRefreshing && 'opacity-60'
              )}
              aria-busy={examplesRefreshing}
            >
              {dynamicExamples.map((ex) => (
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
            <button
              type="button"
              onClick={refreshExamples}
              disabled={examplesRefreshing}
              title="Get new suggestions"
              aria-label="Get new example suggestions"
              className="flex items-center gap-1 px-1.5 py-1 rounded-md text-[10px] font-medium text-text-muted hover:text-brand border border-transparent hover:border-brand/40 transition-colors disabled:opacity-60"
            >
              <RefreshCw className={cn('w-3 h-3', examplesRefreshing && 'animate-spin')} />
              {examplesRefreshing ? 'Refreshing' : 'New ideas'}
            </button>
          </div>
        </div>

        {/* Style presets (image styles or logo styles) */}
        <div className="space-y-2">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
            <LayoutGrid className="w-3.5 h-3.5 text-brand" />
            {isLogo ? 'Logo style' : 'Visual style'}
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {styleOptions.map((s, i) => {
              const selected = activeStyle === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => selectStyle(s.id)}
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

        {/* ── TIER 2 · REFINE — single accordion, collapsed by default ── */}
        <div className="border-t border-border pt-4">
          <button
            type="button"
            onClick={() => handlers.setShowRefine(!state.showRefine)}
            aria-expanded={state.showRefine}
            aria-controls="img-refine"
            className="w-full flex items-center justify-between gap-2 text-left group"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary group-hover:text-brand transition-colors">
              <SlidersHorizontal className="w-4 h-4 text-brand" />
              <span>Refine</span>
              <span className="hidden md:flex items-center gap-1.5 text-[10px] font-medium text-text-muted">
                {refineSummary}
              </span>
            </div>
            <ChevronDown className={cn('w-4 h-4 transition-transform', state.showRefine && 'rotate-180')} />
          </button>

          <Expandable open={state.showRefine} id="img-refine" className="mt-4 space-y-4">
            {/* Logo-only: Brand sub-card — industry, wordmark, mark type, concept, palette
                grouped in one visually bounded block instead of five top-level sections. */}
            {isLogo && (
              <div className="p-4 rounded-xl bg-surface-muted/60 border border-border space-y-4">
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                  <PenTool className="w-3.5 h-3.5 text-warning" />
                  Brand
                </span>

                <ChipRow
                  label="Industry & audience"
                  icon={<Building2 className="w-3.5 h-3.5 text-brand" />}
                  options={LOGO_INDUSTRY_PRESETS}
                  value={state.industry}
                  onChange={(id) => handlers.setIndustry(state.industry === id ? undefined : id)}
                />

                <div className="space-y-1.5">
                  <label htmlFor="img-brand" className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                    <PenTool className="w-3.5 h-3.5 text-brand" />
                    Wordmark / brand name <span className="text-text-muted font-normal normal-case">(optional)</span>
                  </label>
                  <input
                    id="img-brand"
                    type="text"
                    value={state.brandName}
                    onChange={(e) => handlers.setBrandName(e.target.value)}
                    placeholder='e.g. "EMBER & OAK" — exact text to render in the mark'
                    className="w-full p-2.5 text-xs rounded-lg border border-border bg-surface-input text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                  <p className="text-[10px] text-text-muted leading-relaxed">
                    Rendered best by Ideogram and Gemini / Nano Banana. Keep it short — long names get garbled by most models.
                  </p>
                </div>

                <ChipRow
                  label="Mark type"
                  icon={<Shapes className="w-3.5 h-3.5 text-brand" />}
                  options={LOGO_MARK_TYPES}
                  value={state.logoType}
                  onChange={handlers.setLogoType}
                />

                <ChipRow
                  label="Concept & meaning"
                  icon={<Lightbulb className="w-3.5 h-3.5 text-warning" />}
                  options={LOGO_CONCEPT_PRESETS}
                  value={state.concept}
                  onChange={(id) => handlers.setConcept(state.concept === id ? undefined : id)}
                />

                <div className="space-y-2">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                    <PaletteIcon className="w-3.5 h-3.5 text-brand" />
                    Color palette
                    <span className="text-text-muted font-normal normal-case">— max three colors for a scalable mark</span>
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {LOGO_PALETTE_PRESETS.map((p) => {
                      const selected = state.palette === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handlers.setPalette(p.id)}
                          title={p.hint}
                          aria-pressed={selected}
                          className={cn(
                            'flex items-center gap-1.5 p-2 rounded-lg text-[11px] font-medium border transition-all text-left',
                            selected
                              ? 'bg-brand/15 border-brand text-text-primary ring-1 ring-brand/40 shadow-sm'
                              : 'bg-surface-card/50 border-border text-text-secondary hover:border-brand/40 hover:bg-surface-hover'
                          )}
                        >
                          <span
                            className="w-4 h-3 rounded-[4px] shrink-0 border border-black/10 shadow-inner"
                            style={{ background: `linear-gradient(90deg, ${p.colors.join(', ')})` }}
                            aria-hidden="true"
                          />
                          <span className="truncate">{p.label}</span>
                          {selected && <Check className="w-3 h-3 text-brand ml-auto shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

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
          </Expandable>
        </div>

        {/* ── TIER 3 · ART DIRECTION — existing accordion (now with negative-prompt Suggest) ── */}
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
