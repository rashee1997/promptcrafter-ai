'use client';

import React, { useEffect, useRef } from 'react';
import { BookOpenCheck, Check, ImagePlus, RefreshCw } from 'lucide-react';
import { GlassCard } from '../glass-card';
import { buildOutputTabs, ImagePromptSections } from '@/lib/image-prompts';
import { ImagePlatform, ImagePromptInput, ProviderConfig } from '@/types';
import { BriefViewer } from './brief-viewer';
import { StudioMode } from './studio-types';

interface OutputPanelProps {
  isGenerating: boolean;
  streamingText: string;
  sections: ImagePromptSections | null;
  activeTab: keyof ImagePromptSections | 'raw';
  onTabChange: (tab: keyof ImagePromptSections | 'raw') => void;
  activeProvider: ProviderConfig;
  /** Studio mode — drives the empty-state copy and remix suggestions. */
  mode: StudioMode;
  /** Form input that produced this brief. */
  input?: ImagePromptInput;
  /** Requested platforms. */
  requestedPlatforms?: ImagePlatform[];
  onUseExample: () => void;
  onSave: () => void;
  onNew: () => void;
  /** Remix suggestions re-run generation with a tweak applied. */
  onRefineSuggestion?: (suggestion: string) => void;
  /** Per-section redo: regenerate just one platform prompt. */
  onRedoPlatform?: (platformKey: string) => void;
  /** Conversational edit mode ("Edit, don't re-roll"). */
  onEditPrompt?: (platformKey: string, basePrompt: string, instruction: string) => Promise<void>;
  isEditing?: boolean;
  /** Previous sections snapshot for version comparison. */
  previousSections?: ImagePromptSections | null;
  /** Whether a per-section redo is in progress. */
  isRedoing?: boolean;
}

/** Right card: status header, empty state, streaming well, and parsed brief viewer. */
export function OutputPanel({
  isGenerating,
  streamingText,
  sections,
  activeTab,
  onTabChange,
  activeProvider,
  mode,
  input,
  requestedPlatforms,
  onUseExample,
  onSave,
  onNew,
  onRefineSuggestion,
  onRedoPlatform,
  onEditPrompt,
  isEditing,
  previousSections,
  isRedoing,
}: OutputPanelProps) {
  const streamWellRef = useRef<HTMLDivElement>(null);

  // Auto-follow the stream while the user is near the bottom of the well.
  useEffect(() => {
    const el = streamWellRef.current;
    if (!el || !isGenerating) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (nearBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, [streamingText, isGenerating]);

  const hasTabs = sections ? buildOutputTabs(sections).length > 0 : false;

  return (
    <GlassCard variant="default" className="p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-border">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-brand/10 border border-brand/25 shrink-0">
            <BookOpenCheck className="w-4 h-4 text-brand" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-text-primary leading-tight">Image-ready prompts</p>
            <p className="text-[11px] text-text-muted font-mono truncate">
              {activeProvider.name} · {activeProvider.model}
            </p>
          </div>
        </div>
        {isGenerating ? (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand/10 text-brand border border-brand/25 relative overflow-hidden">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Generating…
          </span>
        ) : sections ? (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-success/10 text-success border border-success/25">
            <Check className="w-3 h-3" />
            Prompts ready
          </span>
        ) : null}
      </div>

      {/* Body */}
      <div className="pt-4">
        {!isGenerating && !streamingText && !sections && (
          /* Empty state */
          <div className="flex flex-col items-center justify-center text-center py-16 px-4">
            <div className="relative">
              <div className="absolute inset-0 bg-brand/20 rounded-full blur-2xl" />
              <div className="relative w-16 h-16 rounded-2xl bg-brand flex items-center justify-center shadow-orb border border-brand/30">
                <ImagePlus className="w-7 h-7 text-[var(--brand-foreground)]" />
              </div>
            </div>
            <h3 className="mt-5 text-base font-bold text-text-primary">
              {mode === 'logo' ? 'Describe a brand to design a logo for' : 'Describe an image to generate'}
            </h3>
            <p className="mt-2 text-xs text-text-secondary leading-relaxed max-w-sm">
              {mode === 'logo'
                ? 'The studio engineers a brand-identity brief — mark type, style, palette, and wordmark — plus tuned variants for Midjourney, DALL·E, SD/Flux, Ideogram, and Gemini / Nano Banana — ready to paste.'
                : 'The studio writes a full creative-director brief — subject, lighting, camera, color grade, text and more — plus tuned variants for Midjourney, DALL·E, SD/Flux, Ideogram, and Gemini / Nano Banana — ready to paste.'}
            </p>
            <button
              type="button"
              onClick={onUseExample}
              className="mt-4 px-3.5 py-2 rounded-xl text-xs font-semibold bg-brand/10 text-brand border border-brand/25 hover:bg-brand/15 transition-colors"
            >
              Try an example brief
            </button>
          </div>
        )}

        {(isGenerating || streamingText) && !sections && (
          /* Streaming well */
          <div
            ref={streamWellRef}
            aria-live="polite"
            aria-busy={isGenerating}
            className="relative rounded-xl border border-border bg-surface-code p-4 min-h-[260px] max-h-[520px] overflow-y-auto scrollbar-thin"
          >
            {isGenerating && (
              <div className="absolute inset-x-0 top-0 h-px overflow-hidden rounded-t-xl">
                <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-brand to-transparent animate-shimmer" />
              </div>
            )}
            <p className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-text-primary">
              {streamingText}
              {isGenerating && <span className="inline-block w-2 h-3.5 ml-0.5 bg-caret align-text-bottom animate-caret-blink" />}
            </p>
          </div>
        )}

        {sections && !isGenerating && hasTabs && (
          <BriefViewer
            sections={sections}
            activeTab={activeTab}
            onTabChange={onTabChange}
            onSave={onSave}
            onNew={onNew}
            mode={mode}
            input={input}
            requestedPlatforms={requestedPlatforms}
            onRefineSuggestion={onRefineSuggestion}
            isGenerating={isGenerating}
            onRedoPlatform={onRedoPlatform}
            onEditPrompt={onEditPrompt}
            isEditing={isEditing}
            previousSections={previousSections}
            isRedoing={isRedoing}
          />
        )}

        {sections && !isGenerating && !hasTabs && (
          <p className="text-xs text-text-muted">No sections to display.</p>
        )}
      </div>
    </GlassCard>
  );
}
