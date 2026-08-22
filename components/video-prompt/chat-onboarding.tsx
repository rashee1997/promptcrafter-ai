'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  Check,
  Clapperboard,
  Film,
  Lightbulb,
  Pencil,
  RefreshCw,
  Sparkles,
  Wand2,
  X,
} from 'lucide-react';
import type { ProviderConfig } from '@/types';
import type { VideoTargetPlatform } from '@/types/video';
import { GlassCard } from '@/components/glass-card';
import { STARTER_TEMPLATES, type StarterTemplate } from '@/lib/video/starter-templates';
import { cn } from '@/lib/utils';

/**
 * The suggestion the AI returns after the user submits a one-line idea.
 * This gets shown as a reviewable card before entering the wizard.
 */
export interface OnboardingSuggestion {
  logline: string;
  genres: string[];
  tones: string[];
  frameworkId: string;
  frameworkLabel: string;
  /** 'animated' | 'live-action' | 'motion-graphics' */
  direction: string;
  /** Target platform derived from the direction. */
  platform: VideoTargetPlatform;
  cameraVocabulary: 'cinematic' | 'animated' | 'graphic';
  styleHint: string;
}

interface ChatOnboardingProps {
  /** Active AI provider — null disables the AI suggestion path. */
  provider?: ProviderConfig | null;
  /** Called when the user accepts a suggestion or picks a starter template.
   *  The payload contains everything the bootstrap wizard needs pre-filled. */
  onAccept: (payload: {
    title: string;
    brief: string;
    frameworkId?: string;
    platform?: VideoTargetPlatform;
    cameraVocabulary?: 'cinematic' | 'animated' | 'graphic';
    styleHint?: string;
  }) => void;
}

/**
 * Phase 9 — Chat-first onboarding entry.
 * A single text input ("Tell me your idea") that produces a reviewable
 * suggestion card: logline, genres/tones, framework, animation-vs-live-action
 * direction. Accepting pre-fills Stage 1 of the bootstrap wizard.
 *
 * Genre starter templates sit below the input as skippable chips.
 */
