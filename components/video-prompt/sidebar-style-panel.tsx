'use client';

import React from 'react';
import { Lock, Palette, Unlock, Zap } from 'lucide-react';
import type { VideoProject } from '@/types/video';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/tooltip';

interface SidebarStylePanelProps {
  project: VideoProject;
}

/** One read-only locked style card (Tier 1 UI lock when active). */
function LockedCard({
  icon,
  title,
  lines,
  tone,
  locked,
}: {
  icon: React.ReactNode;
  title: string;
  lines: string[];
  tone: 'brand' | 'warning';
  locked: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border p-3',
        tone === 'brand' ? 'border-brand/25 bg-brand/5' : 'border-warning/25 bg-warning/5'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p
          className={cn(
            'text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5',
            tone === 'brand' ? 'text-brand' : 'text-warning'
          )}
        >
          {icon}
          {title}
        </p>
        {locked ? (
          <Tooltip label="Locked for project consistency">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-surface-muted text-text-muted border border-border">
              <Lock className="w-2.5 h-2.5" aria-hidden="true" />
              Locked
            </span>
          </Tooltip>
        ) : (
          <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-surface-muted text-text-muted border border-border"
            title="Locks when the project is activated"
          >
            <Unlock className="w-2.5 h-2.5" aria-hidden="true" />
            Draft
          </span>
        )}
      </div>
      {lines.map((line, i) => (
        <p
          key={i}
          className={cn(
            'mt-1.5 text-[11px] leading-relaxed',
            i === 0 ? 'text-text-primary font-medium' : 'text-text-secondary'
          )}
        >
          {line}
        </p>
      ))}
    </div>
  );
}

/**
 * Sidebar — Visual Style + VFX direction cards. When project.status ===
 * 'active' both render as static read-only badges with a lock tooltip
 * (Tier 1); mutation is additionally short-circuited in sidebar.tsx (Tier 2).
 */
export function SidebarStylePanel({ project }: SidebarStylePanelProps) {
  const locked = project.status === 'active';
  const style = project.storyBible?.style;
  const effects = project.storyBible?.effects;

  return (
    <div className="space-y-2.5">
      <LockedCard
        icon={<Palette className="w-3 h-3" aria-hidden="true" />}
        title="Visual style"
        tone="brand"
        locked={locked}
        lines={
          style
            ? [style.lookAndMood, `${style.colorGrade} · ${style.filmStock} · ${style.aspectRatio}`]
            : ['Not set yet — confirm visual style during bootstrap.']
        }
      />
      <LockedCard
        icon={<Zap className="w-3 h-3" aria-hidden="true" />}
        title="VFX style"
        tone="warning"
        locked={locked}
        lines={
          effects
            ? [effects.vfxDirection, `${effects.particleDensity} · ${effects.pacing}`]
            : ['Not set yet — confirm VFX direction during bootstrap.']
        }
      />
    </div>
  );
}
