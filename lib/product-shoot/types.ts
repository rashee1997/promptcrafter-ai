/**
 * Product Shoot Studio — data contracts.
 *
 * Completely isolated from the Video Prompt Studio types. No imports from
 * types/video.ts. If this feature is deleted, removing these files has zero
 * effect on the rest of the app.
 */

import type { ProviderConfig } from '@/types';

// ── Product image ───────────────────────────────────────────────────────

/** A reference image uploaded client-side (session-only, not persisted). */
export interface ProductImage {
  id: string;
  /** Base-64 data URL kept client-side only. */
  dataUrl: string;
  /** Original filename. */
  name: string;
  /** Byte size. */
  size: number;
}

// ── Brief form ─────────────────────────────────────────────────────────

/** The product brief the user fills out alongside the uploaded images. */
export interface ProductBrief {
  /** Product name — required. */
  name: string;
  /** Category (e.g. "skincare", "coffee", "electronics"). */
  category: string;
  /** One-line "what it does" description. */
  description: string;
  /** The single key selling point. */
  sellingPoint: string;
}

// ── Scene recipe ────────────────────────────────────────────────────────

export type SceneGoal =
  | 'hero'
  | 'hook'
  | 'lifestyle'
  | 'demo'
  | 'cta'
  | 'ugc';

export interface SceneRecipe {
  id: string;
  label: string;
  goal: SceneGoal;
  summary: string;
  durationHint: number;
  aspectHint: '16:9' | '9:16' | '1:1';
  /** Injected into the system prompt as creative direction. */
  creativeDirection: string;
  bestFor: string;
}

// ── Generation request / response ───────────────────────────────────────

export interface ProductShootGenerationRequest {
  provider: ProviderConfig;
  brief: ProductBrief;
  recipeId: string;
  /** Base-64 image data parts sent to the model. */
  imageParts: { mimeType: string; data: string }[];
  /** Whether a vision pre-pass was used (for the visible note). */
  visionPrePassUsed?: boolean;
}

/** One creative shot concept returned by the generation. */
export interface ShotConcept {
  /** Concept title / name. */
  title: string;
  /** The main five-element prompt (subject, context, event, nuance, exclusions). */
  prompt: string;
  /** Aspect-ratio variant of this concept. */
  aspectVariant: { ratio: string; prompt: string };
}

/** The full generation output — a usable package. */
export interface ProductShootOutput {
  /** The main prompt (five-element structure). */
  mainPrompt: string;
  /** Negative prompt leading with product-distortion terms. */
  negativePrompt: string;
  /** Aspect-ratio variants (16:9, 9:16, 1:1). */
  aspectVariants: { ratio: string; prompt: string }[];
  /** 2–3 alternative creative concepts for the same product/recipe. */
  alternativeConcepts: ShotConcept[];
}
