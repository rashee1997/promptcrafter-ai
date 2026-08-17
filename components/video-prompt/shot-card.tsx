'use client';

import React, { useMemo, useState } from 'react';
import { Check, ChevronDown, ChevronUp, Copy, SquarePlay, Timer, Trash2 } from 'lucide-react';
import type { VideoCharacter, VideoShot } from '@/types/video';
import {
  formatShotForDialect,
  type VideoDialect,
} from '@/lib/video/model-dialects';
import { useInlineCopy } from '@/lib/use-inline-copy';
import { cn } from '@/lib/utils';
import { DialectTabs } from './dialect-tabs';

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
}

/**
 * Phase 5 — one confirmed shot on the storyboard timeline: Shot N + duration
 * chips, description, the dialect tabs (Task 5.2), and a live preview of the
 * dialect-formatted prompt that updates instantly on tab switch (pure
 * function — no async, no flash). Copy uses the app's inline-copy pattern.
 */
export function ShotCard({
  shot,
  characters,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onDelete,
}: ShotCardProps) {
  const [dialectId, setDialectId] = useState<VideoDialect['id']>('universal');
  const { copiedKey, copy } = useInlineCopy(1200);
  const groupId = `shot-${shot.shotNumber}`;

  const preview = useMemo(
    () => formatShotForDialect(shot, dialectId, { characters }),
    [shot, dialectId, characters]
  );
  const copied = copiedKey === shot.id;

  const handleCopy = () => {
    void copy(preview, shot.id);
  };

  return (
    <div className="w-full rounded-xl border border-border bg-surface-card/70 backdrop-blur-xl p-3.5 space-y-2.5">
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
