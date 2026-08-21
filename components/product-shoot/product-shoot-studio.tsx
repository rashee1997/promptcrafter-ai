'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Loader2, Sparkles } from 'lucide-react';
import type { ProviderConfig } from '@/types';
import type {
  ProductImage,
  ProductBrief,
  CreativeControls,
  SavedProductShoot,
} from '@/lib/product-shoot/types';
import { getModelCapability } from '@/lib/model-capabilities';
import {
  DEFAULT_CREATIVE_CONTROLS,
  type ExampleProductBrief,
} from '@/lib/product-shoot/presets';
import {
  getSavedProductShoots,
  saveProductShoot,
  deleteSavedProductShoot,
  toggleFavoriteProductShoot,
} from '@/lib/product-shoot/storage';
import { parseProductShootOutput } from '@/lib/product-shoot/dialects';
import { getRecipeById, SURPRISE_RECIPE_ID } from '@/lib/product-shoot/scene-recipes';

import { StudioHeader } from './studio-header';
import { ProductUploadPanel } from './product-upload-panel';
import { BriefForm } from './brief-form';
import { SceneRecipePicker } from './scene-recipe-picker';
import { CreativeControlsPanel } from './creative-controls';
import { OutputPanel } from './output-panel';
import { SavedGallery } from './saved-gallery';

interface ProductShootStudioProps {
  activeProvider: ProviderConfig;
  onSelectActiveModel?: (model: string) => void;
}

const EMPTY_BRIEF: ProductBrief = {
  name: '',
  category: '',
  description: '',
  sellingPoint: '',
  targetAudience: '',
  keyFeatures: '',
};

