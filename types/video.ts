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
