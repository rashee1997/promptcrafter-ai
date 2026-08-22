// Video Prompt Studio — Phase 3 bootstrap pipeline wire types.
// Client-safe (no `ai`/`zod` imports): used by lib/ai-client.ts, the bootstrap
// API routes, and the wizard/step components. Stage outputs map 1:1 onto the
// StoryBible contracts in types/video.ts.

import type { ProviderConfig } from '@/types';
import type {
  ScriptTreatment,
  StoryTreatment,
  ScriptDialogueDraft,
  ScreenplayScene,
  DirectionPlan,
  VideoCharacter,
  VideoEffects,
  VideoLocation,
  VideoStyle,
} from '@/types/video';

/**
 * Phase B — the wizard now has 10 internal steps (0–9). Stage 0 is the
 * UI-only platform picker; Stages 1–9 are the AI generation pipeline.
 */
export type VideoBootstrapStage = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/**
 * The server-side API handles AI generation stages 1–8. The platform
 * picker (Stage 0) never hits the API.
 */
export type APIBootstrapStage = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/** Stage 1 output — script treatment. Defined in types/video.ts because
 *  VideoProject persists a creation-time draft of it. */
export type { ScriptTreatment };
export type { StoryTreatment };
export type { ScriptDialogueDraft };
export type { ScreenplayScene };
export type { DirectionPlan };

/** Stage 4 candidate — a visual style option (VideoStyle + picker metadata). */
export interface StyleCandidate extends VideoStyle {
  id: string;
  name: string;
}

/** Stage 5 candidate — a VFX direction option (VideoEffects + picker metadata). */
export interface EffectsCandidate extends VideoEffects {
  id: string;
  name: string;
}

export interface CharactersProposal {
  characters: VideoCharacter[];
}

export interface ScenesProposal {
  locations: VideoLocation[];
}

export interface StyleProposal {
  options: StyleCandidate[];
}

export interface EffectsProposal {
  options: EffectsCandidate[];
}

/** Everything confirmed by earlier stages — threaded into later prompts. */
export interface BootstrapContext {
  customInstructions?: string;
  script?: ScriptTreatment | null;
  storyTreatment?: StoryTreatment | null;
  scriptDialogue?: ScriptDialogueDraft | null;
  screenplay?: ScreenplayScene[] | null;
  directionPlan?: DirectionPlan | null;
  characters?: VideoCharacter[] | null;
  locations?: VideoLocation[] | null;
  style?: StyleCandidate | null;
  effects?: EffectsCandidate | null;
}

/** POST /api/video-bootstrap body — only AI generation stages (1–8). */
export interface VideoBootstrapRequest {
  stage: APIBootstrapStage;
  intent: string;
  customInstructions?: string;
  previousContext?: BootstrapContext;
  revisionPrompt?: string;
  provider: ProviderConfig;
  /**
   * Phase E4 — for stage 7 (style), the curated library entry the
   * director selected. When present, the AI tailors this entry instead
   * of inventing from scratch.
   */
  styleLibraryId?: string;
  /**
   * Structure framework id for stage 1 (story). When present, the AI
   * is constrained to produce beats matching the framework's named beats.
   */
  frameworkId?: string;
}

/** POST /api/video-bootstrap response — typed per stage (1–8). */
export type VideoBootstrapResponse =
  | { stage: 1; data: StoryTreatment }
  | { stage: 2; data: ScriptDialogueDraft }
  | { stage: 3; data: ScreenplayScene[] }
  | { stage: 4; data: DirectionPlan }
  | { stage: 5; data: CharactersProposal }
  | { stage: 6; data: ScenesProposal }
  | { stage: 7; data: StyleProposal }
  | { stage: 8; data: EffectsProposal };

/** POST /api/suggest-video-location body — ad-hoc location scouting. */
export interface SuggestVideoLocationRequest {
  intent: string;
  script?: ScriptTreatment | null;
  style?: StyleCandidate | null;
  existingLocations?: VideoLocation[] | null;
  provider: ProviderConfig;
}
