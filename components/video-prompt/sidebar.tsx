'use client';

import React, { useEffect, useState } from 'react';
import { Check, ChevronsLeft, ChevronsRight, ChevronDown, ChevronUp, Clapperboard, Sliders, Target } from 'lucide-react';
import type { ProviderConfig } from '@/types';
import type { DirectorDefaults, PromptForm, VideoProject, VideoTargetPlatform } from '@/types/video';
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
        'max-h-[50vh] overflow-y-auto scrollbar-thin',
        'lg:max-h-none lg:overflow-visible lg:sticky lg:top-[calc(var(--header-h,6rem)+0.5rem)]'
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

      {/* Director Defaults — shot-level customization defaults */}
      <DirectorDefaultsPanel project={project} onUpdate={applyUpdate} />

      <hr className="border-border" aria-hidden="true" />

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

// ── Director Defaults Panel ────────────────────────────────────────────────

const DIRECTOR_PROMPT_FORM_OPTIONS: { value: PromptForm | 'auto'; label: string }[] = [
  { value: 'auto', label: 'Let AI choose' },
  { value: 'flowing-prose', label: 'Flowing prose' },
  { value: 'minimal-labeled', label: 'Minimal labeled' },
  { value: 'time-coded', label: 'Time-coded' },
  { value: 'reference-directive', label: 'Reference directive' },
];

const DIRECTOR_PLATFORM_OPTIONS: { value: VideoTargetPlatform; label: string }[] = [
  { value: 'veo', label: 'Veo' },
  { value: 'kling', label: 'Kling' },
  { value: 'seedance', label: 'Seedance' },
  { value: 'higgsfield', label: 'Higgsfield' },
  { value: 'runway', label: 'Runway' },
  { value: 'luma', label: 'Luma' },
  { value: 'pika', label: 'Pika' },
];

const ALL_DIALECT_PLATFORMS: { value: VideoTargetPlatform; label: string }[] = [
  { value: 'veo', label: 'Veo' },
  { value: 'kling', label: 'Kling' },
  { value: 'seedance', label: 'Seedance' },
  { value: 'higgsfield', label: 'Higgsfield' },
  { value: 'runway', label: 'Runway' },
  { value: 'luma', label: 'Luma' },
  { value: 'pika', label: 'Pika' },
];

interface DirectorDefaultsPanelProps {
  project: VideoProject;
  onUpdate: (next: VideoProject) => void;
}

/**
 * Phase 4 — collapsible panel in the sidebar for editing the director's
 * usual shot-level customization defaults. Persists to project.directorDefaults.
 */
function DirectorDefaultsPanel({ project, onUpdate }: DirectorDefaultsPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const defaults: DirectorDefaults = project.directorDefaults ?? {};

  const updateDefaults = (patch: Partial<DirectorDefaults>) => {
    const next: VideoProject = {
      ...project,
      directorDefaults: { ...defaults, ...patch },
      updatedAt: Date.now(),
    };
    onUpdate(next);
    void saveVideoProject(next);
  };

  return (
    <div className="rounded-xl border border-border bg-surface-card/60 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-surface-hover/50 transition-colors"
        aria-expanded={expanded}
      >
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
          <Sliders className="w-3 h-3 text-brand" aria-hidden="true" />
          Director Defaults
        </span>
        {expanded ? (
          <ChevronUp className="w-3 h-3 text-text-muted" aria-hidden="true" />
        ) : (
          <ChevronDown className="w-3 h-3 text-text-muted" aria-hidden="true" />
        )}
      </button>
      {expanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-border/60 pt-3">
          {/* Default prompt form */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted">
              Default prompt form
            </label>
            <select
              value={defaults.promptFormOverride ?? 'auto'}
              onChange={(e) => updateDefaults({ promptFormOverride: e.target.value as PromptForm | 'auto' })}
              className="w-full appearance-none px-2 py-1 pr-5 rounded-lg text-[10px] font-semibold bg-surface-muted text-text-secondary border border-border hover:border-brand/40 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/50"
            >
              {DIRECTOR_PROMPT_FORM_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <p className="text-[8px] text-text-muted leading-relaxed">
              Applied to new shots unless overridden per-shot.
            </p>
          </div>

          {/* Default platform override */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted">
              Default platform override
            </label>
            <select
              value={defaults.platformOverride ?? ''}
              onChange={(e) => updateDefaults({ platformOverride: (e.target.value as VideoTargetPlatform) || undefined })}
              className="w-full appearance-none px-2 py-1 pr-5 rounded-lg text-[10px] font-semibold bg-surface-muted text-text-secondary border border-border hover:border-brand/40 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/50"
            >
              <option value="">Inherit project platform</option>
              {DIRECTOR_PLATFORM_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Dialect toggles — skip platforms not needed */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted">
              Dialect toggles (skip if unneeded)
            </label>
            <p className="text-[8px] text-text-muted leading-relaxed">
              Toggle off platforms you don&apos;t use to shrink the API payload.
            </p>
            <div className="flex flex-wrap gap-1">
              {ALL_DIALECT_PLATFORMS.map((p) => {
                const skipped = (defaults.skippedDialects ?? []).includes(p.value);
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => {
                      const current = defaults.skippedDialects ?? [];
                      const next = skipped
                        ? current.filter((d) => d !== p.value)
                        : [...current, p.value];
                      updateDefaults({ skippedDialects: next.length > 0 ? next : undefined });
                    }}
                    className={cn(
                      'px-2 py-0.5 rounded-md text-[9px] font-semibold border transition-colors',
                      skipped
                        ? 'bg-surface-muted text-text-muted border-border line-through'
                        : 'bg-brand/10 text-brand border-brand/25'
                    )}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Extension beats toggle */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted">
                Extension beats
              </label>
              <p className="text-[8px] text-text-muted leading-relaxed">
                On = this is part of a longer chained sequence.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={defaults.extensionBeatsEnabled ?? false}
              onClick={() => updateDefaults({ extensionBeatsEnabled: !(defaults.extensionBeatsEnabled ?? false) })}
              className={cn(
                'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60',
                (defaults.extensionBeatsEnabled ?? false)
                  ? 'bg-brand'
                  : 'bg-surface-muted border-border'
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
                  (defaults.extensionBeatsEnabled ?? false) ? 'translate-x-4' : 'translate-x-0'
                )}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
