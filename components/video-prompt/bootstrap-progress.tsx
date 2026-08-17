'use client';

import React from 'react';
import { Check } from 'lucide-react';
import type { ThinkingOrbState, VideoProject } from '@/types/video';
import type { VideoBootstrapStage } from '@/lib/video/bootstrap/types';
import { cn } from '@/lib/utils';

export interface BootstrapStageMeta {
  id: VideoBootstrapStage;
  label: string;
  state: ThinkingOrbState;
  hint: string;
}

interface BootstrapProgressProps {
  meta: BootstrapStageMeta[];
  step: VideoBootstrapStage;
  confirmed: VideoBootstrapStage[];
  maxReachable: number;
  disabled: boolean;
  onGoTo: (stage: VideoBootstrapStage) => void;
  /** Stable key for the wizard's progress UI (project identity). */
  project?: VideoProject;
}

/**
 * Phase 3 — the 5-step progress rail of the bootstrap wizard (extracted so
 * bootstrap-flow.tsx stays under the ~350-line ceiling). Done stages show a
 * check; the current stage is brand-tinted; unreachable stages are muted.
 */
export function BootstrapProgress({ meta, step, confirmed, maxReachable, disabled, onGoTo }: BootstrapProgressProps) {
  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="Bootstrap progress">
      {meta.map((m, i) => {
        const done = confirmed.includes(m.id);
        const active = step === m.id;
        const reachable = m.id <= maxReachable;
        return (
          <React.Fragment key={m.id}>
            {i > 0 && <div className={cn('h-px flex-1', done ? 'bg-brand/50' : 'bg-border')} aria-hidden="true" />}
            <button
              type="button"
              onClick={() => onGoTo(m.id)}
              disabled={!reachable || disabled}
              title={m.hint}
              className={cn('group flex flex-col items-center gap-1 shrink-0', !reachable && 'cursor-not-allowed')}
            >
              <span
                className={cn(
                  'w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-colors',
                  done
                    ? 'border-brand bg-brand/10 text-brand'
                    : active
                      ? 'border-brand bg-brand/20 text-brand'
                      : 'border-border text-text-muted group-hover:border-brand/40'
                )}
              >
                {done ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : m.id}
              </span>
              <span
                className={cn(
                  'text-[9px] font-bold uppercase tracking-wide whitespace-nowrap',
                  active || done ? 'text-text-primary' : 'text-text-muted'
                )}
              >
                {m.label}
              </span>
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}
