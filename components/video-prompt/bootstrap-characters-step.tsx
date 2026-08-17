'use client';

import React, { useRef, useState } from 'react';
import { Check, Copy, ImagePlus, Plus, Trash2, Users } from 'lucide-react';
import type { VideoCharacter } from '@/types/video';
import { compressToWebP } from '@/lib/compression';
import { useStoryBible } from '@/lib/video/story-bible';
import { useInlineCopy } from '@/lib/use-inline-copy';
import { toast } from '@/components/toast';
import { cn } from '@/lib/utils';
import { CharacterImageThumb } from './character-image-thumb';

interface BootstrapCharactersStepProps {
  data: VideoCharacter[];
  busy: boolean;
  /** Active project id — Story Bible images save under it. */
  projectId: string;
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
  projectId,
  onChange,
  onRemove,
}: {
  character: VideoCharacter;
  projectId: string;
  onChange: (patch: Partial<VideoCharacter>) => void;
  onRemove: () => void;
}) {
  const { entries, saveCharacterImage, deleteCharacterImage } = useStoryBible();
  const { copiedKey, copy } = useInlineCopy(1400);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const saved = entries.filter((e) => e.characterId === character.id);
  const copied = copiedKey === `char-${character.id}-prompt`;

  /** Compresses the uploaded image to WebP and saves it to the Story Bible store. */
  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Image required', `${file.name} is not an image.`);
      return;
    }
    setUploading(true);
    try {
      const blob = await compressToWebP(file, 1024, 0.8);
      const savedEntry = await saveCharacterImage({
        projectId,
        characterId: character.id,
        characterName: character.name.trim() || 'Character',
        imagePrompt: character.imagePrompt?.trim() ?? '',
        imageBlob: blob,
      });
      if (savedEntry) {
        toast.success('Character image saved', `${savedEntry.characterName}'s reference is now in the Story Bible.`);
      } else {
        toast.error('Save failed', 'The image could not be stored locally.');
      }
    } catch (err) {
      toast.error('Upload failed', err instanceof Error ? err.message : 'Could not process this image.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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

      {/* Phase 2 — copy-ready image prompt for external image models */}
      <div className="rounded-xl border border-border bg-surface-code p-2.5 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor={`char-${character.id}-image-prompt`}
            className="text-[9px] font-bold uppercase tracking-wider text-text-muted"
          >
            Image prompt (external model)
          </label>
          <button
            type="button"
            onClick={() => character.imagePrompt && void copy(character.imagePrompt, `char-${character.id}-prompt`)}
            disabled={!character.imagePrompt}
            aria-label={`Copy ${character.name || 'character'} image prompt`}
            className={cn(
              'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold text-white transition-all',
              'bg-brand hover:bg-brand-hover shadow-glow active:scale-[0.985]',
              copied && 'from-success to-success bg-none',
              !character.imagePrompt && 'opacity-40 cursor-not-allowed shadow-none'
            )}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" aria-hidden="true" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" aria-hidden="true" /> Copy prompt
              </>
            )}
          </button>
        </div>
        <textarea
          id={`char-${character.id}-image-prompt`}
          readOnly
          value={character.imagePrompt ?? ''}
          rows={3}
          placeholder="No image prompt yet — re-run this stage to draft a 360° character sheet prompt for Midjourney / Imagen."
          className="w-full px-2.5 py-1.5 rounded-lg text-[10px] leading-relaxed font-mono bg-surface-input border border-border text-text-secondary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/70 transition-shadow resize-y scrollbar-thin"
        />
        <p className="text-[9px] text-text-muted leading-relaxed">
          Generate this character in your preferred image model, then upload the result below to lock it into the Story
          Bible.
        </p>
      </div>

      {/* Phase 4 — upload the generated character image (compressed locally) */}
      <div>
        <label
          htmlFor={`char-${character.id}-upload`}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const file = e.dataTransfer.files?.[0];
            if (file) void handleUpload(file);
          }}
          className={cn(
            'flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-surface-muted/40 px-3 py-2.5 text-center cursor-pointer transition-colors',
            'hover:border-brand/50 hover:bg-brand/5',
            uploading && 'opacity-60 pointer-events-none'
          )}
        >
          <input
            ref={fileInputRef}
            id={`char-${character.id}-upload`}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleUpload(file);
            }}
          />
          <ImagePlus className="w-4 h-4 text-accent" aria-hidden="true" />
          <span className="text-[10px] font-semibold text-text-secondary">
            {uploading ? 'Compressing & saving…' : 'Upload Generated Character Image'}
          </span>
          <span className="text-[9px] text-text-muted">PNG / JPG / WebP — auto-compressed to WebP</span>
        </label>
      </div>

      {/* Saved Story Bible images for this character */}
      {saved.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {saved.map((entry) => (
            <span key={entry.id} className="group relative inline-block">
              <CharacterImageThumb entry={entry} className="h-12 w-12 border border-border" />
              <button
                type="button"
                onClick={() => void deleteCharacterImage(entry.id).then(() => toast.info('Image removed', entry.characterName))}
                aria-label={`Delete saved image for ${entry.characterName}`}
                title="Delete saved image"
                className="absolute -top-1.5 -right-1.5 rounded-md bg-surface-elevated border border-border p-0.5 text-text-muted opacity-0 group-hover:opacity-100 hover:text-danger transition-opacity"
              >
                <Trash2 className="w-3 h-3" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
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
            projectId={projectId}
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
