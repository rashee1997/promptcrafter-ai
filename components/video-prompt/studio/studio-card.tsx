'use client';

import React from 'react';
import { Lock, Pencil, RefreshCcw, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/tooltip';

/**
 * Phase 8 — StudioCard: the single card primitive for every "thing you review
 * and confirm" across the studio. Same corner radius, same header treatment,
 * same action-icon placement, same token usage.
 *
 * Variants:
 *   - default: standard card (bg-surface-card, border-border)
 *   - elevated: floating surfaces (menus, modals)
 *   - brand: brand-tinted cards (drafts, highlights)
 *   - warning: warning-tinted cards (style conflicts, suggestions)
 *   - danger: destructive context
 *   - muted: subtle inset cards
 */
interface StudioCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'brand' | 'warning' | 'danger' | 'muted';
  locked?: boolean;
  className?: string;
}

const VARIANT_CLASSES: Record<NonNullable<StudioCardProps['variant']>, string> = {
  default: 'bg-surface-card/80 border-border',
  elevated: 'bg-surface-elevated/80 border-border shadow-lg',
  brand: 'bg-brand/5 border-brand/25',
  warning: 'bg-warning/5 border-warning/25',
  danger: 'bg-danger/5 border-danger/25',
  muted: 'bg-surface-muted/60 border-border/70',
};

export function StudioCard({
  children,
  variant = 'default',
  locked = false,
  className,
}: StudioCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-2xl border backdrop-blur-xl p-4 space-y-3 transition-all duration-200',
        VARIANT_CLASSES[variant],
        locked && 'opacity-90',
        className,
      )}
    >
      {/* 1px top shine highlight — glass stack */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent"
      />
      {children}
    </div>
  );
}

/**
 * StudioCard.Header — consistent header treatment: title left, status/tag
 * chips right, action icons top-right.
 */
interface StudioCardHeaderProps {
  icon: React.ReactNode;
  iconTone?: 'brand' | 'accent' | 'warning' | 'danger' | 'success';
  title: string;
  count?: number;
  countLabel?: string;
  locked?: boolean;
  lockedLabel?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

const ICON_TONE_CLASSES: Record<string, string> = {
  brand: 'text-brand',
  accent: 'text-accent',
  warning: 'text-warning',
  danger: 'text-danger',
  success: 'text-success',
};

export function StudioCardHeader({
  icon,
  iconTone = 'brand',
  title,
  count,
  countLabel,
  locked = false,
  lockedLabel,
  actions,
  children,
}: StudioCardHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-2 flex-wrap">
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={cn('flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted')}>
          <span className={cn('w-3.5 h-3.5', ICON_TONE_CLASSES[iconTone])} aria-hidden="true">
            {icon}
          </span>
          {title}
        </span>
        {count !== undefined && (
          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-surface-muted text-text-muted border border-border tabular-nums">
            {count} {countLabel ?? ''}
          </span>
        )}
        {locked && lockedLabel && (
          <Tooltip label={lockedLabel}>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-surface-muted text-text-muted border border-border">
              <Lock className="w-2.5 h-2.5" aria-hidden="true" />
              Locked
            </span>
          </Tooltip>
        )}
        {children}
      </div>
      {actions && <div className="flex items-center gap-0.5 shrink-0">{actions}</div>}
    </div>
  );
}

/**
 * StudioCard.ActionButton — consistent action icon button for the top-right row.
 */
interface StudioCardActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'danger' | 'brand' | 'success';
  className?: string;
}

const ACTION_VARIANT_CLASSES = {
  default: 'text-text-muted hover:text-brand hover:bg-surface-hover',
  danger: 'text-text-muted hover:text-danger hover:bg-danger/10',
  brand: 'text-text-muted hover:text-brand hover:bg-brand/10',
  success: 'text-text-muted hover:text-success hover:bg-success/10',
};

export function StudioCardActionButton({
  icon,
  label,
  onClick,
  disabled = false,
  variant = 'default',
  className,
}: StudioCardActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        'p-1 rounded-md transition-colors',
        ACTION_VARIANT_CLASSES[variant],
        disabled && 'opacity-30 cursor-not-allowed',
        className,
      )}
    >
      {icon}
    </button>
  );
}
