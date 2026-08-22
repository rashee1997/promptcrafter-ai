'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown, ChevronUp, Copy, Eye, Sparkles, SquarePlay, Timer, Trash2, X } from 'lucide-react';
import type { PromptForm, VideoCharacter, VideoShot, VideoTargetPlatform } from '@/types/video';
import {
  formatShotForDialect,
  type VideoDialect,
} from '@/lib/video/model-dialects';
import { PROMPT_FORM_LABELS } from '@/lib/video/system-prompt';
import { getPlatformSpec } from '@/lib/video/platforms';
import { blobToDataUrl } from '@/lib/compression';
import { useStoryBible } from '@/lib/video/story-bible-context';
import { useInlineCopy } from '@/lib/use-inline-copy';
import { cn } from '@/lib/utils';
import { DialectTabs } from './dialect-tabs';
import { ShotDialogueCard } from './shot-dialogue-card';
import { NegativePromptField } from './negative-prompt-field';
import { CHARACTER_DRAG_TYPE } from './sidebar-characters-panel';

/** All available prompt forms including 'auto' (let AI choose). */
const PROMPT_FORM_OPTIONS: { value: PromptForm | 'auto'; label: string }[] = [
  { value: 'auto', label: 'Let AI choose' },
  { value: 'flowing-prose', label: 'Flowing prose' },
  { value: 'minimal-labeled', label: 'Minimal labeled' },
  { value: 'time-coded', label: 'Time-coded' },
  { value: 'reference-directive', label: 'Reference directive' },
];

/** All available platforms for per-shot override. */
const PLATFORM_OPTIONS: { value: VideoTargetPlatform; label: string }[] = [
  { value: 'veo', label: 'Veo' },
  { value: 'kling', label: 'Kling' },
  { value: 'seedance', label: 'Seedance' },
  { value: 'higgsfield', label: 'Higgsfield' },
  { value: 'runway', label: 'Runway' },
  { value: 'luma', label: 'Luma' },
  { value: 'pika', label: 'Pika' },
];

/** Platforms that lack native multi-shot support — triggers smart-suggest. */
const NO_MULTI_SHOT_PLATFORMS = new Set<VideoTargetPlatform>(['runway', 'luma', 'pika']);

