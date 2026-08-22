'use client';

import React, { useState } from 'react';
import { Check, RefreshCw, ScrollText, Sparkles } from 'lucide-react';
import type { StoryTreatment } from '@/types/video';
import { STRUCTURE_FRAMEWORKS, type StructureFramework } from '@/lib/video/bootstrap/structure-frameworks';
import { cn } from '@/lib/utils';

interface BootstrapStoryStepProps {
  data: StoryTreatment;
  busy: boolean;
  onRevise: (prompt: string) => void;
  onConfirm: () => void;
  /** Called when the director wants to regenerate a single beat. */
  onRegenerateBeat?: (actIndex: number, beatIndex: number, note?: string) => void;
  /** Currently selected framework id (for display). */
  frameworkId?: string;
  /** Called when framework is changed before generation (only when no data yet). */
  onChangeFramework?: (id: string | null) => void;
}

const ACT_TITLES = ['Act I', 'Act II', 'Act III'];

/**
 * Stage 1 review — prose story treatment. Shows logline, premise, emotional
 * arc, theme, three acts with beats (with framework metadata when available),
 * and ending image. Supports per-beat regeneration.
 */
export function BootstrapStoryStep({
  data,
  busy,
  onRevise,
  onConfirm,
  onRegenerateBeat,
  frameworkId,
}: BootstrapStoryStepProps) {
  const [revision, setRevision] = useState('');
  const [regenBeat, setRegenBeat] = useState<{ act: number; beat: number } | null>(null);
  const [regenNote, setRegenNote] = useState('');

  const handleRevise = () => {
    if (!revision.trim() || busy) return;
    onRevise(revision.trim());
    setRevision('');
  };

  const handleRegenBeat = () => {
    if (!regenBeat || busy) return;
    onRegenerateBeat?.(regenBeat.act, regenBeat.beat, regenNote.trim() || undefined);
    setRegenBeat(null);
    setRegenNote('');
  };

  const framework = frameworkId
    ? STRUCTURE_FRAMEWORKS.find((f) => f.id === frameworkId)
    : null;

  return (
    <div className="space-y-4">
      {/* Framework badge */}
      {framework && (
        <div className="flex items-center gap-2 rounded-xl border border-brand/20 bg-brand/5 px-3 py-2">
          <Sparkles className="w-3.5 h-3.5 text-brand shrink-0" aria-hidden="true" />
          <p className="text-xs text-text-secondary">
            Structured using{' '}
            <span className="font-bold text-brand">{framework.label}</span>
            {' '}— each beat maps to a named story beat
          </p>
        </div>
      )}

      {/* Logline */}
      <div className="rounded-xl border border-brand/30 bg-brand/5 p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-brand flex items-center gap-1.5">
          <ScrollText className="w-3 h-3" aria-hidden="true" />
          Logline
        </p>
        <p className="mt-1.5 text-sm text-text-primary leading-relaxed">{data.logline}</p>
      </div>

      {/* Premise */}
      <div className="rounded-xl border border-border bg-surface-card/60 p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">Premise</p>
        <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">{data.premise}</p>
      </div>

      {/* Emotional arc + theme */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 rounded-xl border border-border bg-surface-card/60 p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Emotional arc</p>
          <p className="mt-1 text-xs text-text-secondary leading-relaxed">{data.emotionalArc}</p>
        </div>
        <div className="sm:w-48 rounded-xl border border-border bg-surface-card/60 p-3.5 shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Theme</p>
          <p className="mt-1 text-xs text-text-secondary leading-relaxed">{data.theme}</p>
        </div>
      </div>

      {/* Acts */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-2">Story acts</p>
        <div className="grid gap-2">
          {data.acts.map((act, actIdx) => (
            <div key={actIdx} className="flex gap-3 rounded-xl border border-border bg-surface-card/60 p-3.5">
              <span className="shrink-0 w-7 h-7 rounded-lg bg-brand/10 border border-brand/25 text-brand text-[10px] font-bold flex items-center justify-center tabular-nums">
                {act.act}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wide text-text-muted">
                  {ACT_TITLES[actIdx]} — {act.title}
                </p>
                <div className="mt-1 space-y-2">
                  {act.beats.map((beat, beatIdx) => (
                    <div key={beatIdx} className="group/beat relative">
                      <div className="flex items-start gap-2">
                        <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-brand/40" />
                        <div className="min-w-0 flex-1">
                          {/* Beat name + purpose (framework mode) */}
                          {beat.name && (
                            <p className="text-xs font-semibold text-text-primary">
                              {beat.name}
                              {beat.purpose && (
                                <span className="ml-1.5 text-[10px] font-normal text-text-muted">
                                  — {beat.purpose}
                                </span>
                              )}
                            </p>
                          )}
                          <p className="text-xs text-text-secondary leading-relaxed">
                            {beat.text}
                          </p>
                        </div>
                        {/* Per-beat regenerate button */}
                        {onRegenerateBeat && (
                          <button
                            type="button"
                            onClick={() => setRegenBeat(regenBeat?.act === actIdx && regenBeat.beat === beatIdx ? null : { act: actIdx, beat: beatIdx })}
                            disabled={busy}
                            title={`Regenerate this beat only`}
                            className={cn(
                              'shrink-0 p-1 rounded-md text-text-muted hover:text-brand hover:bg-brand/10 transition-colors opacity-0 group-hover/beat:opacity-100',
                              busy && 'opacity-40 cursor-not-allowed'
                            )}
                          >
                            <RefreshCw className="w-3 h-3" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                      {/* Inline beat regeneration input */}
                      {regenBeat?.act === actIdx && regenBeat.beat === beatIdx && (
                        <div className="ml-3.5 mt-1.5 flex gap-1.5">
                          <input
                            type="text"
                            value={regenNote}
                            onChange={(e) => setRegenNote(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleRegenBeat(); }}
                            placeholder="Note for this beat (optional)"
                            aria-label={`Revision note for beat ${beat.name ?? beatIdx + 1}`}
                            className="flex-1 px-2 py-1 rounded-lg text-[11px] bg-surface-input border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/70 transition-shadow"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={handleRegenBeat}
                            disabled={busy}
                            className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-brand/10 text-brand border border-brand/25 hover:bg-brand/15 transition-colors shrink-0"
                          >
                            <RefreshCw className={cn('w-3 h-3', busy && 'animate-spin')} aria-hidden="true" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ending image */}
      <div className="rounded-xl border border-border bg-surface-card/60 p-3.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Ending image</p>
        <p className="mt-1 text-xs text-text-secondary leading-relaxed italic">{data.endingImage}</p>
      </div>

      {/* Revision + confirm */}
      <div className="flex flex-col gap-2.5">
        <div className="flex gap-2">
          <input
            type="text"
            value={revision}
            onChange={(e) => setRevision(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleRevise(); }}
            placeholder={'Revise the treatment — e.g. "make the ending more bittersweet"'}
            aria-label="Revision note for the story treatment"
            className="flex-1 px-3 py-2 rounded-xl text-xs bg-surface-input border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/70 transition-shadow"
          />
          <button
            type="button"
            onClick={handleRevise}
            disabled={!revision.trim() || busy}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors shrink-0',
              revision.trim() && !busy
                ? 'bg-surface-muted text-text-secondary border-border hover:border-brand/40 hover:text-brand'
                : 'opacity-40 cursor-not-allowed'
            )}
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            Revise
          </button>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={cn(
              'inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl text-white',
              'bg-brand hover:bg-brand-hover shadow-glow active:scale-[0.985] transition-all',
              busy && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Check className="w-4 h-4" aria-hidden="true" />
            Confirm story
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Framework picker — shown before generation when no story data exists.
 */
export function FrameworkPicker({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <div className="space-y-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
        Story structure framework
      </p>
      <div className="grid sm:grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={cn(
            'rounded-xl border p-3 text-left transition-all text-xs',
            selectedId === null
              ? 'border-brand/50 bg-brand/5 shadow-lg shadow-brand/10'
              : 'border-border bg-surface-card/60 hover:border-brand/30'
          )}
        >
          <p className="font-bold text-text-primary">Let AI choose</p>
          <p className="mt-0.5 text-[10px] text-text-muted leading-relaxed">
            AI picks the best framework based on your genre and tone
          </p>
        </button>
        {STRUCTURE_FRAMEWORKS.map((fw) => (
          <button
            key={fw.id}
            type="button"
            onClick={() => onSelect(fw.id)}
            className={cn(
              'rounded-xl border p-3 text-left transition-all text-xs',
              selectedId === fw.id
                ? 'border-brand/50 bg-brand/5 shadow-lg shadow-brand/10'
                : 'border-border bg-surface-card/60 hover:border-brand/30'
            )}
          >
            <p className="font-bold text-text-primary">{fw.label}</p>
            <p className="mt-0.5 text-[10px] text-text-muted leading-relaxed">
              {fw.description}
            </p>
            <p className="mt-1 text-[10px] text-text-secondary">
              {fw.beats.length} named beats
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
