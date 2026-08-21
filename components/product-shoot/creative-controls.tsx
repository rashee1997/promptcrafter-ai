import React from 'react';
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
} from 'lucide-react';
import type { CreativeControls, VideoAspectRatio, GenerationMode } from '@/lib/product-shoot/types';
import {
  CAMERA_MOTION_PRESETS,
  FOCAL_LENGTH_PRESETS,
  MOTION_INTENSITY_PRESETS,
  LIGHTING_PRESETS,
  SURFACE_PRESETS,
  PHYSICS_FX_PRESETS,
  MOTION_PACE_PRESETS,
  HUMAN_INTERACTION_PRESETS,
  ASPECT_RATIOS,
  type OptionPreset,
} from '@/lib/product-shoot/presets';

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
  ].filter(Boolean).length;

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
            className="border-t border-border/60 p-4 space-y-4"
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
              <div className="grid grid-cols-2 gap-2">
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {MOTION_INTENSITY_PRESETS.map((mip) => {
                  const isSelected = (controls.motionIntensity || 4) === mip.value;
                  return (
                    <button
                      key={mip.value}
                      type="button"
                      onClick={() => update('motionIntensity', mip.value)}
                      title={mip.description}
                      className={`p-2 rounded-lg border text-left transition-all ${
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

            {/* Aspect Ratio Selector */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase text-text-secondary">
                <Ratio className="w-3.5 h-3.5 text-brand" />
                Target Video Framing / Aspect Ratio
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ASPECT_RATIOS.map((ar) => {
                  const isSelected = controls.aspectRatio === ar.id;
                  return (
                    <button
                      key={ar.id}
                      type="button"
                      onClick={() => update('aspectRatio', ar.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
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

            {/* Camera Choreography */}
            <ChipSelector
              label="Camera Choreography & Movement"
              icon={Camera}
              presets={CAMERA_MOTION_PRESETS}
              selectedId={controls.cameraMotion}
              onSelect={(id) => update('cameraMotion', id)}
            />

            {/* Lighting & Atmosphere */}
            <ChipSelector
              label="Lighting Design & Mood"
              icon={Sun}
              presets={LIGHTING_PRESETS}
              selectedId={controls.lightingStyle}
              onSelect={(id) => update('lightingStyle', id)}
            />

            {/* Surface / Pedestal Materials */}
            <ChipSelector
              label="Pedestal & Surface Material"
              icon={Layers}
              presets={SURFACE_PRESETS}
              selectedId={controls.surfaceMaterial}
              onSelect={(id) => update('surfaceMaterial', id)}
            />

            {/* Physics & Environmental FX */}
            <ChipSelector
              label="Physics & Environmental FX"
              icon={Sparkles}
              presets={PHYSICS_FX_PRESETS}
              selectedId={controls.physicsFX}
              onSelect={(id) => update('physicsFX', id)}
            />

            {/* Motion Pace */}
            <ChipSelector
              label="Motion Pace & Shutter Cadence"
              icon={Gauge}
              presets={MOTION_PACE_PRESETS}
              selectedId={controls.motionPace}
              onSelect={(id) => update('motionPace', id)}
            />

            {/* Human Interaction / UGC Mode */}
            <ChipSelector
              label="Human Interaction & Mode"
              icon={User}
              presets={HUMAN_INTERACTION_PRESETS}
              selectedId={controls.humanInteraction}
              onSelect={(id) => update('humanInteraction', id)}
            />

            {/* Custom Directorial Notes */}
            <div className="space-y-1.5 pt-1 border-t border-border/40">
              <label htmlFor="ps-custom-notes" className="flex items-center gap-1 text-[11px] font-semibold tracking-wider uppercase text-text-secondary">
                <Info className="w-3.5 h-3.5 text-accent" />
                Custom Directorial Vision Notes (Optional)
              </label>
              <input
                id="ps-custom-notes"
                type="text"
                value={controls.customVisualNotes || ''}
                onChange={(e) => update('customVisualNotes', e.target.value)}
                placeholder="e.g. Floating gold foil flecks, sunrise color palette, anamorphic blue streak flares"
                className="w-full rounded-lg bg-surface-input border border-border px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 transition-colors"
              />
            </div>

            {/* User Negative Constraints */}
            <div className="space-y-1.5">
              <label htmlFor="ps-custom-negative" className="block text-[11px] font-semibold tracking-wider uppercase text-text-secondary">
                Additional Negative Constraints (Optional)
              </label>
              <input
                id="ps-custom-negative"
                type="text"
                value={controls.negativeConstraints || ''}
                onChange={(e) => update('negativeConstraints', e.target.value)}
                placeholder="e.g. no human faces, no dark shadows, no glitter, no fast camera spins"
                className="w-full rounded-lg bg-surface-input border border-border px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 transition-colors"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

