'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastItem {
  id: number;
  variant: ToastVariant;
  title: string;
  message?: string;
}

// ── Tiny event-driven store (no provider plumbing needed) ──
let toasts: ToastItem[] = [];
let listeners: Array<(items: ToastItem[]) => void> = [];
let nextId = 1;

function notify() {
  for (const l of listeners) l([...toasts]);
}

function dismiss(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  notify();
}

function push(variant: ToastVariant, title: string, message?: string, duration = 4000) {
  const item: ToastItem = { id: nextId++, variant, title, message };
  toasts = [...toasts, item];
  notify();
  if (duration > 0) {
    setTimeout(() => dismiss(item.id), duration);
  }
}

/** Fire a toast from anywhere in the app (DESIGN.md §9.13). */
export const toast = {
  success: (title: string, message?: string) => push('success', title, message),
  error: (title: string, message?: string) => push('error', title, message, 6000),
  info: (title: string, message?: string) => push('info', title, message),
};

const VARIANT_STYLES: Record<ToastVariant, { icon: React.ReactNode; classes: string }> = {
  success: {
    icon: <CheckCircle2 className="w-4 h-4 text-success" />,
    classes: 'border-success/30',
  },
  error: {
    icon: <AlertTriangle className="w-4 h-4 text-danger" />,
    classes: 'border-danger/30',
  },
  info: {
    icon: <Info className="w-4 h-4 text-brand" />,
    classes: 'border-brand/30',
  },
};

/**
 * Mount once at the app root. Renders the stacked top-right toast viewport
 * with spring entrance and fade exit; z-index sits above modals (z-60).
 */
export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    listeners.push(setItems);
    return () => {
      listeners = listeners.filter((l) => l !== setItems);
    };
  }, []);

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed top-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2 pointer-events-none"
    >
      <AnimatePresence>
        {items.map((item) => {
          const style = VARIANT_STYLES[item.variant];
          return (
            <motion.div
              key={item.id}
              role={item.variant === 'error' ? 'alert' : 'status'}
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.28, ease: [0.34, 1.56, 0.64, 1] }}
              className={`pointer-events-auto flex items-start gap-2.5 rounded-xl border bg-surface-card p-3 shadow-lg backdrop-blur-xl ${style.classes}`}
            >
              <span className="mt-0.5 shrink-0">{style.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-text-primary leading-snug">{item.title}</p>
                {item.message && (
                  <p className="mt-0.5 text-[11px] text-text-secondary leading-relaxed">{item.message}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="shrink-0 rounded-md p-1 text-text-muted hover:text-text-primary transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
