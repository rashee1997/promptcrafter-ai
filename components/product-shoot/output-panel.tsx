'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check, AlertTriangle, Info } from 'lucide-react';
import type { ProductShootOutput } from '@/lib/product-shoot/types';

interface OutputPanelProps {
  output: string;
  isGenerating: boolean;
  visionPrePassNote: string | null;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-1 text-[11px] text-text-muted hover:text-brand transition-colors"
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 text-success" />
          <span className="text-success">Copied</span>
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

export function OutputPanel({
  output,
  isGenerating,
  visionPrePassNote,
}: OutputPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef(true);

  // Auto-scroll while streaming
  useEffect(() => {
    if (isGenerating && autoScrollRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output, isGenerating]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    autoScrollRef.current = scrollHeight - scrollTop - clientHeight < 60;
  };

  // Parse the output into sections
  const sections = parseOutput(output);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold tracking-wider uppercase text-text-secondary">
          Generated Shot Package
        </label>
        {!isGenerating && output && (
          <CopyButton text={output} />
        )}
      </div>

      {/* Vision pre-pass note */}
      <AnimatePresence>
        {visionPrePassNote && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-2 rounded-lg bg-brand-muted/20 border border-brand/20 p-3"
          >
            <Info className="w-4 h-4 text-brand mt-0.5 shrink-0" />
            <p className="text-xs text-text-secondary leading-relaxed">
              {visionPrePassNote}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!isGenerating && !output && (
        <div className="flex flex-col items-center justify-center rounded-xl
          bg-surface-code border border-border p-8 min-h-[200px] text-center">
          <div className="w-10 h-10 rounded-full bg-brand-muted/20 flex items-center justify-center mb-3">
            <AlertTriangle className="w-5 h-5 text-brand" />
          </div>
          <p className="text-sm text-text-secondary">
            Upload a product image, fill in the brief, and pick a scene recipe
            to generate your shot package.
          </p>
        </div>
      )}

      {/* Output well */}
      {(isGenerating || output) && (
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="rounded-xl bg-surface-code border border-border p-4
            min-h-[200px] max-h-[600px] overflow-y-auto"
          role="region"
          aria-live="polite"
          aria-busy={isGenerating}
        >
          {/* Streaming mode — raw text */}
          {isGenerating && !sections && (
            <pre className="text-sm font-mono text-text-primary whitespace-pre-wrap leading-relaxed">
              {output}
              <span className="inline-block w-[2px] h-4 bg-brand animate-[stream-caret-blink_1.1s_steps(2,start)_infinite] ml-0.5 align-middle" />
            </pre>
          )}

          {/* Parsed sections — on completion */}
          {!isGenerating && sections && (
            <div className="space-y-5">
              {/* Main Prompt */}
              <Section
                title="Main Shot Prompt"
                content={sections.mainPrompt}
              />

              {/* Negative Prompt */}
              {sections.negativePrompt && (
                <Section
                  title="Negative Prompt"
                  content={sections.negativePrompt}
                  variant="warning"
                />
              )}

              {/* Aspect Variants */}
              {sections.aspectVariants.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold tracking-wider uppercase text-text-secondary">
                    Aspect Variants
                  </h4>
                  {sections.aspectVariants.map((v) => (
                    <Section
                      key={v.ratio}
                      title={v.ratio}
                      content={v.prompt}
                      compact
                    />
                  ))}
                </div>
              )}

              {/* Alternative Concepts */}
              {sections.alternativeConcepts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold tracking-wider uppercase text-text-secondary">
                    Alternative Concepts
                  </h4>
                  {sections.alternativeConcepts.map((c, i) => (
                    <Section
                      key={i}
                      title={c.title}
                      content={c.prompt}
                      compact
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Still streaming — just show raw */}
          {isGenerating && sections && (
            <pre className="text-sm font-mono text-text-primary whitespace-pre-wrap leading-relaxed">
              {output}
              <span className="inline-block w-[2px] h-4 bg-brand animate-[stream-caret-blink_1.1s_steps(2,start)_infinite] ml-0.5 align-middle" />
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────

function Section({
  title,
  content,
  variant,
  compact,
}: {
  title: string;
  content: string;
  variant?: 'warning';
  compact?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`rounded-lg border p-3 ${
        variant === 'warning'
          ? 'border-warning/30 bg-warning-muted/10'
          : 'border-border bg-surface-muted/30'
      }`}
    >
      <h5 className="text-[11px] font-semibold tracking-wider uppercase text-text-muted mb-1.5">
        {title}
      </h5>
      <pre
        className={`text-sm font-mono text-text-primary whitespace-pre-wrap leading-relaxed ${
          compact ? 'max-h-32 overflow-y-auto' : ''
        }`}
      >
        {content}
      </pre>
    </motion.div>
  );
}

interface ParsedSections {
  mainPrompt: string;
  negativePrompt: string;
  aspectVariants: { ratio: string; prompt: string }[];
  alternativeConcepts: { title: string; prompt: string }[];
}

function parseOutput(output: string): ParsedSections | null {
  if (!output || output.length < 50) return null;

  const mainPrompt = extractSection(output, 'Main Shot Prompt', 'Negative Prompt');
  const negativePrompt = extractSection(output, 'Negative Prompt', 'Aspect Variants');

  const aspectVariants: { ratio: string; prompt: string }[] = [];
  const ratios = ['16:9', '9:16', '1:1'];
  for (const ratio of ratios) {
    const nextRatio = ratios[ratios.indexOf(ratio) + 1];
    const label = `${ratio}`;
    const prompt = extractSection(output, label, nextRatio ? `###.*${nextRatio}` : 'Alternative Concepts');
    if (prompt) {
      aspectVariants.push({ ratio, prompt: prompt.trim() });
    }
  }

  const alternativeConcepts: { title: string; prompt: string }[] = [];
  const conceptMatches = output.matchAll(
    /###\s*Concept\s*\d+:\s*(.+?)[\n\r]+([\s\S]*?)(?=###\s*Concept\s*\d+:|##\s|$)/g
  );
  for (const match of conceptMatches) {
    alternativeConcepts.push({
      title: match[1].trim(),
      prompt: match[2].trim(),
    });
  }

  // If parsing failed completely, fall back to raw text as main prompt
  if (!mainPrompt && !negativePrompt && aspectVariants.length === 0 && alternativeConcepts.length === 0) {
    return null;
  }

  return {
    mainPrompt: mainPrompt || output.slice(0, 500),
    negativePrompt,
    aspectVariants,
    alternativeConcepts,
  };
}

function extractSection(text: string, startLabel: string, endPattern: string): string {
  const startRegex = new RegExp(
    `(?:##\\s*|#\\s*)?${startLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\n`,
    'i'
  );
  const startMatch = startRegex.exec(text);
  if (!startMatch) return '';

  const afterStart = text.slice(startMatch.index + startMatch[0].length);
  const endRegex = new RegExp(
    `(?:##\\s*|#\\s*)(?:${endPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
    'i'
  );
  const endMatch = endRegex.exec(afterStart);

  return (endMatch ? afterStart.slice(0, endMatch.index) : afterStart).trim();
}
