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
  buildSceneScopedBibleDigest,
  buildStoryBibleDigest,
  calculateShotHandoff,
  formatIdentityAnchors,
  formatSceneDefaults,
  formatSceneScopedIdentityAnchors,
  formatSceneScopedSceneDefaults,
  nextShotNumber,
  type ShotSceneContext,
} from './story-bible';
import { getPlatformSpec } from './platforms';
import { getVisualStyle } from './styles';

/**
 * Maps character id → 1-based image index in the attached reference set.
 * When a character has an image, the identity anchor switches from
 * verbatim re-description to a short pointer (C2 — identity by reference).
 */
export interface CharacterImageRef {
  characterId: string;
  imageIndex: number; // 1-based, matches "image 1", "image 2", etc.
}

const DIRECTOR_RULES = `DIRECTOR CRAFT:
- Every shot needs: one environmental-pressure detail (rain, flickering light, a cramped hallway — something in the space pushing on the character), one physical micro-action (a hand gripping something, a jaw tightening — not just "he moves"), and one sound/visual motif (something that recurs or means something). Missing all three = rewrite the shot.
- Before finishing a shot, check: does it change something emotionally, reveal new story info, move the plot, or justify a camera move? If none of these are true, cut or rework it.
- Tag the shot's function: Establish / Reveal / Power / Pressure / Detail / Reaction / Shift / Impact / Aftermath / Exit — so the whole storyboard has a shape, not just each shot in isolation.
- Motion specificity: Every camera movement and subject movement MUST state concrete direction and speed (e.g. "the camera pushes in slowly, 30cm over the full clip", "drifting slowly left to right", "sharp whip pan left", "rapid vertical ascent"). Reject generic movement like "the camera moves in" or "she moves across the room".
- Emotion through physical cues: NEVER name an abstract emotion or feeling in promptText (e.g. do NOT write "she looks sad", "he is angry", "anxious expression"). Express emotion exclusively through concrete physical cues, micro-actions, and body language (e.g. "her jaw tightens", "his knuckles whiten gripping the glass", "rapid shallow breathing", "avoiding eye contact"). Store the emotional intent in the structured \`emotion\` field only.
- Single-take dialogue discipline: Shots containing dialogue MUST be drafted as a single continuous take with no internal cuts or implied perspective shifts. For continuous dialogue takes, write a single flowing paragraph in present tense with 4–8 descriptive sentences that keep framing and performance unbroken.
- Detail scaling with shot size: Description detail scales with shot scale. Close-ups and extreme close-ups require high-density micro-action, facial tension, skin texture, breath, and focal falloff details. Wide shots prioritize spatial geography, architectural depth, blocking, and silhouette.`;

const SIX_PART_ARCHITECTURE = `Every drafted shot prompt MUST be written as one complete, copy-ready shot prompt covering the 6-part universal architecture, each part on its own labeled line:
1. SUBJECT: who/what is in frame — always the exact character name(s) from the Story Bible, never a paraphrase or invented description.
2. ACTION: the motivated movement/beat in the __DURATION__ window, written as present-tense action.
3. CAMERA: one specific motivated camera move or static framing (e.g. slow dolly-in, whip pan, handheld push, static wide) that advances the emotion.
4. LIGHTING: the exact lighting/atmosphere treatment (locked visual style grade must be honored).
5. ENVIRONMENT: the exact location from the Story Bible with its fixed set dressing, never a new invented space.
6. LENS: __LENS_INSTRUCTION__`;

/** Phase E3 — camera vocabulary gates what the LENS section may contain. */
const LENS_INSTRUCTIONS: Record<string, string> = {
  cinematic: 'Concrete lens/focal-length language (e.g. 35mm close, 24mm wide, 85mm compression, anamorphic flare).',
  animated: 'Shot framing and movement language (e.g. wide establishing frame, slow push-in, tracking shot). Do NOT use film-stock or lens specs — they are meaningless for this style.',
  graphic: 'Composition and transition language only (e.g. balanced framing, rule of thirds, clean composition). No lens or camera movement details.',
};

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
- \`emotion\` captures what the viewer should feel in this shot — it drives the emotional arc. Store the emotion tag here only; NEVER write emotion words in promptText.
- \`shotFunction\` is the dramatic role this shot plays in the sequence — it ensures the whole storyboard has a shape instead of repeating the same beat.`;

