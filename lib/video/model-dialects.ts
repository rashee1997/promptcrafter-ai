// Video Prompt Studio — Phase 5 dialect registry + router.
// The dialect layer is deterministic formatting of already-stored promptText:
// no model call translates a dialect, and the ids below are target-product
// labels only (where the prompt is pasted) — they never select an LLM.

import type { VideoCharacter, VideoShot } from '@/types/video';
import type { VideoReferenceImage } from './dialects/shared';
import { formatVeoShot } from './dialects/veo';
import { formatHiggsfieldShot } from './dialects/higgsfield';
import { formatKlingShot } from './dialects/kling';
import { formatSeedanceShot } from './dialects/seedance';

export interface VideoDialect {
  id: 'universal' | 'veo' | 'higgsfield' | 'kling' | 'seedance';
  label: string;
  hint: string;
}

export interface DialectFormatOptions {
  /** Story Bible cast — lets the Higgsfield / Kling adapters anchor names and voices. */
  characters?: VideoCharacter[];
  /**
   * Saved Story Bible character images (base64 data URLs) resolved for the
   * shot's locked characters. Adapters inject them into the target model's
   * reference-image parameter (image_url / reference images).
   */
  referenceImages?: VideoReferenceImage[];
  /**
   * Phase 5 — when false, the target platform lacks native dialogue audio
   * and an external voice track is needed. Adapters add a VOICE TRACK
   * routing note to the exported prompt. When true (or absent), dialogue
   * audio is baked into the video model's output.
   */
  nativeDialogueAudio?: boolean;
}

/** Registry — universal (the stored source of truth) first, then the four target dialects. */
export const VIDEO_DIALECTS: VideoDialect[] = [
  { id: 'universal', label: 'Universal', hint: 'The stored 6-part shot prompt verbatim — the source of truth.' },
  { id: 'veo', label: 'Veo 3.1 / Flow', hint: 'Structural tags + motion vectors' },
  { id: 'higgsfield', label: 'Higgsfield / Soul ID', hint: 'Narrative prose + [SoulID] identity anchors' },
  { id: 'kling', label: 'Kling 3.0', hint: 'Director notes + character physics cues' },
  { id: 'seedance', label: 'Seedance 2.0', hint: 'Reference-frame + audio markers' },
];

/**
 * Pure router: universal passes the stored promptText through verbatim; the
 * four adapters re-express it. Same shot + same dialect ⇒ same output.
 */
export function formatShotForDialect(
  shot: VideoShot,
  dialectId: VideoDialect['id'],
  options?: DialectFormatOptions
): string {
  switch (dialectId) {
    case 'veo':
      return formatVeoShot(shot, options);
    case 'higgsfield':
      return formatHiggsfieldShot(shot, options);
    case 'kling':
      return formatKlingShot(shot, options);
    case 'seedance':
      return formatSeedanceShot(shot, options);
    case 'universal':
    default:
      // Phase 5 — universal dialect also surfaces the voice-track note
      // when the platform lacks native dialogue audio, so the director
      // sees the routing requirement even in the source-of-truth view.
      if (options?.nativeDialogueAudio === false && shot.dialogue?.length) {
        return [
          shot.promptText?.trim() || '',
          '',
          'VOICE TRACK — this platform does not generate dialogue audio natively. Route each line through the external voice pipeline (CharacterVoice → audio generation → lip-sync placement) before the final video render.',
        ].join('\n');
      }
      return shot.promptText?.trim() || '';
  }
}
