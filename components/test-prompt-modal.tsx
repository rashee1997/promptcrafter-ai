'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  X,
  RefreshCw,
  Bot,
  Send,
  Sparkles,
  Copy,
  Check,
  GitCompare,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { GlassCard } from './glass-card';
import { MarkdownRenderer } from './markdown-renderer';
import { ABTestResult, ProviderConfig } from '@/types';
import { runABTest, testPromptExecution } from '@/lib/ai-client';
import { consistencyLabel } from '@/lib/similarity';
import { useFocusTrap } from '@/lib/use-focus-trap';

interface TestPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  generatedPrompt: string;
  provider: ProviderConfig;
  /** All configured providers, used to power the F2 cross-model A/B lab. */
  providers?: ProviderConfig[];
}

export function TestPromptModal({
  isOpen,
  onClose,
  generatedPrompt,
  provider,
  providers,
}: TestPromptModalProps) {
  const [testInput, setTestInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // F2 — A/B lab state
  const [abSelected, setAbSelected] = useState<string[]>([]);
  const [abRunning, setAbRunning] = useState(false);
  const [abResults, setAbResults] = useState<ABTestResult | null>(null);

  const outputContainerRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Keep Tab/Shift+Tab cycling inside the dialog while it's open
  useFocusTrap(dialogRef, isOpen);

  // Default A/B selection to all available providers once
  useEffect(() => {
    if (providers && providers.length > 0) {
      setAbSelected((prev) => (prev.length > 0 ? prev : providers.map((p) => p.id)));
    }
  }, [providers]);

  // Auto-scroll output container as streaming tokens arrive
  useEffect(() => {
    if (isLoading && outputContainerRef.current) {
      outputContainerRef.current.scrollTop = outputContainerRef.current.scrollHeight;
    }
  }, [output, isLoading]);

  // Dialog semantics: focus the dialog on open, close on Escape, restore focus on close
  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    requestAnimationFrame(() => dialogRef.current?.focus());
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleAbProvider = (id: string) => {
    setAbSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleRunTest = async () => {
    setIsLoading(true);
    setError(null);
    setOutput('');

    await testPromptExecution(
      {
        provider,
        generatedPrompt,
        testInput,
      },
      (chunk) => {
        setOutput((prev) => prev + chunk);
      },
      () => {
        setIsLoading(false);
      },
      (err) => {
        setIsLoading(false);
        setError(err.message);
      }
    );
  };

  const handleRunABTest = async () => {
    const chosen = (providers || []).filter((p) => abSelected.includes(p.id));
    if (chosen.length < 2) {
      setError('Select at least two providers to compare.');
      return;
    }
    setAbRunning(true);
    setError(null);
    setAbResults(null);
    setOutput('');
    const result = await runABTest({ providers: chosen, generatedPrompt, testInput });
    setAbRunning(false);
    if (result) {
      setAbResults(result);
    } else {
      setError('A/B lab failed to run. Check your provider configurations.');
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const consistency = consistencyLabel(abResults?.consistency ?? null);
  const labGridClass =
    !abResults || abResults.results.length <= 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : abResults.results.length === 3
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      : 'grid-cols-1 sm:grid-cols-2';

  return (
    <AnimatePresence>
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="test-prompt-title"
        aria-busy={isLoading || abRunning}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-surface-code/70 backdrop-blur-lg focus:outline-none"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="w-full max-w-5xl max-h-[90vh] flex flex-col"
        >
          <GlassCard variant="glowing" className="p-6 flex flex-col h-full max-h-[85vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-brand/10 text-indigo-500 border border-brand/20">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="test-prompt-title" className="text-lg font-bold text-text-primary flex items-center gap-2">
                    Prompt Test Sandbox
                  </h3>
                  <p className="text-xs text-text-muted">
                    Test how your generated system prompt responds using {provider.name}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-text-muted hover:text-text-primary dark:hover:text-text-primary hover:bg-surface-hover transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - 2 Panes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 flex-1 overflow-hidden">
              {/* Left Pane: Test Controls & Prompt Preview */}
              <div className="flex flex-col gap-3 overflow-y-auto pr-1">
                <div>
                  <label className="text-xs font-semibold text-text-secondary mb-1 block">
                    System Prompt Under Test
                  </label>
                  <div className="p-3 rounded-xl bg-surface-muted dark:bg-surface-muted border border-border text-xs font-mono text-text-secondary max-h-40 overflow-y-auto leading-relaxed">
                    <MarkdownRenderer content={generatedPrompt} highlightPlaceholders={true} />
                  </div>
                </div>

                <div className="flex-1 flex flex-col min-h-[140px]">
                  <label htmlFor="test-input" className="text-xs font-semibold text-text-secondary mb-1 block">
                    Test User Input (Sample Query)
                  </label>
                  <textarea
                    id="test-input"
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    placeholder="Enter sample input data to test your prompt with (e.g. sample scenario, user question, raw text)..."
                    className="w-full flex-1 p-3 text-xs rounded-xl border border-border bg-surface-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand min-h-[100px] resize-none"
                  />
                </div>

                <button
                  onClick={handleRunTest}
                  disabled={isLoading || abRunning}
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50 transition-all shrink-0"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Executing Prompt...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Run Test Execution</span>
                    </>
                  )}
                </button>

                {/* F2 — Cross-model A/B lab */}
                {providers && providers.length > 1 && (
                  <div className="rounded-xl border border-brand/25 bg-brand/5 p-3 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <GitCompare className="w-4 h-4 text-brand" />
                      <span className="text-xs font-bold text-text-primary">Cross-Model A/B Lab</span>
                      <span className="text-[10px] text-text-muted hidden sm:inline">
                        — same prompt, every model, side by side
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {providers.map((p) => {
                        const selected = abSelected.includes(p.id);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => toggleAbProvider(p.id)}
                            aria-pressed={selected}
                            className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                              selected
                                ? 'bg-brand text-white border-brand'
                                : 'bg-surface-card text-text-secondary border-border hover:bg-surface-hover'
                            }`}
                            title={`${p.name} · ${p.model}`}
                          >
                            {p.name.split('(')[0].trim()}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={handleRunABTest}
                      disabled={abRunning || abSelected.length < 2}
                      className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-surface-card border border-brand/40 text-brand hover:bg-brand/10 disabled:opacity-40 flex items-center justify-center gap-2 transition-all"
                    >
                      {abRunning ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Running {abSelected.length} models...</span>
                        </>
                      ) : (
                        <>
                          <GitCompare className="w-3.5 h-3.5" />
                          <span>Run A/B Lab ({abSelected.length} models)</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Right Pane: AI Sandbox Output / A/B Results */}
              <div className="flex flex-col rounded-xl border border-border bg-surface-code text-text-primary p-4 overflow-hidden relative min-h-[300px]">
                <div className="flex items-center justify-between pb-2 border-b border-border mb-2 shrink-0">
                  <span className="text-xs font-mono font-medium text-brand flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    {abResults ? `A/B Results · ${abResults.results.length} models` : 'Live AI Output'}
                  </span>

                  {abResults && abResults.consistency !== null && (
                    <span
                      className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                        consistency.tone === 'success'
                          ? 'bg-success/10 border-success/30 text-success'
                          : consistency.tone === 'warning'
                          ? 'bg-warning/10 border-warning/30 text-warning'
                          : 'bg-danger/10 border-danger/30 text-danger'
                      }`}
                      title="Semantic similarity across model outputs"
                    >
                      {consistency.tone === 'success' ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {consistency.label}
                    </span>
                  )}

                  {!abResults && output && (
                    <button
                      onClick={handleCopy}
                      className="p-1 px-2 rounded text-xs text-text-muted hover:text-white bg-surface-code hover:bg-surface-hover flex items-center gap-1 transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>

                <div
                  ref={outputContainerRef}
                  aria-live="polite"
                  className="flex-1 overflow-y-auto text-xs leading-relaxed pr-1 space-y-2 scroll-smooth"
                >
                  {error && (
                    <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger">
                      Error: {error}
                    </div>
                  )}

                  {abResults ? (
                    <div className={`grid ${labGridClass} gap-2`}>
                      {abResults.results.map((r) => (
                        <div
                          key={r.providerId}
                          className="rounded-lg border border-border bg-surface-card p-2.5 space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-bold text-brand truncate">{r.providerName}</span>
                            <span className="text-[9px] text-text-muted truncate">{r.model}</span>
                          </div>
                          {r.error ? (
                            <p className="text-[10px] text-danger leading-relaxed">Error: {r.error}</p>
                          ) : (
                            <div className="max-h-48 overflow-y-auto text-[10px] leading-relaxed text-text-secondary whitespace-pre-wrap">
                              {r.output || '(empty output)'}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      {!output && !isLoading && !error && (
                        <div className="h-full flex flex-col items-center justify-center text-center text-text-muted py-12">
                          <Send className="w-8 h-8 mb-2 opacity-40" />
                          <p>Click &quot;Run Test Execution&quot; to test your prompt live.</p>
                          {providers && providers.length > 1 && (
                            <p className="mt-1 text-[11px] opacity-80">
                              Or run the A/B lab to compare every model side by side.
                            </p>
                          )}
                        </div>
                      )}

                      {output && <MarkdownRenderer content={output} highlightPlaceholders={true} />}
                    </>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
