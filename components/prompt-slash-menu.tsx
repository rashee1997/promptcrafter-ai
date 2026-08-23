'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DOMAIN_PRESETS, FRAMEWORK_OPTIONS } from '@/lib/domains';
import { CodeFileAttachment, DomainPreset, PdfAttachment, TextStudioImageAttachment } from '@/types';
import { Sparkles, Layers, FileCode, FileText, Image as ImageIcon, BookOpen, Bot } from 'lucide-react';

export interface SlashMenuItem {
  id: string;
  category: 'Framework' | 'Domain' | 'Attached File' | 'Directive';
  label: string;
  description: string;
  icon: React.ReactNode;
  onSelect: () => void;
}

interface PromptSlashMenuProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  triggerChar: '/' | '@';
  onSelectDomain?: (domain: DomainPreset) => void;
  onSelectFramework?: (framework: string) => void;
  onInsertText: (text: string) => void;
  attachedFiles?: {
    codeFiles?: CodeFileAttachment[];
    pdfs?: PdfAttachment[];
    images?: TextStudioImageAttachment[];
  };
}

export function PromptSlashMenu({
  isOpen,
  onClose,
  query,
  triggerChar,
  onSelectDomain,
  onSelectFramework,
  onInsertText,
  attachedFiles,
}: PromptSlashMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const cleanQuery = query.toLowerCase().trim();

  // Generate menu items
  const items: SlashMenuItem[] = [];

  if (triggerChar === '/') {
    // 1. Frameworks
    for (const f of FRAMEWORK_OPTIONS) {
      if (!cleanQuery || f.label.toLowerCase().includes(cleanQuery) || f.value.toLowerCase().includes(cleanQuery)) {
        items.push({
          id: `framework-${f.value}`,
          category: 'Framework',
          label: `Framework: ${f.label}`,
          description: f.description,
          icon: <Layers className="w-3.5 h-3.5 text-brand" />,
          onSelect: () => {
            if (onSelectFramework) onSelectFramework(f.value);
            onInsertText(` [Using ${f.label} structure] `);
          },
        });
      }
    }

    // 2. Domain Presets
    for (const d of DOMAIN_PRESETS) {
      if (!cleanQuery || d.name.toLowerCase().includes(cleanQuery) || d.id.toLowerCase().includes(cleanQuery)) {
        items.push({
          id: `domain-${d.id}`,
          category: 'Domain',
          label: `Domain: ${d.name}`,
          description: d.description,
          icon: <BookOpen className="w-3.5 h-3.5 text-accent" />,
          onSelect: () => {
            if (onSelectDomain) onSelectDomain(d);
          },
        });
      }
    }

    // 3. Quick directives
    const quickDirectives = [
      {
        label: 'Anti-Laziness & Strict Completeness',
        desc: 'Forbids TODOs, ellipses, and partial implementations.',
        text: '\n[Directive: Never emit placeholder code, TODOs, or ellipses. Implement all functions completely.]\n',
      },
      {
        label: 'Strict JSON Output Schema',
        desc: 'Enforces pure parseable JSON output with no prose.',
        text: '\n[Directive: Respond strictly with a valid JSON object. No conversational intro or markdown wraps.]\n',
      },
      {
        label: 'Require Evidence & Citations',
        desc: 'Requires citing sources for factual claims.',
        text: '\n[Directive: Require verifiable evidence or citations for any factual claims made.]\n',
      },
    ];

    for (const d of quickDirectives) {
      if (!cleanQuery || d.label.toLowerCase().includes(cleanQuery)) {
        items.push({
          id: `directive-${d.label}`,
          category: 'Directive',
          label: d.label,
          description: d.desc,
          icon: <Sparkles className="w-3.5 h-3.5 text-warning" />,
          onSelect: () => onInsertText(d.text),
        });
      }
    }
  }

  if (triggerChar === '@') {
    // Attached files
    if (attachedFiles?.codeFiles) {
      for (const cf of attachedFiles.codeFiles) {
        if (!cleanQuery || cf.path.toLowerCase().includes(cleanQuery)) {
          items.push({
            id: `file-${cf.path}`,
            category: 'Attached File',
            label: cf.path,
            description: `Source file (${Math.ceil(cf.size / 1024)} KB)`,
            icon: <FileCode className="w-3.5 h-3.5 text-brand" />,
            onSelect: () => onInsertText(` @[file:${cf.path}] `),
          });
        }
      }
    }

    if (attachedFiles?.pdfs) {
      for (const pdf of attachedFiles.pdfs) {
        if (!cleanQuery || pdf.name.toLowerCase().includes(cleanQuery)) {
          items.push({
            id: `pdf-${pdf.id}`,
            category: 'Attached File',
            label: pdf.name,
            description: `PDF Document (${Math.ceil(pdf.size / 1024)} KB)`,
            icon: <FileText className="w-3.5 h-3.5 text-danger" />,
            onSelect: () => onInsertText(` @[doc:${pdf.name}] `),
          });
        }
      }
    }

    if (attachedFiles?.images) {
      for (const img of attachedFiles.images) {
        if (!cleanQuery || img.name.toLowerCase().includes(cleanQuery)) {
          items.push({
            id: `img-${img.id}`,
            category: 'Attached File',
            label: img.name,
            description: `Image Reference (${img.purpose})`,
            icon: <ImageIcon className="w-3.5 h-3.5 text-success" />,
            onSelect: () => onInsertText(` @[image:${img.name}] `),
          });
        }
      }
    }

    if (items.length === 0) {
      items.push({
        id: 'no-files',
        category: 'Attached File',
        label: 'No attached files found',
        description: 'Attach code files, PDFs, or images below to reference with @',
        icon: <Bot className="w-3.5 h-3.5 text-text-muted" />,
        onSelect: () => {},
      });
    }
  }

  // Keyboard navigation
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, triggerChar]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, items.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + items.length) % Math.max(1, items.length));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        if (items.length > 0 && items[selectedIndex]) {
          e.preventDefault();
          items[selectedIndex].onSelect();
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, items, selectedIndex, onClose]);

  if (!isOpen || items.length === 0) return null;

  return (
    <div
      ref={menuRef}
      className="absolute z-50 left-0 bottom-full mb-2 w-full sm:w-96 max-h-64 overflow-y-auto rounded-xl border border-border bg-surface-card/95 backdrop-blur-md shadow-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100"
    >
      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted border-b border-border/50 flex items-center justify-between">
        <span>{triggerChar === '/' ? 'Quick Commands (/)' : 'Reference Attachment (@)'}</span>
        <span className="font-normal lowercase">↑↓ navigate • enter select</span>
      </div>

      {items.map((item, index) => {
        const isSelected = index === selectedIndex;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              item.onSelect();
              onClose();
            }}
            className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-start gap-2.5 transition-colors ${
              isSelected
                ? 'bg-brand/15 text-brand border border-brand/30'
                : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
            }`}
          >
            <div className="mt-0.5 shrink-0">{item.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="font-semibold text-text-primary truncate">{item.label}</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-surface-muted text-text-muted shrink-0">
                  {item.category}
                </span>
              </div>
              <p className="text-[11px] text-text-muted truncate mt-0.5">{item.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
