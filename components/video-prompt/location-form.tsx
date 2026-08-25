'use client';

import React, { useState } from 'react';
import { Radar, Plus } from 'lucide-react';
import type { VideoLocation } from '@/types/video';
import { cn } from '@/lib/utils';

interface LocationFormProps {
  initial?: VideoLocation | null;
  /** Ad-hoc AI scouting via /api/suggest-video-location (shared Phase 3 engine). */
  onSuggest: (hint: string) => Promise<VideoLocation[]>;
  onSubmit: (location: VideoLocation) => void;
  onCancel: () => void;
}

/**
 * Sidebar location editor — defaults to the AI Suggest tab so directors can
 * scout through the shared location engine (Rule 3: the user's active model
 * choice), with a Manual tab for typing a location literally.
 */
export function LocationForm({ initial, onSuggest, onSubmit, onCancel }: LocationFormProps) {
  const [tab, setTab] = useState<'ai' | 'manual'>(initial ? 'manual' : 'ai');
  const [hint, setHint] = useState('');
  const [scouting, setScouting] = useState(false);
  const [suggestions, setSuggestions] = useState<VideoLocation[]>([]);
  const [draft, setDraft] = useState<VideoLocation>(
    initial ?? {
      id: `loc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      name: '',
      description: '',
    }
  );

  const scout = async () => {
    const text = hint.trim();
    if (!text || scouting) return;
    setScouting(true);
    try {
      const found = await onSuggest(text);
      if (found.length > 0) setSuggestions(found);
    } finally {
      setScouting(false);
    }
  };

  const canSave = draft.name.trim().length > 0;

  return (
    <div className="space-y-3">
      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-sunken border border-border">
        {(
          [
            { id: 'ai', label: 'AI suggest' },
            { id: 'manual', label: 'Manual' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-pressed={tab === t.id}
            className={cn(
              'flex-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors',
              tab === t.id
                ? 'bg-surface-card text-brand border border-border shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'ai' ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void scout();
              }}
              placeholder="Describe a location to scout — e.g. a rain-soaked neon rooftop"
              aria-label="Location scouting hint"
              className="flex-1 px-2.5 py-1.5 rounded-lg text-xs bg-surface-input border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/70 transition-shadow"
            />
            <button
              type="button"
              onClick={() => void scout()}
              disabled={!hint.trim() || scouting}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors shrink-0',
                'bg-brand/10 text-brand border-brand/25 hover:bg-brand/15',
                (!hint.trim() || scouting) && 'opacity-40 cursor-not-allowed'
              )}
            >
              <Radar className={cn('w-3.5 h-3.5', scouting && 'animate-spin')} aria-hidden="true" />
              {scouting ? 'Scouting…' : 'Scout'}
            </button>
          </div>
          {suggestions.length > 0 && (
            <ul className="space-y-1.5">
              {suggestions.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => onSubmit(s)}
                    className="w-full text-left px-2.5 py-2 rounded-lg border border-border bg-surface-muted hover:border-brand/40 transition-colors"
                  >
                    <span className="block text-xs font-semibold text-text-primary truncate">{s.name}</span>
                    <span className="block text-[10px] text-text-muted leading-relaxed line-clamp-2">{s.description}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="text-[10px] text-text-muted">
            Scouting uses your active model choice and the shared Phase 3 location engine.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          <div>
            <label htmlFor="loc-form-name" className="block text-[9px] font-bold uppercase tracking-wider text-text-muted">
              Name
            </label>
            <input
              id="loc-form-name"
              type="text"
              value={draft.name}
              onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Location name"
              className="mt-1 w-full px-2.5 py-1.5 rounded-lg text-xs bg-surface-input border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/70 transition-shadow"
            />
          </div>
          <div>
            <label htmlFor="loc-form-desc" className="block text-[9px] font-bold uppercase tracking-wider text-text-muted">
              Environment description
            </label>
            <textarea
              id="loc-form-desc"
              value={draft.description}
              onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              placeholder="Light, texture, practical set dressing…"
              className="mt-1 w-full px-2.5 py-1.5 rounded-lg text-xs bg-surface-input border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/70 transition-shadow resize-y scrollbar-thin"
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-text-secondary hover:bg-surface-hover transition-colors"
        >
          Cancel
        </button>
        {tab === 'manual' && (
          <button
            type="button"
            onClick={() => canSave && onSubmit(draft)}
            disabled={!canSave}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--brand-foreground)] bg-brand hover:bg-brand-hover shadow-glow active:scale-[0.985] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            Save location
          </button>
        )}
      </div>
    </div>
  );
}
