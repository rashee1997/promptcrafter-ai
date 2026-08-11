'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  X,
  Zap,
  BookOpen,
  Sliders,
  Check,
} from 'lucide-react';
import { DomainSelector } from './domain-selector';
import { GlassCard } from './glass-card';
import { DOMAIN_PRESETS, FRAMEWORK_OPTIONS, TONE_OPTIONS } from '@/lib/domains';
import { DomainPreset, FrameworkType, PromptInput, ToneType } from '@/types';

interface PromptFormProps {
  onGenerate: (input: PromptInput) => void;
  isGenerating: boolean;
}

export function PromptForm({ onGenerate, isGenerating }: PromptFormProps) {
  const [topic, setTopic] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<DomainPreset>(DOMAIN_PRESETS[0]);
  const [customDomainText, setCustomDomainText] = useState('');
  const [tone, setTone] = useState<ToneType>('professional');
  const [framework, setFramework] = useState<FrameworkType>('rtf');
  const [targetAudience, setTargetAudience] = useState('');
  const [outputFormat, setOutputFormat] = useState<'markdown' | 'json' | 'bullet-points' | 'xml' | 'structured-text'>('markdown');
  const [includeConstraints, setIncludeConstraints] = useState(true);
  const [includeExamples, setIncludeExamples] = useState(true);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedFrameworkCategory, setSelectedFrameworkCategory] = useState<string>('All');
  const [selectedToneCategory, setSelectedToneCategory] = useState<string>('All');

  const frameworkCategories = ['All', 'Foundational', 'Reasoning & Agentic', 'System & Meta'];
  const toneCategories = ['All', 'Executive & Professional', 'Analytical & Critical', 'Creative & Narrative', 'Educational & Supportive'];

  const filteredFrameworks = selectedFrameworkCategory === 'All'
    ? FRAMEWORK_OPTIONS
    : FRAMEWORK_OPTIONS.filter((f) => f.category === selectedFrameworkCategory);

  const filteredTones = selectedToneCategory === 'All'
    ? TONE_OPTIONS
    : TONE_OPTIONS.filter((t) => t.category === selectedToneCategory);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    onGenerate({
      topic: topic.trim(),
      domainId: selectedDomain.id,
      customDomain: selectedDomain.id === 'custom-domain' ? customDomainText : undefined,
      tone,
      framework,
      targetAudience: targetAudience.trim() || undefined,
      outputFormat,
      includeConstraints,
      includeExamples,
      additionalNotes: additionalNotes.trim() || undefined,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <GlassCard variant="default" className="p-5 sm:p-6 space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Topic Input Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              Primary Topic / Goal
            </label>
            {topic && (
              <button
                type="button"
                onClick={() => setTopic('')}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>

          <div className="relative">
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={selectedDomain.placeholders.topic}
              rows={3}
              className="w-full p-3.5 text-sm rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/80 focus:border-indigo-500 transition-all shadow-inner resize-y leading-relaxed"
            />
            <div className="absolute right-3 bottom-3 text-[11px] text-slate-400 pointer-events-none flex items-center gap-2">
              <span>Press ⌘+Enter to generate</span>
              <span>•</span>
              <span>{topic.length} chars</span>
            </div>
          </div>
        </div>

        {/* Domain Selector Component */}
        <DomainSelector
          selectedDomainId={selectedDomain.id}
          onSelectDomain={setSelectedDomain}
          onPickExampleTopic={(example) => setTopic(example)}
        />

        {/* Custom Domain Context if Custom Selected */}
        {selectedDomain.id === 'custom-domain' && (
          <div className="space-y-1.5 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
            <label className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
              Custom Domain Context / Instructions
            </label>
            <input
              type="text"
              value={customDomainText}
              onChange={(e) => setCustomDomainText(e.target.value)}
              placeholder="e.g. Healthcare Clinical Trial Protocols or Game Mechanics Architecture"
              className="w-full p-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        {/* Prompt Framework Selector */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              Prompt Architecture Framework ({FRAMEWORK_OPTIONS.length})
            </label>

            {/* Framework Category Tabs */}
            <div className="flex flex-wrap items-center gap-1 bg-slate-100/80 dark:bg-slate-900/80 p-1 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
              {frameworkCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedFrameworkCategory(cat)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    selectedFrameworkCategory === cat
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
            {filteredFrameworks.map((f) => {
              const isSelected = framework === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFramework(f.value)}
                  className={`p-3 rounded-xl border text-left transition-all text-xs flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-600/10 dark:bg-indigo-500/20 border-indigo-500 text-indigo-950 dark:text-indigo-100 ring-2 ring-indigo-500/30 shadow-md shadow-indigo-500/10'
                      : 'bg-white/40 dark:bg-slate-900/30 border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-indigo-400/50 dark:hover:border-indigo-500/40'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between w-full font-bold">
                      <span className="text-slate-900 dark:text-white">{f.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-500/10 dark:bg-indigo-500/20 px-1.5 py-0.5 rounded border border-indigo-500/20">
                        {f.tag}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        • {f.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
                    {f.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tone Selector Pills */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-500" />
              Desired Tone &amp; Style Persona ({TONE_OPTIONS.length})
            </label>

            {/* Tone Category Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1 bg-slate-100/80 dark:bg-slate-900/80 p-1 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
              {toneCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedToneCategory(cat)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all ${
                    selectedToneCategory === cat
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {filteredTones.map((t) => {
              const isSelected = tone === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTone(t.value)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 font-semibold'
                      : 'bg-white/60 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title={`${t.label} (${t.category}): ${t.description}`}
                >
                  <span>{t.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Collapsible Advanced Options */}
        <div className="border-t border-slate-200/60 dark:border-slate-800/60 pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
              <span>Advanced Customization & Constraints</span>
            </div>
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4 p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Target Audience */}
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                    Target Audience / Persona
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder={selectedDomain.placeholders.audience}
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Preferred Output Format */}
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                    Target Output Format
                  </label>
                  <select
                    value={outputFormat}
                    onChange={(e: any) => setOutputFormat(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="markdown">Markdown Sections</option>
                    <option value="bullet-points">Bullet-pointed List</option>
                    <option value="json">Structured JSON Schema</option>
                    <option value="xml">XML Tags (&lt;prompt&gt;...&lt;/prompt&gt;)</option>
                    <option value="structured-text">Structured Plain Text</option>
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={includeConstraints}
                    onChange={(e) => setIncludeConstraints(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Include Negative Constraints &amp; Guardrails (&quot;What NOT to do&quot;)</span>
                </label>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                  Additional Directives / Context
                </label>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder={selectedDomain.placeholders.additionalNotes}
                  rows={2}
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Primary Action Button */}
        <button
          type="submit"
          disabled={isGenerating || !topic.trim()}
          className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:via-indigo-400 hover:to-cyan-400 text-white shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2.5 disabled:opacity-50 transition-all duration-300 transform active:scale-[0.99]"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Engineering Prompt...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span>Generate & Optimize Prompt</span>
            </>
          )}
        </button>
      </form>
    </GlassCard>
  );
}
