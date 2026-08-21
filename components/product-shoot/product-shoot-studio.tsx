'use client';

import React, { useCallback, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Zap, Loader2 } from 'lucide-react';
import type { ProviderConfig } from '@/types';
import type {
  ProductImage,
  ProductBrief,
  ProductShootOutput,
} from '@/lib/product-shoot/types';
import { getModelCapability } from '@/lib/model-capabilities';
import { SURPRISE_RECIPE_ID } from '@/lib/product-shoot/scene-recipes';
import { ProductUploadPanel } from './product-upload-panel';
import { BriefForm } from './brief-form';
import { SceneRecipePicker } from './scene-recipe-picker';
import { OutputPanel } from './output-panel';

interface ProductShootStudioProps {
  activeProvider: ProviderConfig;
}

const EMPTY_BRIEF: ProductBrief = {
  name: '',
  category: '',
  description: '',
  sellingPoint: '',
};

export function ProductShootStudio({ activeProvider }: ProductShootStudioProps) {
  // Form state
  const [images, setImages] = useState<ProductImage[]>([]);
  const [brief, setBrief] = useState<ProductBrief>(EMPTY_BRIEF);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState('');
  const [visionPrePassNote, setVisionPrePassNote] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const canGenerate =
    images.length > 0 &&
    brief.name.trim().length > 0 &&
    selectedRecipeId !== null &&
    !isGenerating;

  const handleGenerate = useCallback(async () => {
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
        `Note: Your active model (${activeProvider.model}) does not support image inputs. ` +
        `A vision analysis pre-pass was performed using the built-in Gemini to extract ` +
        `an accurate product description from your uploaded images. The creative brief ` +
        `was generated from this description.`;
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
  }, [canGenerate, images, brief, selectedRecipeId, activeProvider]);

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div>
        <h2 className="text-lg font-bold tracking-tight text-text-primary">
          Product Shoot Studio
        </h2>
        <p className="mt-1 text-sm text-text-secondary leading-relaxed">
          Upload your product, describe it, pick a creative direction, and
          get a complete shot package ready for any video model.
        </p>
      </div>

      {/* Two-column layout on desktop */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        {/* Left column — form */}
        <div className="w-full lg:w-1/2 space-y-6">
          {/* Upload */}
          <div className="rounded-xl border border-border bg-surface-card/80 backdrop-blur-xl p-5">
            <ProductUploadPanel images={images} onImagesChange={setImages} />
          </div>

          {/* Brief */}
          <div className="rounded-xl border border-border bg-surface-card/80 backdrop-blur-xl p-5">
            <BriefForm brief={brief} onChange={setBrief} />
          </div>

          {/* Recipe picker */}
          <div className="rounded-xl border border-border bg-surface-card/80 backdrop-blur-xl p-5">
            <SceneRecipePicker
              selectedRecipeId={selectedRecipeId}
              onSelectRecipe={setSelectedRecipeId}
            />
          </div>

          {/* Generate button */}
          <motion.button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate}
            whileHover={canGenerate ? { scale: 1.015 } : undefined}
            whileTap={canGenerate ? { scale: 0.985 } : undefined}
            className={`
              w-full flex items-center justify-center gap-2 rounded-xl px-5 py-3
              text-sm font-semibold transition-all duration-200
              ${
                canGenerate
                  ? 'bg-gradient-to-r from-brand to-accent text-white shadow-[0_8px_24px_var(--shadow-glow)] hover:brightness-110'
                  : 'bg-surface-muted text-text-muted cursor-not-allowed opacity-50'
              }
            `}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Generate Shot Package
              </>
            )}
          </motion.button>

          {!canGenerate && !isGenerating && (
            <p className="text-[11px] text-text-muted text-center">
              {images.length === 0
                ? 'Upload at least one product image'
                : !brief.name.trim()
                  ? 'Enter a product name'
                  : !selectedRecipeId
                    ? 'Select a scene recipe'
                    : null}
            </p>
          )}
        </div>

        {/* Right column — output */}
        <div className="w-full lg:w-1/2 lg:sticky lg:top-20">
          <div className="rounded-xl border border-border bg-surface-card/80 backdrop-blur-xl p-5">
            <OutputPanel
              output={output}
              isGenerating={isGenerating}
              visionPrePassNote={visionPrePassNote}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
