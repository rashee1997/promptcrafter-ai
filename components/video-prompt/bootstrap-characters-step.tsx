'use client';

import React from 'react';
import { Check, Plus, Trash2, Users } from 'lucide-react';
import type { VideoCharacter } from '@/types/video';
import { cn } from '@/lib/utils';

interface BootstrapCharactersStepProps {
  data: VideoCharacter[];
  busy: boolean;
  onChange: (next: VideoCharacter[]) => void;
  onConfirm: () => void;
}

const FIELDS: { key: keyof VideoCharacter; label: string; placeholder: string; lines?: number }[] = [
  { key: 'name', label: 'Name', placeholder: 'Character name' },
  { key: 'role', label: 'Role', placeholder: 'Role in the story' },
  { key: 'appearance', label: 'Fixed appearance', placeholder: 'Age, build, face, hair, marks', lines: 2 },
  { key: 'wardrobe', label: 'Wardrobe', placeholder: 'Clothing, colors, accessories', lines: 2 },
  { key: 'voiceTone', label: 'Voice tone', placeholder: 'Vocal notes for continuity' },
];

function CharacterCard({
  character,
  onChange,
  onRemove,
}: {
  character: VideoCharacter;
  onChange: (patch: Partial<VideoCharacter>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="relative rounded-2xl border border-border bg-surface-card/60 p-4 flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-brand/10 text-brand border border-brand/25">
          <Users className="w-3 h-3" aria-hidden="true" />
          Cast
        </span>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${character.name || 'character'}`}
          title="Remove character"
          className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
      {FIELDS.map((field) => (
        <div key={field.key}>
          <label
            htmlFor={`char-${character.id}-${field.key}`}
            className="block text-[9px] font-bold uppercase tracking-wider text-text-muted"
          >
            {field.label}
          </label>
          {field.lines ? (
            <textarea
              id={`char-${character.id}-${field.key}`}
              value={character[field.key]}
              onChange={(e) => onChange({ [field.key]: e.target.value })}
              rows={field.lines}
              placeholder={field.placeholder}
              className="mt-1 w-full px-2.5 py-1.5 rounded-lg text-xs bg-surface-input border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/70 transition-shadow resize-y scrollbar-thin"
            />
          ) : (
            <input
              id={`char-${character.id}-${field.key}`}
              type="text"
              value={character[field.key]}
              onChange={(e) => onChange({ [field.key]: e.target.value })}
              placeholder={field.placeholder}
              className="mt-1 w-full px-2.5 py-1.5 rounded-lg text-xs bg-surface-input border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/70 transition-shadow"
            />
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Stage 2 review — the proposed cast as an editable grid. Every character
 * sheet is inline-editable (fixed appearance, wardrobe, voice notes) so the
 * director can lock continuity before confirming.
 */
export function BootstrapCharactersStep({
  data,
  busy,
  onChange,
  onConfirm,
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
      <div className="grid sm:grid-cols-2 gap-3">
        {data.map((c) => (
          <CharacterCard
            key={c.id}
            character={c}
            onChange={(patch) => updateCharacter(c.id, patch)}
            onRemove={() => removeCharacter(c.id)}
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
            'inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl text-white',
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
