'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DOMAIN_PRESETS } from '@/lib/domains';
import { suggestExamples } from '@/lib/ai-client';
import { ImagePromptInput, PromptInput } from '@/types';

type ExamplesModule = 'text' | 'image' | 'logo';

/**
 * Hybrid demo-prompt suggestions: renders the static fallback instantly, then
 * quietly upgrades the chip row with AI-refreshed, context-aware examples.
 *
 * - Fires on mount and whenever the debounced (600ms) hash of the *selection*
 *   fields changes — free-text keystrokes (subject, wordmark) never refire it.
 * - Caches the last response per context hash (in-memory, module-scoped) so
 *   flipping between two option combos doesn't refetch.
 * - Never blocks: failures keep the static array and are invisible to the UI.
 */
export function useDynamicExamples(
  module: ExamplesModule,
  contextInput: Partial<ImagePromptInput> | Partial<PromptInput> | undefined,
  staticFallback: string[]
) {
  const cacheRef = useRef<Map<string, string[]>>(new Map());
  const forceRef = useRef(false);
  const latestHashRef = useRef('');
  const [examples, setExamples] = useState<string[]>(staticFallback);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshNonce, setRefreshNonce] = useState(0);

  /** Only chip/preset selections count toward the hash — not subject text. */
  const hash = useMemo(() => {
    if (module === 'text') {
      const p = (contextInput || {}) as Partial<PromptInput>;
      return JSON.stringify([
        'text',
        p.domainId ?? null,
        p.tone ?? null,
        p.framework ?? null,
        p.targetAudience?.trim() || null,
      ]);
    }
    const i = (contextInput || {}) as Partial<ImagePromptInput>;
    return JSON.stringify([
      module,
      i.style ?? null,
      i.logoStyle ?? null,
      i.lighting ?? null,
      i.mood ?? null,
      i.composition ?? null,
      i.camera ?? null,
      i.colorGrade ?? null,
      i.resolution ?? null,
      i.aspectRatio ?? null,
      i.platforms ? [...i.platforms].sort() : null,
      i.industry ?? null,
      i.logoType ?? null,
      i.palette ?? null,
      i.concept ?? null,
      i.shapeLanguage ?? null,
      i.typography ?? null,
      i.lockup ?? null,
      i.hiddenMeaning ?? null,
      i.usage ? [...i.usage].sort() : null,
      i.boldness ?? null,
    ]);
  }, [module, contextInput]);

  /** Text module only — the selected domain name, looked up from the preset id. */
  const domainName = useMemo(() => {
    if (module !== 'text') return undefined;
    const p = (contextInput || {}) as Partial<PromptInput>;
    return DOMAIN_PRESETS.find((d) => d.id === p.domainId)?.name;
  }, [module, contextInput]);

  const count = staticFallback.length > 0 ? staticFallback.length : 4;

  useEffect(() => {
    const force = forceRef.current;
    forceRef.current = false;

    // Nothing about the selection changed (and no manual refresh) — skip.
    if (latestHashRef.current === hash && !force) return;
    latestHashRef.current = hash;

    const key = `${module}:${hash}`;
    const cached = cacheRef.current.get(key);
    if (cached && !force) {
      setExamples(cached);
      return;
    }

    const timer = setTimeout(
      async () => {
        setIsRefreshing(true);
        try {
          const p = contextInput as Partial<PromptInput> | undefined;
          const response = await suggestExamples({
            module,
            domainId: module === 'text' ? p?.domainId : undefined,
            domainName,
            currentInput: contextInput,
            count,
          });
          // A newer selection superseded this response — drop it.
          if (latestHashRef.current !== hash) return;
          if (response.examples.length > 0) {
            cacheRef.current.set(key, response.examples);
            setExamples(response.examples);
          }
        } finally {
          if (latestHashRef.current === hash) setIsRefreshing(false);
        }
      },
      force ? 0 : 600
    );
    return () => clearTimeout(timer);
  }, [module, hash, domainName, count, contextInput, refreshNonce, staticFallback]);

  /** Manual refresh — always fetches fresh suggestions, bypassing the cache. */
  const refresh = useCallback(() => {
    forceRef.current = true;
    setRefreshNonce((n) => n + 1);
  }, []);

  return { examples, isRefreshing, refresh };
}
