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
  GitCommit,
  Edit3,
  GitCompare,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { GlassCard } from './glass-card';
import { ConfirmModal } from './confirm-modal';
import { MarkdownRenderer } from './markdown-renderer';
import { PromptVersion, Session } from '@/types';
import { DOMAIN_PRESETS } from '@/lib/domains';
import { computeWordDiff } from '@/lib/diff';

interface HistoryPanelProps {
  sessions: Session[];
  onSelectSession: (session: Session, versionId?: string) => void;
  onDeleteSession: (id: string) => void;
  onDeleteVersion: (sessionId: string, versionId: string) => void;
  onClearAllSessions: () => void;
  onToggleFavorite: (id: string) => void;
  onRenameVersion: (sessionId: string, versionId: string, newName: string) => void;
  onTestPrompt: (promptText: string) => void;
  onImportSessions?: (sessions: Session[]) => void;
}

export function HistoryPanel({
  sessions,
  onSelectSession,
  onDeleteSession,
  onDeleteVersion,
  onClearAllSessions,
  onToggleFavorite,
  onRenameVersion,
  onTestPrompt,
  onImportSessions,
}: HistoryPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string>('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [copiedVersionId, setCopiedVersionId] = useState<string | null>(null);

  // Inline name editing state: { sessionId, versionId, name }
  const [editingVersion, setEditingVersion] = useState<{
    sessionId: string;
    versionId: string;
    name: string;
  } | null>(null);

  // Diff comparison state for expanded session: { sessionId, versionAId, versionBId }
  const [diffState, setDiffState] = useState<{
    sessionId: string | null;
    versionAId: string;
    versionBId: string;
  }>({ sessionId: null, versionAId: '', versionBId: '' });

  const filteredSessions = sessions.filter((s) => {
    const topicMatch = s.originalInput?.topic?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const titleMatch = s.title.toLowerCase().includes(searchQuery.toLowerCase());
    const domainMatch = s.domainName.toLowerCase().includes(searchQuery.toLowerCase());
    const contentMatch = s.versions.some((v) =>
      v.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const matchesSearch = !searchQuery || topicMatch || titleMatch || domainMatch || contentMatch;
    const matchesDomain = selectedDomainFilter === 'all' || s.domainId === selectedDomainFilter;
    const matchesFavorite = !favoritesOnly || s.favorite;

    return matchesSearch && matchesDomain && matchesFavorite;
  });

  const handleCopy = (versionId: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedVersionId(versionId);
    setTimeout(() => setCopiedVersionId(null), 2000);
  };

  const handleExportSessions = () => {
    const blob = new Blob([JSON.stringify(sessions, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PromptCrafter-Sessions-${Date.now()}.json`;
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
        if (Array.isArray(parsed) && onImportSessions) {
          onImportSessions(parsed);
        }
      } catch (err) {
        alert('Invalid JSON sessions file');
      }
    };
    reader.readAsText(file);
  };

  const handleSaveRename = (sessionId: string, versionId: string) => {
    if (editingVersion && editingVersion.name.trim()) {
      onRenameVersion(sessionId, versionId, editingVersion.name.trim());
    }
    setEditingVersion(null);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Bar */}
      <GlassCard variant="default" className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand/10 text-brand border border-brand/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">
                Threaded Prompt Sessions
              </h2>
              <p className="text-xs text-text-muted">
                {sessions.length} Session Threads ({sessions.reduce((acc, s) => acc + s.versions.length, 0)} Total Versions)
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportSessions}
              disabled={sessions.length === 0}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface-card/80 border border-border hover:border-brand/40 text-text-secondary flex items-center gap-1.5 transition-colors disabled:opacity-40"
              title="Export Sessions to JSON"
            >
              <Download className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <label className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface-card/80 border border-border hover:border-brand/40 text-text-secondary flex items-center gap-1.5 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">Import</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>

            {sessions.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-danger/10 border border-danger/20 text-rose-600 dark:text-danger hover:bg-danger/20 flex items-center gap-1.5 transition-colors"
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
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics, prompts, or versions..."
              aria-label="Search sessions"
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          {/* Domain Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <select
              value={selectedDomainFilter}
              onChange={(e) => setSelectedDomainFilter(e.target.value)}
              className="w-full p-2 text-xs rounded-xl border border-border bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
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
            aria-pressed={favoritesOnly}
            className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-2 transition-all ${
              favoritesOnly
                ? 'bg-warning/20 border-warning/40 text-warning font-semibold'
                : 'bg-surface-card border-border text-text-secondary'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-current' : ''}`} />
            <span>Favorites Only</span>
          </button>
        </div>
      </GlassCard>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <GlassCard variant="subtle" className="p-8 text-center text-text-muted">
          <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-semibold">No prompt sessions match your criteria.</p>
          <p className="text-xs mt-1">Try resetting search filters or generate new prompts.</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((session) => {
            const isExpanded = expandedSessionId === session.id;
            const formattedDate = new Date(session.updatedAt).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            const activeVersion =
              session.versions.find((v) => v.id === session.activeVersionId) ||
              session.versions[session.versions.length - 1];

            const isDiffActive = diffState.sessionId === session.id;

            return (
              <GlassCard
                key={session.id}
                variant={isExpanded ? 'glowing' : 'hoverable'}
                className="p-4 transition-all space-y-3"
              >
                {/* Session Card Summary Bar */}
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                    aria-expanded={isExpanded}
                    aria-controls={`session-thread-${session.id}`}
                    className="flex-1 min-w-0 text-left cursor-pointer"
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-brand/10 text-brand border border-brand/20">
                        {session.domainName}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-surface-hover text-text-secondary border border-border">
                        {session.versions.length} {session.versions.length === 1 ? 'Version' : 'Versions'}
                      </span>
                      <span className="text-[11px] text-text-muted">
                        Updated {formattedDate}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-text-primary line-clamp-1">
                      &quot;{session.title}&quot;
                    </h4>
                    <p className="text-xs text-text-muted  line-clamp-1 mt-0.5">
                      Latest: v{activeVersion?.versionNumber} ({activeVersion?.name})
                    </p>
                  </button>

                  {/* Quick Session Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onToggleFavorite(session.id)}
                      className={`p-1.5 rounded-lg text-text-muted hover:text-warning transition-colors ${
                        session.favorite ? 'text-warning fill-amber-500' : ''
                      }`}
                      title="Favorite Session"
                      aria-label={session.favorite ? 'Remove session from favorites' : 'Mark session as favorite'}
                      aria-pressed={!!session.favorite}
                    >
                      <Star className={`w-4 h-4 ${session.favorite ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      onClick={() => onDeleteSession(session.id)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-rose-500 transition-colors"
                      title="Delete Session"
                      aria-label="Delete session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <ChevronRight
                      aria-hidden="true"
                      className={`w-4 h-4 text-text-muted transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Expanded Session Thread Details */}
                {isExpanded && (
                  <div
                    id={`session-thread-${session.id}`}
                    className="pt-3 border-t border-border space-y-4"
                  >
                    {/* Diff Mode Toggle & Selector Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-surface-muted p-2.5 rounded-xl border border-border">
                      <div className="flex items-center gap-2">
                        <GitCompare className="w-4 h-4 text-brand" />
                        <span className="text-xs font-bold text-text-primary">
                          Compare Versions (Diff)
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          if (isDiffActive) {
                            setDiffState({ sessionId: null, versionAId: '', versionBId: '' });
                          } else {
                            const vA = session.versions[0]?.id || '';
                            const vB = session.versions[session.versions.length - 1]?.id || '';
                            setDiffState({ sessionId: session.id, versionAId: vA, versionBId: vB });
                          }
                        }}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                          isDiffActive
                            ? 'bg-brand text-white border-brand'
                            : 'bg-surface-code text-text-secondary hover:bg-surface-hover border-border'
                        }`}
                        aria-pressed={isDiffActive}
                      >
                        {isDiffActive ? 'Hide Diff' : 'Toggle Diff View'}
                      </button>
                    </div>

                    {/* Diff Output Box */}
                    {isDiffActive && (
                      <div className="space-y-3 p-3 rounded-xl bg-surface-code border border-brand/30">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="block text-[11px] font-semibold text-text-muted mb-1">
                              Version A (Original)
                            </label>
                            <select
                              value={diffState.versionAId}
                              onChange={(e) =>
                                setDiffState({ ...diffState, versionAId: e.target.value })
                              }
                              className="w-full p-1.5 text-xs rounded-lg bg-surface-code border border-border text-text-primary"
                            >
                              {session.versions.map((v) => (
                                <option key={v.id} value={v.id}>
                                  v{v.versionNumber}: {v.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-text-muted mb-1">
                              Version B (Newer)
                            </label>
                            <select
                              value={diffState.versionBId}
                              onChange={(e) =>
                                setDiffState({ ...diffState, versionBId: e.target.value })
                              }
                              className="w-full p-1.5 text-xs rounded-lg bg-surface-code border border-border text-text-primary"
                            >
                              {session.versions.map((v) => (
                                <option key={v.id} value={v.id}>
                                  v{v.versionNumber}: {v.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Rendered Word Diff */}
                        <div className="p-3 rounded-lg bg-surface-code text-xs font-mono leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
                          {(() => {
                            const verA = session.versions.find((v) => v.id === diffState.versionAId);
                            const verB = session.versions.find((v) => v.id === diffState.versionBId);
                            if (!verA || !verB) return <span>Select versions to compare.</span>;

                            const diffs = computeWordDiff(verA.content, verB.content);
                            return diffs.map((chunk, idx) => {
                              if (chunk.added) {
                                return (
                                  <span
                                    key={idx}
                                    className="bg-success/25 text-success font-bold px-0.5 rounded"
                                  >
                                    {chunk.value}
                                  </span>
                                );
                              }
                              if (chunk.removed) {
                                return (
                                  <span
                                    key={idx}
                                    className="bg-danger/25 text-danger line-through px-0.5 rounded opacity-70"
                                  >
                                    {chunk.value}
                                  </span>
                                );
                              }
                              return <span key={idx}>{chunk.value}</span>;
                            });
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Versions List */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                        Thread Version History
                      </span>

                      {session.versions.map((ver) => {
                        const isEditingThis =
                          editingVersion?.sessionId === session.id &&
                          editingVersion?.versionId === ver.id;

                        const SourceIcon =
                          ver.sourceType === 'initial'
                            ? Sparkles
                            : ver.sourceType === 'manual-edit'
                            ? Edit3
                            : RefreshCw;

                        return (
                          <div
                            key={ver.id}
                            className="p-3 rounded-xl bg-surface-muted border border-border hover:border-border transition-all space-y-2"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-brand/30 text-brand border border-brand/30">
                                  v{ver.versionNumber}
                                </span>

                                <span className="p-1 rounded bg-surface-hover text-text-muted">
                                  <SourceIcon className="w-3.5 h-3.5 text-brand" />
                                </span>

                                {/* Editable Version Name */}
                                {isEditingThis ? (
                                  <div className="flex items-center gap-1 flex-1">
                                    <input
                                      type="text"
                                      value={editingVersion.name}
                                      onChange={(e) =>
                                        setEditingVersion({
                                          ...editingVersion,
                                          name: e.target.value,
                                        })
                                      }
                                      className="px-2 py-0.5 text-xs rounded bg-surface-code border border-brand text-white focus:outline-none"
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => handleSaveRename(session.id, ver.id)}
                                      className="p-1 text-success hover:text-success"
                                      title="Save Name"
                                      aria-label="Save version name"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                    <span className="text-xs font-bold text-text-primary truncate">
                                      {ver.name}
                                    </span>
                                    <button
                                      onClick={() =>
                                        setEditingVersion({
                                          sessionId: session.id,
                                          versionId: ver.id,
                                          name: ver.name,
                                        })
                                      }
                                      className="p-1 text-text-muted hover:text-brand opacity-60 hover:opacity-100 transition-opacity"
                                      title="Rename Version"
                                      aria-label={`Rename version ${ver.versionNumber}`}
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0 text-[11px] text-text-muted">
                                <span>~{ver.stats?.estTokens || 0} tokens</span>
                                <span>•</span>
                                <span>{ver.stats?.wordCount || 0} words</span>
                              </div>
                            </div>

                            {/* Refinement instruction if present */}
                            {ver.refinementInstruction && (
                              <p className="text-[11px] italic text-brand/80 bg-brand/10 p-1.5 rounded-lg border border-brand/20">
                                Instruction: &quot;{ver.refinementInstruction}&quot;
                              </p>
                            )}

                            {/* Actions for this Version */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/60">
                              <button
                                onClick={() => onSelectSession(session, ver.id)}
                                className="px-3 py-1 rounded-lg text-xs font-semibold bg-brand text-white hover:bg-indigo-500 flex items-center gap-1 shadow-sm transition-colors"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>Load in Generator</span>
                              </button>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => handleCopy(ver.id, ver.content, e)}
                                  className="p-1.5 rounded-lg text-text-muted hover:text-brand transition-colors"
                                  title="Copy Version Prompt"
                                  aria-label={`Copy version ${ver.versionNumber} prompt`}
                                >
                                  {copiedVersionId === ver.id ? (
                                    <Check className="w-3.5 h-3.5 text-success" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>

                                <button
                                  onClick={() => onTestPrompt(ver.content)}
                                  className="p-1.5 rounded-lg text-text-muted hover:text-success transition-colors"
                                  title="Test in Sandbox"
                                  aria-label={`Test version ${ver.versionNumber} in sandbox`}
                                >
                                  <Play className="w-3.5 h-3.5" />
                                </button>

                                {session.versions.length > 1 && (
                                  <button
                                    onClick={() => onDeleteVersion(session.id, ver.id)}
                                    className="p-1.5 rounded-lg text-text-muted hover:text-danger transition-colors"
                                    title="Delete Version"
                                    aria-label={`Delete version ${ver.versionNumber}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
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
        title="Clear Entire Prompt Session History?"
        message="This action will permanently remove all saved sessions and prompt threads from your browser storage. This cannot be undone."
        confirmLabel="Clear All Sessions"
        onConfirm={() => {
          onClearAllSessions();
          setShowClearConfirm(false);
        }}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
}
