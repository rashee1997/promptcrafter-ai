import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  SlidersHorizontal,
  ChevronDown,
  Camera,
  Sun,
  Layers,
  Sparkles,
  Gauge,
  User,
  Ratio,
  Info,
  Focus,
  Film,
  Zap,
  Timer,
} from 'lucide-react';
import type { CreativeControls, VideoAspectRatio, GenerationMode, VideoPlatformDialect } from '@/lib/product-shoot/types';
import {
  CAMERA_MOTION_PRESETS,
  FOCAL_LENGTH_PRESETS,
  MOTION_INTENSITY_PRESETS,
  TARGET_DURATION_PRESETS,
  LIGHTING_PRESETS,
  SURFACE_PRESETS,
  PHYSICS_FX_PRESETS,
  MOTION_PACE_PRESETS,
  HUMAN_INTERACTION_PRESETS,
  ASPECT_RATIOS,
  type OptionPreset,
} from '@/lib/product-shoot/presets';

/** All platform dialects the Product Studio can emit. */
const DIALECT_OPTIONS: { value: VideoPlatformDialect; label: string }[] = [
  { value: 'master', label: 'Master' },
  { value: 'runway', label: 'Runway' },
  { value: 'kling', label: 'Kling' },
  { value: 'veo', label: 'Veo' },
  { value: 'luma', label: 'Luma' },
  { value: 'minimax', label: 'Minimax' },
];

interface CreativeControlsProps {
  controls: CreativeControls;
  onChange: (controls: CreativeControls) => void;
  isOpen: boolean;
  onToggle: () => void;
}

