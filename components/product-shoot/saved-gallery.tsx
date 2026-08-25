'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Star,
  Trash2,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Tag,
  Clock,
  Ratio,
  Sliders,
  Copy,
  Check,
  Clapperboard,
} from 'lucide-react';
import type { SavedProductShoot } from '@/lib/product-shoot/types';
import { PLATFORM_METAS } from '@/lib/product-shoot/dialects';

interface SavedGalleryProps {
  savedShoots: SavedProductShoot[];
  onReuse: (shoot: SavedProductShoot) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onClose: () => void;
}

export function SavedGallery({
  savedShoots,
  onReuse,
  onDelete,
  onToggleFavorite,
  onClose,
}: SavedGalleryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = savedShoots.filter((item) => {
    if (onlyFavorites && !item.isFavorite) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.productName.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.recipeLabel.toLowerCase().includes(q) ||
      item.brief.sellingPoint.toLowerCase().includes(q) ||
      item.sections.mainPrompt.toLowerCase().includes(q)
    );
  });

  const handleCopy = async (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-surface-card/90 backdrop-blur-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <Clapperboard className="w-4 h-4 text-brand" />
            Saved Product Shoots & Briefs ({savedShoots.length})
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Search previous commercial generations, copy dialects, or restore into the studio.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-xs text-text-muted hover:text-text-primary px-2.5 py-1 rounded-lg border border-border bg-surface-input"
        >
          Close History
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product, category, recipe..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-surface-input border border-border text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>

        <button
          type="button"
          onClick={() => setOnlyFavorites(!onlyFavorites)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
            onlyFavorites
              ? 'border-warning/50 bg-warning/10 text-warning'
              : 'border-border bg-surface-input text-text-muted hover:text-text-primary'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-warning' : ''}`} />
          <span>Favorites</span>
        </button>
      </div>

      {/* Items List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-text-muted">
          {savedShoots.length === 0
            ? 'No saved product shoots yet. Generate a shot package and click "Save" to build your library.'
            : 'No saved shoots match your search query.'}
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {filtered.map((shoot) => {
            const isExpanded = expandedId === shoot.id;
            const formattedDate = new Date(shoot.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={shoot.id}
                className="rounded-xl border border-border bg-surface-card hover:border-brand/30 transition-all p-4 space-y-3"
              >
                {/* Top Row: Meta & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-text-primary truncate">
                        {shoot.productName}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand/10 text-brand border border-brand/20 shrink-0">
                        {shoot.recipeLabel}
                      </span>
                      {shoot.category && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-surface-muted text-text-muted shrink-0">
                          {shoot.category}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary line-clamp-1">
                      {shoot.brief.sellingPoint || shoot.brief.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                    {/* Reuse in Studio */}
                    <button
                      type="button"
                      onClick={() => onReuse(shoot)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand text-[var(--brand-foreground)] text-xs font-semibold hover:bg-brand-hover shadow-sm transition-all min-h-[32px]"
                      title="Load this brief, recipe and controls into the active canvas"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reuse</span>
                    </button>

                    {/* Copy Main Prompt */}
                    <button
                      type="button"
                      onClick={(e) => handleCopy(shoot.id, shoot.sections.mainPrompt, e)}
                      className="p-1.5 rounded-lg border border-border bg-surface-input hover:bg-surface-muted text-text-muted hover:text-text-primary transition-colors"
                      title="Copy main prompt"
                      aria-label="Copy main prompt"
                    >
                      {copiedId === shoot.id ? (
                        <Check className="w-3.5 h-3.5 text-success" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Favorite */}
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(shoot.id)}
                      className={`p-1.5 rounded-lg border border-border bg-surface-input hover:bg-surface-muted transition-colors ${
                        shoot.isFavorite ? 'text-warning' : 'text-text-muted hover:text-warning'
                      }`}
                      title="Favorite"
                      aria-label="Toggle favorite"
                    >
                      <Star className={`w-3.5 h-3.5 ${shoot.isFavorite ? 'fill-warning' : ''}`} />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => onDelete(shoot.id)}
                      className="p-1.5 rounded-lg border border-border bg-surface-input hover:bg-surface-muted text-text-muted hover:text-danger transition-colors"
                      title="Delete saved shoot"
                      aria-label="Delete saved shoot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Thumbnail Previews if present */}
                {shoot.imageThumbnails && shoot.imageThumbnails.length > 0 && (
                  <div className="flex gap-2">
                    {shoot.imageThumbnails.map((thumb, idx) => (
                      <div
                        key={idx}
                        className="w-12 h-12 rounded-lg border border-border overflow-hidden bg-surface-muted/50"
                      >
                        <img src={thumb} alt="thumbnail" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Prompt Preview Snippet */}
                <div className="rounded-lg bg-surface-code border border-border p-2.5 text-[11px] font-mono text-text-secondary leading-relaxed line-clamp-2">
                  {shoot.sections.mainPrompt}
                </div>

                {/* Expand / Collapse Details */}
                <div>
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : shoot.id)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-brand hover:underline"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" />
                        <span>Hide details & dialects</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" />
                        <span>View all platform dialects & controls</span>
                      </>
                    )}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 pt-3 mt-2 border-t border-border/40 text-xs"
                      >
                        {/* Dialects list */}
                        <div className="space-y-2">
                          {shoot.sections.runwayPrompt && (
                            <div className="rounded-lg bg-surface-input border border-border p-2.5">
                              <div className="flex items-center justify-between mb-1 font-semibold text-[11px] text-text-primary">
                                <span>Runway Gen-3/4 Prompt</span>
                                <button
                                  type="button"
                                  onClick={(e) => handleCopy(`${shoot.id}-runway`, shoot.sections.runwayPrompt!, e)}
                                  className="text-[10px] text-text-muted hover:text-brand"
                                >
                                  {copiedId === `${shoot.id}-runway` ? 'Copied ✓' : 'Copy'}
                                </button>
                              </div>
                              <pre className="text-[11px] font-mono text-text-secondary whitespace-pre-wrap">
                                {shoot.sections.runwayPrompt}
                              </pre>
                            </div>
                          )}

                          {shoot.sections.klingPrompt && (
                            <div className="rounded-lg bg-surface-input border border-border p-2.5">
                              <div className="flex items-center justify-between mb-1 font-semibold text-[11px] text-text-primary">
                                <span>Kling 1.6/3.0 Prompt</span>
                                <button
                                  type="button"
                                  onClick={(e) => handleCopy(`${shoot.id}-kling`, shoot.sections.klingPrompt!, e)}
                                  className="text-[10px] text-text-muted hover:text-brand"
                                >
                                  {copiedId === `${shoot.id}-kling` ? 'Copied ✓' : 'Copy'}
                                </button>
                              </div>
                              <pre className="text-[11px] font-mono text-text-secondary whitespace-pre-wrap">
                                {shoot.sections.klingPrompt}
                              </pre>
                            </div>
                          )}

                          {shoot.sections.veoPrompt && (
                            <div className="rounded-lg bg-surface-input border border-border p-2.5">
                              <div className="flex items-center justify-between mb-1 font-semibold text-[11px] text-text-primary">
                                <span>Google Veo Prompt</span>
                                <button
                                  type="button"
                                  onClick={(e) => handleCopy(`${shoot.id}-veo`, shoot.sections.veoPrompt!, e)}
                                  className="text-[10px] text-text-muted hover:text-brand"
                                >
                                  {copiedId === `${shoot.id}-veo` ? 'Copied ✓' : 'Copy'}
                                </button>
                              </div>
                              <pre className="text-[11px] font-mono text-text-secondary whitespace-pre-wrap">
                                {shoot.sections.veoPrompt}
                              </pre>
                            </div>
                          )}

                          {shoot.sections.lumaPrompt && (
                            <div className="rounded-lg bg-surface-input border border-border p-2.5">
                              <div className="flex items-center justify-between mb-1 font-semibold text-[11px] text-text-primary">
                                <span>Luma Ray 2 Prompt</span>
                                <button
                                  type="button"
                                  onClick={(e) => handleCopy(`${shoot.id}-luma`, shoot.sections.lumaPrompt!, e)}
                                  className="text-[10px] text-text-muted hover:text-brand"
                                >
                                  {copiedId === `${shoot.id}-luma` ? 'Copied ✓' : 'Copy'}
                                </button>
                              </div>
                              <pre className="text-[11px] font-mono text-text-secondary whitespace-pre-wrap">
                                {shoot.sections.lumaPrompt}
                              </pre>
                            </div>
                          )}

                          {shoot.sections.minimaxPrompt && (
                            <div className="rounded-lg bg-surface-input border border-border p-2.5">
                              <div className="flex items-center justify-between mb-1 font-semibold text-[11px] text-text-primary">
                                <span>Minimax Hailuo Prompt</span>
                                <button
                                  type="button"
                                  onClick={(e) => handleCopy(`${shoot.id}-minimax`, shoot.sections.minimaxPrompt!, e)}
                                  className="text-[10px] text-text-muted hover:text-brand"
                                >
                                  {copiedId === `${shoot.id}-minimax` ? 'Copied ✓' : 'Copy'}
                                </button>
                              </div>
                              <pre className="text-[11px] font-mono text-text-secondary whitespace-pre-wrap">
                                {shoot.sections.minimaxPrompt}
                              </pre>
                            </div>
                          )}
                        </div>

                        {/* Metadata row */}
                        <div className="flex items-center justify-between text-[10px] text-text-muted font-mono pt-2 border-t border-border/40 flex-wrap gap-2">
                          <span suppressHydrationWarning>Created {formattedDate}</span>
                          <span>Model: {shoot.modelUsed}</span>
                          <span>Aspect: {shoot.creativeControls?.aspectRatio || '9:16'}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
