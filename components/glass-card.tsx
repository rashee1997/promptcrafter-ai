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
      'bg-white/80 dark:bg-slate-900/40 border-slate-200/80 dark:border-white/10 shadow-2xl shadow-indigo-950/5 dark:shadow-none',
    hoverable:
      'bg-white/80 dark:bg-slate-900/40 border-slate-200/80 dark:border-white/10 shadow-lg hover:shadow-2xl hover:-translate-y-0.5 hover:border-indigo-500/40 dark:hover:border-indigo-400/40 cursor-pointer',
    glowing:
      'bg-gradient-to-b from-white/95 to-indigo-50/50 dark:from-slate-900/60 dark:to-indigo-950/30 border-indigo-300/80 dark:border-white/15 shadow-2xl shadow-indigo-500/10 dark:shadow-[0_0_30px_rgba(79,70,229,0.15)]',
    subtle:
      'bg-white/50 dark:bg-white/5 border-slate-200/50 dark:border-white/10 shadow-sm',
    accent:
      'bg-indigo-600/10 dark:bg-indigo-500/10 border-indigo-400/30 dark:border-indigo-500/30 shadow-md',
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
