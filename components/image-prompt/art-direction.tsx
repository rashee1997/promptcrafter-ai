'use client';

import React from 'react';
import { BookOpenCheck, Camera, ChevronDown, Eraser, Globe, Monitor, Palette, Search, SlidersHorizontal, Type } from 'lucide-react';
import { Expandable } from '../expandable';
import { cn } from '@/lib/utils';
import { CAMERA_PRESETS, COLOR_GRADE_PRESETS, COMPOSITION_PRESETS, LIGHTING_PRESETS, MOOD_PRESETS, RESOLUTION_OPTIONS } from '@/lib/image-prompts';
import { ChipRow } from './chip-row';
import { StudioFormHandlers, StudioFormState } from './studio-types';

interface ArtDirectionProps {
  state: StudioFormState;
  handlers: StudioFormHandlers;
}

/** Accordion with lighting / mood / composition chips, negative prompt, and notes. */
export function ArtDirection({ state, handlers }: ArtDirectionProps) {
  const { lighting, mood, composition, camera, colorGrade, resolution, negativePrompt, inImageText, additionalNotes, showArtDirection } = state;

  const summary = [
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
        <ChipRow
          label="Lighting"
          icon={<Globe className="w-3.5 h-3.5 text-brand" />}
          options={LIGHTING_PRESETS}
          value={lighting}
          onChange={(id) => handlers.setLighting(lighting === id ? undefined : id)}
        />
        <ChipRow
          label="Mood"
          icon={<BookOpenCheck className="w-3.5 h-3.5 text-brand" />}
          options={MOOD_PRESETS}
          value={mood}
          onChange={(id) => handlers.setMood(mood === id ? undefined : id)}
        />
        <ChipRow
          label="Composition & framing"
          icon={<Search className="w-3.5 h-3.5 text-brand" />}
          options={COMPOSITION_PRESETS}
          value={composition}
          onChange={(id) => handlers.setComposition(composition === id ? undefined : id)}
        />
        <ChipRow
          label="Camera & lens"
          icon={<Camera className="w-3.5 h-3.5 text-brand" />}
          options={CAMERA_PRESETS}
          value={camera}
          onChange={(id) => handlers.setCamera(camera === id ? undefined : id)}
        />
        <ChipRow
          label="Color grade & film stock"
          icon={<Palette className="w-3.5 h-3.5 text-brand" />}
          options={COLOR_GRADE_PRESETS}
          value={colorGrade}
          onChange={(id) => handlers.setColorGrade(colorGrade === id ? undefined : id)}
        />
        <ChipRow
          label="Output resolution"
          icon={<Monitor className="w-3.5 h-3.5 text-brand" />}
          options={RESOLUTION_OPTIONS}
          value={resolution}
          onChange={(id) => handlers.setResolution(resolution === id ? undefined : id)}
        />

        {/* In-image text */}
        <div className="space-y-1.5">
          <label htmlFor="img-text" className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
            <Type className="w-3.5 h-3.5 text-brand" />
            Text inside the image <span className="text-text-muted font-normal normal-case">(optional)</span>
          </label>
          <input
            id="img-text"
            type="text"
            value={inImageText}
            onChange={(e) => handlers.setInImageText(e.target.value)}
            placeholder='e.g. "FRESH ROAST" in bold white sans-serif across the top'
            className="w-full p-2.5 text-xs rounded-lg border border-border bg-surface-input text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <p className="text-[10px] text-text-muted leading-relaxed">
            Best rendered by Gemini / Nano Banana and Ideogram. Wrap exact wording in quotes and describe the typography.
          </p>
        </div>

        {/* Negative prompt */}
        <div className="space-y-1.5">
          <label htmlFor="img-negative" className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
            <Eraser className="w-3.5 h-3.5 text-danger" />
            Things to avoid <span className="text-text-muted font-normal normal-case">(optional)</span>
          </label>
          <input
            id="img-negative"
            type="text"
            value={negativePrompt}
            onChange={(e) => handlers.setNegativePrompt(e.target.value)}
            placeholder="e.g. distorted hands, extra fingers, watermark, oversaturated"
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
            placeholder="Compositional musts, brand references, exact text to render…"
            rows={2}
            className="w-full p-2.5 text-xs rounded-lg border border-border bg-surface-input text-text-primary focus:outline-none focus:ring-2 focus:ring-brand resize-none"
          />
        </div>
      </Expandable>
    </div>
  );
}
