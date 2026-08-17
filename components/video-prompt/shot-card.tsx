'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown, ChevronUp, Copy, SquarePlay, Timer, Trash2, X } from 'lucide-react';
import type { VideoCharacter, VideoShot } from '@/types/video';
import {
  formatShotForDialect,
  type VideoDialect,
} from '@/lib/video/model-dialects';
import { blobToDataUrl } from '@/lib/compression';
import { useStoryBible } from '@/lib/video/story-bible-context';
import { useInlineCopy } from '@/lib/use-inline-copy';
import { cn } from '@/lib/utils';
import { DialectTabs } from './dialect-tabs';
import { ShotDialogueCard } from './shot-dialogue-card';
import { NegativePromptField } from './negative-prompt-field';
import { CHARACTER_DRAG_TYPE } from './sidebar-characters-panel';

interface ShotCardProps {
  shot: VideoShot;
  /** Story Bible cast — passed through to the dialect adapters that anchor names/voices. */
  characters?: VideoCharacter[];
  /** Edge flags + actions owned by the timeline (ShotList). */
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  /** Lock/unlock a Story Bible character reference on this shot (drag & drop). */
  onAddCharacterRef: (shotId: string, characterId: string) => void;
  onRemoveCharacterRef: (shotId: string, characterId: string) => void;
  /** Persist a field edit (e.g. negativePrompt) back through the timeline. */
  onChange?: (patch: Partial<VideoShot>) => void;
}

/**
 * Phase 5 — one confirmed shot on the storyboard timeline: Shot N + duration
 * chips, description, the dialect tabs (Task 5.2), and a live preview of the
 * dialect-formatted prompt that updates instantly on tab switch (pure
 * function — no async, no flash). Copy uses the app's inline-copy pattern.
 *
 * Phase 4 — shot cards are also drop targets: dragging a character from the
 * sidebar locks their reference image into the shot, and the dialect preview
 * injects that image's base64 payload into the target model's reference
 * parameter (image_url / reference images).
 */
