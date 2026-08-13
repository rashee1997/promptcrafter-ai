'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Cpu,
} from 'lucide-react';
import { DomainSelector } from './domain-selector';
import { GlassCard } from './glass-card';
import { DEFAULT_OUTPUT_CHAR_LIMIT, DOMAIN_PRESETS, FRAMEWORK_OPTIONS, TONE_OPTIONS } from '@/lib/domains';
import { getProviderModelList } from '@/lib/storage';
import { DomainPreset, FrameworkType, PromptInput, ProviderConfig, ToneType } from '@/types';

interface PromptFormProps {
  onGenerate: (input: PromptInput) => void;
  isGenerating: boolean;
  /** Active provider, used to show/switch the current model. */
  activeProvider?: ProviderConfig;
  /** Called when the user switches the active model of the active provider. */
  onSelectActiveModel?: (model: string) => void;
}

export function PromptForm({
  onGenerate,
  isGenerating,
  activeProvider,
  onSelectActiveModel,
}: PromptFormProps) {
  const providerModels = activeProvider ? getProviderModelList(activeProvider) : [];
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
  // Output character limit for the engineered prompt; blank string = no limit (optional).
  const [outputCharLimit, setOutputCharLimit] = useState<string>(String(DEFAULT_OUTPUT_CHAR_LIMIT));
  const [showStyle, setShowStyle] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedFrameworkCategory, setSelectedFrameworkCategory] = useState<string>('All');
  const [selectedToneCategory, setSelectedToneCategory] = useState<string>('All');

  const topicRef = useRef<HTMLTextAreaElement>(null);

  // "/" focuses the topic field from anywhere on the page (when not typing)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        !!target &&
        (target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target instanceof HTMLSelectElement ||
          target.isContentEditable);
      if (e.key === '/' && !isTyping) {
        e.preventDefault();
        topicRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Command palette actions (⌘K → "Generate prompt" / "New prompt")
  const handleSubmitRef = useRef<() => void>(() => {});
  useEffect(() => {
    const onGenerate = () => handleSubmitRef.current();
    const onFocusTopic = () => topicRef.current?.focus();
    window.addEventListener('pc:generate', onGenerate);
    window.addEventListener('pc:focus-topic', onFocusTopic);
    return () => {
      window.removeEventListener('pc:generate', onGenerate);
      window.removeEventListener('pc:focus-topic', onFocusTopic);
    };
  }, []);

  const frameworkCategories = ['All', 'Foundational', 'Reasoning & Agentic', 'System & Meta'];
  const toneCategories = ['All', 'Executive & Professional', 'Analytical & Critical', 'Creative & Narrative', 'Educational & Supportive'];

  const filteredFrameworks = selectedFrameworkCategory === 'All'
    ? FRAMEWORK_OPTIONS
    : FRAMEWORK_OPTIONS.filter((f) => f.category === selectedFrameworkCategory);

  const filteredTones = selectedToneCategory === 'All'
    ? TONE_OPTIONS
    : TONE_OPTIONS.filter((t) => t.category === selectedToneCategory);

  const selectedFrameworkLabel = FRAMEWORK_OPTIONS.find((f) => f.value === framework)?.label ?? framework;
  const selectedToneLabel = TONE_OPTIONS.find((t) => t.value === tone)?.label ?? tone;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    const parsedLimit = Number(outputCharLimit);
    const hasLimit = outputCharLimit.trim() !== '' && Number.isFinite(parsedLimit) && parsedLimit > 0;

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
      outputCharLimit: hasLimit ? Math.floor(parsedLimit) : undefined,
    });
  };

  // Keep the palette listener pointed at the latest handleSubmit closure
  handleSubmitRef.current = handleSubmit;

  // ⌘/Ctrl+Enter generates from anywhere in the form (including textareas)
  const handleFormKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <GlassCard variant="default" className="p-5 sm:p-6 space-y-6">
      <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="space-y-6">
        {/* Topic Input Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="topic-input" className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-warning" />
              Primary Topic / Goal
            </label>
            {topic && (
              <button
                type="button"
                onClick={() => setTopic('')}
                className="text-xs text-text-muted hover:text-text-primary flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>

          <div className="relative">
            <textarea
              id="topic-input"
              ref={topicRef}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={selectedDomain.placeholders.topic}
              rows={3}
              className="w-full p-3.5 text-sm rounded-xl border border-border bg-surface-input text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/80 focus:border-brand transition-all shadow-inner resize-y leading-relaxed"
            />
            <div className="absolute right-3 bottom-3 text-[11px] text-text-muted pointer-events-none hidden sm:flex items-center gap-2">
              <span>⌘+Enter to generate</span>
              <span>•</span>
              <span>Press / to focus</span>
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
          <div className="space-y-1.5 p-3 rounded-xl bg-brand/5 border border-brand/20">
            <label htmlFor="custom-domain-input" className="text-xs font-semibold text-text-primary">
              Custom Domain Context / Instructions
            </label>
            <input
              id="custom-domain-input"
              type="text"
              value={customDomainText}
              onChange={(e) => setCustomDomainText(e.target.value)}
              placeholder="e.g. Healthcare Clinical Trial Protocols or Game Mechanics Architecture"
              className="w-full p-2.5 text-xs rounded-lg border border-border bg-surface-input text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        )}

        {/* Collapsible Style & Options */}
        <div className="border-t border-border pt-4">
          <button
            type="button"
            onClick={() => setShowStyle(!showStyle)}
            aria-expanded={showStyle}
            aria-controls="style-panel"
            className="w-full flex items-center justify-between gap-2 text-left group"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary group-hover:text-brand transition-colors">
              <SlidersHorizontal className="w-4 h-4 text-brand" />
              <span>Prompt Style &amp; Options</span>
              <span className="hidden md:flex items-center gap-1.5 text-[10px] font-medium text-text-muted">
                ({selectedFrameworkLabel} · {selectedToneLabel} · {outputFormat})
              </span>
            </div>
            {showStyle ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showStyle && (
            <div id="style-panel" className="mt-4 space-y-6">
              {/* Prompt Framework Selector */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-brand" />
                    Prompt Architecture Framework ({FRAMEWORK_OPTIONS.length})
                  </label>

                  {/* Framework Category Tabs */}
                  <div className="flex flex-wrap items-center gap-1 bg-surface-muted p-1 rounded-lg border border-border">
                    {frameworkCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedFrameworkCategory(cat)}
                        aria-pressed={selectedFrameworkCategory === cat}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                          selectedFrameworkCategory === cat
                            ? 'bg-brand text-white font-semibold shadow-sm'
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
                  {filteredFrameworks.map((f) => {
                    const isSelected = framework === f.value;
                    return (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => setFramework(f.value)}
                        aria-pressed={isSelected}
                        className={`p-3 rounded-xl border text-left transition-all text-xs flex flex-col justify-between ${
                          isSelected
                            ? 'bg-brand/15 border-brand text-text-primary ring-2 ring-brand/30 shadow-md shadow-brand/10'
                            : 'bg-surface-card/40 border-border text-text-secondary hover:border-brand/40'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between w-full font-bold">
                            <span className="text-text-primary">{f.label}</span>
                            {isSelected && <Check className="w-4 h-4 text-brand shrink-0" />}
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-brand font-semibold bg-brand/10 px-1.5 py-0.5 rounded border border-brand/20">
                              {f.tag}
                            </span>
                            <span className="text-[10px] text-text-muted">
                              • {f.category}
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-text-muted leading-relaxed mt-2">
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
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-brand" />
                    Desired Tone &amp; Style Persona ({TONE_OPTIONS.length})
                  </label>

                  {/* Tone Category Filter Tabs */}
                  <div className="flex flex-wrap items-center gap-1 bg-surface-muted p-1 rounded-lg border border-border">
                    {toneCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedToneCategory(cat)}
                        aria-pressed={selectedToneCategory === cat}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all ${
                          selectedToneCategory === cat
                            ? 'bg-brand text-white font-semibold shadow-sm'
                            : 'text-text-secondary hover:text-text-primary'
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
                        aria-pressed={isSelected}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-brand text-white border-brand shadow-md shadow-brand/20 font-semibold'
                            : 'bg-surface-card/60 border-border text-text-secondary hover:bg-surface-hover'
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

              {/* Advanced Options */}
              <div className="border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  aria-expanded={showAdvanced}
                  aria-controls="advanced-panel"
                  className="flex items-center justify-between w-full text-xs font-semibold text-text-secondary hover:text-brand transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-brand" />
                    <span>Advanced Customization &amp; Constraints</span>
                  </div>
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showAdvanced && (
                  <div id="advanced-panel" className="mt-4 space-y-4 p-4 rounded-xl bg-surface-muted border border-border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Target Audience */}
                      <div>
                        <label htmlFor="target-audience" className="text-xs font-medium text-text-secondary mb-1 block">
                          Target Audience / Persona
                        </label>
                        <input
                          id="target-audience"
                          type="text"
                          value={targetAudience}
                          onChange={(e) => setTargetAudience(e.target.value)}
                          placeholder={selectedDomain.placeholders.audience}
                          className="w-full p-2.5 text-xs rounded-lg border border-border bg-surface-input text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
                        />
                      </div>

                      {/* Output Character Limit (optional) */}
                      <div>
                        <label htmlFor="output-char-limit" className="text-xs font-medium text-text-secondary mb-1 block">
                          Output Character Limit <span className="text-text-muted font-normal">(optional)</span>
                        </label>
                        <div className="relative">
                          <input
                            id="output-char-limit"
                            type="number"
                            min={1}
                            max={100000}
                            step={100}
                            value={outputCharLimit}
                            onChange={(e) => setOutputCharLimit(e.target.value)}
                            placeholder={`Default: ${DEFAULT_OUTPUT_CHAR_LIMIT.toLocaleString()}`}
                            className="w-full p-2.5 pr-14 text-xs rounded-lg border border-border bg-surface-input text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
                          />
                          {outputCharLimit.trim() ? (
                            <button
                              type="button"
                              onClick={() => setOutputCharLimit('')}
                              title="Remove the character limit"
                              className="absolute inset-y-0 right-0 pr-2.5 text-[11px] font-medium text-text-muted hover:text-text-primary transition-colors"
                            >
                              Clear
                            </button>
                          ) : (
                            <span className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[11px] text-text-muted pointer-events-none">
                              No limit
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                          Maximum length of the engineered prompt in characters. Defaults to{' '}
                          {DEFAULT_OUTPUT_CHAR_LIMIT.toLocaleString()}; leave blank for no limit.
                        </p>
                      </div>

                      {/* Preferred Output Format */}
                      <div>
                        <label htmlFor="output-format" className="text-xs font-medium text-text-secondary mb-1 block">
                          Target Output Format
                        </label>
                        <select
                          id="output-format"
                          value={outputFormat}
                          onChange={(e: any) => setOutputFormat(e.target.value)}
                          className="w-full p-2.5 text-xs rounded-lg border border-border bg-surface-input text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
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
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-text-secondary">
                        <input
                          type="checkbox"
                          checked={includeConstraints}
                          onChange={(e) => setIncludeConstraints(e.target.checked)}
                          className="w-4 h-4 rounded border-border text-brand focus:ring-brand"
                        />
                        <span>Include Negative Constraints &amp; Guardrails (&quot;What NOT to do&quot;)</span>
                      </label>
                    </div>

                    {/* Additional Notes */}
                    <div>
                      <label htmlFor="additional-notes" className="text-xs font-medium text-text-secondary mb-1 block">
                        Additional Directives / Context
                      </label>
                      <textarea
                        id="additional-notes"
                        value={additionalNotes}
                        onChange={(e) => setAdditionalNotes(e.target.value)}
                        placeholder={selectedDomain.placeholders.additionalNotes}
                        rows={2}
                        className="w-full p-2.5 text-xs rounded-lg border border-border bg-surface-input text-text-primary focus:outline-none focus:ring-2 focus:ring-brand resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Action Bar: Generate is always visible */}
        <div className="sticky bottom-3 z-20">
          <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-surface-card/90 backdrop-blur-md p-3 shadow-xl shadow-black/15">
            {/* Current selection summary */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-text-secondary">
              <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-surface-muted border border-border">
                <Zap className="w-3 h-3 text-warning" />
                {selectedDomain.name}
              </span>
              <span className="px-2 py-1 rounded-md bg-surface-muted border border-border">{selectedFrameworkLabel}</span>
              <span className="px-2 py-1 rounded-md bg-surface-muted border border-border">{selectedToneLabel}</span>
              <span className="px-2 py-1 rounded-md bg-surface-muted border border-border capitalize">{outputFormat.replace('-', ' ')}</span>
              {outputCharLimit.trim() && (
                <span className="px-2 py-1 rounded-md bg-surface-muted border border-border">
                  ≤ {outputCharLimit.toLocaleString()} chars
                </span>
              )}
              {activeProvider && onSelectActiveModel && providerModels.length > 0 && (
                <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-surface-muted border border-border">
                  <Cpu className="w-3 h-3 text-brand shrink-0" />
                  <select
                    value={activeProvider.model}
                    onChange={(e) => onSelectActiveModel(e.target.value)}
                    disabled={isGenerating}
                    className="bg-transparent text-xs font-mono text-text-secondary focus:outline-none disabled:opacity-50 cursor-pointer"
                    title={`Model · ${activeProvider.name}`}
                    aria-label="Active model"
                  >
                    {providerModels.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </span>
              )}
              {!showStyle && (
                <button
                  type="button"
                  onClick={() => setShowStyle(true)}
                  className="ml-auto text-brand hover:underline font-medium"
                >
                  Customize
                </button>
              )}
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isGenerating || !topic.trim()}
              className="w-full py-3 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:via-indigo-400 hover:to-cyan-400 text-white shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2.5 disabled:opacity-50 transition-all duration-300 transform active:scale-[0.99]"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Engineering Prompt...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate &amp; Optimize Prompt</span>
                  <kbd className="ml-1 rounded-md border border-white/25 bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold opacity-80">
                    ⌘⏎
                  </kbd>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </GlassCard>
  );
}
