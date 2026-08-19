'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Search, CornerDownLeft } from 'lucide-react';
import { useFocusTrap } from '@/lib/use-focus-trap';
import { useScrollLock } from '@/lib/use-scroll-lock';
import { cn } from '@/lib/utils';

export interface PaletteAction {
  id: string;
  label: string;
  hint?: string;
  icon?: React.ReactNode;
  /** Group label shown when the palette is not searching. */
  group?: string;
  /** Keyboard shortcut to display inline when available. */
  shortcut?: string;
  run: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  actions: PaletteAction[];
}

const RECENTS_KEY = 'pc:palette-recents';
const RECENTS_LIMIT = 3;

function readRecents(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(RECENTS_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(parsed) ? parsed.slice(0, RECENTS_LIMIT) : [];
  } catch {
    return [];
  }
}

function recordRecent(id: string) {
  try {
    const next = [id, ...readRecents().filter((r) => r !== id)].slice(0, RECENTS_LIMIT);
    window.localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch {
    // storage unavailable — recents simply won't persist
  }
}

/** Case-insensitive fuzzy-ish match: all query chars appear in order. */
function matchesQuery(label: string, q: string): boolean {
  if (!q) return true;
  const hay = label.toLowerCase();
  let from = 0;
  for (const ch of q) {
    const idx = hay.indexOf(ch, from);
    if (idx === -1) return false;
    from = idx + 1;
  }
  return true;
}

/** Returns the list of matched character indexes in the label. */
function matchIndexes(label: string, q: string): Set<number> {
  const set = new Set<number>();
  if (!q) return set;
  const hay = label.toLowerCase();
  let from = 0;
  for (const ch of q) {
    const idx = hay.indexOf(ch, from);
    if (idx === -1) break;
    set.add(idx);
    from = idx + 1;
  }
  return set;
}

function HighlightedLabel({ label, query }: { label: string; query: string }) {
  if (!query) return <>{label}</>;
  const hits = matchIndexes(label, query);
  if (hits.size === 0) return <>{label}</>;
  return (
    <>
      {label.split('').map((ch, i) =>
        hits.has(i) ? (
          <span key={i} className="text-brand font-bold">
            {ch}
          </span>
        ) : (
          <span key={i}>{ch}</span>
        )
      )}
    </>
  );
}

export function CommandPalette({ isOpen, onClose, actions }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [recents, setRecents] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useFocusTrap(containerRef, isOpen);
  useScrollLock(isOpen);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter(
      (a) => matchesQuery(a.label.toLowerCase(), q) || (a.hint ?? '').toLowerCase().includes(q)
    );
  }, [actions, query]);

  // Reset state, focus the input, and load recents whenever the palette opens
  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    setActiveIndex(0);
    setRecents(readRecents());
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [isOpen]);

  // Keep the highlighted index inside the filtered list as it changes
  useEffect(() => {
    setActiveIndex((i) => Math.min(i, Math.max(filtered.length - 1, 0)));
  }, [filtered.length]);

  // Keep the highlighted option visible while navigating
  useEffect(() => {
    if (!isOpen) return;
    listRef.current
      ?.querySelector<HTMLElement>('[data-active="true"]')
      ?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, isOpen]);

  const runAction = (action: PaletteAction) => {
    recordRecent(action.id);
    setRecents(readRecents());
    onClose();
    action.run();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[activeIndex]) {
      e.preventDefault();
      runAction(filtered[activeIndex]);
    }
  };

  const recentActions = useMemo(() => {
    if (query.trim()) return [];
    return recents
      .map((id) => actions.find((a) => a.id === id))
      .filter((a): a is PaletteAction => !!a);
  }, [recents, actions, query]);

  const grouped = useMemo(() => {
    if (query.trim()) return null;
    const groups = new Map<string, PaletteAction[]>();
    for (const a of actions) {
      const g = a.group || 'Actions';
      groups.set(g, [...(groups.get(g) || []), a]);
    }
    return groups;
  }, [actions, query]);

  const renderItem = (action: PaletteAction, i: number, globalActive: boolean, stagger = 0) => (
    <motion.button
      key={action.id}
      id={`palette-opt-${action.id}`}
      type="button"
      role="option"
      aria-selected={globalActive}
      data-active={globalActive}
      onClick={() => runAction(action)}
      onPointerEnter={() => setActiveIndex(i)}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.12, delay: stagger }}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-colors',
        globalActive
          ? 'bg-brand/10 text-text-primary border border-brand/30'
          : 'text-text-secondary border border-transparent'
      )}
    >
      <span
        className={cn(
          'shrink-0 w-7 h-7 rounded-lg flex items-center justify-center',
          globalActive ? 'bg-brand text-white' : 'bg-surface-muted text-text-muted'
        )}
        aria-hidden="true"
      >
        {action.icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block font-medium truncate">
          <HighlightedLabel label={action.label} query={query.trim().toLowerCase()} />
        </span>
        {action.hint && (
          <span className="block text-[11px] text-text-muted truncate">{action.hint}</span>
        )}
      </span>
      {action.shortcut && (
        <kbd className="shrink-0 px-1.5 py-0.5 rounded-md bg-surface-muted border border-border text-[10px] font-mono text-text-muted">
          {action.shortcut}
        </kbd>
      )}
      <CornerDownLeft
        className={cn(
          'w-3.5 h-3.5 shrink-0',
          globalActive ? 'text-brand' : 'text-text-muted/50'
        )}
        aria-hidden="true"
      />
    </motion.button>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Quick actions"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4 bg-overlay backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            role="presentation"
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -6 }}
            transition={{ duration: 0.28, ease: [0.34, 1.56, 0.64, 1] }}
            className="w-full max-w-lg rounded-2xl border border-border bg-surface-card shadow-lg overflow-hidden"
          >
            {/* Search input row */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
              <Search className="w-4 h-4 text-text-muted shrink-0" aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search actions…"
                aria-label="Search actions"
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-list"
                aria-activedescendant={filtered[activeIndex] ? `palette-opt-${filtered[activeIndex].id}` : undefined}
                autoComplete="off"
                className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
              />
              <kbd className="px-1.5 py-0.5 rounded-md bg-surface-muted border border-border text-[10px] font-mono text-text-muted">
                ESC
              </kbd>
            </div>

            {/* Results list */}
            <div
              id="palette-list"
              ref={listRef}
              role="listbox"
              aria-label="Actions"
              className="max-h-[46vh] overflow-y-auto p-1.5 space-y-0.5"
            >
              {filtered.length === 0 && (
                <p className="px-3 py-6 text-center text-xs text-text-muted">
                  No matching actions for “{query}”
                </p>
              )}

              {grouped ? (
                <>
                  {/* Recents */}
                  {recentActions.length > 0 && (
                    <div className="space-y-0.5">
                      <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                        Recents
                      </p>
                      {recentActions.map((action) => {
                        const globalIndex = filtered.findIndex((a) => a.id === action.id);
                        return renderItem(action, globalIndex, globalIndex === activeIndex, 0.02);
                      })}
                    </div>
                  )}
                  {/* Grouped actions */}
                  {[...grouped.entries()].map(([group, items]) => (
                    <div key={group} className="space-y-0.5">
                      <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                        {group}
                      </p>
                      {items.map((action, idx) => {
                        const globalIndex = filtered.findIndex((a) => a.id === action.id);
                        return renderItem(action, globalIndex, globalIndex === activeIndex, 0.04 + idx * 0.01);
                      })}
                    </div>
                  ))}
                </>
              ) : (
                filtered.map((action, i) => renderItem(action, i, i === activeIndex, 0.02 + i * 0.01))
              )}
            </div>

            {/* Footer hints */}
            <div className="flex items-center gap-3 px-4 py-2 border-t border-border text-[10px] text-text-muted">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-surface-muted border border-border font-mono">↑</kbd>
                <kbd className="px-1 py-0.5 rounded bg-surface-muted border border-border font-mono">↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-surface-muted border border-border font-mono">↵</kbd>
                run
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-surface-muted border border-border font-mono">⌘K</kbd>
                reopen
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
