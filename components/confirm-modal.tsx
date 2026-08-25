'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';
import { GlassCard } from './glass-card';
import { useFocusTrap } from '@/lib/use-focus-trap';
import { useScrollLock } from '@/lib/use-scroll-lock';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const titleId = React.useId();
  const messageId = React.useId();
  const dialogRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Keep Tab/Shift+Tab cycling inside the dialog while it's open
  useFocusTrap(containerRef, isOpen);

  // Prevent the page behind the modal from scrolling
  useScrollLock(isOpen);

  // Focus the dialog on open and restore focus to the trigger on close
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
      // Delay so the dialog is mounted and focusable
      requestAnimationFrame(() => dialogRef.current?.focus());
    }
    return () => {
      previouslyFocusedRef.current?.focus?.();
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const buttonColors = {
    danger: 'bg-danger hover:bg-danger/80 text-white shadow-danger/20',
    warning: 'bg-warning hover:bg-warning/80 text-white shadow-warning/20',
    info: 'bg-brand hover:bg-brand-hover text-[var(--brand-foreground)] shadow-glow',
  };

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        ref={containerRef}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-code/60 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md"
        >
          <GlassCard variant="glowing" className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-danger/10 text-danger border border-danger/20">
                  <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 id={titleId} className="text-lg font-semibold text-text-primary">
                  {title}
                </h3>
              </div>
              <button
                onClick={onCancel}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary dark:hover:text-text-primary hover:bg-surface-hover transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <p id={messageId} className="mt-3 text-sm text-text-secondary leading-relaxed">
              {message}
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium rounded-xl border border-border text-text-secondary hover:bg-surface-hover transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                ref={dialogRef}
                tabIndex={-1}
                className={`px-4 py-2 text-sm font-medium rounded-xl shadow-lg transition-all ${buttonColors[variant]}`}
              >
                {confirmLabel}
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