export function ChatOnboarding({ provider, onAccept }: ChatOnboardingProps) {
  const [idea, setIdea] = useState('');
  const [suggestion, setSuggestion] = useState<OnboardingSuggestion | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Focus the input on mount.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const canSubmit = idea.trim().length >= 8 && !generating && !!provider;

  /** Generate an AI suggestion from the one-line idea. */
  const handleGenerate = async () => {
    if (!canSubmit) return;
    setGenerating(true);
    setError(null);
    setSuggestion(null);

    const abort = new AbortController();
    abortRef.current = abort;

    try {
      const res = await fetch('/api/onboarding-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: idea.trim(), provider }),
        signal: abort.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Suggestion failed (${res.status})`);
      }

      const data: OnboardingSuggestion = await res.json();
      setSuggestion(data);
      setEditingTitle(data.logline);
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      setError(e instanceof Error ? e.message : 'Suggestion generation failed.');
    } finally {
      if (abortRef.current === abort) abortRef.current = null;
      setGenerating(false);
    }
  };

  /** Accept the suggestion and hand off to the wizard. */
  const handleAccept = () => {
    if (!suggestion) return;
    onAccept({
      title: isEditingTitle ? editingTitle.trim() || suggestion.logline : suggestion.logline,
      brief: suggestion.styleHint
        ? `${suggestion.logline}\n\nStyle direction: ${suggestion.styleHint}`
        : suggestion.logline,
      frameworkId: suggestion.frameworkId,
      platform: suggestion.platform,
      cameraVocabulary: suggestion.cameraVocabulary,
      styleHint: suggestion.styleHint,
    });
  };

  /** Apply a starter template — skip the AI, go straight to accepting. */
  const handleStarterTemplate = (template: StarterTemplate) => {
    onAccept({
      title: template.label,
      brief: template.description,
      frameworkId: template.frameworkId,
      platform: template.platform,
      cameraVocabulary: template.cameraVocabulary,
      styleHint: template.styleHint,
    });
  };

  /** Skip everything — go straight to the blank wizard. */
  const handleSkip = () => {
    onAccept({ title: '', brief: '' });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (suggestion) {
        handleAccept();
      } else {
        handleGenerate();
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Hero prompt */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-brand text-[11px] font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          Quick start
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
          Tell me your idea
        </h2>
        <p className="text-sm text-text-secondary max-w-md mx-auto">
          One sentence is enough. I&apos;ll suggest a logline, genres, structure, and
          visual direction — then hand you into the studio with everything
          pre-filled.
        </p>
      </div>

      {/* Input area */}
      <GlassCard variant="default" className="p-4 sm:p-5">
        <div className="space-y-3">
          <div className="relative">
            <textarea
              ref={inputRef}
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. A lonely robot finds a flower growing in a post-apocalyptic city"
              rows={2}
              className="w-full px-4 py-3 text-sm rounded-xl border border-border bg-surface-input text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/80 focus:border-brand transition-all shadow-inner resize-none leading-relaxed"
              disabled={generating}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] text-text-muted hidden sm:block">
              ⌘+Enter to generate · Be as brief or detailed as you like
            </p>
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={handleSkip}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-text-secondary hover:bg-surface-hover transition-colors"
              >
                Skip to wizard
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!canSubmit}
                className={cn(
                  'inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl text-white transition-all',
                  'bg-brand hover:bg-brand-hover shadow-glow active:scale-[0.985]',
                  !canSubmit && 'opacity-40 cursor-not-allowed'
                )}
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Thinking…
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Generate suggestion
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Error */}
      {error && (
        <div role="alert" className="rounded-xl border border-danger/30 bg-danger/5 p-3.5 text-xs text-danger">
          <p className="font-bold">Suggestion failed</p>
          <p className="mt-0.5">{error}</p>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-muted border border-border hover:border-danger/40 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Suggestion card */}
      <AnimatePresence>
        {suggestion && !generating && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
          >
            <GlassCard variant="glowing" className="p-5 sm:p-6 space-y-5">
              {/* Logline */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-brand">
                  <Clapperboard className="w-3.5 h-3.5" />
                  Suggested logline
                </div>
                {isEditingTitle ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setIsEditingTitle(false);
                        if (e.key === 'Escape') {
                          setEditingTitle(suggestion.logline);
                          setIsEditingTitle(false);
                        }
                      }}
                      autoFocus
                      className="flex-1 px-3 py-2 rounded-xl text-sm bg-surface-input border border-brand/40 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/70 transition-shadow"
                    />
                    <button
                      type="button"
                      onClick={() => setIsEditingTitle(false)}
                      className="p-2 rounded-lg bg-brand/10 text-brand hover:bg-brand/20 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTitle(suggestion.logline);
                      setIsEditingTitle(true);
                    }}
                    className="text-left w-full group"
                  >
                    <p className="text-base sm:text-lg font-semibold text-text-primary leading-snug group-hover:text-brand transition-colors">
                      {suggestion.logline}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] text-text-muted group-hover:text-brand/60 transition-colors mt-1">
                      <Pencil className="w-3 h-3" /> Click to edit
                    </span>
                  </button>
                )}
              </div>

              {/* Genres & tones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
                    Suggested genres
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestion.genres.map((g) => (
                      <span
                        key={g}
                        className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-brand/10 text-brand border border-brand/20"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
                    Tones
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestion.tones.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-accent/10 text-accent border border-accent/20"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Framework + Direction */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-surface-card/60 p-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                    <Film className="w-3 h-3 text-brand" />
                    Structure framework
                  </p>
                  <p className="mt-1 text-sm font-semibold text-text-primary">
                    {suggestion.frameworkLabel}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-surface-card/60 p-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                    <Clapperboard className="w-3 h-3 text-accent" />
                    Visual direction
                  </p>
                  <p className="mt-1 text-sm font-semibold text-text-primary capitalize">
                    {suggestion.direction}
                  </p>
                </div>
              </div>

              {/* Accept button */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSuggestion(null);
                    setIdea('');
                    setError(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl border border-border text-text-secondary hover:bg-surface-hover transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try another idea
                </button>
                <button
                  type="button"
                  onClick={handleAccept}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-xl text-white',
                    'bg-brand hover:bg-brand-hover shadow-glow active:scale-[0.985] transition-all'
                  )}
                >
                  <ArrowRight className="w-4 h-4" />
                  Start production
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Starter templates */}
      {!suggestion && !generating && (
        <div className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted text-center flex items-center justify-center gap-1.5">
            <Lightbulb className="w-3 h-3 text-warning" />
            Or start from a template
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {STARTER_TEMPLATES.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => handleStarterTemplate(template)}
                className={cn(
                  'text-left p-3.5 rounded-xl border border-border bg-surface-card/50',
                  'transition-all duration-200 hover:border-brand/40 hover:bg-surface-card/80',
                  'hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/5',
                  'focus-visible:ring-2 focus-visible:ring-brand/60',
                  'group'
                )}
              >
                <p className="text-sm font-semibold text-text-primary group-hover:text-brand transition-colors">
                  {template.label}
                </p>
                <p className="text-[11px] text-text-muted mt-0.5">{template.tagline}</p>
                {template.platform && (
                  <span className="inline-block mt-2 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-surface-muted text-text-secondary border border-border">
                    {template.platform.toUpperCase()}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
