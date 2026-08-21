'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  Info,
  Layers,
  LayoutGrid,
  Columns,
  Ratio,
  AlertTriangle,
  Clapperboard,
  Sliders,
} from 'lucide-react';
import type { ProductShootSections, VideoPlatformDialect } from '@/lib/product-shoot/types';
import { parseProductShootOutput, PLATFORM_METAS } from '@/lib/product-shoot/dialects';

interface OutputPanelProps {
  output: string;
  isGenerating: boolean;
  visionPrePassNote: string | null;
  onRemix?: (suggestion: string) => void;
  onSave?: () => void;
  isSaved?: boolean;
}

function CopyButton({
  text,
  label = 'Copy',
  compact = false,
}: {
  text: string;
  label?: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`flex items-center gap-1 font-medium transition-colors ${
        copied
          ? 'text-success font-semibold'
          : 'text-text-muted hover:text-brand'
      } ${compact ? 'text-[10px] px-1.5 py-0.5 rounded bg-surface-muted/50' : 'text-xs px-2.5 py-1 rounded-lg border border-border bg-surface-input'}`}
      aria-label={label}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-success" />
          <span>Copied ✓</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

export function OutputPanel({
  output,
  isGenerating,
  visionPrePassNote,
  onRemix,
  onSave,
  isSaved,
}: OutputPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef(true);

  // Tab & View state
  const [activeTab, setActiveTab] = useState<VideoPlatformDialect | 'aspects' | 'alternatives' | 'negative'>('master');
  const [viewMode, setViewMode] = useState<'tabs' | 'grid'>('tabs');

  // Parse structured sections
  const sections = parseProductShootOutput(output);

  // Auto-scroll during streaming
  useEffect(() => {
    if (isGenerating && autoScrollRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output, isGenerating]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    autoScrollRef.current = scrollHeight - scrollTop - clientHeight < 60;
  };

  const hasOutput = output && output.trim().length > 0;

  // Build platform cards list
  const platformCards: { id: VideoPlatformDialect; title: string; prompt?: string }[] = [
    { id: 'master', title: 'Master Shot', prompt: sections.mainPrompt },
    { id: 'runway', title: 'Runway Gen-3/4', prompt: sections.runwayPrompt },
    { id: 'kling', title: 'Kling 1.6/3.0', prompt: sections.klingPrompt },
    { id: 'veo', title: 'Google Veo', prompt: sections.veoPrompt },
    { id: 'luma', title: 'Luma Ray 2', prompt: sections.lumaPrompt },
    { id: 'minimax', title: 'Minimax Hailuo', prompt: sections.minimaxPrompt },
  ].filter((c) => !!c.prompt);

  return (
    <div className="space-y-4">
      {/* Header with Tools */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold tracking-wider uppercase text-text-secondary">
            Director Output & Dialect Deck
          </label>
          {isGenerating && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand/10 text-brand animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-brand animate-ping" />
              Streaming Shot Package...
            </span>
          )}
        </div>

        {hasOutput && !isGenerating && (
          <div className="flex items-center gap-1.5">
            {/* View mode toggle */}
            <div className="flex items-center rounded-lg border border-border bg-surface-card p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('tabs')}
                className={`p-1 rounded-md transition-colors ${
                  viewMode === 'tabs' ? 'bg-surface-elevated text-brand shadow-sm font-semibold' : 'text-text-muted hover:text-text-primary'
                }`}
                title="Single tab view"
              >
                <Columns className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-surface-elevated text-brand shadow-sm font-semibold' : 'text-text-muted hover:text-text-primary'
                }`}
                title="All cards grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Save to history */}
            {onSave && (
              <button
                type="button"
                onClick={onSave}
                className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                  isSaved
                    ? 'border-success/40 bg-success/10 text-success'
                    : 'border-border bg-surface-card hover:bg-surface-muted text-text-secondary hover:text-text-primary'
                }`}
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck className="w-3.5 h-3.5 text-success" />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </>
                )}
              </button>
            )}

            {/* Copy all */}
            <CopyButton text={output} label="Copy All" />
          </div>
        )}
      </div>

      {/* Vision pre-pass notification */}
      <AnimatePresence>
        {visionPrePassNote && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-2.5 rounded-xl bg-brand/5 border border-brand/20 p-3.5"
          >
            <Info className="w-4 h-4 text-brand mt-0.5 shrink-0" />
            <p className="text-xs text-text-secondary leading-relaxed">
              {visionPrePassNote}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!isGenerating && !hasOutput && (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-surface-code border border-border p-10 min-h-[360px] text-center">
          <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center mb-3.5 shadow-[0_4px_16px_var(--shadow-sm)]">
            <Clapperboard className="w-6 h-6 text-brand" />
          </div>
          <h4 className="text-sm font-bold text-text-primary mb-1">
            Commercial Director Ready
          </h4>
          <p className="text-xs text-text-secondary max-w-sm leading-relaxed">
            Upload your product reference image, specify your brief & creative controls, and click <strong className="text-brand">Generate Shot Package</strong> to produce tailored prompts for Runway, Kling, Veo, Luma, and Minimax.
          </p>
        </div>
      )}

      {/* Streaming / Output Panel */}
      {hasOutput && (
        <div className="space-y-4">
          {/* While streaming: raw output stream */}
          {isGenerating ? (
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="rounded-2xl bg-surface-code border border-border p-4 min-h-[300px] max-h-[600px] overflow-y-auto"
            >
              <pre className="text-xs font-mono text-text-primary whitespace-pre-wrap leading-relaxed">
                {output}
                <span className="inline-block w-2 h-4 bg-brand animate-[stream-caret-blink_1.1s_steps(2,start)_infinite] ml-1 align-middle" />
              </pre>
            </div>
          ) : (
            /* Finished Generation: Rich Dialect Deck */
            <div className="space-y-4">
              {/* Tab Navigation (in tabbed view mode) */}
              {viewMode === 'tabs' && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border/60">
                  {platformCards.map((card) => {
                    const isSelected = activeTab === card.id;
                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => setActiveTab(card.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-brand text-white shadow-[0_2px_8px_var(--shadow-glow)]'
                            : 'bg-surface-card border border-border text-text-secondary hover:text-text-primary hover:border-brand/40'
                        }`}
                      >
                        <span>{card.title}</span>
                      </button>
                    );
                  })}

                  {sections.aspectVariants.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('aspects')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        activeTab === 'aspects'
                          ? 'bg-brand text-white shadow-[0_2px_8px_var(--shadow-glow)]'
                          : 'bg-surface-card border border-border text-text-secondary hover:text-text-primary hover:border-brand/40'
                      }`}
                    >
                      <Ratio className="w-3 h-3" />
                      <span>Aspects ({sections.aspectVariants.length})</span>
                    </button>
                  )}

                  {sections.alternativeConcepts.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('alternatives')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        activeTab === 'alternatives'
                          ? 'bg-brand text-white shadow-[0_2px_8px_var(--shadow-glow)]'
                          : 'bg-surface-card border border-border text-text-secondary hover:text-text-primary hover:border-brand/40'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Concepts ({sections.alternativeConcepts.length})</span>
                    </button>
                  )}

                  {sections.negativePrompt && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('negative')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        activeTab === 'negative'
                          ? 'bg-danger text-white'
                          : 'bg-surface-card border border-border text-text-secondary hover:text-danger hover:border-danger/40'
                      }`}
                    >
                      <AlertTriangle className="w-3 h-3" />
                      <span>Negative Prompt</span>
                    </button>
                  )}
                </div>
              )}

              {/* Active Tab View */}
              {viewMode === 'tabs' && (
                <div>
                  {/* Platform Tab Card */}
                  {platformCards.map((card) => {
                    if (activeTab !== card.id) return null;
                    const meta = PLATFORM_METAS[card.id];
                    return (
                      <div
                        key={card.id}
                        className="rounded-2xl border border-border bg-surface-card p-5 space-y-3 shadow-sm"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-border/50">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-text-primary">
                                {meta?.name || card.title}
                              </h3>
                              {meta?.badge && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand/10 text-brand border border-brand/20">
                                  {meta.badge}
                                </span>
                              )}
                            </div>
                            {meta?.description && (
                              <p className="text-[11px] text-text-muted mt-0.5">
                                {meta.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-text-muted">
                              {card.prompt?.length || 0} chars
                            </span>
                            <CopyButton text={card.prompt || ''} />
                          </div>
                        </div>

                        <div className="rounded-xl bg-surface-code border border-border p-4">
                          <pre className="text-xs font-mono text-text-primary whitespace-pre-wrap leading-relaxed">
                            {card.prompt}
                          </pre>
                        </div>

                        {meta?.bestFor && (
                          <div className="text-[10px] text-text-muted">
                            <strong className="text-text-secondary font-semibold">Best for:</strong> {meta.bestFor}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Aspects Tab */}
                  {activeTab === 'aspects' && (
                    <div className="space-y-3">
                      {sections.aspectVariants.map((v) => (
                        <div
                          key={v.ratio}
                          className="rounded-2xl border border-border bg-surface-card p-4 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-bold text-xs text-text-primary">
                              <Ratio className="w-3.5 h-3.5 text-brand" />
                              <span>{v.ratio} Framing</span>
                            </div>
                            <CopyButton text={v.prompt} compact />
                          </div>
                          <div className="rounded-lg bg-surface-code border border-border p-3">
                            <pre className="text-xs font-mono text-text-primary whitespace-pre-wrap leading-relaxed">
                              {v.prompt}
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Alternative Concepts Tab */}
                  {activeTab === 'alternatives' && (
                    <div className="space-y-3">
                      {sections.alternativeConcepts.map((c, i) => (
                        <div
                          key={i}
                          className="rounded-2xl border border-border bg-surface-card p-4 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-bold text-xs text-text-primary">
                              <Sparkles className="w-3.5 h-3.5 text-accent" />
                              <span>{c.title || `Concept ${i + 2}`}</span>
                            </div>
                            <CopyButton text={c.prompt} compact />
                          </div>
                          <div className="rounded-lg bg-surface-code border border-border p-3">
                            <pre className="text-xs font-mono text-text-primary whitespace-pre-wrap leading-relaxed">
                              {c.prompt}
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Negative Prompt Tab */}
                  {activeTab === 'negative' && (
                    <div className="rounded-2xl border border-danger/30 bg-danger-muted/10 p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-danger" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-danger">
                            Negative Prompt / Rigidity Exclusions
                          </h4>
                        </div>
                        <CopyButton text={sections.negativePrompt} />
                      </div>
                      <div className="rounded-xl bg-surface-code border border-danger/20 p-4">
                        <pre className="text-xs font-mono text-text-primary whitespace-pre-wrap leading-relaxed">
                          {sections.negativePrompt}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Grid View Mode (All Cards) */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {platformCards.map((card) => {
                    const meta = PLATFORM_METAS[card.id];
                    return (
                      <div
                        key={card.id}
                        className="rounded-2xl border border-border bg-surface-card p-4 space-y-2.5 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-text-primary">
                                {card.title}
                              </span>
                              {meta?.badge && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-brand/10 text-brand">
                                  {meta.badge}
                                </span>
                              )}
                            </div>
                            <CopyButton text={card.prompt || ''} compact />
                          </div>

                          <div className="rounded-xl bg-surface-code border border-border p-3 max-h-56 overflow-y-auto">
                            <pre className="text-[11px] font-mono text-text-primary whitespace-pre-wrap leading-relaxed">
                              {card.prompt}
                            </pre>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-border/40 text-[10px] text-text-muted font-mono flex items-center justify-between">
                          <span>{card.prompt?.length || 0} chars</span>
                          <span>{meta?.name}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 1-Click Remix Suggestions */}
              {sections.remixSuggestions.length > 0 && onRemix && (
                <div className="pt-2 border-t border-border/60 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
                    <Sparkles className="w-3.5 h-3.5 text-brand" />
                    <span>Quick Directorial Remixes</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {sections.remixSuggestions.map((remix, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onRemix(remix)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface-card hover:border-brand/50 hover:bg-brand/5 text-xs text-text-secondary hover:text-brand transition-all text-left group"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-brand/40 group-hover:bg-brand transition-colors" />
                        <span>{remix}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
