'use client';

import React from 'react';
import { Copy, Save, Trash2 } from 'lucide-react';
import { PLATFORM_OPTIONS, SavedImagePrompt } from '@/lib/image-prompts';

interface SavedGalleryProps {
  items: SavedImagePrompt[];
  onCopy: (text: string, label: string) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

/** Saved briefs gallery with per-item copy/delete and a clear-all action. */
export function SavedGallery({ items, onCopy, onDelete, onClear }: SavedGalleryProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
          <Save className="w-3.5 h-3.5 text-brand" />
          Saved briefs ({items.length})
        </h3>
        <button
          type="button"
          onClick={onClear}
          className="text-[11px] text-text-muted hover:text-danger transition-colors flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" />
          Clear all
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="group rounded-xl border border-border bg-surface-card/70 backdrop-blur-xl p-3.5 hover:border-brand/40 transition-colors flex flex-col gap-2.5"
          >
            <div className="min-w-0">
              <p className="text-xs font-bold text-text-primary truncate" title={item.title}>
                {item.title}
              </p>
              <p className="mt-0.5 text-[10px] text-text-muted truncate">
                {item.styleLabel} · {item.aspectRatio} · {item.platforms.length} platforms
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              {item.platforms.slice(0, 4).map((p) => (
                <span key={p} className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-brand/10 text-brand border border-brand/20">
                  {PLATFORM_OPTIONS.find((o) => o.id === p)?.label ?? p}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1.5 mt-auto">
              <button
                type="button"
                onClick={() => onCopy(item.master, 'Saved prompt')}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-brand/10 text-brand border border-brand/25 hover:bg-brand/15 transition-colors"
              >
                <Copy className="w-3 h-3" />
                Copy
              </button>
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-surface-muted text-text-muted border border-border hover:text-danger hover:border-danger/40 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
