'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, GripVertical, Link, Pencil, Plus, SquarePlay, Trash2, Users, X } from 'lucide-react';
import type { ProviderConfig } from '@/types';
import type { VideoCharacter, VideoProject, VideoShot } from '@/types/video';
import { regenerateCharacterImagePrompt } from '@/lib/ai-client';
import { useStoryBible } from '@/lib/video/story-bible-context';
import { ConfirmModal } from '@/components/confirm-modal';
import { cn } from '@/lib/utils';
import { CharacterForm } from './character-form';
import { CharacterImageThumb } from './character-image-thumb';
import { CharacterReferencePanel } from './character-reference-panel';

interface SidebarCharactersPanelProps {
  project: VideoProject;
  /** Settings-active provider — powers the image-prompt regenerate loop (D2). */
  provider: ProviderConfig;
  onUpdate: (next: VideoProject) => void;
}

/** Drag payload type — dropped onto shot cards to lock a character reference. */
export const CHARACTER_DRAG_TYPE = 'application/x-video-character';

/**
 * Sidebar cast panel. "+ Add Character" opens the shared character sheet;
 * editing an existing character after activation surfaces a drift-warning
 * modal (changing appearance/wardrobe can desync already-approved shots).
 * Rows show saved Story Bible reference images and are draggable onto shots
 * in the storyboard timeline (Phase 4).
 */
