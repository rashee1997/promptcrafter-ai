'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { BookmarkPlus, Check, X } from 'lucide-react';
import { deleteCustomPreset, getCustomPresets, saveCustomPreset } from '@/lib/storage';
import { CustomPresetEntry, CustomPresetMode } from '@/types';

/**
 * Shared custom-value entry for every chip row in the Image/Logo Prompt
 * Studio. Composes two behaviors used identically by ChipRow / MultiChipRow
 * and the bespoke grid rows in prompt-form.tsx:
 *
 *  1. Persisted presets — saved custom values load once per mount and render
 *     as normal chips (bookmarked, deletable) alongside the built-in presets.
 *  2. One-off custom entry — a "Custom…" trigger reveals an inline editor;
 *     confirm selects the raw typed value, save additionally persists it.
 *
 * Only this module (plus chip-row.tsx) owns the interaction, so every row
 * stays consistent without per-field duplication.
 */

/** Loads + mutates the persisted custom presets for one chip row. */
export function useSavedPresets(field: string, mode: CustomPresetMode) {
  const [saved, setSaved] = useState<CustomPresetEntry[]>([]);

  const reload = useCallback(async () => {
    try {
      setSaved(await getCustomPresets(field, mode));
    } catch {
      // Storage unavailable — keep the current list.
    }
  }, [field, mode]);

  useEffect(() => {
    reload();
  }, [reload]);

  const save = useCallback(
    async (label: string, value: string) => {
      const entry = await saveCustomPreset({ field, mode, label, value });
      setSaved((prev) => [...prev.filter((e) => e.id !== entry.id), entry]);
      return entry;
    },
    [field, mode]
  );

  const remove = useCallback(async (id: string) => {
    await deleteCustomPreset(id);
    setSaved((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return { saved, save, remove, reload };
}

export interface UseCustomChipEntryOptions {
  /** StudioFormState key this row writes to (e.g. 'lighting', 'palette', 'usage'). */
  field: string;
  /** Which studio mode(s) this row's saved presets belong to. */
  mode: CustomPresetMode;
}

/**
 * The one shared hook every chip row (ChipRow, MultiChipRow, and the bespoke
 * style / palette / platform rows) calls: persisted presets + entry state.
 */
export function useCustomChipEntry({ field, mode }: UseCustomChipEntryOptions) {
  const presets = useSavedPresets(field, mode);
  const [entering, setEntering] = useState(false);
  const [draft, setDraft] = useState('');

  const begin = useCallback(() => {
    setDraft('');
    setEntering(true);
  }, []);

  const cancel = useCallback(() => {
    setEntering(false);
    setDraft('');
  }, []);

  const changeDraft = useCallback((value: string) => setDraft(value), []);

  /** Returns the trimmed typed value (editor closed), or null when empty. */
  const confirmDraft = useCallback(() => {
    const value = draft.trim();
    if (!value) return null;
    cancel();
    return value;
  }, [draft, cancel]);

  /** Persists the draft as a reusable preset and returns its value, or null when empty. */
  const saveDraft = useCallback(async () => {
    const value = draft.trim();
    if (!value) return null;
    cancel();
    const entry = await presets.save(value, value);
    return entry.value;
  }, [draft, cancel, presets]);

  return {
    ...presets,
    entering,
    draft,
    begin,
    cancel,
    changeDraft,
    confirmDraft,
    saveDraft,
  };
}

interface CustomChipEditorProps {
  draft: string;
  onDraftChange: (value: string) => void;
  /** Select the typed value once, without persisting it. */
  onConfirm: () => void;
  /** Persist the typed value as a reusable preset AND select it. */
  onSave: () => void;
  onCancel: () => void;
}

/**
 * Inline trailing slot swapped in while a row is entering a custom value.
 * Styling mirrors the existing img-brand / img-text / img-negative inputs
 * (border-border, bg-surface-input, brand focus ring).
 */
export function CustomChipEditor({ draft, onDraftChange, onConfirm, onSave, onCancel }: CustomChipEditorProps) {
  return (
    <div className="flex items-center gap-1">
      <input
        type="text"
        value={draft}
        onChange={(e) => onDraftChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onConfirm();
          } else if (e.key === 'Escape') {
            onCancel();
          }
        }}
        placeholder="Type a custom value…"
        autoFocus
        className="w-40 px-2 py-1.5 text-xs rounded-lg border border-border bg-surface-input text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all"
      />
      <button
        type="button"
        onClick={onSave}
        title="Save for later"
        aria-label="Save this custom value for later"
        className="flex items-center justify-center w-6 h-6 shrink-0 rounded-md border border-border text-text-muted hover:text-brand hover:border-brand/40 transition-colors"
      >
        <BookmarkPlus className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={onConfirm}
        title="Use custom value"
        aria-label="Use this custom value"
        className="flex items-center justify-center w-6 h-6 shrink-0 rounded-md bg-brand text-white hover:bg-brand-hover transition-colors"
      >
        <Check className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={onCancel}
        title="Cancel"
        aria-label="Cancel custom value"
        className="flex items-center justify-center w-6 h-6 shrink-0 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
