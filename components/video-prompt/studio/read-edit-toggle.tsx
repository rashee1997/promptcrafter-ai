'use client';

import React, { useState } from 'react';
import { Check, Pencil, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Phase 8 — ReadEditToggle: the identical read/edit pattern across characters,
 * beats, screenplay scenes, direction plan, and locations.
 *
 * "Confirmed content reads like a document, editing is a deliberate action."
 */
interface ReadEditToggleProps {
  /** Content displayed in read mode */
  children: React.ReactNode;
  /** Content rendered in edit mode */
  editContent: React.ReactNode;
  /** Called when the user confirms edits */
  onConfirm: () => void;
  /** Called when the user cancels edits */
  onCancel?: () => void;
  /** Label shown on the edit button */
  editLabel?: string;
  /** Whether the content is locked (disables edit) */
  locked?: boolean;
  /** Whether we're currently in editing mode (controlled) */
  editing?: boolean;
  /** Called when editing state changes (controlled) */
  onEditingChange?: (editing: boolean) => void;
  className?: string;
}

export function ReadEditToggle({
  children,
  editContent,
  onConfirm,
  onCancel,
  editLabel = 'Edit',
  locked = false,
  editing: controlledEditing,
  onEditingChange,
  className,
}: ReadEditToggleProps) {
  const [internalEditing, setInternalEditing] = useState(false);
  const isEditing = controlledEditing ?? internalEditing;

  const setEditing = (val: boolean) => {
    if (onEditingChange) {
      onEditingChange(val);
    } else {
      setInternalEditing(val);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    setEditing(false);
  };

  const handleConfirm = () => {
    onConfirm();
    setEditing(false);
  };

  if (isEditing) {
    return (
      <div className={cn('space-y-2', className)}>
        {editContent}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-[var(--brand-foreground)] bg-brand hover:bg-brand-hover shadow-glow active:scale-[0.985] transition-all"
          >
            <Check className="w-3 h-3" aria-hidden="true" />
            Save
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-surface-muted text-text-secondary border border-border hover:border-brand/40 hover:text-brand transition-colors"
          >
            <X className="w-3 h-3" aria-hidden="true" />
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative group', className)}>
      {children}
      {!locked && (
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={editLabel}
          className="absolute top-1 right-1 p-1 rounded-md text-text-muted hover:text-brand hover:bg-brand/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        >
          <Pencil className="w-3 h-3" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