export function ProductShootStudio({
  activeProvider,
  onSelectActiveModel,
}: ProductShootStudioProps) {
  // Form state
  const [images, setImages] = useState<ProductImage[]>([]);
  const [brief, setBrief] = useState<ProductBrief>(EMPTY_BRIEF);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [creativeControls, setCreativeControls] = useState<CreativeControls>(DEFAULT_CREATIVE_CONTROLS);
  const [showCreativeControls, setShowCreativeControls] = useState(false);

  // Output & Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState('');
  const [visionPrePassNote, setVisionPrePassNote] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Gallery & Persistence state
  const [showGallery, setShowGallery] = useState(false);
  const [savedShoots, setSavedShoots] = useState<SavedProductShoot[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  // Load saved gallery on mount
  useEffect(() => {
    setSavedShoots(getSavedProductShoots());
  }, []);

  const canGenerate =
    images.length > 0 &&
    brief.name.trim().length > 0 &&
    selectedRecipeId !== null &&
    !isGenerating;

  const handleGenerate = useCallback(
    async (overrideControls?: CreativeControls) => {
      if (!canGenerate) return;

      // Abort any in-flight request
      if (abortRef.current) {
        abortRef.current.abort();
      }

      const controller = new AbortController();
      abortRef.current = controller;

      setIsGenerating(true);
      setOutput('');
      setVisionPrePassNote(null);
      setIsSaved(false);

      // Check if the active model supports vision
      const modelCap = getModelCapability(activeProvider.model);

      // Build image parts from uploaded images
      const imageParts = images.map((img) => {
        const mimeType = img.dataUrl.split(';')[0].replace('data:', '') || 'image/png';
        const data = img.dataUrl.split(',')[1] || '';
        return { mimeType, data };
      });

      // Determine if a vision pre-pass is needed
      let visionPrePass = false;
      let visionNote: string | null = null;

      if (!modelCap.supportsVision && imageParts.length > 0) {
        visionPrePass = true;
        visionNote =
          `Note: Your active model (${activeProvider.model}) does not support direct image inputs. ` +
          `A vision analysis pre-pass was performed using the built-in Gemini to extract ` +
          `an accurate product description from your uploaded reference images. The creative shot package ` +
          `was generated from this ground truth.`;
      }

      let fullText = '';

      try {
        const res = await fetch('/api/product-shoot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: activeProvider,
            brief,
            recipeId: selectedRecipeId,
            creativeControls: overrideControls || creativeControls,
            imageParts: visionPrePass ? [] : imageParts,
            visionPrePassUsed: visionPrePass,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({ error: `Server HTTP ${res.status}` }));
          throw new Error(errData.error || `HTTP ${res.status}`);
        }

        if (!res.body) {
          throw new Error('Response body is empty');
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          setOutput(fullText);
        }

        if (visionNote) {
          setVisionPrePassNote(visionNote);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        setOutput(`⚠️ Generation failed: ${err.message}`);
      } finally {
        setIsGenerating(false);
      }
    },
    [canGenerate, images, brief, selectedRecipeId, creativeControls, activeProvider]
  );

  // 1-Click Remix Handler
  const handleRemix = useCallback(
    (remixSuggestion: string) => {
      const updatedControls: CreativeControls = {
        ...creativeControls,
        customVisualNotes: creativeControls.customVisualNotes
          ? `${creativeControls.customVisualNotes}; ${remixSuggestion}`
          : remixSuggestion,
      };
      setCreativeControls(updatedControls);
      // Automatically trigger generation with the remix
      setTimeout(() => {
        handleGenerate(updatedControls);
      }, 50);
    },
    [creativeControls, handleGenerate]
  );

  // Save generation to history
  const handleSaveToGallery = useCallback(() => {
    if (!output || !brief.name) return;

    const sections = parseProductShootOutput(output);
    const recipe = selectedRecipeId ? getRecipeById(selectedRecipeId) : null;
    const recipeLabel = selectedRecipeId === SURPRISE_RECIPE_ID ? "Director's Choice" : (recipe?.label ?? 'Custom');

    const shootRecord: SavedProductShoot = {
      id: `ps-saved-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: Date.now(),
      productName: brief.name,
      category: brief.category || 'General',
      brief,
      recipeId: selectedRecipeId || 'ecommerce-hero',
      recipeLabel,
      creativeControls,
      outputRaw: output,
      sections,
      modelUsed: activeProvider.model,
      providerId: activeProvider.id || 'default',
      imageThumbnails: images.map((i) => i.dataUrl),
      isFavorite: false,
    };

    const updated = saveProductShoot(shootRecord);
    setSavedShoots(updated);
    setIsSaved(true);
  }, [output, brief, selectedRecipeId, creativeControls, activeProvider, images]);

  // Load example brief
  const handleSelectExample = useCallback((example: ExampleProductBrief) => {
    setBrief(example.brief);
    setSelectedRecipeId(example.recipeId);
    setCreativeControls(example.creativeControls);
    setShowCreativeControls(true);
  }, []);

  // Reuse previous saved shoot in active studio
  const handleReuseShoot = useCallback((saved: SavedProductShoot) => {
    setBrief(saved.brief);
    setSelectedRecipeId(saved.recipeId);
    if (saved.creativeControls) {
      setCreativeControls(saved.creativeControls);
      setShowCreativeControls(true);
    }
    if (saved.outputRaw) {
      setOutput(saved.outputRaw);
    }
    setShowGallery(false);
  }, []);

  // Reset form
  const handleReset = useCallback(() => {
    setImages([]);
    setBrief(EMPTY_BRIEF);
    setSelectedRecipeId(null);
    setCreativeControls(DEFAULT_CREATIVE_CONTROLS);
    setOutput('');
    setVisionPrePassNote(null);
    setIsSaved(false);
  }, []);

  // Delete saved shoot
  const handleDeleteShoot = useCallback((id: string) => {
    const updated = deleteSavedProductShoot(id);
    setSavedShoots(updated);
  }, []);

  // Toggle favorite
  const handleToggleFavorite = useCallback((id: string) => {
    const updated = toggleFavoriteProductShoot(id);
    setSavedShoots(updated);
  }, []);

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <StudioHeader
        activeProvider={activeProvider}
        savedCount={savedShoots.length}
        showGallery={showGallery}
        onToggleGallery={() => setShowGallery(!showGallery)}
        onSelectExample={handleSelectExample}
        onReset={handleReset}
        onSelectModel={onSelectActiveModel}
      />

      {/* Saved Gallery View if open */}
      <AnimatePresence>
        {showGallery && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <SavedGallery
              savedShoots={savedShoots}
              onReuse={handleReuseShoot}
              onDelete={handleDeleteShoot}
              onToggleFavorite={handleToggleFavorite}
              onClose={() => setShowGallery(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Two-Column Studio Layout */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        {/* Left column — Form & Controls */}
        <div className="w-full lg:w-1/2 space-y-5">
          {/* 1. Product Reference Upload */}
          <div className="rounded-2xl border border-border bg-surface-card/80 backdrop-blur-xl p-5">
            <ProductUploadPanel images={images} onImagesChange={setImages} />
          </div>

          {/* 2. Product Brief */}
          <div className="rounded-2xl border border-border bg-surface-card/80 backdrop-blur-xl p-5">
            <BriefForm brief={brief} onChange={setBrief} />
          </div>

          {/* 3. Scene Recipe Picker */}
          <div className="rounded-2xl border border-border bg-surface-card/80 backdrop-blur-xl p-5">
            <SceneRecipePicker
              selectedRecipeId={selectedRecipeId}
              onSelectRecipe={setSelectedRecipeId}
            />
          </div>

          {/* 4. Creative Controls / Art Direction Drawer */}
          <CreativeControlsPanel
            controls={creativeControls}
            onChange={setCreativeControls}
            isOpen={showCreativeControls}
            onToggle={() => setShowCreativeControls(!showCreativeControls)}
          />

          {/* Generate Button */}
          <motion.button
            type="button"
            onClick={() => handleGenerate()}
            disabled={!canGenerate}
            whileHover={canGenerate ? { scale: 1.015 } : undefined}
            whileTap={canGenerate ? { scale: 0.985 } : undefined}
            className={`
              w-full flex items-center justify-center gap-2 rounded-xl px-5 py-3.5
              text-sm font-semibold transition-all duration-200 shadow-md
              ${
                canGenerate
                  ? 'bg-gradient-to-r from-brand via-accent to-brand text-white shadow-[0_8px_24px_var(--shadow-glow)] hover:brightness-110'
                  : 'bg-surface-muted text-text-muted cursor-not-allowed opacity-50'
              }
            `}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Directing Commercial Shot Package...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Generate Shot Package</span>
              </>
            )}
          </motion.button>

          {!canGenerate && !isGenerating && (
            <p className="text-[11px] text-text-muted text-center">
              {images.length === 0
                ? 'Upload at least one product reference image'
                : !brief.name.trim()
                  ? 'Enter a product name in the brief'
                  : !selectedRecipeId
                    ? 'Select a commercial scene recipe'
                    : null}
            </p>
          )}
        </div>

        {/* Right column — Output & Dialect Deck */}
        <div className="w-full lg:w-1/2 lg:sticky lg:top-20">
          <div className="rounded-2xl border border-border bg-surface-card/80 backdrop-blur-xl p-5 shadow-sm">
            <OutputPanel
              output={output}
              isGenerating={isGenerating}
              visionPrePassNote={visionPrePassNote}
              onRemix={handleRemix}
              onSave={handleSaveToGallery}
              isSaved={isSaved}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
