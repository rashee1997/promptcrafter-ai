'use client';

import React from 'react';
import { ImagePlus } from 'lucide-react';

interface StudioHeaderProps {
  platformCount: number;
}

/** Tab-level intro strip: title + platform badge. */
export function StudioHeader({ platformCount }: StudioHeaderProps) {
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
          Describe an image, and it engineers a creative-director brief — subject, style,
          lighting, camera & lens, composition, mood, color grade, text, resolution — tuned
          for each platform you select, including Gemini / Nano Banana.
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand/10 text-brand border border-brand/20">
          {platformCount} PLATFORMS
        </span>
      </div>
    </div>
  );
}
