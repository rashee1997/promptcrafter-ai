'use client';

import React, { useCallback, useRef, useState } from 'react';
import { ImagePlus, X, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImagePromptReferenceImage } from '@/types';

const MAX_IMAGES = 3;

const PURPOSE_OPTIONS: { value: ImagePromptReferenceImage['purpose']; label: string; color: string }[] = [
  { value: 'subject', label: 'Subject / Product', color: 'bg-brand/15 border-brand text-brand' },
  { value: 'style', label: 'Style reference', color: 'bg-[#8ab4f8]/15 border-[#8ab4f8] text-[#8ab4f8]' },
  { value: 'brand-consistency', label: 'Brand / Character consistency', color: 'bg-warning/15 border-warning text-warning' },
  { value: 'redesign-reference', label: 'Current logo to evolve', color: 'bg-[#c084fc]/15 border-[#c084fc] text-[#c084fc]' },
];

interface ReferenceImageUploadProps {
  images: ImagePromptReferenceImage[];
  onAdd: (img: ImagePromptReferenceImage) => void;
  onRemove: (id: string) => void;
  onUpdatePurpose: (id: string, purpose: ImagePromptReferenceImage['purpose']) => void;
  onReverseEngineer?: (img: ImagePromptReferenceImage) => void;
  isReverseEngineering?: boolean;
  reverseEngineeringId?: string | null;
  /** Condensed layout — smaller thumbnails + single-row purpose chips, for inline chat-card use. Default false preserves the original rendering. */
  compact?: boolean;
}

export function ReferenceImageUpload({
  images,
  onAdd,
  onRemove,
  onUpdatePurpose,
  onReverseEngineer,
  isReverseEngineering,
  reverseEngineeringId,
  compact = false,
}: ReferenceImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const atCapacity = images.length >= MAX_IMAGES;

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      if (images.length >= MAX_IMAGES) return;

      // Cap individual images at 5 MB to avoid localStorage blowups
      if (file.size > 5 * 1024 * 1024) return;

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        onAdd({
          id: crypto.randomUUID(),
          dataUrl,
          purpose: 'subject',
        });
      };
      reader.readAsDataURL(file);
    },
    [images.length, onAdd]
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const remaining = MAX_IMAGES - images.length;
      const toProcess = Array.from(files).slice(0, remaining);
      toProcess.forEach(processFile);
    },
    [images.length, processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className={cn('space-y-2', compact && 'space-y-1.5')}>
      {/* Upload zone */}
      <button
        type="button"
        onClick={() => !atCapacity && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        disabled={atCapacity}
        className={cn(
          'w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed text-xs font-medium transition-all',
          compact ? 'p-2 text-[11px]' : 'p-3',
          atCapacity
            ? 'border-border/50 text-text-muted cursor-not-allowed opacity-50'
            : isDragging
              ? 'border-brand bg-brand/5 text-brand'
              : 'border-border text-text-muted hover:border-brand/40 hover:text-brand hover:bg-brand/5 cursor-pointer'
        )}
      >
        <ImagePlus className={cn(compact ? 'w-3.5 h-3.5' : 'w-4 h-4')} />
        {atCapacity
          ? `Max ${MAX_IMAGES} reference images`
          : images.length === 0
            ? 'Add reference images (drag or click)'
            : `Add another (${images.length}/${MAX_IMAGES})`}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          handleFiles(e.target.files);
          if (e.target) e.target.value = '';
        }}
        className="hidden"
        aria-label="Upload reference images"
      />

      {/* Uploaded images list */}
      {images.map((img) => (
        <div
          key={img.id}
          className={cn(
            'flex items-start rounded-lg bg-surface-muted/60 border border-border',
            compact ? 'gap-2 p-1.5' : 'gap-2.5 p-2'
          )}
        >
          {/* Thumbnail */}
          <div
            className={cn(
              'shrink-0 rounded-md overflow-hidden border border-border/60 bg-surface-card',
              compact ? 'w-8 h-8' : 'w-12 h-12'
            )}
          >
            <img
              src={img.dataUrl}
              alt="Reference"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0 space-y-1.5">
            {/* Purpose selector — single row (horizontal scroll) when compact */}
            <div className={cn(compact ? 'flex flex-nowrap gap-1 overflow-x-auto no-scrollbar' : 'flex flex-wrap gap-1')}>
              {PURPOSE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onUpdatePurpose(img.id, opt.value)}
                  className={cn(
                    'px-1.5 py-0.5 rounded text-[9px] font-semibold border transition-all',
                    compact && 'shrink-0 whitespace-nowrap',
                    img.purpose === opt.value
                      ? opt.color
                      : 'border-border text-text-muted hover:text-text-secondary'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {!compact && (
              <p className="text-[9px] text-text-muted leading-tight">
                {img.purpose === 'subject'
                  ? 'Gemini/Nano Banana will describe this subject from the image.'
                  : img.purpose === 'style'
                    ? 'Platform sections will reference the visual style of this image.'
                    : img.purpose === 'redesign-reference'
                      ? 'The AI will treat this as the current logo to evolve — describe what to keep and modernize.'
                      : 'Midjourney --cref / Ideogram Character Reference will use this.'}
              </p>
            )}
          </div>

            {/* Actions: Reverse engineer & Remove */}
            <div className="flex items-center gap-1.5 shrink-0">
              {onReverseEngineer && (
                <button
                  type="button"
                  disabled={isReverseEngineering}
                  onClick={() => onReverseEngineer(img)}
                  className={cn(
                    'rounded text-[9px] font-semibold bg-brand/10 border border-brand/25 text-brand hover:bg-brand/20 transition-all disabled:opacity-50 flex items-center gap-1',
                    compact ? 'px-1.5 py-0.5' : 'px-2 py-0.5'
                  )}
                  title="Reverse engineer this image into a full prompt brief"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {!compact && (isReverseEngineering && reverseEngineeringId === img.id ? 'Analyzing…' : 'Image-to-Prompt')}
                </button>
              )}
              <button
                type="button"
                onClick={() => onRemove(img.id)}
                className="shrink-0 p-1 rounded text-text-muted hover:text-danger transition-colors"
                title="Remove reference image"
                aria-label="Remove reference image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

      {!compact && images.length > 0 && images.length < MAX_IMAGES && (
        <p className="text-[9px] text-text-muted leading-relaxed">
          Each image gets a purpose tag that changes how platform sections reference it. Too many references dilute the brief.
        </p>
      )}
      {!compact && images.length >= MAX_IMAGES && (
        <p className="text-[9px] text-warning/80 leading-relaxed">
          {MAX_IMAGES} images — the maximum for a focused brief. Remove one to add another.
        </p>
      )}
    </div>
  );
}
