'use client';

import React from 'react';
import { CheckCircle2, Clapperboard, MapPin, Palette, Users, Zap } from 'lucide-react';
import type { ProviderConfig } from '@/types';
import type { VideoProject } from '@/types/video';
import { StatusBadge } from './project-card';
import { BootstrapFlow } from './bootstrap-flow';

interface ProjectWorkspaceProps {
  project: VideoProject;
  provider: ProviderConfig;
  onUpdate: (project: VideoProject) => void;
}

function MetricChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-surface-muted text-text-secondary border border-border">
      {icon}
      {label}
    </span>
  );
}

/**
 * Phase 3 — the open project's workspace. Draft projects run the 5-stage
 * BootstrapFlow wizard; activating (Stage 5 confirm) flips status to `active`
 * and renders the locked story bible summary instead.
 */
export function ProjectWorkspace({ project, provider, onUpdate }: ProjectWorkspaceProps) {
  const active = project.status === 'active';
  const bible = project.storyBible;
  const intent = project.customInstructions.trim() || project.name;

  return (
    <div className="rounded-2xl border border-border bg-surface-card/70 backdrop-blur-xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-bold text-text-primary">Production workspace</h3>
          <p className="mt-1 text-xs text-text-secondary leading-relaxed">
            {active
              ? 'Story bible compiled and locked — Visual Style & VFX direction are fixed for shot drafting.'
              : 'One intent in, a full story bible out: the studio drafts, you review, confirm, and lock.'}
          </p>
        </div>
        <StatusBadge status={project.status} />
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
        /* Locked story bible summary */
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-success">
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            Production active — story bible locked
          </div>

          <div className="flex flex-wrap gap-1.5">
            <MetricChip icon={<Users className="w-3 h-3 text-accent" />} label={`${bible?.characters?.length ?? 0} characters`} />
            <MetricChip icon={<MapPin className="w-3 h-3 text-accent" />} label={`${bible?.locations?.length ?? 0} locations`} />
            {bible?.style && (
              <MetricChip icon={<Palette className="w-3 h-3 text-brand" />} label={`Style: ${bible.style.lookAndMood.split(',')[0]}`} />
            )}
            {bible?.effects && (
              <MetricChip icon={<Zap className="w-3 h-3 text-warning" />} label={`VFX: ${bible.effects.vfxDirection.split(',')[0]}`} />
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {bible?.characters && bible.characters.length > 0 && (
              <div className="rounded-xl border border-border bg-surface-card/60 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2 flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-accent" aria-hidden="true" /> Cast
                </p>
                <ul className="space-y-1.5">
                  {bible.characters.map((c) => (
                    <li key={c.id} className="text-xs text-text-secondary leading-relaxed">
                      <span className="font-semibold text-text-primary">{c.name}</span> — {c.role}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {bible?.locations && bible.locations.length > 0 && (
              <div className="rounded-xl border border-border bg-surface-card/60 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-accent" aria-hidden="true" /> Locations
                </p>
                <ul className="space-y-1.5">
                  {bible.locations.map((l) => (
                    <li key={l.id} className="text-xs text-text-secondary leading-relaxed">
                      <span className="font-semibold text-text-primary">{l.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {bible?.style && (
            <div className="rounded-xl border border-brand/25 bg-brand/5 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand mb-2 flex items-center gap-1.5">
                <Palette className="w-3 h-3" aria-hidden="true" /> Locked visual style
              </p>
              <p className="text-xs text-text-primary leading-relaxed">{bible.style.lookAndMood}</p>
              <p className="mt-1.5 text-[11px] text-text-secondary leading-relaxed">
                {bible.style.colorGrade} · {bible.style.filmStock} · {bible.style.aspectRatio}
              </p>
            </div>
          )}

          {bible?.effects && (
            <div className="rounded-xl border border-warning/25 bg-warning/5 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-warning mb-2 flex items-center gap-1.5">
                <Zap className="w-3 h-3" aria-hidden="true" /> Locked VFX direction
              </p>
              <p className="text-xs text-text-primary leading-relaxed">{bible.effects.vfxDirection}</p>
              <p className="mt-1.5 text-[11px] text-text-secondary leading-relaxed">
                {bible.effects.particleDensity} · {bible.effects.pacing}
              </p>
            </div>
          )}

          <p className="flex items-center gap-1.5 text-[10px] text-text-muted">
            <Clapperboard className="w-3 h-3 text-brand" aria-hidden="true" />
            Shot drafting launches here in Phase 4 — continuity is now locked.
          </p>
        </div>
      ) : (
        /* 5-stage bootstrap wizard */
        <BootstrapFlow
          key={project.id}
          intent={intent}
          customInstructions={project.customInstructions}
          provider={provider}
          project={project}
          onComplete={onUpdate}
        />
      )}
    </div>
  );
}
