'use client';

import React, { useCallback, useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  FileText,
  Package,
} from 'lucide-react';
import type { VideoProject } from '@/types/video';
import { analyzePacing } from '@/lib/video/pacing';
import { buildMusicBrief } from '@/lib/video/scoring';
import {
  buildAllVoiceTrackPackages,
  type VoiceTrackPackage,
} from '@/lib/video/voice-pipeline';
import { getPlatformSpec } from '@/lib/video/platforms';
import { useInlineCopy } from '@/lib/use-inline-copy';
import { cn } from '@/lib/utils';

interface AssemblyExportProps {
  project: VideoProject;
}

/**
 * Phase 7 — assembly package export. Bundles one complete document covering:
 *   - Ordered shots with prompts, durations, scene/function tags, platform
 *   - Voice-track references (Phase 5)
 *   - Music/SFX brief derived from pacing
 *
 * The director copies or downloads the assembled document for handoff to
 * their downstream tools. No rendering or editing happens here.
 */
export function AssemblyExport({ project }: AssemblyExportProps) {
  const [expanded, setExpanded] = useState(false);
  const { copiedKey, copy } = useInlineCopy(2000);

  const shots = useMemo(
    () =>
      [...(project.shots ?? [])]
        .filter((s) => s.confirmed)
        .sort((a, b) => a.shotNumber - b.shotNumber),
    [project.shots],
  );

  const musicBrief = useMemo(() => buildMusicBrief(project), [project]);

  const platformSpec = project.targetPlatform
    ? getPlatformSpec(project.targetPlatform)
    : undefined;

  const voicePackages = useMemo(
    () =>
      buildAllVoiceTrackPackages(
        project.shots,
        project.storyBible?.characters ?? [],
        platformSpec,
      ),
    [project.shots, project.storyBible?.characters, platformSpec],
  );

  // Build the full assembly document
  const assemblyDocument = useMemo(
    () => buildAssemblyDocument(project, shots, musicBrief, voicePackages),
    [project, shots, musicBrief, voicePackages],
  );

  const copiedDoc = copiedKey === 'assembly-export';

  const handleDownload = useCallback(() => {
    const blob = new Blob([assemblyDocument], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-assembly.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [assemblyDocument, project.name]);

  if (shots.length === 0) return (
    <div className="rounded-2xl border border-border bg-surface-card/70 backdrop-blur-xl p-4">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted mb-3">
        <Package className="w-3.5 h-3.5 text-brand" aria-hidden="true" />
        Assembly Package
      </div>
      <div className="rounded-xl border border-dashed border-border bg-surface-code/40 px-5 py-5 text-center">
        <Package className="w-5 h-5 text-brand/40 mx-auto" aria-hidden="true" />
        <p className="mt-2 text-xs font-semibold text-text-primary">No assembly yet</p>
        <p className="mt-1 text-[11px] text-text-muted leading-relaxed max-w-xs mx-auto">
          Approve at least one shot to build a copyable assembly package.
        </p>
      </div>
    </div>
  );

  const dialogueShotCount = voicePackages.filter(
    (vp) => vp.lines.length > 0,
  ).length;
  const voiceLineCount = voicePackages.reduce(
    (sum, vp) => sum + vp.lines.length,
    0,
  );

  return (
    <div className="rounded-2xl border border-border bg-surface-card/70 backdrop-blur-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
          <Package className="w-3.5 h-3.5 text-brand" aria-hidden="true" />
          Assembly Package
        </div>
        <div className="flex items-center gap-1.5">
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
                <ChevronDown className="w-3 h-3" aria-hidden="true" /> Preview
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-brand/10 text-brand border border-brand/25 tabular-nums">
          <FileText className="w-3 h-3" aria-hidden="true" />
          {shots.length} shot{shots.length === 1 ? '' : 's'}
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-accent/10 text-accent border border-accent/25 tabular-nums">
          {Math.floor(musicBrief.totalDuration / 60)}m{' '}
          {musicBrief.totalDuration % 60}s total
        </span>
        {dialogueShotCount > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-success/10 text-success border border-success/25 tabular-nums">
            {voiceLineCount} voice line{voiceLineCount === 1 ? '' : 's'}
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => void copy(assemblyDocument, 'assembly-export')}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold text-white transition-all',
            'bg-brand hover:bg-brand-hover shadow-glow active:scale-[0.985]',
            copiedDoc && 'from-success to-success bg-none',
          )}
        >
          {copiedDoc ? (
            <>
              <Check className="w-3 h-3" aria-hidden="true" /> Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" aria-hidden="true" /> Copy Document
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold bg-surface-muted text-text-secondary border border-border hover:bg-surface-hover hover:border-brand/30 transition-colors"
        >
          <Download className="w-3 h-3" aria-hidden="true" /> Download .md
        </button>
      </div>

      {/* Expanded preview */}
      {expanded && (
        <div className="rounded-xl border border-border bg-surface-code p-3 max-h-80 overflow-y-auto scrollbar-thin">
          <pre className="whitespace-pre-wrap break-words text-[10px] leading-relaxed text-text-secondary font-mono">
            {assemblyDocument}
          </pre>
        </div>
      )}
    </div>
  );
}

// ── Assembly document builder ───────────────────────────────────────────────

function buildAssemblyDocument(
  project: VideoProject,
  shots: VideoProject['shots'],
  musicBrief: ReturnType<typeof buildMusicBrief>,
  voicePackages: VoiceTrackPackage[],
): string {
  const lines: string[] = [];

  // ── Header ──────────────────────────────────────────────────────
  lines.push(`# Assembly Package: ${project.name}`);
  lines.push('');
  lines.push(
    `Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
  );
  if (project.targetPlatform) {
    const spec = getPlatformSpec(project.targetPlatform);
    lines.push(`Target platform: ${spec?.label ?? project.targetPlatform}`);
  }
  lines.push(`Total shots: ${shots.length}`);
  lines.push(
    `Total runtime: ${Math.floor(musicBrief.totalDuration / 60)}m ${musicBrief.totalDuration % 60}s`,
  );
  lines.push('');

  // ── Shot list ───────────────────────────────────────────────────
  lines.push('---');
  lines.push('');
  lines.push('## Shot List');
  lines.push('');

  for (const shot of shots) {
    const effectivePlatform =
      shot.platformOverride ?? project.targetPlatform ?? null;
    const spec = effectivePlatform ? getPlatformSpec(effectivePlatform) : null;

    lines.push(`### Shot ${shot.shotNumber}`);
    lines.push('');
    lines.push(`- **Duration:** ${shot.durationSeconds}s`);
    if (shot.sceneNumber != null) lines.push(`- **Scene:** ${shot.sceneNumber}`);
    if (shot.shotFunction) lines.push(`- **Function:** ${shot.shotFunction}`);
    if (shot.emotion) lines.push(`- **Emotion:** ${shot.emotion}`);
    if (spec) lines.push(`- **Platform:** ${spec.label}`);
    if (shot.description) lines.push(`- **Description:** ${shot.description}`);
    lines.push('');
    lines.push('**Prompt:**');
    lines.push('```');
    lines.push(shot.promptText);
    lines.push('```');
    lines.push('');

    if (shot.dialogue && shot.dialogue.length > 0) {
      lines.push('**Dialogue:**');
      for (const d of shot.dialogue) {
        const delivery = d.tone ? ` (${d.tone})` : '';
        lines.push(`> ${d.speaker}${delivery}: "${d.line}"`);
      }
      lines.push('');
    }

    if (shot.negativePrompt) {
      lines.push(`**Negative:** ${shot.negativePrompt}`);
      lines.push('');
    }

    lines.push('---');
    lines.push('');
  }

  // ── Voice tracks ────────────────────────────────────────────────
  const dialoguePackages = voicePackages.filter((vp) => vp.lines.length > 0);
  if (dialoguePackages.length > 0) {
    lines.push('## Voice Tracks');
    lines.push('');
    lines.push(
      'The following shots require external voice generation (platform lacks native dialogue audio):',
    );
    lines.push('');

    for (const pkg of dialoguePackages) {
      lines.push(`### Shot ${pkg.shotNumber} — ${pkg.platformId}`);
      lines.push('');
      for (const line of pkg.lines) {
        lines.push(
          `- **${line.speakerName}:** "${line.text}" — delivery: ${line.delivery} (${line.targetDurationMs}ms target)`,
        );
      }
      lines.push('');
      lines.push(`> ${pkg.syncInstructions}`);
      lines.push('');
    }
  }

  // ── Music brief ─────────────────────────────────────────────────
  lines.push('## Music & SFX Brief');
  lines.push('');
  lines.push(musicBrief.promptText);

  return lines.join('\n');
}
