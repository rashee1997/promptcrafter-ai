'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, Pencil, Plus, Users, X } from 'lucide-react';
import type { VideoCharacter, VideoProject } from '@/types/video';
import { CharacterForm } from './character-form';

interface SidebarCharactersPanelProps {
  project: VideoProject;
  onUpdate: (next: VideoProject) => void;
}

/**
 * Sidebar cast panel. "+ Add Character" opens the shared character sheet;
 * editing an existing character after activation surfaces a drift-warning
 * modal (changing appearance/wardrobe can desync already-approved shots).
 */
export function SidebarCharactersPanel({ project, onUpdate }: SidebarCharactersPanelProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<VideoCharacter | null>(null);
  const characters = project.storyBible?.characters ?? [];
  const active = project.status === 'active';

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (c: VideoCharacter) => {
    setEditing(c);
    setModalOpen(true);
  };

  const save = (character: VideoCharacter) => {
    const existing = characters.some((c) => c.id === character.id);
    const next = existing
      ? characters.map((c) => (c.id === character.id ? character : c))
      : [...characters, character];
    onUpdate({
      ...project,
      storyBible: { ...project.storyBible, characters: next },
      updatedAt: Date.now(),
    });
    setModalOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
          <Users className="w-3 h-3 text-accent" aria-hidden="true" />
          Characters
          <span className="px-1 py-0.5 rounded-md text-[9px] font-bold bg-surface-muted border border-border text-text-muted tabular-nums">
            {characters.length}
          </span>
        </p>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold bg-surface-muted text-text-secondary border border-border hover:border-brand/40 hover:text-brand transition-colors"
        >
          <Plus className="w-3 h-3" aria-hidden="true" />
          Add Character
        </button>
      </div>

      {characters.length === 0 ? (
        <p className="text-[11px] text-text-muted leading-relaxed rounded-lg border border-dashed border-border p-2.5">
          No cast yet — add a character to anchor continuity.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {characters.map((c) => (
            <li
              key={c.id}
              className="group flex items-center justify-between gap-2 rounded-lg border border-border bg-surface-muted/60 px-2.5 py-2"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold text-text-primary truncate">{c.name}</p>
                <p className="text-[10px] text-text-muted truncate">{c.role || '—'}</p>
              </div>
              <button
                type="button"
                onClick={() => openEdit(c)}
                aria-label={`Edit ${c.name}`}
                title="Edit character"
                className="p-1.5 rounded-lg text-text-muted hover:text-brand hover:bg-brand/10 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
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
            aria-label={editing ? `Edit ${editing.name}` : 'Add character'}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-code/60 backdrop-blur-md"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setModalOpen(false);
                setEditing(null);
              }
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
                  {editing ? `Edit ${editing.name}` : 'Add character'}
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setEditing(null);
                  }}
                  aria-label="Close"
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              {editing && active && (
                <div
                  role="status"
                  className="mb-3 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-2.5 text-[11px] text-warning leading-relaxed"
                >
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    Editing a character after shots are approved may drift continuity across the storyboard. Approved
                    shots keep their old appearance text.
                  </span>
                </div>
              )}

              <CharacterForm
                initial={editing}
                onSubmit={save}
                onCancel={() => {
                  setModalOpen(false);
                  setEditing(null);
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
