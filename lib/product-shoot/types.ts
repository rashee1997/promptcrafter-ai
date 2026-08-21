/**
 * Product Shoot Studio — data contracts.
 *
 * Provides typed definitions for product video prompt generation, creative
 * art direction controls, platform dialects (Runway, Kling, Veo, Luma, Minimax),
 * output parsing, and saved storage history.
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
  /** Category (e.g. "Skincare & Beauty", "Beverage & Food", "Tech & Gadgets", "Luxury & Jewelry", "Fashion & Apparel", "Home & Lifestyle"). */
  category: string;
  /** One-line "what it does" description. */
  description: string;
  /** The single key selling point / benefit. */
  sellingPoint: string;
  /** Target audience / persona. */
  targetAudience?: string;
  /** Key features / ingredients to highlight. */
  keyFeatures?: string;
}

// ── Creative Art Direction Controls ────────────────────────────────────

export type CameraMotion =
  | 'orbit-360'
  | 'macro-dolly-in'
  | 'top-down-flatlay'
  | 'hero-low-angle-crane'
  | 'floating-fpv-glide'
  | 'whip-pan-reveal'
  | 'static-lock-off';

export type LightingStyle =
  | 'luxury-chiaroscuro'
  | 'softbox-diffused'
  | 'golden-hour-sun'
  | 'cyberpunk-neon'
  | 'high-key-commercial'
  | 'dramatic-backlit-rim'
  | 'moody-editorial';

export type SurfaceMaterial =
  | 'carrara-marble'
  | 'wet-black-obsidian'
  | 'raw-concrete'
  | 'warm-sand'
  | 'brushed-titanium'
  | 'velvet-drape'
  | 'reflective-water-surface'
  | 'floating-in-air';

export type PhysicsFX =
  | 'none'
  | 'water-splash-crown'
  | 'fine-mist-condensation'
  | 'powder-explosion'
  | 'zero-gravity-float'
  | 'ambient-smoke-steam'
  | 'neon-light-refraction'
  | 'floating-botanical-petals';

export type MotionPace =
  | 'slow-mo-120fps'
  | 'cinematic-24fps'
  | 'fast-energy-cut'
  | 'hyperlapse-timelapse';

export type HumanInteraction =
  | 'none-pure-product'
  | 'hands-unboxing'
  | 'hands-applying-routine'
  | 'hands-holding-swatching'
  | 'ugc-creator-demo';

export type VideoAspectRatio = '16:9' | '9:16' | '1:1' | '4:5';

export type GenerationMode = 'single' | 'campaign-3shot';

export interface CreativeControls {
  cameraMotion?: string;
  focalLength?: string;
  motionIntensity?: number; // 1 - 10
  lightingStyle?: string;
  surfaceMaterial?: string;
  physicsFX?: string;
  motionPace?: string;
  humanInteraction?: string;
  aspectRatio: VideoAspectRatio;
  generationMode?: GenerationMode;
  negativeConstraints?: string;
  customVisualNotes?: string;
}

// ── Audio-Visual Sound Design & Foley ──────────────────────────────────

export interface AudioDesignPackage {
  foleyPrompts: string[];
  soundscapeBed: string;
  musicScore: string;
  audioVisualMap?: { timecode: string; visualCue: string; audioAction: string }[];
}

// ── Strategic Ad Copy & Voiceover ──────────────────────────────────────

export interface AdStrategyPackage {
  smp: string; // Single-Minded Proposition (e.g. "The only X that Y")
  voiceoverScript: string;
  onScreenCaptions: {
    hook: string; // 0-3s
    benefit: string; // 3-7s
    cta: string; // 7-10s
  };
}

// ── 3-Shot Commercial Campaign Storyboard ──────────────────────────────

export interface CampaignShot {
  shotNumber: number;
  title: string;
  goal: string;
  durationSeconds: number;
  prompt: string;
  foleyCue: string;
  onScreenText: string;
}

export interface ThreeShotCampaign {
  shot1Hook: CampaignShot;
  shot2SensoryDemo: CampaignShot;
  shot3BrandCta: CampaignShot;
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
  aspectHint: VideoAspectRatio;
  /** Injected into the system prompt as creative direction. */
  creativeDirection: string;
  bestFor: string;
  category?: string;
  iconName?: string;
}

// ── Target Video Platforms ──────────────────────────────────────────────

export type VideoPlatformDialect =
  | 'master'
  | 'runway'
  | 'kling'
  | 'veo'
  | 'luma'
  | 'minimax';

export interface PlatformPrompt {
  platform: VideoPlatformDialect;
  title: string;
  prompt: string;
  parameters?: Record<string, string | number>;
  notes?: string;
}

// ── Generation request / response ───────────────────────────────────────

export interface ProductShootGenerationRequest {
  provider: ProviderConfig;
  brief: ProductBrief;
  recipeId: string;
  creativeControls?: CreativeControls;
  /** Base-64 image data parts sent to the model. */
  imageParts: { mimeType: string; data: string }[];
  /** Whether a vision pre-pass was used (for the visible note). */
  visionPrePassUsed?: boolean;
}

/** One creative shot concept returned by the generation. */
export interface ShotConcept {
  title: string;
  prompt: string;
  aspectVariant?: { ratio: string; prompt: string };
}

/** The parsed output sections. */
export interface ProductShootSections {
  mainPrompt: string;
  negativePrompt: string;
  runwayPrompt?: string;
  klingPrompt?: string;
  veoPrompt?: string;
  lumaPrompt?: string;
  minimaxPrompt?: string;
  aspectVariants: { ratio: string; prompt: string }[];
  alternativeConcepts: ShotConcept[];
  remixSuggestions: string[];
  audioDesign?: AudioDesignPackage;
  adStrategy?: AdStrategyPackage;
  threeShotCampaign?: ThreeShotCampaign;
}

/** The full generation output structure. */
export interface ProductShootOutput {
  raw: string;
  sections: ProductShootSections;
}

// ── Saved History Record ────────────────────────────────────────────────

export interface SavedProductShoot {
  id: string;
  createdAt: number;
  productName: string;
  category: string;
  brief: ProductBrief;
  recipeId: string;
  recipeLabel: string;
  creativeControls: CreativeControls;
  outputRaw: string;
  sections: ProductShootSections;
  modelUsed: string;
  providerId: string;
  imageThumbnails?: string[]; // Data URLs of reference thumbnails
  isFavorite?: boolean;
}
