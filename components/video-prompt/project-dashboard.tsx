'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Clapperboard, Grid, List, Plus, Search, Sparkles } from 'lucide-react';
import type { ProjectStatus, VideoProject } from '@/types/video';
import { cn } from '@/lib/utils';
import { ProjectCard, VideoViewMode } from './project-card';

type VideoStatusFilter = 'all' | ProjectStatus;

interface ProjectDashboardProps {
  projects: VideoProject[];
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  onDeleteProject: (id: string) => void;
  /** Phase 9 — 'Create Similar': open a new project prefilled from an existing one. */
  onCreateSimilar?: (project: VideoProject) => void;
}

const STATUS_FILTERS: { id: VideoStatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active Production' },
  { id: 'draft', label: 'Drafting' },
];

/**
 * Production hub — every saved video project, newest first. Search covers
 * title, Directorial Brief, and character names; status pills filter by
 * production state; the toggle switches between Grid and Dense List layouts.
 */
export function ProjectDashboard({
  projects,
  onSelectProject,
  onNewProject,
  onDeleteProject,
  onCreateSimilar,
}: ProjectDashboardProps) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<VideoStatusFilter>('all');
  const [viewMode, setViewMode] = useState<VideoViewMode>('grid');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects
      .filter((p) => {
        if (statusFilter !== 'all' && p.status !== statusFilter) return false;
        if (!q) return true;
        const characters = (p.storyBible?.characters ?? [])
          .map((c) => c.name)
          .join(' ')
          .toLowerCase();
        const hay = `${p.name} ${p.customInstructions} ${characters}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [projects, query, statusFilter]);

  const hasProjects = projects.length > 0;
  const hasFilters = query.trim() !== '' || statusFilter !== 'all';

  const clearFilters = () => {
    setQuery('');
    setStatusFilter('all');
  };

  const filterButton = (filter: VideoStatusFilter, label: string) => (
    <button
      key={filter}
      type="button"
      onClick={() => setStatusFilter(filter)}
      aria-pressed={statusFilter === filter}
      className={cn(
        'px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-colors',
        statusFilter === filter
          ? 'bg-brand/10 text-brand border-brand/30'
          : 'bg-surface-muted text-text-secondary border-border hover:border-brand/40 hover:text-text-primary'
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
            Production portfolio
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-surface-muted border border-border text-text-muted tabular-nums">
              {projects.length}
            </span>
          </h2>
          <div className="ml-auto flex items-center gap-1 p-1 rounded-xl bg-surface-sunken border border-border">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-pressed={viewMode === 'grid'}
              aria-label="Grid view"
              title="Grid view"
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                viewMode === 'grid'
                  ? 'bg-surface-card text-brand shadow-sm border border-border'
                  : 'text-text-muted hover:text-text-primary'
              )}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-pressed={viewMode === 'list'}
              aria-label="List view"
              title="List view"
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                viewMode === 'list'
                  ? 'bg-surface-card text-brand shadow-sm border border-border'
                  : 'text-text-muted hover:text-text-primary'
              )}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Search + status filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-2.5">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, brief, or character…"
            aria-label="Search video projects"
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-surface-input border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/70 transition-shadow"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((f) => filterButton(f.id, f.label))}
        </div>
      </div>

      {/* Empty state — no projects at all */}
      {!hasProjects ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
          className="relative rounded-2xl border border-border bg-surface-card/70 backdrop-blur-xl px-6 py-14 text-center overflow-hidden"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent"
          />
          <div className="relative mx-auto w-16 h-16 rounded-2xl bg-brand shadow-orb border border-brand/30 flex items-center justify-center">
            <Clapperboard className="w-7 h-7 text-white" />
            <Sparkles className="absolute -top-2 -right-2 w-4 h-4 text-warning" />
          </div>
          <h3 className="mt-5 text-lg font-bold tracking-tight text-text-primary">
            Start your first production
          </h3>
          <p className="mt-1.5 text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
            Open a project with a Directorial Brief — tone, visual style, camera
            direction, and audience — and the studio will turn it into a script,
            story bible, and shot plan.
          </p>
          <button
            type="button"
            onClick={onNewProject}
            className="mt-6 inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl text-white bg-brand hover:bg-brand-hover shadow-glow active:scale-[0.985] transition-all"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Create New Project
          </button>
        </motion.div>
      ) : filtered.length === 0 ? (
        /* Empty state — filters matched nothing */
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
          className="rounded-2xl border border-border bg-surface-card/70 backdrop-blur-xl px-6 py-10 text-center"
        >
          <p className="text-sm font-semibold text-text-primary">No projects match your filters</p>
          <p className="mt-1 text-xs text-text-muted">
            Try a different search term or status.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-surface-muted text-text-secondary border border-border hover:border-brand/40 hover:text-brand transition-colors"
          >
            Clear search &amp; filters
          </button>
        </motion.div>
      ) : (
        <motion.div
          key={`${viewMode}-${statusFilter}`}
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.04 } } }}
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
              : 'flex flex-col gap-3'
          )}
        >
          {filtered.map((project) => (
            <motion.div
              key={project.id}
              variants={{
                hidden: { opacity: 0, y: 8 },
                show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.2, 0, 0, 1] } },
              }}
            >
              <ProjectCard
                project={project}
                viewMode={viewMode}
                onSelect={onSelectProject}
                onDelete={onDeleteProject}
                onCreateSimilar={onCreateSimilar}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
