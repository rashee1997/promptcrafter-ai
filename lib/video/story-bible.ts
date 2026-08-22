// Video Prompt Studio — Phase 4 story-bible context helpers.
// These build the compact digests, verbatim continuity anchors, and shot
// handoff lines that the chat system prompt embeds, and parse the structured
// JSON block the model emits per drafted shot turn.
// Server-safe: this module must stay free of React so the API routes can
// import it. The client-only StoryBibleProvider lives in
// `story-bible-context.tsx`.
//
// Director Skill (Phase 1): identity-vs-conditions split inspired by the
// "visual-skills" project by Serge Shima (CC-BY-4.0).
// https://github.com/smixs/visual-skills — all data shapes and prompt text
// below are our own; this is attribution, not copied content.

import type {
  DialogueLine,
  DraftedShot,
  ScreenplayScene,
  ShotLocationConditions,
  StoryBible,
  VideoLocation,
  VideoProject,
  VideoShot,
} from '@/types/video';

/** Truncates context so long bible fields never bloat the system prompt. */
function clip(text: string | null | undefined, max = 600): string {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

/**
 * Human-readable digest of the full Story Bible — cast, locations, locked
 * visual style, locked VFX direction, and the recent continuity log.
 */
export function buildStoryBibleDigest(bible: StoryBible): string {
  const blocks: string[] = [];

  if (bible.characters?.length) {
    blocks.push(
      `CAST:\n${bible.characters
        .map(
          (c) =>
            `- ${c.name} (${clip(c.role, 80)}) — appearance: ${clip(c.appearance, 240)}; wardrobe: ${clip(c.wardrobe, 240)}; voice tone: ${clip(c.voiceTone, 120)}${c.voice ? `; voice profile: ${c.voice.provider}${c.voice.toneNotes ? ` (${clip(c.voice.toneNotes, 120)})` : ''}` : ''}`
        )
        .join('\n')}`
    );
  }

  if (bible.locations?.length) {
    blocks.push(
      `LOCATIONS:\n${bible.locations
        .map((l) => `- ${l.name} — ${clip(l.description, 320)}`)
        .join('\n')}`
    );
  }

  if (bible.style) {
    blocks.push(
      `LOCKED VISUAL STYLE:\n- Look & mood: ${clip(bible.style.lookAndMood, 320)}\n- Color grade: ${clip(bible.style.colorGrade, 160)}\n- Film stock: ${clip(bible.style.filmStock, 120)}\n- Aspect ratio: ${clip(bible.style.aspectRatio, 60)}`
    );
  }

  if (bible.effects) {
    blocks.push(
      `LOCKED VFX DIRECTION:\n- VFX: ${clip(bible.effects.vfxDirection, 320)}\n- Particle density: ${clip(bible.effects.particleDensity, 160)}\n- Pacing: ${clip(bible.effects.pacing, 160)}`
    );
  }

  if (bible.continuityLog?.length) {
    blocks.push(
      `CONTINUITY LOG (recent):\n${bible.continuityLog.slice(-6).map((line) => `- ${clip(line, 240)}`).join('\n')}`
    );
  }

  return blocks.join('\n\n') || '(Story bible is still empty — draft from the directorial brief.)';
}

/**
 * Identity anchors — the things that NEVER change: character name + physical
 * appearance (face, build, hair, marks), core location geography/architecture,
 * locked visual style, and locked VFX direction. These must be reused
 * word-for-word across every shot.
 *
 * Director Skill (Phase 1): split from the old monolithic
 * `formatContinuityAnchors` to separate locked identity from adaptable scene
 * conditions. Inspired by the identity-vs-conditions distinction in Serge
 * Shima's visual-skills repo (CC-BY-4.0).
 */
export function formatIdentityAnchors(bible: StoryBible): string {
  const anchors: string[] = [];

  if (bible.characters?.length) {
    anchors.push(
      bible.characters
        .map((c) => `${c.name} = "${clip(c.appearance, 240)}"`)
        .join('; ')
    );
  }

  if (bible.locations?.length) {
    anchors.push(
      bible.locations
        .map((l) => `${l.name} = "${clip(l.description, 280)}"`)
        .join('; ')
    );
  }

  if (bible.style) {
    anchors.push(`Style = "${clip(bible.style.lookAndMood, 240)}"`);
  }

  if (bible.effects) {
    anchors.push(`VFX = "${clip(bible.effects.vfxDirection, 240)}"`);
  }

  return anchors.join('\n') || '(No identity anchors yet — invent consistent names and lock them in the draft.)';
}

/**
 * Scene defaults — the adaptable starting point for wardrobe, prop-in-hand,
 * location weather/time-of-day/lighting, and other scene conditions. The model
 * may evolve these across shots ONLY when the story motivates it (new day,
 * after an event, weather turning for dramatic pressure). Any change must be
 * stated explicitly in `continuityHandoff` so the next shot inherits it.
 *
 * Director Skill (Phase 1): split from the old monolithic
 * `formatContinuityAnchors` so characters' faces stay locked while wardrobe
 * and location conditions can breathe with the story.
 */
export function formatSceneDefaults(bible: StoryBible): string {
  const parts: string[] = [];

  if (bible.characters?.length) {
    parts.push(
      bible.characters
        .map((c) => `${c.name} wardrobe = "${clip(c.wardrobe, 240)}"`)
        .join('; ')
    );
  }

  if (bible.locations?.length) {
    parts.push(
      bible.locations
        .map((l) => `${l.name} starting conditions = "${clip(l.description, 280)}"`)
        .join('; ')
    );
  }

  return parts.join('\n') || '(No scene defaults yet — use the Story Bible digest as your starting point.)';
}

/**
 * Subject + camera ending state handed to the next shot. Uses the last
 * confirmed shot's handoff verbatim when available; falls back to the last
 * shot's summary so continuity never silently resets.
 */
export function calculateShotHandoff(lastShot?: VideoShot): string {
  if (!lastShot) {
    return 'No prior shot — this is the opening shot. Establish subject, setting, and camera before anything moves.';
  }
  const handoff = lastShot.continuityHandoff?.trim();
  if (handoff) {
    return `The previous shot (Shot ${lastShot.shotNumber}) ends with: ${handoff}`;
  }
  const summary = lastShot.description?.trim() || lastShot.promptText?.trim();
  return summary
    ? `The previous shot (Shot ${lastShot.shotNumber}) ends with: ${clip(summary, 320)}`
    : 'Previous shot continuity is unrecorded — re-establish the subject and setting cleanly.';
}

/** Next sequential shot number, continuing from the project's confirmed shots. */
export function nextShotNumber(project: VideoProject): number {
  const max = project.shots.reduce((top, s) => Math.max(top, s.shotNumber || 0), 0);
  return max + 1;
}

/**
 * Parses the single fenced JSON block the shot-drafting model emits per turn
 * (system prompt requires exactly one per assistant message). Returns null
 * when no valid draft block is present, so plain conversational replies render
 * without an approval card.
 */
export function parseDraftedShot(text: string): DraftedShot | null {
  if (!text) return null;

  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fence ? fence[1] : text;
  const first = raw.indexOf('{');
  const last = raw.lastIndexOf('}');
  if (first === -1 || last <= first) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.slice(first, last + 1));
  } catch {
    return null;
  }

  const obj = (parsed && typeof parsed === 'object' ? parsed : {}) as Record<string, unknown>;
  const shot = (obj.shot && typeof obj.shot === 'object' ? obj.shot : obj) as Record<string, unknown>;

  const promptText = typeof shot.promptText === 'string' ? shot.promptText.trim() : '';
  const description = typeof shot.description === 'string' ? shot.description.trim() : '';
  const handoff = typeof shot.continuityHandoff === 'string' ? shot.continuityHandoff.trim() : '';
  const shotNumber = Number(shot.shotNumber);
  const durationSeconds = Number(shot.durationSeconds);

  if (!promptText || !Number.isFinite(shotNumber) || shotNumber < 1) return null;

  // Dialogue is a first-class structured field — never parsed out of the
  // visual promptText. Malformed/extra entries are dropped, never merged.
  const dialogueRaw = Array.isArray(shot.dialogue) ? shot.dialogue : [];
  const dialogue: DialogueLine[] = dialogueRaw.flatMap((d) => {
    if (!d || typeof d !== 'object') return [];
    const entry = d as Record<string, unknown>;
    const speaker = typeof entry.speaker === 'string' ? entry.speaker.trim() : '';
    const line = typeof entry.line === 'string' ? entry.line.trim() : '';
    if (!speaker || !line) return [];
    return [
      {
        speaker,
        line,
        ...(typeof entry.tone === 'string' && entry.tone.trim() ? { tone: entry.tone.trim() } : {}),
      },
    ];
  });

  const negativePrompt = typeof shot.negativePrompt === 'string' ? shot.negativePrompt.trim() : '';

  // Director Skill — optional craft fields from the model output.
  const emotion = typeof shot.emotion === 'string' ? shot.emotion.trim() : '';
  const shotFunction = typeof shot.shotFunction === 'string' ? shot.shotFunction.trim() : '';

  // Phase 3 — prompt form selection (AI-chosen per shot).
  const promptForm = typeof shot.promptForm === 'string' ? shot.promptForm.trim() : '';

  // Clamp silently in the persisted value, but record what the model asked for
  // so the UI can surface the truncation instead of hiding it (A5).
  const rawDuration = Number.isFinite(durationSeconds) ? Math.round(durationSeconds) : 12;
  const clampedDuration = Math.min(30, Math.max(8, rawDuration));

  return {
    shotNumber: Math.floor(shotNumber),
    description: description || promptText.slice(0, 140),
    promptText,
    continuityHandoff: handoff || promptText.slice(0, 140),
    durationSeconds: clampedDuration,
    dialogue,
    negativePrompt,
    ...(emotion ? { emotion } : {}),
    ...(shotFunction ? { shotFunction } : {}),
    ...(promptForm ? { promptForm: promptForm as DraftedShot['promptForm'] } : {}),
    ...(clampedDuration !== rawDuration ? { durationClampedFrom: rawDuration } : {}),
  };
}

