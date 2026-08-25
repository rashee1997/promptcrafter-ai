'use client';

import React, { useState } from 'react';
import { Check, Plus, RefreshCw, Trash2, Users } from 'lucide-react';
import type { VideoCharacter } from '@/types/video';
import { cn } from '@/lib/utils';
import { CharacterBibleCard } from './character-bible-card';

interface BootstrapCharactersStepProps {
  data: VideoCharacter[];
  busy: boolean;
  /** Active project id — Story Bible images save under it. */
  projectId: string;
  onChange: (next: VideoCharacter[]) => void;
  onConfirm: () => void;
  /** D2 — regenerate one character's imagePrompt text via AI. */
  onRegenerateImagePrompt: (character: VideoCharacter) => Promise<string>;
  /** D3 — re-draft just this character (keeps its id + saved images). */
  onRegenerateCharacter: (character: VideoCharacter) => Promise<VideoCharacter | null>;
}



/**
 * Stage 2 review — the proposed cast as an editable grid. Every character
 * sheet is inline-editable (fixed appearance, wardrobe, voice notes) so the
 * director can lock continuity before confirming. Each card also carries a
 * copy-ready image prompt for external image models and an upload zone that
 * compresses + persists the generated character image into the Story Bible.
 */
export function BootstrapCharactersStep({
  data,
  busy,
  projectId,
  onChange,
  onConfirm,
  onRegenerateImagePrompt,
  onRegenerateCharacter,
}: BootstrapCharactersStepProps) {
  const updateCharacter = (id: string, patch: Partial<VideoCharacter>) => {
    onChange(data.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const removeCharacter = (id: string) => {
    onChange(data.filter((c) => c.id !== id));
  };

  const addCharacter = () => {
    onChange([
      ...data,
      {
        id: `char-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        name: '',
        role: '',
        appearance: '',
        wardrobe: '',
        voiceTone: '',
      },
    ]);
  };

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">          {data.map((c) => (
            <CharacterBibleCard
              key={c.id}
              character={c}
              projectId={projectId}
              busy={busy}
              onChange={(patch) => updateCharacter(c.id, patch)}
              onRemove={() => removeCharacter(c.id)}
              onRegenerateImagePrompt={onRegenerateImagePrompt}
              onRegenerateCharacter={onRegenerateCharacter}
            />
          ))}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <button
          type="button"
          onClick={addCharacter}
          disabled={busy}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors self-start',
            'bg-surface-muted text-text-secondary border-border hover:border-brand/40 hover:text-brand',
            busy && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          Add character
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy || data.length === 0}
          className={cn(
            'inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl text-[var(--brand-foreground)]',
            'bg-brand hover:bg-brand-hover shadow-glow active:scale-[0.985] transition-all self-end',
            (busy || data.length === 0) && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Check className="w-4 h-4" aria-hidden="true" />
          Confirm cast
        </button>
      </div>
    </div>
  );
}