function ChipSelector({
  label,
  icon: Icon,
  presets,
  selectedId,
  onSelect,
}: {
  label: string;
  icon: React.ElementType;
  presets: OptionPreset[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase text-text-secondary">
          <Icon className="w-3.5 h-3.5 text-brand" />
          {label}
        </label>
        {selectedId && (
          <span className="text-[10px] text-text-muted font-mono truncate max-w-[140px]">
            {presets.find((p) => p.id === selectedId)?.label}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {presets.map((preset) => {
          const isSelected = selectedId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(isSelected ? '' : preset.id)}
              title={preset.description}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 border ${
                isSelected
                  ? 'bg-brand text-white border-brand shadow-[0_2px_8px_var(--shadow-glow)]'
                  : 'bg-surface-input border-border text-text-secondary hover:text-text-primary hover:border-brand/40 hover:bg-surface-muted/50'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SubAccordion({
  title,
  icon: Icon,
  isOpen,
  onToggle,
  summary,
  activeCount,
  children,
}: {
  title: string;
  icon: React.ElementType;
  isOpen: boolean;
  onToggle: () => void;
  summary: string;
  activeCount: number;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-surface-muted/20 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 text-left transition-colors hover:bg-surface-muted/30"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-brand/10 border border-brand/25 flex items-center justify-center text-brand shrink-0">
            <Icon className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-primary truncate">
                {title}
              </span>
              {activeCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-brand/15 text-brand border border-brand/25 shrink-0">
                  {activeCount}
                </span>
              )}
            </div>
            <p className="text-[10px] text-text-muted truncate">{summary}</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-text-muted shrink-0"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
            className="border-t border-border/60 p-3 space-y-3.5"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CreativeControlsPanel({
  controls,
  onChange,
  isOpen,
  onToggle,
}: CreativeControlsProps) {
  const update = <K extends keyof CreativeControls>(key: K, value: CreativeControls[K]) => {
    onChange({ ...controls, [key]: value });
  };

  // Count active overrides
  const activeCount = [
    controls.cameraMotion,
    controls.focalLength,
    controls.motionIntensity && controls.motionIntensity !== 4 ? 'intensity' : null,
    controls.lightingStyle,
    controls.surfaceMaterial,
    controls.physicsFX && controls.physicsFX !== 'none' ? controls.physicsFX : null,
    controls.motionPace,
    controls.humanInteraction && controls.humanInteraction !== 'none-pure-product' ? controls.humanInteraction : null,
    controls.generationMode === 'campaign-3shot' ? '3shot' : null,
    controls.customVisualNotes?.trim() ? 'notes' : null,
    controls.negativeConstraints?.trim() ? 'neg' : null,
    controls.enabledDialects && controls.enabledDialects.length < 6 ? 'dialects' : null,
    controls.extensionBeatsEnabled === false ? 'no-ext' : null,
  ].filter(Boolean).length;

  // Per-group active counts (for sub-accordion badges)
  const opticsActive = [
    controls.focalLength,
    controls.motionIntensity && controls.motionIntensity !== 4 ? 'intensity' : null,
    controls.cameraMotion,
    controls.generationMode === 'campaign-3shot' ? '3shot' : null,
  ].filter(Boolean).length;

  const stagingActive = [
    controls.lightingStyle,
    controls.surfaceMaterial,
    controls.physicsFX && controls.physicsFX !== 'none' ? controls.physicsFX : null,
    controls.motionPace,
    controls.humanInteraction && controls.humanInteraction !== 'none-pure-product' ? controls.humanInteraction : null,
  ].filter(Boolean).length;

  const dialectActive = [
    controls.customVisualNotes?.trim() ? 'notes' : null,
    controls.negativeConstraints?.trim() ? 'neg' : null,
    controls.enabledDialects && controls.enabledDialects.length < 6 ? 'dialects' : null,
    controls.extensionBeatsEnabled === false ? 'no-ext' : null,
  ].filter(Boolean).length;

  // Sub-accordion open state — only the Optics group opens by default so the column
  // never has to render all 15 control sections at once.
  const [openGroup, setOpenGroup] = useState<'optics' | 'staging' | 'dialect' | null>('optics');
  const toggleGroup = (g: 'optics' | 'staging' | 'dialect') =>
    setOpenGroup((prev) => (prev === g ? null : g));

  return (
    <div className="rounded-xl border border-border bg-surface-card/80 backdrop-blur-xl transition-all">
      {/* Accordion header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-surface-muted/20"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand/10 border border-brand/25 flex items-center justify-center text-brand">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
                Directorial Controls & Cine Optics
              </span>
              {activeCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-brand text-white">
                  {activeCount} active
                </span>
              )}
            </div>
            <p className="text-[11px] text-text-muted">
              Lenses, camera choreography, motion intensity scale, lighting, sound & 3-shot campaign arc
            </p>
          </div>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-text-muted"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>

      {/* Accordion content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
            className="border-t border-border/60 p-4 space-y-3"
          >
            {/* Group 1 — Optics & Movement */}
            <SubAccordion
              title="Optics & Movement"
              icon={Focus}
              isOpen={openGroup === 'optics'}
              onToggle={() => toggleGroup('optics')}
              summary="Production mode, lens, motion scale, duration, camera choreography"
              activeCount={opticsActive}
            >
              {/* Commercial Production Mode: Single Shot vs 3-Shot Campaign Storyboard */}
              <div className="space-y-1.5 p-3 rounded-xl bg-surface-muted/30 border border-border">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase text-text-secondary">
                    <Film className="w-3.5 h-3.5 text-brand" />
                    Commercial Production Mode
                  </label>
                  <span className="text-[10px] text-brand font-mono uppercase">
                    {controls.generationMode === 'campaign-3shot' ? '3-Shot Multi-Arc' : 'Single Hero Shot'}
                  </span>
                </div>
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => update('generationMode', 'single')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      (controls.generationMode || 'single') === 'single'
                        ? 'border-brand bg-brand/10 ring-2 ring-brand/30'
                        : 'border-border bg-surface-input hover:border-brand/40'
                    }`}
                  >
                    <div className="text-xs font-semibold text-text-primary">Single Hero Shot</div>
                    <div className="text-[10px] text-text-muted mt-0.5">1-Shot multi-platform master prompt with audio & dialects</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => update('generationMode', 'campaign-3shot')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      controls.generationMode === 'campaign-3shot'
                        ? 'border-brand bg-brand/10 ring-2 ring-brand/30'
                        : 'border-border bg-surface-input hover:border-brand/40'
                    }`}
                  >
                    <div className="text-xs font-semibold text-text-primary">3-Shot Campaign Bundle</div>
                    <div className="text-[10px] text-text-muted mt-0.5">Sequential 10s ad storyboard (Hook 3s → Demo 4s → CTA 3s)</div>
                  </button>
                </div>
              </div>

              {/* Lens & Cine Focal Length */}
              <ChipSelector
                label="Lens & Focal Length (Optics)"
                icon={Focus}
                presets={FOCAL_LENGTH_PRESETS}
                selectedId={controls.focalLength}
                onSelect={(id) => update('focalLength', id)}
              />

              {/* Motion Intensity Scale (1-10) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase text-text-secondary">
                    <Zap className="w-3.5 h-3.5 text-brand" />
                    Motion Intensity & Velocity Scale
                  </label>
                  <span className="text-[10px] font-mono text-brand">
                    Level {controls.motionIntensity || 4} / 10
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-1.5">
                  {MOTION_INTENSITY_PRESETS.map((mip) => {
                    const isSelected = (controls.motionIntensity || 4) === mip.value;
                    return (
                      <button
                        key={mip.value}
                        type="button"
                        onClick={() => update('motionIntensity', mip.value)}
                        title={mip.description}
                        className={`p-2 rounded-lg border text-left transition-all flex flex-col justify-between min-h-[52px] ${
                          isSelected
                            ? 'border-brand bg-brand text-white shadow-[0_2px_8px_var(--shadow-glow)]'
                            : 'border-border bg-surface-input text-text-secondary hover:text-text-primary hover:border-brand/40'
                        }`}
                      >
                        <div className="text-xs font-semibold">{mip.label}</div>
                        <div className={`text-[9px] mt-0.5 truncate ${isSelected ? 'text-white/80' : 'text-text-muted'}`}>
                          {mip.category}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Duration & Temporal Chaining */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase text-text-secondary">
                    <Timer className="w-3.5 h-3.5 text-brand" />
                    Target Clip Duration & Chaining
                  </label>
                  <span className="text-[10px] font-mono text-text-muted">
                    Avoids model 10s hallucination
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-1.5">
                  {TARGET_DURATION_PRESETS.map((dp) => {
                    const isSelected = (controls.targetDuration || '5s-single') === dp.id;
                    return (
                      <button
                        key={dp.id}
                        type="button"
                        onClick={() => update('targetDuration', dp.id)}
                        title={dp.description}
                        className={`p-2 rounded-lg border text-left transition-all flex flex-col justify-between min-h-[52px] ${
                          isSelected
                            ? 'border-brand bg-brand text-white shadow-[0_2px_8px_var(--shadow-glow)]'
                            : 'border-border bg-surface-input text-text-secondary hover:text-text-primary hover:border-brand/40'
                        }`}
                      >
                        <div className="text-xs font-semibold">{dp.label}</div>
                        <div className={`text-[9px] mt-0.5 truncate ${isSelected ? 'text-white/80' : 'text-text-muted'}`}>
                          {dp.badge}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Camera Choreography */}
              <ChipSelector
                label="Camera Choreography & Movement"
                icon={Camera}
                presets={CAMERA_MOTION_PRESETS}
                selectedId={controls.cameraMotion}
                onSelect={(id) => update('cameraMotion', id)}
              />
            </SubAccordion>

            {/* Group 2 — Staging & Environment */}
            <SubAccordion
              title="Staging & Environment"
              icon={Sun}
              isOpen={openGroup === 'staging'}
              onToggle={() => toggleGroup('staging')}
              summary="Aspect ratio, lighting, surface, physics FX, motion pace, UGC"
              activeCount={stagingActive}
            >
              {/* Aspect Ratio Selector */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase text-text-secondary">
                  <Ratio className="w-3.5 h-3.5 text-brand" />
                  Target Video Framing / Aspect Ratio
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-2">
                  {ASPECT_RATIOS.map((ar) => {
                    const isSelected = controls.aspectRatio === ar.id;
                    return (
                      <button
                        key={ar.id}
                        type="button"
                        onClick={() => update('aspectRatio', ar.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between min-h-[56px] ${
                          isSelected
                            ? 'border-brand bg-brand/10 ring-2 ring-brand/30'
                            : 'border-border bg-surface-input hover:border-brand/40 hover:bg-surface-muted/40'
                        }`}
                      >
                        <div className="text-xs font-semibold text-text-primary">
                          {ar.label}
                        </div>
                        <div className="text-[10px] text-text-muted mt-0.5 truncate">
                          {ar.sublabel}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lighting Style */}
              <ChipSelector
                label="Lighting & Atmosphere"
                icon={Sun}
                presets={LIGHTING_PRESETS}
                selectedId={controls.lightingStyle}
                onSelect={(id) => update('lightingStyle', id)}
              />

              {/* Surface / Pedestal */}
              <ChipSelector
                label="Pedestal / Surface Material"
                icon={Layers}
                presets={SURFACE_PRESETS}
                selectedId={controls.surfaceMaterial}
                onSelect={(id) => update('surfaceMaterial', id)}
              />

              {/* Physics & FX */}
              <ChipSelector
                label="Physics & Environmental FX"
                icon={Sparkles}
                presets={PHYSICS_FX_PRESETS}
                selectedId={controls.physicsFX}
                onSelect={(id) => update('physicsFX', id)}
              />

              {/* Motion Pace */}
              <ChipSelector
                label="Motion Pacing / FPS"
                icon={Gauge}
                presets={MOTION_PACE_PRESETS}
                selectedId={controls.motionPace}
                onSelect={(id) => update('motionPace', id)}
              />

              {/* Human / UGC Interaction */}
              <ChipSelector
                label="Human / UGC Interaction"
                icon={User}
                presets={HUMAN_INTERACTION_PRESETS}
                selectedId={controls.humanInteraction}
                onSelect={(id) => update('humanInteraction', id)}
              />
            </SubAccordion>

            {/* Group 3 — Target Dialects & Constraints */}
            <SubAccordion
              title="Target Dialects & Constraints"
              icon={Layers}
              isOpen={openGroup === 'dialect'}
              onToggle={() => toggleGroup('dialect')}
              summary="Platform dialects, beats, negatives, custom notes"
              activeCount={dialectActive}
            >
              {/* Phase 4 — Dialect Toggles (skip platforms if unneeded) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase text-text-secondary">
                    <Layers className="w-3.5 h-3.5 text-brand" />
                    Dialect Toggles
                  </label>
                  <span className="text-[10px] text-text-muted">
                    {controls.enabledDialects ? `${controls.enabledDialects.length} enabled` : 'All enabled'}
                  </span>
                </div>
                <p className="text-[10px] text-text-muted leading-relaxed">
                  Skip platform dialects you don&apos;t need — fewer dialects means a smaller, faster output.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {DIALECT_OPTIONS.map((dialect) => {
                    const isEnabled = !controls.enabledDialects || controls.enabledDialects.includes(dialect.value);
                    return (
                      <button
                        key={dialect.value}
                        type="button"
                        onClick={() => {
                          const current = controls.enabledDialects ?? DIALECT_OPTIONS.map((d) => d.value);
                          const next = isEnabled
                            ? current.filter((d) => d !== dialect.value)
                            : [...current, dialect.value];
                          // If all are enabled, store undefined (default behavior)
                          update('enabledDialects', next.length === DIALECT_OPTIONS.length ? undefined : next);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                          isEnabled
                            ? 'bg-brand/10 text-brand border-brand/40'
                            : 'bg-surface-muted/60 text-text-muted border-border/60 line-through'
                        }`}
                      >
                        {dialect.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Phase 4 — Extension Beats Toggle */}
              <div className="space-y-1.5 p-3 rounded-xl bg-surface-muted/30 border border-border">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase text-text-secondary">
                    <Timer className="w-3.5 h-3.5 text-brand" />
                    Extension Beats (Multi-Beat Chaining)
                  </label>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={controls.extensionBeatsEnabled !== false}
                    onClick={() => update('extensionBeatsEnabled', controls.extensionBeatsEnabled === false ? true : false)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      controls.extensionBeatsEnabled !== false ? 'bg-brand' : 'bg-surface-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                        controls.extensionBeatsEnabled !== false ? 'translate-x-[18px]' : 'translate-x-[3px]'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[10px] text-text-muted leading-relaxed">
                  {controls.extensionBeatsEnabled !== false
                    ? 'Sequential extension beats are included — the output includes chained clip prompts with last-frame anchors.'
                    : 'Extension beats are skipped — only the single master shot prompt is generated.'}
                </p>
              </div>

              {/* Negative Constraints Input */}
              <div className="space-y-1.5">
                <label htmlFor="ps-neg-constraints" className="block text-[11px] font-semibold tracking-wider uppercase text-text-secondary">
                  Custom Negative Constraints
                </label>
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {[
                    'no human faces or hands',
                    'no harsh direct glare',
                    'no fast rotating or spinning',
                    'avoid dark backgrounds',
                    'zero background clutter',
                    'pure product only',
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => {
                        const current = controls.negativeConstraints || '';
                        if (!current.includes(chip)) {
                          update('negativeConstraints', current ? `${current}, ${chip}` : chip);
                        }
                      }}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-surface-muted hover:bg-brand/10 hover:text-brand border border-border transition-colors text-text-secondary"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
                <input
                  id="ps-neg-constraints"
                  type="text"
                  value={controls.negativeConstraints || ''}
                  onChange={(e) => update('negativeConstraints', e.target.value)}
                  placeholder="e.g. no human faces, avoid dark background, no fast spinning, no glare"
                  className="w-full min-w-0 rounded-lg bg-surface-input border border-border px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 transition-colors"
                />
              </div>

              {/* Custom Visual Directorial Notes */}
              <div className="space-y-1.5">
                <label htmlFor="ps-custom-notes" className="block text-[11px] font-semibold tracking-wider uppercase text-text-secondary">
                  Custom Directorial Notes
                </label>
                <textarea
                  id="ps-custom-notes"
                  rows={2}
                  value={controls.customVisualNotes || ''}
                  onChange={(e) => update('customVisualNotes', e.target.value)}
                  placeholder="e.g. Emphasize the gold foil embossing when the light sweeps from left to right."
                  className="w-full min-w-0 rounded-lg bg-surface-input border border-border px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 transition-colors resize-none"
                />
              </div>
            </SubAccordion>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