export interface ShotRebuildResult {
  shots: VideoShot[];
  logEntry: string;
}

/**
 * Phase 5 — deterministic continuity chain rebuild. The caller supplies the
 * shots in the DESIRED sequence (after a reorder or removal); this function
 * renumbers them 1..N in that order and returns a continuityLog entry.
 *
 * Each shot's promptText and continuityHandoff are preserved verbatim — only
 * shotNumber changes, so the drafted anchors stay locked (offline-safe). The
 * `action` phrase describes what happened (e.g. "Timeline reordered — Shot 4
 * moved after Shot 2" or "Shot 3 deleted; handoff between Shot 2 and Shot 4
 * is now direct") and becomes the log entry the workspace appends.
 */
export function rebuildShotContinuity(shots: VideoShot[], action: string): ShotRebuildResult {
  const renumbered = shots.map((shot, i) => ({ ...shot, shotNumber: i + 1 }));
  const logEntry = `${action}; continuity chain renumbered 1–${renumbered.length}.`;
  return { shots: renumbered, logEntry };
}

// ── Phase D — scene-scoped Story Bible digest ───────────────────────────────

/**
 * Context the UI supplies per-shot so the drafting prompt is scoped to the
 * current scene instead of dumping the full Story Bible.
 */
export interface ShotSceneContext {
  /** The screenplay scene this shot belongs to. */
  sceneNumber: number;
  /** Location id to show in full detail. */
  locationId?: string;
  /** Character ids present in this shot. */
  characterIds: string[];
  /** Per-character wardrobe look overrides. */
  wardrobeLookIds?: Record<string, string>;
  /** Per-shot location conditions (time-of-day, weather, etc.). */
  locationConditions?: ShotLocationConditions;
}

