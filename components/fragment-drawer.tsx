'use client';

import React, { useState } from 'react';
import { PromptFragment } from '@/types';
import { deleteLocalFragment, getLocalFragments, saveLocalFragment } from '@/lib/storage';
import { Bookmark, Plus, Trash2, X, Copy, Check, Sparkles } from 'lucide-react';
import { toast } from '@/components/toast';

interface FragmentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertFragment: (content: string) => void;
}

export function FragmentDrawer({ isOpen, onClose, onInsertFragment }: FragmentDrawerProps) {
  const [fragments, setFragments] = useState<PromptFragment[]>(() => getLocalFragments());
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PromptFragment['category']>('custom');
  const [content, setContent] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;
    const newFrag: PromptFragment = {
      id: `frag-${Date.now()}`,
      title: title.trim(),
      category,
      content: content.trim(),
      createdAt: Date.now(),
    };
    saveLocalFragment(newFrag);
    setFragments(getLocalFragments());
    setTitle('');
    setContent('');
    setIsAdding(false);
    toast.success('Fragment saved', 'Ready to insert into any prompt.');
  };

  const handleDelete = (id: string) => {
    deleteLocalFragment(id);
    setFragments(getLocalFragments());
    toast.success('Fragment removed');
  };

  const handleCopy = (frag: PromptFragment) => {
    navigator.clipboard.writeText(frag.content);
    setCopiedId(frag.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-surface-card border-l border-border h-full flex flex-col p-6 shadow-2xl overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-brand" />
            <h3 className="text-sm font-bold text-text-primary">Prompt Fragment Library</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Add custom fragment */}
        <div className="my-4">
          {!isAdding ? (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="w-full py-2 px-3 rounded-xl border border-dashed border-border hover:border-brand/40 text-xs font-semibold text-text-muted hover:text-brand flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Pin New Reusable Fragment</span>
            </button>
          ) : (
            <div className="p-4 rounded-xl bg-surface-muted border border-border space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-text-primary">New Pinned Fragment</span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-text-muted hover:text-text-primary"
                >
                  Cancel
                </button>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Fragment title (e.g. Hallucination Defense)"
                className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-surface-card"
              />
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-surface-card text-text-secondary"
              >
                <option value="guardrail">Guardrail / Negative Constraint</option>
                <option value="persona">Persona / Tone</option>
                <option value="output-spec">Output Specification / Schema</option>
                <option value="technique">Technique / Reasoning</option>
                <option value="custom">Custom</option>
              </select>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Exact directive or instruction text to insert..."
                rows={3}
                className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-surface-card leading-relaxed"
              />
              <button
                type="button"
                onClick={handleSave}
                disabled={!title.trim() || !content.trim()}
                className="w-full py-1.5 rounded-lg bg-brand text-white font-semibold disabled:opacity-50"
              >
                Save Fragment
              </button>
            </div>
          )}
        </div>

        {/* List of fragments */}
        <div className="space-y-3 flex-1">
          {fragments.map((frag) => (
            <div
              key={frag.id}
              className="p-3.5 rounded-xl border border-border/80 bg-surface-card/60 space-y-2 text-xs hover:border-brand/30 transition-colors"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-bold text-text-primary">{frag.title}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-surface-muted text-text-muted uppercase font-mono">
                  {frag.category}
                </span>
              </div>
              <p className="text-[11px] text-text-muted line-clamp-3 font-mono bg-surface-code p-2 rounded border border-border/50">
                {frag.content}
              </p>
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onInsertFragment(`\n[${frag.content}]\n`);
                    toast.success('Inserted into prompt');
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-brand/10 text-brand hover:bg-brand/20 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Insert into draft</span>
                </button>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleCopy(frag)}
                    className="p-1 text-text-muted hover:text-text-primary"
                    title="Copy text"
                  >
                    {copiedId === frag.id ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  {frag.id.startsWith('frag-') && !['frag-anti-laziness', 'frag-json-schema', 'frag-hallucination-defense', 'frag-executive-voice'].includes(frag.id) && (
                    <button
                      type="button"
                      onClick={() => handleDelete(frag.id)}
                      className="p-1 text-text-muted hover:text-danger"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
