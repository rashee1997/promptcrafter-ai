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
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
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
