'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, Check, Clapperboard, Lightbulb, Plus, RefreshCw, ScrollText, Sparkles, Users, X } from 'lucide-react';
import type { ProviderConfig } from '@/types';
import type { StoryTreatment } from '@/types/video';
import { runVideoBootstrap } from '@/lib/ai-client';
import { GlassCard } from '@/components/glass-card';
import { useFocusTrap } from '@/lib/use-focus-trap';
import { useScrollLock } from '@/lib/use-scroll-lock';
import { cn } from '@/lib/utils';
import { ThinkingOrb } from './thinking-orb';

export interface OnboardingPrefill {
  title?: string;
  brief?: string;
  frameworkId?: string;
  platform?: import('@/types/video').VideoTargetPlatform;
  cameraVocabulary?: 'cinematic' | 'animated' | 'graphic';
  styleHint?: string;
}

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** The Settings-active provider — null means no provider, so the AI path is disabled. */
  provider?: ProviderConfig | null;
  /** Called with the title and Directorial Brief when the user creates. The
   *  third arg is the AI-confirmed script treatment (Part 3), if the director
   *  took the AI overview path — null otherwise. */
  onCreate: (title: string, customInstructions: string, confirmedStory?: StoryTreatment | null) => void;
  /** Phase 9 — prefilled data from chat-onboarding or 'Create Similar'. */
  prefill?: OnboardingPrefill;
}

/** Starter chips — pre-fill the brief (or append) with one click. */
const BRIEF_STARTERS = [
  'Neo-cyberpunk thriller with high-contrast neon and rain-slicked streets',
  '35mm documentary style with warm golden hour lighting',
  'Cozy stop-motion fantasy with soft pastel palette and handcrafted textures',
  'High-energy sports commercial with dynamic whip-pans and saturated grade',
  'Minimalist architectural study with slow dolly moves and natural light',
];

const BEAT_LABELS = ['Act I — Setup', 'Act II — Confrontation', 'Act III — Resolution'];

/** Minimum scene-description content before the AI path enables. */
const MIN_BRIEF_LENGTH = 10;

interface CharacterNote {
  name: string;
  note: string;
}

type ModalView = 'describe' | 'review';

function isAbortError(e: unknown): boolean {
  return e instanceof DOMException
    ? e.name === 'AbortError'
    : (e as { name?: string } | null)?.name === 'AbortError';
}

/**
 * New Production modal — Part 3 two-step wizard. Step 1 captures the title,
 * the scene description (the existing Directorial Brief, relabeled), optional
 * lightweight character notes, and starter chips. Two explicit actions: the
 * instant "Create project" path (unchanged) and "Generate overview with AI",
 * which runs the SAME Stage-1 bootstrap call BootstrapFlow uses — before the
 * project record exists. Step 2 reviews the treatment with the same review
 * loop as BootstrapScriptStep (revise → regenerate, back to edit, confirm to
 * actually create). Nothing auto-fires, and closing mid-generation aborts the
 * in-flight request without creating a project.
 */
