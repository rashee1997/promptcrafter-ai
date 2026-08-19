'use client';

import React from 'react';

interface TooltipProps {
  label: string;
  children: React.ReactNode;
  side?: 'top' | 'bottom';
  /** Extra classes for the wrapper span (e.g. responsive visibility). */
  className?: string;
}

/**
 * Lightweight styled tooltip (DESIGN.md §9.14) for icon-only controls.
 * Pure CSS hover/focus activation (no JS timers), `role="tooltip"`,
 * semantic tokens, reduced-motion safe via the global media query.
 */
export function Tooltip({ label, children, side = 'top', className }: TooltipProps) {
  return (
    <span className={`relative inline-flex group/tooltip ${className ?? ''}`}>
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-surface-elevated px-2 py-1 text-[11px] font-medium text-text-secondary opacity-0 shadow-lg transition-all duration-120 ${
          side === 'top'
            ? 'bottom-full mb-1.5'
            : 'top-full mt-1.5'
        } group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100 ${
          side === 'top'
            ? 'group-hover/tooltip:-translate-y-0.5 group-focus-within/tooltip:-translate-y-0.5'
            : 'group-hover/tooltip:translate-y-0.5 group-focus-within/tooltip:translate-y-0.5'
        }`}
      >
        {label}
      </span>
    </span>
  );
}
