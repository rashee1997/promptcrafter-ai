'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bookmark,
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
  Plus,
} from 'lucide-react';
import { DomainSelector } from './domain-selector';
import { Expandable } from './expandable';
import { GlassCard } from './glass-card';
import { DEFAULT_OUTPUT_CHAR_LIMIT, DOMAIN_PRESETS, FRAMEWORK_OPTIONS, TONE_OPTIONS } from '@/lib/domains';
import { getProviderModelList } from '@/lib/storage';
import {
  CodeFileAttachment,
  DomainPreset,
  FrameworkType,
  PdfAttachment,
  ProjectContext,
  PromptInput,
  ProviderConfig,
  TextStudioImageAttachment,
  TextStudioImagePurpose,
  ToneType,
} from '@/types';
import { ContextAttachmentPanel } from './context-attachment-panel';
import { formatProjectContext } from '@/lib/file-upload-utils';
import { CustomChipEditor, useCustomChipEntry } from './image-prompt/use-custom-chip-entry';

interface PromptFormProps {
  onGenerate: (input: PromptInput) => void;
  isGenerating: boolean;
  /** Active provider, used to show/switch the current model. */
  activeProvider?: ProviderConfig;
  /** Called when the user switches the active model of the active provider. */
  onSelectActiveModel?: (model: string) => void;
  // ── Phase 5: File, Project, PDF & Image Upload ──
  onAttachmentsChange?: (attachments: {
    codeFiles: CodeFileAttachment[];
    projectContext?: ProjectContext;
    pdfs: PdfAttachment[];
    images: TextStudioImageAttachment[];
  }) => void;
}