/** IDs that map a target platform to a matching dialect. */
const PLATFORM_TO_DIALECT: Record<string, VideoDialect['id'] | undefined> = {
  veo: 'veo',
  kling: 'kling',
  seedance: 'seedance',
  higgsfield: 'higgsfield',
};

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
  /** The project's target platform — used to default the dialect tab. */
  targetPlatform?: VideoTargetPlatform | null;
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
  targetPlatform,
}: ShotCardProps) {
  const [dialectId, setDialectId] = useState<VideoDialect['id']>(
    targetPlatform ? (PLATFORM_TO_DIALECT[targetPlatform] ?? 'universal') : 'universal'
  );
  const { copiedKey, copy } = useInlineCopy(1200);
  const { entries } = useStoryBible();
  const [dragOver, setDragOver] = useState(false);
  const groupId = `shot-${shot.shotNumber}`;

  // Phase 4 — smart-suggest: detect multi-beat action content on a platform
  // without native multi-shot support.
  const [dismissedSuggestion, setDismissedSuggestion] = useState(false);
  const effectivePlatform = shot.platformOverride ?? targetPlatform;
  const multiBeatPattern = /\b(beat\s*[123]|shot\s*[123]|sequence|combo|combo|flurry|barrage|rapid[- ]?fire)\b/i;
  const showsMultiBeat = multiBeatPattern.test(shot.promptText) || multiBeatPattern.test(shot.description);
  const showPlatformSuggestion =
    !dismissedSuggestion &&
    effectivePlatform &&
    NO_MULTI_SHOT_PLATFORMS.has(effectivePlatform) &&
    showsMultiBeat &&
    shot.shotNumber > 0;

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
        'w-full rounded-xl border bg-surface-card/70 backdrop-blur-xl p-3.5 space-y-2.5 transition-colors',
        dragOver ? 'border-brand/70 ring-1 ring-brand/40 bg-brand/5' : shot.confirmed ? 'border-border' : 'border-brand/25'
      )}
    >
      {/* Header — Shot N, duration, reorder + delete controls */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-brand/10 text-brand border border-brand/25 shrink-0">
            <SquarePlay className="w-3 h-3" aria-hidden="true" />
            Shot {shot.shotNumber}
          </span>
          {shot.shotFunction && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-accent/15 text-accent border border-accent/30 shrink-0">
              {shot.shotFunction}
            </span>
          )}
          {shot.promptForm && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-brand/10 text-brand border border-brand/25 shrink-0">
              {PROMPT_FORM_LABELS[shot.promptForm] ?? shot.promptForm}
            </span>
          )}
          {shot.emotion && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-surface-muted text-text-secondary border border-border italic shrink-0">
              {shot.emotion}
            </span>
          )}
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
          {/* Phase 4 — prompt form override indicator */}
          {/* Phase 4 — prompt form override indicator */}
          {shot.promptFormOverride && shot.promptFormOverride !== 'auto' && (
            <span
              className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-warning/15 text-warning border border-warning/30"
              title={`Form pinned: ${PROMPT_FORM_LABELS[shot.promptFormOverride] ?? shot.promptFormOverride}`}
            >
              Pinned: {PROMPT_FORM_LABELS[shot.promptFormOverride] ?? shot.promptFormOverride}
            </span>
          )}
          {/* Phase 4 — platform override indicator */}
          {/* Phase 4 — platform override indicator */}
          {shot.platformOverride && (
            <span
              className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-accent/15 text-accent border border-accent/30"
              title={`Platform overridden: ${getPlatformSpec(shot.platformOverride)?.label ?? shot.platformOverride}`}
            >
              {getPlatformSpec(shot.platformOverride)?.label ?? shot.platformOverride}
            </span>
          )}
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

      {/* Phase 4 — smart-suggest: platform recommendation for multi-beat content */}
      {showPlatformSuggestion && (
        <div className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/5 p-2.5">
          <Eye className="w-3.5 h-3.5 text-warning mt-0.5 shrink-0" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-warning">Platform suggestion</p>
            <p className="text-[10px] text-text-secondary leading-relaxed mt-0.5">
              This shot contains multi-beat action content. {effectivePlatform && !NO_MULTI_SHOT_PLATFORMS.has(effectivePlatform) ? '' : `The current platform (${getPlatformSpec(effectivePlatform ?? targetPlatform ?? 'veo')?.label ?? 'unknown'}) doesn’t natively support multi-shot sequences — consider Kling or Seedance for better results.`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDismissedSuggestion(true)}
            className="p-0.5 rounded text-text-muted hover:text-text-secondary transition-colors shrink-0"
            aria-label="Dismiss suggestion"
          >
            <X className="w-3 h-3" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Phase 4 — shot-level customization controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Prompt form override selector */}
        <div className="relative">
          <label className="sr-only" htmlFor={`form-override-${shot.id}`}>Prompt form override</label>
          <select
            id={`form-override-${shot.id}`}
            value={shot.promptFormOverride ?? 'auto'}
            onChange={(e) => {
              const val = e.target.value as PromptForm | 'auto';
              onChange?.({ promptFormOverride: val === 'auto' ? undefined : val });
            }}
            className="appearance-none px-2 py-1 pr-5 rounded-lg text-[9px] font-semibold bg-surface-muted text-text-secondary border border-border hover:border-brand/40 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/50"
            title="Override the AI's prompt form choice for this shot"
          >
            {PROMPT_FORM_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Custom label chip (for minimal-labeled form) */}
        {(shot.promptFormOverride === 'minimal-labeled' || shot.promptForm === 'minimal-labeled') && (
          <input
            type="text"
            value={shot.customLabel ?? ''}
            onChange={(e) => onChange?.({ customLabel: e.target.value || undefined })}
            placeholder="Add a label (e.g. Sound cue)"
            aria-label="Custom label for minimal-labeled form"
            className="px-2 py-1 rounded-lg text-[9px] font-semibold bg-surface-muted text-text-secondary border border-border hover:border-brand/40 transition-colors focus:outline-none focus:ring-2 focus:ring-brand/50 w-36 placeholder:text-text-muted"
          />
        )}

        {/* Platform override selector */}
        <div className="relative">
          <label className="sr-only" htmlFor={`platform-override-${shot.id}`}>Platform override</label>
          <select
            id={`platform-override-${shot.id}`}
            value={shot.platformOverride ?? ''}
            onChange={(e) => {
              const val = e.target.value as VideoTargetPlatform | '';
              onChange?.({ platformOverride: val ? val : undefined });
            }}
            className="appearance-none px-2 py-1 pr-5 rounded-lg text-[9px] font-semibold bg-surface-muted text-text-secondary border border-border hover:border-brand/40 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/50"
            title="Override the project's platform for this shot only"
          >
            <option value="">Inherit project</option>
            {PLATFORM_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Negative prompt — editable on the confirmed shot, persisted via timeline */}
      <NegativePromptField
        value={shot.negativePrompt ?? ''}
        onChange={(negativePrompt) => onChange?.({ negativePrompt })}
        hasDialogue={(shot.dialogue?.length ?? 0) > 0}
        promptText={shot.promptText}
      />

      {/* Dialect selector + live preview */}
      <div className="space-y-1.5">
        <DialectTabs value={dialectId} onChange={setDialectId} groupId={groupId} targetPlatform={targetPlatform} />
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
        {/* Phase F5 — prompt-enhancer awareness note */}
        <div className="flex items-center gap-1.5 text-[10px] text-text-muted px-0.5">
          <Sparkles className="w-3 h-3 text-brand shrink-0" aria-hidden="true" />
          <span>Tip: Turn off platform prompt auto-enhancers (e.g. LTX enhancer) — this prompt is already calibrated and specific.</span>
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