export function ShotCard({
  shot,
  characters,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onDelete,
  onAddCharacterRef,
  onRemoveCharacterRef,
  onChange,
}: ShotCardProps) {
  const [dialectId, setDialectId] = useState<VideoDialect['id']>('universal');
  const { copiedKey, copy } = useInlineCopy(1200);
  const { entries } = useStoryBible();
  const [dragOver, setDragOver] = useState(false);
  const groupId = `shot-${shot.shotNumber}`;

  /** Saved Story Bible images for characters locked onto this shot — the
   *  director-chosen primary per character, falling back to the newest. */
  const refEntries = useMemo(() => {
    const locked = shot.characterIds ?? [];
    return locked.flatMap((id) => {
      const matches = entries.filter((e) => e.characterId === id);
      if (matches.length === 0) return [];
      return [matches.find((e) => e.isPrimary) ?? matches[0]];
    });
  }, [entries, shot.characterIds]);

  /** Converts the locked blobs to base64 data URLs for dialect injection. */
  const [refDataUrls, setRefDataUrls] = useState<Record<string, string>>({});
  useEffect(() => {
    let alive = true;
    const convert = async () => {
      const map: Record<string, string> = {};
      for (const entry of refEntries) {
        if (entry.imageDataUrl) map[entry.id] = entry.imageDataUrl;
        else if (entry.imageBlob) {
          try {
            map[entry.id] = await blobToDataUrl(entry.imageBlob);
          } catch {
            // Keep the entry out of the payload when it can't be read.
          }
        }
      }
      if (alive) setRefDataUrls(map);
    };
    void convert();
    return () => {
      alive = false;
    };
  }, [refEntries]);

  const referenceImages = useMemo(
    () =>
      refEntries.flatMap((entry) =>
        entry.characterId && refDataUrls[entry.id]
          ? [
              {
                characterId: entry.characterId,
                characterName: entry.characterName,
                dataUrl: refDataUrls[entry.id],
              },
            ]
          : []
      ),
    [refEntries, refDataUrls]
  );

  const preview = useMemo(
    () => formatShotForDialect(shot, dialectId, { characters, referenceImages }),
    [shot, dialectId, characters, referenceImages]
  );
  const copied = copiedKey === shot.id;

  const handleCopy = () => {
    void copy(preview, shot.id);
  };

  const characterName = (id: string) =>
    characters?.find((c) => c.id === id)?.name ?? 'Locked character';

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const characterId = e.dataTransfer.getData(CHARACTER_DRAG_TYPE);
    if (characterId) onAddCharacterRef(shot.id, characterId);
  };

  return (
    <div
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes(CHARACTER_DRAG_TYPE)) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
          setDragOver(true);
        }
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDragOver(false);
      }}
      onDrop={handleDrop}
      className={cn(
        'w-full rounded-xl border border-border bg-surface-card/70 backdrop-blur-xl p-3.5 space-y-2.5 transition-colors',
        dragOver && 'border-brand/70 ring-1 ring-brand/40 bg-brand/5'
      )}
    >
      {/* Header — Shot N, duration, reorder + delete controls */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-brand/10 text-brand border border-brand/25 shrink-0">
            <SquarePlay className="w-3 h-3" aria-hidden="true" />
            Shot {shot.shotNumber}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-surface-muted text-text-secondary border border-border tabular-nums shrink-0">
            <Timer className="w-3 h-3 text-accent" aria-hidden="true" />
            {shot.durationSeconds}s
          </span>
          {shot.description && (
            <p className="text-[11px] font-semibold text-text-primary truncate min-w-0">
              {shot.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            aria-label={`Move Shot ${shot.shotNumber} up`}
            title="Move shot up"
            className={cn(
              'p-1 rounded-md text-text-muted hover:text-brand hover:bg-surface-hover transition-colors',
              isFirst && 'opacity-30 cursor-not-allowed'
            )}
          >
            <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            aria-label={`Move Shot ${shot.shotNumber} down`}
            title="Move shot down"
            className={cn(
              'p-1 rounded-md text-text-muted hover:text-brand hover:bg-surface-hover transition-colors',
              isLast && 'opacity-30 cursor-not-allowed'
            )}
          >
            <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete Shot ${shot.shotNumber}`}
            title="Delete shot"
            className="p-1 rounded-md text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Locked character reference chips */}
      {shot.characterIds && shot.characterIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted">
            Locked refs:
          </span>
          {shot.characterIds.map((id) => (
            <span
              key={id}
              className="inline-flex items-center gap-1 rounded-lg border border-accent/30 bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold text-accent"
            >
              {characterName(id)}
              <button
                type="button"
                onClick={() => onRemoveCharacterRef(shot.id, id)}
                aria-label={`Unlock ${characterName(id)} from Shot ${shot.shotNumber}`}
                title="Remove reference"
                className="rounded p-0.5 hover:text-danger transition-colors"
              >
                <X className="w-3 h-3" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dialogue — locked lines, shown as a separate card below the prompt */}
      {shot.dialogue && shot.dialogue.length > 0 && (
        <ShotDialogueCard dialogue={shot.dialogue} durationSeconds={shot.durationSeconds} />
      )}

      {/* Negative prompt — editable on the confirmed shot, persisted via timeline */}
      <NegativePromptField
        value={shot.negativePrompt ?? ''}
        onChange={(negativePrompt) => onChange?.({ negativePrompt })}
        hasDialogue={(shot.dialogue?.length ?? 0) > 0}
        promptText={shot.promptText}
      />

      {/* Dialect selector + live preview */}
      <div className="space-y-1.5">
        <DialectTabs value={dialectId} onChange={setDialectId} groupId={groupId} />
        <div
          id={`dialect-preview-${groupId}`}
          role="tabpanel"
          aria-labelledby={`dialect-tab-${groupId}-${dialectId}`}
          className="relative"
        >
          <pre className="whitespace-pre-wrap break-words rounded-lg bg-surface-code border border-border p-2.5 text-[11px] leading-relaxed text-text-secondary font-mono max-h-56 overflow-y-auto scrollbar-thin">
            {preview}
          </pre>
          <button
            type="button"
            onClick={handleCopy}
            aria-label={`Copy Shot ${shot.shotNumber} prompt in ${dialectId} dialect`}
            className={cn(
              'absolute top-2 right-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-white transition-all',
              'bg-brand hover:bg-brand-hover shadow-glow active:scale-[0.985]',
              copied && 'from-success to-success bg-none'
            )}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" aria-hidden="true" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" aria-hidden="true" /> Copy
              </>
            )}
          </button>
        </div>
        {dragOver && (
          <p className="text-[10px] font-semibold text-brand">
            Drop to lock this character&apos;s reference image into Shot {shot.shotNumber}.
          </p>
        )}
      </div>

      {/* Handoff caption */}
      {shot.continuityHandoff && (
        <p className="text-[11px] text-text-muted leading-relaxed">
          <span className="font-bold uppercase tracking-wider text-text-muted">Handoff: </span>
          {shot.continuityHandoff}
        </p>
      )}
    </div>
  );
}
