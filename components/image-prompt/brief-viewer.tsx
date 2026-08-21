'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Copy,
  Edit3,
  GitCompareArrows,
  Info,
  LayoutGrid,
  PanelTop,
  RefreshCw,
  Save,
  Send,
  Sparkles,
  Wand2,
  X,
} from 'lucide-react';
import { Tooltip } from '../tooltip';
import { cn } from '@/lib/utils';
import {
  buildOutputTabs,
  getMissingSections,
  ImagePromptSections,
  PLATFORM_OPTIONS,
} from '@/lib/image-prompts';
import { auditImagePromptQuality, ImagePromptScorecard } from '@/lib/image-prompt-quality';
import { useInlineCopy } from '@/lib/use-inline-copy';
import { ImagePlatform, ImagePromptInput } from '@/types';
import { StudioMode } from './studio-types';
import { BrandGuidelinesCard } from './brand-guidelines-card';
import { LogoMockupDeck } from './logo-mockup-deck';
import { FaviconSimulator } from './favicon-simulator';

interface BriefViewerProps {
  sections: ImagePromptSections;
  activeTab: keyof ImagePromptSections | 'raw';
  onTabChange: (tab: keyof ImagePromptSections | 'raw') => void;
  onSave: () => void;
  onNew: () => void;
  /** Studio mode — remix suggestions are tuned to the brief anatomy. */
  mode: StudioMode;
  /** Form input that produced this brief (for audit and quality scorecard). */
  input?: ImagePromptInput;
  /** Requested platforms (to detect missing sections). */
  requestedPlatforms?: ImagePlatform[];
  /** Remix suggestions (Related-Prompts pattern) re-run generation with a tweak applied. */
  onRefineSuggestion?: (suggestion: string) => void;
  isGenerating: boolean;
  /** Per-section redo: regenerate just one platform prompt. */
  onRedoPlatform?: (platformKey: string) => void;
  /** Conversational edit mode ("Edit, don't re-roll"). */
  onEditPrompt?: (platformKey: string, basePrompt: string, instruction: string) => Promise<void>;
  isEditing?: boolean;
  /** Version history: previous sections snapshot for comparison. */
  previousSections?: ImagePromptSections | null;
  /** Whether a per-section redo is in progress. */
  isRedoing?: boolean;
}

type BriefView = 'tab' | 'all';

const VIEW_KEY = 'pc:img-brief-view';

function readView(): BriefView {
  if (typeof window === 'undefined') return 'tab';
  try {
    return window.localStorage.getItem(VIEW_KEY) === 'all' ? 'all' : 'tab';
  } catch {
    return 'tab';
  }
}

/** Accent dot color per platform section; brand for master/negative/research. */
function platformColor(key: string): string | undefined {
  return PLATFORM_OPTIONS.find((p) => p.id === key)?.color;
}

const IMAGE_REFINE_SUGGESTIONS = [
  { id: 'light', label: 'More cinematic lighting' },
  { id: 'color', label: 'Warmer color grade' },
  { id: 'text', label: 'Add bold in-image text' },
  { id: 'lens', label: 'Shift to 85mm portrait compression' },
];

const LOGO_REFINE_SUGGESTIONS = [
  { id: 'flat', label: 'Simplify to a flat vector lockup' },
  { id: 'mono', label: 'Try a single-color version' },
  { id: 'emblem', label: 'Wrap it in an emblem / badge frame' },
  { id: 'hidden', label: 'Hide a second meaning in the negative space' },
  { id: 'daring', label: 'Push the concept to be bolder and more ownable' },
  { id: 'typography', label: 'Give the wordmark custom display typography' },
];

