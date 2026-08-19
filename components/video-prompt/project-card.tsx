'use client';

import React, { useEffect, useState } from 'react';
import { Check, Clapperboard, SquarePlay, Trash2, Users, X } from 'lucide-react';
import type { ProjectStatus, VideoProject } from '@/types/video';
import { cn } from '@/lib/utils';

export type VideoViewMode = 'grid' | 'list';

/** Relative "updated" time, mirroring the Saved Gallery formatting. */
function timeAgo(ts: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'yesterday' : `${d}d ago`;
}

/** Draft = slate/amber, Active = emerald/purple (DESIGN.md status language). */
export function StatusBadge({ status }: { status: ProjectStatus }) {
  const active = status === 'active';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border shrink-0',
        active
          ? 'bg-success/10 text-success border-success/25'
          : 'bg-warning/10 text-warning border-warning/25'
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', active ? 'bg-success' : 'bg-warning')} />
      {active ? 'Active' : 'Draft'}
    </span>
  );
}

function MetricChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-surface-muted text-text-secondary border border-border">
      {icon}
      {label}
    </span>
  );
}

interface ProjectCardProps {
  project: VideoProject;
  viewMode: VideoViewMode;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * Production portfolio card — one project in Grid or Dense List layout.
 * Glassmorphic surface with a hover glow; status badge, shot/character
 * metrics, relative update time, brief truncation, and quick actions
 * (Open + two-step Delete confirmation).
 */
export function ProjectCard({ project, viewMode, onSelect, onDelete }: ProjectCardProps) {
  const [confirming, setConfirming] = useState(false);

  // Auto-cancel a pending delete confirmation after 4s.
  useEffect(() => {
    if (!confirming) return;
    const t = setTimeout(() => setConfirming(false), 4000);
    return () => clearTimeout(t);
  }, [confirming]);

  const characterCount = project.storyBible?.characters?.length ?? 0;
  const shotLabel = `${project.shots.length} shot${project.shots.length === 1 ? '' : 's'}`;
  const charLabel = `${characterCount} character${characterCount === 1 ? '' : 's'}`;
  const brief = project.customInstructions.trim();

  const handleSelect = () => onSelect(project.id);
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirming(true);
  };
  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirming(false);
  };
  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirming(false);
    onDelete(project.id);
  };

  const deleteControl = confirming ? (
    <span
      onClick={(e) => e.stopPropagation()}
      className="flex items-center gap-1"
      role="group"
      aria-label="Confirm deleting this project"
    >
      <span className="text-[10px] font-bold text-danger uppercase tracking-wide">Delete?</span>
      <button
        type="button"
        onClick={handleConfirmDelete}
        aria-label="Confirm delete project"
        className="p-1.5 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
      >
        <Check className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={handleCancelDelete}
        aria-label="Cancel delete"
        className="p-1.5 rounded-lg text-text-muted hover:bg-surface-hover hover:text-text-primary transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </span>
  ) : (
    <button
      type="button"
      onClick={handleDeleteClick}
      aria-label={`Delete project ${project.name}`}
      title="Delete project"
      className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );

  const metrics = (
    <div className="flex items-center gap-1.5">
      <MetricChip icon={<SquarePlay className="w-3 h-3 text-brand" />} label={shotLabel} />
      <MetricChip icon={<Users className="w-3 h-3 text-accent" />} label={charLabel} />
    </div>
  );

  const openControl = (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        handleSelect();
      }}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-brand/10 text-brand border border-brand/25 hover:bg-brand/15 transition-colors"
    >
      <SquarePlay className="w-3 h-3" />
      Open
    </button>
  );

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open project ${project.name}`}
      onClick={handleSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSelect();
        }
      }}
      className={cn(
        'group relative rounded-2xl border border-border bg-surface-card/70 backdrop-blur-xl shadow-sm',
        'transition-all duration-300 cursor-pointer select-none hover:shadow-xl hover:shadow-brand/10',
        'hover:border-brand/40 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-brand/60',
        'flex gap-3',
        viewMode === 'grid' ? 'flex-col p-4' : 'items-center p-3.5',
        confirming && 'border-danger/40'
      )}
    >
      {/* 1px top "shine" highlight — glass stack (DESIGN.md elevation rules). */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-white/15 to-transparent"
      />

      {viewMode === 'grid' ? (
        <>
          <div className="flex items-start justify-between gap-2 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <Clapperboard className="w-4 h-4 text-brand shrink-0" />
                <h3 className="text-sm font-bold text-text-primary truncate">{project.name}</h3>
              </div>
              <p className="mt-0.5 text-[10px] text-text-muted">Updated {timeAgo(project.updatedAt)}</p>
            </div>
            <StatusBadge status={project.status} />
          </div>

          {brief ? (
            <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">{brief}</p>
          ) : (
            <p className="text-xs text-text-muted italic leading-relaxed line-clamp-2">
              No directorial brief yet — open the project to add one.
            </p>
          )}

          <div className="mt-auto pt-1">{metrics}</div>

          <div className="flex items-center justify-between pt-2.5 border-t border-border/60">
            {openControl}
            {deleteControl}
          </div>
        </>
      ) : (
        <>
          <StatusBadge status={project.status} />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-text-primary truncate">{project.name}</h3>
            <p className="text-xs text-text-secondary truncate mt-0.5">
              {brief || 'No directorial brief yet'}
            </p>
          </div>
          <span className="hidden sm:block text-[10px] text-text-muted shrink-0">
            {timeAgo(project.updatedAt)}
          </span>
          <div className="hidden md:flex items-center gap-1.5 shrink-0">{metrics}</div>
          <div className="flex items-center gap-2 shrink-0">
            {openControl}
            {deleteControl}
          </div>
        </>
      )}
    </div>
  );
}
