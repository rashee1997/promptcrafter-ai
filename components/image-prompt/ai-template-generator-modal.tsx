'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  X,
  Check,
  Save,
  Wand2,
  ArrowRight,
  RefreshCw,
  Cpu,
  Layers,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { GlassCard } from '../glass-card';
import { generateStyleTemplate } from '@/lib/ai-client';
import { saveCustomImageRecipe } from '@/lib/image-style-recipes';
import { saveCustomLogoArchetype } from '@/lib/logo-archetypes';
import type { ProviderConfig, ImageStyleRecipe, LogoArchetypeRecipe } from '@/types';

interface AiTemplateGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'image' | 'logo';
  activeProvider: ProviderConfig;
  onApplyImageRecipe: (recipe: ImageStyleRecipe) => void;
  onApplyLogoArchetype: (archetype: LogoArchetypeRecipe) => void;
}

const SAMPLE_IMAGE_IDEAS = [
  'Dark fantasy gothic cathedral ruins with cold pale moonlight and dense fog',
  '90s gritty direct flash party candid on 35mm point-and-shoot with raw drop shadows',
  'Octane 3D translucent frosted glass sculpture with rainbow dispersion caustics',
  'Cinematic Panavision anamorphic space opera epic with horizontal teal lens flares',
  'Minimalist Scandinavian interior with warm morning light and oak textures',
  'Traditional Japanese Ukiyo-e woodblock print with sumi ink keylines and washi paper',
];

const SAMPLE_LOGO_IDEAS = [
  'Minimalist AI cybersecurity monogram with negative-space keyhole and sharp slate tones',
  'Swiss modernist international grid combination mark for a fintech bank',
  'Vintage artisan circular stamp seal for an organic coffee roaster with terracotta warmth',
  'Y2K liquid chrome metallic cyber brand mark with rounded bubble typography',
  'Delicate continuous monoline botanical mark for a luxury organic skincare house',
  'Gestalt negative space mark where a mountain peak forms the silhouette of an eagle',
];

