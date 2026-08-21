'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  RotateCcw,
  History,
  ChevronDown,
  Wand2,
  Check,
  Video,
  Layers,
} from 'lucide-react';
import type { ProviderConfig } from '@/types';
import { EXAMPLE_PRODUCT_BRIEFS, type ExampleProductBrief } from '@/lib/product-shoot/presets';
import { getProviderModelList } from '@/lib/storage';

interface StudioHeaderProps {
  activeProvider: ProviderConfig;
  savedCount: number;
  showGallery: boolean;
  onToggleGallery: () => void;
  onSelectExample: (example: ExampleProductBrief) => void;
  onReset: () => void;
  onSelectModel?: (model: string) => void;
}

export function StudioHeader({
  activeProvider,
  savedCount,
  showGallery,
  onToggleGallery,
  onSelectExample,
  onReset,
  onSelectModel,
}: StudioHeaderProps) {
  const [showExamplesMenu, setShowExamplesMenu] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const availableModels = getProviderModelList(activeProvider);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 border-b border-border/60">
      {/* Title & Badge */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand/20 via-accent/15 to-brand/5 border border-brand/30 flex items-center justify-center shadow-[0_4px_16px_var(--shadow-sm)] shrink-0">
          <Video className="w-5 h-5 text-brand" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-text-primary truncate">
              Product Shoot Studio
            </h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand/10 text-brand border border-brand/25 shrink-0">
              <Sparkles className="w-3 h-3" />
              I2V Director
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-text-secondary line-clamp-1 sm:line-clamp-none">
            Lock physical product reference & create multi-dialect commercial shot packages.
          </p>
        </div>
      </div>

      {/* Toolbar actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap justify-start sm:justify-end">
        {/* Model selector dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowModelMenu(!showModelMenu);
              setShowExamplesMenu(false);
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-border bg-surface-card hover:bg-surface-muted/60 text-xs font-medium text-text-primary transition-colors min-h-[36px]"
            aria-expanded={showModelMenu}
            aria-haspopup="true"
          >
            <Layers className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <span className="truncate max-w-[85px] xs:max-w-[120px] md:max-w-[160px] font-mono text-[11px]">
              {activeProvider.model || 'Gemini Flash'}
            </span>
            <ChevronDown className="w-3 h-3 text-text-muted shrink-0" />
          </button>

          {showModelMenu && (
            <div className="absolute right-0 mt-1.5 w-[min(260px,calc(100vw-2rem))] rounded-xl border border-border bg-surface-elevated shadow-[0_12px_32px_var(--shadow-lg)] p-1.5 z-40 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                Director Intelligence Model
              </div>
              <div className="max-h-48 overflow-y-auto space-y-0.5 no-scrollbar">
                {availableModels.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      onSelectModel?.(m);
                      setShowModelMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors ${
                      activeProvider.model === m
                        ? 'bg-brand/10 text-brand font-medium'
                        : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'
                    }`}
                  >
                    <span className="font-mono text-[11px] truncate">{m}</span>
                    {activeProvider.model === m && <Check className="w-3.5 h-3.5 text-brand shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Example briefs menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowExamplesMenu(!showExamplesMenu);
              setShowModelMenu(false);
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-border bg-surface-card hover:bg-surface-muted/60 text-xs font-medium text-text-primary transition-colors min-h-[36px]"
            aria-expanded={showExamplesMenu}
            aria-haspopup="true"
          >
            <Wand2 className="w-3.5 h-3.5 text-brand shrink-0" />
            <span className="hidden xs:inline">Load</span> Example
            <ChevronDown className="w-3 h-3 text-text-muted shrink-0" />
          </button>

          {showExamplesMenu && (
            <div className="absolute right-0 mt-1.5 w-[min(300px,calc(100vw-2rem))] rounded-xl border border-border bg-surface-elevated shadow-[0_12px_32px_var(--shadow-lg)] p-1.5 z-40 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                Curated Commercial Briefs
              </div>
              <div className="space-y-1 max-h-60 overflow-y-auto no-scrollbar">
                {EXAMPLE_PRODUCT_BRIEFS.map((ex) => (
                  <button
                    key={ex.title}
                    type="button"
                    onClick={() => {
                      onSelectExample(ex);
                      setShowExamplesMenu(false);
                    }}
                    className="w-full flex flex-col items-start px-2.5 py-2 rounded-lg text-left text-xs hover:bg-surface-muted transition-colors group"
                  >
                    <span className="font-semibold text-text-primary group-hover:text-brand transition-colors">
                      {ex.title}
                    </span>
                    <span className="text-[10px] text-text-muted mt-0.5 line-clamp-1">
                      {ex.category} · {ex.brief.sellingPoint}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* History / Gallery Toggle */}
        <button
          type="button"
          onClick={onToggleGallery}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors min-h-[36px] ${
            showGallery
              ? 'border-brand bg-brand/10 text-brand ring-2 ring-brand/30'
              : 'border-border bg-surface-card hover:bg-surface-muted/60 text-text-secondary hover:text-text-primary'
          }`}
          aria-label="Toggle saved shoots gallery"
        >
          <History className="w-3.5 h-3.5 shrink-0" />
          <span>Saved ({savedCount})</span>
        </button>

        {/* Reset button */}
        <button
          type="button"
          onClick={onReset}
          className="p-2 rounded-lg border border-border bg-surface-card hover:bg-surface-muted/60 text-text-muted hover:text-danger transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
          title="Reset form and canvas"
          aria-label="Reset form"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