const DIALOGUE_RULES = `DIALOGUE RULES (Rule 11):
- dialogue is a SEPARATE structured field — never write spoken lines inside promptText.
- Shots containing dialogue MUST be drafted as a single continuous take: write promptText as a single flowing present-tense paragraph (4–8 sentences) without implied internal cuts or perspective switching.
- Every line's speaker must be an exact Story Bible character name (identity lock) — never invent a speaker.
- Keep each line short enough to be spoken within this shot's durationSeconds (~2–3 words per second is a safe ceiling); a line that reads longer than the shot will produce rushed or gibberish speech.
- Leave dialogue as an empty array for a silent shot — do not force dialogue that isn't motivated by the beat.
- For shots with 2+ speaking characters, make each speaker distinguishable by their locked Story Bible appearance, not just by name, since multi-character scenes are the most common source of crossed/misattributed lines.`;

const NEGATIVE_PROMPT_RULES = `NEGATIVE PROMPT RULES (Rule 12):
- negativePrompt is a SEPARATE field — never write "no X" clauses inside promptText.
- 3–5 short terms, comma-separated. Fewer under-constrains the model; more causes over-constraint artifacts.
- Order terms by how much each would ruin THIS shot — put the most damaging risk first.
- Always include the shot-appropriate baseline: blur, distorted anatomy, flickering, unstable motion, duplicate objects.
- If this shot has dialogue, also include: lip-sync misalignment, garbled speech, audio desync.
- If this shot has hands/props in frame, also include: floating hands, extra fingers, morphing objects.`;

