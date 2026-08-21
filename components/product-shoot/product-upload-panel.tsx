'use client';

import React, { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, ImageIcon } from 'lucide-react';
import type { ProductImage } from '@/lib/product-shoot/types';

const MAX_IMAGES = 3;
const MAX_SIZE_MB = 15;

interface ProductUploadPanelProps {
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
}

/**
 * Client-side canvas image downscaling to max 1200px and 0.85 JPEG quality.
 * Shrinks 10MB phone camera shots to ~120KB, preventing HTTP 413 Payload Too Large.
 */
function compressImageToDataUrl(dataUrl: string, maxDimension = 1200, quality = 0.85): Promise<string> {
  return new Promise((resolve) => {
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
      resolve(canvas.toDataURL('image/jpeg', quality));
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
    (files: FileList | null) => {
      if (!files) return;
      const remaining = MAX_IMAGES - images.length;
      if (remaining <= 0) return;

      const newImages: ProductImage[] = [];
      const toProcess = Array.from(files).slice(0, remaining);

      let processed = 0;
      for (const file of toProcess) {
        if (file.size > MAX_SIZE_MB * 1024 * 1024) continue;
        if (!file.type.startsWith('image/')) continue;

        const reader = new FileReader();
        reader.onload = () => {
          const rawDataUrl = reader.result as string;
          compressImageToDataUrl(rawDataUrl).then((compressedDataUrl) => {
            newImages.push({
              id: `ps-img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              dataUrl: compressedDataUrl,
              name: file.name,
              size: Math.round(compressedDataUrl.length * 0.75),
            });
            processed++;
            if (processed === toProcess.length) {
              onImagesChange([...images, ...newImages]);
            }
          });
        };
        reader.readAsDataURL(file);
      }
    },
    [images, onImagesChange]
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
      onImagesChange(images.filter((img) => img.id !== id));
    },
    [images, onImagesChange]
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
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => images.length < MAX_IMAGES && inputRef.current?.click()}
        className={`
          relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer
          flex flex-col items-center justify-center gap-1.5 p-4 sm:p-5 min-h-[110px] sm:min-h-[125px]
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
                transition={{ duration: 0.18 }}
                className="relative group rounded-xl overflow-hidden border border-border bg-surface-muted/30 aspect-square w-full"
              >
                <img
                  src={img.dataUrl}
                  alt={img.name}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(img.id);
                  }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-overlay/90 text-white
                    flex items-center justify-center transition-opacity shadow-md
                    opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                  aria-label={`Remove ${img.name}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-overlay/70 px-1.5 py-0.5">
                  <p className="text-[9px] text-white truncate font-mono text-center">
                    {img.name}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {images.length === 0 && (
        <p className="text-[11px] text-danger" role="alert">
          At least one product image is required to generate a shot package.
        </p>
      )}
    </div>
  );
}
