'use client';

import React, { useMemo, useState } from 'react';
import { CheckCircle2, Clapperboard, FileText, Layers, Target } from 'lucide-react';
import type { ProviderConfig } from '@/types';
import type { VideoProject } from '@/types/video';
import { StoryBibleProvider } from '@/lib/video/story-bible-context';
import { getPlatformSpec } from '@/lib/video/platforms';
import { cn } from '@/lib/utils';
import { StatusBadge } from './project-card';
import { BootstrapFlow } from './bootstrap-flow';
import { Sidebar } from './sidebar';
import { ChatThread } from './chat-thread';
import { ShotList } from './shot-list';
import { SequenceTimeline } from './sequence-timeline';
import { PacingGraph } from './pacing-graph';
import { MusicBriefPanel } from './music-brief-panel';
import { AssemblyExport } from './assembly-export';
import { WorkspaceTabs, type WorkspaceSection, ProjectOverview, StudioCard, StudioCardHeader, EmptyState } from './studio';

interface ProjectWorkspaceProps {
  project: VideoProject;
  provider: ProviderConfig;
  onUpdate: (project: VideoProject) => void;
}

/**
 * Phase 8 — the open project's workspace, restructured into three persistent
 * sections via WorkspaceTabs. Draft projects run the BootstrapFlow wizard;
 * active projects show:
 *   - ProjectOverview dashboard at top
 *   - WorkspaceTabs navigation
 *   - Three content sections: Story Bible, Storyboard, Production Notes
 */
