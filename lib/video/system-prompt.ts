// Video Prompt Studio — Phase 4 shot-drafting system prompt builder.
// Embeds the Directorial Brief, Story Bible digest, identity locks, scene
// defaults, the previous shot's handoff, the 6-part universal prompt
// architecture, the Director Skill rules, and the platform-specific clip
// ceiling per drafted shot.
//
// Director Skill (Phase 1): director craft rules, identity-vs-conditions
// continuity split, and shot function tags. Inspired by the "visual-skills"
// project by Serge Shima (CC-BY-4.0).
// https://github.com/smixs/visual-skills — all data shapes and prompt text
// below are our own; this is attribution, not copied content.

import type { VideoProject } from '@/types/video';
import {
  buildStoryBibleDigest,
  calculateShotHandoff,
  formatIdentityAnchors,
  formatSceneDefaults,
  nextShotNumber,
} from './story-bible';
import { getPlatformSpec } from './platforms';

const DIRECTOR_RULES = `DIRECTOR CRAFT:
- Every shot needs: one environmental-pressure detail (rain, flickering light, a cramped hallway — something in the space pushing on the character), one physical micro-action (a hand gripping something, a jaw tightening — not just "he moves"), and one sound/visual motif (something that recurs or means something). Missing all three = rewrite the shot.
- Before finishing a shot, check: does it change something emotionally, reveal new story info, move the plot, or justify a camera move? If none of these are true, cut or rework it.
- Tag the shot's function: Establish / Reveal / Power / Pressure / Detail / Reaction / Shift / Impact / Aftermath / Exit — so the whole storyboard has a shape, not just each shot in isolation.`;

const SIX_PART_ARCHITECTURE = `Every drafted shot prompt MUST be written as one complete, copy-ready shot prompt covering the 6-part universal architecture, each part on its own labeled line:
1. SUBJECT: who/what is in frame — always the exact character name(s) from the Story Bible, never a paraphrase or invented description.
2. ACTION: the motivated movement/beat in the __DURATION__ window, written as present-tense action.
3. CAMERA: one specific motivated camera move or static framing (e.g. slow dolly-in, whip pan, handheld push, static wide) that advances the emotion.
4. LIGHTING: the exact lighting/atmosphere treatment (locked visual style grade must be honored).
5. ENVIRONMENT: the exact location from the Story Bible with its fixed set dressing, never a new invented space.
6. LENS: concrete lens/focal-length language (e.g. 35mm close, 24mm wide, 85mm compression, anamorphic flare).`;

const OUTPUT_CONTRACT = `OUTPUT CONTRACT (strict):
- Reply conversationally to the director first — one or two short sentences of intent and reasoning.
- Then emit EXACTLY ONE fenced JSON block (no other JSON anywhere) with this shape:
\`\`\`json
{
  "shot": {
    "shotNumber": <integer, __NEXT_SHOT__ for a new draft>,
    "description": "<one-line storyboard summary>",
    "promptText": "<the full 6-part shot prompt from SUBJECT to LENS>",
    "continuityHandoff": "<subject + camera ending state + any scene-condition changes and WHY they changed, so the next shot inherits them instead of reverting>",
    "durationSeconds": <integer __DURATION_RANGE__>,
    "dialogue": [
      { "speaker": "<exact Story Bible name>", "line": "<short spoken line>", "tone": "<delivery, optional>" }
    ],
    "negativePrompt": "<3–5 short comma-separated terms, most-damaging artifact first, or empty string>",
    "emotion": "<the emotion this shot carries, one word or short phrase — e.g. guilt, resolve, quiet dread>",
    "shotFunction": "<one of: Establish, Reveal, Power, Pressure, Detail, Reaction, Shift, Impact, Aftermath, Exit>"
  }
}
\`\`\`
- durationSeconds is the target clip length and MUST be an integer between __DURATION_RANGE__ inclusive — never shorter than __DURATION_MIN__s, never longer than __DURATION_MAX__s. State the length when it matters to pacing.
- When the director asks you to revise the previous draft, re-emit the SAME shotNumber with the improved promptText; do not increment.
- When the director approves and asks for the next shot, increment by 1.
- Never re-number existing confirmed shots and never draft a shot that reuses an earlier shotNumber already confirmed in the storyboard.
- \`dialogue\` is a SEPARATE structured field: spoken lines NEVER go inside promptText. An empty array means the shot is silent (ambience + score carry it).
- \`negativePrompt\` is a SEPARATE structured field: "no X" clauses NEVER go inside promptText.
- \`emotion\` captures what the viewer should feel in this shot — it drives the emotional arc. Leave empty only if the shot is pure function (e.g. a pure Establish with no emotional weight).
- \`shotFunction\` is the dramatic role this shot plays in the sequence — it ensures the whole storyboard has a shape instead of repeating the same beat.`;

const DIALOGUE_RULES = `DIALOGUE RULES (Rule 6):
- dialogue is a SEPARATE structured field — never write spoken lines inside promptText.
- Every line's speaker must be an exact Story Bible character name (identity lock) — never invent a speaker.
- Keep each line short enough to be spoken within this shot's durationSeconds (~2–3 words per second is a safe ceiling); a line that reads longer than the shot will produce rushed or gibberish speech.
- Leave dialogue as an empty array for a silent shot — do not force dialogue that isn't motivated by the beat.
- For shots with 2+ speaking characters, make each speaker distinguishable by their locked Story Bible appearance, not just by name, since multi-character scenes are the most common source of crossed/misattributed lines.`;

