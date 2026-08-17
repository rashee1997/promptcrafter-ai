// Video Prompt Studio — Phase 5 Seedance dialect adapter (target product: Seedance 2.0).
// Pure, deterministic re-expression of the stored 6-part universal shot prompt
// as a prompt + reference-frame + audio-marker block. The camera line is
// wrapped as a spatial-offset note, a [Ref: shot-<n>_frame] placeholder links
// the exported reference frame, and the handoff line keeps the frame chain
// coherent across shots.

import type { VideoShot } from '@/types/video';
import {
  asSentence,
  parseUniversalPrompt,
  shotReferenceImages,
  type VideoReferenceImage,
} from './shared';

export const SEEDANCE_DIALECT = {
  id: 'seedance',
  label: 'Seedance 2.0',
  hint: 'Reference-frame + audio markers',
} as const;

export interface SeedanceOptions {
  referenceImages?: VideoReferenceImage[];
}

/**
 * Audio marker block — driven by REAL dialogue when the shot has it; a silent
 * shot falls back to a plain score + ambience bed (never a copy of the action
 * beat mislabeled as sound).
 */
function audioMarker(shot: VideoShot): string[] {
  if (!shot.dialogue?.length) {
    return ['AUDIO — score + ambience bed; no dialogue this shot.'];
  }
  return [
    ...shot.dialogue.map(
      (d) => `DIALOGUE — ${d.speaker}: "${d.line}"${d.tone ? ` (${d.tone})` : ''}`
    ),
    'AUDIO — the spoken dialogue above, synced to mouth movement; score + ambience bed under it.',
  ];
}

/**
 * Re-expresses the stored 6-part universal shot prompt in the Seedance
 * dialect. `[Ref: shot-<n>_frame]` is a placeholder for the frame exported
 * with this shot; swap the number for the real asset filename at export time.
 * Locked character reference images append as image_url payload lines.
 */
export function formatSeedanceShot(shot: VideoShot, options?: SeedanceOptions): string {
  const parts = parseUniversalPrompt(shot.promptText);
  const lines = [
    asSentence(`PROMPT — ${parts.subject}, ${parts.action}`),
    `CAMERA — (Camera: ${parts.camera})`,
    `LIGHTING — ${parts.lighting}`,
    `ENVIRONMENT — ${parts.environment}`,
    `LENS — ${parts.lens}`,
    `REFERENCE FRAME — [Ref: shot-${Math.round(shot.shotNumber || 0)}_frame]`,
    ...audioMarker(shot),
    shot.negativePrompt ? `NEGATIVE — ${shot.negativePrompt}` : '',
    ...shotReferenceImages(shot, options?.referenceImages).map(
      (r) => `REFERENCE IMAGE — ${r.characterName} (image_url): ${r.dataUrl}`
    ),
  ];

  const handoff = shot.continuityHandoff?.trim();
  if (handoff) {
    lines.push(`CONTINUITY — ${handoff}`);
  }

  return lines.join('\n');
}