export function PromptForm({
  onGenerate,
  isGenerating,
  activeProvider,
  onSelectActiveModel,
  onAttachmentsChange,
}: PromptFormProps) {
  const providerModels = activeProvider ? getProviderModelList(activeProvider) : [];
  const [topic, setTopic] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<DomainPreset>(DOMAIN_PRESETS[0]);
  const [customDomainText, setCustomDomainText] = useState('');
  // Widen to string so custom typed values (not in the preset lists) can be
  // selected; they're cast to the closed unions when submitted.
  const [tone, setTone] = useState<string>('professional');
  const [framework, setFramework] = useState<string>('rtf');
  const [targetAudience, setTargetAudience] = useState('');
  const [outputFormat, setOutputFormat] = useState<'markdown' | 'json' | 'bullet-points' | 'xml' | 'structured-text'>('markdown');
  const [includeConstraints, setIncludeConstraints] = useState(true);
  const [includeExamples, setIncludeExamples] = useState(true);
  const [requireEvidence, setRequireEvidence] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState('');
  // Output character limit for the engineered prompt; blank string = no limit (optional).
  const [outputCharLimit, setOutputCharLimit] = useState<string>(String(DEFAULT_OUTPUT_CHAR_LIMIT));
  // ── Phase 5: Attachment state ──
  const [codeFiles, setCodeFiles] = useState<CodeFileAttachment[]>([]);
  const [projectContext, setProjectContext] = useState<ProjectContext | undefined>(undefined);
  const [pdfs, setPdfs] = useState<PdfAttachment[]>([]);
  const [images, setImages] = useState<TextStudioImageAttachment[]>([]);

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

  const frameworkCategories = ['All', 'Essentials', 'Problem solving', 'Advanced'];
  const toneCategories = ['All', 'Professional', 'Analytical', 'Creative', 'Supportive'];

  const filteredFrameworks = selectedFrameworkCategory === 'All'
    ? FRAMEWORK_OPTIONS
    : FRAMEWORK_OPTIONS.filter((f) => f.category === selectedFrameworkCategory);

  const filteredTones = selectedToneCategory === 'All'
    ? TONE_OPTIONS
    : TONE_OPTIONS.filter((t) => t.category === selectedToneCategory);

  const selectedFrameworkLabel = FRAMEWORK_OPTIONS.find((f) => f.value === framework)?.label ?? framework;
  const selectedToneLabel = TONE_OPTIONS.find((t) => t.value === tone)?.label ?? tone;

  // Custom value entry + saved presets for the text studio's two chip rows
  // (Structure / Tone of voice) — same shared hook the Image/Logo studio uses.
  const frameworkCustom = useCustomChipEntry({ field: 'framework', mode: 'text' });
  const toneCustom = useCustomChipEntry({ field: 'tone', mode: 'text' });

  // A value that matches no built-in preset renders as a selected custom chip.
  const frameworkIsCustom =
    !!framework &&
    !FRAMEWORK_OPTIONS.some((f) => f.value === framework) &&
    !frameworkCustom.saved.some((e) => e.value === framework);
  const toneIsCustom =
    !!tone &&
    !TONE_OPTIONS.some((t) => t.value === tone) &&
    !toneCustom.saved.some((e) => e.value === tone);

  const handleFrameworkConfirm = () => {
    const v = frameworkCustom.confirmDraft();
    if (v !== null) setFramework(v);
  };
  const handleFrameworkSave = async () => {
    const v = await frameworkCustom.saveDraft();
    if (v !== null) setFramework(v);
  };
  const handleToneConfirm = () => {
    const v = toneCustom.confirmDraft();
    if (v !== null) setTone(v);
  };
  const handleToneSave = async () => {
    const v = await toneCustom.saveDraft();
    if (v !== null) setTone(v);
  };

  const [customDomainError, setCustomDomainError] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    // Validate custom domain text is provided when Custom domain is selected
    if (selectedDomain.id === 'custom-domain' && !customDomainText.trim()) {
      setCustomDomainError('Please describe your domain before generating.');
      return;
    }
    setCustomDomainError('');

    const parsedLimit = Number(outputCharLimit);
    const hasLimit = outputCharLimit.trim() !== '' && Number.isFinite(parsedLimit) && parsedLimit > 0;

    onGenerate({
      topic: topic.trim(),
      domainId: selectedDomain.id,
      customDomain: selectedDomain.id === 'custom-domain' ? customDomainText : undefined,
      tone: tone as ToneType,
      framework: framework as FrameworkType,
      targetAudience: targetAudience.trim() || undefined,
      outputFormat,
      includeConstraints,
      includeExamples,
      requireEvidence,
      additionalNotes: additionalNotes.trim() || undefined,
      outputCharLimit: hasLimit ? Math.floor(parsedLimit) : undefined,
    });

    // Pass attachments up to the parent for inclusion in the API request
    if (onAttachmentsChange) {
      onAttachmentsChange({ codeFiles, projectContext, pdfs, images });
    }
  };

  // Keep the palette listener pointed at the latest handleSubmit closure
  handleSubmitRef.current = handleSubmit;

  // ⌘/Ctrl+Enter generates from anywhere in the form (including textareas)
  const handleFormKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit()
    }
  };

  return (
    <GlassCard variant="default" className="p-5 sm:p-6 space-y-6">
      <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="space-y-6">
        {/* Topic Input Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">              <label htmlFor="topic-input" className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-warning" />
              Goal or topic
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
              <span>⌘+Enter to create</span>
              <span>•</span>
              <span>Press / to jump here</span>
              <span>•</span>
              <span>{topic.length} chars</span>
            </div>
          </div>
        </div>

        {/* Domain Selector Component — current selections feed the dynamic example chips */}
        <DomainSelector
          selectedDomainId={selectedDomain.id}
          onSelectDomain={setSelectedDomain}
          onPickExampleTopic={(example) => setTopic(example)}
          currentInput={{
            domainId: selectedDomain.id,
            tone: tone as ToneType,
            framework: framework as FrameworkType,
            targetAudience: targetAudience.trim() || undefined,
          }}
        />

        {/* Custom Domain Context if Custom Selected */}
        {selectedDomain.id === 'custom-domain' && (
          <div className="space-y-1.5 p-3 rounded-xl bg-brand/5 border border-brand/20">
            <label htmlFor="custom-domain-input" className="text-xs font-semibold text-text-primary">
              Add your own context
            </label>              <input
              id="custom-domain-input"
              type="text"
              value={customDomainText}
              onChange={(e) => {
                setCustomDomainText(e.target.value);
                if (customDomainError) setCustomDomainError('');
              }}
              placeholder="e.g. Healthcare clinical trials or game design"
              className={`w-full p-2.5 text-xs rounded-lg border bg-surface-input text-text-primary focus:outline-none focus:ring-2 focus:ring-brand ${
                customDomainError ? 'border-danger focus:ring-danger' : 'border-border'
              }`}
            />
            {customDomainError && (
              <p className="text-[11px] text-danger mt-1" role="alert">{customDomainError}</p>
            )}
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
              <span>Style &amp; options</span>
              <span className="hidden md:flex items-center gap-1.5 text-[10px] font-medium text-text-muted">
                ({selectedFrameworkLabel} · {selectedToneLabel} · {outputFormat})
              </span>
            </div>
            {showStyle ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <Expandable open={showStyle} id="style-panel" className="mt-4 space-y-6">
              {/* Prompt Framework Selector */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-brand" />
                    Structure ({FRAMEWORK_OPTIONS.length})
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
                          {f.bestFor || f.description}
                        </p>
                      </button>
                    );
                  })}

                  {/* Saved custom frameworks — bookmarked cards, deletable on hover. */}
                  {frameworkCustom.saved.map((entry) => {
                    const isSelected = framework === entry.value;
                    return (
                      <div key={entry.id} className="relative group">
                        <button
                          type="button"
                          onClick={() => setFramework(entry.value)}
                          title={`Saved: ${entry.label}`}
                          aria-pressed={isSelected}
                          className={`p-3 rounded-xl border text-left transition-all text-xs flex items-center gap-2 w-full ${
                            isSelected
                              ? 'bg-brand/15 border-brand text-text-primary ring-2 ring-brand/30 shadow-md shadow-brand/10'
                              : 'bg-surface-card/40 border-border text-text-secondary hover:border-brand/40'
                          }`}
                        >
                          <Bookmark className="w-3.5 h-3.5 shrink-0 text-warning" />
                          <span className="truncate font-bold text-text-primary">{entry.label}</span>
                          {isSelected && <Check className="w-4 h-4 text-brand shrink-0 ml-auto" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => frameworkCustom.remove(entry.id)}
                          title="Delete saved value"
                          aria-label={`Delete saved value ${entry.label}`}
                          className="absolute -top-1.5 -right-1.5 hidden group-hover:flex items-center justify-center w-4 h-4 rounded-full bg-surface-elevated border border-border text-text-muted hover:text-danger shadow-sm transition-colors"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    );
                  })}

                  {/* Trailing cell: selected custom value, the inline editor, or the trigger. */}
                  {frameworkIsCustom ? (
                    <button
                      type="button"
                      onClick={() => setFramework(framework)}
                      title="Custom value"
                      aria-pressed
                      className="p-3 rounded-xl border text-left transition-all text-xs flex items-center gap-2 bg-brand/15 border-brand text-text-primary ring-2 ring-brand/30 shadow-md shadow-brand/10"
                    >
                      <Plus className="w-3.5 h-3.5 text-brand shrink-0" />
                      <span className="truncate font-bold">{framework}</span>
                      <Check className="w-4 h-4 text-brand shrink-0 ml-auto" />
                    </button>
                  ) : frameworkCustom.entering ? (
                    <div className="sm:col-span-2">
                      <CustomChipEditor
                        draft={frameworkCustom.draft}
                        onDraftChange={frameworkCustom.changeDraft}
                        onConfirm={handleFrameworkConfirm}
                        onSave={handleFrameworkSave}
                        onCancel={frameworkCustom.cancel}
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={frameworkCustom.begin}
                      aria-label="Add a custom structure value"
                      className="p-3 rounded-xl border border-dashed text-left transition-all text-xs flex items-center gap-2 border-border text-text-muted hover:text-brand hover:border-brand/40"
                    >
                      <Plus className="w-3.5 h-3.5 shrink-0" />
                      Custom
                    </button>
                  )}
                </div>
              </div>

              {/* Tone Selector Pills */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-brand" />
                    Tone of voice ({TONE_OPTIONS.length})
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

                  {/* Saved custom tones — bookmarked pills, deletable on hover. */}
                  {toneCustom.saved.map((entry) => {
                    const isSelected = tone === entry.value;
                    return (
                      <div key={entry.id} className="relative group">
                        <button
                          type="button"
                          onClick={() => setTone(entry.value)}
                          title={`Saved: ${entry.label}`}
                          aria-pressed={isSelected}
                          className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-brand/15 border-brand text-text-primary ring-2 ring-brand/30'
                              : 'bg-surface-card/60 border-border text-text-secondary hover:bg-surface-hover'
                          }`}
                        >
                          <Bookmark className="w-3 h-3 shrink-0 text-warning" />
                          <span className="max-w-[160px] truncate">{entry.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-brand shrink-0" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => toneCustom.remove(entry.id)}
                          title="Delete saved value"
                          aria-label={`Delete saved value ${entry.label}`}
                          className="absolute -top-1.5 -right-1.5 hidden group-hover:flex items-center justify-center w-4 h-4 rounded-full bg-surface-elevated border border-border text-text-muted hover:text-danger shadow-sm transition-colors"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    );
                  })}

                  {/* Confirmed custom tone — selected pill that reads like any other. */}
                  {toneIsCustom && (
                    <button
                      type="button"
                      onClick={() => setTone(tone)}
                      title="Custom value"
                      aria-pressed
                      className="px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left flex items-center gap-1.5 bg-brand/15 border-brand text-text-primary ring-2 ring-brand/30"
                    >
                      <Plus className="w-3 h-3 text-brand shrink-0" />
                      <span className="max-w-[160px] truncate">{tone}</span>
                      <Check className="w-3.5 h-3.5 text-brand shrink-0" />
                    </button>
                  )}

                  {toneCustom.entering ? (
                    <CustomChipEditor
                      draft={toneCustom.draft}
                      onDraftChange={toneCustom.changeDraft}
                      onConfirm={handleToneConfirm}
                      onSave={handleToneSave}
                      onCancel={toneCustom.cancel}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={toneCustom.begin}
                      aria-label="Add a custom tone value"
                      className="px-3 py-2 rounded-xl text-xs font-medium border border-dashed transition-all text-left flex items-center gap-1.5 border-border text-text-muted hover:text-brand hover:border-brand/40"
                    >
                      <Plus className="w-3 h-3 shrink-0" />
                      Custom
                    </button>
                  )}
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
                    <span>Advanced options</span>
                  </div>
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                <Expandable open={showAdvanced} id="advanced-panel" className="mt-4 space-y-4 p-4 rounded-xl bg-surface-muted border border-border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Target Audience */}
                      <div>
                        <label htmlFor="target-audience" className="text-xs font-medium text-text-secondary mb-1 block">
                          Target audience
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
                          Maximum length <span className="text-text-muted font-normal">(optional)</span>
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
                              title="Remove the length limit"
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
                          The longest the prompt can be. Defaults to{' '}
                          {DEFAULT_OUTPUT_CHAR_LIMIT.toLocaleString()} characters; leave blank for no limit.
                        </p>
                      </div>

                      {/* Preferred Output Format */}
                      <div>
                        <label htmlFor="output-format" className="text-xs font-medium text-text-secondary mb-1 block">
                          Output format
                        </label>
                        <select
                          id="output-format"
                          value={outputFormat}
                          onChange={(e: any) => setOutputFormat(e.target.value)}
                          className="w-full p-2.5 text-xs rounded-lg border border-border bg-surface-input text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
                        >
                          <option value="markdown">Sections</option>
                          <option value="bullet-points">Bullet points</option>
                          <option value="json">JSON</option>
                          <option value="xml">XML</option>
                          <option value="structured-text">Plain text</option>
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
                        <span>Add &quot;what to avoid&quot; guidance</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-text-secondary">
                        <input
                          type="checkbox"
                          checked={requireEvidence}
                          onChange={(e) => setRequireEvidence(e.target.checked)}
                          className="w-4 h-4 rounded border-border text-brand focus:ring-brand"
                        />
                        <span>Require evidence for factual claims</span>
                      </label>
                    </div>

                    {/* Additional Notes */}
                    <div>
                      <label htmlFor="additional-notes" className="text-xs font-medium text-text-secondary mb-1 block">
                        Additional notes
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
                  </Expandable>
              </div>
            </Expandable>
        </div>

        {/* ── Phase 5: File, Project, PDF & Image Upload ── */}
          <ContextAttachmentPanel
            codeFiles={codeFiles}
            projectContext={projectContext}
            onAddFile={(file) => setCodeFiles((prev) => [...prev, file])}
            onSetProject={(ctx) => { setProjectContext(ctx); setCodeFiles([]); }}
            onClearFiles={() => { setCodeFiles([]); setProjectContext(undefined); }}
            onRemoveFile={(id) => {
              setCodeFiles((prev) => prev.filter((f) => f.id !== id));
              if (projectContext) setProjectContext(undefined);
            }}
            pdfs={pdfs}
            onAddPdf={(pdf) => setPdfs((prev) => [...prev, pdf])}
            onRemovePdf={(id) => setPdfs((prev) => prev.filter((p) => p.id !== id))}
            images={images}
            onAddImage={(img) => setImages((prev) => [...prev, img])}
            onRemoveImage={(id) => setImages((prev) => prev.filter((i) => i.id !== id))}
            onUpdateImagePurpose={(id, purpose) =>
              setImages((prev) => prev.map((i) => i.id === id ? { ...i, purpose } : i))
            }
          />

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
              className="w-full py-3 px-6 rounded-xl font-bold text-sm bg-brand hover:bg-brand-hover text-white shadow-glow flex items-center justify-center gap-2.5 disabled:opacity-50 transition-all duration-300 transform active:scale-[0.985]"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating…</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Create Prompt</span>
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
