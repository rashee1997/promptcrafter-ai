'use client';

import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import type { StoryBibleCharacterImage } from '@/types/video';
import { cn } from '@/lib/utils';

interface CharacterImageThumbProps {
  entry: StoryBibleCharacterImage;
  className?: string;
}

/**
 * Renders one saved Story Bible character image. Blobs (IndexedDB path) become
 * object URLs for the component's lifetime; data URLs (LocalStorage fallback)
 * render directly. Falls back to a muted cast glyph when no image bytes exist.
 */
export function CharacterImageThumb({ entry, className }: CharacterImageThumbProps) {
  const [url, setUrl] = useState<string | null>(entry.imageDataUrl ?? null);

  useEffect(() => {
    if (entry.imageDataUrl) {
      setUrl(entry.imageDataUrl);
      return;
    }
    if (!entry.imageBlob) {
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(entry.imageBlob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [entry]);

  if (!url) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-lg bg-surface-code border border-border text-text-muted',
          className
        )}
        aria-label={`${entry.characterName} — no saved image`}
      >
        <User className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={`${entry.characterName} reference image`} className={cn('rounded-lg object-cover', className)} />;
}