export function BriefViewer({
  sections,
  activeTab,
  onTabChange,
  onSave,
  onNew,
  mode,
  input,
  requestedPlatforms = [],
  onRefineSuggestion,
  isGenerating,
  onRedoPlatform,
  onEditPrompt,
  isEditing,
  previousSections,
  isRedoing,
}: BriefViewerProps) {
  const tabs = buildOutputTabs(sections);
  const refineSuggestions = mode === 'logo' ? LOGO_REFINE_SUGGESTIONS : IMAGE_REFINE_SUGGESTIONS;
  const [view, setView] = useState<BriefView>('tab');
  const { copiedKey, copy } = useInlineCopy();

  // Scorecard & linter state
  const [showScorecard, setShowScorecard] = useState(false);
  const scorecard: ImagePromptScorecard | null = useMemo(() => {
    if (!input) return null;
    return auditImagePromptQuality(input, sections);
  }, [input, sections]);

  // Conversational edit state per card
  const [editingCardKey, setEditingCardKey] = useState<string | null>(null);
  const [editInstruction, setEditInstruction] = useState('');

  // Missing sections detection (Fix D6)
  const missingPlatforms = useMemo(() => {
    if (!requestedPlatforms || requestedPlatforms.length === 0) return [];
    return getMissingSections(requestedPlatforms, sections);
  }, [requestedPlatforms, sections]);

  useEffect(() => {
    setView(readView());
  }, []);

  const persistView = (v: BriefView) => {
    setView(v);
    try {
      window.localStorage.setItem(VIEW_KEY, v);
    } catch {
      // storage unavailable
    }
  };

  // Safety: never render a raw/unknown tab — fall back to the first section.
  const activeTabKey = tabs.some((t) => t.key === activeTab) ? activeTab : (tabs[0]?.key ?? 'master');
  const activeLabel = tabs.find((t) => t.key === activeTabKey)?.label ?? 'Prompt';

  const fullDocument = useMemo(
    () =>
      tabs
        .map((t) => `## ${t.label}\n\n${sections[t.key] ?? ''}`)
        .join('\n\n'),
    [tabs, sections]
  );

  const [compareKey, setCompareKey] = useState<string | null>(null);
  const showCompare = compareKey !== null && previousSections;

  const handleTriggerEdit = (key: string) => {
    setEditingCardKey(editingCardKey === key ? null : key);
    setEditInstruction('');
  };

  const handleApplyEdit = async (key: string, basePrompt: string) => {
    if (!editInstruction.trim() || !onEditPrompt) return;
    await onEditPrompt(key, basePrompt, editInstruction.trim());
    setEditingCardKey(null);
    setEditInstruction('');
  };

  const renderCard = (key: keyof ImagePromptSections, label: string) => {
    const content = sections[key] ?? '';
    const prevContent = previousSections?.[key] ?? '';
    const copied = copiedKey === key;
    const color = platformColor(String(key));
    const isCompareTarget = compareKey === key && showCompare;
    const hasPrev = !!prevContent && prevContent !== content;
    const isPlatform = [
      'midjourney',
      'dalle',
      'gpt-image',
      'stable-diffusion',
      'flux',
      'ideogram',
      'gemini',
      'recraft',
      'seedream',
    ].includes(String(key));
    const isJsonTab = key === 'json';
    const isEditingThisCard = editingCardKey === key;

    // Filter linter issues specific to this platform card
    const cardIssues = scorecard?.lintIssues.filter(
      (iss) => iss.platform === key || (key === 'master' && iss.platform === 'master')
    ) || [];

    return (
      <div key={key} className="rounded-xl border border-border bg-surface-code overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border/60 bg-surface-muted/50">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted min-w-0">
            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', color ?? 'bg-brand')} />
            <span className="truncate">{label}</span>
            {isJsonTab && (
              <span className="px-1.5 py-0.2 rounded bg-brand/10 text-brand text-[9px] font-mono lowercase">
                schema
              </span>
            )}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Edit / Tweak mode button ("Edit, don't re-roll") */}
            {isPlatform && onEditPrompt && (
              <button
                type="button"
                onClick={() => handleTriggerEdit(String(key))}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all',
                  isEditingThisCard
                    ? 'bg-brand/15 border-brand text-brand'
                    : 'bg-surface-card border-border text-text-secondary hover:text-brand hover:border-brand/40'
                )}
                title="Conversational prompt edit ('Edit, don't re-roll')"
              >
                <Edit3 className="w-3 h-3" />
                Edit
              </button>
            )}

            {/* Compare previous */}
            {hasPrev && (
              <button
                type="button"
                onClick={() => setCompareKey(isCompareTarget ? null : key)}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all',
                  isCompareTarget
                    ? 'bg-warning/10 border-warning/40 text-warning'
                    : 'bg-surface-card border-border text-text-secondary hover:text-warning hover:border-warning/40'
                )}
              >
                <GitCompareArrows className="w-3 h-3" />
                Compare
              </button>
            )}

            {/* Redo section */}
            {isPlatform && onRedoPlatform && (
              <button
                type="button"
                disabled={isGenerating || isRedoing}
                onClick={() => onRedoPlatform(String(key))}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-surface-card border border-border text-text-secondary hover:text-brand hover:border-brand/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                title="Regenerate this section only"
              >
                <RefreshCw className={cn('w-3 h-3', isRedoing && 'animate-spin')} />
                Redo
              </button>
            )}

            <span className="text-[10px] font-mono text-text-muted tabular-nums">
              {content.length.toLocaleString()} chars
            </span>

            {/* Copy button */}
            <button
              type="button"
              onClick={() => copy(content, key)}
              aria-label={`Copy ${label} prompt`}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all active:scale-[0.97]',
                copied
                  ? 'bg-success/10 border-success/40 text-success'
                  : 'bg-surface-card border-border text-text-secondary hover:text-brand hover:border-brand/40'
              )}
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Linter warnings for this card */}
        {cardIssues.length > 0 && (
          <div className="px-3 py-1.5 bg-warning/10 border-b border-warning/20 space-y-1">
            {cardIssues.map((iss, i) => (
              <p key={i} className="text-[10px] text-warning/90 leading-tight flex items-start gap-1">
                <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                <span>
                  <strong>{iss.rule}:</strong> {iss.message} {iss.suggestion && <em className="text-text-muted">({iss.suggestion})</em>}
                </span>
              </p>
            ))}
          </div>
        )}

        {/* Inline Conversational Edit drawer ("Edit, don't re-roll") */}
        {isEditingThisCard && (
          <div className="p-3 bg-brand/5 border-b border-brand/20 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-brand uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Conversational Edit (“Edit, don’t re-roll”)
              </span>
              <button
                type="button"
                onClick={() => setEditingCardKey(null)}
                className="text-text-muted hover:text-text-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={editInstruction}
                onChange={(e) => setEditInstruction(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyEdit(String(key), content);
                  }
                }}
                placeholder='e.g. "Change the lighting to sunset rim light and remove the hat"'
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-brand/30 bg-surface-input text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
              />
              <button
                type="button"
                disabled={!editInstruction.trim() || isEditing}
                onClick={() => handleApplyEdit(String(key), content)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand text-white hover:bg-brand-hover transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                Apply
              </button>
            </div>
            <p className="text-[9px] text-text-muted">
              Applies targeted delta edits without discarding your base composition or style.
            </p>
          </div>
        )}

        {/* Card Body */}
        {isCompareTarget && showCompare ? (
          <div className="p-4 max-h-[380px] overflow-y-auto scrollbar-thin">
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-warning">Previous</span>
                <p className="mt-1 whitespace-pre-wrap font-mono text-xs leading-relaxed text-text-muted opacity-70">
                  {prevContent || '(empty)'}
                </p>
              </div>
              <div className="border-t border-border/60 pt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand">Current</span>
                <p className="mt-1 whitespace-pre-wrap font-mono text-xs leading-relaxed text-text-primary">
                  {content || '(empty)'}
                </p>
              </div>
            </div>
          </div>
        ) : isJsonTab ? (
          <div className="p-4 max-h-[380px] overflow-y-auto scrollbar-thin">
            <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-brand-light bg-surface-sunken p-3 rounded-lg border border-border/80">
              {content}
            </pre>
          </div>
        ) : (
          <div className="p-4 max-h-[380px] overflow-y-auto scrollbar-thin">
            <p className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-text-primary">{content}</p>
          </div>
        )}
      </div>
    );
  };

  const copyAllCopied = copiedKey === '__all__';

  return (
    <div className="space-y-3">
      {/* Quality Scorecard Bar */}
      {scorecard && (
        <div className="rounded-xl border border-border bg-surface-card p-3 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center px-2 py-0.5 rounded-md text-xs font-bold bg-brand/15 border border-brand/30 text-brand">
                {scorecard.overallScore}/100
              </span>
              <span className="text-xs font-semibold text-text-primary">Prompt Quality Scorecard</span>
              <span className="text-[10px] text-text-muted hidden sm:inline">
                · {scorecard.slotCoverage.coveredSlots.length} slots specified · {scorecard.dialectHealth.validDialects.length} dialects verified
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowScorecard(!showScorecard)}
              className="text-[11px] font-medium text-brand hover:underline flex items-center gap-1"
            >
              {showScorecard ? 'Hide details' : 'View rubric'}
              <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', showScorecard && 'rotate-180')} />
            </button>
          </div>

          {showScorecard && (
            <div className="pt-2 border-t border-border/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Slot Coverage</span>
                <p className="text-[11px] text-text-secondary">
                  {scorecard.slotCoverage.coveredSlots.join(', ') || 'None'}
                </p>
                {scorecard.slotCoverage.missingSlots.length > 0 && (
                  <p className="text-[10px] text-warning">
                    Missing: {scorecard.slotCoverage.missingSlots.join(', ')}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Dialect Health</span>
                <p className="text-[11px] text-text-secondary">
                  {scorecard.dialectHealth.validDialects.join(', ') || 'Pending'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Concreteness & Banned Words</span>
                <p className="text-[11px] text-text-secondary">
                  {scorecard.bannedTokenCount === 0
                    ? '✓ Clean — no filler buzzwords'
                    : `⚠️ ${scorecard.bannedTokenCount} buzzword(s) found`}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Missing Sections Alert (Fix D6 & P1.8) */}
      {missingPlatforms.length > 0 && (
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-warning/10 border border-warning/30 text-xs text-warning">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>
              {requestedPlatforms.length - missingPlatforms.length} of {requestedPlatforms.length} dialects returned.{' '}
              Missing: <strong>{missingPlatforms.join(', ')}</strong>
            </span>
          </div>
          {onRedoPlatform && (
            <button
              type="button"
              onClick={() => onRedoPlatform(missingPlatforms[0])}
              className="px-2.5 py-1 rounded-lg bg-warning/20 hover:bg-warning/30 text-warning font-semibold border border-warning/40 text-[10px] shrink-0 transition-colors"
            >
              Generate {missingPlatforms[0]}
            </button>
          )}
        </div>
      )}

      {/* Tab bar + view toggle */}
      <div className="flex items-center gap-2">
        <div
          role="tablist"
          aria-label="Brief sections"
          className="flex items-center gap-1 p-1 rounded-xl bg-surface-sunken border border-border overflow-x-auto scrollbar-thin flex-1 min-w-0"
        >
          {tabs.map((tab) => {
            const isActive = view === 'tab' && activeTabKey === tab.key;
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(tab.key)}
                className={cn(
                  'relative flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg whitespace-nowrap transition-colors duration-200 shrink-0',
                  isActive ? 'text-brand' : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="img-studio-tab-pill"
                    className="absolute inset-0 rounded-lg bg-surface-card border border-border shadow-sm shadow-brand/10"
                    transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
                  />
                )}
                <span
                  className={cn(
                    'relative z-10 w-1.5 h-1.5 rounded-full',
                    platformColor(String(tab.key)) ?? 'bg-brand/70'
                  )}
                />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
        <div
          role="group"
          aria-label="Output view"
          className="flex items-center gap-0.5 p-0.5 rounded-xl bg-surface-sunken border border-border shrink-0"
        >
          <Tooltip label="One card at a time">
            <button
              type="button"
              onClick={() => persistView('tab')}
              aria-pressed={view === 'tab'}
              className={cn(
                'p-1.5 rounded-lg transition-all',
                view === 'tab'
                  ? 'bg-surface-card text-brand border border-border shadow-sm'
                  : 'text-text-muted hover:text-text-primary border border-transparent'
              )}
              aria-label="Single card view"
            >
              <PanelTop className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
          <Tooltip label="All cards at once">
            <button
              type="button"
              onClick={() => persistView('all')}
              aria-pressed={view === 'all'}
              className={cn(
                'p-1.5 rounded-lg transition-all',
                view === 'all'
                  ? 'bg-surface-card text-brand border border-border shadow-sm'
                  : 'text-text-muted hover:text-text-primary border border-transparent'
              )}
              aria-label="All cards view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Cards */}
      {view === 'tab' ? (
        renderCard(activeTabKey, activeLabel)
      ) : (
        <div className="space-y-3">{tabs.map((t) => renderCard(t.key, t.label))}</div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => copy(fullDocument, '__all__')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-[0.985]',
            copyAllCopied
              ? 'bg-success/10 border border-success/40 text-success'
              : 'bg-brand hover:bg-brand-hover text-white shadow-glow'
          )}
        >
          {copyAllCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copyAllCopied ? 'Copied all prompts' : 'Copy all prompts'}
        </button>
        <button
          type="button"
          onClick={onSave}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-surface-muted border border-border text-text-primary hover:border-brand/40 transition-colors"
        >
          <Save className="w-3.5 h-3.5 text-brand" />
          Save to gallery
        </button>
        <button
          type="button"
          onClick={onNew}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-surface-muted border border-border text-text-secondary hover:border-brand/40 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          New brief
        </button>
      </div>

      {/* Remix suggestions — Related-Prompts pattern */}
      {onRefineSuggestion && (
        <div className="flex items-center gap-2 flex-wrap rounded-xl border border-border bg-surface-muted/40 p-2.5">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
            <Wand2 className="w-3.5 h-3.5 text-brand" />
            Remix
          </span>
          {refineSuggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              disabled={isGenerating}
              onClick={() => onRefineSuggestion(s.label)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-surface-card border border-border text-text-secondary hover:text-brand hover:border-brand/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Logo Studio 2.0 Companion Suite (Favicon Simulator, Mockup Deck, Brand Guidelines) ── */}
      {mode === 'logo' && input && (
        <div className="space-y-4 pt-2">
          {/* Favicon & Scalability Simulator */}
          <FaviconSimulator input={input} />

          {/* Commercial Brand Mockup Prompts */}
          <LogoMockupDeck input={input} />

          {/* Brand Identity Spec Sheet & Guidelines */}
          <BrandGuidelinesCard input={input} />
        </div>
      )}
    </div>
  );
}
