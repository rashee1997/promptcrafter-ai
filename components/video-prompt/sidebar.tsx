'use client';

import React, { useEffect, useState } from 'react';
import { ChevronsLeft, ChevronsRight, Clapperboard } from 'lucide-react';
import type { ProviderConfig } from '@/types';
import type { VideoProject } from '@/types/video';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { StatusBadge } from './project-card';
import { SidebarStylePanel } from './sidebar-style-panel';
import { SidebarCharactersPanel } from './sidebar-characters-panel';
import { SidebarLocationsPanel } from './sidebar-locations-panel';

interface SidebarProps {
  project: VideoProject;
  provider: ProviderConfig;
  /** Persists the updated project (storage write + parent refresh). */
  onUpdate: (next: VideoProject) => void;
}

/**
 * Phase 4 — active project sidebar. Displays project metadata, the locked
 * Visual Style + VFX direction cards, and the cast / location panels.
 *
 * Two-tier lock rules (Rule 2) when project.status === 'active':
 *   Tier 1 (UI): style & VFX cards render as static read-only badges with a
 *                "Locked for project consistency" tooltip.
 *   Tier 2 (state): applyUpdate() short-circuits any mutation to
 *                storyBible.style / storyBible.effects before persistence.
 */
export function Sidebar({ project, provider, onUpdate }: SidebarProps) {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(isMobile);

  useEffect(() => {
    setCollapsed(isMobile);
  }, [isMobile]);

  const locked = project.status === 'active';
  const bible = project.storyBible;

  /** Tier 2 defense-in-depth: never let style/effects change once active. */
  const applyUpdate = (next: VideoProject): void => {
    const guarded: VideoProject = locked
      ? {
          ...next,
          storyBible: {
            ...next.storyBible,
            style: project.storyBible.style,
            effects: project.storyBible.effects,
          },
        }
      : next;
    onUpdate(guarded);
  };

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface-card/70 backdrop-blur-xl p-2.5 self-start">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          aria-label="Expand sidebar"
          title="Expand sidebar"
          className="p-1.5 rounded-lg text-text-muted hover:text-brand hover:bg-surface-hover transition-colors"
        >
          <ChevronsRight className="w-4 h-4" aria-hidden="true" />
        </button>
        <span
          title={`${project.shots.length} shots`}
          className="p-1.5 rounded-lg text-text-muted"
        >
          <Clapperboard className="w-4 h-4 text-brand" aria-hidden="true" />
        </span>
        <span title={locked ? 'Style locked' : 'Style draft'} className="text-[9px] font-bold text-brand">S</span>
        <span title="Characters" className="text-[9px] font-bold text-accent">C</span>
        <span title="Locations" className="text-[9px] font-bold text-accent">L</span>
      </div>
    );
  }

  return (
    <aside
      className={cn(
        'rounded-2xl border border-border bg-surface-card/70 backdrop-blur-xl p-4 space-y-4 self-start w-full',
        'max-h-[70vh] overflow-y-auto scrollbar-thin lg:max-h-none lg:overflow-visible lg:sticky lg:top-24'
      )}
      aria-label="Active project sidebar"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-text-primary truncate">{project.name}</h3>
          <p className="mt-0.5 text-[10px] text-text-muted tabular-nums">
            {project.shots.length} shot{project.shots.length === 1 ? '' : 's'} confirmed ·{' '}
            {bible?.continuityLog?.length ?? 0} log entries
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          aria-label="Collapse sidebar"
          title="Collapse sidebar"
          className="p-1.5 rounded-lg text-text-muted hover:text-brand hover:bg-surface-hover transition-colors shrink-0"
        >
          <ChevronsLeft className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      <StatusBadge status={project.status} />

      {/* Locked style + VFX cards */}
      <SidebarStylePanel project={project} />

      <hr className="border-border" aria-hidden="true" />

      {/* Cast + locations */}
      <SidebarCharactersPanel project={project} provider={provider} onUpdate={applyUpdate} />
      <SidebarLocationsPanel project={project} provider={provider} onUpdate={applyUpdate} />
    </aside>
  );
}
