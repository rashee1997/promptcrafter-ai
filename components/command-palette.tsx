'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, CornerDownLeft } from 'lucide-react';
import { useFocusTrap } from '@/lib/use-focus-trap';
import { cn } from '@/lib/utils';

export interface PaletteAction {
  id: string;
  label: string;
  hint?: string;
  icon?: React.ReactNode;
  run: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  actions: PaletteAction[];
}

export function CommandPalette({ isOpen, onClose, actions }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useFocusTrap(containerRef, isOpen);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter(
      (a) =>
        a.label.toLowerCase().includes(q) ||
        (a.hint ?? '').toLowerCase().includes(q)
    );
  }, [actions, query]);

  // Reset state and focus the input whenever the palette opens
  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    setActiveIndex(0);
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

  if (!isOpen) return null;

  const runAction = (action: PaletteAction) => {
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

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Quick actions"
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4 bg-surface-code/60 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        role="presentation"
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-border bg-surface-card shadow-2xl shadow-black/40 overflow-hidden"
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
          {filtered.map((action, i) => (
            <button
              key={action.id}
              id={`palette-opt-${action.id}`}
              type="button"
              role="option"
              aria-selected={i === activeIndex}
              data-active={i === activeIndex}
              onClick={() => runAction(action)}
              onPointerEnter={() => setActiveIndex(i)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-colors',
                i === activeIndex
                  ? 'bg-brand/10 text-text-primary border border-brand/30'
                  : 'text-text-secondary border border-transparent'
              )}
            >
              <span
                className={cn(
                  'shrink-0 w-7 h-7 rounded-lg flex items-center justify-center',
                  i === activeIndex ? 'bg-brand text-white' : 'bg-surface-muted text-text-muted'
                )}
                aria-hidden="true"
              >
                {action.icon}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-medium truncate">{action.label}</span>
                {action.hint && (
                  <span className="block text-[11px] text-text-muted truncate">{action.hint}</span>
                )}
              </span>
              <CornerDownLeft
                className={cn(
                  'w-3.5 h-3.5 shrink-0',
                  i === activeIndex ? 'text-brand' : 'text-text-muted/50'
                )}
                aria-hidden="true"
              />
            </button>
          ))}
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
      </div>
    </div>
  );
}
