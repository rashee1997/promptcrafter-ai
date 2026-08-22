'use client';

import React, { useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Music,
  Mic,
  Volume2,
} from 'lucide-react';
import type { VideoProject } from '@/types/video';
import { buildMusicBrief, type MusicBrief, type CueSheetEntry } from '@/lib/video/scoring';
import { useInlineCopy } from '@/lib/use-inline-copy';
import { cn } from '@/lib/utils';

interface MusicBriefPanelProps {
  project: VideoProject;
}

/**
 * Phase 7 — music/SFX prompt generation panel. Displays a music brief
 * derived from actual shot pacing: energy arc, tempo map, cue sheet,
 * instrumentation, and a ready-to-paste prompt for an external music tool.
 */
export function MusicBriefPanel({ project }: MusicBriefPanelProps) {
  const brief = useMemo(() => buildMusicBrief(project), [project]);
  const [expanded, setExpanded] = useState(false);
  const { copiedKey, copy } = useInlineCopy(2000);

  const confirmedShots = project.shots.filter((s) => s.confirmed);
  if (confirmedShots.length === 0) return (
    <div className="rounded-2xl border border-border bg-surface-card/70 backdrop-blur-xl p-6">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted mb-3">
        <Music className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
        Music & SFX Brief
      </div>
      <div className="rounded-xl border border-dashed border-border bg-surface-code/40 px-5 py-6 text-center">
        <Music className="w-5 h-5 text-accent/40 mx-auto" aria-hidden="true" />
        <p className="mt-2 text-xs font-semibold text-text-primary">No music brief yet</p>
        <p className="mt-1 text-[11px] text-text-muted leading-relaxed max-w-xs mx-auto">
          Approve at least one shot to generate a music and SFX brief from your pacing data.
        </p>
      </div>
    </div>
  );

  const copiedPrompt = copiedKey === 'music-brief-prompt';

  return (
    <div className="rounded-2xl border border-border bg-surface-card/70 backdrop-blur-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
          <Music className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
          Music &amp; SFX Brief
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border border-border text-text-secondary hover:bg-surface-hover hover:border-brand/30 transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3 h-3" aria-hidden="true" /> Collapse
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" aria-hidden="true" /> Expand
            </>
          )}
        </button>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-accent/10 text-accent border border-accent/25">
          {brief.genre}
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-surface-muted text-text-secondary border border-border tabular-nums">
          <Volume2 className="w-3 h-3" aria-hidden="true" />
          {brief.overallBpmRange} BPM
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-surface-muted text-text-secondary border border-border">
          {brief.keySignature}
        </span>
        {brief.moodTags.length > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-brand/10 text-brand border border-brand/20">
            {brief.moodTags.slice(0, 3).join(', ')}
          </span>
        )}
      </div>

      {/* Energy arc */}
      <div className="rounded-xl border border-border/70 bg-surface-muted/50 p-2.5">
        <p className="text-[9px] font-bold uppercase tracking-wider text-text-muted mb-1">
          Energy Arc
        </p>
        <p className="text-[10px] text-text-secondary leading-relaxed">
          {brief.energyArc}
        </p>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="space-y-3">
          {/* Instrumentation */}
          <div className="rounded-xl border border-border/70 bg-surface-muted/50 p-2.5">
            <p className="text-[9px] font-bold uppercase tracking-wider text-text-muted mb-1">
              Instrumentation
            </p>
            <div className="flex flex-wrap gap-1">
              {brief.instrumentation.map((inst) => (
                <span
                  key={inst}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-semibold bg-surface-card text-text-secondary border border-border"
                >
                  {inst}
                </span>
              ))}
            </div>
          </div>

          {/* Avoidances */}
          {brief.avoidances.length > 0 && (
            <div className="rounded-xl border border-danger/20 bg-danger/5 p-2.5">
              <p className="text-[9px] font-bold uppercase tracking-wider text-danger mb-1">
                Avoid
              </p>
              <ul className="space-y-0.5">
                {brief.avoidances.map((a) => (
                  <li
                    key={a}
                    className="text-[10px] text-text-secondary leading-relaxed list-disc list-inside"
                  >
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tempo map */}
          <div className="rounded-xl border border-border/70 bg-surface-muted/50 p-2.5">
            <p className="text-[9px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
              Act Tempo Map
            </p>
            <div className="space-y-1">
              {brief.tempoSuggestions.map((tempo) => (
                <div
                  key={tempo.actNumber}
                  className="flex items-center gap-2 text-[10px]"
                >
                  <span className="font-bold text-text-primary tabular-nums">
                    Act {tempo.actNumber}
                  </span>
                  <span className="text-text-muted">—</span>
                  <span className="font-semibold text-accent tabular-nums">
                    {tempo.bpm} BPM
                  </span>
                  <span className="text-text-muted">{tempo.timeSignature}</span>
                  <span className="text-text-secondary italic">{tempo.feel}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cue sheet */}
          <div className="rounded-xl border border-border/70 bg-surface-muted/50 p-2.5">
            <p className="text-[9px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
              Cue Sheet ({brief.cueSheet.length} cues)
            </p>
            <div className="max-h-48 overflow-y-auto scrollbar-thin">
              <table className="w-full text-[9px]">
                <thead>
                  <tr className="text-left text-text-muted border-b border-border/50">
                    <th className="pb-1 pr-2 font-semibold">#</th>
                    <th className="pb-1 pr-2 font-semibold">TC</th>
                    <th className="pb-1 pr-2 font-semibold">Shot</th>
                    <th className="pb-1 pr-2 font-semibold">Type</th>
                    <th className="pb-1 pr-2 font-semibold">Energy</th>
                    <th className="pb-1 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {brief.cueSheet.map((cue) => (
                    <CueRow key={cue.cueNumber} cue={cue} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Voice track notes */}
          {brief.voiceTrackNotes.length > 0 && (
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <Mic className="w-3 h-3 text-accent" aria-hidden="true" />
                <p className="text-[9px] font-bold uppercase tracking-wider text-accent">
                  Voice Track Notes
                </p>
              </div>
              <ul className="space-y-0.5">
                {brief.voiceTrackNotes.map((n) => (
                  <li
                    key={n}
                    className="text-[10px] text-text-secondary leading-relaxed list-disc list-inside"
                  >
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Copy prompt */}
          <div className="rounded-xl border border-border bg-surface-code p-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-bold uppercase tracking-wider text-text-muted">
                Ready-to-paste prompt
              </p>
              <button
                type="button"
                onClick={() => void copy(brief.promptText, 'music-brief-prompt')}
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-white transition-all',
                  'bg-brand hover:bg-brand-hover shadow-glow active:scale-[0.985]',
                  copiedPrompt && 'from-success to-success bg-none',
                )}
              >
                {copiedPrompt ? (
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
            <pre className="whitespace-pre-wrap break-words text-[10px] leading-relaxed text-text-secondary font-mono max-h-56 overflow-y-auto scrollbar-thin">
              {brief.promptText}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Cue sheet row ───────────────────────────────────────────────────────────

const CUE_TYPE_STYLES: Record<string, string> = {
  'ambient-bed': 'bg-surface-muted text-text-secondary',
  sting: 'bg-accent/15 text-accent',
  hit: 'bg-danger/15 text-danger',
  build: 'bg-warning/15 text-warning',
  release: 'bg-success/15 text-success',
  transition: 'bg-brand/15 text-brand',
  silence: 'bg-surface-muted text-text-muted',
};

function CueRow({ cue }: { cue: CueSheetEntry }) {
  return (
    <tr className="border-b border-border/30 last:border-0">
      <td className="py-1 pr-2 font-mono text-text-muted">{cue.cueNumber}</td>
      <td className="py-1 pr-2 font-mono text-text-secondary tabular-nums">
        {cue.timecodeStart}
      </td>
      <td className="py-1 pr-2 font-semibold text-brand tabular-nums">
        {cue.shotNumber}
      </td>
      <td className="py-1 pr-2">
        <span
          className={cn(
            'inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold',
            CUE_TYPE_STYLES[cue.cueType] ?? 'bg-surface-muted text-text-muted',
          )}
        >
          {cue.cueType}
        </span>
      </td>
      <td className="py-1 pr-2">
        <div className="flex items-center gap-1">
          <div className="w-8 h-1.5 rounded-full bg-surface-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${cue.energy * 100}%` }}
            />
          </div>
          <span className="font-mono text-text-muted tabular-nums text-[8px]">
            {Math.round(cue.energy * 100)}%
          </span>
        </div>
      </td>
      <td className="py-1 text-text-secondary leading-relaxed">
        {cue.description}
        {cue.hasDialogue && (
          <span className="ml-1 text-accent font-semibold">[duking]</span>
        )}
      </td>
    </tr>
  );
}