export function NewProjectModal({ isOpen, onClose, provider, onCreate, prefill }: NewProjectModalProps) {
  const titleId = React.useId();
  const descId = React.useId();
  const titleInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [title, setTitle] = useState('');
  const [brief, setBrief] = useState('');
  const [characterNotes, setCharacterNotes] = useState<CharacterNote[]>([]);
  const [overview, setOverview] = useState<StoryTreatment | null>(null);
  const [view, setView] = useState<ModalView>('describe');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState('');

  useFocusTrap(containerRef, isOpen);
  useScrollLock(isOpen);

  // Focus the title field on open; restore focus to the trigger on close.
  // Phase 9 — apply prefilled data from onboarding or 'Create Similar'.
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
      if (prefill) {
        if (prefill.title) setTitle(prefill.title);
        if (prefill.brief) setBrief(prefill.brief);
      }
      requestAnimationFrame(() => titleInputRef.current?.focus());
    }
    return () => {
      previouslyFocusedRef.current?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, prefill?.title, prefill?.brief]);

  /** Close aborts any in-flight generation and resets the wizard state. */
  const handleClose = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setGenerating(false);
    setError(null);
    setOverview(null);
    setView('describe');
    setRevision('');
    onClose();
  };

  // Close on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const applyStarter = (starter: string) => {
    setBrief((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed} — ${starter}` : starter;
    });
  };

  /** Directorial brief + director character notes, folded into customInstructions
   *  so Stage 2 (characters) inherits them later with zero pipeline changes. */
  const buildInstructions = (): string => {
    const parts = [brief.trim()];
    if (characterNotes.length > 0) {
      parts.push(
        'CHARACTER NOTES FROM DIRECTOR:\n' +
          characterNotes.map((c) => `- ${c.name}: ${c.note}`).join('\n')
      );
    }
    return parts.join('\n\n');
  };

  const generateOverview = async (revisionPrompt?: string) => {
    if (generating || !title.trim() || !provider) return;
    setGenerating(true);
    setError(null);
    const abort = new AbortController();
    abortRef.current = abort;
    try {
      const res = await runVideoBootstrap(
        {
          stage: 1,
          intent: title.trim(),
          customInstructions: buildInstructions(),
          ...(revisionPrompt && overview ? { previousContext: { storyTreatment: overview }, revisionPrompt } : {}),
          provider,
        },
        abort.signal
      );
      if (res.stage === 1) {
        setOverview(res.data);
        setView('review');
      }
    } catch (e) {
      if (isAbortError(e)) return; // modal closed mid-generation — silent
      setError(e instanceof Error ? e.message : 'Overview generation failed. Please try again.');
    } finally {
      if (abortRef.current === abort) abortRef.current = null;
      setGenerating(false);
    }
  };

  const handleRevise = () => {
    if (!revision.trim() || generating) return;
    void generateOverview(revision.trim());
    setRevision('');
  };

  const handleCreateProject = () => {
    if (!title.trim()) {
      setError('Give this production a title before creating it.');
      titleInputRef.current?.focus();
      return;
    }
    onCreate(title.trim(), buildInstructions(), null);
    resetForm();
  };

  const handleConfirmWithOverview = () => {
    if (!title.trim() || generating) return;
    onCreate(title.trim(), buildInstructions(), overview);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setBrief('');
    setCharacterNotes([]);
    setOverview(null);
    setView('describe');
    setRevision('');
    setError(null);
    abortRef.current = null;
  };

  const aiDisabled = generating || !title.trim() || brief.trim().length < MIN_BRIEF_LENGTH || !provider;
  const aiHint = !provider
    ? 'Add a provider in Settings first.'
    : brief.trim().length < MIN_BRIEF_LENGTH
      ? 'Describe the scene a little more to enable the AI path.'
      : undefined;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descId}
          ref={containerRef}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-code/60 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.28, ease: [0.34, 1.56, 0.64, 1] }}
            className="w-full max-w-lg"
          >
            <GlassCard variant="glowing" className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-brand text-white shadow-orb border border-brand/30">
                    <Clapperboard className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 id={titleId} className="text-lg font-semibold text-text-primary leading-tight">
                      New Production
                    </h3>
                    <p id={descId} className="mt-0.5 text-xs text-text-muted">
                      {view === 'describe'
                        ? 'Describe the scene — the studio can draft an Overview you review before the project exists.'
                        : 'Review the AI-drafted Overview, revise it, then create the project.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              {view === 'describe' ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCreateProject();
                  }}
                  className="mt-5 space-y-4"
                >
                  {/* Title (required) */}
                  <div>
                    <label
                      htmlFor="video-project-title"
                      className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary"
                    >
                      Project title <span className="text-danger">*</span>
                    </label>
                    <input
                      id="video-project-title"
                      ref={titleInputRef}
                      type="text"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="e.g. Neon Drift — Chapter One"
                      className="mt-1.5 w-full px-3 py-2 rounded-xl text-sm bg-surface-input border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/70 transition-shadow"
                    />
                  </div>

                  {/* Describe the scene */}
                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <label
                        htmlFor="video-project-brief"
                        className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary"
                      >
                        Describe the scene <span className="text-text-muted normal-case font-normal">(optional)</span>
                      </label>
                      <span className="text-[10px] text-text-muted tabular-nums">{brief.length} chars</span>
                    </div>
                    <textarea
                      id="video-project-brief"
                      value={brief}
                      onChange={(e) => setBrief(e.target.value)}
                      placeholder="High-level tone, visual style, camera direction, and audience overview…"
                      rows={4}
                      className="mt-1.5 w-full px-3 py-2 rounded-xl text-sm bg-surface-input border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/70 transition-shadow resize-y scrollbar-thin"
                    />
                  </div>

                  {/* Character notes (lightweight, optional) */}
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-accent" aria-hidden="true" />
                      Character notes <span className="text-text-muted normal-case font-normal">(optional)</span>
                    </p>
                    <div className="mt-1.5 space-y-1.5">
                      {characterNotes.map((note, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={note.name}
                            onChange={(e) =>
                              setCharacterNotes((prev) =>
                                prev.map((n, j) => (j === i ? { ...n, name: e.target.value } : n))
                              )
                            }
                            placeholder="Name (e.g. Maya)"
                            aria-label={`Character ${i + 1} name`}
                            className="w-28 shrink-0 px-2.5 py-1.5 rounded-lg text-xs bg-surface-input border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/70 transition-shadow"
                          />
                          <input
                            type="text"
                            value={note.note}
                            onChange={(e) =>
                              setCharacterNotes((prev) =>
                                prev.map((n, j) => (j === i ? { ...n, note: e.target.value } : n))
                              )
                            }
                            placeholder="Headstrong ex-mechanic, hiding a secret"
                            aria-label={`Character ${i + 1} note`}
                            className="min-w-0 flex-1 px-2.5 py-1.5 rounded-lg text-xs bg-surface-input border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/70 transition-shadow"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setCharacterNotes((prev) => prev.filter((_, j) => j !== i))
                            }
                            aria-label={`Remove character note ${i + 1}`}
                            className="shrink-0 p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setCharacterNotes((prev) => [...prev, { name: '', note: '' }])}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border border-dashed border-border text-text-muted hover:border-brand/50 hover:text-brand transition-colors"
                      >
                        <Plus className="w-3 h-3" aria-hidden="true" />
                        Add character
                      </button>
                    </div>
                  </div>

                  {/* Starter chips */}
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                      <Lightbulb className="w-3 h-3 text-warning" aria-hidden="true" />
                      Starter vision
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {BRIEF_STARTERS.map((starter) => (
                        <button
                          key={starter}
                          type="button"
                          onClick={() => applyStarter(starter)}
                          className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-surface-muted text-text-secondary border border-border hover:border-brand/50 hover:text-brand transition-colors"
                        >
                          {starter}
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <p role="alert" className="text-xs text-danger">
                      {error}
                    </p>
                  )}

                  {/* Actions — both explicit, nothing auto-fires */}
                  <div className="flex flex-col gap-2.5 pt-1">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <button
                        type="submit"
                        className={cn(
                          'flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl text-white',
                          'bg-brand hover:bg-brand-hover shadow-glow active:scale-[0.985] transition-all'
                        )}
                      >
                        <Clapperboard className="w-4 h-4" aria-hidden="true" />
                        Create project
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void generateOverview()}
                          disabled={aiDisabled}
                          title={aiHint}
                          className={cn(
                            'inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl border transition-colors',
                            'bg-surface-muted text-text-secondary border-border hover:border-brand/40 hover:text-brand',
                            aiDisabled && 'opacity-40 cursor-not-allowed'
                          )}
                        >
                          {generating ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
                              Drafting overview…
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" aria-hidden="true" />
                              Generate overview with AI
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    {aiHint && (
                      <p className="text-[10px] text-text-muted">{aiHint}</p>
                    )}
                  </div>
                </form>
              ) : (
                /* Step 2 — review the AI-drafted Overview */
                <div className="mt-5 space-y-4">
                  {error && (
                    <div role="alert" className="rounded-xl border border-danger/30 bg-danger/5 p-3.5 text-xs text-danger">
                      <p className="font-bold">Overview generation failed</p>
                      <p className="mt-0.5 break-words">{error}</p>
                      <button
                        type="button"
                        onClick={() => void generateOverview()}
                        disabled={generating}
                        className="mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-muted border border-border hover:border-danger/40 transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {generating || !overview ? (
                    <div className="rounded-2xl border border-border bg-surface-card/50 p-6 space-y-3" aria-live="polite">
                      <div className="flex items-center gap-3">
                        <ThinkingOrb state="composing" size={64} className="shrink-0" />
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-text-primary">Drafting the overview…</p>
                          <p className="text-xs text-text-secondary">The studio is turning your scene into a treatment.</p>
                        </div>
                      </div>
                      <div className="h-3 w-2/3 rounded-full bg-surface-muted animate-pulse" />
                      <div className="h-3 w-1/2 rounded-full bg-surface-muted animate-pulse" />
                      <div className="h-24 rounded-xl bg-surface-muted/60 animate-pulse" />
                    </div>
                  ) : (
                    <>
                      {/* Logline */}
                      <div className="rounded-xl border border-brand/30 bg-brand/5 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-brand flex items-center gap-1.5">
                          <ScrollText className="w-3 h-3" aria-hidden="true" />
                          Logline
                        </p>
                        <p className="mt-1.5 text-sm text-text-primary leading-relaxed">{overview.logline}</p>
                      </div>

                      {/* Story acts */}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-2">
                          Story acts
                        </p>
                        <div className="grid gap-2">
                          {overview.acts.map((act, i) => (
                            <div
                              key={i}
                              className="flex gap-3 rounded-xl border border-border bg-surface-card/60 p-3.5"
                            >
                              <span className="shrink-0 w-7 h-7 rounded-lg bg-brand/10 border border-brand/25 text-brand text-[10px] font-bold flex items-center justify-center tabular-nums">
                                {act.act}
                              </span>
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-wide text-text-muted">
                                  {BEAT_LABELS[i]} — {act.title}
                                </p>
                                <ul className="mt-0.5 space-y-0.5">
                                  {act.beats.map((beat: { text: string }, j: number) => (
                                    <li key={j} className="text-xs text-text-secondary leading-relaxed">
                                      • {beat.text}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Premise + theme + emotional arc */}
                      <div className="rounded-xl border border-border bg-surface-card/60 p-3.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Premise</p>
                        <p className="mt-1 text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">{overview.premise}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 rounded-xl border border-border bg-surface-card/60 p-3.5">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Emotional arc</p>
                          <p className="mt-1 text-xs text-text-secondary leading-relaxed">{overview.emotionalArc}</p>
                        </div>
                        <div className="sm:w-44 rounded-xl border border-border bg-surface-card/60 p-3.5 shrink-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Theme</p>
                          <p className="mt-1 text-xs text-text-secondary leading-relaxed">{overview.theme}</p>
                        </div>
                      </div>

                      {/* Revise */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={revision}
                          onChange={(e) => setRevision(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRevise();
                          }}
                          placeholder="Revise the overview — e.g. \u201cmake the heist more tense and claustrophobic\u201d"
                          aria-label="Revision note for the overview"
                          className="flex-1 px-3 py-2 rounded-xl text-xs bg-surface-input border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/70 transition-shadow"
                        />
                        <button
                          type="button"
                          onClick={handleRevise}
                          disabled={!revision.trim() || generating}
                          className={cn(
                            'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors shrink-0',
                            revision.trim() && !generating
                              ? 'bg-surface-muted text-text-secondary border-border hover:border-brand/40 hover:text-brand'
                              : 'opacity-40 cursor-not-allowed'
                          )}
                        >
                          <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                          Revise
                        </button>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setView('describe');
                            setError(null);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl border border-border text-text-secondary hover:bg-surface-hover transition-colors"
                        >
                          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmWithOverview}
                          disabled={generating}
                          className={cn(
                            'inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl text-white',
                            'bg-brand hover:bg-brand-hover shadow-glow active:scale-[0.985] transition-all',
                            generating && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          <Check className="w-4 h-4" aria-hidden="true" />
                          Confirm &amp; Create Project
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

