// Video Prompt Studio — Phase 1 data contracts.
// Shared end-to-end models for projects, story bibles, characters, scene
// locations, shot items, continuity handoffs, and model dialects.

export type VideoDialect = 'veo' | 'higgsfield' | 'kling' | 'seedance';
export type ProjectStatus = 'draft' | 'active';

export interface VideoCharacter {
  id: string;
  name: string;
  role: string;
  appearance: string;
  wardrobe: string;
  voiceTone: string;
  /**
   * Copy-ready character-sheet image prompt for EXTERNAL image models
   * (Midjourney, Imagen UI, …): "[Subject]. 360-degree character sheet
   * turnaround: front view, side profile view, back view, and extreme face
   * close-up. [Style]. Pure white background. Empty hands, no props. 4K
   * resolution." Optional so characters persisted before this field shipped
   * stay fully readable.
   */
  imagePrompt?: string;
  /** Director-facing narrative description of the character (1–2 sentences). */
  narrativeDescription?: string;
}

export interface VideoLocation {
  id: string;
  name: string;
  description: string;
}

export interface VideoStyle {
  lookAndMood: string;
  colorGrade: string;
  filmStock: string;
  aspectRatio: string;
}

export interface VideoEffects {
  vfxDirection: string;
  particleDensity: string;
  pacing: string;
}

export interface StoryBible {
  characters: VideoCharacter[];
  locations: VideoLocation[];
  style?: VideoStyle;
  effects?: VideoEffects;
  continuityLog: string[];
}

export interface VideoShot {
  id: string;
  shotNumber: number;
  description: string;
  promptText: string;
  continuityHandoff: string;
  durationSeconds: number;
  confirmed: boolean;
  createdAt: number;
  /**
   * Story Bible character ids explicitly locked to this shot (drag a cast
   * member from the sidebar onto a shot). Dialect adapters use these to inject
   * the character's saved reference image into the video-model payload.
   * Optional — shots persisted before this field existed stay readable.
   */
  characterIds?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

/**
 * A file attached to a shot-drafting message. Clients send these as data URLs
 * (converted from the AI SDK file parts in the chat input); the server routes
 * them through routeMultimodalContext before the main model call.
 */
export interface VideoChatFile {
  filename: string;
  mediaType: string;
  /** data URL (base64) payload — images, PDFs, etc. */
  dataUrl: string;
}

/**
 * A character reference image saved to the local Story Bible store
 * (IndexedDB, with a LocalStorage fallback). Stored compressed as WebP to
 * keep the browser memory footprint bounded.
 */
export interface StoryBibleCharacterImage {
  id: string;
  projectId: string;
  /** VideoCharacter.id this image locks, when known. */
  characterId?: string;
  characterName: string;
  /** The character-sheet image prompt that produced this image. */
  imagePrompt: string;
  /** Compressed WebP blob — used by the IndexedDB path (structured clone). */
  imageBlob?: Blob | null;
  /** Data URL mirror — used by the LocalStorage fallback path. */
  imageDataUrl?: string;
  timestamp: number;
}

/**
 * A shot proposal drafted by the chat assistant, parsed from the structured
 * JSON block the model emits per turn (Phase 4). "Approve" promotes it into a
 * confirmed VideoShot on the project; "Request Revision" re-drafts it.
 */
export interface DraftedShot {
  /** Sequential shot number — continues from the project's last confirmed shot. */
  shotNumber: number;
  /** One-line storyboard summary. */
  description: string;
  /** The full 6-part shot prompt (Subject · Action · Camera · Lighting · Environment · Lens). */
  promptText: string;
  /** Subject + camera ending state handed to the next shot. */
  continuityHandoff: string;
  /** Target clip duration in seconds (8–30). */
  durationSeconds: number;
}

export interface VideoProject {
  id: string;
  name: string;
  customInstructions: string;
  status: ProjectStatus;
  storyBible: StoryBible;
  shots: VideoShot[];
  chatHistory: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export type ThinkingOrbState =
  | 'working'
  | 'searching'
  | 'solving'
  | 'connecting'
  | 'weaving'
  | 'composing'
  | 'shaping'
  | 'breathing'
  | 'listening';
