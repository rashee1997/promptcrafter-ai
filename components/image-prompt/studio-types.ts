import { ImagePlatform } from '@/types';

/** Studio mode — image prompts or brand-identity logo prompts. */
export type StudioMode = 'image' | 'logo';

/** Form state owned by ImagePromptStudio and shared with its sub-components. */
export interface StudioFormState {
  subject: string;
  style: string;
  mode: StudioMode;
  /** Logo mode — mark type id (see LOGO_MARK_TYPES in lib/logo-prompts.ts). */
  logoType: string;
  /** Logo mode — style preset id (see LOGO_STYLE_PRESETS in lib/logo-prompts.ts). */
  logoStyle: string;
  /** Logo mode — color palette id (see LOGO_PALETTE_PRESETS in lib/logo-prompts.ts). */
  palette: string;
  /** Logo mode — exact wordmark / brand name text. */
  brandName: string;
  lighting: string | undefined;
  mood: string | undefined;
  composition: string | undefined;
  camera: string | undefined;
  colorGrade: string | undefined;
  resolution: string | undefined;
  aspectRatio: string;
  platforms: ImagePlatform[];
  negativePrompt: string;
  inImageText: string;
  additionalNotes: string;
  showArtDirection: boolean;
}

/** Setter callbacks for the form state — mirrors the useState setters in the studio. */
export interface StudioFormHandlers {
  setSubject: (value: string) => void;
  setStyle: (value: string) => void;
  setMode: (mode: StudioMode) => void;
  setLogoType: (value: string) => void;
  setLogoStyle: (value: string) => void;
  setPalette: (value: string) => void;
  setBrandName: (value: string) => void;
  setLighting: (value: string | undefined) => void;
  setMood: (value: string | undefined) => void;
  setComposition: (value: string | undefined) => void;
  setCamera: (value: string | undefined) => void;
  setColorGrade: (value: string | undefined) => void;
  setResolution: (value: string | undefined) => void;
  setAspectRatio: (value: string) => void;
  togglePlatform: (id: ImagePlatform) => void;
  setNegativePrompt: (value: string) => void;
  setInImageText: (value: string) => void;
  setAdditionalNotes: (value: string) => void;
  setShowArtDirection: (value: boolean) => void;
}
