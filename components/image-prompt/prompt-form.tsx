'use client';

import React, { useMemo, useState } from 'react';
import { Bookmark, Building2, Check, ChevronDown, Cpu, FolderOpen, Image as ImageIcon, LayoutGrid, Lightbulb, Palette as PaletteIcon, PenTool, Plus, RefreshCw, Route, Save, Shapes, SlidersHorizontal, Sparkles, Trash2, X } from 'lucide-react';
import { GlassCard } from '../glass-card';
import { Expandable } from '../expandable';
import { cn } from '@/lib/utils';
import { useDynamicExamples } from '@/hooks/use-dynamic-examples';
import { ASPECT_RATIOS, EXAMPLE_TOPICS, PLATFORM_OPTIONS, PURPOSE_OPTIONS, STYLE_PRESETS } from '@/lib/image-prompts';
import { LOGO_CONCEPT_PRESETS, LOGO_EXAMPLE_TOPICS, LOGO_INDUSTRY_PRESETS, LOGO_MARK_TYPES, LOGO_PALETTE_PRESETS, LOGO_STYLE_PRESETS, checkLogoCliches } from '@/lib/logo-prompts';
import { ImagePlatform, ImagePromptReferenceImage, ProviderConfig, ImageStyleRecipe, LogoArchetypeRecipe } from '@/types';
import { ActionBar } from './action-bar';
import { ArtDirection } from './art-direction';
import { CHIP_DOTS, ChipRow } from './chip-row';
import { ReferenceImageUpload } from './reference-image-upload';
import { SettingsPopover } from './settings-popover';
import { StyleRecipePicker } from './style-recipe-picker';
import { StudioFormHandlers, StudioFormState, StudioMode } from './studio-types';
import { CustomChipEditor, useCustomChipEntry } from './use-custom-chip-entry';
import { PromptKit } from '@/lib/image-prompt-kits';
import { runBrandStrategist } from '@/lib/ai-client';
import { toast } from '../toast';

