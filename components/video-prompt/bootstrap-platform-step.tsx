'use client';

import React from 'react';
import { Check, ChevronDown, Clock, MessageSquare, Film } from 'lucide-react';
import type { VideoTargetPlatform } from '@/types/video';
import { cn } from '@/lib/utils';

interface BootstrapPlatformStepProps {
  /** Currently selected platform (null = none yet). */
  selectedPlatform: VideoTargetPlatform | null;
  /** Sub-model for Higgsfield routing layer (null = none yet). */
  subModel: string | null;
  onChangePlatform: (platform: VideoTargetPlatform) => void;
  onChangeSubModel: (subModel: string) => void;
  onConfirm: () => void;
}

/**
 * Platform card data — one card per supported video generation platform.
 * Each entry holds the key constraints the director needs to make an informed
 * choice: duration cap, whether dialogue is supported, and whether the
 * platform can produce multiple shots in a single generation.
 */
const PLATFORMS: {
  id: VideoTargetPlatform;
  name: string;
  summary: string;
  maxDuration: string;
  supportsDialogue: boolean;
  multiShot: boolean;
}[] = [
  {
    id: 'veo',
    name: 'Veo',
    summary: "Google DeepMind's video generation model — cinematic quality.",
    maxDuration: '8 s',
    supportsDialogue: false,
    multiShot: false,
  },
  {
    id: 'kling',
    name: 'Kling',
    summary: 'High-quality video with strong motion and dialogue support.',
    maxDuration: '10 s',
    supportsDialogue: true,
    multiShot: false,
  },
  {
    id: 'seedance',
    name: 'Seedance',
    summary: "ByteDance's video model — expressive motion with dialogue.",
    maxDuration: '10 s',
    supportsDialogue: true,
    multiShot: false,
  },
  {
    id: 'higgsfield',
    name: 'Higgsfield',
    summary: 'Routing layer over multiple models with character-lock & camera tools.',
    maxDuration: 'Varies by model',
    supportsDialogue: false,
    multiShot: false,
  },
  {
    id: 'runway',
    name: 'Runway',
    summary: 'Gen-3 Alpha — industry-leading creative control.',
    maxDuration: '10 s',
    supportsDialogue: false,
    multiShot: false,
  },
  {
    id: 'luma',
    name: 'Luma',
    summary: 'Dream Machine — fast, high-quality, generous free tier.',
    maxDuration: '5 s',
    supportsDialogue: false,
    multiShot: false,
  },
  {
    id: 'pika',
    name: 'Pika',
    summary: 'Quick iterations with a playful, stylized aesthetic.',
    maxDuration: '4 s',
    supportsDialogue: false,
    multiShot: false,
  },
];

/** Underlying models Higgsfield routes to (with Soul ID / Cinema Studio on top). */
const HIGGSFIELD_SUBMODELS = [
  { value: 'veo', label: 'Veo (Google DeepMind)' },
  { value: 'kling', label: 'Kling (Kuaishou)' },
  { value: 'seedance', label: 'Seedance (ByteDance)' },
];

/**
 * Phase 2, Step 0 — the director picks one target platform before any shot
 * is drafted. Each card shows the platform name, a one-line summary, and key
 * constraints (max duration, dialogue support, multi-shot). Picking Higgsfield
 * reveals a second dropdown for the underlying model it routes to.
 */
export function BootstrapPlatformStep({
  selectedPlatform,
  subModel,
  onChangePlatform,
  onChangeSubModel,
  onConfirm,
}: BootstrapPlatformStepProps) {
  const selected = PLATFORMS.find((p) => p.id === selectedPlatform) ?? null;

  return (
    <div className="space-y-4">
      <p className="text-xs text-text-secondary leading-relaxed">
        Pick the video generation platform for this project. Every shot from
        then on is written <em>for that platform specifically</em> — not
        generic, then reformatted.
      </p>

      {/* Card grid — 2-col on sm, 3-col on lg */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {PLATFORMS.map((p) => {
          const isActive = selectedPlatform === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onChangePlatform(p.id)}
              className={cn(
                'group relative flex flex-col items-start gap-2 rounded-xl border p-3.5 text-left transition-all',
                isActive
                  ? 'border-brand bg-brand/8 ring-1 ring-brand/30 shadow-sm'
                  : 'border-border bg-surface-card/60 hover:border-brand/40 hover:bg-surface-hover/40'
              )}
            >
              {/* Name + check */}
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-bold text-text-primary">
                  {p.name}
                </span>
                <span
                  className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                    isActive
                      ? 'border-brand bg-brand text-white'
                      : 'border-border group-hover:border-brand/40'
                  )}
                >
                  {isActive && <Check className="w-3 h-3" aria-hidden="true" />}
                </span>
              </div>

              {/* Summary */}
              <p className="text-[11px] text-text-secondary leading-relaxed">
                {p.summary}
              </p>

              {/* Constraint chips */}
              <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-surface-muted border border-border text-text-muted">
                  <Clock className="w-2.5 h-2.5" aria-hidden="true" />
                  {p.maxDuration}
                </span>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border',
                    p.supportsDialogue
                      ? 'bg-success-muted/60 border-success/25 text-success'
                      : 'bg-surface-muted border-border text-text-muted'
                  )}
                >
                  <MessageSquare className="w-2.5 h-2.5" aria-hidden="true" />
                  {p.supportsDialogue ? 'Dialogue' : 'No dialogue'}
                </span>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border',
                    p.multiShot
                      ? 'bg-success-muted/60 border-success/25 text-success'
                      : 'bg-surface-muted border-border text-text-muted'
                  )}
                >
                  <Film className="w-2.5 h-2.5" aria-hidden="true" />
                  {p.multiShot ? 'Multi-shot' : 'Single shot'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Higgsfield sub-model dropdown — only visible when Higgsfield is selected */}
      {selectedPlatform === 'higgsfield' && (
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
            Higgsfield is a routing layer — pick the underlying model
          </p>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Higgsfield adds Soul&nbsp;ID (character-lock) and Cinema&nbsp;Studio
            (camera-control) on top of another model. Choose which one below.
          </p>
          <div className="relative">
            <select
              value={subModel ?? ''}
              onChange={(e) => onChangeSubModel(e.target.value)}
              className="w-full appearance-none px-3 py-2 pr-8 rounded-xl text-xs font-medium bg-surface-input border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/70 transition-shadow cursor-pointer"
            >
              <option value="">Select an underlying model…</option>
              {HIGGSFIELD_SUBMODELS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
          </div>
        </div>
      )}

      {/* Confirm — nothing fires automatically; same rule as the rest of the wizard */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onConfirm}
          disabled={
            !selectedPlatform ||
            (selectedPlatform === 'higgsfield' && !subModel)
          }
          className={cn(
            'inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl text-white',
            'bg-brand hover:bg-brand-hover shadow-glow active:scale-[0.985] transition-all',
            (!selectedPlatform ||
              (selectedPlatform === 'higgsfield' && !subModel)) &&
              'opacity-40 cursor-not-allowed'
          )}
        >
          <Check className="w-4 h-4" aria-hidden="true" />
          Confirm platform
        </button>
      </div>
    </div>
  );
}