const NEGATIVE_PROMPT_RULES = `NEGATIVE PROMPT RULES (Rule 7):
- negativePrompt is a SEPARATE field — never write "no X" clauses inside promptText.
- 3–5 short terms, comma-separated. Fewer under-constrains the model; more causes over-constraint artifacts.
- Order terms by how much each would ruin THIS shot — put the most damaging risk first.
- Always include the shot-appropriate baseline: blur, distorted anatomy, flickering, unstable motion, duplicate objects.
- If this shot has dialogue, also include: lip-sync misalignment, garbled speech, audio desync.
- If this shot has hands/props in frame, also include: floating hands, extra fingers, morphing objects.`;

/** Injects the next sequential shot number into the output contract. */
function withNextShot(contract: string, nextShot: number): string {
  return contract.replace('__NEXT_SHOT__', String(nextShot));
}

/** Injects duration placeholders into template strings. */
function withDuration(text: string, min: number, max: number): string {
  return text
    .replace(/__DURATION_RANGE__/g, `${min}–${max}`)
    .replace(/__DURATION_MIN__/g, String(min))
    .replace(/__DURATION_MAX__/g, String(max))
    .replace(/__DURATION__/g, `${min}–${max}s`);
}

/**
 * Builds the conversational system prompt for /api/video-chat. Every
 * generation call resolves the model separately via resolveVideoModel(); this
 * function only supplies the context the model must draft against.
 *
 * Phase 3 — when the project has a targetPlatform, the platform's
 * draftingSystemPromptBlock replaces the generic duration rule and injects
 * platform-specific dialogue/negative-prompt syntax.
 */
export function buildShotDraftingSystemPrompt(project: VideoProject): string {
  const bible = project.storyBible ?? { characters: [], locations: [], continuityLog: [] };
  const brief = project.customInstructions?.trim() || project.name || '(No brief supplied)';
  const nextShot = nextShotNumber(project);
  const lastShot = project.shots[project.shots.length - 1];

  // Phase 3 — look up the platform spec so the AI gets real constraints.
  const platformSpec = getPlatformSpec(project.targetPlatform);

  const durationMin = platformSpec?.durationCeilingSeconds ?? 30;
  const durationFloor = platformSpec ? Math.min(8, durationMin) : 8;
  const durationMax = platformSpec?.durationCeilingSeconds ?? 30;

  const platformBlock = platformSpec
    ? `\n${platformSpec.draftingSystemPromptBlock}\n`
    : '';

  const rules = withDuration(
    `HARD RULES:
1. Inspect the Story Bible BEFORE drafting. Character names, visual descriptions, wardrobe, location names, environment descriptions, the locked visual style, and the locked VFX direction are NON-NEGOTIABLE and must appear verbatim — never invent a new character, a new location, or a different grade.
2. ${SIX_PART_ARCHITECTURE}
3. Clip ceiling: every shot is ${durationFloor}–${durationMax} seconds. Compose the action so it fits the chosen duration; never draft a shot that implies longer.
4. Keep visual style + VFX direction locked: shots may not change color grade, film stock, aspect ratio, particle density, or pacing.
5. Continuity: each shot's continuityHandoff describes where the subject and camera end AND any scene-condition changes (wardrobe, weather, time-of-day) with the reason they changed, so the next shot can pick up without drift.
6. Anchor every hand/prop interaction to a concrete object — never describe a hand or limb moving in empty space; give it something specific to hold, touch, or rest on (jittery/floating limbs are the #1 single-shot glitch).
7. Do not stack contradictory descriptors in one section (e.g. "gritty realism" + "pristine, flawless skin") — pick one register per shot and hold it.
8. ${DIALOGUE_RULES}
9. ${NEGATIVE_PROMPT_RULES}`,
    durationFloor,
    durationMax,
  );

  return `You are the shot drafter on a short-form video production. You work inside the director's multi-turn drafting thread: you propose ONE sequential shot per turn, the director approves it into the storyboard or asks for a revision, and you keep character, setting, and visual style anchors perfectly stable across every shot.

DIRECTORIAL BRIEF:
${brief}

STORY BIBLE:
${buildStoryBibleDigest(bible)}

IDENTITY LOCK — reuse these EXACT strings every time, never change them:
${formatIdentityAnchors(bible)}

SCENE DEFAULTS — starting point for wardrobe and location conditions. You may evolve these across shots ONLY when the story motivates it (new day, after an event, weather turning for dramatic pressure). When you do, say so out loud in continuityHandoff so the next shot inherits the change instead of reverting:
${formatSceneDefaults(bible)}

CONTINUITY HANDOFF FROM THE STORYBOARD:
${calculateShotHandoff(lastShot)}

${DIRECTOR_RULES}

${rules}${platformBlock}
${withNextShot(withDuration(OUTPUT_CONTRACT, durationFloor, durationMax), nextShot)}`;
}