interface PromptFormProps {
  state: StudioFormState;
  handlers: StudioFormHandlers;
  isGenerating: boolean;
  activeProvider: ProviderConfig;
  providerModels: string[];
  onSelectActiveModel?: (model: string) => void;
  onSubmit: () => void;
  /** Brand / Subject Kit props */
  kits?: PromptKit[];
  onSaveKit?: () => void;
  /** Save the currently-applied form config as a reusable Style Recipe / Brand Archetype. */
  onSaveStyleRecipe?: () => void;
  onLoadKit?: (kit: PromptKit) => void;
  onDeleteKit?: (id: string) => void;
  showKitDropdown?: boolean;
  onToggleKitDropdown?: () => void;
  /** Image-to-Prompt reverse engineering */
  onReverseEngineerImage?: (img: ImagePromptReferenceImage) => void;
  isReverseEngineering?: boolean;
  reverseEngineeringId?: string | null;
  /** Recipe / Archetype selection & AI generation */
  onSelectImageRecipe?: (recipe: ImageStyleRecipe | null) => void;
  onSelectLogoArchetype?: (archetype: LogoArchetypeRecipe | null) => void;
  onOpenAiGenerator?: () => void;
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
  kits = [],
  onSaveKit,
  onSaveStyleRecipe,
  onLoadKit,
  onDeleteKit,
  showKitDropdown = false,
  onToggleKitDropdown,
  onReverseEngineerImage,
  isReverseEngineering,
  reverseEngineeringId,
  onSelectImageRecipe,
  onSelectLogoArchetype,
  onOpenAiGenerator,
}: PromptFormProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };

  const isLogo = state.mode === 'logo';
  const [styleTab, setStyleTab] = useState<'recipes' | 'styles'>('recipes');

  const exampleTopics = isLogo ? LOGO_EXAMPLE_TOPICS : EXAMPLE_TOPICS;
  // Pre-flight cliché check — client-side keyword scan before generation
  const clicheWarnings = useMemo(
    () => (isLogo ? checkLogoCliches(state.subject) : []),
    [isLogo, state.subject]
  );
  // Hybrid demo prompts: static chips render instantly, then quietly upgrade to
  // AI-refreshed suggestions matched to the current mode/settings.
  const { examples: dynamicExamples, isRefreshing: examplesRefreshing, refresh: refreshExamples } =
    useDynamicExamples(state.mode, state, exampleTopics);
  // The style grid is shared between modes — only the option pool and active value differ.
  const styleOptions = isLogo ? LOGO_STYLE_PRESETS : STYLE_PRESETS;
  const activeStyle = isLogo ? state.logoStyle : state.style;
  const selectStyle = (id: string) => (isLogo ? handlers.setLogoStyle(id) : handlers.setStyle(id));

  // Custom value entry + saved presets for the bespoke (non-ChipRow) rows.
  const [isStrategizing, setIsStrategizing] = useState(false);

  const handleAutoDirectBrand = async () => {
    if (!state.brandName.trim() && !state.subject.trim()) {
      toast.error('Brand info needed', 'Please enter a brand name or subject description first.');
      return;
    }
    setIsStrategizing(true);
    try {
      const res = await runBrandStrategist({
        provider: activeProvider,
        brandName: state.brandName.trim() || state.subject.trim(),
        description: state.subject.trim() || state.brandName.trim(),
      });
      if (res) {
        if (res.industry) handlers.setIndustry(res.industry);
        if (res.concept) handlers.setConcept(res.concept);
        if (res.logoType) handlers.setLogoType(res.logoType);
        if (res.logoStyle) handlers.setLogoStyle(res.logoStyle);
        if (res.palette) handlers.setPalette(res.palette);
        if (res.shapeLanguage) handlers.setShapeLanguage(res.shapeLanguage);
        if (res.typography) handlers.setTypography(res.typography);
        if (res.lockup) handlers.setLockup(res.lockup);
        if (res.hiddenMeaning) handlers.setHiddenMeaning(res.hiddenMeaning);
        if (res.boldness) handlers.setBoldness(res.boldness);
        if (res.usage?.length) handlers.setUsage(res.usage);
        toast.success('Brand Architecture Configured', 'AI Strategist configured optimal geometry and palette.');
      }
    } catch (err: any) {
      toast.error('Brand Strategist failed', err.message || 'Could not analyze brand.');
    } finally {
      setIsStrategizing(false);
    }
  };

  // Custom value entry + saved presets for the bespoke (non-ChipRow) rows.
  // The style grid is shared across modes; palette is logo-only; platforms are
  // shared. ChipRow/MultiChipRow rows get the same behavior internally.
  const styleCustom = useCustomChipEntry({ field: 'style', mode: 'both' });
  const paletteCustom = useCustomChipEntry({ field: 'palette', mode: 'logo' });
  const platformsCustom = useCustomChipEntry({ field: 'platforms', mode: 'both' });

  // Tier-1 collapse: Style & Direction grid starts collapsed (Task 3.3).
  const [showStyle, setShowStyle] = useState(false);
  // Inline reference-image attach reveal (Task 3.2.2).
  const [showRefUploader, setShowRefUploader] = useState(false);

  // A value that matches no built-in preset renders as a selected custom chip.
  const styleIsCustom =
    !!activeStyle &&
    !styleOptions.some((s) => s.id === activeStyle) &&
    !styleCustom.saved.some((e) => e.value === activeStyle);
  const paletteIsCustom =
    !!state.palette &&
    !LOGO_PALETTE_PRESETS.some((p) => p.id === state.palette) &&
    !paletteCustom.saved.some((e) => e.value === state.palette);
  const customPlatforms = state.platforms.filter(
    (p) => !PLATFORM_OPTIONS.some((o) => o.id === p) && !platformsCustom.saved.some((e) => e.value === p)
  );

  const handleStyleConfirm = () => {
    const v = styleCustom.confirmDraft();
    if (v !== null) selectStyle(v);
  };
  const handleStyleSave = async () => {
    const v = await styleCustom.saveDraft();
    if (v !== null) selectStyle(v);
  };
  const handlePaletteConfirm = () => {
    const v = paletteCustom.confirmDraft();
    if (v !== null) handlers.setPalette(v);
  };
  const handlePaletteSave = async () => {
    const v = await paletteCustom.saveDraft();
    if (v !== null) handlers.setPalette(v);
  };
  const handlePlatformConfirm = () => {
    const v = platformsCustom.confirmDraft();
    if (v !== null) handlers.togglePlatform(v as ImagePlatform);
  };
  const handlePlatformSave = async () => {
    const v = await platformsCustom.saveDraft();
    if (v !== null) handlers.togglePlatform(v as ImagePlatform);
  };

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
        {/* Mode toggle */}
        <div
          role="group"
          aria-label="Studio mode"
          className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-surface-sunken border border-border"
        >
          {(['image', 'logo'] as const).map(renderModeButton)}
        </div>

        {/* ── TIER 1 · CHAT-CARD — visible on first load ── */}

        {/* Subject hero input — autosizing textarea with inline image-attach icon */}
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
            {/* Inline image-attach icon triggers compact ReferenceImageUpload under the textarea */}
            <button
              type="button"
              onClick={() => setShowRefUploader(!showRefUploader)}
              aria-label="Attach reference images"
              aria-expanded={showRefUploader}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors"
              title="Attach reference images"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
          </div>
          {/* Condensed reference uploader revealed by the inline attach icon */}
          {showRefUploader && (
            <div className="pt-1">
              <ReferenceImageUpload
                images={state.referenceImages}
                onAdd={handlers.addReferenceImage}
                onRemove={handlers.removeReferenceImage}
                onUpdatePurpose={handlers.updateReferenceImagePurpose}
                onReverseEngineer={onReverseEngineerImage}
                isReverseEngineering={isReverseEngineering}
                reverseEngineeringId={reverseEngineeringId}
                compact={true}
              />
            </div>
          )}
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

          {/* Pre-flight cliché warning — logo mode only */}
          {isLogo && clicheWarnings.length > 0 && (
            <div className="mt-2 p-3 rounded-xl bg-warning/10 border border-warning/30 space-y-1.5">
              <p className="text-[10px] font-bold text-warning flex items-center gap-1.5">
                <span className="text-sm">⚠</span>
                Pre-flight cliché check
              </p>
              {clicheWarnings.map((w) => (
                <p key={w.label} className="text-[10px] text-warning/80 leading-relaxed">
                  <span className="font-semibold">{w.label}</span> — {w.reason}
                </p>
              ))}
              <p className="text-[9px] text-text-muted leading-relaxed">
                These are flagged, not blocked. A well-directed cliché can work — but a more ownable concept will make the mark feel designed.
              </p>
            </div>
          )}
        </div>

        {/* Bottom control bar — SettingsPopover trigger (relocated Tier 1 controls) + Mode pill (visible at chat-card level per Wave 3.2.2) */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <SettingsPopover state={state} handlers={handlers} isLogo={isLogo} />
          <div className="flex items-center justify-end">
            {renderModeButton(state.mode)}
          </div>
        </div>

        {/* Style & Direction — Tier 1, collapsed by default behind existing Expandable (Task 3.3). */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setShowStyle(!showStyle)}
            aria-expanded={showStyle}
            className="flex items-center gap-1.5 text-left group"
          >
            <LayoutGrid className="w-4 h-4 text-brand group-hover:text-text-primary transition-colors" />
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary group-hover:text-text-primary transition-colors">
              {isLogo ? 'Brand Archetypes & Styles' : 'Style & Direction'}
            </span>
          </button>
          <ChevronDown className={cn('w-4 h-4 transition-transform text-text-muted', showStyle && 'rotate-180')} />
        </div>
        <Expandable open={showStyle} id="img-style" className="pt-0.5">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex p-0.5 rounded-lg bg-surface-input border border-border text-xs font-semibold">
                <button
                type="button"
                onClick={() => setStyleTab('recipes')}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all text-[11px]',
                  styleTab === 'recipes'
                    ? 'bg-brand text-white shadow-xs font-bold'
                    : 'text-text-muted hover:text-text-primary'
                )}
              >
                <Sparkles className="w-3 h-3" />
                <span>{isLogo ? 'Brand Archetypes' : 'Scene Recipes'}</span>
              </button>
              <button
                type="button"
                onClick={() => setStyleTab('styles')}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all text-[11px]',
                  styleTab === 'styles'
                    ? 'bg-brand text-white shadow-xs font-bold'
                    : 'text-text-muted hover:text-text-primary'
                )}
              >
                <LayoutGrid className="w-3 h-3" />
                <span>{isLogo ? 'Custom Style Grid' : 'Individual Styles'}</span>
              </button>
            </div>
            {state.selectedRecipeId && styleTab === 'recipes' && (
              <span className="text-[10px] text-brand font-mono font-medium truncate max-w-[120px]">
                ● Preset Active
              </span>
            )}
          </div>

          {styleTab === 'recipes' ? (
            <StyleRecipePicker
              mode={state.mode}
              selectedRecipeId={state.selectedRecipeId || null}
              onSelectImageRecipe={onSelectImageRecipe || (() => {})}
              onSelectLogoArchetype={onSelectLogoArchetype || (() => {})}
              onOpenAiGenerator={onOpenAiGenerator || (() => {})}
            />
          ) : (
            <div className="space-y-1.5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[300px] overflow-y-auto pr-0.5 scrollbar-thin">
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
                          ? 'bg-brand/15 border-brand text-text-primary ring-1 ring-brand/40 shadow-xs'
                          : 'bg-surface-card/50 border-border text-text-secondary hover:border-brand/40 hover:bg-surface-hover'
                      )}
                    >
                      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', CHIP_DOTS[i % CHIP_DOTS.length])} />
                      <span className="truncate">{s.label}</span>
                      {selected && <Check className="w-3 h-3 text-brand ml-auto shrink-0" />}
                    </button>
                  );
                })}

                {/* Saved custom style presets — bookmarked chips, deletable on hover. */}
                {styleCustom.saved.map((entry) => {
                  const selected = activeStyle === entry.value;
                  return (
                    <div key={entry.id} className="relative group">
                      <button
                        type="button"
                        onClick={() => selectStyle(entry.value)}
                        title={`Saved: ${entry.label}`}
                        aria-pressed={selected}
                        className={cn(
                          'flex items-center gap-1.5 p-2 rounded-lg text-[11px] font-medium border transition-all text-left w-full',
                          selected
                            ? 'bg-brand/15 border-brand text-text-primary ring-1 ring-brand/40 shadow-xs'
                            : 'bg-surface-card/50 border-border text-text-secondary hover:border-brand/40 hover:bg-surface-hover'
                        )}
                      >
                        <Bookmark className="w-3 h-3 shrink-0 text-warning" />
                        <span className="truncate">{entry.label}</span>
                        {selected && <Check className="w-3 h-3 text-brand ml-auto shrink-0" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => styleCustom.remove(entry.id)}
                        title="Delete saved value"
                        aria-label={`Delete saved value ${entry.label}`}
                        className="absolute -top-1.5 -right-1.5 hidden group-hover:flex items-center justify-center w-4 h-4 rounded-full bg-surface-elevated border border-border text-text-muted hover:text-danger shadow-xs transition-colors"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  );
                })}

                {/* Trailing cell: selected custom value, the inline editor, or the trigger. */}
                {styleIsCustom ? (
                  <button
                    type="button"
                    onClick={() => selectStyle(activeStyle)}
                    title="Custom value"
                    aria-pressed
                    className="flex items-center gap-1.5 p-2 rounded-lg text-[11px] font-medium border bg-brand/15 border-brand text-text-primary ring-1 ring-brand/40 shadow-xs text-left"
                  >
                    <Plus className="w-3 h-3 text-brand shrink-0" />
                    <span className="truncate">{activeStyle}</span>
                    <Check className="w-3 h-3 text-brand ml-auto shrink-0" />
                  </button>
                ) : styleCustom.entering ? (
                  <div className="col-span-2 sm:col-span-3">
                    <CustomChipEditor
                      draft={styleCustom.draft}
                      onDraftChange={styleCustom.changeDraft}
                      onConfirm={handleStyleConfirm}
                      onSave={handleStyleSave}
                      onCancel={styleCustom.cancel}
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={styleCustom.begin}
                    aria-label="Add a custom style value"
                    className="flex items-center gap-1.5 p-2 rounded-lg text-[11px] font-medium border border-dashed border-border text-text-muted hover:text-brand hover:border-brand/40 transition-all text-left"
                  >
                    <Plus className="w-3 h-3 shrink-0" />
                    Custom
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </Expandable>

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
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                    <PenTool className="w-3.5 h-3.5 text-warning" />
                    Brand Identity Architecture
                  </span>

                  <button
                    type="button"
                    onClick={handleAutoDirectBrand}
                    disabled={isStrategizing}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-gradient-to-r from-brand/20 to-accent/20 hover:from-brand/30 hover:to-accent/30 text-brand border border-brand/35 shadow-xs transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-3 h-3 text-brand animate-pulse" />
                    <span>{isStrategizing ? 'Analyzing...' : 'AI Auto-Direct'}</span>
                  </button>
                </div>

                <ChipRow
                  label="Industry & audience"
                  icon={<Building2 className="w-3.5 h-3.5 text-brand" />}
                  options={LOGO_INDUSTRY_PRESETS}
                  value={state.industry}
                  onChange={(id) => handlers.setIndustry(state.industry === id ? undefined : id)}
                  field="industry"
                  mode="logo"
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
                  {/* Text accuracy suggestion — surface when wordmark text exists but text-accurate platforms are missing */}
                  {(() => {
                    const hasText = !!state.brandName.trim();
                    const textMarkTypes = ['wordmark', 'lettermark', 'emblem', 'combination'];
                    const markHasText = textMarkTypes.includes(state.logoType);
                    const needsTextAccurate = hasText || markHasText;
                    const hasTextAccurate =
                      state.platforms.includes('ideogram') ||
                      state.platforms.includes('gemini') ||
                      state.platforms.includes('gpt-image') ||
                      state.platforms.includes('dalle');
                    const hasOnlyWeakPlatforms =
                      state.platforms.length > 0 && !hasTextAccurate;
                    if (needsTextAccurate && hasOnlyWeakPlatforms) {
                      return (
                        <div className="mt-2 p-2.5 rounded-lg bg-warning/10 border border-warning/30 text-[10px] text-warning font-medium leading-relaxed">
                          ⚠️ GPT Image 2, Ideogram, and Gemini are most reliable for wordmark text — consider adding one for a text-accurate version.
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                <ChipRow
                  label="Mark type"
                  icon={<Shapes className="w-3.5 h-3.5 text-brand" />}
                  options={LOGO_MARK_TYPES}
                  value={state.logoType}
                  onChange={handlers.setLogoType}
                  field="logoType"
                  mode="logo"
                />

                <ChipRow
                  label="Concept & meaning"
                  icon={<Lightbulb className="w-3.5 h-3.5 text-warning" />}
                  options={LOGO_CONCEPT_PRESETS}
                  value={state.concept}
                  onChange={(id) => handlers.setConcept(state.concept === id ? undefined : id)}
                  field="concept"
                  mode="logo"
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

                    {/* Saved custom palette presets — bookmarked chips (no swatch, just the label), deletable on hover. */}
                    {paletteCustom.saved.map((entry) => {
                      const selected = state.palette === entry.value;
                      return (
                        <div key={entry.id} className="relative group">
                          <button
                            type="button"
                            onClick={() => handlers.setPalette(entry.value)}
                            title={`Saved: ${entry.label}`}
                            aria-pressed={selected}
                            className={cn(
                              'flex items-center gap-1.5 p-2 rounded-lg text-[11px] font-medium border transition-all text-left w-full',
                              selected
                                ? 'bg-brand/15 border-brand text-text-primary ring-1 ring-brand/40 shadow-sm'
                                : 'bg-surface-card/50 border-border text-text-secondary hover:border-brand/40 hover:bg-surface-hover'
                            )}
                          >
                            <Bookmark className="w-3 h-3 shrink-0 text-warning" />
                            <span className="truncate">{entry.label}</span>
                            {selected && <Check className="w-3 h-3 text-brand ml-auto shrink-0" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => paletteCustom.remove(entry.id)}
                            title="Delete saved value"
                            aria-label={`Delete saved value ${entry.label}`}
                            className="absolute -top-1.5 -right-1.5 hidden group-hover:flex items-center justify-center w-4 h-4 rounded-full bg-surface-elevated border border-border text-text-muted hover:text-danger shadow-sm transition-colors"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      );
                    })}

                    {/* Trailing cell: selected custom value, the inline editor, or the trigger. */}
                    {paletteIsCustom ? (
                      <button
                        type="button"
                        onClick={() => handlers.setPalette(state.palette)}
                        title="Custom value"
                        aria-pressed
                        className="flex items-center gap-1.5 p-2 rounded-lg text-[11px] font-medium border bg-brand/15 border-brand text-text-primary ring-1 ring-brand/40 shadow-sm text-left"
                      >
                        <Plus className="w-3 h-3 text-brand shrink-0" />
                        <span className="truncate">{state.palette}</span>
                        <Check className="w-3 h-3 text-brand ml-auto shrink-0" />
                      </button>
                    ) : paletteCustom.entering ? (
                      <div className="col-span-2 sm:col-span-3">
                        <CustomChipEditor
                          draft={paletteCustom.draft}
                          onDraftChange={paletteCustom.changeDraft}
                          onConfirm={handlePaletteConfirm}
                          onSave={handlePaletteSave}
                          onCancel={paletteCustom.cancel}
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={paletteCustom.begin}
                        aria-label="Add a custom palette value"
                        className="flex items-center gap-1.5 p-2 rounded-lg text-[11px] font-medium border border-dashed border-border text-text-muted hover:text-brand hover:border-brand/40 transition-all text-left"
                      >
                        <Plus className="w-3 h-3 shrink-0" />
                        Custom
                      </button>
                    )}
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
                        'group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all',
                        selected
                          ? 'bg-brand/15 border-brand text-text-primary ring-1 ring-brand/40 shadow-sm'
                          : 'bg-surface-card/50 border-border text-text-secondary hover:border-brand/40 hover:bg-surface-hover'
                      )}
                    >
                      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', p.color)} />
                      <span className="flex flex-col">
                        <span>{p.label}</span>
                        <span className="text-[9px] text-text-muted font-normal normal-case leading-tight hidden group-hover:inline">{p.bestFor}</span>
                      </span>
                      {selected && <Check className="w-3 h-3 text-brand shrink-0" />}
                    </button>
                  );
                })}

                {/* Saved custom platform presets — bookmarked chips, deletable on hover. */}
                {platformsCustom.saved.map((entry) => {
                  const selected = state.platforms.includes(entry.value as ImagePlatform);
                  return (
                    <div key={entry.id} className="relative group">
                      <button
                        type="button"
                        onClick={() => handlers.togglePlatform(entry.value as ImagePlatform)}
                        title={`Saved: ${entry.label}`}
                        aria-pressed={selected}
                        className={cn(
                          'flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all',
                          selected
                            ? 'bg-brand/15 border-brand text-text-primary ring-1 ring-brand/40 shadow-sm'
                            : 'bg-surface-card/50 border-border text-text-secondary hover:border-brand/40 hover:bg-surface-hover'
                        )}
                      >
                        <Bookmark className="w-3 h-3 shrink-0 text-warning" />
                        <span className="max-w-[160px] truncate">{entry.label}</span>
                        {selected && <Check className="w-3 h-3 text-brand shrink-0" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => platformsCustom.remove(entry.id)}
                        title="Delete saved value"
                        aria-label={`Delete saved value ${entry.label}`}
                        className="absolute -top-1.5 -right-1.5 hidden group-hover:flex items-center justify-center w-4 h-4 rounded-full bg-surface-elevated border border-border text-text-muted hover:text-danger shadow-sm transition-colors"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  );
                })}

                {/* Confirmed custom platform values — selected chips that toggle off like any other. */}
                {customPlatforms.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => handlers.togglePlatform(v as ImagePlatform)}
                    title="Custom value"
                    aria-pressed
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border bg-brand/15 border-brand text-text-primary ring-1 ring-brand/40 shadow-sm"
                  >
                    <Plus className="w-3 h-3 text-brand shrink-0" />
                    <span className="max-w-[160px] truncate">{v}</span>
                    <Check className="w-3 h-3 text-brand shrink-0" />
                  </button>
                ))}

                {platformsCustom.entering ? (
                  <CustomChipEditor
                    draft={platformsCustom.draft}
                    onDraftChange={platformsCustom.changeDraft}
                    onConfirm={handlePlatformConfirm}
                    onSave={handlePlatformSave}
                    onCancel={platformsCustom.cancel}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={platformsCustom.begin}
                    aria-label="Add a custom platform value"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border border-dashed border-border text-text-muted hover:text-brand hover:border-brand/40 transition-all"
                  >
                    <Plus className="w-3 h-3 shrink-0" />
                    Custom
                  </button>
                )}
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
