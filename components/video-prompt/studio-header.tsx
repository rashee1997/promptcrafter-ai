'use client';

import React from 'react';
import { ArrowLeft, Check, ChevronDown, Clapperboard, Folder, Plus } from 'lucide-react';
import type { VideoProject } from '@/types/video';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from './project-card';

interface StudioHeaderProps {
  /** The project currently open in the workspace (null = dashboard mode). */
  activeProject: VideoProject | null;
  projects: VideoProject[];
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  /** Back to the production dashboard — only shown in active-project mode. */
  onBackToDashboard: () => void;
}

/** Compact top bar for the Video Prompt Studio tab. */
export function StudioHeader({
  activeProject,
  projects,
  onSelectProject,
  onNewProject,
  onBackToDashboard,
}: StudioHeaderProps) {
  const inProject = activeProject !== null;

  const newProjectButton = (
    <button
      type="button"
      onClick={onNewProject}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-white bg-gradient-to-br from-brand to-accent shadow-glow hover:brightness-110 active:scale-[0.985] transition-all shrink-0"
    >
      <Plus className="w-3.5 h-3.5" aria-hidden="true" />
      New Project
    </button>
  );

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      {/* Left — back affordance + identity */}
      <div className="flex items-center gap-3 min-w-0">
        {inProject ? (
          <>
            <button
              type="button"
              onClick={onBackToDashboard}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-surface-muted text-text-secondary border border-border hover:border-brand/40 hover:text-brand transition-colors shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              Projects
            </button>

            {/* Active project identity + switcher */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold tracking-tight text-text-primary truncate">
                    {activeProject.name}
                  </h2>
                  <StatusBadge status={activeProject.status} />
                </div>
                <p className="text-[10px] text-text-muted truncate">
                  {activeProject.shots.length} shot
                  {activeProject.shots.length === 1 ? '' : 's'} ·{' '}
                  {activeProject.storyBible?.characters?.length ?? 0} character
                  {activeProject.storyBible?.characters?.length === 1 ? '' : 's'} planned
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Switch project"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-surface-muted text-text-secondary border border-border hover:border-brand/50 transition-colors shrink-0"
                  >
                    <Folder className="w-3.5 h-3.5 text-brand" aria-hidden="true" />
                    <ChevronDown className="w-3 h-3 text-text-muted" aria-hidden="true" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[220px]">
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-text-muted">
                    Switch project
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {projects.length === 0 ? (
                    <DropdownMenuItem disabled>No projects yet</DropdownMenuItem>
                  ) : (
                    projects.map((p) => {
                      const isActive = p.id === activeProject.id;
                      return (
                        <DropdownMenuItem
                          key={p.id}
                          onSelect={() => onSelectProject(p.id)}
                          className={cn(
                            'text-xs',
                            isActive && 'bg-brand/10 text-brand font-semibold'
                          )}
                        >
                          <span
                            className={cn(
                              'w-1.5 h-1.5 rounded-full shrink-0',
                              p.status === 'active' ? 'bg-success' : 'bg-warning'
                            )}
                            aria-hidden="true"
                          />
                          <span className="truncate flex-1">{p.name}</span>
                          {isActive && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </DropdownMenuItem>
                      );
                    })
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        ) : (
          <>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-accent flex items-center justify-center shadow-orb border border-brand/30 shrink-0">
              <Clapperboard className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-text-primary">
                Video Prompt Studio
              </h2>
              <p className="text-xs text-text-muted">
                Plan productions, keep continuity, and write shot-level prompts
              </p>
            </div>
          </>
        )}
      </div>

      {/* Right — CTA */}
      {newProjectButton}
    </div>
  );
}
