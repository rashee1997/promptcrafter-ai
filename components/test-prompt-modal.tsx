'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, X, RefreshCw, Bot, Send, Sparkles, Copy, Check } from 'lucide-react';
import { GlassCard } from './glass-card';
import { MarkdownRenderer } from './markdown-renderer';
import { ProviderConfig } from '@/types';
import { testPromptExecution } from '@/lib/ai-client';
import { useFocusTrap } from '@/lib/use-focus-trap';

interface TestPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  generatedPrompt: string;
  provider: ProviderConfig;
}

export function TestPromptModal({
  isOpen,
  onClose,
  generatedPrompt,
  provider,
}: TestPromptModalProps) {
  const [testInput, setTestInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const outputContainerRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Keep Tab/Shift+Tab cycling inside the dialog while it's open
  useFocusTrap(dialogRef, isOpen);

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

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="test-prompt-title"
        aria-busy={isLoading}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-surface-code/70 backdrop-blur-lg focus:outline-none"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="w-full max-w-4xl max-h-[90vh] flex flex-col"
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
                  disabled={isLoading}
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
              </div>

              {/* Right Pane: AI Sandbox Output */}
              <div className="flex flex-col rounded-xl border border-border bg-surface-code text-text-primary p-4 overflow-hidden relative min-h-[300px]">
                <div className="flex items-center justify-between pb-2 border-b border-border mb-2 shrink-0">
                  <span className="text-xs font-mono font-medium text-brand flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Live AI Output
                  </span>
                  {output && (
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

                  {!output && !isLoading && !error && (
                    <div className="h-full flex flex-col items-center justify-center text-center text-text-muted py-12">
                      <Send className="w-8 h-8 mb-2 opacity-40" />
                      <p>Click &quot;Run Test Execution&quot; to test your prompt live.</p>
                    </div>
                  )}

                  {output && <MarkdownRenderer content={output} highlightPlaceholders={true} />}
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
