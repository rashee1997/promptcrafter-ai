// Video Prompt Studio — Phase 3 bootstrap pipeline wire types.
// Client-safe (no `ai`/`zod` imports): used by lib/ai-client.ts, the bootstrap
// API routes, and the wizard/step components. Stage outputs map 1:1 onto the
// StoryBible contracts in types/video.ts.

import type { ProviderConfig } from '@/types';
import type {
  ScriptTreatment,
  VideoCharacter,
  VideoEffects,
  VideoLocation,
  VideoStyle,
} from '@/types/video';

export type VideoBootstrapStage = 1 | 2 | 3 | 4 | 5;

/** Stage 1 output — script treatment. Defined in types/video.ts because
 *  VideoProject persists a creation-time draft of it. */
export type { ScriptTreatment };

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
  characters?: VideoCharacter[] | null;
  locations?: VideoLocation[] | null;
  style?: StyleCandidate | null;
  effects?: EffectsCandidate | null;
}

/** POST /api/video-bootstrap body. */
export interface VideoBootstrapRequest {
  stage: VideoBootstrapStage;
  intent: string;
  customInstructions?: string;
  previousContext?: BootstrapContext;
  revisionPrompt?: string;
  provider: ProviderConfig;
}

/** POST /api/video-bootstrap response — typed per stage. */
export type VideoBootstrapResponse =
  | { stage: 1; data: ScriptTreatment }
  | { stage: 2; data: CharactersProposal }
  | { stage: 3; data: ScenesProposal }
  | { stage: 4; data: StyleProposal }
  | { stage: 5; data: EffectsProposal };

/** POST /api/suggest-video-location body — ad-hoc location scouting. */
export interface SuggestVideoLocationRequest {
  intent: string;
  script?: ScriptTreatment | null;
  style?: StyleCandidate | null;
  existingLocations?: VideoLocation[] | null;
  provider: ProviderConfig;
}
