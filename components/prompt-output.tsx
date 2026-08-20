'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Copy,
  Check,
  Download,
  Play,
  Star,
  RefreshCw,
  Sparkles,
  FileCode,
  Layers,
  CheckCircle2,
  Cpu,
  Edit3,
  Save,
  X,
  Send,
  GitCommit,
  StopCircle,
  Eraser,
  Gauge,
  FlaskConical,
  Braces,
  AlertTriangle,
  ChevronDown,
  ChevronsUpDown,
  Wand2,
  ListChecks,
  FileDown,
  Plus,
  Trash2,
  FileText,
  GitCompare,
} from 'lucide-react';
import { GlassCard } from './glass-card';
import { Expandable } from './expandable';
import { ConfirmModal } from './confirm-modal';
import { MarkdownRenderer } from './markdown-renderer';
import { PromptVersion, ProviderConfig, Session, TestRun } from '@/types';
import { computePromptStats, unwrapCodeBlock } from '@/lib/prompt-stats';
import { evaluatePromptQuality, runCaseEvaluation } from '@/lib/ai-client';
import { setVersionQuality, saveTestSuite, saveTestRun } from '@/lib/storage';
import { auditPlaceholders, fillPlaceholders } from '@/lib/placeholder';
import { exportPromptFor, EXPORT_TARGETS, ExportTarget } from '@/lib/export';
import { heuristicPromptQuality, PASS_THRESHOLD, buildEvaluationContext } from '@/lib/prompt-quality';
import { buildCostLedger } from '@/lib/ledger';
import { formatCostDollars } from '@/lib/model-pricing';
import { computeWordDiff } from '@/lib/diff';
import { toast } from '@/components/toast';

interface PromptOutputProps {
  output: string;
  isGenerating: boolean;
  onTestPrompt: (promptText: string) => void;
  onToggleFavorite?: () => void;
  activeProvider: ProviderConfig;
  currentSession?: Session | null;
  activeVersion?: PromptVersion | null;
  onSelectVersion?: (versionId: string) => void;
  onRefinePrompt?: (instruction: string) => void;
  onSaveEditVersion?: (newContent: string) => void;
  onCancelGeneration?: () => void;
  onClearOutput?: () => void;
  /** Called whenever a storage-backed measurement (score, suite, run) updates the session. */
  onSessionUpdate?: (session: Session) => void;
  /** §9.6 — jump to the History diff comparing two versions of the current session. */
  onOpenHistoryDiff?: (versionAId: string, versionBId: string) => void;
  /** Character limit warning — when the generated output exceeded the requested limit. */
  charLimitWarning?: { limit: number; actual: number } | null;
}

