'use client';

import React, { useState } from 'react';
import type { VideoCharacter } from '@/types/video';

interface CharacterFormProps {
  initial?: VideoCharacter | null;
  onSubmit: (character: VideoCharacter) => void;
  onCancel: () => void;
}

const FIELDS: { key: keyof VideoCharacter; label: string; placeholder: string; lines?: number }[] = [
  { key: 'name', label: 'Name', placeholder: 'Character name' },
  { key: 'role', label: 'Role', placeholder: 'Role in the story' },
  { key: 'appearance', label: 'Fixed appearance', placeholder: 'Age, build, face, hair, marks', lines: 2 },
  { key: 'wardrobe', label: 'Wardrobe', placeholder: 'Clothing, colors, accessories', lines: 2 },
  { key: 'voiceTone', label: 'Voice tone', placeholder: 'Vocal notes for continuity' },
];

/** Compact cast sheet for the sidebar — add or edit one character. */
export function CharacterForm({ initial, onSubmit, onCancel }: CharacterFormProps) {
  const [draft, setDraft] = useState<VideoCharacter>(
    initial ?? {
      id: `char-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      name: '',
      role: '',
      appearance: '',
      wardrobe: '',
      voiceTone: '',
    }
  );

  const patch = (key: keyof VideoCharacter, value: string) => setDraft((prev) => ({ ...prev, [key]: value }));
  const canSave = draft.name.trim().length > 0;

  return (
    <div className="space-y-2.5">
      {FIELDS.map((field) => (
        <div key={field.key}>
          <label
            htmlFor={`char-form-${field.key}`}
            className="block text-[9px] font-bold uppercase tracking-wider text-text-muted"
          >
            {field.label}
          </label>
          {field.lines ? (
            <textarea
              id={`char-form-${field.key}`}
              value={draft[field.key]}
              onChange={(e) => patch(field.key, e.target.value)}
              rows={field.lines}
              placeholder={field.placeholder}
              className="mt-1 w-full px-2.5 py-1.5 rounded-lg text-xs bg-surface-input border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/70 transition-shadow resize-y scrollbar-thin"
            />
          ) : (
            <input
              id={`char-form-${field.key}`}
              type="text"
              value={draft[field.key]}
              onChange={(e) => patch(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="mt-1 w-full px-2.5 py-1.5 rounded-lg text-xs bg-surface-input border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/70 transition-shadow"
            />
          )}
        </div>
      ))}

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-text-secondary hover:bg-surface-hover transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => canSave && onSubmit(draft)}
          disabled={!canSave}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-brand hover:bg-brand-hover shadow-glow active:scale-[0.985] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save character
        </button>
      </div>
    </div>
  );
}