/**
 * Phase D2 — scene-scoped Story Bible digest. Only the location and
 * characters present in the current scene are given full detail; everything
 * else is omitted or reduced to a one-line mention. This is the single
 * highest-leverage change for prompt vagueness — the prompt gets shorter
 * and every line in it is relevant.
 */
export function buildSceneScopedBibleDigest(
  bible: StoryBible,
  ctx: ShotSceneContext,
): string {
  const blocks: string[] = [];

  // Characters — only those present in this shot get full detail.
  const allChars = bible.characters ?? [];
  const presentChars = allChars.filter((c) => ctx.characterIds.includes(c.id));
  const absentChars = allChars.filter((c) => !ctx.characterIds.includes(c.id));

  if (presentChars.length > 0) {
    blocks.push(
      `CAST IN THIS SCENE (full detail):\n${presentChars
        .map(
          (c) =>
            `- ${c.name} (${clip(c.role, 80)}) — appearance: ${clip(c.appearance, 240)}; wardrobe: ${clip(c.wardrobe, 240)}; voice tone: ${clip(c.voiceTone, 120)}${c.voice ? `; voice profile: ${c.voice.provider}${c.voice.toneNotes ? ` (${clip(c.voice.toneNotes, 120)})` : ''}` : ''}`
        )
        .join('\n')}`
    );
  }

  if (absentChars.length > 0) {
    blocks.push(
      `Other characters (NOT in this scene — do not include in shot): ${absentChars.map((c) => c.name).join(', ')}`
    );
  }

  // Location — only the one this shot is in gets full detail.
  const allLocs = bible.locations ?? [];
  const sceneLoc = ctx.locationId ? allLocs.find((l) => l.id === ctx.locationId) : null;
  const otherLocs = ctx.locationId ? allLocs.filter((l) => l.id !== ctx.locationId) : allLocs;

  if (sceneLoc) {
    blocks.push(
      `LOCATION (full detail):\n- ${sceneLoc.name} — ${clip(sceneLoc.description, 400)}`
    );
  } else if (allLocs.length > 0) {
    blocks.push(
      `LOCATION:\n${allLocs.map((l) => `- ${l.name} — ${clip(l.description, 320)}`).join('\n')}`
    );
  }

  if (otherLocs.length > 0) {
    blocks.push(
      `Other locations (NOT in this scene — do not use): ${otherLocs.map((l) => l.name).join(', ')}`
    );
  }

  // Style + VFX — always included (they're locked global properties).
  if (bible.style) {
    blocks.push(
      `LOCKED VISUAL STYLE:\n- Look & mood: ${clip(bible.style.lookAndMood, 320)}\n- Color grade: ${clip(bible.style.colorGrade, 160)}\n- Film stock: ${clip(bible.style.filmStock, 120)}\n- Aspect ratio: ${clip(bible.style.aspectRatio, 60)}`
    );
  }

  if (bible.effects) {
    blocks.push(
      `LOCKED VFX DIRECTION:\n- VFX: ${clip(bible.effects.vfxDirection, 320)}\n- Particle density: ${clip(bible.effects.particleDensity, 160)}\n- Pacing: ${clip(bible.effects.pacing, 160)}`
    );
  }

  // Continuity log — always included (last 6 entries).
  if (bible.continuityLog?.length) {
    blocks.push(
      `CONTINUITY LOG (recent):\n${bible.continuityLog.slice(-6).map((line) => `- ${clip(line, 240)}`).join('\n')}`
    );
  }

  return blocks.join('\n\n') || '(Story bible is still empty — draft from the directorial brief.)';
}

