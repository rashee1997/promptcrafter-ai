// Video Prompt Studio — Phase 5 shared dialect helpers.
// One deterministic parser for the stored 6-part universal shot prompt
// (SUBJECT · ACTION · CAMERA · LIGHTING · ENVIRONMENT · LENS) plus a small
// character-matcher used by the Higgsfield / Kling adapters. Purely derived
// at view/copy time — the stored promptText is never modified.

import type { VideoCharacter, VideoShot } from '@/types/video';

/**
 * A locked character's saved reference image, resolved to a base64 data URL
 * at render time. Dialect adapters inject these into the exact reference
 * parameter their target video model expects (image_url / reference images).
 */
export interface VideoReferenceImage {
  characterId: string;
  characterName: string;
  dataUrl: string;
}

export interface UniversalPromptParts {
  subject: string;
  action: string;
  camera: string;
  lighting: string;
  environment: string;
  lens: string;
}

const LABELS = ['SUBJECT', 'ACTION', 'CAMERA', 'LIGHTING', 'ENVIRONMENT', 'LENS'] as const;

/**
 * Splits promptText on its labeled lines (the Phase 4 system prompt emits each
 * part on its own `LABEL:` line). Multi-line values are joined; a missing
 * label falls back to the Subject/Action block (and that block falls back to
 * the whole text) so a section is never emitted empty and no content is lost.
 */
export function parseUniversalPrompt(text: string): UniversalPromptParts {
  const whole = text?.trim() || '';
  const lines = whole.replace(/\r\n/g, '\n').split('\n');

  const sections: Record<string, string[]> = {
    SUBJECT: [],
    ACTION: [],
    CAMERA: [],
    LIGHTING: [],
    ENVIRONMENT: [],
    LENS: [],
  };
  let current: string | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const match = line.match(/^([A-Z]+)\s*:\s*(.*)$/i);
    const label = match ? match[1].toUpperCase() : '';
    if ((LABELS as readonly string[]).includes(label)) {
      current = label;
      const value = match![2].trim();
      if (value) sections[current].push(value);
    } else if (current) {
      sections[current].push(line);
    } else {
      // Preamble before the first label — treat as part of the subject block.
      sections.SUBJECT.push(line);
    }
  }

  const join = (key: string) => sections[key].join(' ');
  const subjectBlock = join('SUBJECT') || join('ACTION') || whole;
  const actionBlock = join('ACTION') || join('SUBJECT') || whole;

  return {
    subject: subjectBlock,
    action: actionBlock,
    camera: join('CAMERA') || subjectBlock,
    lighting: join('LIGHTING') || subjectBlock,
    environment: join('ENVIRONMENT') || subjectBlock,
    lens: join('LENS') || subjectBlock,
  };
}

/**
 * The reference images explicitly locked to this shot (via characterIds).
 * Deterministic — only ids dropped onto the shot are returned, so a character
 * mentioned in prose but not locked never injects a payload.
 */
export function shotReferenceImages(
  shot: VideoShot,
  referenceImages?: VideoReferenceImage[]
): VideoReferenceImage[] {
  const locked = new Set(shot.characterIds ?? []);
  return (referenceImages ?? []).filter((r) => locked.has(r.characterId));
}

/** Joins text into one sentence, avoiding doubled terminal punctuation. */
export function asSentence(text: string): string {
  const trimmed = text?.trim() || '';
  return `${trimmed.replace(/[.!?]+$/, '')}.`;
}

/**
 * Story Bible characters whose exact names appear in the shot's stored text.
 * Phase 4 Rule 4 guarantees character names are verbatim in promptText, so a
 * plain substring match is deterministic and drift-safe. Falls back to the
 * Subject block when no bible list is provided.
 */
export function findPromptCharacters(
  shot: VideoShot,
  characters?: VideoCharacter[]
): VideoCharacter[] {
  const haystack = `${shot.promptText}\n${shot.description ?? ''}`.toLowerCase();
  const matched = (characters ?? []).filter(
    (c) => c.name && c.name.trim() && haystack.includes(c.name.trim().toLowerCase())
  );
  if (matched.length > 0) return matched;
  const subject = parseUniversalPrompt(shot.promptText).subject;
  return subject ? [{ id: '', name: subject, role: '', appearance: '', wardrobe: '', voiceTone: '' }] : [];
}
