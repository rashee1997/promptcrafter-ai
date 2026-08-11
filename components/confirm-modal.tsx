'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';
import { GlassCard } from './glass-card';

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
  if (!isOpen) return null;

  const buttonColors = {
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20',
    warning: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20',
    info: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20',
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md"
        >
          <GlassCard variant="glowing" className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {title}
                </h3>
              </div>
              <button
                onClick={onCancel}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {message}
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
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
