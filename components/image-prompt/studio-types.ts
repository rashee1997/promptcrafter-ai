import { ImagePlatform, ImagePromptReferenceImage } from '@/types';

/** Studio mode — image prompts or brand-identity logo prompts. */
export type StudioMode = 'image' | 'logo';

/** Form state owned by ImagePromptStudio and shared with its sub-components. */
export interface StudioFormState {
  subject: string;
  style: string;
  mode: StudioMode;
  /**
   * Purpose routing — "What matters most for this image?" When set, drives
   * auto-suggested platforms and a one-line reason in the platform picker.
   * Absent = no purpose selected; undefined for backward compat.
   */
  purpose: string | undefined;
  /** Logo mode — mark type id (see LOGO_MARK_TYPES in lib/logo-prompts.ts). */
  logoType: string;
  /** Logo mode — style preset id (see LOGO_STYLE_PRESETS in lib/logo-prompts.ts). */
  logoStyle: string;
  /** Logo mode — color palette id (see LOGO_PALETTE_PRESETS in lib/logo-prompts.ts). */
  palette: string;
  /** Logo mode — exact wordmark / brand name text. */
  brandName: string;
  /** Logo mode — industry preset id (see LOGO_INDUSTRY_PRESETS). */
  industry: string | undefined;
  /** Logo mode — ownable symbol concept id (see LOGO_CONCEPT_PRESETS). */
  concept: string | undefined;
  /** Logo mode — shape-language id (see LOGO_SHAPE_PRESETS). */
  shapeLanguage: string | undefined;
  /** Logo mode — typography direction id (see LOGO_TYPOGRAPHY_PRESETS). */
  typography: string | undefined;
  /** Logo mode — lockup layout id (see LOGO_LOCKUP_PRESETS). */
  lockup: string | undefined;
  /** Logo mode — hidden-meaning treatment id (see LOGO_HIDDEN_MEANING_PRESETS). */
  hiddenMeaning: string | undefined;
  /** Logo mode — versatility targets (see LOGO_USAGE_PRESETS). */
  usage: string[];
  /** Logo mode — concept boldness id (see LOGO_BOLDNESS_PRESETS). */
  boldness: string | undefined;
  lighting: string | undefined;
  mood: string | undefined;
  composition: string | undefined;
  camera: string | undefined;
  colorGrade: string | undefined;
  resolution: string | undefined;
  aspectRatio: string;
  outputFormat: 'prose' | 'json' | 'both';
  platforms: ImagePlatform[];
  negativePrompt: string;
  inImageText: string;
  additionalNotes: string;
  showArtDirection: boolean;
  /**
   * Tier-2 "Refine" accordion (platform dialects + logo Brand sub-card).
   * Absent/undefined on older persisted state — defaults to collapsed.
   */
  showRefine: boolean;
  /** Reference images uploaded for the brief (max 3, session-only by default). */
  referenceImages: ImagePromptReferenceImage[];
  /** When true, reference images are persisted with the saved prompt. */
  keepRefImages: boolean;
  /** Active selected scene recipe or brand archetype ID */
  selectedRecipeId?: string | null;
}

/** Setter callbacks for the form state — mirrors the useState setters in the studio. */
export interface StudioFormHandlers {
  setSubject: (value: string) => void;
  setStyle: (value: string) => void;
  setMode: (mode: StudioMode) => void;
  setPurpose: (value: string | undefined) => void;
  setLogoType: (value: string) => void;
  setLogoStyle: (value: string) => void;
  setPalette: (value: string) => void;
  setBrandName: (value: string) => void;
  setIndustry: (value: string | undefined) => void;
  setConcept: (value: string | undefined) => void;
  setShapeLanguage: (value: string | undefined) => void;
  setTypography: (value: string | undefined) => void;
  setLockup: (value: string | undefined) => void;
  setHiddenMeaning: (value: string | undefined) => void;
  setUsage: (value: string[]) => void;
  setBoldness: (value: string | undefined) => void;
  setLighting: (value: string | undefined) => void;
  setMood: (value: string | undefined) => void;
  setComposition: (value: string | undefined) => void;
  setCamera: (value: string | undefined) => void;
  setColorGrade: (value: string | undefined) => void;
  setResolution: (value: string | undefined) => void;
  setAspectRatio: (value: string) => void;
  setOutputFormat: (format: 'prose' | 'json' | 'both') => void;
  togglePlatform: (id: ImagePlatform) => void;
  setPlatforms: (platforms: ImagePlatform[]) => void;
  setNegativePrompt: (value: string) => void;
  setInImageText: (value: string) => void;
  setAdditionalNotes: (value: string) => void;
  setShowArtDirection: (value: boolean) => void;
  setShowRefine: (value: boolean) => void;
  addReferenceImage: (img: ImagePromptReferenceImage) => void;
  removeReferenceImage: (id: string) => void;
  updateReferenceImagePurpose: (id: string, purpose: ImagePromptReferenceImage['purpose']) => void;
  setKeepRefImages: (value: boolean) => void;
  setSelectedRecipeId: (id: string | null) => void;
}

