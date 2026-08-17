// Video Prompt Studio — Phase 5 Veo dialect adapter (target product: Veo 3.1 / Flow).
// Pure, deterministic re-expression of the stored 6-part universal shot prompt
// as structural ingredient tags. The camera line becomes an explicit vector
// path ([Motion: …]) whenever it contains movement language; the lens line is
// re-homed under [Style: …]; the clip length is appended as a duration flag.
// No AI generation call, no model id — this only formats already-stored text.

import type { VideoShot } from '@/types/video';
import { parseUniversalPrompt } from './shared';

export const VEO_DIALECT = {
  id: 'veo',
  label: 'Veo 3.1 / Flow',
  hint: 'Structural tags + motion vectors',
} as const;

/** Camera language that implies an explicit camera vector path. */
const MOTION_KEYWORDS =
  /\b(dolly|pan|crane|push|track|tilt|zoom|whip|handheld|orbit|arc|follow|drift|rise|descend|pull)\b/i;

/** Emits [Motion: …] only when the camera line carries movement. */
function motionTag(camera: string): string {
  return MOTION_KEYWORDS.test(camera) ? `[Motion: ${camera}]` : '';
}

/** Audio beat cue — deterministic dialect scaffold, never invented content. */
function audioCue(parts: ReturnType<typeof parseUniversalPrompt>): string {
  const beat = parts.action.split('.')[0].trim();
  return `[Audio: beat resolves on "${beat || 'the action peak'}"]`;
}

/**
 * Re-expresses the stored 6-part universal shot prompt in the Veo dialect:
 * every section appears as an ingredient tag; nothing is summarized.
 */
export function formatVeoShot(shot: VideoShot): string {
  const parts = parseUniversalPrompt(shot.promptText);
  const lines = [
    `[Subject: ${parts.subject}]`,
    `[Action: ${parts.action}]`,
    audioCue(parts),
    `[Camera: ${parts.camera}]`,
    motionTag(parts.camera),
    `[Lighting: ${parts.lighting}]`,
    `[Environment: ${parts.environment}]`,
    `[Style: ${parts.lens}]`,
    `[Duration: ${Math.round(shot.durationSeconds || 12)}s]`,
  ].filter(Boolean);

  return lines.join('\n');
}
