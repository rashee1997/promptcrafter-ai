'use client';

import React from 'react';
import { Ban, Sparkles } from 'lucide-react';

interface NegativePromptFieldProps {
  value: string;
  onChange: (value: string) => void;
  /** Has dialogue — the suggested defaults add audio-specific terms. */
  hasDialogue?: boolean;
  /** Shot prompt text — the defaults add hand/prop terms when hands are in frame. */
  promptText?: string;
}

/** Universal baseline from the research-backed default set. */
const BASELINE_TERMS = ['blur', 'distorted anatomy', 'flickering', 'unstable motion', 'duplicate objects'];
const DIALOGUE_TERMS = ['lip-sync misalignment', 'garbled speech', 'audio desync'];
const HAND_TERMS = ['floating hands', 'extra fingers', 'morphing objects'];

const HAND_PROP_PATTERN = /\b(hand|hands|fingers|grip|grab|hold|touch|reach|prop|weapon|object|cup|phone|book)\b/i;

/**
 * The shot's negative prompt as an editable, comma-separated chip row. Kept a
 * SEPARATE field from promptText (the dialect adapters emit it through each
 * target model's native negative channel). "Suggest defaults" inserts the
 * universal baseline plus any dialogue- and hands/props-specific terms the
 * system prompt already asks the model to include.
 */
export function NegativePromptField({
  value,
  onChange,
  hasDialogue = false,
  promptText,
}: NegativePromptFieldProps) {
  const hasHandsProps = promptText ? HAND_PROP_PATTERN.test(promptText) : false;

  const suggestDefaults = () => {
    // Keep whatever the director already typed, then append the missing
    // baseline/dialogue/hand terms without duplicating.
    const existing = value.split(',').map((t) => t.trim()).filter(Boolean);
    const existingLower = new Set(existing.map((t) => t.toLowerCase()));
    const terms = [...BASELINE_TERMS];
    if (hasDialogue) terms.push(...DIALOGUE_TERMS);
    if (hasHandsProps) terms.push(...HAND_TERMS);
    const merged = [...existing, ...terms.filter((t) => !existingLower.has(t.toLowerCase()))];
    onChange(merged.join(', '));
  };

  return (
    <div className="mt-2 w-full rounded-xl border border-border bg-surface-card/60 p-3 space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-danger/10 text-danger border border-danger/25">
          <Ban className="w-3 h-3" aria-hidden="true" />
          Negative prompt
        </span>
        <button
          type="button"
          onClick={suggestDefaults}
          title="Insert the universal baseline plus dialogue/hands-specific terms"
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border border-border bg-surface-muted text-text-secondary hover:border-brand/40 hover:text-brand transition-colors"
        >
          <Sparkles className="w-3 h-3" aria-hidden="true" />
          Suggest defaults
        </button>
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="blur, distorted anatomy, flickering, unstable motion, duplicate objects"
        aria-label="Negative prompt terms (comma-separated)"
        className="w-full px-2.5 py-1.5 rounded-lg text-[11px] font-mono bg-surface-input border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/70 transition-shadow"
      />

      <p className="text-[9px] leading-relaxed text-text-muted">
        3–5 short terms, most-damaging artifact first
        {hasDialogue ? ' · audio terms suggested (dialogue shot)' : ''}
        {hasHandsProps ? ' · hand/prop terms suggested' : ''}
        {value && (
          <span className="ml-1 font-semibold tabular-nums">
            · {value.split(',').map((t) => t.trim()).filter(Boolean).length} term
            {value.split(',').map((t) => t.trim()).filter(Boolean).length === 1 ? '' : 's'}
          </span>
        )}
      </p>
    </div>
  );
}
