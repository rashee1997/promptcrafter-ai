'use client';

// Video Prompt Studio — Phase 3 Story Bible store context.
// Client-only React context that syncs the UI with the Story Bible IndexedDB
// store. Mounted once per open project (ProjectWorkspace). The server-safe
// digest/anchor helpers live in `story-bible.ts`.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  deleteStoryBibleCharacterImage,
  getStoryBibleCharacterImages,
  saveStoryBibleCharacterImage,
} from '@/lib/storage';
import type { StoryBibleCharacterImage } from '@/types/video';

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
