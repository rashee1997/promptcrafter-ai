'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Phase 8 — EmptyState: a designed empty state with clear next action.
 * Every new surface (voice panel with no voice attached, timeline with zero
 * confirmed shots, animation controls when no style selected) gets this.
 */
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  variant?: 'default' | 'compact' | 'inline';
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default',
  className,
}: EmptyStateProps) {
  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'flex items-center gap-3 rounded-xl border border-dashed border-border bg-surface-code/40 px-4 py-3',
          className,
        )}
      >
        <span className="shrink-0 text-brand/60">{icon}</span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-text-primary">{title}</p>
          <p className="text-[11px] text-text-muted leading-relaxed">{description}</p>
        </div>
        {action}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'rounded-xl border border-dashed border-border bg-surface-code/40 px-4 py-4 text-center',
          className,
        )}
      >
        <span className="text-brand/60">{icon}</span>
        <p className="mt-1.5 text-xs font-semibold text-text-primary">{title}</p>
        <p className="mt-0.5 text-[11px] text-text-muted leading-relaxed">{description}</p>
        {action && <div className="mt-3">{action}</div>}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-2xl border border-dashed border-border bg-surface-code/40 px-6 py-10 text-center',
        className,
      )}
    >
      <span className="text-brand/60">{icon}</span>
      <p className="mt-3 text-sm font-bold text-text-primary">{title}</p>
      <p className="mt-1 text-xs text-text-secondary leading-relaxed max-w-md mx-auto">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
