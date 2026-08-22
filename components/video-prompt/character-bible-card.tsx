'use client';

import React, { useState } from 'react';
import { Check, Edit3, RefreshCw, Trash2, Users, X } from 'lucide-react';
import type { VideoCharacter } from '@/types/video';
import { cn } from '@/lib/utils';
import { CharacterReferencePanel } from './character-reference-panel';

interface CharacterBibleCardProps {
  character: VideoCharacter;
  projectId: string;
  busy: boolean;
  onChange: (patch: Partial<VideoCharacter>) => void;
  onRemove: () => void;
  onRegenerateImagePrompt: (character: VideoCharacter) => Promise<string>;
  onRegenerateCharacter: (character: VideoCharacter) => Promise<VideoCharacter | null>;
}

/**
 * Character card with read/edit toggle. Default view renders the character
 * as readable prose (like a character bible entry); Edit mode swaps to
 * the form-based editor for precise changes.
 */
export function CharacterBibleCard({
  character,
  projectId,
  busy,
  onChange,
  onRemove,
  onRegenerateImagePrompt,
  onRegenerateCharacter,
}: CharacterBibleCardProps) {
  const [editing, setEditing] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const handleRegenerateCharacter = async () => {
    if (busy || regenerating) return;
    setRegenerating(true);
    try {
      const next = await onRegenerateCharacter(character);
      if (next) onChange(next);
    } finally {
      setRegenerating(false);
    }
  };

  const header = (
    <div className="flex items-center justify-between gap-2">
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-brand/10 text-brand border border-brand/25">
        <Users className="w-3 h-3" aria-hidden="true" />
        Cast
      </span>
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => setEditing(!editing)}
          disabled={busy}
          aria-label={editing ? 'Switch to read view' : `Edit ${character.name || 'character'}`}
          className={cn(
            'p-1.5 rounded-lg text-text-muted hover:text-brand hover:bg-brand/10 transition-colors',
            busy && 'opacity-40 cursor-not-allowed'
          )}
        >
          {editing ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />}
        </button>
        <button
          type="button"
          onClick={() => void handleRegenerateCharacter()}
          disabled={busy || regenerating}
          aria-label={`Regenerate ${character.name || 'character'}`}
          title="Regenerate this character only — cast order and other characters stay untouched"
          className={cn(
            'p-1.5 rounded-lg text-text-muted hover:text-brand hover:bg-brand/10 transition-colors',
            (busy || regenerating) && 'opacity-40 cursor-not-allowed'
          )}
        >
          <RefreshCw className={cn('w-3.5 h-3.5', regenerating && 'animate-spin')} aria-hidden="true" />
        </button>
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
    </div>
  );

  // ── Edit mode: form-based editor ──
  if (editing) {
    return (
      <div className="relative rounded-2xl border border-brand/30 bg-brand/5 p-4 flex flex-col gap-2.5">
        {header}
        <FormField label="Name" value={character.name} placeholder="Character name" onChange={(v) => onChange({ name: v })} id={`char-${character.id}-name`} />
        <FormField label="Role" value={character.role} placeholder="Role in the story" onChange={(v) => onChange({ role: v })} id={`char-${character.id}-role`} />
        <FormTextarea label="Fixed appearance" value={character.appearance} placeholder="Age, build, face, hair, marks" onChange={(v) => onChange({ appearance: v })} id={`char-${character.id}-appearance`} rows={2} />
        <FormTextarea label="Wardrobe" value={character.wardrobe} placeholder="Clothing, colors, accessories" onChange={(v) => onChange({ wardrobe: v })} id={`char-${character.id}-wardrobe`} rows={2} />
        <FormField label="Voice tone" value={character.voiceTone} placeholder="Vocal notes for continuity" onChange={(v) => onChange({ voiceTone: v })} id={`char-${character.id}-voice`} />

        <CharacterReferencePanel
          character={character}
          projectId={projectId}
          busy={busy}
          onEditPrompt={(text) => onChange({ imagePrompt: text })}
          onEditVoice={(voice) => onChange({ voice })}
          onRegeneratePrompt={async () => {
            const next = await onRegenerateImagePrompt(character);
            if (next) onChange({ imagePrompt: next });
          }}
          onAnalysisComplete={(analysis) => {
            onChange({
              appearance: analysis.appearance,
              wardrobe: analysis.apparentWardrobe,
            });
          }}
        />
      </div>
    );
  }

  // ── Read mode: prose bible card ──
  return (
    <div className="relative rounded-2xl border border-border bg-surface-card/60 p-4 flex flex-col gap-2.5">
      {header}

      <div className="min-w-0">
        {/* Character name as heading */}
        <h3 className="text-base font-bold text-text-primary leading-snug">
          {character.name || 'Unnamed character'}
          {character.role && (
            <span className="text-sm font-normal text-text-muted ml-1.5">
              — {character.role}
            </span>
          )}
        </h3>

        {/* Appearance as prose paragraph */}
        {character.appearance && (
          <p className="mt-2 text-xs text-text-secondary leading-relaxed">
            {character.appearance}
          </p>
        )}

        {/* Wardrobe */}
        {character.wardrobe && (
          <p className="mt-1.5 text-xs text-text-secondary leading-relaxed">
            <span className="font-semibold text-text-primary">Wearing:</span>{' '}
            {character.wardrobe}
          </p>
        )}

        {/* Voice tone */}
        {character.voiceTone && (
          <p className="mt-1.5 text-xs text-text-secondary leading-relaxed italic">
            <span className="font-semibold text-text-primary not-italic">Voice:</span>{' '}
            {character.voiceTone}
          </p>
        )}
      </div>

      {/* Reference panel — always visible in read mode */}
      <CharacterReferencePanel
        character={character}
        projectId={projectId}
        busy={busy}
        onEditPrompt={(text) => onChange({ imagePrompt: text })}
        onEditVoice={(voice) => onChange({ voice })}
        onRegeneratePrompt={async () => {
          const next = await onRegenerateImagePrompt(character);
          if (next) onChange({ imagePrompt: next });
        }}
        onAnalysisComplete={(analysis) => {
          onChange({
            appearance: analysis.appearance,
            wardrobe: analysis.apparentWardrobe,
          });
        }}
      />
    </div>
  );
}

// ── Small form helpers ──

function FormField({
  label,
  value,
  placeholder,
  onChange,
  id,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  id: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[9px] font-bold uppercase tracking-wider text-text-muted">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full px-2.5 py-1.5 rounded-lg text-xs bg-surface-input border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/70 transition-shadow"
      />
    </div>
  );
}

function FormTextarea({
  label,
  value,
  placeholder,
  onChange,
  id,
  rows = 2,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  id: string;
  rows?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[9px] font-bold uppercase tracking-wider text-text-muted">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="mt-1 w-full px-2.5 py-1.5 rounded-lg text-xs bg-surface-input border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/70 transition-shadow resize-y scrollbar-thin"
      />
    </div>
  );
}
