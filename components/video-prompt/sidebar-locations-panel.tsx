'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { MapPin, Pencil, Plus, Trash2, X } from 'lucide-react';
import type { ProviderConfig } from '@/types';
import type { VideoLocation, VideoProject, VideoShot } from '@/types/video';
import { suggestVideoLocations } from '@/lib/ai-client';
import { ConfirmModal } from '@/components/confirm-modal';
import { LocationForm } from './location-form';

interface SidebarLocationsPanelProps {
  project: VideoProject;
  provider: ProviderConfig;
  onUpdate: (next: VideoProject) => void;
}

/**
 * Sidebar locations panel. "+ Add Location" opens the location editor
 * defaulting to the AI Suggest tab, which scouts through the shared Phase 3
 * engine (/api/suggest-video-location) with the user's active model choice.
 */
export function SidebarLocationsPanel({ project, provider, onUpdate }: SidebarLocationsPanelProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<VideoLocation | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    location: VideoLocation;
    shots: VideoShot[];
  } | null>(null);
  const locations = project.storyBible?.locations ?? [];

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (l: VideoLocation) => {
    setEditing(l);
    setModalOpen(true);
  };

  const close = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const save = (location: VideoLocation) => {
    const existing = locations.some((l) => l.id === location.id);
    const next = existing
      ? locations.map((l) => (l.id === location.id ? location : l))
      : [...locations, location];
    onUpdate({
      ...project,
      storyBible: { ...project.storyBible, locations: next },
      updatedAt: Date.now(),
    });
    close();
  };

  const scout = async (hint: string): Promise<VideoLocation[]> => {
    const style = project.storyBible?.style;
    return suggestVideoLocations({
      intent: hint,
      style: style ? { ...style, id: 'locked', name: 'Locked style' } : null,
      existingLocations: locations,
      provider,
    });
  };

  /** A7 — deleting a location whose name is anchored in shot prompts warns first. */
  const requestDelete = (l: VideoLocation) => {
    const name = l.name.trim().toLowerCase();
    const affected = name
      ? project.shots.filter((s) =>
          `${s.promptText ?? ''}\n${s.description ?? ''}`.toLowerCase().includes(name)
        )
      : [];
    if (affected.length > 0) {
      setPendingDelete({ location: l, shots: affected });
    } else {
      confirmDelete(l);
    }
  };

  const confirmDelete = (l: VideoLocation) => {
    onUpdate({
      ...project,
      storyBible: {
        ...project.storyBible,
        locations: locations.filter((x) => x.id !== l.id),
        continuityLog: [
          ...(project.storyBible.continuityLog ?? []),
          `Location "${l.name}" deleted from the Story Bible.`,
        ],
      },
      updatedAt: Date.now(),
    });
    setPendingDelete(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
          <MapPin className="w-3 h-3 text-accent" aria-hidden="true" />
          Locations
          <span className="px-1 py-0.5 rounded-md text-[9px] font-bold bg-surface-muted border border-border text-text-muted tabular-nums">
            {locations.length}
          </span>
        </p>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold bg-surface-muted text-text-secondary border border-border hover:border-brand/40 hover:text-brand transition-colors"
        >
          <Plus className="w-3 h-3" aria-hidden="true" />
          Add Location
        </button>
      </div>

      {locations.length === 0 ? (
        <p className="text-[11px] text-text-muted leading-relaxed rounded-lg border border-dashed border-border p-2.5">
          No locations yet — scout one with AI or add it manually.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {locations.map((l) => (
            <li
              key={l.id}
              className="group flex items-center justify-between gap-2 rounded-lg border border-border bg-surface-muted/60 px-2.5 py-2"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold text-text-primary truncate">{l.name}</p>
                <p className="text-[10px] text-text-muted truncate">{l.description || '—'}</p>
              </div>
              <button
                type="button"
                onClick={() => openEdit(l)}
                aria-label={`Edit ${l.name}`}
                title="Edit location"
                className="p-1.5 rounded-lg text-text-muted hover:text-brand hover:bg-brand/10 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => requestDelete(l)}
                aria-label={`Delete ${l.name}`}
                title="Delete location"
                className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <AnimatePresence>
        {modalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={editing ? `Edit ${editing.name}` : 'Add location'}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-code/60 backdrop-blur-md"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) close();
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.24, ease: [0.34, 1.56, 0.64, 1] }}
              className="w-full max-w-sm rounded-2xl border border-border bg-surface-card p-4 shadow-lg"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <h4 className="text-sm font-bold text-text-primary">
                  {editing ? `Edit ${editing.name}` : 'Add location'}
                </h4>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
              <LocationForm initial={editing} onSuggest={scout} onSubmit={save} onCancel={close} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* A7 — delete confirmation listing the shots that keep this location's name */}
      <ConfirmModal
        isOpen={pendingDelete !== null}
        title={pendingDelete ? `Delete ${pendingDelete.location.name}?` : 'Delete location?'}
        message={
          pendingDelete
            ? `This location is anchored in ${pendingDelete.shots.length} shot prompt${pendingDelete.shots.length === 1 ? '' : 's'} (${pendingDelete.shots.map((s) => `Shot ${s.shotNumber}`).join(', ')}). Deleting it removes the location from the Story Bible; approved shots keep their existing prompt text but lose the fixed environment anchor for future drafts.`
            : ''
        }
        confirmLabel="Delete Location"
        variant="danger"
        onConfirm={() => pendingDelete && confirmDelete(pendingDelete.location)}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
