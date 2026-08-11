'use client';

import React, { useState } from 'react';
import {
  History,
  Search,
  Trash2,
  Copy,
  Check,
  Star,
  Play,
  Download,
  Upload,
  Sparkles,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { GlassCard } from './glass-card';
import { ConfirmModal } from './confirm-modal';
import { MarkdownRenderer } from './markdown-renderer';
import { HistoryItem } from '@/types';
import { DOMAIN_PRESETS } from '@/lib/domains';

interface HistoryPanelProps {
  historyItems: HistoryItem[];
  onSelectHistoryItem: (item: HistoryItem) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearAllHistory: () => void;
  onToggleFavorite: (id: string) => void;
  onTestPrompt: (promptText: string) => void;
  onImportHistory?: (items: HistoryItem[]) => void;
}

export function HistoryPanel({
  historyItems,
  onSelectHistoryItem,
  onDeleteHistoryItem,
  onClearAllHistory,
  onToggleFavorite,
  onTestPrompt,
  onImportHistory,
}: HistoryPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string>('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredItems = historyItems.filter((item) => {
    const matchesSearch =
      item.input.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.output.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.domainName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDomain =
      selectedDomainFilter === 'all' || item.domainId === selectedDomainFilter;

    const matchesFavorite = !favoritesOnly || item.favorite;

    return matchesSearch && matchesDomain && matchesFavorite;
  });

  const handleCopy = (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportHistory = () => {
    const blob = new Blob([JSON.stringify(historyItems, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PromptCrafter-History-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && onImportHistory) {
          onImportHistory(parsed);
        }
      } catch (err) {
        alert('Invalid JSON history file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Bar */}
      <GlassCard variant="default" className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Prompt History Vault
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {historyItems.length} Saved Prompts Stored Client-Side
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportHistory}
              disabled={historyItems.length === 0}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors disabled:opacity-40"
              title="Export History to JSON"
            >
              <Download className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <label className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">Import</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>

            {historyItems.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Bar & Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Search Box */}
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompts or topics..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Domain Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedDomainFilter}
              onChange={(e) => setSelectedDomainFilter(e.target.value)}
              className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Domains</option>
              {DOMAIN_PRESETS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Favorites Only Toggle */}
          <button
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-2 transition-all ${
              favoritesOnly
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-600 dark:text-amber-300 font-semibold'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-current' : ''}`} />
            <span>Favorites Only</span>
          </button>
        </div>
      </GlassCard>

      {/* History Items List */}
      {filteredItems.length === 0 ? (
        <GlassCard variant="subtle" className="p-8 text-center text-slate-500 dark:text-slate-400">
          <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-semibold">No prompts match your criteria.</p>
          <p className="text-xs mt-1">Try resetting search filters or generate new prompts.</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const isExpanded = expandedId === item.id;
            const formattedDate = new Date(item.timestamp).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <GlassCard
                key={item.id}
                variant={isExpanded ? 'glowing' : 'hoverable'}
                className="p-4 transition-all"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                          {item.domainName}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {formattedDate}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          • {item.providerName}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                        &quot;{item.input.topic}&quot;
                      </h4>
                    </div>

                    {/* Quick Item Actions */}
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onToggleFavorite(item.id)}
                        className={`p-1.5 rounded-lg text-slate-400 hover:text-amber-500 transition-colors ${
                          item.favorite ? 'text-amber-500 fill-amber-500' : ''
                        }`}
                        title="Favorite"
                      >
                        <Star className={`w-4 h-4 ${item.favorite ? 'fill-current' : ''}`} />
                      </button>

                      <button
                        onClick={(e) => handleCopy(item.id, item.output, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 transition-colors"
                        title="Copy Prompt"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => onDeleteHistoryItem(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <ChevronRight
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 space-y-3">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                        Engineered Prompt Output
                      </span>
                      <div className="p-3 rounded-xl bg-slate-950 text-slate-100 max-h-72 overflow-y-auto">
                        <MarkdownRenderer content={item.output} highlightPlaceholders={true} />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <button
                        onClick={() => onSelectHistoryItem(item)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Load into Generator</span>
                      </button>

                      <button
                        onClick={() => onTestPrompt(item.output)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
                        <span>Test in Sandbox</span>
                      </button>
                    </div>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Clear All Confirm Modal */}
      <ConfirmModal
        isOpen={showClearConfirm}
        title="Clear Entire Prompt History?"
        message="This action will permanently remove all saved prompts from your browser storage. This cannot be undone."
        confirmLabel="Clear History"
        onConfirm={() => {
          onClearAllHistory();
          setShowClearConfirm(false);
        }}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
}
