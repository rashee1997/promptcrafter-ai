'use client';

import React, { useMemo, useState } from 'react';
import { Check, ChevronDown, Copy, History, RotateCcw, Search, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buildOutputTabs, ImagePromptSections, PLATFORM_OPTIONS, SavedImagePrompt } from '@/lib/image-prompts';
import { useInlineCopy } from '@/lib/use-inline-copy';

interface SavedGalleryProps {
  items: SavedImagePrompt[];
  onDelete: (id: string) => void;
  onClear: () => void;
  /** Load a saved brief back into the studio form (gallery → edit loop). */
  onRestore: (item: SavedImagePrompt) => void;
}

function timeAgo(ts: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'yesterday' : `${d}d ago`;
}

/** Rebuild a pseudo-sections object from a saved brief (backward compatible). */
function savedSections(item: SavedImagePrompt): ImagePromptSections {
  return {
    raw: '',
    master: item.master,
    negative: item.negative,
    ...(item.sections ?? {}),
  };
}

/**
 * History & gallery for image prompts: searchable, expandable previews of
 * every saved brief, per-section copy buttons, and one-click reuse back into
 * the studio. Research-backed UX: recognition over recall (labels + previews
 * instead of memory), feedback near the action (inline "Copied ✓"), and a
 * gallery → edit loop like Midjourney/Leonardo.
 */
export function SavedGallery({ items, onDelete, onClear, onRestore }: SavedGalleryProps) {
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { copiedKey, copy } = useInlineCopy();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const hay = `${item.title} ${item.subject} ${item.styleLabel} ${item.platforms
        .map((p) => PLATFORM_OPTIONS.find((o) => o.id === p)?.label ?? p)
        .join(' ')}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-brand" />
          Saved briefs
          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-surface-muted border border-border text-text-muted">
            {items.length}
          </span>
        </h3>
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search briefs…"
              aria-label="Search saved briefs"
              className="w-44 sm:w-56 pl-8 pr-3 py-1.5 rounded-lg text-xs bg-surface-input border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/70 transition-shadow"
            />
          </div>
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Clear all
          </button>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-xs text-text-muted py-4 text-center">
          {items.length === 0 ? 'No saved briefs yet — generate one and hit "Save to gallery".' : 'No saved briefs match your search.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((item) => {
            const pseudo = savedSections(item);
            const tabs = buildOutputTabs(pseudo);
            const expanded = expandedId === item.id;
            const masterCopied = copiedKey === `${item.id}:master`;

            return (
              <div
                key={item.id}
                className="group rounded-xl border border-border bg-surface-card/70 backdrop-blur-xl p-3.5 hover:border-brand/40 transition-colors flex flex-col gap-2.5"
              >
                {/* Title + age */}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-text-primary truncate" title={item.title}>
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-[10px] text-text-muted">
                    {item.styleLabel} · {item.aspectRatio} · {timeAgo(item.createdAt)}
                  </p>
                </div>

                {/* Platform chips */}
                <div className="flex flex-wrap gap-1">
                  {item.platforms.slice(0, 5).map((p) => (
                    <span
                      key={p}
                      className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-brand/10 text-brand border border-brand/20"
                    >
                      {PLATFORM_OPTIONS.find((o) => o.id === p)?.label ?? p}
                    </span>
                  ))}
                </div>

                {/* Preview */}
                <div className="relative">
                  <div
                    className={cn(
                      'rounded-lg border border-border bg-surface-code p-2.5 overflow-hidden transition-all',
                      expanded ? 'max-h-72 overflow-y-auto scrollbar-thin' : 'max-h-20'
                    )}
                  >
                    {expanded ? (
                      <div className="space-y-2">
                        {tabs.map((t) => {
                          const content = pseudo[t.key] ?? '';
                          const copied = copiedKey === `${item.id}:${t.key}`;
                          return (
                            <div key={t.key} className="rounded-lg border border-border/70 bg-surface-card/40 p-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted">
                                  {t.label}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => copy(content, `${item.id}:${t.key}`)}
                                  aria-label={`Copy ${t.label} from saved brief`}
                                  className={cn(
                                    'flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-semibold border transition-all',
                                    copied
                                      ? 'bg-success/10 border-success/40 text-success'
                                      : 'bg-surface-card border-border text-text-muted hover:text-brand hover:border-brand/40'
                                  )}
                                >
                                  {copied ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                                  {copied ? 'Copied' : 'Copy'}
                                </button>
                              </div>
                              <p className="mt-1 text-[11px] font-mono text-text-primary whitespace-pre-wrap leading-relaxed">
                                {content}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[11px] font-mono text-text-primary whitespace-pre-wrap leading-relaxed line-clamp-3">
                        {item.master}
                      </p>
                    )}
                  </div>
                  {!expanded && (
                    <div className="absolute inset-x-0 bottom-0 h-6 rounded-b-lg bg-gradient-to-t from-surface-code to-transparent pointer-events-none" />
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 mt-auto pt-1">
                  <button
                    type="button"
                    onClick={() => onRestore(item)}
                    title="Load this brief back into the studio"
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-brand/10 text-brand border border-brand/25 hover:bg-brand/15 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reuse
                  </button>
                  <button
                    type="button"
                    onClick={() => copy(item.master, `${item.id}:master`)}
                    className={cn(
                      'flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border transition-colors',
                      masterCopied
                        ? 'bg-success/10 border-success/40 text-success'
                        : 'bg-surface-muted text-text-muted border-border hover:text-brand hover:border-brand/40'
                    )}
                  >
                    {masterCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {masterCopied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : item.id)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-surface-muted text-text-muted border border-border hover:text-text-primary hover:border-brand/40 transition-colors ml-auto"
                    aria-expanded={expanded}
                  >
                    <ChevronDown className={cn('w-3 h-3 transition-transform', expanded && 'rotate-180')} />
                    {expanded ? 'Less' : 'Preview'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    aria-label="Delete saved brief"
                    className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
