'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Inline clipboard feedback for copy buttons (DESIGN.md pattern: copy actions
 * show a "copied" check state near the action rather than only toasting).
 *
 * `copy(text, key)` writes to the clipboard and remembers which `key` was
 * copied; `copiedKey` lets each button flip to a ✓ state for a moment.
 * Returns false when the clipboard write is denied so callers can react.
 */
export function useInlineCopy(resetMs = 1600) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const copy = useCallback(
    async (text: string, key: string): Promise<boolean> => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedKey(key);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopiedKey(null), resetMs);
        return true;
      } catch {
        return false;
      }
    },
    [resetMs]
  );

  return { copiedKey, copy };
}
