'use client';

import React, { useRef, useState } from 'react';
import { Check, Copy, ImagePlus, Info, Mic, RefreshCw, Star, Trash2 } from 'lucide-react';
import type { VideoCharacter, CharacterImageAnalysis, CharacterVoice } from '@/types/video';
import { blobToDataUrl, compressToWebP } from '@/lib/compression';
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
  /** Persists a voice update on the character. */
  onEditVoice?: (voice: CharacterVoice | undefined) => void;
  /** Called when vision analysis completes — auto-fills appearance fields. */
  onAnalysisComplete?: (analysis: CharacterImageAnalysis) => void;
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
  onEditVoice,
  onAnalysisComplete,
}: CharacterReferencePanelProps) {
  const { entries, saveCharacterImage, deleteCharacterImage, setPrimaryCharacterImage } = useStoryBible();
  const { copiedKey, copy } = useInlineCopy(1400);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [voiceTab, setVoiceTab] = useState<'image' | 'voice'>('image');

  const saved = entries
    .filter((e) => e.characterId === character.id)
    .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
  const copied = copiedKey === `char-${character.id}-prompt`;

  /** Compresses the uploaded image to WebP, saves it, and runs vision analysis. */
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
        // Run vision analysis to auto-fill appearance fields (C4)
        setAnalyzing(true);
        try {
          const dataUrl = await blobToDataUrl(blob);
          const { analyzeCharacterImage } = await import('@/lib/video/bootstrap/analyze-character-image');
          const analysis = await analyzeCharacterImage(
            dataUrl,
            character.name.trim() || 'Character',
            character.appearance,
          );
          onAnalysisComplete?.(analysis);
          toast.success('Analysis complete', 'Reference image analyzed — appearance fields updated.');
        } catch (analysisErr) {
          // Non-fatal: upload succeeded, analysis is a bonus
          console.warn('Character image analysis failed:', analysisErr);
          toast.info(
            'Image saved without analysis',
            analysisErr instanceof Error ? analysisErr.message : 'Could not analyze the image automatically.',
          );
        } finally {
          setAnalyzing(false);
        }
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

  // Voice state helpers
  const voice = character.voice;
  const updateVoice = (patch: Partial<CharacterVoice>) => {
    if (!onEditVoice) return;
    const next: CharacterVoice = {
      id: voice?.id || `voice-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      provider: voice?.provider || 'platform-native',
      toneNotes: voice?.toneNotes || '',
      ...voice,
      ...patch,
    };
    onEditVoice(next);
  };
  const clearVoice = () => {
    onEditVoice?.(undefined);
  };

  return (
    <div className="space-y-2.5">
      {/* Tab bar — Image / Voice */}
      <div className="flex items-center rounded-lg border border-border bg-surface-muted/60 p-0.5" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={voiceTab === 'image'}
          onClick={() => setVoiceTab('image')}
          className={`flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-semibold transition-colors ${
            voiceTab === 'image'
              ? 'bg-surface-card text-brand border border-brand/25 shadow-sm'
              : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          <ImagePlus className="w-3 h-3" aria-hidden="true" />
          Image
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={voiceTab === 'voice'}
          onClick={() => setVoiceTab('voice')}
          className={`flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-semibold transition-colors ${
            voiceTab === 'voice'
              ? 'bg-surface-card text-brand border border-brand/25 shadow-sm'
              : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          <Mic className="w-3 h-3" aria-hidden="true" />
          Voice
          {voice && <span className="ml-0.5 w-1.5 h-1.5 rounded-full bg-brand inline-block" title="Voice configured" />}
        </button>
      </div>
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
            {uploading ? 'Compressing & saving…' : analyzing ? 'Analyzing reference…' : 'Upload Generated Character Image'}
          </span>
          <span className="text-[9px] text-text-muted">PNG / JPG / WebP — auto-compressed to WebP</span>
          {analyzing && (
            <span className="text-[9px] text-brand animate-pulse">AI analyzing appearance…</span>
          )}
        </label>
      </div>

      {/* ═══ VOICE TAB ═══ */}
      {voiceTab === 'voice' && (
        <div className="space-y-2.5">
          {/* Voice provider selector */}
          <div className="rounded-xl border border-border bg-surface-code p-2.5 space-y-2">
            <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted">
              Voice source
            </label>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => updateVoice({ provider: 'platform-native' })}
                className={`flex-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border transition-colors ${
                  (voice?.provider || 'platform-native') === 'platform-native'
                    ? 'bg-brand/10 text-brand border-brand/30'
                    : 'bg-surface-muted text-text-secondary border-border hover:border-brand/30'
                }`}
              >
                Platform native
              </button>
              <button
                type="button"
                onClick={() => updateVoice({ provider: 'elevenlabs' })}
                className={`flex-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border transition-colors ${
                  voice?.provider === 'elevenlabs'
                    ? 'bg-brand/10 text-brand border-brand/30'
                    : 'bg-surface-muted text-text-secondary border-border hover:border-brand/30'
                }`}
              >
                ElevenLabs
              </button>
            </div>
          </div>

          {/* Tone notes — always visible */}
          <div className="rounded-xl border border-border bg-surface-code p-2.5 space-y-1.5">
            <label
              htmlFor={`char-voice-${character.id}-tone-notes`}
              className="text-[9px] font-bold uppercase tracking-wider text-text-muted"
            >
              Tone notes
            </label>
            <textarea
              id={`char-voice-${character.id}-tone-notes`}
              value={voice?.toneNotes ?? character.voiceTone ?? ''}
              onChange={(e) => updateVoice({ toneNotes: e.target.value })}
              rows={2}
              placeholder="Rich delivery notes: gravelly baritone, measured pace, slight rasp on consonants"
              className="w-full px-2.5 py-1.5 rounded-lg text-[10px] leading-relaxed font-mono bg-surface-input border border-border text-text-secondary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/70 transition-shadow resize-y scrollbar-thin"
            />
            <p className="text-[9px] text-text-muted leading-relaxed">
              Describe the voice quality, pacing, accent, and emotional register — the voice pipeline uses these
              as delivery instructions when generating audio, and the drafting AI references them for
              character-distinguishable dialogue.
            </p>
          </div>

          {/* ElevenLabs voice id (only when provider is elevenlabs) */}
          {voice?.provider === 'elevenlabs' && (
            <div className="rounded-xl border border-border bg-surface-code p-2.5 space-y-1.5">
              <label
                htmlFor={`char-voice-${character.id}-voice-id`}
                className="text-[9px] font-bold uppercase tracking-wider text-text-muted"
              >
                Voice ID
              </label>
              <input
                id={`char-voice-${character.id}-voice-id`}
                type="text"
                value={voice?.voiceId ?? ''}
                onChange={(e) => updateVoice({ voiceId: e.target.value })}
                placeholder="ElevenLabs voice ID (e.g. pNInz6obpgDQGcFmaJgB)"
                className="w-full px-2.5 py-1.5 rounded-lg text-[10px] font-mono bg-surface-input border border-border text-text-secondary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/70 transition-shadow"
              />
              <p className="text-[9px] text-text-muted leading-relaxed">
                Paste the voice ID from your ElevenLabs voice library. Leave empty to use tone-notes-only mode.
              </p>
            </div>
          )}

          {/* Reference audio placeholder (upload-to-clone) */}
          <div className="rounded-xl border border-border bg-surface-code p-2.5 space-y-1.5">
            <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted">
              Reference audio (optional)
            </label>
            {voice?.referenceAudioId ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-text-secondary font-mono truncate">
                  Audio ref: {voice.referenceAudioId}
                </span>
                <button
                  type="button"
                  onClick={() => updateVoice({ referenceAudioId: undefined })}
                  className="text-[9px] text-danger hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-surface-muted/40 px-3 py-2.5 text-center">
                <Mic className="w-4 h-4 text-accent" aria-hidden="true" />
                <span className="text-[10px] text-text-muted">
                  Upload a voice sample to clone (audio file)
                </span>
                <span className="text-[9px] text-text-muted/60">
                  Optional — tone notes alone are enough for the pipeline
                </span>
              </div>
            )}
          </div>

          {/* Clear voice button */}
          {voice && (
            <button
              type="button"
              onClick={clearVoice}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border border-dashed border-danger/30 text-danger/70 hover:border-danger/50 hover:text-danger transition-colors"
            >
              <Trash2 className="w-3 h-3" aria-hidden="true" />
              Remove voice
            </button>
          )}

          {/* Voice guidance */}
          <div className="rounded-xl border border-brand/15 bg-brand/5 p-2.5 space-y-1">
            <div className="flex items-start gap-1.5">
              <Info className="w-3 h-3 text-brand mt-0.5 shrink-0" aria-hidden="true" />
              <div className="space-y-1">
                <p className="text-[9px] font-semibold text-brand">Voice & dialogue tips</p>
                <ul className="text-[9px] text-text-muted leading-relaxed space-y-0.5 list-disc list-inside">
                  <li>
                    <strong className="text-text-secondary">Platform-native</strong> relies on the target video model&apos;s built-in dialogue audio
                    (Veo 3.1, Kling 3.0, Seedance 2.5). No external voice service needed.
                  </li>
                  <li>
                    <strong className="text-text-secondary">ElevenLabs</strong> generates a separate voice track for non-native platforms
                    (Runway, Luma, Pika, Higgsfield). The pipeline prepares the audio spec; you sync it in post.
                  </li>
                  <li>
                    Rich <strong className="text-text-secondary">tone notes</strong> make two characters audibly distinguishable — describe
                    pitch, pace, accent, and emotional register, not just &quot;deep voice&quot;.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* C6 — Reference image guidance hints */}
      <div className="rounded-xl border border-brand/15 bg-brand/5 p-2.5 space-y-1">
        <div className="flex items-start gap-1.5">
          <Info className="w-3 h-3 text-brand mt-0.5 shrink-0" aria-hidden="true" />
          <div className="space-y-1">
            <p className="text-[9px] font-semibold text-brand">Reference image tips</p>
            <ul className="text-[9px] text-text-muted leading-relaxed space-y-0.5 list-disc list-inside">
              <li>
                A <strong className="text-text-secondary">clear, well-lit 1024×1024</strong> image often works
                better than a blurry 4K photo — focus on clarity and lighting over raw resolution.
              </li>
              <li>
                Add a <strong className="text-text-secondary">three-quarter angle</strong> variant (not just
                a front portrait) to reduce guesswork when the camera shows a new angle.
              </li>
            </ul>
          </div>
        </div>
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