export function AiTemplateGeneratorModal({
  isOpen,
  onClose,
  mode,
  activeProvider,
  onApplyImageRecipe,
  onApplyLogoArchetype,
}: AiTemplateGeneratorModalProps) {
  const isLogo = mode === 'logo';
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImageRecipe, setGeneratedImageRecipe] = useState<ImageStyleRecipe | null>(null);
  const [generatedLogoArchetype, setGeneratedLogoArchetype] = useState<LogoArchetypeRecipe | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  // Configurable generation settings (not hardcoded)
  const [customStyles, setCustomStyles] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [styleWeight, setStyleWeight] = useState(0.8);

  if (!isOpen) return null;

  const sampleIdeas = isLogo ? SAMPLE_LOGO_IDEAS : SAMPLE_IMAGE_IDEAS;

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setIsSaved(false);

    try {
      const res = await generateStyleTemplate({
        provider: activeProvider,
        prompt: prompt.trim(),
        mode,
        customStyles: customStyles.split(',').map((s) => s.trim()).filter(Boolean),
        negativePrompt: negativePrompt.trim() || undefined,
        temperature,
        styleWeight,
        constraints: { intensity: styleWeight },
      });

      if (isLogo && res.archetype) {
        setGeneratedLogoArchetype(res.archetype);
        setGeneratedImageRecipe(null);
      } else if (!isLogo && res.recipe) {
        setGeneratedImageRecipe(res.recipe);
        setGeneratedLogoArchetype(null);
      } else {
        throw new Error('Could not parse the generated template configuration.');
      }
    } catch (err: any) {
      console.error('Template synthesis error:', err);
      setError(err.message || 'Failed to generate template. Please check your provider.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToPresets = () => {
    if (isLogo && generatedLogoArchetype) {
      saveCustomLogoArchetype(generatedLogoArchetype);
      setIsSaved(true);
    } else if (!isLogo && generatedImageRecipe) {
      saveCustomImageRecipe(generatedImageRecipe);
      setIsSaved(true);
    }
  };

  const handleApplyAndClose = () => {
    if (isLogo && generatedLogoArchetype) {
      saveCustomLogoArchetype(generatedLogoArchetype);
      onApplyLogoArchetype(generatedLogoArchetype);
      onClose();
    } else if (!isLogo && generatedImageRecipe) {
      saveCustomImageRecipe(generatedImageRecipe);
      onApplyImageRecipe(generatedImageRecipe);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border/80 bg-surface-card/95 shadow-2xl p-6 relative"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="p-2 rounded-xl bg-brand/10 border border-brand/25 text-brand">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              <span>AI {isLogo ? 'Brand Identity Architect' : 'Style Template Architect'}</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/20">
                Generative Presets
              </span>
            </h3>
            <p className="text-xs text-text-muted">
              Describe your desired visual aesthetic, lighting, or brand vibe. AI will craft a complete multi-dimensional directorial configuration.
            </p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleGenerate} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
              Describe the Creative Vibe or Brand Direction
            </label>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  isLogo
                    ? 'e.g., Swiss modernist fintech combination mark with deep prussian blue, sharp geometric angles, and clean sans typography...'
                    : 'e.g., Gritty 90s direct flash party candid with deep drop shadows, warm Kodak film stock, and unpolished indie energy...'
                }
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-input border border-border/80 text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/50 resize-none transition-all"
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
              />
            </div>
          </div>

          {/* Quick Idea Chips */}
          <div>
            <div className="text-[11px] font-medium text-text-muted mb-1.5 flex items-center justify-between">
              <span>Quick inspiration prompts:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {sampleIdeas.slice(0, 4).map((idea, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(idea)}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-surface-muted/60 hover:bg-brand/10 hover:text-brand border border-border/50 text-text-secondary text-left transition-colors truncate max-w-full"
                >
                &quot;{idea}&quot;
                </button>
              ))}
            </div>
          </div>

          {/* Generation Settings */}
          <details className="group mt-4">
            <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-text-secondary hover:text-text-primary">
              <Layers className="w-4 h-4 text-text-muted group-open:rotate-90 transition-transform" />
              <span>Generation Settings</span>
              <span className="ml-auto text-[10px] text-text-muted uppercase tracking-wider">optional</span>
            </summary>
            <div className="mt-3 space-y-3 p-3 rounded-xl bg-surface-muted/40 border border-border/40 animate-accordion-down">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                  Custom Styles (comma-separated)
                </label>
                <input
                  type="text"
                  value={customStyles}
                  onChange={(e) => setCustomStyles(e.target.value)}
                  placeholder="e.g., neo-brutalism, vapor-glow, organic-minimal"
                  className="w-full px-3 py-2 rounded-lg bg-surface-input border border-border/80 text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all"
                />
                <p className="text-[10px] text-text-muted mt-1">User-defined styles appended to valid options beyond hardcoded enums.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                  Negative Prompt (what to avoid)
                </label>
                <input
                  type="text"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="e.g., oversaturated, messy, watermark, text, signature"
                  className="w-full px-3 py-2 rounded-lg bg-surface-input border border-border/80 text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all"
                />
                <p className="text-[10px] text-text-muted mt-1">Instructions on what the generated template should avoid.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                    Temperature <span className="font-mono text-brand ml-1">{temperature.toFixed(1)}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1.5"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full h-2 bg-surface-input rounded-full appearance-none accent-brand"
                  />
                  <p className="text-[10px] text-text-muted mt-1">Creativity level (0 = deterministic, 1.5 = very creative).</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                    Style Weight <span className="font-mono text-brand ml-1">{Math.round(styleWeight * 100)}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={styleWeight}
                    onChange={(e) => setStyleWeight(parseFloat(e.target.value))}
                    className="w-full h-2 bg-surface-input rounded-full appearance-none accent-brand"
                  />
                  <p className="text-[10px] text-text-muted mt-1">How dominant the generated style should feel.</p>
                </div>
              </div>
            </div>
          </details>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand text-[var(--brand-foreground)] hover:bg-brand/90 disabled:opacity-50 shadow-[0_4px_12px_var(--shadow-glow)] transition-all"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing Template...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Template</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-error/10 border border-error/25 text-xs text-error">
            {error}
          </div>
        )}

        {/* Generated Preview Card */}
        <AnimatePresence>
          {(!isLogo && generatedImageRecipe) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 p-4 rounded-xl border border-brand/40 bg-gradient-to-br from-brand/10 via-surface-card to-accent/5 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text-primary">
                      {generatedImageRecipe.label}
                    </span>
                    <span className="text-[9px] uppercase font-semibold px-2 py-0.5 rounded-full bg-brand text-[var(--brand-foreground)]">
                      AI Generated
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1">
                    {generatedImageRecipe.summary}
                  </p>
                </div>
              </div>

              {/* Config Tags */}
              <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                {generatedImageRecipe.config.style && (
                  <span className="px-2 py-0.5 rounded-md bg-surface-input border border-border">
                    Style: {generatedImageRecipe.config.style}
                  </span>
                )}
                {generatedImageRecipe.config.camera && (
                  <span className="px-2 py-0.5 rounded-md bg-surface-input border border-border">
                    Optics: {generatedImageRecipe.config.camera}
                  </span>
                )}
                {generatedImageRecipe.config.lighting && (
                  <span className="px-2 py-0.5 rounded-md bg-surface-input border border-border">
                    Light: {generatedImageRecipe.config.lighting}
                  </span>
                )}
                {generatedImageRecipe.config.colorGrade && (
                  <span className="px-2 py-0.5 rounded-md bg-surface-input border border-border">
                    Grade: {generatedImageRecipe.config.colorGrade}
                  </span>
                )}
                {generatedImageRecipe.config.aspectRatio && (
                  <span className="px-2 py-0.5 rounded-md bg-surface-input border border-border">
                    Aspect: {generatedImageRecipe.config.aspectRatio}
                  </span>
                )}
              </div>

              {/* Sample Prompt Preview */}
              {generatedImageRecipe.config.sampleFullPrompt && (
                <div className="p-2.5 rounded-lg bg-surface-input/80 border border-border/60 text-[11px] text-text-muted leading-relaxed font-mono">
                  <span className="text-[10px] font-semibold text-brand block mb-0.5 uppercase tracking-wider">
                    Ready-to-Use Sample Prompt
                  </span>
                  &quot;{generatedImageRecipe.config.sampleFullPrompt}&quot;
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSaveToPresets}
                  disabled={isSaved}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-surface-card hover:bg-surface-muted text-text-secondary transition-colors"
                >
                  {isSaved ? <Check className="w-3.5 h-3.5 text-success" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{isSaved ? 'Saved to Presets' : 'Save as Preset'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleApplyAndClose}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-brand text-[var(--brand-foreground)] hover:bg-brand/90 shadow-[0_2px_8px_var(--shadow-glow)] transition-all"
                >
                  <span>Apply to Studio Form</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {(isLogo && generatedLogoArchetype) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 p-4 rounded-xl border border-brand/40 bg-gradient-to-br from-brand/10 via-surface-card to-accent/5 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text-primary">
                      {generatedLogoArchetype.label}
                    </span>
                    <span className="text-[9px] uppercase font-semibold px-2 py-0.5 rounded-full bg-brand text-[var(--brand-foreground)]">
                      AI Archetype
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1">
                    {generatedLogoArchetype.summary}
                  </p>
                </div>
              </div>

              {/* Config Tags */}
              <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                <span className="px-2 py-0.5 rounded-md bg-surface-input border border-border">
                  Mark: {generatedLogoArchetype.config.logoType}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-surface-input border border-border">
                  Style: {generatedLogoArchetype.config.logoStyle}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-surface-input border border-border">
                  Palette: {generatedLogoArchetype.config.palette}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-surface-input border border-border">
                  Type: {generatedLogoArchetype.config.typography}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-surface-input border border-border">
                  Geometry: {generatedLogoArchetype.config.shapeLanguage}
                </span>
              </div>

              {/* Rationale */}
              {generatedLogoArchetype.config.directorNotes && (
                <div className="p-2.5 rounded-lg bg-surface-input/80 border border-border/60 text-[11px] text-text-muted leading-relaxed">
                  <span className="text-[10px] font-semibold text-brand block mb-0.5 uppercase tracking-wider">
                    Brand Strategist Rationale
                  </span>
                  {generatedLogoArchetype.config.directorNotes}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSaveToPresets}
                  disabled={isSaved}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-surface-card hover:bg-surface-muted text-text-secondary transition-colors"
                >
                  {isSaved ? <Check className="w-3.5 h-3.5 text-success" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{isSaved ? 'Saved to Presets' : 'Save as Preset'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleApplyAndClose}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-brand text-[var(--brand-foreground)] hover:bg-brand/90 shadow-[0_2px_8px_var(--shadow-glow)] transition-all"
                >
                  <span>Apply to Studio Form</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
