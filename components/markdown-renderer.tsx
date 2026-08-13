'use client';

import React, { useEffect, useRef, useState, useId } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import { Copy, Check, Code } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  highlightPlaceholders?: boolean;
}

// Mermaid diagram subcomponent
function MermaidDiagram({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const rawId = useId();
  const uniqueId = rawId.replace(/[^a-zA-Z0-9]/g, 'm');

  useEffect(() => {
    let isMounted = true;

    async function renderMermaid() {
      if (!chart.trim()) return;

      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'default',
          securityLevel: 'loose',
          fontFamily: 'monospace',
        });

        // Use mermaid.render to generate SVG
        const renderId = `mermaid-svg-${uniqueId}-${Math.floor(Math.random() * 100000)}`;
        const { svg } = await mermaid.render(renderId, chart.trim());

        if (isMounted) {
          setSvgContent(svg);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          // If mermaid render fails (e.g. partial stream), show fallback code
          setError(err?.message || 'Diagram rendering in progress...');
        }
      }
    }

    renderMermaid();

    return () => {
      isMounted = false;
    };
  }, [chart, uniqueId]);

  if (error) {
    return (
      <div className="my-3 p-3 rounded-xl bg-surface-code border border-border font-mono text-xs text-text-muted">
        <div className="text-warning font-semibold mb-1 flex items-center gap-1.5">
          <Code className="w-3.5 h-3.5" />
          <span>Diagram preview</span>
        </div>
        <pre className="overflow-x-auto whitespace-pre text-text-secondary bg-surface-code p-2 rounded border border-border">
          {chart}
        </pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-4 p-4 rounded-2xl bg-surface-code/90 border border-border overflow-x-auto flex justify-center shadow-lg"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}

// Code Block Subcomponent with Copy Button & Mermaid Detection
function CodeBlock({
  language,
  value,
}: {
  language: string | undefined;
  value: string;
}) {
  const [copied, setCopied] = useState(false);

  if (language === 'mermaid') {
    return <MermaidDiagram chart={value} />;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-3 rounded-xl border border-border bg-surface-code overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-surface-muted border-b border-border text-[11px] font-mono text-text-muted">
        <span>{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
        >
          {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-3 overflow-x-auto font-mono text-xs text-text-primary leading-relaxed whitespace-pre">
        <code>{value}</code>
      </pre>
    </div>
  );
}

function preprocessMarkdown(rawContent: string): string {
  if (!rawContent) return '';

  let cleaned = rawContent;

  // 1. Remove legacy or section tag wrappers if present
  cleaned = cleaned.replace(/<\/?(?:master_system_prompt|creation_instructions|placeholders|few_shot_examples)>/gi, '');

  // 2. Preserve code blocks intact while escaping un-escaped HTML/XML tags outside code blocks
  const parts = cleaned.split(/(```[\s\S]*?```)/g);

  const processedParts = parts.map((part) => {
    // If it's inside a code block, leave code untouched
    if (part.startsWith('```')) {
      return part;
    }

    // Replace unescaped HTML/XML tags outside code blocks with &lt;...&gt;
    return part.replace(/<(\/?[\w:-]+(?:\s+[^>]*?)?)>/g, '&lt;$1&gt;');
  });

  return processedParts.join('');
}

export function MarkdownRenderer({
  content,
  className = '',
  highlightPlaceholders = true,
}: MarkdownRendererProps) {
  const processedContent = preprocessMarkdown(content);

  // Utility function to format placeholders like [INSERT_STACK_HERE]
  const renderTextWithPlaceholders = (text: string) => {
    if (!highlightPlaceholders || !text) return text;

    const parts = text.split(/(\[[A-Z0-9_\s\-\/:.]+\])/g);
    return (
      <>
        {parts.map((part, i) => {
          if (part.startsWith('[') && part.endsWith(']') && part.length > 2) {
            return (
              <span
                key={i}
                className="px-1.5 py-0.5 mx-0.5 rounded bg-warning/20 text-warning border border-warning/40 font-mono text-[11px] font-bold inline-block shadow-sm"
                title="Fill in this field"
              >
                {part}
              </span>
            );
          }
          return part;
        })}
      </>
    );
  };

  return (
    <div className={`prose max-w-none text-xs leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const value = String(children).replace(/\n$/, '');

            if (!inline && match) {
              return <CodeBlock language={match[1]} value={value} />;
            } else if (!inline) {
              if (value.startsWith('graph ') || value.startsWith('sequenceDiagram') || value.startsWith('flowchart')) {
                return <MermaidDiagram chart={value} />;
              }
              return <CodeBlock language={undefined} value={value} />;
            }

            return (
              <code
                className="px-1.5 py-0.5 rounded bg-surface-hover text-brand font-mono text-[11px] border border-border"
                {...props}
              >
                {children}
              </code>
            );
          },
          p({ children }) {
            return (
              <p className="my-2 leading-relaxed text-text-primary">
                {React.Children.map(children, (child) =>
                  typeof child === 'string' ? renderTextWithPlaceholders(child) : child
                )}
              </p>
            );
          },
          h1({ children }) {
            return (
              <h1 className="text-base font-bold text-text-primary border-b border-border pb-1.5 mt-4 mb-2">
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="text-sm font-bold text-brand mt-3 mb-1.5 flex items-center gap-1.5">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="text-xs font-bold text-text-primary mt-2.5 mb-1">
                {children}
              </h3>
            );
          },
          ul({ children }) {
            return <ul className="list-disc list-inside space-y-1 my-2 text-text-secondary pl-2">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-inside space-y-1 my-2 text-text-secondary pl-2">{children}</ol>;
          },
          li({ children }) {
            return <li className="text-text-primary">{children}</li>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-2 border-brand pl-3 my-2 text-text-muted italic bg-brand/5 py-1 rounded-r-lg">
                {children}
              </blockquote>
            );
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
