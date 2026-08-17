// Video Prompt Studio — Phase 5 Veo dialect adapter (target product: Veo 3.1 / Flow).
// Pure, deterministic re-expression of the stored 6-part universal shot prompt
// as structural ingredient tags. The camera line becomes an explicit vector
// path ([Motion: …]) whenever it contains movement language; the lens line is
// re-homed under [Style: …]; the clip length is appended as a duration flag.
// No AI generation call, no model id — this only formats already-stored text.

import type { VideoShot } from '@/types/video';
import {
  parseUniversalPrompt,
  shotReferenceImages,
  type VideoReferenceImage,
} from './shared';

export const VEO_DIALECT = {
  id: 'veo',
  label: 'Veo 3.1 / Flow',
  hint: 'Structural tags + motion vectors',
} as const;

export interface VeoOptions {
  referenceImages?: VideoReferenceImage[];
}

/** Camera language that implies an explicit camera vector path. */
const MOTION_KEYWORDS =
  /\b(dolly|pan|crane|push|track|tilt|zoom|whip|handheld|orbit|arc|follow|drift|rise|descend|pull)\b/i;

/** Emits [Motion: …] only when the camera line carries movement. */
function motionTag(camera: string): string {
  return MOTION_KEYWORDS.test(camera) ? `[Motion: ${camera}]` : '';
}

/**
 * Dialogue lines in Veo's documented safe form: "speaker says: line" with a
 * colon and NO quotes around the line — the colon form avoids Veo's
 * baked-in-subtitle failure mode. A silent shot gets an explicit ambience cue.
 */
function dialogueLines(shot: VideoShot): string[] {
  if (!shot.dialogue?.length) {
    return ['[Audio: ambience + score, no dialogue this shot]'];
  }
  return shot.dialogue.map(
    (d) => `[Dialogue] ${d.speaker} says: ${d.line}${d.tone ? ` (${d.tone})` : ''}`
  );
}

/**
 * Re-expresses the stored 6-part universal shot prompt in the Veo dialect:
 * every section appears as an ingredient tag; nothing is summarized. Real
 * dialogue (when present) is emitted as its own block — never a copy of the
 * action beat — plus the subtitle guard and the shot's negative prompt. Locked
 * character reference images are appended as reference-image tags (the Veo
 * API's imageUrl-style parameter payload).
 */
export function formatVeoShot(shot: VideoShot, options?: VeoOptions): string {
  const parts = parseUniversalPrompt(shot.promptText);
  const lines = [
    `[Subject: ${parts.subject}]`,
    `[Action: ${parts.action}]`,
    `[Camera: ${parts.camera}]`,
    motionTag(parts.camera),
    `[Lighting: ${parts.lighting}]`,
    `[Environment: ${parts.environment}]`,
    `[Style: ${parts.lens}]`,
    `[Duration: ${Math.round(shot.durationSeconds || 12)}s]`,
    ...dialogueLines(shot),
    shot.dialogue?.length ? '[No subtitles, no text overlay]' : '',
    shot.negativePrompt ? `[Negative: ${shot.negativePrompt}]` : '',
    ...shotReferenceImages(shot, options?.referenceImages).map(
      (r) => `[Reference image: ${r.characterName}] — image_url: ${r.dataUrl}`
    ),
  ].filter(Boolean);

  return lines.join('\n');
}