/**
 * Phase D2 — scene-scoped identity anchors. Only the characters and
 * location present in this scene get verbatim anchors.
 */
export function formatSceneScopedIdentityAnchors(
  bible: StoryBible,
  ctx: ShotSceneContext,
): string {
  const anchors: string[] = [];

  const allChars = bible.characters ?? [];
  const presentChars = allChars.filter((c) => ctx.characterIds.includes(c.id));

  if (presentChars.length > 0) {
    anchors.push(
      presentChars
        .map((c) => `${c.name} = "${clip(c.appearance, 240)}"`)
        .join('; ')
    );
  }

  const allLocs = bible.locations ?? [];
  const sceneLoc = ctx.locationId ? allLocs.find((l) => l.id === ctx.locationId) : null;
  if (sceneLoc) {
    anchors.push(`${sceneLoc.name} = "${clip(sceneLoc.description, 280)}"`);
  }

  if (bible.style) {
    anchors.push(`Style = "${clip(bible.style.lookAndMood, 240)}"`);
  }

  if (bible.effects) {
    anchors.push(`VFX = "${clip(bible.effects.vfxDirection, 240)}"`);
  }

  return anchors.join('\n') || '(No identity anchors yet — invent consistent names and lock them in the draft.)';
}

/**
 * Phase D2 — scene-scoped scene defaults. Wardrobe for present characters
 * and conditions for the current location only.
 */
export function formatSceneScopedSceneDefaults(
  bible: StoryBible,
  ctx: ShotSceneContext,
): string {
  const parts: string[] = [];

  const allChars = bible.characters ?? [];
  const presentChars = allChars.filter((c) => ctx.characterIds.includes(c.id));

  if (presentChars.length > 0) {
    parts.push(
      presentChars
        .map((c) => `${c.name} wardrobe = "${clip(c.wardrobe, 240)}"`)
        .join('; ')
    );
  }

  const allLocs = bible.locations ?? [];
  const sceneLoc = ctx.locationId ? allLocs.find((l) => l.id === ctx.locationId) : null;
  if (sceneLoc) {
    const condParts: string[] = [];
    if (ctx.locationConditions) {
      const c = ctx.locationConditions;
      if (c.timeOfDay) condParts.push(`time: ${c.timeOfDay}`);
      if (c.weather) condParts.push(`weather: ${c.weather}`);
      if (c.lightingMood) condParts.push(`lighting: ${c.lightingMood}`);
      if (c.occupancy) condParts.push(`occupancy: ${c.occupancy}`);
    }
    const condStr = condParts.length > 0 ? ` (${condParts.join(', ')})` : '';
    parts.push(`${sceneLoc.name} starting conditions = "${clip(sceneLoc.description, 280)}"${condStr}`);
  }

  return parts.join('\n') || '(No scene defaults yet — use the Story Bible digest as your starting point.)';
}

/**
 * Phase D1 — looks up a screenplay scene by number and returns the
 * matching ScreenplayScene or undefined.
 */
export function findScene(
  project: VideoProject,
  sceneNumber: number,
): ScreenplayScene | undefined {
  return project.screenplay?.find((s) => s.sceneNumber === sceneNumber);
}
