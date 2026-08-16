import { ImagePlatform } from '@/types';

/** Form state owned by ImagePromptStudio and shared with its sub-components. */
export interface StudioFormState {
  subject: string;
  style: string;
  lighting: string | undefined;
  mood: string | undefined;
  composition: string | undefined;
  aspectRatio: string;
  platforms: ImagePlatform[];
  deepResearch: boolean;
  negativePrompt: string;
  additionalNotes: string;
  showArtDirection: boolean;
}

/** Setter callbacks for the form state — mirrors the useState setters in the studio. */
export interface StudioFormHandlers {
  setSubject: (value: string) => void;
  setStyle: (value: string) => void;
  setLighting: (value: string | undefined) => void;
  setMood: (value: string | undefined) => void;
  setComposition: (value: string | undefined) => void;
  setAspectRatio: (value: string) => void;
  togglePlatform: (id: ImagePlatform) => void;
  setDeepResearch: (value: boolean) => void;
  setNegativePrompt: (value: string) => void;
  setAdditionalNotes: (value: string) => void;
  setShowArtDirection: (value: boolean) => void;
}
