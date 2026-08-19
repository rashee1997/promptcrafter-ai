'use client';

import React, { useEffect, useState } from 'react';
import { Check, ChevronsLeft, ChevronsRight, ChevronDown, Clapperboard, Target } from 'lucide-react';
import type { ProviderConfig } from '@/types';
import type { VideoProject, VideoTargetPlatform } from '@/types/video';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { getPlatformSpec, PLATFORM_SPECS } from '@/lib/video/platforms';
import { saveVideoProject } from '@/lib/video-storage';
import { ConfirmModal } from '@/components/confirm-modal';
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
  const [editingPlatform, setEditingPlatform] = useState(false);
  const [pendingPlatform, setPendingPlatform] = useState<VideoTargetPlatform | null>(
    project.targetPlatform ?? null
  );
  const [showPlatformWarning, setShowPlatformWarning] = useState(false);

  useEffect(() => {
    setCollapsed(isMobile);
  }, [isMobile]);

  const locked = project.status === 'active';
  const bible = project.storyBible;
  const platformSpec = project.targetPlatform ? getPlatformSpec(project.targetPlatform) : null;
  const hasShots = project.shots.length > 0;

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

  const confirmPlatformChange = async () => {
    if (!pendingPlatform) return;
    const next: VideoProject = {
      ...project,
      targetPlatform: pendingPlatform,
      targetPlatformSubModel: pendingPlatform === 'higgsfield' ? (project.targetPlatformSubModel ?? null) : null,
      updatedAt: Date.now(),
    };
    await saveVideoProject(next);
    onUpdate(next);
    setEditingPlatform(false);
  };

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

      {/* Target platform card */}
      {!editingPlatform && platformSpec && (
        <div className="rounded-xl border border-brand/25 bg-brand/5 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand flex items-center gap-1.5">
              <Target className="w-3 h-3" aria-hidden="true" />
              Target platform
            </p>
            <button
              type="button"
              onClick={() => {
                setPendingPlatform(project.targetPlatform ?? null);
                setEditingPlatform(true);
              }}
              className="text-[10px] font-semibold text-text-muted hover:text-brand transition-colors"
            >
              Change
            </button>
          </div>
          <p className="mt-1.5 text-[11px] font-medium text-text-primary">
            {platformSpec.label}
          </p>
          <p className="mt-0.5 text-[10px] text-text-secondary leading-relaxed">
            {platformSpec.summary.length > 100 ? platformSpec.summary.slice(0, 100) + '…' : platformSpec.summary}
          </p>
        </div>
      )}

      {/* Inline platform picker — shown when editing */}
      {editingPlatform && (
        <div className="rounded-xl border border-border bg-surface-code p-3 space-y-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Pick target platform
          </p>
          <div className="relative">
            <select
              value={pendingPlatform ?? ''}
              onChange={(e) => setPendingPlatform(e.target.value as VideoTargetPlatform)}
              className="w-full appearance-none px-3 py-2 pr-8 rounded-xl text-xs font-medium bg-surface-input border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/70 transition-shadow cursor-pointer"
            >
              <option value="">Select a platform…</option>
              {(Object.keys(PLATFORM_SPECS) as VideoTargetPlatform[]).map((id) => (
                <option key={id} value={id}>
                  {PLATFORM_SPECS[id].label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setEditingPlatform(false);
                setPendingPlatform(project.targetPlatform ?? null);
              }}
              className="px-3 py-1.5 text-[10px] font-semibold rounded-lg border border-border text-text-secondary hover:bg-surface-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!pendingPlatform || pendingPlatform === project.targetPlatform}
              onClick={() => {
                if (hasShots) {
                  setShowPlatformWarning(true);
                } else {
                  confirmPlatformChange();
                }
              }}
              className={cn(
                'px-3 py-1.5 text-[10px] font-semibold rounded-lg text-white',
                'bg-brand hover:bg-brand-hover shadow-glow active:scale-[0.985] transition-all',
                (!pendingPlatform || pendingPlatform === project.targetPlatform) &&
                  'opacity-40 cursor-not-allowed'
              )}
            >
              <Check className="w-3 h-3 inline mr-1" aria-hidden="true" />
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* Locked style + VFX cards */}
      <SidebarStylePanel project={project} />

      <hr className="border-border" aria-hidden="true" />

      {/* Cast + locations */}
      <SidebarCharactersPanel project={project} provider={provider} onUpdate={applyUpdate} />
      <SidebarLocationsPanel project={project} provider={provider} onUpdate={applyUpdate} />

      {/* Platform-change confirmation — shown when switching with existing shots */}
      <ConfirmModal
        isOpen={showPlatformWarning}
        title="Change target platform?"
        message={
          `Already-approved shots were written for ${platformSpec?.label ?? project.targetPlatform} and won't automatically update to ${pendingPlatform ? getPlatformSpec(pendingPlatform)?.label ?? pendingPlatform : 'the new platform'}'s rules. Each shot's dialect export will still be available, but new drafts will follow the new platform's constraints.`
        }
        confirmLabel="Change platform"
        cancelLabel="Keep current"
        variant="warning"
        onConfirm={() => {
          setShowPlatformWarning(false);
          void confirmPlatformChange();
        }}
        onCancel={() => {
          setShowPlatformWarning(false);
          setPendingPlatform(project.targetPlatform ?? null);
        }}
      />
    </aside>
  );
}
