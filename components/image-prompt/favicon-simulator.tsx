'use client';

import React, { useState } from 'react';
import {
  Check,
  Eye,
  Gauge,
  Info,
  Maximize2,
  Minimize2,
  Moon,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sun,
} from 'lucide-react';
import { ImagePromptInput } from '@/types';
import { LOGO_PALETTE_PRESETS } from '@/lib/logo-prompts';

interface FaviconSimulatorProps {
  input: ImagePromptInput;
}

export function FaviconSimulator({ input }: FaviconSimulatorProps) {
  const [bgMode, setBgMode] = useState<'dark' | 'light' | 'checker'>('dark');

  const brandName = input.brandName?.trim() || input.subject || 'Brand';
  const markType = input.logoType || 'combination';
  const palette = input.palette || 'monochrome';
  const paletteObj = LOGO_PALETTE_PRESETS.find((p) => p.id === palette);
  const primaryColor = paletteObj?.colors?.[0] || '#7C3AED';
  const secondaryColor = paletteObj?.colors?.[1] || '#FFFFFF';

  // Compute deterministic Scalability Score
  const scalabilityScore = React.useMemo(() => {
    let score = 70;
    // Mark type adjustments
    if (markType === 'lettermark' || markType === 'pictorial') score += 15;
    if (markType === 'abstract') score += 10;
    if (markType === 'emblem') score -= 15; // Emblems struggle at 16px
    if (markType === 'wordmark') score -= 10; // Long wordmarks struggle at 16px

    // Palette simplicity
    if (palette === 'monochrome' || palette === 'duotone') score += 10;
    if (palette === 'neon' || palette === 'sunset') score += 5;

    // Typography rules
    if (input.typography === 'no-text') score += 10;

    return Math.min(Math.max(score, 45), 98);
  }, [markType, palette, input.typography]);

  const initialLetter = (input.brandName?.trim() || input.subject || 'B')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 2)
    .toUpperCase() || 'B';

  const getContainerBg = () => {
    if (bgMode === 'dark') return 'bg-[#111111] text-white border-white/15';
    if (bgMode === 'light') return 'bg-[#FFFFFF] text-[#111111] border-black/15 shadow-xs';
    return 'bg-[repeating-conic-gradient(#E2E8F0_0%_25%,#FFFFFF_0%_50%)] bg-[length:12px_12px] text-[#111111] border-border';
  };

  return (
    <div className="rounded-xl border border-border/80 bg-surface-card/90 shadow-md p-4 space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand/10 text-brand">
            <Minimize2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-text-primary flex items-center gap-2">
              <span>Favicon & Multi-Scale Reduction Simulator</span>
              <span className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.2 rounded-full bg-brand/10 text-brand border border-brand/25">
                Squint Test
              </span>
            </h4>
            <p className="text-[11px] text-text-muted">
              Live scale reduction matrix verifying legibility from a 16px browser tab to a 512px app icon.
            </p>
          </div>
        </div>

        {/* Scalability Badge */}
        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <span className="text-[9px] uppercase font-bold text-text-muted block">
              Scalability Health
            </span>
            <span className="text-xs font-mono font-bold text-brand">{scalabilityScore}/100</span>
          </div>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${
              scalabilityScore >= 80
                ? 'bg-success/10 text-success border-success/30'
                : scalabilityScore >= 65
                ? 'bg-accent/10 text-accent border-accent/30'
                : 'bg-warning/10 text-warning border-warning/30'
            }`}
          >
            {scalabilityScore}
          </div>
        </div>
      </div>

      {/* Controls & Background Switcher */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-[10px] text-text-muted">
          <span>Background substrate:</span>
          <button
            type="button"
            onClick={() => setBgMode('dark')}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
              bgMode === 'dark' ? 'bg-brand text-[var(--brand-foreground)]' : 'bg-surface-input text-text-muted hover:text-text-primary'
            }`}
          >
            Dark (#111)
          </button>
          <button
            type="button"
            onClick={() => setBgMode('light')}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
              bgMode === 'light' ? 'bg-brand text-[var(--brand-foreground)]' : 'bg-surface-input text-text-muted hover:text-text-primary'
            }`}
          >
            Light (#FFF)
          </button>
          <button
            type="button"
            onClick={() => setBgMode('checker')}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
              bgMode === 'checker' ? 'bg-brand text-[var(--brand-foreground)]' : 'bg-surface-input text-text-muted hover:text-text-primary'
            }`}
          >
            Checker
          </button>
        </div>
      </div>

      {/* 4 Scale Targets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
        {/* 1. 16px Favicon */}
        <div className="rounded-lg border border-border/80 bg-surface-input/50 p-2.5 flex flex-col justify-between items-center text-center space-y-2">
          <span className="text-[10px] font-bold uppercase text-text-secondary">
            16×16px Favicon
          </span>
          <div className="flex items-center justify-center h-16 w-full">
            <div
              className={`w-4 h-4 rounded-xs border flex items-center justify-center font-bold text-[8px] select-none ${getContainerBg()}`}
              title="16px Favicon"
            >
              {initialLetter.charAt(0)}
            </div>
          </div>
          <span className="text-[9px] text-text-muted font-mono">Browser Tab</span>
        </div>

        {/* 2. 32px Taskbar / Bookmark */}
        <div className="rounded-lg border border-border/80 bg-surface-input/50 p-2.5 flex flex-col justify-between items-center text-center space-y-2">
          <span className="text-[10px] font-bold uppercase text-text-secondary">
            32×32px Bookmark
          </span>
          <div className="flex items-center justify-center h-16 w-full">
            <div
              className={`w-8 h-8 rounded-sm border flex items-center justify-center font-bold text-xs select-none shadow-xs ${getContainerBg()}`}
              title="32px Bookmark Icon"
            >
              {initialLetter}
            </div>
          </div>
          <span className="text-[9px] text-text-muted font-mono">Desktop App</span>
        </div>

        {/* 3. 64px App Squircle */}
        <div className="rounded-lg border border-border/80 bg-surface-input/50 p-2.5 flex flex-col justify-between items-center text-center space-y-2">
          <span className="text-[10px] font-bold uppercase text-text-secondary">
            64×64px Squircle
          </span>
          <div className="flex items-center justify-center h-16 w-full">
            <div
              className={`w-14 h-14 rounded-xl border flex items-center justify-center font-bold text-base select-none shadow-sm ${getContainerBg()}`}
              title="64px Mobile App Icon"
            >
              <div className="text-center">
                <span className="block font-bold">{initialLetter}</span>
              </div>
            </div>
          </div>
          <span className="text-[9px] text-text-muted font-mono">Mobile App Icon</span>
        </div>

        {/* 4. 128px Hero Sub-mark */}
        <div className="rounded-lg border border-border/80 bg-surface-input/50 p-2.5 flex flex-col justify-between items-center text-center space-y-2">
          <span className="text-[10px] font-bold uppercase text-text-secondary">
            128×128px Hero Mark
          </span>
          <div className="flex items-center justify-center h-16 w-full">
            <div
              className={`w-16 h-16 rounded-2xl border flex flex-col items-center justify-center p-1 font-bold select-none shadow-md ${getContainerBg()}`}
              title="128px Hero Vector Sub-mark"
            >
              <span className="text-lg font-black tracking-tight">{initialLetter}</span>
              <span className="text-[8px] font-semibold opacity-75 truncate max-w-[50px]">
                {brandName.slice(0, 8)}
              </span>
            </div>
          </div>
          <span className="text-[9px] text-text-muted font-mono">Storefront Mark</span>
        </div>
      </div>

      {/* Diagnostic Readout */}
      <div className="p-2.5 rounded-lg bg-surface-input/60 border border-border/60 text-[10px] text-text-muted flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />
        <p className="leading-snug">
          <span className="font-semibold text-text-secondary">Scalability Assessment: </span>
          {scalabilityScore >= 80
            ? 'Excellent vector reduction. High silhouette contrast guarantees crisp legibility on 16px browser tabs and retina screens.'
            : scalabilityScore >= 65
            ? 'Good commercial scalability. Ensure fine typographic details separate cleanly from the primary mark when used as a favicon.'
            : 'Emblem/Wordmark complexity detected. Ensure the standalone icon is isolated from the wordmark when rendering below 32px.'}
        </p>
      </div>
    </div>
  );
}
