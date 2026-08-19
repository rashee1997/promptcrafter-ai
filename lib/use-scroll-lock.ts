import { useEffect } from 'react';

/**
 * Locks body scrolling while an overlay (modal, palette, menu) is active,
 * restoring the previous overflow value on cleanup. DESIGN.md §11 — dialogs
 * must not scroll the page behind them.
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [active]);
}
