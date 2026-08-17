'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Clapperboard, Lightbulb, X } from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { useFocusTrap } from '@/lib/use-focus-trap';
import { useScrollLock } from '@/lib/use-scroll-lock';
import { cn } from '@/lib/utils';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called with the title and Directorial Brief when the user creates. */
  onCreate: (title: string, customInstructions: string) => void;
}

/** Starter chips — pre-fill the brief (or append) with one click. */
const BRIEF_STARTERS = [
  'Neo-cyberpunk thriller with high-contrast neon and rain-slicked streets',
  '35mm documentary style with warm golden hour lighting',
  'Cozy stop-motion fantasy with soft pastel palette and handcrafted textures',
  'High-energy sports commercial with dynamic whip-pans and saturated grade',
  'Minimalist architectural study with slow dolly moves and natural light',
];

/**
 * Directorial Brief modal — the entry point for a new production. Captures a
 * title (required) plus the high-level vision (tone, visual style, camera
 * direction, audience) that later phases turn into a story bible and shot
 * plan. Framer Motion backdrop fade + scale-in, focus trap, scroll lock,
 * Escape to close, focus restore.
 */
export function NewProjectModal({ isOpen, onClose, onCreate }: NewProjectModalProps) {
  const titleId = React.useId();
  const descId = React.useId();
  const titleInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const [title, setTitle] = useState('');
  const [brief, setBrief] = useState('');
  const [error, setError] = useState<string | null>(null);

  useFocusTrap(containerRef, isOpen);
  useScrollLock(isOpen);

  // Focus the title field on open; restore focus to the trigger on close.
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
      requestAnimationFrame(() => titleInputRef.current?.focus());
    }
    return () => {
      previouslyFocusedRef.current?.focus?.();
    };
  }, [isOpen]);

  // Close on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const applyStarter = (starter: string) => {
    setBrief((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed} — ${starter}` : starter;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Give this production a title before creating it.');
      titleInputRef.current?.focus();
      return;
    }
    onCreate(title.trim(), brief.trim());
    setTitle('');
    setBrief('');
    setError(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descId}
          ref={containerRef}
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
                      Start with a Directorial Brief — the vision the studio turns into a shot plan.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
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
                  {error && (
                    <p role="alert" className="mt-1.5 text-xs text-danger">
                      {error}
                    </p>
                  )}
                </div>

                {/* Directorial Brief */}
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <label
                      htmlFor="video-project-brief"
                      className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary"
                    >
                      Directorial brief <span className="text-text-muted normal-case font-normal">(optional)</span>
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

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium rounded-xl border border-border text-text-secondary hover:bg-surface-hover transition-colors"
                  >
                    Cancel
                  </button>
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
                </div>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
