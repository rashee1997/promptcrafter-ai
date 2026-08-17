// Video Prompt Studio — Phase 5 Higgsfield dialect adapter
// (target product: Higgsfield / Soul ID).
// Pure, deterministic re-expression of the stored 6-part universal shot prompt
// as direct narrative prose with explicit ID tags. Character names anchored in
// the shot text (always verbatim Story Bible names per Phase 4 Rule 4) get
// [SoulID: <name>] weight tokens; without a bible list the Subject block is
// used as the anchor.

import type { VideoCharacter, VideoShot } from '@/types/video';
import { asSentence, findPromptCharacters, parseUniversalPrompt } from './shared';

export const HIGGSFIELD_DIALECT = {
  id: 'higgsfield',
  label: 'Higgsfield / Soul ID',
  hint: 'Narrative prose + [SoulID] identity anchors',
} as const;

export interface HiggsfieldOptions {
  characters?: VideoCharacter[];
}

/**
 * Re-expresses the stored 6-part universal shot prompt in the Higgsfield
 * dialect: one narrative sentence per block, inline [Camera: …] tags, and a
 * [SoulID: <name>] token for every character named in the prompt.
 */
export function formatHiggsfieldShot(shot: VideoShot, options?: HiggsfieldOptions): string {
  const parts = parseUniversalPrompt(shot.promptText);
  const cast = findPromptCharacters(shot, options?.characters);
  const anchors = cast
    .map((c) => `[SoulID: ${c.name}]`)
    .join(' ');

  const lines = [
    `[Camera: ${parts.camera}]`,
    asSentence(`${parts.subject}, ${parts.action}`),
    asSentence(`The lighting is ${parts.lighting}`),
    asSentence(`The environment is ${parts.environment}`),
    asSentence(`Shot on ${parts.lens}`),
    anchors,
  ];

  return lines.filter((line) => line.trim().length > 0).join('\n');
}
