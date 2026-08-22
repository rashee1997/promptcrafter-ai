// Video Prompt Studio — Phase 4 action-beat decomposer.
// A described action beat becomes a reviewable ~16-cell shot breakdown
// (wide → shoulder-mount → ECU → hero-pose rhythm, one motion per shot),
// surfaced in the chat thread as "Break this into an action sequence,"
// accepted/edited/discarded before anything is actually drafted.
//
// The decomposer is pure: no AI calls, no model dependencies. It uses a
// deterministic rhythm template and the director's described beat to produce
// a structured ActionBeatDecomposition the UI can render and the director
// can approve, edit, or discard.

import type {
  ActionBeatCell,
  ActionBeatDecomposition,
  VideoCharacter,
} from '@/types/video';

/**
 * The canonical action-sequence rhythm. Each entry defines a framing type,
 * a relative duration weight, and a camera-move archetyle. The decomposer
 * maps a director's described action beat onto this rhythm, producing one
 * cell per entry. The pattern is: establish wide → push into mid → tight
 * detail → ECU emphasis → pull back for hero pose → reaction/aftermath.
 */
const RHYTHM_TEMPLATE: Omit<ActionBeatCell, 'cellNumber' | 'motion' | 'usesIdentityLock'>[] = [
  { framing: 'wide establishing', durationSeconds: 4, cameraMove: 'slow dolly-in or static wide' },
  { framing: 'medium tracking', durationSeconds: 3, cameraMove: 'lateral track following subject' },
  { framing: 'shoulder-mount following', durationSeconds: 3, cameraMove: 'handheld follow from behind' },
  { framing: 'medium close-up', durationSeconds: 2, cameraMove: 'subtle push-in' },
  { framing: 'extreme close-up detail', durationSeconds: 2, cameraMove: 'static or slow drift' },
  { framing: 'insert / cutaway', durationSeconds: 1.5, cameraMove: 'static lock-off' },
  { framing: 'wide re-establishing', durationSeconds: 3, cameraMove: 'crane up or pull back' },
  { framing: 'medium reaction', durationSeconds: 2, cameraMove: 'slow pan to face' },
  { framing: 'close-up face / hands', durationSeconds: 2, cameraMove: 'gentle push-in' },
  { framing: 'extreme close-up emphasis', durationSeconds: 1.5, cameraMove: 'macro drift' },
  { framing: 'shoulder-mount intensity', durationSeconds: 2, cameraMove: 'handheld tighten' },
  { framing: 'medium wide resolution', durationSeconds: 3, cameraMove: 'slow track out' },
  { framing: 'hero pose / lock-off', durationSeconds: 3, cameraMove: 'static or slow push' },
  { framing: 'wide aftermath', durationSeconds: 2.5, cameraMove: 'crane or static wide' },
  { framing: 'ECU final beat', durationSeconds: 1.5, cameraMove: 'slow drift or static' },
  { framing: 'wide exit / hold', durationSeconds: 2, cameraMove: 'slow pull back or static' },
];

/**
 * Decomposes a described action beat into a reviewable ~16-cell shot
 * breakdown. The motion descriptions are derived deterministically from the
 * source beat text — each cell gets a plausible slice of the action.
 *
 * The rhythm template ensures the sequence has cinematic shape (wide → mid
 * → tight → wide → hero → aftermath) instead of repeating the same framing.
 * Every cell is marked with `usesIdentityLock: true` so the UI and the
 * drafting system prompt can verify the identity-lock block re-injects on
 * every shot in the action sequence.
 *
 * @param sourceBeat - The director's described action beat.
 * @param characters - Story Bible characters present in this beat (for
 *   generating plausible character-specific motion descriptions).
 * @returns A structured decomposition the director can review.
 */
export function decomposeActionBeat(
  sourceBeat: string,
  characters?: VideoCharacter[],
): ActionBeatDecomposition {
  const beat = sourceBeat.trim();
  const charNames = characters?.map((c) => c.name).filter(Boolean) ?? [];
  const subject = charNames.length > 0 ? charNames[0] : 'the subject';

  // Split the source beat into plausible action phrases by sentence/clause.
  const phrases = splitIntoPhrases(beat);

  const cells: ActionBeatCell[] = RHYTHM_TEMPLATE.map((template, i) => {
    const phrase = phrases[i % phrases.length] ?? phrases[0] ?? beat;
    const cellNumber = i + 1;
    const durationSeconds = template.durationSeconds;

    return {
      cellNumber,
      framing: template.framing,
      motion: deriveMotion(phrase, template.framing, subject, i),
      durationSeconds,
      cameraMove: template.cameraMove,
      usesIdentityLock: true, // Every shot in an action sequence MUST carry identity lock
    };
  });

  return {
    sourceBeat: beat,
    cells,
  };
}

/**
 * Splits a beat description into individual action phrases. Handles sentence
 * boundaries, semicolons, em-dashes, and comma-separated lists.
 */
function splitIntoPhrases(text: string): string[] {
  // Split on sentence boundaries, semicolons, em-dashes, and "then"/"and then"
  const raw = text
    .replace(/;\s*/g, '. ')
    .replace(/\s*[—–]\s*/g, '. ')
    .replace(/\bthen\b/gi, '. ')
    .replace(/\band then\b/gi, '. ')
    .replace(/\.\./g, '.');

  return raw
    .split(/\.\s+/)
    .map((s) => s.replace(/^\s*and\s+/i, '').trim())
    .filter((s) => s.length > 2);
}

/**
 * Derives a plausible motion description for a cell by combining a slice of
 * the source beat with the framing-specific camera language. This is a
 * deterministic, best-effort derivation — the director is expected to review
 * and refine before approving.
 */
function deriveMotion(
  phrase: string,
  framing: string,
  subject: string,
  index: number,
): string {
  const framingHint = framing.toLowerCase();

  if (framingHint.includes('wide') || framingHint.includes('re-establish')) {
    return `${subject} in the wider space — ${lowerFirst(phrase)}`;
  }
  if (framingHint.includes('shoulder')) {
    return `Following ${subject} from behind — ${lowerFirst(phrase)}`;
  }
  if (framingHint.includes('extreme close') || framingHint.includes('ecu') || framingHint.includes('macro')) {
    return `Tight on the critical detail — ${lowerFirst(phrase)}`;
  }
  if (framingHint.includes('close-up') || framingHint.includes('cu')) {
    return `On ${subject}'s face or hands — ${lowerFirst(phrase)}`;
  }
  if (framingHint.includes('insert') || framingHint.includes('cutaway')) {
    return `Cutaway to the key object or detail — ${lowerFirst(phrase)}`;
  }
  if (framingHint.includes('hero')) {
    return `${subject} locks into the hero pose — ${lowerFirst(phrase)}`;
  }
  if (framingHint.includes('reaction')) {
    return `${subject} reacts — ${lowerFirst(phrase)}`;
  }

  // Default: medium framing
  return `${lowerFirst(phrase)}`;
}

function lowerFirst(s: string): string {
  if (!s) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}
