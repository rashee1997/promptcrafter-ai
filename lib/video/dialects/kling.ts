// Video Prompt Studio — Phase 5 Kling dialect adapter (target product: Kling 3.0).
// Pure, deterministic re-expression of the stored 6-part universal shot prompt
// in director-note style: a prose camera note, a character-physics cue, and a
// multi-shot voice binding with a lip-sync cue line whenever a character in
// the shot carries a voiceTone in the Story Bible.

import type { VideoCharacter, VideoShot } from '@/types/video';
import {
  asSentence,
  findPromptCharacters,
  parseUniversalPrompt,
  shotReferenceImages,
  type VideoReferenceImage,
} from './shared';

export const KLING_DIALECT = {
  id: 'kling',
  label: 'Kling 3.0',
  hint: 'Director notes + character physics cues',
} as const;

export interface KlingOptions {
  characters?: VideoCharacter[];
  referenceImages?: VideoReferenceImage[];
}

/**
 * Re-expresses the stored 6-part universal shot prompt in the Kling dialect.
 * The camera line is framed as a director note, the Subject anchors a physics
 * cue, and the handoff line closes the note so multi-shot chains stay bound.
 */
export function formatKlingShot(shot: VideoShot, options?: KlingOptions): string {
  const parts = parseUniversalPrompt(shot.promptText);
  const cast = findPromptCharacters(shot, options?.characters);
  const speaker = cast.find((c) => c.voiceTone && c.voiceTone.trim());

  const lines = [
    asSentence(`DIRECTOR NOTE — Camera: ${parts.camera}`),
    '',
    asSentence(`${parts.subject}, ${parts.action}`),
    asSentence(`PHYSICS — Hold ${parts.subject} grounded: real mass, motivated movement, nothing floats`),
    `LIGHTING — ${parts.lighting}`,
    `ENVIRONMENT — ${parts.environment}`,
    `LENS — ${parts.lens}`,
  ];

  if (speaker) {
    lines.push(
      '',
      `VOICE BINDING — ${speaker.name} speaks with "${speaker.voiceTone}"; bind the same voice across every shot this character appears in.`,
      `LIP-SYNC CUE — animate ${speaker.name}'s lips to the dialogue line; delivery matches "${speaker.voiceTone}".`
    );
  } else {
    lines.push(
      '',
      'VOICE BINDING — no dialogue in this shot; ambience and score carry the beat across cuts.'
    );
  }

  const refs = shotReferenceImages(shot, options?.referenceImages);
  if (refs.length > 0) {
    lines.push('', ...refs.map((r) => `FIRST-FRAME REFERENCE (image_url) — ${r.characterName}: ${r.dataUrl}`));
  }

  const handoff = shot.continuityHandoff?.trim();
  if (handoff) {
    lines.push('', `CONTINUITY — ${handoff}`);
  }

  return lines.join('\n');
}
