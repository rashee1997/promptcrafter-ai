'use client';

import React, { useState } from 'react';
import { Check, Edit3, MapPin, Plus, Radar, Trash2 } from 'lucide-react';
import type { VideoLocation } from '@/types/video';
import { cn } from '@/lib/utils';

interface BootstrapScenesStepProps {
  data: VideoLocation[];
  busy: boolean;
  onChange: (next: VideoLocation[]) => void;
  /** Ad-hoc location scouting via /api/suggest-video-location (shared engine). */
  onSuggest: (hint: string) => Promise<void>;
  onConfirm: () => void;
}

function LocationCard({
  location,
  onChange,
  onRemove,
}: {
  location: VideoLocation;
  onChange: (patch: Partial<VideoLocation>) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div className={cn('relative rounded-2xl border p-4 flex flex-col gap-2.5', editing ? 'border-brand/30 bg-brand/5' : 'border-border bg-surface-card/60')}>
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-accent-soft text-text-primary border border-accent/30">
          <MapPin className="w-3 h-3 text-accent" aria-hidden="true" />
          Location
        </span>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => setEditing(!editing)}
            aria-label={editing ? 'Switch to read view' : `Edit ${location.name || 'location'}`}
            className="p-1.5 rounded-lg text-text-muted hover:text-brand hover:bg-brand/10 transition-colors"
          >
            {editing ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />}
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${location.name || 'location'}`}
            title="Remove location"
            className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {editing ? (
        <>
          <div>
            <label
              htmlFor={`loc-${location.id}-name`}
              className="block text-[9px] font-bold uppercase tracking-wider text-text-muted"
            >
              Name
            </label>
            <input
              id={`loc-${location.id}-name`}
              type="text"
              value={location.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Location name"
              className="mt-1 w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-surface-input border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/70 transition-shadow"
            />
          </div>
          <div>
            <label
              htmlFor={`loc-${location.id}-desc`}
              className="block text-[9px] font-bold uppercase tracking-wider text-text-muted"
            >
              Environment description
            </label>
            <textarea
              id={`loc-${location.id}-desc`}
              value={location.description}
              onChange={(e) => onChange({ description: e.target.value })}
              rows={3}
              placeholder="Light, texture, practical set dressing…"
              className="mt-1 w-full px-2.5 py-1.5 rounded-lg text-xs bg-surface-input border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/70 transition-shadow resize-y scrollbar-thin"
            />
          </div>
        </>
      ) : (
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-text-primary">
            {location.name || 'Unnamed location'}
          </h3>
          {location.description && (
            <p className="mt-1.5 text-xs text-text-secondary leading-relaxed">
              {location.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Stage 3 review — the scouted locations as editable cards with add/remove.
 * "+ Add location" scouts ad-hoc through the shared suggestScenes engine
 * (Rule 3) or adds the typed hint literally as a manual location.
 */
export function BootstrapScenesStep({
  data,
  busy,
  onChange,
  onSuggest,
  onConfirm,
}: BootstrapScenesStepProps) {
  const [hint, setHint] = useState('');
  const [scouting, setScouting] = useState(false);

  const updateLocation = (id: string, patch: Partial<VideoLocation>) => {
    onChange(data.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const removeLocation = (id: string) => {
    onChange(data.filter((l) => l.id !== id));
  };

  const addManual = () => {
    const text = hint.trim();
    if (!text || busy || scouting) return;
    onChange([
      ...data,
      {
        id: `loc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        name: text,
        description: '',
      },
    ]);
    setHint('');
  };

  const scout = async () => {
    const text = hint.trim();
    if (!text || busy || scouting) return;
    setScouting(true);
    try {
      await onSuggest(text);
    } finally {
      setScouting(false);
      setHint('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        {data.map((l) => (
          <LocationCard
            key={l.id}
            location={l}
            onChange={(patch) => updateLocation(l.id, patch)}
            onRemove={() => removeLocation(l.id)}
          />
        ))}
      </div>

      {/* Ad-hoc location scouting */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={hint}
          onChange={(e) => setHint(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void scout();
          }}
          placeholder="Describe a location to scout — e.g. \u201ca rain-soaked rooftop overlooking the neon skyline\u201d"
          aria-label="Location scouting hint"
          className="flex-1 px-3 py-2 rounded-xl text-xs bg-surface-input border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/70 transition-shadow"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addManual}
            disabled={!hint.trim() || busy || scouting}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors',
              'bg-surface-muted text-text-secondary border-border hover:border-brand/40 hover:text-brand',
              (!hint.trim() || busy || scouting) && 'opacity-40 cursor-not-allowed'
            )}
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            Add
          </button>
          <button
            type="button"
            onClick={() => void scout()}
            disabled={!hint.trim() || busy || scouting}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors',
              'bg-brand/10 text-brand border-brand/25 hover:bg-brand/15',
              (!hint.trim() || busy || scouting) && 'opacity-40 cursor-not-allowed'
            )}
          >
            <Radar className={cn('w-3.5 h-3.5', scouting && 'animate-spin')} aria-hidden="true" />
            {scouting ? 'Scouting…' : 'AI scout'}
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy || data.length === 0}
          className={cn(
            'inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl text-white',
            'bg-brand hover:bg-brand-hover shadow-glow active:scale-[0.985] transition-all',
            (busy || data.length === 0) && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Check className="w-4 h-4" aria-hidden="true" />
          Confirm locations
        </button>
      </div>
    </div>
  );
}
