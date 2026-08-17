// Video Prompt Studio — Phase 4 story-bible context helpers.
// These build the compact digests, verbatim continuity anchors, and shot
// handoff lines that the chat system prompt embeds (Rule 4), and parse the
// structured JSON block the model emits per drafted shot turn. The file also
// hosts the StoryBibleProvider — the React context that syncs the UI with the
// Story Bible IndexedDB store (Phase 3).

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  deleteStoryBibleCharacterImage,
  getStoryBibleCharacterImages,
  saveStoryBibleCharacterImage,
} from '@/lib/storage';
import type {
  DraftedShot,
  StoryBible,
  StoryBibleCharacterImage,
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
            `- ${c.name} (${clip(c.role, 80)}) — appearance: ${clip(c.appearance, 240)}; wardrobe: ${clip(c.wardrobe, 240)}; voice tone: ${clip(c.voiceTone, 120)}`
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
 * Verbatim continuity anchors (Rule 4): the exact character names, visual
 * descriptions, location names, style, and VFX phrasing the model MUST reuse
 * word-for-word so characters/settings never drift across shots.
 */
export function formatContinuityAnchors(bible: StoryBible): string {
  const anchors: string[] = [];

  if (bible.characters?.length) {
    anchors.push(
      bible.characters
        .map((c) => `${c.name} = "${clip(c.appearance, 240)}" / wardrobe "${clip(c.wardrobe, 240)}"`)
        .join('; ')
    );
  }

  if (bible.locations?.length) {
    anchors.push(
      bible.locations.map((l) => `${l.name} = "${clip(l.description, 280)}"`).join('; ')
    );
  }

  if (bible.style) {
    anchors.push(`Style = "${clip(bible.style.lookAndMood, 240)}"`);
  }

  if (bible.effects) {
    anchors.push(`VFX = "${clip(bible.effects.vfxDirection, 240)}"`);
  }

  return anchors.join('\n') || '(No anchors yet — invent consistent names and lock them in the draft.)';
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

  return {
    shotNumber: Math.floor(shotNumber),
    description: description || promptText.slice(0, 140),
    promptText,
    continuityHandoff: handoff || promptText.slice(0, 140),
    durationSeconds: Number.isFinite(durationSeconds)
      ? Math.min(30, Math.max(8, Math.round(durationSeconds)))
      : 12,
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

// ============================================================================
// Story Bible store context (Phase 3) — client-rendered state manager.
// Mounted once per open project (ProjectWorkspace). Pure functions above stay
// server-safe; only this section touches React, and only client components
// render it.
// ============================================================================


export interface SaveCharacterImageInput {
  projectId: string;
  characterId?: string;
  characterName: string;
  imagePrompt: string;
  imageBlob: Blob;
}

export interface StoryBibleContextValue {
  /** Saved character reference images for the active project (newest first). */
  entries: StoryBibleCharacterImage[];
  /** True while the store is loading from IndexedDB on mount/project switch. */
  loading: boolean;
  saveCharacterImage: (input: SaveCharacterImageInput) => Promise<StoryBibleCharacterImage | null>;
  deleteCharacterImage: (id: string) => Promise<void>;
}

const StoryBibleContext = createContext<StoryBibleContextValue | null>(null);

/**
 * Loads the Story Bible store for `projectId` and exposes optimistic CRUD so
 * every surface (bootstrap step, sidebar panel, shot cards) shows saved
 * character images without re-fetching.
 */
export function StoryBibleProvider({ projectId, children }: { projectId: string; children: ReactNode }) {
  const [entries, setEntries] = useState<StoryBibleCharacterImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getStoryBibleCharacterImages(projectId)
      .then((list) => {
        if (alive) setEntries(list);
      })
      .catch(() => {
        if (alive) setEntries([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [projectId]);

  const saveCharacterImage = useCallback(
    async (input: SaveCharacterImageInput): Promise<StoryBibleCharacterImage | null> => {
      try {
        const saved = await saveStoryBibleCharacterImage(input);
        setEntries((prev) => [saved, ...prev.filter((e) => e.id !== saved.id)]);
        return saved;
      } catch (err) {
        console.error('Story Bible save failed:', err);
        return null;
      }
    },
    []
  );

  const deleteCharacterImage = useCallback(async (id: string) => {
    try {
      await deleteStoryBibleCharacterImage(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error('Story Bible delete failed:', err);
    }
  }, []);

  const value = useMemo<StoryBibleContextValue>(
    () => ({ entries, loading, saveCharacterImage, deleteCharacterImage }),
    [entries, loading, saveCharacterImage, deleteCharacterImage]
  );

  return <StoryBibleContext.Provider value={value}>{children}</StoryBibleContext.Provider>;
}

/** Consumes the Story Bible store — must be rendered under <StoryBibleProvider>. */
export function useStoryBible(): StoryBibleContextValue {
  const ctx = useContext(StoryBibleContext);
  if (!ctx) throw new Error('useStoryBible must be used within <StoryBibleProvider>');
  return ctx;
}
