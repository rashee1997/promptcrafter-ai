'use client';

import React, { useMemo } from 'react';
import {
  Activity,
  BookOpen,
  CheckCircle2,
  Clapperboard,
  Clock,
  FileText,
  Layers,
  Lock,
  MapPin,
  Music,
  Palette,
  Target,
  Timer,
  Users,
  Zap,
} from 'lucide-react';
import type { VideoProject } from '@/types/video';
import { getPlatformSpec } from '@/lib/video/platforms';
import { cn } from '@/lib/utils';
import { StatusBadge } from '../project-card';

interface ProjectOverviewProps {
  project: VideoProject;
}

/**
 * Phase 8 — ProjectOverview: a real project dashboard, not "wherever you
 * left off." Opening a project lands on this genuine overview:
 *   - Bootstrap-stage progress
 *   - Shot count and total runtime
 *   - Confirmed character/location/voice counts
 *   - Style + platform badges
 *   - Last-edited time
 *   - Clear path into Story Bible / Storyboard / Production Notes
 */
export function ProjectOverview({ project }: ProjectOverviewProps) {
  const stats = useMemo(() => {
    const shots = project.shots ?? [];
    const confirmed = shots.filter((s) => s.confirmed);
    const totalDuration = confirmed.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
    const characters = project.storyBible?.characters ?? [];
    const locations = project.storyBible?.locations ?? [];
    const voices = characters.filter((c) => c.voice).length;
    const hasDialogue = confirmed.filter((s) => (s.dialogue?.length ?? 0) > 0).length;

    // Bootstrap progress
    const completedStages: string[] = [];
    if (project.targetPlatform) completedStages.push('Platform');
    if (project.storyTreatment) completedStages.push('Story');
    if (project.scriptDialogue) completedStages.push('Dialogue');
    if (project.screenplay) completedStages.push('Screenplay');
    if (project.directionPlan) completedStages.push('Direction');
    if (characters.length > 0) completedStages.push('Characters');
    if (locations.length > 0) completedStages.push('Locations');
    if (project.storyBible?.style) completedStages.push('Style');
    if (project.storyBible?.effects) completedStages.push('VFX');

    return {
      totalShots: confirmed.length,
      totalDuration,
      characterCount: characters.length,
      locationCount: locations.length,
      voiceCount: voices,
      dialogueShotCount: hasDialogue,
      completedStages,
      platformSpec: project.targetPlatform
        ? getPlatformSpec(project.targetPlatform)
        : null,
      style: project.storyBible?.style,
      effects: project.storyBible?.effects,
    };
  }, [project]);

  const lastEdited = new Date(project.updatedAt);
  const timeAgo = getTimeAgo(project.updatedAt);

  return (
    <div className="space-y-4">
      {/* Project identity bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold tracking-tight text-text-primary truncate">
              {project.name}
            </h2>
            <StatusBadge status={project.status} />
          </div>
          <p className="mt-0.5 text-[10px] text-text-muted">
            Last edited {timeAgo} · {project.customInstructions.trim().slice(0, 80)
              || 'No directorial brief'}
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        <StatCard
          icon={<Clapperboard className="w-4 h-4 text-brand" />}
          label="Shots"
          value={stats.totalShots}
        />
        <StatCard
          icon={<Timer className="w-4 h-4 text-accent" />}
          label="Runtime"
          value={`${Math.floor(stats.totalDuration / 60)}m ${stats.totalDuration % 60}s`}
        />
        <StatCard
          icon={<Users className="w-4 h-4 text-accent" />}
          label="Characters"
          value={stats.characterCount}
        />
        <StatCard
          icon={<MapPin className="w-4 h-4 text-accent" />}
          label="Locations"
          value={stats.locationCount}
        />
        <StatCard
          icon={<Music className="w-4 h-4 text-accent" />}
          label="Voices"
          value={stats.voiceCount}
        />
      </div>

      {/* Badges row */}
      <div className="flex flex-wrap items-center gap-2">
        {stats.platformSpec && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-brand/10 text-brand border border-brand/25">
            <Target className="w-3 h-3" aria-hidden="true" />
            {stats.platformSpec.label}
          </span>
        )}
        {stats.style && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-brand/10 text-brand border border-brand/25">
            <Palette className="w-3 h-3" aria-hidden="true" />
            {stats.style.styleId ?? 'Custom style'}
          </span>
        )}
        {stats.effects && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-warning/10 text-warning border border-warning/25">
            <Zap className="w-3 h-3" aria-hidden="true" />
            VFX locked
          </span>
        )}
      </div>

      {/* Bootstrap progress — only for active projects */}
      {project.status === 'active' && stats.completedStages.length > 0 && (
        <div className="rounded-xl border border-border/70 bg-surface-muted/50 p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">
            <CheckCircle2 className="w-3 h-3 text-success" aria-hidden="true" />
            Bootstrap stages completed
          </div>
          <div className="flex flex-wrap gap-1.5">
            {stats.completedStages.map((stage) => (
              <span
                key={stage}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-success/10 text-success border border-success/25"
              >
                <CheckCircle2 className="w-2.5 h-2.5" aria-hidden="true" />
                {stage}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Dialogue stats */}
      {stats.dialogueShotCount > 0 && (
        <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
          <FileText className="w-3 h-3 text-accent" aria-hidden="true" />
          {stats.dialogueShotCount} shot{stats.dialogueShotCount === 1 ? '' : 's'} with dialogue
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-card/60 p-3 space-y-1">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
          {label}
        </span>
      </div>
      <p className="text-lg font-bold text-text-primary tabular-nums">{value}</p>
    </div>
  );
}

function getTimeAgo(ts: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'yesterday' : `${d}d ago`;
}
