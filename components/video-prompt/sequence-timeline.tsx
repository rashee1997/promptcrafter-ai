'use client';

import React, { useCallback, useRef, useState } from 'react';
import {
  Clock,
  GripVertical,
  Layers,
  SquarePlay,
  Target,
  Timer,
} from 'lucide-react';
import type { VideoProject, VideoShot } from '@/types/video';
import { rebuildShotContinuity } from '@/lib/video/story-bible';
import { saveVideoProject } from '@/lib/video-storage';
import { getPlatformSpec } from '@/lib/video/platforms';
import { cn } from '@/lib/utils';
import { CharacterImageThumb } from './character-image-thumb';
import { useStoryBible } from '@/lib/video/story-bible-context';
import type { StoryBibleCharacterImage } from '@/types/video';

interface SequenceTimelineProps {
  project: VideoProject;
  onUpdate: (project: VideoProject) => void;
}

interface DragState {
  dragIndex: number;
  overIndex: number | null;
}

/**
 * Phase 7 — horizontal card strip showing every confirmed shot as a compact
 * card with thumbnail, duration, scene number, shot function tag, and platform.
 * Supports drag-to-reorder (HTML5 drag API). Updates are persisted via the
 * same rebuildShotContinuity path as the vertical ShotList.
 */
export function SequenceTimeline({ project, onUpdate }: SequenceTimelineProps) {
  const projectRef = useRef(project);
  projectRef.current = project;
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const [dragState, setDragState] = useState<DragState | null>(null);

  const shots = [...(project.shots ?? [])]
    .filter((s) => s.confirmed)
    .sort((a, b) => a.shotNumber - b.shotNumber);

  const totalDuration = shots.reduce(
    (sum, s) => sum + (s.durationSeconds || 0),
    0,
  );

  // Resolve thumbnail images for shots that have locked character refs
  const thumbnailResolver = useThumbnailResolver(project.id);

  const persistReorder = useCallback(
    (reordered: VideoShot[], action: string) => {
      const { shots: rebuilt, logEntry } = rebuildShotContinuity(
        reordered,
        action,
      );
      const base = projectRef.current;
      const updated: VideoProject = {
        ...base,
        shots: rebuilt,
        storyBible: {
          ...base.storyBible,
          continuityLog: [...(base.storyBible.continuityLog ?? []), logEntry],
        },
        updatedAt: Date.now(),
      };
      void saveVideoProject(updated);
      onUpdateRef.current(updated);
    },
    [],
  );

  // ── Drag handlers ───────────────────────────────────────────────────────

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
    setDragState({ dragIndex: index, overIndex: null });
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragState((prev) =>
      prev ? { ...prev, overIndex: index } : { dragIndex: index, overIndex: index },
    );
  };

  const handleDragLeave = () => {
    setDragState((prev) => (prev ? { ...prev, overIndex: null } : null));
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = dragState?.dragIndex ?? -1;
    setDragState(null);

    if (dragIndex < 0 || dragIndex === dropIndex || dragIndex >= shots.length) return;

    const moved = shots[dragIndex];
    const neighbor = shots[dropIndex];
    const reordered = [...shots];
    const [removed] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, removed);

    const direction = dragIndex < dropIndex ? 'after' : 'before';
    const action = `Timeline reordered — Shot ${moved.shotNumber} moved ${direction} Shot ${neighbor.shotNumber}`;
    persistReorder(reordered, action);
  };

  const handleDragEnd = () => {
    setDragState(null);
  };

  // ── Empty state ─────────────────────────────────────────────────────────

  if (shots.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-border bg-surface-card/70 backdrop-blur-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
          <Layers className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
          Sequence Timeline
          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-accent/10 text-accent border border-accent/25 tabular-nums">
            {shots.length} shot{shots.length === 1 ? '' : 's'}
          </span>
          {totalDuration > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-surface-muted text-text-secondary border border-border tabular-nums">
              <Timer className="w-2.5 h-2.5 text-accent" aria-hidden="true" />
              {Math.floor(totalDuration / 60)}m {totalDuration % 60}s
            </span>
          )}
        </div>
        <p className="text-[10px] text-text-muted">
          Drag cards to reorder — the storyboard chain updates automatically.
        </p>
      </div>

      {/* Horizontal card strip */}
      <div className="flex gap-2.5 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
        {shots.map((shot, i) => {
          const effectivePlatform =
            shot.platformOverride ?? project.targetPlatform ?? null;
          const platformSpec = effectivePlatform
            ? getPlatformSpec(effectivePlatform)
            : null;
          const thumbnail = thumbnailResolver(shot);
          const isDraggedOver =
            dragState?.overIndex === i && dragState?.dragIndex !== i;
          const isDragging = dragState?.dragIndex === i;

          return (
            <div
              key={shot.id}
              draggable
              onDragStart={(e) => handleDragStart(e, i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, i)}
              onDragEnd={handleDragEnd}
              className={cn(
                'flex-shrink-0 w-[160px] rounded-xl border bg-surface-card/80 backdrop-blur-xl p-2.5 space-y-2 cursor-grab active:cursor-grabbing transition-all select-none',
                isDragging && 'opacity-50 scale-95',
                isDraggedOver
                  ? 'border-brand/70 ring-1 ring-brand/40 bg-brand/5'
                  : 'border-border hover:border-brand/30 hover:bg-surface-hover/30',
              )}
              title={`Shot ${shot.shotNumber}: ${shot.description || shot.promptText.slice(0, 60)}`}
              aria-roledescription="Drag to reorder"
              aria-label={`Shot ${shot.shotNumber} — ${shot.durationSeconds}s — ${shot.shotFunction ?? 'untagged'}`}
            >
              {/* Thumbnail area */}
              <div className="relative h-14 rounded-lg overflow-hidden bg-surface-code border border-border">
                {thumbnail ? (
                  <CharacterImageThumb
                    entry={thumbnail}
                    className="h-full w-full"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <SquarePlay className="w-5 h-5 text-text-muted/40" aria-hidden="true" />
                  </div>
                )}
                {/* Grip handle overlay */}
                <div className="absolute top-1 right-1 p-0.5 rounded bg-surface-elevated/80 border border-border/50">
                  <GripVertical className="w-2.5 h-2.5 text-text-muted" aria-hidden="true" />
                </div>
              </div>

              {/* Shot info */}
              <div className="space-y-1.5">
                {/* Shot number + duration */}
                <div className="flex items-center justify-between gap-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand">
                    <SquarePlay className="w-2.5 h-2.5" aria-hidden="true" />
                    S{shot.shotNumber}
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-text-secondary tabular-nums">
                    <Clock className="w-2.5 h-2.5 text-accent" aria-hidden="true" />
                    {shot.durationSeconds}s
                  </span>
                </div>

                {/* Shot function tag */}
                {shot.shotFunction && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider bg-accent/15 text-accent border border-accent/30 w-full justify-center truncate">
                    {shot.shotFunction}
                  </span>
                )}

                {/* Scene number */}
                {shot.sceneNumber != null && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[8px] font-semibold bg-surface-muted text-text-muted border border-border w-full justify-center">
                    Scene {shot.sceneNumber}
                  </span>
                )}

                {/* Platform */}
                {platformSpec && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[8px] font-semibold bg-brand/10 text-brand border border-brand/20 w-full justify-center truncate">
                    <Target className="w-2 h-2 mr-0.5" aria-hidden="true" />
                    {platformSpec.label}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Thumbnail resolver hook ─────────────────────────────────────────────────

/**
 * Resolves Story Bible character reference images for shots.
 * Uses the Story Bible context to look up saved images per character.
 */
function useThumbnailResolver(projectId: string) {
  const { entries } = useStoryBible();

  const resolve = useCallback(
    (shot: VideoShot): StoryBibleCharacterImage | null => {
      const locked = shot.characterIds ?? [];
      if (locked.length === 0) return null;

      // Find the primary reference for the first locked character
      for (const charId of locked) {
        const matches = entries.filter((e) => e.characterId === charId);
        if (matches.length > 0) {
          return matches.find((e) => e.isPrimary) ?? matches[0];
        }
      }
      return null;
    },
    [entries],
  );

  return resolve;
}
