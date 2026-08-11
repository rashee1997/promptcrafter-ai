'use client';

import React, { useState, useRef, useEffect } from 'react';
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
} from 'lucide-react';
import { GlassCard } from './glass-card';
import { MarkdownRenderer } from './markdown-renderer';
import { PromptVersion, ProviderConfig, Session } from '@/types';
import { computePromptStats, unwrapCodeBlock } from '@/lib/prompt-stats';

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
}: PromptOutputProps) {
  const [copiedType, setCopiedType] = useState<'prompt' | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [refineInstruction, setRefineInstruction] = useState('');

  const outputRef = useRef<HTMLDivElement>(null);

  // Sync editContent when switching active version or when output updates
  useEffect(() => {
    if (!isEditing) {
      setEditContent(output);
    }
  }, [output, activeVersion?.id, isEditing]);

  // Auto-scroll output container as stream chunks arrive
  useEffect(() => {
    if (isGenerating && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output, isGenerating]);

  if (!output && !isGenerating && !currentSession) {
    return (
      <GlassCard variant="subtle" className="p-8 text-center flex flex-col items-center justify-center min-h-[360px]">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/20">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
          Ready to Craft Your Prompt
        </h3>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
          Select a target domain, specify your goal or topic, choose a framework like Role-Task-Format or Chain-of-Thought, and click Generate.
        </p>
      </GlassCard>
    );
  }

  const rawPromptText = unwrapCodeBlock(isEditing ? editContent : output);
  const { wordCount, charCount, estTokens } = computePromptStats(rawPromptText);

  // Quality heuristic score
  const hasRole = /system|role|persona|expert|instruction/i.test(rawPromptText);
  const hasFormat = /format|markdown|json|xml|output/i.test(rawPromptText);
  const hasConstraints = /not|do not|never|constraint|guardrail/i.test(rawPromptText);
  const hasPlaceholders = /\[.*\]/.test(rawPromptText);

  let qualityScore = 72;
  if (hasRole) qualityScore += 7;
  if (hasFormat) qualityScore += 7;
  if (hasConstraints) qualityScore += 7;
  if (hasPlaceholders) qualityScore += 7;
  if (wordCount > 60) qualityScore = Math.min(98, qualityScore);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawPromptText);
    setCopiedType('prompt');
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
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PromptCrafter-${timestamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
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

  return (
    <GlassCard variant="glowing" className="p-5 sm:p-6 space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Engineered Raw Prompt
              </h3>

              {activeVersion && (
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                  <GitCommit className="w-3 h-3" />
                  v{activeVersion.versionNumber}: {activeVersion.name}
                </span>
              )}

              {isGenerating && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-indigo-500 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Streaming response...
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Generated via {activeVersion?.providerName || activeProvider.name}
            </p>
          </div>
        </div>

        {/* Badges: Estimated Token Counter & Quality Score */}
        {!isGenerating && output && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-xl text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
              <Cpu className="w-3.5 h-3.5 text-indigo-500" />
              <span>~{estTokens.toLocaleString()} Tokens</span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Quality: {qualityScore}/100</span>
            </div>
          </div>
        )}
      </div>

      {/* Analytics Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100/60 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400">
            <Cpu className="w-3.5 h-3.5" />
            <span>Estimated Tokens: ~{estTokens.toLocaleString()}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>{wordCount.toLocaleString()} Words</span>
          </div>
          <span>•</span>
          <div>{charCount.toLocaleString()} Characters</div>
        </div>
      </div>

      {/* Main Output Box (View or Monospace Edit Mode) */}
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full h-[320px] p-4 rounded-xl border border-indigo-500/50 bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 selection:bg-indigo-500 selection:text-white"
            placeholder="Edit prompt content directly..."
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 flex items-center gap-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Edit as New Version</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          ref={outputRef}
          className="relative rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-950 text-slate-100 p-4 min-h-[280px] max-h-[500px] overflow-y-auto selection:bg-indigo-500 selection:text-white scroll-smooth font-mono text-xs leading-relaxed"
        >
          <MarkdownRenderer content={output} highlightPlaceholders={true} />
        </div>
      )}

      {/* Quick Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          {/* Copy Prompt Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/25 flex items-center gap-2 transition-all active:scale-95"
          >
            {copiedType === 'prompt' ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copiedType === 'prompt' ? 'Copied Raw Prompt!' : 'Copy Prompt'}</span>
          </button>

          {/* Edit Mode Toggle Button */}
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              isEditing
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
                : 'bg-slate-800/80 text-slate-200 hover:bg-slate-700 border-slate-700'
            }`}
            title="Edit prompt in place"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Editing Mode' : 'Edit Prompt'}</span>
          </button>

          {/* Test Sandbox Button */}
          <button
            type="button"
            onClick={() => onTestPrompt(rawPromptText)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 transition-all shadow-sm"
            title="Execute this prompt live against an AI model"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
            <span>Test in Sandbox</span>
          </button>

          {/* Favorite Toggle */}
          {onToggleFavorite && (
            <button
              type="button"
              onClick={onToggleFavorite}
              className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
                currentSession?.favorite
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-500'
                  : 'bg-white/60 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-amber-500'
              }`}
              title="Mark Session as Favorite"
            >
              <Star className={`w-4 h-4 ${currentSession?.favorite ? 'fill-current' : ''}`} />
            </button>
          )}

          {isGenerating && onCancelGeneration && (
            <button
              type="button"
              onClick={onCancelGeneration}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500/20 border border-rose-500/40 text-rose-400 hover:bg-rose-500/30 flex items-center gap-1.5 transition-all"
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          )}
        </div>

        {/* Download / Export Options */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadMd}
            className="px-2.5 py-1.5 rounded-xl text-xs font-medium border border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 transition-colors"
            title="Export as Markdown .md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.MD</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadJson}
            className="px-2.5 py-1.5 rounded-xl text-xs font-medium border border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 transition-colors"
            title="Export as JSON"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>.JSON</span>
          </button>
        </div>
      </div>

      {/* Docked Conversational Refine Section */}
      <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 space-y-3">
        {/* Thread Version History Strip */}
        {versions.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <GitCommit className="w-3.5 h-3.5 text-indigo-500" /> Version Chain ({versions.length}):
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-indigo-500/20">
              {versions.map((ver) => {
                const isActive = ver.id === activeVersionId;
                return (
                  <button
                    key={ver.id}
                    type="button"
                    onClick={() => onSelectVersion && onSelectVersion(ver.id)}
                    className={`shrink-0 px-2.5 py-1 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : 'bg-slate-800/60 text-slate-300 border-slate-700/80 hover:bg-slate-700'
                    }`}
                  >
                    <span className="font-bold">v{ver.versionNumber}</span>
                    <span className="max-w-[120px] truncate">{ver.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Refine Input Form */}
        <form onSubmit={handleSubmitRefine} className="space-y-2">
          <div className="relative">
            <textarea
              value={refineInstruction}
              onChange={(e) => setRefineInstruction(e.target.value)}
              onKeyDown={handleKeyDownRefine}
              disabled={isGenerating}
              placeholder="Refine this prompt — e.g. 'make it more concise' or 'add error handling constraints' (⌘/Ctrl+Enter)"
              className="w-full p-3 pr-12 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900/90 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 resize-y min-h-[64px]"
            />
            <button
              type="submit"
              disabled={!refineInstruction.trim() || isGenerating}
              className="absolute right-2.5 bottom-3.5 p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors shadow-sm"
              title="Submit Refinement Instruction"
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
    </GlassCard>
  );
}
