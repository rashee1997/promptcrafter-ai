'use client';

import React, { useState } from 'react';
import {
  Check,
  Copy,
  Crown,
  Layers,
  Monitor,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Square,
} from 'lucide-react';
import { LOGO_MOCKUP_PRESETS, LogoMockupPreset } from '@/lib/logo-mockups';
import { useInlineCopy } from '@/lib/use-inline-copy';
import { ImagePromptInput } from '@/types';

interface LogoMockupDeckProps {
  input: ImagePromptInput;
}

function MockupIcon({ name }: { name: string }) {
  switch (name) {
    case 'Smartphone':
      return <Smartphone className="w-4 h-4 text-brand" />;
    case 'Layers':
      return <Layers className="w-4 h-4 text-accent" />;
    case 'Square':
      return <Square className="w-4 h-4 text-text-primary" />;
    case 'Sparkles':
      return <Sparkles className="w-4 h-4 text-warning" />;
    case 'Crown':
      return <Crown className="w-4 h-4 text-success" />;
    default:
      return <ShoppingBag className="w-4 h-4 text-brand" />;
  }
}

export function LogoMockupDeck({ input }: LogoMockupDeckProps) {
  const { copiedKey, copy } = useInlineCopy();
  const [selectedMockupId, setSelectedMockupId] = useState<string>(LOGO_MOCKUP_PRESETS[0].id);

  const selectedMockup = LOGO_MOCKUP_PRESETS.find((m) => m.id === selectedMockupId) || LOGO_MOCKUP_PRESETS[0];
  const generatedPrompt = selectedMockup.generatePrompt(input);

  return (
    <div className="rounded-xl border border-border/80 bg-surface-card/90 shadow-md p-4 space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-accent/10 text-accent">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-text-primary flex items-center gap-2">
              <span>Commercial Brand Mockup Prompts</span>
              <span className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.2 rounded-full bg-accent/10 text-accent border border-accent/25">
                5 Contexts
              </span>
            </h4>
            <p className="text-[11px] text-text-muted">
              Photorealistic companion prompts to visualize this logo in high-end real-world environments.
            </p>
          </div>
        </div>
      </div>

      {/* Mockup Selector Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
        {LOGO_MOCKUP_PRESETS.map((preset) => {
          const isSelected = selectedMockupId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => setSelectedMockupId(preset.id)}
              className={`p-2 rounded-lg border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-brand bg-brand/10 ring-1 ring-brand/40 shadow-xs'
                  : 'border-border/70 bg-surface-input/60 hover:border-brand/40 hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <MockupIcon name={preset.iconName} />
                <span className="text-[11px] font-bold text-text-primary truncate">
                  {preset.label}
                </span>
              </div>
              <span className="text-[9px] text-text-muted font-mono">{preset.category}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Mockup Prompt Card */}
      <div className="p-3 rounded-lg border border-border bg-surface-input/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-text-primary">
              {selectedMockup.label} Prompt
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-surface-muted text-text-muted">
              {selectedMockup.aspectRatio}
            </span>
          </div>

          <button
            type="button"
            onClick={() => copy(generatedPrompt, selectedMockup.id)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-brand text-white hover:bg-brand/90 shadow-xs transition-all"
          >
            {copiedKey === selectedMockup.id ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Mockup Prompt</span>
              </>
            )}
          </button>
        </div>

        <p className="text-[11px] font-mono text-text-secondary leading-relaxed bg-surface-card p-2.5 rounded-md border border-border/60 select-all">
          {generatedPrompt}
        </p>

        <p className="text-[10px] text-text-muted italic">
          Tip: Run this prompt in Midjourney v6/v7 or Flux.1 Pro to render an instant photorealistic commercial product mockup.
        </p>
      </div>
    </div>
  );
}
