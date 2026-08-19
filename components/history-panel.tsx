'use client';

import React, { useEffect, useState } from 'react';
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
import { PromptVersion, ProviderConfig, Session } from '@/types';
import { DOMAIN_PRESETS } from '@/lib/domains';
import { computeWordDiff } from '@/lib/diff';
import { evaluatePromptQuality } from '@/lib/ai-client';
import { setVersionQuality } from '@/lib/storage';
import { PASS_THRESHOLD, buildEvaluationContext, isComparableQuality } from '@/lib/prompt-quality';
import { toast } from '@/components/toast';
import { Sparkline } from '@/components/sparkline';

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
  /** F6 — current provider used to re-verify prompt health. */
  activeProvider: ProviderConfig;
  /** F6 — propagate storage updates (new quality scores) back to the page. */
  onSessionUpdate?: (session: Session) => void;
  /** Deep link from the workspace version picker: open this session's diff for the given versions. */
  pendingDiff?: { sessionId: string; versionAId: string; versionBId: string } | null;
  /** Called once a pending diff has been applied (so the page can clear it). */
  onPendingDiffHandled?: () => void;
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
  activeProvider,
  onSessionUpdate,
  pendingDiff,
  onPendingDiffHandled,
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

  // Diff comparison state for expanded session: { sessionId, versionAId, versionBId, diffMode }
  const [diffState, setDiffState] = useState<{
    sessionId: string | null;
    versionAId: string;
    versionBId: string;
    diffMode: 'unified' | 'split';
  }>({ sessionId: null, versionAId: '', versionBId: '', diffMode: 'unified' });

  // F6 — per-session prompt-health re-verification state
  const [reVerify, setReVerify] = useState<
    Record<string, { checking: boolean; oldScore: number | null; newScore: number | null; message?: string }>
  >({});

  // Deep link from the workspace version picker — apply + expand the target session once.
  useEffect(() => {
    if (!pendingDiff) return;
    setExpandedSessionId(pendingDiff.sessionId);
    setDiffState({
      sessionId: pendingDiff.sessionId,
      versionAId: pendingDiff.versionAId,
      versionBId: pendingDiff.versionBId,
      diffMode: 'split',
    });
    onPendingDiffHandled?.();
  }, [pendingDiff, onPendingDiffHandled]);

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
        toast.error("Couldn't read that file", 'Choose a valid PromptCrafter export file.');
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

  // F6 — re-run the AI judge against the active version and compare with the
  // stored score. The stored score is preserved in the version's score history
  // (setVersionQuality appends), so the baseline used for drift detection is
  // never destroyed by the recheck itself.
  const handleReVerify = async (session: Session) => {
    const activeVersion =
      session.versions.find((v) => v.id === session.activeVersionId) ||
      session.versions[session.versions.length - 1];
    if (!activeVersion) return;

    const oldQuality = activeVersion.quality ?? null;
    const oldScore = oldQuality?.overall ?? null;
    setReVerify((prev) => ({
      ...prev,
      [session.id]: { checking: true, oldScore, newScore: null },
    }));

    const quality = await evaluatePromptQuality(
      activeProvider,
      activeVersion.content,
      buildEvaluationContext(session)
    );
    if (!quality) {
      setReVerify((prev) => ({
        ...prev,
        [session.id]: { checking: false, oldScore, newScore: null, message: 'Couldn\'t recheck — check your connection.' },
      }));
      return;
    }

    try {
      const updated = await setVersionQuality(session.id, activeVersion.id, quality);
      onSessionUpdate?.(updated);
    } catch {
      // storage failure — still show the computed result
    }

    const delta = oldScore !== null ? quality.overall - oldScore : null;
    const comparable = !!oldQuality && isComparableQuality(oldQuality, quality);
    let message: string;
    if (delta === null) {
      message = `Scored ${quality.overall}/100.`;
    } else if (!comparable) {
      message = `Score updated: ${oldScore} → ${quality.overall} (judge changed — not a direct comparison).`;
    } else if (Math.abs(delta) >= 8) {
      message = `⚠ Quality changed: ${oldScore} → ${quality.overall} (${delta > 0 ? '+' : ''}${delta} pts).`;
    } else {
      message = `Stable: ${oldScore} → ${quality.overall} (${delta > 0 ? '+' : ''}${delta} pts).`;
    }

    setReVerify((prev) => ({
      ...prev,
      [session.id]: { checking: false, oldScore, newScore: quality.overall, message },
    }));
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
                Saved prompts
              </h2>
              <p className="text-xs text-text-muted">
                {sessions.length} saved prompt{sessions.length === 1 ? '' : 's'} · {sessions.reduce((acc, s) => acc + s.versions.length, 0)} version{sessions.reduce((acc, s) => acc + s.versions.length, 0) === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportSessions}
              disabled={sessions.length === 0}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface-card/80 border border-border hover:border-brand/40 text-text-secondary flex items-center gap-1.5 transition-colors disabled:opacity-40"
              title="Export saved prompts"
            >
              <Download className="w-3.5 h-3.5 text-brand" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <label className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface-card/80 border border-border hover:border-brand/40 text-text-secondary flex items-center gap-1.5 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5 text-brand" />
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
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-danger/10 border border-danger/20 text-danger hover:bg-danger/20 flex items-center gap-1.5 transition-colors"
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
              placeholder="Search saved prompts..."
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
              <option value="all">All use cases</option>
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
            <span>Favorites only</span>
          </button>
        </div>
      </GlassCard>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <GlassCard variant="subtle" className="p-10 text-center text-text-muted">
          <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-semibold">No saved prompts match your search.</p>
          <p className="text-xs mt-1">Try a different search or create a new prompt.</p>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event('pc:new-prompt'))}
            className="mt-5 px-4 py-2 rounded-xl text-xs font-bold bg-brand hover:bg-brand-hover text-white shadow-glow transition-all active:scale-[0.985]"
          >
            Create a prompt
          </button>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((session) => {
            const rv = reVerify[session.id];
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
                        {session.versions.length} {session.versions.length === 1 ? 'version' : 'versions'}
                      </span>
                      <span className="text-[11px] text-text-muted">
                        Updated {formattedDate}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-text-primary line-clamp-1">
                      &quot;{session.title}&quot;
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      <p className="text-xs text-text-muted line-clamp-1">
                        Latest: v{activeVersion?.versionNumber} ({activeVersion?.name})
                      </p>

                      {/* F6 — stored quality badge */}
                      {activeVersion?.quality && (
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${
                            activeVersion.quality.overall >= PASS_THRESHOLD
                              ? 'bg-success/10 border-success/25 text-success'
                              : activeVersion.quality.overall >= 50
                              ? 'bg-warning/10 border-warning/25 text-warning'
                              : 'bg-danger/10 border-danger/25 text-danger'
                          }`}
                          title={`Health: ${activeVersion.quality.overall}/100`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
                          Quality {activeVersion.quality.overall}/100
                        </span>
                      )}

                      {/* F6 — model changed since the score was stored */}
                      {activeVersion?.quality && activeProvider.model !== activeVersion.modelUsed && (
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-warning/10 border border-warning/25 text-warning">
                          Model changed to {activeProvider.model} — recheck
                        </span>
                      )}
                    </div>

                    {/* F6 — re-verification result / drift alert chip */}
                    {rv?.message && (
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 mt-1 rounded-md text-[10px] font-bold border ${
                          rv.message.includes('Quality changed')
                            ? 'bg-warning/10 border-warning/25 text-warning'
                            : rv.message.includes("Couldn't")
                            ? 'bg-danger/10 border-danger/25 text-danger'
                            : 'bg-success/10 border-success/25 text-success'
                        }`}
                      >
                        {rv.message}
                      </span>
                    )}
                  </button>

                  {/* Quick Session Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onToggleFavorite(session.id)}
                      className={`p-1.5 rounded-lg text-text-muted hover:text-warning transition-colors ${
                        session.favorite ? 'text-warning fill-warning' : ''
                      }`}
                      title="Save to favorites"
                      aria-label={session.favorite ? 'Remove session from favorites' : 'Mark session as favorite'}
                      aria-pressed={!!session.favorite}
                    >
                      <Star className={`w-4 h-4 ${session.favorite ? 'fill-current' : ''}`} />
                    </button>

                    {/* F6 — re-verify prompt health with the AI judge */}
                    <button
                      onClick={() => handleReVerify(session)}
                      disabled={rv?.checking}
                      className="p-1.5 rounded-lg text-text-muted hover:text-brand transition-colors disabled:opacity-40"
                      title="Recheck quality (re-score with AI and compare)"
                      aria-label="Re-verify prompt health"
                    >
                      <RefreshCw className={`w-4 h-4 ${rv?.checking ? 'animate-spin' : ''}`} />
                    </button>

                    <button
                      onClick={() => onDeleteSession(session.id)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-danger transition-colors"
                      title="Delete session"
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
                          Compare versions
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          if (isDiffActive) {
                            setDiffState({ sessionId: null, versionAId: '', versionBId: '', diffMode: 'unified' });
                          } else {
                            const vA = session.versions[0]?.id || '';
                            const vB = session.versions[session.versions.length - 1]?.id || '';
                            setDiffState({ sessionId: session.id, versionAId: vA, versionBId: vB, diffMode: 'unified' });
                          }
                        }}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                          isDiffActive
                            ? 'bg-brand text-white border-brand'
                            : 'bg-surface-code text-text-secondary hover:bg-surface-hover border-border'
                        }`}
                        aria-pressed={isDiffActive}
                      >
                        {isDiffActive ? 'Hide comparison' : 'Compare'}
                      </button>
                    </div>

                    {/* Diff Output Box */}
                    {isDiffActive && (
                      <div className="space-y-3 p-3 rounded-xl bg-surface-code border border-brand/30">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="block text-[11px] font-semibold text-text-muted mb-1">
                              Original
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
                              Newer
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

                        {/* Diff view toggle: unified vs side-by-side split */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                            {diffState.diffMode === 'unified' ? 'Unified diff' : 'Side-by-side'}
                          </span>
                          <div className="flex items-center gap-0.5 bg-surface-muted p-0.5 rounded-lg border border-border">
                            {(['unified', 'split'] as const).map((mode) => (
                              <button
                                key={mode}
                                type="button"
                                onClick={() => setDiffState({ ...diffState, diffMode: mode })}
                                aria-pressed={diffState.diffMode === mode}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all ${
                                  diffState.diffMode === mode
                                    ? 'bg-brand text-white shadow-sm'
                                    : 'text-text-secondary hover:text-text-primary'
                                }`}
                              >
                                {mode === 'unified' ? 'Unified' : 'Split'}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Rendered Word Diff */}
                        {(() => {
                          const verA = session.versions.find((v) => v.id === diffState.versionAId);
                          const verB = session.versions.find((v) => v.id === diffState.versionBId);
                          if (!verA || !verB) return <span>Select versions to compare.</span>;

                          const diffs = computeWordDiff(verA.content, verB.content);

                          const renderChunks = (chunks: typeof diffs) =>
                            chunks.map((chunk, idx) => {
                              if (chunk.added) {
                                return (
                                  <span key={idx} className="bg-success/25 text-success font-bold px-0.5 rounded">
                                    {chunk.value}
                                  </span>
                                );
                              }
                              if (chunk.removed) {
                                return (
                                  <span key={idx} className="bg-danger/25 text-danger line-through px-0.5 rounded opacity-70">
                                    {chunk.value}
                                  </span>
                                );
                              }
                              return <span key={idx}>{chunk.value}</span>;
                            });

                          if (diffState.diffMode === 'split') {
                            // Left: original with removals highlighted. Right: newer with additions highlighted.
                            const leftChunks = diffs.filter((c) => !c.added);
                            const rightChunks = diffs.filter((c) => !c.removed);
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div className="rounded-lg border border-danger/20 bg-surface-card/60 p-3 text-xs font-mono leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
                                  {renderChunks(leftChunks)}
                                </div>
                                <div className="rounded-lg border border-success/20 bg-surface-card/60 p-3 text-xs font-mono leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
                                  {renderChunks(rightChunks)}
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div className="p-3 rounded-lg bg-surface-code text-xs font-mono leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
                              {renderChunks(diffs)}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Score trend sparkline (§9.15) — shown once ≥2 versions are scored */}
                    {(() => {
                      const scored = session.versions.filter((v) => v.quality);
                      if (scored.length < 2) return null;
                      const series = scored.map((v) => v.quality!.overall);
                      const firstV = scored[0];
                      const lastV = scored[scored.length - 1];
                      return (
                        <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-surface-card/60 border border-border/70">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                            Score trend
                          </span>
                          <Sparkline
                            values={series}
                            stroke="var(--brand)"
                            width={150}
                            height={28}
                            ariaLabel={`Quality trend for ${session.title}`}
                            unitLabel="/100"
                          />
                          <span className="text-[11px] font-mono text-text-muted">
                            v{firstV.versionNumber} → v{lastV.versionNumber}
                          </span>
                        </div>
                      );
                    })()}

                    {/* Versions List */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                        Version history
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
                                      title="Save"
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
                                      title="Rename version"
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
                                Change: &quot;{ver.refinementInstruction}&quot;
                              </p>
                            )}

                            {/* Mini quality bar when scored */}
                            {ver.quality && (
                              <div className="flex items-center gap-2">
                                <div className="h-1 flex-1 rounded-full bg-surface-hover overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      ver.quality.overall >= PASS_THRESHOLD
                                        ? 'bg-success'
                                        : ver.quality.overall >= 50
                                        ? 'bg-warning'
                                        : 'bg-danger'
                                    }`}
                                    style={{ width: `${ver.quality.overall}%` }}
                                  />
                                </div>
                                <span className="text-[10px] font-bold tabular-nums text-text-muted">
                                  {ver.quality.overall}
                                </span>
                              </div>
                            )}

                            {/* Actions for this Version */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/60">
                              <button
                                onClick={() => onSelectSession(session, ver.id)}
                                className="px-3 py-1 rounded-lg text-xs font-semibold bg-brand text-white hover:bg-brand-hover flex items-center gap-1 shadow-sm transition-colors"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>Open</span>
                              </button>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => handleCopy(ver.id, ver.content, e)}
                                  className="p-1.5 rounded-lg text-text-muted hover:text-brand transition-colors"
                                  title="Copy prompt"
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
                                  title="Test"
                                  aria-label={`Test version ${ver.versionNumber}`}
                                >
                                  <Play className="w-3.5 h-3.5" />
                                </button>

                                {session.versions.length > 1 && (
                                  <button
                                    onClick={() => onDeleteVersion(session.id, ver.id)}
                                    className="p-1.5 rounded-lg text-text-muted hover:text-danger transition-colors"
                                    title="Delete version"
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
        title="Clear all saved prompts?"
        message="This permanently removes all saved prompts and their versions from your browser. This can't be undone."
        confirmLabel="Clear All"
        onConfirm={() => {
          onClearAllSessions();
          setShowClearConfirm(false);
        }}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
}
