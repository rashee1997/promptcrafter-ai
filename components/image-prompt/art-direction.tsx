'use client';

import React, { useState } from 'react';
import { BookOpenCheck, Camera, ChevronDown, Eraser, Eye, Gauge, Globe, LayoutGrid, Monitor, Package, Palette, Search, SlidersHorizontal, Sparkles, Triangle, Type } from 'lucide-react';
import { Expandable } from '../expandable';
import { cn } from '@/lib/utils';
import { suggestNegativePrompt } from '@/lib/ai-client';
import { CAMERA_PRESETS, COLOR_GRADE_PRESETS, COMPOSITION_PRESETS, LIGHTING_PRESETS, MOOD_PRESETS, RESOLUTION_OPTIONS } from '@/lib/image-prompts';
import { LOGO_BOLDNESS_PRESETS, LOGO_HIDDEN_MEANING_PRESETS, LOGO_LOCKUP_PRESETS, LOGO_MARK_TYPES, LOGO_PALETTE_PRESETS, LOGO_SHAPE_PRESETS, LOGO_STYLE_PRESETS, LOGO_TYPOGRAPHY_PRESETS, LOGO_USAGE_PRESETS } from '@/lib/logo-prompts';
import { ImagePromptInput } from '@/types';
import { ChipRow, MultiChipRow } from './chip-row';
import { StudioFormHandlers, StudioFormState } from './studio-types';

interface ArtDirectionProps {
  state: StudioFormState;
  handlers: StudioFormHandlers;
}

/** Accordion with lighting / mood / composition chips, negative prompt, and notes.
 *  In logo mode the photography-only rows (lighting, composition, camera, color
 *  grade) are hidden — brand briefs care about vibe, resolution, and text instead. */