export function ProjectWorkspace({ project, provider, onUpdate }: ProjectWorkspaceProps) {
  const active = project.status === 'active';
  const intent = project.customInstructions.trim() || project.name;
  const [activeSection, setActiveSection] = useState<WorkspaceSection>('storyboard');

  // Compute badge counts for the tabs
  const tabBadges = useMemo(() => {
    const characters = project.storyBible?.characters ?? [];
    const locations = project.storyBible?.locations ?? [];
    const confirmedShots = (project.shots ?? []).filter((s) => s.confirmed);

    return {
      'story-bible': {
        count: characters.length + locations.length,
        label: 'items',
      },
      'storyboard': {
        count: confirmedShots.length,
        label: 'shots',
      },
      'production-notes': {
        count: [
          project.directionPlan ? 1 : 0,
          project.storyTreatment ? 1 : 0,
          confirmedShots.length > 0 ? 1 : 0, // music brief
        ].reduce((a, b) => a + b, 0),
        label: 'sections',
      },
    };
  }, [project]);

  return (
    <StoryBibleProvider projectId={project.id}>
      <div className="rounded-2xl border border-border bg-surface-card/70 backdrop-blur-xl p-5 sm:p-6 space-y-4">
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

          {/* Phase 8 — Real project dashboard overview */}
          <ProjectOverview project={project} />

          {/* Phase 8 — Workspace navigation tabs */}
          <WorkspaceTabs
            active={activeSection}
            onChange={setActiveSection}
            badges={tabBadges}
          />

          {/* Story Bible section */}
          {activeSection === 'story-bible' && (
            <div id="panel-story-bible" role="tabpanel" aria-labelledby="tab-story-bible">
              <div className="grid gap-5 lg:grid-cols-[minmax(220px,26%)_minmax(0,1fr)] items-start">
                <Sidebar project={project} provider={provider} onUpdate={onUpdate} />
                <div className="space-y-4 min-w-0">
                  {/* Characters, locations, style are in the sidebar */}
                  {/* Voice panel would go here if Phase 5 voice panel exists */}
                  <StudioCard>
                    <StudioCardHeader
                      icon={<FileText className="w-3.5 h-3.5" />}
                      iconTone="accent"
                      title="Story Bible Assets"
                      count={(project.storyBible?.characters?.length ?? 0) + (project.storyBible?.locations?.length ?? 0)}
                      countLabel="assets"
                    />
                    <div className="space-y-3">
                      <p className="text-xs text-text-secondary leading-relaxed">
                        Characters, locations, and voices are managed in the sidebar. Visual style and VFX direction
                        are locked for project consistency.
                      </p>
                      {/* Character reference images grid */}
                      {(project.storyBible?.characters?.length ?? 0) > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {project.storyBible.characters.map((c) => (
                            <div key={c.id} className="rounded-lg border border-border bg-surface-muted/40 p-2.5 space-y-1">
                              <p className="text-[10px] font-bold text-text-primary truncate">{c.name}</p>
                              <p className="text-[9px] text-text-muted truncate">{c.role || '—'}</p>
                              {c.voice && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-semibold bg-accent/10 text-accent border border-accent/20">
                                  Voice configured
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {(project.storyBible?.locations?.length ?? 0) > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {project.storyBible.locations.map((l) => (
                            <div key={l.id} className="rounded-lg border border-border bg-surface-muted/40 p-2.5 space-y-1">
                              <p className="text-[10px] font-bold text-text-primary truncate">{l.name}</p>
                              <p className="text-[9px] text-text-muted truncate">{l.description || '—'}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </StudioCard>
                </div>
              </div>
            </div>
          )}

          {/* Storyboard section */}
          {activeSection === 'storyboard' && (
            <div id="panel-storyboard" role="tabpanel" aria-labelledby="tab-storyboard">
              <div className="grid gap-5 lg:grid-cols-[minmax(220px,26%)_minmax(0,1fr)] items-start">
                <Sidebar project={project} provider={provider} onUpdate={onUpdate} />
                <div className="space-y-5 min-w-0">
                  <ChatThread
                    key={project.id}
                    project={project}
                    providerConfig={provider}
                    onProjectUpdate={onUpdate}
                  />
                  <ShotList project={project} onUpdate={onUpdate} />
                  <SequenceTimeline project={project} onUpdate={onUpdate} />
                </div>
              </div>
            </div>
          )}

          {/* Production Notes section */}
          {activeSection === 'production-notes' && (
            <div id="panel-production-notes" role="tabpanel" aria-labelledby="tab-production-notes">
              <div className="grid gap-5 lg:grid-cols-[minmax(220px,26%)_minmax(0,1fr)] items-start">
                <Sidebar project={project} provider={provider} onUpdate={onUpdate} />
                <div className="space-y-5 min-w-0">
                  {/* Direction Plan */}
                  {project.directionPlan ? (
                    <StudioCard>
                      <StudioCardHeader
                        icon={<FileText className="w-3.5 h-3.5" />}
                        iconTone="accent"
                        title="Direction Plan"
                      />
                      <div className="space-y-2.5">
                        <DirectionField label="Camera language" value={project.directionPlan.cameraLanguage} />
                        <DirectionField label="Lens philosophy" value={project.directionPlan.lensPhilosophy} />
                        <DirectionField label="Colour palette" value={project.directionPlan.colourPalette} />
                        <DirectionField label="Lighting approach" value={project.directionPlan.lightingApproach} />
                        <DirectionField label="Sound design" value={project.directionPlan.soundDesign} />
                        <DirectionField label="Visual motif" value={project.directionPlan.visualMotif} />
                        <DirectionField label="Pacing rhythm" value={project.directionPlan.pacingRhythm} />
                      </div>
                    </StudioCard>
                  ) : (
                    <EmptyState
                      icon={<FileText className="w-5 h-5" />}
                      title="No direction plan yet"
                      description="Complete the Direction stage in the bootstrap to get your shooting plan."
                      variant="compact"
                    />
                  )}

                  {/* Structure / Beats */}
                  {project.storyTreatment ? (
                    <StudioCard>
                      <StudioCardHeader
                        icon={<Layers className="w-3.5 h-3.5" />}
                        iconTone="brand"
                        title="Story Structure"
                      />
                      <div className="space-y-3">
                        {project.storyTreatment.acts.map((act) => (
                          <div key={act.act} className="space-y-1.5">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-brand">
                              Act {act.act}: {act.title}
                            </p>
                            {act.beats.map((beat, i) => (
                              <div key={i} className="rounded-lg border border-border/50 bg-surface-muted/30 p-2">
                                {beat.name && (
                                  <p className="text-[10px] font-bold text-text-primary">
                                    {beat.name}
                                    {beat.purpose && (
                                      <span className="font-normal text-text-muted ml-1">
                                        — {beat.purpose}
                                      </span>
                                    )}
                                  </p>
                                )}
                                <p className="text-[10px] text-text-secondary leading-relaxed">
                                  {beat.text}
                                </p>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </StudioCard>
                  ) : (
                    <EmptyState
                      icon={<Layers className="w-5 h-5" />}
                      title="No story structure yet"
                      description="Complete the Story stage in the bootstrap to get your act breakdown and beats."
                      variant="compact"
                    />
                  )}

                  {/* Music Brief & Assembly */}
                  <PacingGraph project={project} />
                  <MusicBriefPanel project={project} />
                  <AssemblyExport project={project} />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 6-stage bootstrap wizard — unchanged flow */
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

/** Direction plan field — read-only display of a plan field */
function DirectionField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/50 bg-surface-muted/30 p-2">
      <p className="text-[9px] font-bold uppercase tracking-wider text-text-muted mb-0.5">
        {label}
      </p>
      <p className="text-[11px] text-text-secondary leading-relaxed">
        {value}
      </p>
    </div>
  );
}