export function PromptOutput({
  output,
  isGenerating,
  onTestPrompt,
  onToggleFavorite,
  activeProvider,
  currentSession,
  activeVersion,
  onSelectVersion,
  onRefinePrompt,
  onSaveEditVersion,
  onCancelGeneration,
  onClearOutput,
  onSessionUpdate,
  onOpenHistoryDiff,
  charLimitWarning,
}: PromptOutputProps) {
  const [copiedType, setCopiedType] = useState<'prompt' | 'filled' | 'export' | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [refineInstruction, setRefineInstruction] = useState('');
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  // F1 scorecard state
  const [scoreOpen, setScoreOpen] = useState(false);
  const [isScoring, setIsScoring] = useState(false);

  // F4 placeholder fill state
  const [fillValues, setFillValues] = useState<Record<string, string>>({});
  const [fillOpen, setFillOpen] = useState(false);

  // F5 export adapter state
  const [exportTarget, setExportTarget] = useState<ExportTarget>('markdown');
  const [exportOpen, setExportOpen] = useState(false);

  // F3 regression suite state
  const [suiteOpen, setSuiteOpen] = useState(false);
  const [suiteInput, setSuiteInput] = useState('');
  const [suiteRunning, setSuiteRunning] = useState(false);
  const [suiteProgress, setSuiteProgress] = useState('');
  const [suiteError, setSuiteError] = useState<string | null>(null);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);

  // §9.6b — "what changed" diff panel for the active version
  const [changeDiffOpen, setChangeDiffOpen] = useState(false);

  const outputRef = useRef<HTMLDivElement>(null);

  // §9.6 — version picker popover (per-version score bars + "compare" shortcut)
  const [versionPickerOpen, setVersionPickerOpen] = useState(false);
  const versionPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!versionPickerOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (versionPickerRef.current && !versionPickerRef.current.contains(e.target as Node)) {
        setVersionPickerOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setVersionPickerOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [versionPickerOpen]);

  // Sync editContent when switching active version or when output updates
  useEffect(() => {
    if (!isEditing) {
      setEditContent(output);
    }
  }, [output, activeVersion?.id, isEditing]);

  // Streaming auto-scroll contract (DESIGN §6.2): follow the stream only while
  // the user is near the bottom (60px threshold); pause when they scroll up;
  // resume only when they return to the bottom. Never fight the reader.
  const userScrolledRef = useRef(false);

  // Reset the flag at the start of every new stream.
  useEffect(() => {
    if (isGenerating) userScrolledRef.current = false;
  }, [isGenerating]);

  // Track manual scrolls against the 60px bottom threshold.
  useEffect(() => {
    const el = outputRef.current;
    if (!el) return;
    const onScroll = () => {
      const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
      userScrolledRef.current = gap > 60;
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [output, isGenerating]);

  // Pin to the live stream edge only when the user hasn't scrolled away.
  useEffect(() => {
    const el = outputRef.current;
    if (!el || !isGenerating || userScrolledRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [output, isGenerating]);

  // Derived text content (computed before the early return so hooks stay ordered)
  const rawPromptText = unwrapCodeBlock(isEditing ? editContent : output);

  // The SAVED version's text. Quality display and scoring are always anchored
  // to the saved version — never to an unsaved draft in the editor.
  const versionPromptText = unwrapCodeBlock(activeVersion?.content || output);

  // F4 — placeholder audit
  const audit = useMemo(() => auditPlaceholders(rawPromptText), [rawPromptText]);
  const filledPrompt = useMemo(
    () => fillPlaceholders(rawPromptText, fillValues),
    [rawPromptText, fillValues]
  );

  // F5 — exported variant
  const exportedText = useMemo(
    () => exportPromptFor(rawPromptText, exportTarget),
    [rawPromptText, exportTarget]
  );

  if (!output && !isGenerating && !currentSession) {
    return (
      <GlassCard variant="subtle" className="p-8 text-center flex flex-col items-center justify-center min-h-[360px]">
        <div className="w-16 h-16 rounded-2xl bg-brand/10  text-brand flex items-center justify-center mb-4 border border-brand/20">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold tracking-tight text-text-primary">
          Create your first prompt
        </h3>
        <p className="mt-2 text-xs text-text-muted max-w-md leading-relaxed">
          Describe what you want to create, pick a use case, and click Create Prompt.
        </p>
        <p className="mt-1 text-[11px] text-text-muted max-w-md leading-relaxed">
          Every prompt gets a quality score, live tests, and version history — so you can prove it works.
        </p>
      </GlassCard>
    );
  }

  const { wordCount, charCount, estTokens } = computePromptStats(rawPromptText);

  // F1 — real stored quality when available, heuristic otherwise. The heuristic
  // is computed from the saved version, so editing a draft never changes the
  // displayed score until it is saved as a new version.
  const heuristicQuality = heuristicPromptQuality(versionPromptText);
  const quality = activeVersion?.quality || (!isGenerating && output ? heuristicQuality : null);
  const displayScore = quality?.overall ?? heuristicQuality.overall;

  // Score rail data: delta vs the previous version + cost chip (local ledger math).
  const ledger =
    currentSession && currentSession.versions.length > 0
      ? buildCostLedger(currentSession.versions)
      : [];
  const activeLedgerRow = activeVersion
    ? ledger.find((r) => r.version.id === activeVersion.id)
    : null;
  const scoreDelta = activeLedgerRow?.scoreDelta ?? null;
  const costChip =
    activeLedgerRow && activeLedgerRow.costPer1kCompletions > 0
      ? formatCostDollars(activeLedgerRow.costPer1kCompletions)
      : null;

  const handleCopy = (text: string, type: 'prompt' | 'filled' | 'export') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownloadMd = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const blob = new Blob([rawPromptText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PromptCrafter-${timestamp}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const nowIso = new Date().toISOString();
    const timestamp = nowIso.replace(/[:.]/g, '-');
    const data = {
      title: currentSession?.title || 'PromptCrafter Export',
      timestamp: nowIso,
      model: activeVersion?.modelUsed || activeProvider.name,
      prompt: rawPromptText,
      version: activeVersion?.versionNumber || 1,
      quality: quality,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PromptCrafter-${timestamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadExport = () => {
    const ext = exportTarget === 'json' ? 'json' : 'txt';
    const blob = new Blob([exportedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PromptCrafter-${exportTarget}-${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // F1 — score the SAVED version with the LLM judge. Scoring is read-only:
  // it never modifies the prompt, only records the score against the version.
  const handleScoreVersion = async () => {
    if (isScoring || isEditing || !versionPromptText) return;
    // Capture the version ID now so we can detect if the user switched versions
    // while the judge call was in flight.
    const scoredVersionId = activeVersion?.id;
    setIsScoring(true);
    try {
      const judged = await evaluatePromptQuality(
        activeProvider,
        versionPromptText,
        buildEvaluationContext(currentSession)
      );
      const finalQuality =
        judged ||
        {
          ...heuristicQuality,
          fallbackReason: 'The AI review could not be completed — showing a quick estimate instead.',
        };
      if (currentSession && activeVersion) {
        const updated = await setVersionQuality(currentSession.id, activeVersion.id, finalQuality);
        onSessionUpdate?.(updated);
      }
      // Only open the score panel if the version being displayed is still the one
      // that was scored — otherwise show a toast so the director isn't shown a
      // mismatched score panel for a different version.
      if (activeVersion?.id === scoredVersionId) {
        setScoreOpen(true);
      }
      toast.success(
        `Version scored ${finalQuality.overall}/100`,
        activeVersion?.id === scoredVersionId
          ? (finalQuality.source === 'llm-judge'
              ? 'Score saved to this version.'
              : 'Quick estimate saved — run AI review when your connection is back.')
          : 'Switch back to see the full score details.'
      );
    } catch (err: any) {
      toast.error("Couldn't score the version", err?.message || 'Please try again.');
    } finally {
      setIsScoring(false);
    }
  };

  // F3 — suite management
  const testSuite = currentSession?.testSuite || [];

  const handleAddSuiteCase = async () => {
    if (!suiteInput.trim() || !currentSession) return;
    const updated = await saveTestSuite(currentSession.id, [...testSuite, suiteInput.trim()]);
    setSuiteInput('');
    onSessionUpdate?.(updated);
  };

  const handleRemoveSuiteCase = async (index: number) => {
    if (!currentSession) return;
    const updated = await saveTestSuite(currentSession.id, testSuite.filter((_, i) => i !== index));
    onSessionUpdate?.(updated);
  };

  // F3 — run the suite across all versions
  const handleRunSuite = async () => {
    if (!currentSession || testSuite.length === 0 || suiteRunning) return;
    setSuiteRunning(true);
    setSuiteError(null);
    setExpandedRunId(null);

    let latestRun: TestRun | null = null;
    try {
      for (const version of currentSession.versions) {
        setSuiteProgress(`Testing version ${version.versionNumber} (${testSuite.length} case${testSuite.length === 1 ? '' : 's'})...`);
        const cases = [];
        let runJudgeModel: string | undefined;
        for (const input of testSuite) {
          const result = await runCaseEvaluation({
            provider: activeProvider,
            prompt: version.content,
            testInput: input,
          });
          if (!runJudgeModel && result?.judgeModel) runJudgeModel = result.judgeModel;
          cases.push({
            input,
            output: result?.output || '',
            score: result?.score ?? null,
            passed: !!result?.passed,
            error: result?.error,
          });
        }
        latestRun = {
          id: `run-${Date.now()}-${version.id}`,
          versionId: version.id,
          versionNumber: version.versionNumber,
          ranAt: Date.now(),
          providerName: activeProvider.name,
          modelUsed: activeProvider.model || activeProvider.name,
          judgeModel: runJudgeModel,
          cases,
        };
        const updated = await saveTestRun(currentSession.id, latestRun);
        onSessionUpdate?.(updated);
        setExpandedRunId(latestRun.id);
      }
      setSuiteProgress('');
    } catch (err: any) {
      setSuiteError(err?.message || 'The test run failed.');
    } finally {
      setSuiteRunning(false);
    }
  };

  const handleSaveEdit = () => {
    if (onSaveEditVersion) {
      onSaveEditVersion(editContent);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(output);
    setIsEditing(false);
  };

  const handleSubmitRefine = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!refineInstruction.trim() || isGenerating) return;
    if (onRefinePrompt) {
      onRefinePrompt(refineInstruction.trim());
      setRefineInstruction('');
    }
  };

  const handleKeyDownRefine = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmitRefine();
    }
  };

  const versions = currentSession?.versions || [];
  const activeVersionId = activeVersion?.id || currentSession?.activeVersionId;

  // Version immediately before the active one, for the "what changed" diff.
  const diffPrevVersion = (() => {
    if (!activeVersion || versions.length < 2) return null;
    const idx = versions.findIndex((v) => v.id === activeVersion.id);
    if (idx <= 0) return null;
    return versions[idx - 1];
  })();
  const changeDiff = diffPrevVersion && activeVersion
    ? computeWordDiff(diffPrevVersion.content, activeVersion.content)
    : null;

  const qualityDimensions = quality
    ? [
        { key: 'Clarity', value: quality.dimensions.clarity, note: quality.dimensions.clarity.notes },
        { key: 'Structure', value: quality.dimensions.structure, note: quality.dimensions.structure.notes },
        { key: 'Output format', value: quality.dimensions.outputSpec, note: quality.dimensions.outputSpec.notes },
        { key: 'Context', value: quality.dimensions.context, note: quality.dimensions.context.notes },
        { key: 'Safeguards', value: quality.dimensions.errorHandling, note: quality.dimensions.errorHandling.notes },
        { key: 'Conciseness', value: quality.dimensions.tokenEfficiency, note: quality.dimensions.tokenEfficiency.notes },
      ]
    : [];

  const latestRuns = currentSession?.testRuns || [];
  const runsByVersion = new Map<string, TestRun>();
  for (const run of latestRuns) {
    if (!runsByVersion.has(run.versionId)) runsByVersion.set(run.versionId, run);
  }

  // Matrix columns are derived from the runs' snapshotted case inputs so the
  // table stays aligned even after the live suite is edited.
  const matrixRuns = versions
    .map((v) => runsByVersion.get(v.id))
    .filter((r): r is TestRun => !!r);
  const maxCaseCols = matrixRuns.reduce((max, r) => Math.max(max, r.cases.length), 0);

  return (
    <GlassCard variant="glowing" className="p-5 sm:p-6 space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-brand/10 text-brand border border-brand/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-text-primary">
                Your prompt
              </h3>

              {activeVersion && (
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-lg bg-brand/15 text-brand border border-brand/30 flex items-center gap-1">
                  <GitCommit className="w-3 h-3" />
                  v{activeVersion.versionNumber}: {activeVersion.name}
                </span>
              )}

              {isGenerating && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-brand animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Generating…
                </span>
              )}
            </div>
            <p className="text-[11px] text-text-muted">
              Created with {activeVersion?.providerName || activeProvider.name}
            </p>
          </div>
        </div>

        {/* Badges: Estimated Token Counter & Quality Score */}
        {!isGenerating && output && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-brand/10 border border-brand/20 px-3 py-1 rounded-xl text-brand text-xs font-semibold">
              <Cpu className="w-3.5 h-3.5 text-brand" />
              <span>{wordCount.toLocaleString()} words</span>
            </div>
            <button
              type="button"
              onClick={() => setScoreOpen((open) => !open)}
              className={`flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                scoreOpen
                  ? 'bg-brand text-white border-brand'
                  : 'bg-success/10 border-success/20 text-success hover:bg-success/20'
              }`}
              title="Open the quality score"
              aria-expanded={scoreOpen}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                Quality: {displayScore}/100
                {quality?.source === 'heuristic' && <span className="ml-1 text-[9px] font-bold uppercase tracking-wide opacity-70">est.</span>}
              </span>
              {scoreDelta !== null && (
                <span
                  className={`text-[10px] font-bold ${
                    scoreDelta >= 0 ? 'text-success' : 'text-danger'
                  }`}
                  title={`vs previous version (${scoreDelta >= 0 ? '+' : ''}${scoreDelta})`}
                >
                  {scoreDelta >= 0 ? '▲' : '▼'} {Math.abs(scoreDelta)}
                </span>
              )}
              <ChevronDown className={`w-3 h-3 transition-transform ${scoreOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}
      </div>

      {/* Analytics Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-text-muted bg-surface-muted p-2.5 rounded-xl border border-border/50">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-brand">
            <Cpu className="w-3.5 h-3.5" />
            <span>{wordCount.toLocaleString()} words</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-text-muted" />
            <span>{charCount.toLocaleString()} characters</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1 tabular-nums">
            <FileText className="w-3.5 h-3.5 text-text-muted" />
            <span>~{estTokens.toLocaleString()} tokens</span>
          </div>
          {costChip && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                <span>≈ {costChip} / 1k runs</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Character limit warning — shown when the output exceeded the requested limit */}
      {!isGenerating && charLimitWarning && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-warning/10 border border-warning/30">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-warning">
              Output is {charLimitWarning.actual.toLocaleString()} characters — {charLimitWarning.actual - charLimitWarning.limit > 0 ? `${(charLimitWarning.actual - charLimitWarning.limit).toLocaleString()} over` : ''} your {charLimitWarning.limit.toLocaleString()} character limit
            </p>
            <p className="text-[11px] text-text-muted mt-0.5">You can ask to tighten it in the refine box below, or increase the limit in Style &amp; options.</p>
          </div>
        </div>
      )}

      {/* §9.6b — What changed vs the previous version (surfaces the refine edit immediately) */}
      {!isGenerating && activeVersion && diffPrevVersion && changeDiff && (
        <div className="rounded-xl border border-border bg-surface-muted/40 p-3 space-y-2">
          <button
            type="button"
            onClick={() => setChangeDiffOpen((open) => !open)}
            className="w-full flex items-center justify-between gap-2 text-left"
            aria-expanded={changeDiffOpen}
          >
            <span className="flex items-center gap-2 text-[11px] font-bold text-text-primary">
              <GitCompare className="w-3.5 h-3.5 text-brand shrink-0" />
              Changed from v{diffPrevVersion.versionNumber} ({diffPrevVersion.name})
              <span className="text-[10px] font-medium text-text-muted">
                → {activeVersion.name}
              </span>
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform ${changeDiffOpen ? 'rotate-180' : ''}`} />
          </button>
          <Expandable open={changeDiffOpen} className="space-y-1.5 pt-1">
            <div className="max-h-48 overflow-y-auto rounded-lg bg-surface-code border border-border/70 p-3 text-[11px] font-mono leading-relaxed whitespace-pre-wrap">
              {changeDiff.map((chunk, idx) => {
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
              })}
            </div>
          </Expandable>
        </div>
      )}

      {/* F1 — Quality Scorecard */}
      {quality && scoreOpen && (
      <Expandable open={true} className="space-y-3 p-4 rounded-xl bg-surface-muted/70 border border-brand/25">
          {quality.fallbackReason && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-warning/10 border border-warning/30">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-warning">Heuristic estimate — not a full AI review</p>
                <p className="text-[11px] text-text-muted mt-0.5">{quality.fallbackReason}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-brand" />
              <span className="text-xs font-bold text-text-primary">Quality check</span>
              <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md border uppercase tracking-wide ${
                quality.source === 'llm-judge'
                  ? 'bg-brand/10 text-brand border-brand/30'
                  : 'bg-warning/10 text-warning border-warning/30'
              }`}>
                {quality.source === 'llm-judge' ? 'AI Review' : 'Quick Check'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-brand">{quality.overall}</span>
              <span className="text-[10px] text-text-muted"> / 100</span>
              <p className="text-[10px] text-text-muted">
                {quality.source === 'llm-judge'
                  ? `via ${quality.judgeModel || quality.providerName}`
                  : 'Quick estimate · run a full review for a detailed score'}
              </p>
            </div>
          </div>

          {/* Dimension bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {qualityDimensions.map((dim) => (
              <div key={dim.key} className="p-2.5 rounded-lg bg-surface-card border border-border/70">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-text-secondary">{dim.key}</span>
                  <span
                    className={`text-[11px] font-bold ${
                      dim.value.score >= PASS_THRESHOLD ? 'text-success' : dim.value.score >= 50 ? 'text-warning' : 'text-danger'
                    }`}
                  >
                    {dim.value.score}/100
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-hover overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      dim.value.score >= PASS_THRESHOLD ? 'bg-success' : dim.value.score >= 50 ? 'bg-warning' : 'bg-danger'
                    }`}
                    style={{ width: `${dim.value.score}%` }}
                  />
                </div>
                {dim.note && <p className="mt-1 text-[10px] text-text-muted leading-relaxed">{dim.note}</p>}
              </div>
            ))}
          </div>

          {/* Strengths & improvements */}
          {(quality.strengths.length > 0 || quality.improvements.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-success block mb-1.5">Strengths</span>
                <ul className="space-y-1">
                  {quality.strengths.slice(0, 4).map((s, i) => (
                    <li key={i} className="text-[11px] text-text-secondary flex gap-1.5">
                      <Check className="w-3 h-3 text-success shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-warning block mb-1.5">Improve</span>
                <ul className="space-y-1.5">
                  {quality.improvements.slice(0, 4).map((imp, i) => (
                    <li key={i} className="text-[11px] text-text-secondary leading-relaxed flex items-start justify-between gap-2">
                      <span className="min-w-0 flex-1">
                        <span className="font-semibold text-warning">{imp.issue}</span>
                        <span className="text-text-muted"> → {imp.fix}</span>
                        {imp.dimension && (
                          <span className="ml-1 text-[9px] font-bold uppercase tracking-wide text-text-muted">
                            [{imp.dimension}]
                          </span>
                        )}
                      </span>
                      {onRefinePrompt && (
                        <button
                          type="button"
                          onClick={() => onRefinePrompt(imp.fix)}
                          className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand/15 text-brand border border-brand/30 hover:bg-brand/25 transition-colors"
                          title="Apply this fix as a new version"
                        >
                          Apply
                        </button>
                      )}
                    </li>
                  ))}
                  {quality.improvements.length === 0 && (
                    <li className="text-[11px] text-text-muted">No critical gaps found.</li>
                  )}
                </ul>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleScoreVersion}
            disabled={isScoring || isEditing}
            title={isEditing ? 'Save or cancel your edit before reviewing the saved version' : 'Score the saved version with the AI judge'}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-brand text-white hover:bg-brand-hover disabled:opacity-50 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            {isScoring ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Gauge className="w-3.5 h-3.5" />}
            <span>{isScoring ? 'Reviewing…' : 'Run AI Review'}</span>
          </button>
      </Expandable>
      )}

      {/* Main Output Box (View or Monospace Edit Mode) */}
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full h-[320px] p-4 rounded-xl border border-brand/50 bg-surface-code text-text-primary font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand selection:bg-brand selection:text-white"
            placeholder="Edit the prompt…"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface-code text-text-secondary hover:bg-surface-hover border border-border flex items-center gap-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-brand text-white hover:bg-brand-hover shadow-glow flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save as New Version</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          ref={outputRef}
          aria-busy={isGenerating}
          className="relative rounded-xl border border-border bg-surface-code text-text-primary p-4 min-h-[280px] max-h-[500px] overflow-y-auto selection:bg-brand selection:text-white scroll-smooth font-mono text-xs leading-relaxed"
        >
          {isGenerating ? (
            /* Stable streaming view: raw text grows in place + live caret.
               Full markdown rendering happens only once the stream completes. */
            <div className="whitespace-pre-wrap break-words">
              {output}
              <span
                className="animate-caret-blink inline-block w-[2px] h-[1.05em] bg-caret align-middle ml-0.5 rounded-[1px]"
                aria-hidden="true"
              />
            </div>
          ) : (
            <MarkdownRenderer content={output} highlightPlaceholders={true} />
          )}
        </div>
      )}

      {/* Quick Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          {/* Copy Prompt Button */}
          <button
            type="button"
            onClick={() => handleCopy(rawPromptText, 'prompt')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-brand hover:bg-brand-hover text-white shadow-glow flex items-center gap-2 transition-all active:scale-95"
          >
            {copiedType === 'prompt' ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            <span>{copiedType === 'prompt' ? 'Copied!' : 'Copy'}</span>
          </button>

          {/* Edit Mode Toggle Button */}
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              isEditing
                ? 'bg-brand/15 border-brand/40 text-brand'
                : 'bg-surface-code/80 text-text-primary hover:bg-surface-hover border-border'
            }`}
            title="Edit the prompt"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Editing' : 'Edit'}</span>
          </button>

          {/* Test Sandbox Button */}
          <button
            type="button"
            onClick={() => onTestPrompt(rawPromptText)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-surface-code text-text-primary hover:bg-surface-hover border border-border flex items-center gap-1.5 transition-all shadow-sm"
            title="See how this prompt responds with your AI model"
          >
            <Play className="w-3.5 h-3.5 text-success fill-current" />
            <span>Test</span>
          </button>

          {/* Favorite Toggle */}
          {onToggleFavorite && (
            <button
              type="button"
              onClick={onToggleFavorite}
              className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
                currentSession?.favorite
                  ? 'bg-warning/20 border-warning/40 text-warning'
                  : 'bg-surface-card/60 border-border text-text-secondary hover:text-warning'
              }`}
              title="Save to favorites"
              aria-label={currentSession?.favorite ? 'Remove from favorites' : 'Mark session as favorite'}
              aria-pressed={!!currentSession?.favorite}
            >
              <Star className={`w-4 h-4 ${currentSession?.favorite ? 'fill-current' : ''}`} />
            </button>
          )}

          {isGenerating && onCancelGeneration && (
            <button
              type="button"
              onClick={onCancelGeneration}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-danger/20 border border-danger/40 text-danger hover:bg-danger/30 flex items-center gap-1.5 transition-all"
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          )}

          {/* Clear Output Button */}
          {onClearOutput && (output || currentSession) && (
            <button
              type="button"
              onClick={() => setClearConfirmOpen(true)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-surface-code/80 border border-border text-text-secondary hover:bg-danger/10 hover:text-danger hover:border-danger/40 flex items-center gap-1.5 transition-all"
              title="Clear the current prompt (saved items stay in History)"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Download / Export Options */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadMd}
            className="px-2.5 py-1.5 rounded-xl text-xs font-medium border border-border bg-surface-card text-text-secondary hover:bg-surface-hover hover:text-text-primary hover:border-brand/40 flex items-center gap-1 transition-colors"
            title="Export as Markdown .md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.MD</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadJson}
            className="px-2.5 py-1.5 rounded-xl text-xs font-medium border border-border bg-surface-card text-text-secondary hover:bg-surface-hover hover:text-text-primary hover:border-brand/40 flex items-center gap-1 transition-colors"
            title="Export as JSON"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>.JSON</span>
          </button>
        </div>
      </div>

      {/* F4 — Placeholder audit & variable fill */}
      {!isGenerating && (audit.keys.length > 0 || audit.issues.length > 0) && (
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 space-y-2.5">
          <button
            type="button"
            onClick={() => setFillOpen((open) => !open)}
            className="w-full flex items-center justify-between gap-2 text-left"
            aria-expanded={fillOpen}
          >
            <span className="flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-warning" />
              <span className="text-xs font-bold text-text-primary">Custom fields</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-warning/20 text-warning border border-warning/30">
                {audit.keys.length} field{audit.keys.length === 1 ? '' : 's'}
              </span>
              {audit.issues.length > 0 && (
                <span className="hidden sm:flex items-center gap-1 text-[10px] font-semibold text-warning">
                  <AlertTriangle className="w-3 h-3" />
                  {audit.issues.length} item{audit.issues.length === 1 ? '' : 's'} to fix
                </span>
              )}
            </span>
            <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${fillOpen ? 'rotate-180' : ''}`} />
          </button>

          <Expandable open={fillOpen} className="space-y-3 pt-1">
              {audit.issues.length > 0 && (
                <ul className="space-y-1">
                  {audit.issues.map((issue, i) => (
                    <li key={i} className="text-[11px] text-warning flex gap-1.5">
                      <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                      <span>{issue.message}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {audit.keys.map((key) => {
                  const sample = audit.tokens.find((t) => t.normalized === key);
                  return (
                    <label key={key} className="block">
                      <span className="text-[10px] font-semibold text-text-muted block mb-1 uppercase tracking-wide">
                        {sample?.raw || key}
                      </span>
                      <input
                        type="text"
                        value={fillValues[key] || ''}
                        onChange={(e) => setFillValues((prev) => ({ ...prev, [key]: e.target.value }))}
                        placeholder="Value for this field..."
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-surface-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand"
                      />
                    </label>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(filledPrompt, 'filled')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-brand text-white hover:bg-brand-hover flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  {copiedType === 'filled' ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'filled' ? 'Copied!' : 'Copy with values'}</span>
                </button>
                <span className="text-[10px] text-text-muted">
                  Unfilled fields stay in brackets so you can spot them before copying.
                </span>
              </div>
          </Expandable>
        </div>
      )}

      {/* F5 — Export adapters */}
      {!isGenerating && output && (
        <div className="rounded-xl border border-border bg-surface-muted/40 p-4 space-y-2.5">
          <button
            type="button"
            onClick={() => setExportOpen((open) => !open)}
            className="w-full flex items-center justify-between gap-2 text-left"
            aria-expanded={exportOpen}
          >
            <span className="flex items-center gap-2 text-xs font-bold text-text-primary">
              <Braces className="w-4 h-4 text-brand" />
              Export
              <span className="hidden sm:inline text-[10px] font-medium text-text-muted">
                — same prompt, formatted for different tools
              </span>
            </span>
            <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${exportOpen ? 'rotate-180' : ''}`} />
          </button>

          <Expandable open={exportOpen} className="space-y-2.5 pt-1">
              <div className="flex flex-wrap items-center gap-1.5">
                {EXPORT_TARGETS.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setExportTarget(t.value)}
                    title={t.hint}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                      exportTarget === t.value
                        ? 'bg-brand text-white border-brand'
                        : 'bg-surface-card text-text-secondary border-border hover:bg-surface-hover'
                    }`}
                    aria-pressed={exportTarget === t.value}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <textarea
                readOnly
                value={exportedText}
                className="w-full h-32 p-3 rounded-xl border border-border bg-surface-code text-text-primary font-mono text-[11px] leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-brand"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(exportedText, 'export')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-brand text-white hover:bg-brand-hover flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  {copiedType === 'export' ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'export' ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadExport}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface-card text-text-secondary border border-border hover:bg-surface-hover flex items-center gap-1.5 transition-colors"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
          </Expandable>
        </div>
      )}

      {/* F3 — Regression suite */}
      {!isGenerating && currentSession && (
        <div className="rounded-xl border border-border bg-surface-muted/40 p-4 space-y-3">
          <button
            type="button"
            onClick={() => setSuiteOpen((open) => !open)}
            className="w-full flex items-center justify-between gap-2 text-left"
            aria-expanded={suiteOpen}
          >
            <span className="flex items-center gap-2 text-xs font-bold text-text-primary">
              <FlaskConical className="w-4 h-4 text-brand" />
              Consistency checks
              <span className="hidden sm:inline text-[10px] font-medium text-text-muted">
                — make sure changes don&apos;t break what already works
              </span>
            </span>
            <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${suiteOpen ? 'rotate-180' : ''}`} />
          </button>

          <Expandable open={suiteOpen} className="space-y-3 pt-1">
              {/* Add case */}
              <div className="flex gap-2">
                <textarea
                  value={suiteInput}
                  onChange={(e) => setSuiteInput(e.target.value)}
                  placeholder="Add a sample question or scenario to check against every version…"
                  className="flex-1 p-2.5 text-xs rounded-xl border border-border bg-surface-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand resize-y min-h-[56px]"
                />
                <button
                  type="button"
                  onClick={handleAddSuiteCase}
                  disabled={!suiteInput.trim()}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-brand text-white hover:bg-brand-hover disabled:opacity-40 flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>

              {/* Case list */}
              {testSuite.length > 0 && (
                <ul className="space-y-1.5">
                  {testSuite.map((input, i) => (
                    <li key={i} className="flex items-start justify-between gap-2 p-2 rounded-lg bg-surface-card border border-border/70">
                      <span className="text-[11px] text-text-secondary leading-relaxed flex-1 min-w-0 line-clamp-2">{input}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSuiteCase(i)}
                        className="p-1 rounded text-text-muted hover:text-danger transition-colors shrink-0"
                        aria-label={`Remove test case ${i + 1}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {testSuite.length > 0 && (
                <button
                  type="button"
                  onClick={handleRunSuite}
                  disabled={suiteRunning}
                  className="w-full py-2 px-4 rounded-xl text-xs font-bold bg-brand hover:bg-brand-hover text-white shadow-glow flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                >
                  {suiteRunning ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{suiteProgress || 'Running checks…'}</span>
                    </>
                  ) : (
                    <>
                      <ListChecks className="w-3.5 h-3.5" />
                      <span>Run checks ({versions.length} version{versions.length === 1 ? '' : 's'} × {testSuite.length} case{testSuite.length === 1 ? '' : 's'})</span>
                    </>
                  )}
                </button>
              )}

              {suiteError && (
                <p className="text-[11px] text-danger flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {suiteError}
                </p>
              )}

              {/* Results matrix */}
              {runsByVersion.size > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                    Latest results ({PASS_THRESHOLD} or higher passes)
                  </span>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px] border-collapse">
                      <thead>
                        <tr className="text-left text-text-muted">
                          <th className="py-1 pr-2 font-semibold">Version</th>
                          {Array.from({ length: maxCaseCols }, (_, i) => {
                            // Column labels come from the run's SNAPSHOTTED case
                            // inputs, not the current suite, so results never
                            // shift onto the wrong inputs after the suite is edited.
                            const headerCase = matrixRuns.find((r) => r.cases[i])?.cases[i];
                            return (
                              <th
                                key={i}
                                className="py-1 px-2 font-semibold"
                                title={headerCase?.input || `Case ${i + 1}`}
                              >
                                Case {i + 1}
                              </th>
                            );
                          })}
                          <th className="py-1 px-2 font-semibold">Pass</th>
                        </tr>
                      </thead>
                      <tbody>
                        {versions.map((ver) => {
                          const run = runsByVersion.get(ver.id);
                          return (
                            <tr key={ver.id} className="border-t border-border/60">
                              <td className="py-1.5 pr-2 font-semibold text-brand">v{ver.versionNumber}</td>
                              {Array.from({ length: maxCaseCols }, (_, i) => {
                                const result = run?.cases[i];
                                if (!result) {
                                  return <td key={i} className="py-1.5 px-2 text-text-muted">—</td>;
                                }
                                if (result.error) {
                                  return <td key={i} className="py-1.5 px-2 text-danger">Error</td>;
                                }
                                return (
                                  <td key={i} className="py-1.5 px-2">
                                    <button
                                      type="button"
                                      onClick={() => setExpandedRunId(expandedRunId === run.id ? null : run.id)}
                                      className={`font-bold ${
                                        result.passed ? 'text-success' : 'text-danger'
                                      }`}
                                      title={result.score !== null ? `${result.score}/100` : 'no score'}
                                    >
                                      {result.score !== null ? `${result.score}` : 'OK'}
                                    </button>
                                  </td>
                                );
                              })}
                              <td className="py-1.5 px-2">
                                {run
                                  ? `${run.cases.filter((c) => c.passed).length}/${run.cases.length}`
                                  : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Expanded run detail */}
                  {(() => {
                    const expandedRun = latestRuns.find((r) => r.id === expandedRunId);
                    if (!expandedRun) return null;
                    return (
                      <div className="space-y-2 p-3 rounded-lg bg-surface-code border border-border">
                        {expandedRun.cases.map((c, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-semibold text-text-muted">Case {i + 1}</span>
                              <span
                                className={`text-[10px] font-bold ${
                                  c.passed ? 'text-success' : 'text-danger'
                                }`}
                              >
                                {c.score !== null ? `${c.score}/100 · ` : ''}
                                {c.passed ? 'PASS' : 'FAIL'}
                              </span>
                            </div>
                            <p className="text-[10px] text-text-muted line-clamp-2">{c.input}</p>
                            <div className="max-h-24 overflow-y-auto rounded-md bg-surface-card border border-border/60 p-2 text-[10px] font-mono text-text-secondary whitespace-pre-wrap">
                              {c.error ? `Error: ${c.error}` : c.output.slice(0, 1200) || '(empty output)'}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
          </Expandable>
        </div>
      )}

      {/* Docked Conversational Refine Section */}
      <div className="pt-4 border-t border-border space-y-3">
        {/* Thread Version History Strip */}
        {versions.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-text-muted flex items-center gap-1">
                <GitCommit className="w-3.5 h-3.5 text-brand" /> Versions ({versions.length}):
              </span>

              {/* §9.6 — version picker popover with per-version score bars */}
              <div className="relative" ref={versionPickerRef}>
                <button
                  type="button"
                  onClick={() => setVersionPickerOpen((open) => !open)}
                  aria-expanded={versionPickerOpen}
                  aria-haspopup="true"
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-text-muted hover:text-brand border border-border/70 bg-surface-code/60 hover:border-brand/40 transition-colors"
                  title="Browse all versions and compare"
                >
                  <ChevronsUpDown className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">All versions</span>
                </button>

                {versionPickerOpen && (
                  <div
                    className="absolute right-0 top-full mt-1.5 z-50 w-72 max-h-72 overflow-y-auto rounded-xl border border-border bg-surface-elevated shadow-lg p-1.5 space-y-0.5"
                    aria-label="All versions"
                  >
                    {versions.map((ver) => {
                      const isActive = ver.id === activeVersionId;
                      const score = ver.quality?.overall;
                      return (
                        <div
                          key={ver.id}
                          className={`flex items-center gap-2 p-1 rounded-lg transition-colors ${
                            isActive ? 'bg-brand/10' : 'hover:bg-surface-hover'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              onSelectVersion?.(ver.id);
                              setVersionPickerOpen(false);
                            }}
                            className="flex-1 min-w-0 flex items-center gap-2 text-left"
                            title={`Open v${ver.versionNumber}: ${ver.name}`}
                          >
                            <span
                              className={`shrink-0 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                                isActive
                                  ? 'bg-brand text-white'
                                  : 'bg-surface-muted text-text-secondary border border-border'
                              }`}
                            >
                              v{ver.versionNumber}
                            </span>
                            <span className="flex-1 min-w-0 truncate text-xs font-medium text-text-primary">
                              {ver.name}
                            </span>
                            {score !== undefined ? (
                              <>
                                <div className="w-10 h-1 rounded-full bg-surface-hover overflow-hidden shrink-0">
                                  <div
                                    className={`h-full rounded-full ${
                                      score >= PASS_THRESHOLD
                                        ? 'bg-success'
                                        : score >= 50
                                        ? 'bg-warning'
                                        : 'bg-danger'
                                    }`}
                                    style={{ width: `${score}%` }}
                                  />
                                </div>
                                <span
                                  className={`shrink-0 text-[10px] font-bold tabular-nums ${
                                    score >= PASS_THRESHOLD
                                      ? 'text-success'
                                      : score >= 50
                                      ? 'text-warning'
                                      : 'text-danger'
                                  }`}
                                >
                                  {score}
                                </span>
                              </>
                            ) : (
                              <span className="shrink-0 text-[10px] text-text-muted">—</span>
                            )}
                          </button>

                          {onOpenHistoryDiff && activeVersionId && ver.id !== activeVersionId && (
                            <button
                              type="button"
                              onClick={() => {
                                onOpenHistoryDiff(activeVersionId, ver.id);
                                setVersionPickerOpen(false);
                              }}
                              className="shrink-0 p-1.5 rounded-lg text-text-muted hover:text-brand hover:bg-brand/10 transition-colors"
                              title={`Compare v${ver.versionNumber} with the current version in History`}
                              aria-label={`Compare v${ver.versionNumber} with the current version in History`}
                            >
                              <GitCompare className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-brand/20">
              {versions.map((ver) => {
                const isActive = ver.id === activeVersionId;
                return (
                  <button
                    key={ver.id}
                    type="button"
                    onClick={() => onSelectVersion && onSelectVersion(ver.id)}
                    className={`shrink-0 px-2.5 py-1 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-brand text-white border-brand shadow-sm'
                        : 'bg-surface-code/60 text-text-secondary border-border/80 hover:bg-surface-hover'
                    }`}
                    aria-pressed={isActive}
                  >
                    <span className="font-bold">v{ver.versionNumber}</span>
                    <span className="max-w-[120px] truncate">{ver.name}</span>
                    {ver.quality && (
                      <span className={`text-[9px] font-black ${isActive ? 'text-white/80' : ver.quality.overall >= 75 ? 'text-success' : ver.quality.overall >= 50 ? 'text-warning' : 'text-danger'}`}>
                        {ver.quality.overall}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Last-change hint chip */}
        {(() => {
          const lastVer = versions[versions.length - 1];
          if (!lastVer?.refinementInstruction) return null;
          return (
            <p className="text-[10px] text-text-muted flex items-center gap-1.5">
              <GitCommit className="w-3 h-3 text-brand shrink-0" />
              <span className="truncate">
                Last change: &quot;{lastVer.refinementInstruction}&quot;
              </span>
            </p>
          );
        })()}

        {/* Refine Input Form */}
        <form onSubmit={handleSubmitRefine} className="space-y-2">
          <div className="relative">
            <textarea
              value={refineInstruction}
              onChange={(e) => setRefineInstruction(e.target.value)}
              onKeyDown={handleKeyDownRefine}
              disabled={isGenerating}
              placeholder="Adjust this prompt — e.g. 'make it more concise' (⌘/Ctrl+Enter)"
              className="w-full p-3 pr-12 text-xs rounded-xl border border-border bg-surface-code text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-50 resize-y min-h-[64px]"
            />
            <button
              type="submit"
              disabled={!refineInstruction.trim() || isGenerating}
              className="absolute right-2.5 bottom-3.5 p-2 rounded-lg bg-brand text-white hover:bg-brand-hover disabled:opacity-40 transition-colors shadow-sm"
              title="Submit changes"
              aria-label="Submit changes"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Clear Output Confirm Modal */}
      <ConfirmModal
        isOpen={clearConfirmOpen}
        title="Clear this prompt?"
        message="This removes the prompt from your workspace and returns to a blank page. It stays saved in History, so you can reopen it anytime."
        confirmLabel="Clear"
        variant="warning"
        onConfirm={() => {
          setIsEditing(false);
          setClearConfirmOpen(false);
          if (onClearOutput) onClearOutput();
        }}
        onCancel={() => setClearConfirmOpen(false)}
      />
    </GlassCard>
  );
}
