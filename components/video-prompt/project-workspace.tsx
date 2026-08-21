'use client';

import React from 'react';
import { CheckCircle2, Clapperboard, Target } from 'lucide-react';
import type { ProviderConfig } from '@/types';
import type { VideoProject } from '@/types/video';
import { StoryBibleProvider } from '@/lib/video/story-bible-context';
import { getPlatformSpec } from '@/lib/video/platforms';
import { StatusBadge } from './project-card';
import { BootstrapFlow } from './bootstrap-flow';
import { Sidebar } from './sidebar';
import { ChatThread } from './chat-thread';
import { ShotList } from './shot-list';

interface ProjectWorkspaceProps {
  project: VideoProject;
  provider: ProviderConfig;
  onUpdate: (project: VideoProject) => void;
}

/**
 * Phase 3 + Phase 4 — the open project's workspace. Draft projects run the
 * 6-stage BootstrapFlow wizard; activating (Stage 5 confirm) flips status to
 * `active`, locking Visual Style + VFX direction, and renders the Phase 4
 * conversational workspace: the Active Project Sidebar (2-tier lock rules)
 * beside the Multi-Turn Shot Drafting Chat Thread.
 */
export function ProjectWorkspace({ project, provider, onUpdate }: ProjectWorkspaceProps) {
  const active = project.status === 'active';
  const intent = project.customInstructions.trim() || project.name;

  return (
    <StoryBibleProvider projectId={project.id}>
      <div className="rounded-2xl border border-border bg-surface-card/70 backdrop-blur-xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-bold text-text-primary">Production workspace</h3>
          <p className="mt-1 text-xs text-text-secondary leading-relaxed">
            {active
              ? 'Story bible locked — draft, approve, and revise sequential shot prompts without continuity drift.'
              : 'One intent in, a full story bible out: the studio drafts, you review, confirm, and lock.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {project.targetPlatform && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-brand/10 text-brand border border-brand/25">
              <Target className="w-3 h-3" aria-hidden="true" />
              Drafting for: {getPlatformSpec(project.targetPlatform)?.label ?? project.targetPlatform}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-surface-muted text-text-secondary border border-border tabular-nums">
            <Clapperboard className="w-3 h-3 text-brand" aria-hidden="true" />
            {project.shots.length} shot{project.shots.length === 1 ? '' : 's'}
          </span>
          <StatusBadge status={project.status} />
        </div>
      </div>

      {/* Directorial brief */}
      {intent && (
        <div className="rounded-xl border border-border bg-surface-code p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
            Directorial brief
          </p>
          <p className="text-xs text-text-primary whitespace-pre-wrap leading-relaxed font-mono">
            {intent}
          </p>
        </div>
      )}

      {active ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-success">
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            Production active — story bible locked, shot drafting open
          </div>

          <div className="grid gap-5 md:grid-cols-[minmax(220px,26%)_minmax(0,1fr)] items-start">
            <Sidebar project={project} provider={provider} onUpdate={onUpdate} />
            <div className="space-y-5 min-w-0">
              <ChatThread
                key={project.id}
                project={project}
                providerConfig={provider}
                onProjectUpdate={onUpdate}
              />
              {/* Phase 5 — dialect-ready storyboard under the chat column */}
              <ShotList project={project} onUpdate={onUpdate} />
            </div>
          </div>
        </div>
      ) : (
        /* 6-stage bootstrap wizard */
        <BootstrapFlow
          key={project.id}
          intent={intent}
          customInstructions={project.customInstructions}
          provider={provider}
          project={project}
          onComplete={onUpdate}
        />
      )}

      <p className="flex items-center gap-1.5 text-[10px] text-text-muted">
        <Clapperboard className="w-3 h-3 text-brand" aria-hidden="true" />
        {active
          ? 'Approve a draft to add it to the storyboard, then reorder and copy each shot in the dialect of your target model (Veo · Higgsfield · Kling · Seedance).'
          : 'Confirming Stage 5 activates the production and locks the Visual Style & VFX direction.'}
      </p>
      </div>
    </StoryBibleProvider>
  );
}