export function SidebarCharactersPanel({ project, provider, onUpdate }: SidebarCharactersPanelProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<VideoCharacter | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    character: VideoCharacter;
    shots: VideoShot[];
  } | null>(null);
  const { entries } = useStoryBible();
  const characters = project.storyBible?.characters ?? [];
  const active = project.status === 'active';
  const [lockToShot, setLockToShot] = useState<string | null>(null);
  const isEdit = editing ? characters.some((c) => c.id === editing.id) : false;
  const shots = project.shots ?? [];

  const openAdd = () => {
    // A fresh id up front so the reference panel's uploads bind to a stable
    // character id that the form (initial) also uses on save.
    setEditing({
      id: `char-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      name: '',
      role: '',
      appearance: '',
      wardrobe: '',
      voiceTone: '',
    });
    setModalOpen(true);
  };

  const openEdit = (c: VideoCharacter) => {
    setEditing(c);
    setModalOpen(true);
  };

  const save = (character: VideoCharacter) => {
    // The reference panel edits the live `editing` object; merge the latest
    // imagePrompt in case the panel changed it after the form mounted.
    const merged = { ...character, imagePrompt: editing?.imagePrompt ?? character.imagePrompt };
    const existing = characters.some((c) => c.id === merged.id);
    const next = existing
      ? characters.map((c) => (c.id === merged.id ? merged : c))
      : [...characters, merged];
    onUpdate({
      ...project,
      storyBible: { ...project.storyBible, characters: next },
      updatedAt: Date.now(),
    });
    setModalOpen(false);
    setEditing(null);
  };

  /** D2 — regenerate just the open character's imagePrompt text via AI. */
  const handleRegenerateImagePrompt = async (): Promise<void> => {
    if (!editing) return;
    const next = await regenerateCharacterImagePrompt({
      provider,
      character: editing,
      styleContext: project.storyBible?.style?.lookAndMood,
    });
    if (next) setEditing((prev) => (prev ? { ...prev, imagePrompt: next } : prev));
  };

  /** A7 — deleting a character whose id is locked onto shots warns first. */
  const requestDelete = (c: VideoCharacter) => {
    const affected = project.shots.filter((s) => s.characterIds?.includes(c.id));
    if (affected.length > 0) {
      setPendingDelete({ character: c, shots: affected });
    } else {
      confirmDelete(c);
    }
  };

  const confirmDelete = (c: VideoCharacter) => {
    const nextCharacters = characters.filter((x) => x.id !== c.id);
    const nextShots = project.shots.map((s) =>
      s.characterIds?.includes(c.id)
        ? { ...s, characterIds: s.characterIds.filter((id) => id !== c.id) }
        : s
    );
    onUpdate({
      ...project,
      storyBible: {
        ...project.storyBible,
        characters: nextCharacters,
        continuityLog: [
          ...(project.storyBible.continuityLog ?? []),
          `Character "${c.name}" deleted; locked reference images released from their shots.`,
        ],
      },
      shots: nextShots,
      updatedAt: Date.now(),
    });
    setPendingDelete(null);
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
        <>
          <ul className="space-y-1.5">
            {characters.map((c) => {
              const saved = entries.filter((e) => e.characterId === c.id);
              const primary = saved.find((e) => e.isPrimary) ?? saved[0];
              return (
                <li
                  key={c.id}
                  draggable={active}
                  onDragStart={(e) => {
                    e.dataTransfer.setData(CHARACTER_DRAG_TYPE, c.id);
                    e.dataTransfer.setData('text/plain', c.name);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  onDragEnd={(e) => {
                    e.dataTransfer.clearData();
                  }}
                  title={active ? `Drag ${c.name} onto a shot to lock their reference image` : undefined}
                  className="group flex items-center gap-2 rounded-lg border border-border bg-surface-muted/60 px-2.5 py-2 cursor-grab active:cursor-grabbing"
                >
                  <GripVertical className="w-3.5 h-3.5 text-text-muted/50 shrink-0" aria-hidden="true" />
                  {primary ? (
                    <CharacterImageThumb entry={primary} className="h-8 w-8 shrink-0 border border-border" />
                  ) : (
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-code border border-border text-text-muted">
                      <Users className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-text-primary truncate">{c.name}</p>
                    <p className="text-[10px] text-text-muted truncate">
                      {saved.length > 0 ? `${saved.length} reference image${saved.length === 1 ? '' : 's'}` : c.role || '—'}
                    </p>
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
                  {active && shots.length > 0 && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setLockToShot(lockToShot === c.id ? null : c.id)}
                        aria-label={`Lock ${c.name} to a shot (touch fallback)`}
                        title="Lock character to a shot (touch-friendly)"
                        className="p-1.5 rounded-lg text-text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                      >
                        <Link className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      {lockToShot === c.id && (
                        <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-xl border border-border bg-surface-card shadow-lg p-1.5 space-y-0.5">
                          <p className="text-[9px] font-bold uppercase tracking-wide text-text-muted px-2 py-1">Lock to shot:</p>
                          {shots.map((s) => {
                            const locked = s.characterIds?.includes(c.id);
                            return (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => {
                                  if (locked) {
                                    // Remove from this shot
                                    const updated = {
                                      ...project,
                                      shots: project.shots.map((sh) =>
                                        sh.id === s.id
                                          ? { ...sh, characterIds: (sh.characterIds ?? []).filter((id) => id !== c.id) }
                                          : sh
                                      ),
                                      updatedAt: Date.now(),
                                    };
                                    onUpdate(updated);
                                  } else {
                                    // Add to this shot
                                    const updated = {
                                      ...project,
                                      shots: project.shots.map((sh) =>
                                        sh.id === s.id
                                          ? { ...sh, characterIds: [...(sh.characterIds ?? []), c.id] }
                                          : sh
                                      ),
                                      storyBible: {
                                        ...project.storyBible,
                                        continuityLog: [
                                          ...(project.storyBible.continuityLog ?? []),
                                          `Shot ${s.shotNumber} locked to character "${c.name}" reference image.`,
                                        ],
                                      },
                                      updatedAt: Date.now(),
                                    };
                                    onUpdate(updated);
                                  }
                                  setLockToShot(null);
                                }}
                                className={cn(
                                  'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-colors text-left',
                                  locked
                                    ? 'bg-accent/10 text-accent'
                                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                                )}
                              >
                                <SquarePlay className="w-3 h-3 shrink-0" aria-hidden="true" />
                                Shot {s.shotNumber}{locked ? ' (locked)' : ''}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => requestDelete(c)}
                    aria-label={`Delete ${c.name}`}
                    title="Delete character"
                    className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
          {active && characters.length > 0 && (
            <p className="text-[9px] text-text-muted leading-relaxed">
              Drag a character onto a shot to lock their reference image into that shot&apos;s dialect export.
            </p>
          )}
        </>
      )}

      <AnimatePresence>
        {modalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={isEdit ? `Edit ${editing?.name}` : 'Add character'}
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
                  {isEdit ? `Edit ${editing?.name}` : 'Add character'}
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

              {/* D2 — the shared reference panel: edit/regenerate the image
                  prompt, upload candidates, set the primary. Present both on
                  add (pre-save) and edit (post-activation). */}
              {editing && (
                <div className="mt-3 space-y-2">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-text-muted">
                    Character reference image
                  </p>
                  <CharacterReferencePanel
                    character={editing}
                    projectId={project.id}
                    onEditPrompt={(text) => setEditing((prev) => (prev ? { ...prev, imagePrompt: text } : prev))}
                    onRegeneratePrompt={async () => {
                      await handleRegenerateImagePrompt();
                    }}
                    onAnalysisComplete={(analysis) => {
                      setEditing((prev) =>
                        prev
                          ? {
                              ...prev,
                              appearance: analysis.appearance,
                              wardrobe: analysis.apparentWardrobe,
                            }
                          : prev
                      );
                    }}
                  />
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* A7 — delete confirmation listing the shots that lose the anchor */}
      <ConfirmModal
        isOpen={pendingDelete !== null}
        title={pendingDelete ? `Delete ${pendingDelete.character.name}?` : 'Delete character?'}
        message={
          pendingDelete
            ? `This character is locked as a reference on ${pendingDelete.shots.length} shot${pendingDelete.shots.length === 1 ? '' : 's'} (${pendingDelete.shots.map((s) => `Shot ${s.shotNumber}`).join(', ')}). Deleting it removes the character from the Story Bible and releases those reference locks — approved shots keep their existing prompt text.`
            : ''
        }
        confirmLabel="Delete Character"
        variant="danger"
        onConfirm={() => pendingDelete && confirmDelete(pendingDelete.character)}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
