'use client';

import React, { useRef, useState } from 'react';
import { Check, Copy, ImagePlus, RefreshCw, Star, Trash2 } from 'lucide-react';
import type { VideoCharacter } from '@/types/video';
import { compressToWebP } from '@/lib/compression';
import { useStoryBible } from '@/lib/video/story-bible-context';
import { useInlineCopy } from '@/lib/use-inline-copy';
import { toast } from '@/components/toast';
import { cn } from '@/lib/utils';
import { CharacterImageThumb } from './character-image-thumb';

interface CharacterReferencePanelProps {
  character: VideoCharacter;
  /** Active project id — Story Bible images save under it. */
  projectId: string;
  /** Parent (stage/busy) flag — disables the AI regenerate + upload. */
  busy?: boolean;
  /** Re-rolls just this character's imagePrompt text via AI. */
  onRegeneratePrompt: () => Promise<void>;
  /** Persists a manually-edited imagePrompt on the character. */
  onEditPrompt: (text: string) => void;
}

/**
 * Shared character reference panel (D2) — the image-prompt block, upload
 * dropzone, and saved-image gallery that used to live only inside Stage 2's
 * CharacterCard. Rendered in both the bootstrap wizard and the post-activation
 * sidebar modal, so characters added mid-production get the same reference
 * loop as the original cast. Adds the missing pieces: an editable imagePrompt
 * (no more read-only), a "Regenerate prompt" AI loop, and an explicit
 * "Set as primary" control per saved candidate.
 */
export function CharacterReferencePanel({
  character,
  projectId,
  busy = false,
  onRegeneratePrompt,
  onEditPrompt,
}: CharacterReferencePanelProps) {
  const { entries, saveCharacterImage, deleteCharacterImage, setPrimaryCharacterImage } = useStoryBible();
  const { copiedKey, copy } = useInlineCopy(1400);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const saved = entries
    .filter((e) => e.characterId === character.id)
    .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
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

  const handleRegenerate = async () => {
    if (busy || regenerating) return;
    setRegenerating(true);
    try {
      await onRegeneratePrompt();
    } catch (err) {
      toast.error('Regenerate failed', err instanceof Error ? err.message : 'Could not regenerate the prompt.');
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="space-y-2.5">
      {/* Image prompt — editable + AI regenerate loop */}
      <div className="rounded-xl border border-border bg-surface-code p-2.5 space-y-1.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <label
            htmlFor={`char-ref-${character.id}-image-prompt`}
            className="text-[9px] font-bold uppercase tracking-wider text-text-muted"
          >
            Image prompt (external model)
          </label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => void handleRegenerate()}
              disabled={busy || regenerating}
              title="Re-roll just this character's image prompt via AI"
              className={cn(
                'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border transition-colors',
                'bg-surface-muted text-text-secondary border-border hover:border-brand/40 hover:text-brand',
                (busy || regenerating) && 'opacity-40 cursor-not-allowed'
              )}
            >
              <RefreshCw className={cn('w-3 h-3', regenerating && 'animate-spin')} aria-hidden="true" />
              {regenerating ? 'Regenerating…' : 'Regenerate prompt'}
            </button>
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
        </div>
        <textarea
          id={`char-ref-${character.id}-image-prompt`}
          value={character.imagePrompt ?? ''}
          onChange={(e) => onEditPrompt(e.target.value)}
          rows={3}
          placeholder="No image prompt yet — hit Regenerate prompt to draft a 360° character sheet prompt for Midjourney / Imagen."
          className="w-full px-2.5 py-1.5 rounded-lg text-[10px] leading-relaxed font-mono bg-surface-input border border-border text-text-secondary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/70 transition-shadow resize-y scrollbar-thin"
        />
        <p className="text-[9px] text-text-muted leading-relaxed">
          Generate this character in your preferred image model, then upload the result below to lock it into the Story
          Bible.
        </p>
      </div>

      {/* Upload dropzone */}
      <div>
        <label
          htmlFor={`char-ref-${character.id}-upload`}
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
            (uploading || busy) && 'opacity-60 pointer-events-none'
          )}
        >
          <input
            ref={fileInputRef}
            id={`char-ref-${character.id}-upload`}
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

      {/* Saved candidates — each gets delete + explicit Set-as-primary */}
      {saved.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {saved.map((entry) => (
            <span key={entry.id} className="group relative inline-block">
              <CharacterImageThumb
                entry={entry}
                className={cn(
                  'h-12 w-12 border transition-colors',
                  entry.isPrimary ? 'border-brand ring-1 ring-brand/40' : 'border-border'
                )}
              />
              {entry.isPrimary && (
                <span className="absolute -top-1.5 -left-1.5 rounded-full bg-brand text-white p-0.5 shadow-glow" title="Primary reference">
                  <Star className="w-2.5 h-2.5 fill-current" aria-hidden="true" />
                </span>
              )}
              <span className="absolute inset-x-0 -bottom-1.5 flex justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => void setPrimaryCharacterImage(entry.id)}
                  disabled={entry.isPrimary}
                  aria-label={`Set as primary reference for ${entry.characterName}`}
                  title={entry.isPrimary ? 'Primary reference' : 'Set as primary'}
                  className="rounded-md bg-surface-elevated border border-border p-0.5 text-text-muted hover:text-brand disabled:opacity-40 transition-colors"
                >
                  <Star className={cn('w-3 h-3', entry.isPrimary && 'fill-brand text-brand')} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => void deleteCharacterImage(entry.id).then(() => toast.info('Image removed', entry.characterName))}
                  aria-label={`Delete saved image for ${entry.characterName}`}
                  title="Delete saved image"
                  className="rounded-md bg-surface-elevated border border-border p-0.5 text-text-muted hover:text-danger transition-colors"
                >
                  <Trash2 className="w-3 h-3" aria-hidden="true" />
                </button>
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