export function ArtDirection({ state, handlers }: ArtDirectionProps) {
  const { lighting, mood, composition, camera, colorGrade, resolution, negativePrompt, inImageText, additionalNotes, showArtDirection } = state;
  const isLogo = state.mode === 'logo';

  // B1 — one-click negative-prompt suggestions. Manual (button press) only:
  // auto-firing would be too disruptive to overwrite what the user typed.
  const [suggesting, setSuggesting] = useState(false);
  const [suggestCooldown, setSuggestCooldown] = useState(false);

  const handleSuggestNegative = async () => {
    if (suggesting) return;
    setSuggesting(true);
    const input: ImagePromptInput = {
      subject: state.subject,
      style: state.style,
      mode: state.mode,
      logoType: state.mode === 'logo' ? state.logoType : undefined,
      logoStyle: state.mode === 'logo' ? state.logoStyle : undefined,
      palette: state.mode === 'logo' ? state.palette : undefined,
      brandName: state.mode === 'logo' ? state.brandName.trim() || undefined : undefined,
      industry: state.mode === 'logo' ? state.industry : undefined,
      concept: state.mode === 'logo' ? state.concept : undefined,
      shapeLanguage: state.mode === 'logo' ? state.shapeLanguage : undefined,
      typography: state.mode === 'logo' ? state.typography : undefined,
      lockup: state.mode === 'logo' ? state.lockup : undefined,
      hiddenMeaning: state.mode === 'logo' ? state.hiddenMeaning : undefined,
      usage: state.mode === 'logo' && state.usage.length > 0 ? [...state.usage] : undefined,
      boldness: state.mode === 'logo' ? state.boldness : undefined,
      lighting,
      mood,
      composition,
      camera,
      colorGrade,
      resolution,
      aspectRatio: state.aspectRatio,
      platforms: state.platforms,
      negativePrompt: negativePrompt.trim() || undefined,
      inImageText: inImageText.trim() || undefined,
      additionalNotes: additionalNotes.trim() || undefined,
    };
    const response = await suggestNegativePrompt({ mode: state.mode, input });
    setSuggesting(false);
    if (response.suggestion) {
      // Append rather than overwrite — never discard what the user typed.
      const current = state.negativePrompt.trim();
      handlers.setNegativePrompt(current ? `${current}, ${response.suggestion}` : response.suggestion);
    } else {
      // Nice-to-have assist: brief cooldown, no error surfaced to the user.
      setSuggestCooldown(true);
      setTimeout(() => setSuggestCooldown(false), 3000);
    }
  };

  const summary = isLogo
    ? [
        LOGO_SHAPE_PRESETS.find((s) => s.id === state.shapeLanguage)?.label,
        LOGO_TYPOGRAPHY_PRESETS.find((t) => t.id === state.typography)?.label,
        LOGO_LOCKUP_PRESETS.find((l) => l.id === state.lockup)?.label,
        LOGO_HIDDEN_MEANING_PRESETS.find((h) => h.id === state.hiddenMeaning)?.label,
        state.usage.length > 0 && `${state.usage.length} use${state.usage.length > 1 ? 's' : ''}`,
        LOGO_BOLDNESS_PRESETS.find((b) => b.id === state.boldness)?.label,
        mood && MOOD_PRESETS.find((m) => m.id === mood)?.label,
        resolution && `@${resolution}`,
      ]
        .filter(Boolean)
        .join(' · ') || 'Shape · type · lockup · hidden meaning · uses · vibe · text · negatives'
    : [
        lighting && LIGHTING_PRESETS.find((l) => l.id === lighting)?.label,
        mood && MOOD_PRESETS.find((m) => m.id === mood)?.label,
        composition && COMPOSITION_PRESETS.find((c) => c.id === composition)?.label,
        camera && CAMERA_PRESETS.find((c) => c.id === camera)?.label,
        colorGrade && COLOR_GRADE_PRESETS.find((c) => c.id === colorGrade)?.label,
        resolution && `@${resolution}`,
      ]
        .filter(Boolean)
        .join(' · ') || 'Lighting · mood · camera · color · text · negatives';

  return (
    <div className="border-t border-border pt-4">
      <button
        type="button"
        onClick={() => handlers.setShowArtDirection(!showArtDirection)}
        aria-expanded={showArtDirection}
        aria-controls="img-art-direction"
        className="w-full flex items-center justify-between gap-2 text-left group"
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary group-hover:text-brand transition-colors">
          <SlidersHorizontal className="w-4 h-4 text-brand" />
          <span>Art direction</span>
          <span className="hidden md:flex items-center gap-1.5 text-[10px] font-medium text-text-muted">
            {summary}
          </span>
        </div>
        <ChevronDown className={cn('w-4 h-4 transition-transform', showArtDirection && 'rotate-180')} />
      </button>

      <Expandable open={showArtDirection} id="img-art-direction" className="mt-4 space-y-4">
        {!isLogo && (
          <ChipRow
            label="Lighting"
            icon={<Globe className="w-3.5 h-3.5 text-brand" />}
            options={LIGHTING_PRESETS}
            value={lighting}
            onChange={(id) => handlers.setLighting(lighting === id ? undefined : id)}
            field="lighting"
            mode="image"
          />
        )}
        {isLogo && (
          <ChipRow
            label="Shape language"
            icon={<Triangle className="w-3.5 h-3.5 text-brand" />}
            options={LOGO_SHAPE_PRESETS}
            value={state.shapeLanguage}
            onChange={(id) => handlers.setShapeLanguage(state.shapeLanguage === id ? undefined : id)}
            field="shapeLanguage"
            mode="logo"
          />
        )}
        {isLogo && (
          <ChipRow
            label="Typography direction"
            icon={<Type className="w-3.5 h-3.5 text-brand" />}
            options={LOGO_TYPOGRAPHY_PRESETS}
            value={state.typography}
            onChange={(id) => handlers.setTypography(state.typography === id ? undefined : id)}
            field="typography"
            mode="logo"
          />
        )}
        {isLogo && (
          <ChipRow
            label="Lockup layout"
            icon={<LayoutGrid className="w-3.5 h-3.5 text-brand" />}
            options={LOGO_LOCKUP_PRESETS}
            value={state.lockup}
            onChange={(id) => handlers.setLockup(state.lockup === id ? undefined : id)}
            field="lockup"
            mode="logo"
          />
        )}
        {isLogo && (
          <ChipRow
            label="Hidden meaning"
            icon={<Eye className="w-3.5 h-3.5 text-brand" />}
            options={LOGO_HIDDEN_MEANING_PRESETS}
            value={state.hiddenMeaning}
            onChange={(id) => handlers.setHiddenMeaning(state.hiddenMeaning === id ? undefined : id)}
            field="hiddenMeaning"
            mode="logo"
          />
        )}
        {isLogo && (
          <MultiChipRow
            label="Where the logo must work"
            icon={<Package className="w-3.5 h-3.5 text-brand" />}
            options={LOGO_USAGE_PRESETS}
            values={state.usage}
            onChange={handlers.setUsage}
            helper="Drives small-size and one-color constraints — an app icon needs favicon-level simplicity, packaging needs ink-safe contrast."
            field="usage"
            mode="logo"
          />
        )}
        {isLogo && (
          <ChipRow
            label="Concept boldness"
            icon={<Gauge className="w-3.5 h-3.5 text-brand" />}
            options={LOGO_BOLDNESS_PRESETS}
            value={state.boldness}
            onChange={(id) => handlers.setBoldness(state.boldness === id ? undefined : id)}
            field="boldness"
            mode="logo"
          />
        )}
        <ChipRow
          label={isLogo ? 'Vibe' : 'Mood'}
          icon={<BookOpenCheck className="w-3.5 h-3.5 text-brand" />}
          options={MOOD_PRESETS}
          value={mood}
          onChange={(id) => handlers.setMood(mood === id ? undefined : id)}
          field="mood"
          mode="both"
        />
        {!isLogo && (
          <ChipRow
            label="Composition & framing"
            icon={<Search className="w-3.5 h-3.5 text-brand" />}
            options={COMPOSITION_PRESETS}
            value={composition}
            onChange={(id) => handlers.setComposition(composition === id ? undefined : id)}
            field="composition"
            mode="image"
          />
        )}
        {!isLogo && (
          <ChipRow
            label="Camera & lens"
            icon={<Camera className="w-3.5 h-3.5 text-brand" />}
            options={CAMERA_PRESETS}
            value={camera}
            onChange={(id) => handlers.setCamera(camera === id ? undefined : id)}
            field="camera"
            mode="image"
          />
        )}
        {!isLogo && (
          <ChipRow
            label="Color grade & film stock"
            icon={<Palette className="w-3.5 h-3.5 text-brand" />}
            options={COLOR_GRADE_PRESETS}
            value={colorGrade}
            onChange={(id) => handlers.setColorGrade(colorGrade === id ? undefined : id)}
            field="colorGrade"
            mode="image"
          />
        )}
        <ChipRow
          label="Output resolution"
          icon={<Monitor className="w-3.5 h-3.5 text-brand" />}
          options={RESOLUTION_OPTIONS}
          value={resolution}
          onChange={(id) => handlers.setResolution(resolution === id ? undefined : id)}
          field="resolution"
          mode="both"
        />

        {/* In-image text */}
        <div className="space-y-1.5">
          <label htmlFor="img-text" className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
            <Type className="w-3.5 h-3.5 text-brand" />
            {isLogo ? 'Extra text inside the mark' : 'Text inside the image'} <span className="text-text-muted font-normal normal-case">(optional)</span>
          </label>
          <input
            id="img-text"
            type="text"
            value={inImageText}
            onChange={(e) => handlers.setInImageText(e.target.value)}
            placeholder={isLogo ? 'e.g. "EST 2019" curved along the badge edge' : 'e.g. "FRESH ROAST" in bold white sans-serif across the top'}
            className="w-full p-2.5 text-xs rounded-lg border border-border bg-surface-input text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <p className="text-[10px] text-text-muted leading-relaxed">
            {isLogo
              ? 'Taglines, EST dates, and city names. Best rendered by Gemini / Nano Banana and Ideogram — wrap exact wording in quotes and describe the typography.'
              : 'Best rendered by Gemini / Nano Banana and Ideogram. Wrap exact wording in quotes and describe the typography.'}
          </p>
        </div>

        {/* Negative prompt */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="img-negative" className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
              <Eraser className="w-3.5 h-3.5 text-danger" />
              Things to avoid <span className="text-text-muted font-normal normal-case">(optional)</span>
            </label>
            <button
              type="button"
              onClick={handleSuggestNegative}
              disabled={suggesting || suggestCooldown}
              title="Suggest exclusions for this brief"
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium border border-border bg-surface-muted text-text-secondary hover:text-brand hover:border-brand/40 transition-colors disabled:opacity-50"
            >
              {suggesting ? (
                <span className="w-3 h-3 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3 text-warning" />
              )}
              {suggestCooldown ? 'Unavailable' : suggesting ? 'Suggesting…' : 'Suggest'}
            </button>
          </div>
          <input
            id="img-negative"
            type="text"
            value={negativePrompt}
            onChange={(e) => handlers.setNegativePrompt(e.target.value)}
            placeholder={isLogo ? 'e.g. clip art, gradients, shadows, photorealistic background, watermark' : 'e.g. distorted hands, extra fingers, watermark, oversaturated'}
            className="w-full p-2.5 text-xs rounded-lg border border-border bg-surface-input text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        {/* Additional notes */}
        <div className="space-y-1.5">
          <label htmlFor="img-notes" className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
            <SlidersHorizontal className="w-3.5 h-3.5 text-brand" />
            Additional notes <span className="text-text-muted font-normal normal-case">(optional)</span>
          </label>
          <textarea
            id="img-notes"
            value={additionalNotes}
            onChange={(e) => handlers.setAdditionalNotes(e.target.value)}
            placeholder={isLogo ? 'Industry, audience, a symbol from the brand story, a color to avoid…' : 'Compositional musts, brand references, exact text to render…'}
            rows={2}
            className="w-full p-2.5 text-xs rounded-lg border border-border bg-surface-input text-text-primary focus:outline-none focus:ring-2 focus:ring-brand resize-none"
          />
        </div>
      </Expandable>
    </div>
  );
}
