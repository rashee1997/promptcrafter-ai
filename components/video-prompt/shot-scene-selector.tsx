'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown, Film, MapPin, Users, X } from 'lucide-react';
import type {
  ScreenplayScene,
  ShotLocationConditions,
  VideoCharacter,
  VideoLocation,
  VideoProject,
} from '@/types/video';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface ShotSceneContextValue {
  sceneNumber: number;
  locationId?: string;
  characterIds: string[];
  wardrobeLookIds?: Record<string, string>;
  locationConditions?: ShotLocationConditions;
}

interface ShotSceneSelectorProps {
  project: VideoProject;
  /** Called whenever the selection changes so the parent can pass context to the API. */
  onContextChange: (ctx: ShotSceneContextValue | null) => void;
}

/**
 * Phase D3 — a compact selector strip that lets the director choose the
 * scene, location, and characters for the next shot before drafting. Selecting
 * a scene auto-fills its location and present characters from the screenplay;
 * all values are overridable.
 *
 * Renders as a horizontal row of compact dropdowns + a multi-select for
 * characters, fitting in a single 40px-tall strip.
 */
export function ShotSceneSelector({ project, onContextChange }: ShotSceneSelectorProps) {
  const screenplay = useMemo(() => project.screenplay ?? [], [project.screenplay]);
  const locations = useMemo(() => project.storyBible?.locations ?? [], [project.storyBible?.locations]);
  const characters = useMemo(() => project.storyBible?.characters ?? [], [project.storyBible?.characters]);

  // ── State ──
  const [selectedSceneNumber, setSelectedSceneNumber] = useState<number | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>([]);
  const [conditions, setConditions] = useState<ShotLocationConditions>({});

  // ── Derive scene from screenplay ──
  const selectedScene: ScreenplayScene | undefined = useMemo(
    () => screenplay.find((s) => s.sceneNumber === selectedSceneNumber),
    [screenplay, selectedSceneNumber],
  );

  // ── Auto-fill from scene when scene changes ──
  // `presentCharacterIds` on a screenplay scene is actually a list of
  // character NAMES (Stage 3/screenplay runs before Stage 5/characters, so
  // the AI has no ids to reference yet — see screenplay.ts schema). Resolve
  // those names to real character ids by matching against the confirmed
  // cast; unmatched/renamed characters just don't pre-select.
  useEffect(() => {
    if (selectedScene) {
      setSelectedLocationId(selectedScene.locationId ?? null);
      const wanted = new Set(
        (selectedScene.presentCharacterIds ?? []).map((n) => n.trim().toLowerCase())
      );
      const resolvedIds = characters
        .filter((c) => wanted.has(c.name.trim().toLowerCase()))
        .map((c) => c.id);
      setSelectedCharacterIds(resolvedIds);
      setConditions({ timeOfDay: selectedScene.timeOfDay });
    }
  }, [selectedScene, characters]);

  // ── Emit context whenever selection changes ──
  useEffect(() => {
    if (selectedSceneNumber === null) {
      onContextChange(null);
      return;
    }
    onContextChange({
      sceneNumber: selectedSceneNumber,
      locationId: selectedLocationId ?? undefined,
      characterIds: selectedCharacterIds,
      locationConditions: Object.keys(conditions).length > 0 ? conditions : undefined,
    });
  }, [selectedSceneNumber, selectedLocationId, selectedCharacterIds, conditions, onContextChange]);

  // ── Character toggle (for multi-select) ──
  const toggleCharacter = useCallback((charId: string) => {
    setSelectedCharacterIds((prev) =>
      prev.includes(charId) ? prev.filter((id) => id !== charId) : [...prev, charId],
    );
  }, []);

  const removeCharacter = useCallback((charId: string) => {
    setSelectedCharacterIds((prev) => prev.filter((id) => id !== charId));
  }, []);

  // ── Look up names for display ──
  const selectedLocation = useMemo(
    () => locations.find((l) => l.id === selectedLocationId),
    [locations, selectedLocationId],
  );
  const presentCharacters = useMemo(
    () => characters.filter((c) => selectedCharacterIds.includes(c.id)),
    [characters, selectedCharacterIds],
  );

  if (screenplay.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-surface-muted/40">
      {/* Scene selector */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Film className="w-3 h-3 text-accent" aria-hidden="true" />
        <Select
          value={selectedSceneNumber !== null ? String(selectedSceneNumber) : ''}
          onValueChange={(v) => setSelectedSceneNumber(v ? Number(v) : null)}
        >
          <SelectTrigger
            className="h-7 w-[140px] text-[11px] rounded-lg border-border bg-surface-card px-2"
            aria-label="Select scene"
          >
            <SelectValue placeholder="Scene" />
          </SelectTrigger>
          <SelectContent>
            {screenplay.map((scene) => (
              <SelectItem key={scene.sceneNumber} value={String(scene.sceneNumber)} className="text-[11px]">
                Scene {scene.sceneNumber} — {scene.slugline}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Location selector (pre-filled from scene, overridable) */}
      {selectedSceneNumber !== null && locations.length > 0 && (
        <div className="flex items-center gap-1.5 shrink-0">
          <MapPin className="w-3 h-3 text-accent" aria-hidden="true" />
          <Select
            value={selectedLocationId ?? ''}
            onValueChange={(v) => setSelectedLocationId(v || null)}
          >
            <SelectTrigger
              className="h-7 w-[130px] text-[11px] rounded-lg border-border bg-surface-card px-2"
              aria-label="Select location"
            >
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id} className="text-[11px]">
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Characters multi-select (pre-filled from scene, overridable) */}
      {selectedSceneNumber !== null && characters.length > 0 && (
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <Users className="w-3 h-3 text-accent shrink-0" aria-hidden="true" />
          <div className="flex items-center gap-1 min-w-0 flex-wrap">
            {presentCharacters.map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-1 rounded-md border border-brand/30 bg-brand/10 px-1.5 py-0.5 text-[10px] font-medium text-brand shrink-0"
              >
                {c.name}
                <button
                  type="button"
                  onClick={() => removeCharacter(c.id)}
                  aria-label={`Remove ${c.name}`}
                  className="rounded-sm hover:bg-brand/20 transition-colors"
                >
                  <X className="w-2.5 h-2.5" aria-hidden="true" />
                </button>
              </span>
            ))}
            {/* Add character dropdown */}
            <Select
              value=""
              onValueChange={(v) => {
                if (v && !selectedCharacterIds.includes(v)) {
                  setSelectedCharacterIds((prev) => [...prev, v]);
                }
              }}
            >
              <SelectTrigger
                className="h-6 w-auto min-w-[60px] max-w-[100px] text-[10px] rounded-md border-dashed border-border bg-transparent px-1.5 shrink-0"
                aria-label="Add character"
              >
                <SelectValue placeholder="+ cast" />
              </SelectTrigger>
              <SelectContent>
                {characters
                  .filter((c) => !selectedCharacterIds.includes(c.id))
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-[11px]">
                      {c.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
