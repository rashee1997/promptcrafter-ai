'use client';

import React, { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, ImageIcon } from 'lucide-react';
import type { ProductImage } from '@/lib/product-shoot/types';

const MAX_IMAGES = 3;
const MAX_SIZE_MB = 15;

interface ProductUploadPanelProps {
  images: ProductImage[];
  onImagesChange: (updater: (prev: ProductImage[]) => ProductImage[]) => void;
}

/**
 * Client-side canvas image downscaling to max 1200px and 0.85 JPEG quality.
 * Shrinks 10MB phone camera shots to ~120KB, preventing HTTP 413 Payload Too Large.
 */
function compressImageToDataUrl(dataUrl: string, maxDimension = 1200, quality = 0.85): Promise<string> {
  return new Promise((resolve) => {
    const isPng = dataUrl.startsWith('data:image/png');
    const isWebp = dataUrl.startsWith('data:image/webp');
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      if (isPng || isWebp) {
        resolve(canvas.toDataURL('image/webp', quality) || canvas.toDataURL('image/png'));
      } else {
        resolve(canvas.toDataURL('image/jpeg', quality));
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export function ProductUploadPanel({
  images,
  onImagesChange,
}: ProductUploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      const toProcess = Array.from(files).slice(0, MAX_IMAGES);

      const tasks = toProcess
        .filter((file) => file.size <= MAX_SIZE_MB * 1024 * 1024 && file.type.startsWith('image/'))
        .map(async (file) => {
          const reader = new FileReader();
          const dataUrl = await new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          const compressedDataUrl = await compressImageToDataUrl(dataUrl);
          return {
            id: `ps-img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            dataUrl: compressedDataUrl,
            name: file.name,
            size: Math.round(compressedDataUrl.length * 0.75),
          };
        });

      const resolved = await Promise.all(tasks);
      onImagesChange((prev) => [...prev, ...resolved].slice(0, MAX_IMAGES));
    },
    [onImagesChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleRemove = useCallback(
    (id: string) => {
      onImagesChange((prev) => prev.filter((img) => img.id !== id));
    },
    [onImagesChange]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold tracking-wider uppercase text-text-secondary">
          Product Image{' '}
          <span className="text-danger">*</span>
        </label>
        <span className="text-[11px] text-text-muted font-mono">
          {images.length}/{MAX_IMAGES}
        </span>
      </div>

      {/* Upload area */}
      <div
        role="button"
        tabIndex={images.length < MAX_IMAGES ? 0 : -1}
        aria-label="Upload product reference image"
        onKeyDown={(e) => {
          if (images.length < MAX_IMAGES && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => images.length < MAX_IMAGES && inputRef.current?.click()}
        className={`
          relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer
          flex flex-col items-center justify-center gap-1.5 p-4 sm:p-5 min-h-[110px] sm:min-h-[125px] focus:outline-none focus:ring-2 focus:ring-brand/40
          ${
            dragOver
              ? 'border-brand bg-brand/5'
              : images.length >= MAX_IMAGES
                ? 'border-border bg-surface-muted/30 cursor-not-allowed'
                : 'border-border hover:border-brand/40 hover:bg-surface-muted/20'
          }
        `}
      >
        <Upload
          className={`w-5 h-5 sm:w-6 sm:h-6 ${dragOver ? 'text-brand' : 'text-text-muted'}`}
        />
        <p className="text-xs sm:text-sm text-text-secondary text-center font-medium">
          {images.length >= MAX_IMAGES
            ? 'Maximum images reached'
            : 'Drop product images here or click to browse'}
        </p>
        <p className="text-[10px] sm:text-[11px] text-text-muted">
          Up to {MAX_IMAGES} images · {MAX_SIZE_MB}MB each · JPG, PNG, WebP
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {/* Image previews */}
      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-3 gap-2 sm:gap-3"
          >
            {images.map((img) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="relative group"
              >
                <div className="aspect-square rounded-lg overflow-hidden border border-border bg-surface-muted/50">
                  <img
                    src={img.dataUrl}
                    alt={img.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => handleRemove(img.id)}
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-danger/90 hover:bg-danger text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Remove ${img.name}`}
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="mt-1 text-[10px] text-text-muted truncate" title={img.name}>
                  {img.name}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
