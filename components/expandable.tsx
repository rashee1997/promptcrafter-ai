'use client';

import React from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface ExpandableProps {
  open: boolean;
  children: React.ReactNode;
  id?: string;
  className?: string;
}

/**
 * Animated disclosure panel (DESIGN.md §10 — Accordion pattern).
 * Tweens height (220–320ms, decelerate easing) instead of snapping,
 * and unmounts content while closed so collapsed panels cost nothing.
 * Motion respects `prefers-reduced-motion` automatically.
 */
export function Expandable({ open, children, id, className }: ExpandableProps) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="expandable"
          id={id}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.26, ease: [0.2, 0, 0, 1] }}
          className={className}
          style={{ overflow: 'hidden' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