/** Truncates context so long bible fields never bloat the system prompt. */
function clip(text: string | null | undefined, max = 600): string {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

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
export function buildShotDraftingSystemPrompt(
  project: VideoProject,
  imageRefs?: CharacterImageRef[],
  shotContext?: ShotSceneContext,
): string {
  const bible = project.storyBible ?? { characters: [], locations: [], continuityLog: [] };
  const brief = project.customInstructions?.trim() || project.name || '(No brief supplied)';
  const nextShot = nextShotNumber(project);
  const lastShot = project.shots[project.shots.length - 1];

  // Phase E3 — look up the visual style from the curated library.
  const styleLib = project.storyBible?.style?.styleId
    ? getVisualStyle(project.storyBible.style.styleId)
    : null;
  const cameraVocab = project.storyBible?.style?.cameraVocabulary ?? 'cinematic';
  const lensInstruction = LENS_INSTRUCTIONS[cameraVocab] ?? LENS_INSTRUCTIONS.cinematic;

  // Phase 3 — look up the platform spec so the AI gets real constraints.
  const platformSpec = getPlatformSpec(project.targetPlatform);

  const durationMin = platformSpec?.durationCeilingSeconds ?? 30;
  const durationFloor = platformSpec ? Math.min(8, durationMin) : 8;
  const durationMax = platformSpec?.durationCeilingSeconds ?? 30;

  const platformBlock = platformSpec
    ? `\n${platformSpec.draftingSystemPromptBlock}\n`
    : '';

  // Phase E3 — camera vocabulary block (replaces fixed LENS instruction).
  const cameraVocabBlock = cameraVocab !== 'cinematic'
    ? `\nCAMERA VOCABULARY (${cameraVocab.toUpperCase()}):\n${LENS_INSTRUCTIONS[cameraVocab]}\n`
    : '';

  // Phase E3 — inject curated style prompt tokens into the system prompt.
  const styleTokensBlock = styleLib
    ? `\nSTYLE TOKENS (use these verbatim in shot prompts):\n${styleLib.promptTokens.join(', ')}\n`
    : '';

  // Phase E3 — inject style-specific negative tokens.
  const styleNegativeBlock = styleLib
    ? `\nSTYLE-SPECIFIC NEGATIVE TOKENS (always include these in negativePrompt):\n${styleLib.negativeTokens.join(', ')}\n`
    : '';

  const sixPart = SIX_PART_ARCHITECTURE.replace('__LENS_INSTRUCTION__', lensInstruction);

  const rules = withDuration(
    `HARD RULES:
1. Inspect the Story Bible BEFORE drafting. Character names, visual descriptions, wardrobe, location names, environment descriptions, the locked visual style, and the locked VFX direction are NON-NEGOTIABLE and must appear verbatim — never invent a new character, a new location, or a different grade.
2. ${sixPart}
3. Clip ceiling: every shot is ${durationFloor}–${durationMax} seconds. Compose the action so it fits the chosen duration; never draft a shot that implies longer.
4. Keep visual style + VFX direction locked: shots may not change color grade, film stock, aspect ratio, particle density, or pacing.
5. Continuity: each shot's continuityHandoff describes where the subject and camera end AND any scene-condition changes (wardrobe, weather, time-of-day) with the reason they changed, so the next shot can pick up without drift.
6. Motion specificity: Every camera movement and subject movement MUST state concrete direction and speed (e.g. "the camera pushes in slowly, 30cm over the full clip", "drifting slowly left to right", "sharp whip pan left", "rapid vertical ascent"). Reject generic movement verbs like "the camera moves in" or "she walks across".
7. Physicalized emotion: NEVER name emotion words (e.g. "sad", "angry", "nervous") in promptText. Render emotion exclusively through physical cues, micro-actions, and body language (e.g. "her jaw tightens", "knuckles whiten gripping the edge").
8. Detail scaling: Calibrate descriptive detail to shot framing scale. Close-ups require dense micro-action, facial micro-expressions, texture, and breath; wide shots focus on spatial geography, blocking, and silhouette.
9. Anchor every hand/prop interaction to a concrete object — never describe a hand or limb moving in empty space; give it something specific to hold, touch, or rest on (jittery/floating limbs are the #1 single-shot glitch).
10. Do not stack contradictory descriptors in one section (e.g. "gritty realism" + "pristine, flawless skin") — pick one register per shot and hold it.
11. ${DIALOGUE_RULES}
12. ${NEGATIVE_PROMPT_RULES}${styleNegativeBlock}`,
    durationFloor,
    durationMax,
  );

  // ── D2: scene-scoped filtering ──
  // When shotContext is provided, only the relevant location and characters
  // are given full detail; everything else is omitted.
  const isSceneScoped = !!shotContext;

  // ── C2: identity-by-reference vs. verbatim re-description ──
  // When reference images are attached, characters with images get a
  // pointer rule instead of a verbatim appearance string — shorter,
  // more specific, and lets the model anchor identity to the image.
  // Scene-scoped: only characters present in this scene are considered.
  const scopeChars = isSceneScoped
    ? (bible.characters ?? []).filter((c) => shotContext!.characterIds.includes(c.id))
    : bible.characters ?? [];
  const imageRefMap = new Map(imageRefs?.map((r) => [r.characterId, r.imageIndex]) ?? []);
  const charsWithImages = scopeChars.filter((c) => imageRefMap.has(c.id));
  const charsWithoutImages = scopeChars.filter((c) => !imageRefMap.has(c.id));

  let identityBlock: string;
  if (charsWithImages.length > 0) {
    // Mixed: some characters have images, some don't
    const imagePointers = charsWithImages
      .map((c) => {
        const idx = imageRefMap.get(c.id)!;
        return [
          `${c.name} (image ${idx}): IDENTITY BY REFERENCE — ${c.name} has an attached reference image (image ${idx}). Refer to them by name and point to the image for face, hair and build. Do NOT re-describe their facial features in the prompt text — the reference governs identity. Describe only what changes in THIS shot: action, expression, wardrobe state, and position in frame.`,
        ].join('\n');
      })
      .join('\n\n');

    const textAnchors = charsWithoutImages.length > 0
      ? `VERBATIM RE-DESCRIPTION (no reference image available):\n${charsWithoutImages
          .map((c) => `${c.name} = "${clip(c.appearance, 240)}"`)
          .join('; ')}`
      : '';

    identityBlock = `IDENTITY LOCK — reference images govern identity where attached:
${imagePointers}

${textAnchors}`;
  } else {
    // No images attached — use the original verbatim anchors
    identityBlock = `IDENTITY LOCK — reuse these EXACT strings every time, never change them:
${formatIdentityAnchors(bible)}`;
  }

  // Wardrobe variants — when a character has wardrobeLooks, inject the
  // active look's description instead of the top-level wardrobe field.
  let wardrobeNote = '';
  const charsLooks = bible.characters?.filter((c) => c.wardrobeLooks && c.wardrobeLooks.length > 0) ?? [];
  if (charsLooks.length > 0) {
    const lookLines = charsLooks.map((c) => {
      const activeLook = c.wardrobeLooks!.find((l) => l.id === c.defaultLookId) ?? c.wardrobeLooks![0];
      return `${c.name} wardrobe (active look "${activeLook.label}"): "${clip(activeLook.description, 240)}"`;
    });
    wardrobeNote = `\nWARDROBE VARIANTS — identity (face/build) stays locked; only clothing changes:\n${lookLines.join('; ')}\nWhen a shot requires a wardrobe change, pick a different look from the character's wardrobeLooks and note the switch in continuityHandoff.`;
  }

  // Phase D2 — scene-scoped vs. full digest
  const bibleDigest = isSceneScoped
    ? buildSceneScopedBibleDigest(bible, shotContext!)
    : buildStoryBibleDigest(bible);
  const identityContent = isSceneScoped
    ? formatSceneScopedIdentityAnchors(bible, shotContext!)
    : (identityBlock.includes('IDENTITY LOCK') ? '' : formatIdentityAnchors(bible));
  const sceneDefaultsContent = isSceneScoped
    ? formatSceneScopedSceneDefaults(bible, shotContext!)
    : formatSceneDefaults(bible);

  // When scene-scoped, the identityBlock already contains the scoped anchors.
  // When not scene-scoped, use identityBlock as-is.
  const finalIdentityBlock = isSceneScoped ? `IDENTITY LOCK — reuse these EXACT strings every time, never change them:
${identityContent}` : identityBlock;

  // Phase F1 — inject DirectionPlan into every shot draft (above generic DIRECTOR_RULES).
  let directorialApproachBlock = '';
  if (project.directionPlan) {
    const plan = project.directionPlan;
    const lensLine =
      cameraVocab === 'cinematic' && plan.lensPhilosophy
        ? `\n- Lens philosophy: ${plan.lensPhilosophy}`
        : '';

    let sceneApproachLine = '';
    let shotFunctionLine = '';
    if (shotContext?.sceneNumber && plan.perSceneNotes?.length) {
      const sceneNote = plan.perSceneNotes.find(
        (n) => n.sceneNumber === shotContext.sceneNumber
      );
      if (sceneNote) {
        if (sceneNote.approach) {
          sceneApproachLine = `\n\nTHIS SCENE'S APPROACH: ${sceneNote.approach}`;
        }
        if (sceneNote.shotFunction) {
          shotFunctionLine = `\nTHIS SHOT'S FUNCTION: ${sceneNote.shotFunction}`;
        }
      }
    }

    directorialApproachBlock = `DIRECTORIAL APPROACH (locked in the Direction stage — every shot must express this):
- Camera language: ${plan.cameraLanguage}${lensLine}
- Colour palette: ${plan.colourPalette}
- Lighting: ${plan.lightingApproach}
- Sound: ${plan.soundDesign}
- Recurring visual motif: ${plan.visualMotif}
- Pacing: ${plan.pacingRhythm}${sceneApproachLine}${shotFunctionLine}

`;
  }

  return `You are the shot drafter on a short-form video production. You work inside the director's multi-turn drafting thread: you propose ONE sequential shot per turn, the director approves it into the storyboard or asks for a revision, and you keep character, setting, and visual style anchors perfectly stable across every shot.

DIRECTORIAL BRIEF:
${brief}

STORY BIBLE:
${bibleDigest}

${finalIdentityBlock}

${styleTokensBlock}${cameraVocabBlock}SCENE DEFAULTS — starting point for wardrobe and location conditions. You may evolve these across shots ONLY when the story motivates it (new day, after an event, weather turning for dramatic pressure). When you do, say so out loud in continuityHandoff so the next shot inherits the change instead of reverting:
${sceneDefaultsContent}${wardrobeNote}

CONTINUITY HANDOFF FROM THE STORYBOARD:
${calculateShotHandoff(lastShot)}

${directorialApproachBlock}${DIRECTOR_RULES}

${rules}${platformBlock}
${withNextShot(withDuration(OUTPUT_CONTRACT, durationFloor, durationMax), nextShot)}`;
}
