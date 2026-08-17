'use client';

import React, { Fragment, useMemo, useRef, useState } from 'react';
import { Clapperboard, Film } from 'lucide-react';
import type { VideoProject, VideoShot } from '@/types/video';
import { rebuildShotContinuity } from '@/lib/video/story-bible';
import { saveVideoProject } from '@/lib/video-storage';
import { ConfirmModal } from '@/components/confirm-modal';
import { ShotCard } from './shot-card';

interface ShotListProps {
  project: VideoProject;
  /** Storage save + parent refresh — the workspace's existing onUpdate. */
  onUpdate: (project: VideoProject) => void;
}

interface PendingDelete {
  shot: VideoShot;
  midChain: boolean;
}

/**
 * Phase 5 — the storyboard timeline beneath the chat thread. Confirmed shots
 * render as a sequenced chain of ShotCards (ordered by shotNumber) with a
 * connector line between them. Reorder and delete go through
 * rebuildShotContinuity(): the chain is renumbered 1..N, prompt texts and
 * handoffs stay verbatim, and one continuityLog entry is appended.
 */
export function ShotList({ project, onUpdate }: ShotListProps) {
  const projectRef = useRef(project);
  projectRef.current = project;
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  /** Shots ordered by sequence — renumbering keeps shotNumber === position. */
  const shots = useMemo(
    () => [...(project.shots ?? [])].sort((a, b) => a.shotNumber - b.shotNumber),
    [project.shots]
  );

  /** Persists the rebuilt chain + a continuityLog entry, then hands it up. */
  const persistRebuild = async (rebuilt: VideoShot[], logEntry: string) => {
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
    await saveVideoProject(updated);
    onUpdateRef.current(updated);
  };

  /** Persists a field edit (e.g. negativePrompt) on one shot without a log entry. */
  const persistShotPatch = (shotId: string, patch: Partial<VideoShot>) => {
    const base = projectRef.current;
    const updated: VideoProject = {
      ...base,
      shots: base.shots.map((s) => (s.id === shotId ? { ...s, ...patch } : s)),
      updatedAt: Date.now(),
    };
    void saveVideoProject(updated);
    onUpdateRef.current(updated);
  };

  /** Persists a character-reference change on one shot + logs it. */
  const persistCharacterRef = (shotId: string, update: (shot: VideoShot) => VideoShot, logEntry: string) => {
    const base = projectRef.current;
    const updated: VideoProject = {
      ...base,
      shots: base.shots.map((s) => (s.id === shotId ? update(s) : s)),
      storyBible: {
        ...base.storyBible,
        continuityLog: [...(base.storyBible.continuityLog ?? []), logEntry],
      },
      updatedAt: Date.now(),
    };
    void saveVideoProject(updated);
    onUpdateRef.current(updated);
  };

  /** Drag & drop — lock a Story Bible character reference onto a shot. */
  const handleAddCharacterRef = (shotId: string, characterId: string) => {
    const shot = projectRef.current.shots.find((s) => s.id === shotId);
    if (!shot) return;
    const ids = shot.characterIds ?? [];
    if (ids.includes(characterId)) return;
    const name = projectRef.current.storyBible?.characters?.find((c) => c.id === characterId)?.name ?? 'character';
    persistCharacterRef(
      shotId,
      (s) => ({ ...s, characterIds: [...ids, characterId] }),
      `Shot ${shot.shotNumber} locked to character "${name}" reference image.`
    );
  };

  const handleRemoveCharacterRef = (shotId: string, characterId: string) => {
    const shot = projectRef.current.shots.find((s) => s.id === shotId);
    if (!shot) return;
    const name = projectRef.current.storyBible?.characters?.find((c) => c.id === characterId)?.name ?? 'character';
    persistCharacterRef(
      shotId,
      (s) => ({ ...s, characterIds: (s.characterIds ?? []).filter((id) => id !== characterId) }),
      `Shot ${shot.shotNumber} released character "${name}" reference image.`
    );
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= shots.length) return;
    const moved = shots[index];
    const neighbor = shots[target];
    const next = [...shots];
    [next[index], next[target]] = [next[target], next[index]];
    const action =
      direction === 'up'
        ? `Timeline reordered — Shot ${moved.shotNumber} moved before Shot ${neighbor.shotNumber}`
        : `Timeline reordered — Shot ${moved.shotNumber} moved after Shot ${neighbor.shotNumber}`;
    const { shots: rebuilt, logEntry } = rebuildShotContinuity(next, action);
    void persistRebuild(rebuilt, logEntry);
  };

  const handleDeleteConfirm = () => {
    if (!pendingDelete) return;
    const { shot, midChain } = pendingDelete;
    const prev = shots[shots.findIndex((s) => s.id === shot.id) - 1];
    const next = shots[shots.findIndex((s) => s.id === shot.id) + 1];
    const remaining = shots.filter((s) => s.id !== shot.id);
    const action =
      `Shot ${shot.shotNumber} deleted` +
      (midChain && prev && next
        ? `; handoff between Shot ${prev.shotNumber} and Shot ${next.shotNumber} is now direct`
        : '');
    const { shots: rebuilt, logEntry } = rebuildShotContinuity(remaining, action);
    setPendingDelete(null);
    void persistRebuild(rebuilt, logEntry);
  };

  const deleteMessage = pendingDelete
    ? pendingDelete.midChain
      ? `This removes Shot ${pendingDelete.shot.shotNumber} from the timeline (the draft stays in the chat thread). Deleting this shot breaks the handoff between Shot ${pendingDelete.shot.shotNumber - 1} and Shot ${pendingDelete.shot.shotNumber + 1} — the chain will be renumbered and the rebuild logged.`
      : `This removes Shot ${pendingDelete.shot.shotNumber} from the timeline (the draft stays in the chat thread). The remaining chain will be renumbered and the rebuild logged.`
    : '';

  if (shots.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface-card/70 backdrop-blur-xl p-6">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted mb-3">
          <Film className="w-3.5 h-3.5 text-brand" aria-hidden="true" />
          Storyboard
        </div>
        <div className="rounded-xl border border-dashed border-border bg-surface-code/60 px-5 py-7 text-center">
          <Clapperboard className="w-4 h-4 text-brand/60 mx-auto" aria-hidden="true" />
          <p className="mt-2 text-xs font-semibold text-text-primary">No shots yet</p>
          <p className="mt-1 text-[11px] text-text-muted leading-relaxed">
            Approve a draft in the chat thread to start the storyboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface-card/70 backdrop-blur-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
          <Film className="w-3.5 h-3.5 text-brand" aria-hidden="true" />
          Storyboard
          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-brand/10 text-brand border border-brand/25 tabular-nums">
            {shots.length} shot{shots.length === 1 ? '' : 's'}
          </span>
        </div>
        <p className="text-[10px] text-text-muted">
          Reorder with the arrows — the chain renumbers and logs automatically.
        </p>
      </div>

      {/* Chain */}
      <div className="max-h-[70vh] overflow-y-auto scrollbar-thin pr-1">
        <div className="flex flex-col">
          {shots.map((shot, i) => (
            <Fragment key={shot.id}>
              {i > 0 && (
                <div
                  aria-hidden="true"
                  className="ml-6 w-px h-3.5 bg-gradient-to-b from-brand/50 to-brand/15"
                />
              )}
              <ShotCard
                shot={shot}
                characters={project.storyBible?.characters ?? []}
                isFirst={i === 0}
                isLast={i === shots.length - 1}
                onMoveUp={() => handleMove(i, 'up')}
                onMoveDown={() => handleMove(i, 'down')}
                onDelete={() =>
                  setPendingDelete({ shot, midChain: i > 0 && i < shots.length - 1 })
                }
                onAddCharacterRef={handleAddCharacterRef}
                onRemoveCharacterRef={handleRemoveCharacterRef}
                onChange={(patch) => persistShotPatch(shot.id, patch)}
              />
            </Fragment>
          ))}
        </div>
      </div>

      {/* Delete confirmation — destructive variant */}
      <ConfirmModal
        isOpen={pendingDelete !== null}
        title={
          pendingDelete ? `Delete Shot ${pendingDelete.shot.shotNumber}?` : 'Delete shot?'
        }
        message={deleteMessage}
        confirmLabel="Delete Shot"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
