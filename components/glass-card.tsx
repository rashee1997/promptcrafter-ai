'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLMotionProps<'div'> {
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
    'relative rounded-3xl border transition-all duration-300 backdrop-blur-2xl';

  const variantStyles = {
    default:
      'bg-surface-card/80 border-border shadow-2xl shadow-brand/5',
    hoverable:
      'bg-surface-card/80 border-border shadow-lg hover:shadow-2xl hover:-translate-y-0.5 hover:border-brand/40 cursor-pointer',
    glowing:
      'bg-gradient-to-b from-surface-elevated to-brand-muted/50 border-brand/50 shadow-2xl shadow-brand/10 dark:shadow-orb',
    subtle:
      'bg-surface-card/50 border-border shadow-sm',
    accent:
      'bg-brand/10 border-brand/30 shadow-md',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
