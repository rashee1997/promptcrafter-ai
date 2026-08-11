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
  ListFilter,
  FileText,
  Lightbulb,
  Cpu,
} from 'lucide-react';
import { GlassCard } from './glass-card';
import { MarkdownRenderer } from './markdown-renderer';
import { HistoryItem, ProviderConfig } from '@/types';

interface PromptOutputProps {
  output: string;
  isGenerating: boolean;
  onTestPrompt: (promptText: string) => void;
  onSaveFavorite?: (item: HistoryItem) => void;
  activeProvider: ProviderConfig;
  currentHistoryItem?: HistoryItem | null;
}

export function PromptOutput({
  output,
  isGenerating,
  onTestPrompt,
  onSaveFavorite,
  activeProvider,
  currentHistoryItem,
}: PromptOutputProps) {
  const [copiedType, setCopiedType] = useState<'prompt' | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const outputRef = useRef<HTMLDivElement>(null);

  // Auto-scroll output container as stream chunks arrive
  useEffect(() => {
    if (isGenerating && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output, isGenerating]);

  if (!output && !isGenerating) {
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

  // Helper to unwrap ```markdown or ``` code blocks if present
  const unwrapCodeBlock = (str: string): string => {
    if (!str) return '';
    const trimmed = str.trim();
    const codeBlockMatch = trimmed.match(/^```(?:markdown|text|xml|json)?\n([\s\S]*?)\n?```$/i);
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
    }
    return trimmed;
  };

  const rawPromptText = unwrapCodeBlock(output);

  const wordCount = rawPromptText.trim() ? rawPromptText.trim().split(/\s+/).length : 0;
  const charCount = rawPromptText.length;
  const estTokens = Math.max(Math.ceil(charCount / 3.8), Math.round(wordCount * 1.3));

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
      title: 'PromptCrafter Export',
      timestamp: nowIso,
      model: activeProvider.name,
      prompt: rawPromptText,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PromptCrafter-${timestamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    if (currentHistoryItem && onSaveFavorite) {
      onSaveFavorite({
        ...currentHistoryItem,
        favorite: !isFavorite,
      });
    }
  };

  return (
    <GlassCard variant="glowing" className="p-5 sm:p-6 space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Engineered Raw Prompt
              </h3>
              {isGenerating && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-indigo-500 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Streaming prompt...
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Generated via {activeProvider.name}
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
              <span>Prompt Quality: {qualityScore}/100</span>
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

      {/* Main Output Box - Raw Single Copy-Paste Ready Prompt */}
      <div
        ref={outputRef}
        className="relative rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-950 text-slate-100 p-4 min-h-[300px] max-h-[540px] overflow-y-auto selection:bg-indigo-500 selection:text-white scroll-smooth font-mono text-xs leading-relaxed"
      >
        <MarkdownRenderer content={output} highlightPlaceholders={true} />
      </div>

      {/* Quick Action Copy Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          {/* Copy Prompt Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/25 flex items-center gap-2 transition-all active:scale-95"
          >
            {copiedType === 'prompt' ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copiedType === 'prompt' ? 'Copied Raw Prompt!' : 'Copy Copy-Paste Ready Prompt'}</span>
          </button>

          {/* Test Sandbox Button */}
          <button
            type="button"
            onClick={() => onTestPrompt(rawPromptText)}
            className="px-3 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 transition-all shadow-sm"
            title="Execute this prompt live against an AI model"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
            <span>Test in Sandbox</span>
          </button>

          {/* Favorite Toggle */}
          <button
            type="button"
            onClick={toggleFavorite}
            className={`p-2.5 rounded-xl text-xs font-semibold border transition-all ${
              isFavorite
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-500'
                : 'bg-white/60 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-amber-500'
            }`}
            title="Mark as Favorite"
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Download / Export Options */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadMd}
            className="px-2.5 py-2 rounded-xl text-xs font-medium border border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 transition-colors"
            title="Export as Markdown .md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.MD</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadJson}
            className="px-2.5 py-2 rounded-xl text-xs font-medium border border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 transition-colors"
            title="Export as JSON"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>.JSON</span>
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
