import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'hoverable' | 'glowing' | 'subtle' | 'accent';
  className?: string;
}

export function GlassCard({
  children,
  variant = 'default',
  className,
  ...props
}: GlassCardProps) {
  const baseStyles =
    'relative rounded-[var(--radius)] border transition-all duration-150';

  const variantStyles = {
    default:
      'bg-surface-card border-border shadow-sm',
    hoverable:
      'bg-surface-card border-border shadow-sm hover:shadow-md cursor-pointer',
    glowing:
      'bg-surface-card border-border shadow-md',
    subtle:
      'bg-surface-muted border-border',
    accent:
      'bg-surface-elevated border-border shadow-sm',
  };

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
}
