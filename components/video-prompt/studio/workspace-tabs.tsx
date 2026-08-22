'use client';

import React from 'react';
import { BookOpen, Clapperboard, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export type WorkspaceSection = 'story-bible' | 'storyboard' | 'production-notes';

interface WorkspaceTabsProps {
  active: WorkspaceSection;
  onChange: (section: WorkspaceSection) => void;
  /** Badge counts shown next to each tab label */
  badges?: Partial<Record<WorkspaceSection, { count: number; label: string }>>;
  className?: string;
}

const TABS: {
  id: WorkspaceSection;
  label: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    id: 'story-bible',
    label: 'Story Bible',
    icon: <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />,
    description: 'Characters, locations, voices, style & platform',
  },
  {
    id: 'storyboard',
    label: 'Storyboard',
    icon: <Clapperboard className="w-3.5 h-3.5" aria-hidden="true" />,
    description: 'Shot list, drafting chat, sequence timeline',
  },
  {
    id: 'production-notes',
    label: 'Production Notes',
    icon: <FileText className="w-3.5 h-3.5" aria-hidden="true" />,
    description: 'Direction plan, beats, music brief',
  },
];

/**
 * Phase 8 — WorkspaceTabs: three persistent sections for the active-project
 * view. Replaces the long single-scroll with navigable sections:
 *
 *   Story Bible      — characters, locations, voices (Phase 5), style/platform
 *   Storyboard       — shot list + drafting chat thread + sequence timeline
 *   Production Notes — direction plan, structure/beats, music brief
 */
export function WorkspaceTabs({ active, onChange, badges, className }: WorkspaceTabsProps) {
  return (
    <nav
      role="tablist"
      aria-label="Project workspace sections"
      className={cn(
        'flex gap-1 p-1 rounded-xl bg-surface-sunken border border-border',
        className,
      )}
    >
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        const badge = badges?.[tab.id];

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => onChange(tab.id)}
            title={tab.description}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex-1 justify-center',
              isActive
                ? 'bg-surface-card text-brand border border-border shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover/50',
            )}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            {badge && (
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded-md text-[9px] font-bold tabular-nums',
                  isActive
                    ? 'bg-brand/10 text-brand border border-brand/25'
                    : 'bg-surface-muted text-text-muted border border-border',
                )}
              >
                {badge.count} {badge.label}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
