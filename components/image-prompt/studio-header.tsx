'use client';

import React from 'react';
import { Globe, ImagePlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudioHeaderProps {
  deepResearch: boolean;
  platformCount: number;
}

/** Tab-level intro strip: title + live research/platform badges. */
export function StudioHeader({ deepResearch, platformCount }: StudioHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-text-primary flex items-center gap-2">
          <span className="inline-flex w-8 h-8 rounded-xl bg-gradient-to-br from-brand to-accent items-center justify-center shadow-orb border border-brand/30">
            <ImagePlus className="w-4 h-4 text-white" />
          </span>
          Image Prompt Studio
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-text-secondary leading-relaxed max-w-2xl">
          Describe an image, and it researches the subject&apos;s visual culture on the web, then
          engineers a six-slot brief — subject, style, lighting, composition, mood, technical —
          tuned for each platform you select.
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border',
            deepResearch
              ? 'bg-success/10 text-success border-success/25'
              : 'bg-surface-muted text-text-muted border-border'
          )}
        >
          <Globe className="w-3 h-3" />
          {deepResearch ? 'WEB RESEARCH ON' : 'KNOWLEDGE RESEARCH'}
        </span>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand/10 text-brand border border-brand/20">
          {platformCount} PLATFORMS
        </span>
      </div>
    </div>
  );
}
