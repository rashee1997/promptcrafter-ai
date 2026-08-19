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
  TOASTMASTERS_ASSET_CATALOG,
  TOASTMASTERS_COLORS,
  getAssetEntry,
} from '@/lib/toastmasters-prompts';
import {
  DomainPreset,
  FrameworkType,
  PromptInput,
  ProviderConfig,
  StudioMode,
  ToastmastersAssetId,
  ToastmastersInput,
  ToneType,
} from '@/types';
import { CustomChipEditor, useCustomChipEntry } from './image-prompt/use-custom-chip-entry';

interface PromptFormProps {
  onGenerate: (input: PromptInput) => void;
  isGenerating: boolean;
  /** Active provider, used to show/switch the current model. */
  activeProvider?: ProviderConfig;
  /** Called when the user switches the active model of the active provider. */
  onSelectActiveModel?: (model: string) => void;
  /** Current studio mode (prompt | toastmasters). */
  studioMode?: StudioMode;
  /** Called when the user switches studio mode. */
  onStudioModeChange?: (mode: StudioMode) => void;
  /** Called when the user submits a Toastmasters request. */
  onToastmastersGenerate?: (input: ToastmastersInput) => void;
}

export function PromptForm({
  onGenerate,
  isGenerating,
  activeProvider,
  onSelectActiveModel,
  studioMode = 'prompt',
  onStudioModeChange,
  onToastmastersGenerate,
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
  const [additionalNotes, setAdditionalNotes] = useState('');
  // Output character limit for the engineered prompt; blank string = no limit (optional).
  const [outputCharLimit, setOutputCharLimit] = useState<string>(String(DEFAULT_OUTPUT_CHAR_LIMIT));
  const [showStyle, setShowStyle] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedFrameworkCategory, setSelectedFrameworkCategory] = useState<string>('All');
  const [selectedToneCategory, setSelectedToneCategory] = useState<string>('All');

  // ── Toastmasters mode state ──
  const tmDefaultAsset = TOASTMASTERS_ASSET_CATALOG[0];
  const [tmAssetTypes, setTmAssetTypes] = useState<ToastmastersAssetId[]>(['event-flyer']);
  const [tmDominantColor, setTmDominantColor] = useState<'loyal-blue' | 'true-maroon'>('loyal-blue');
  const [tmOutputMode, setTmOutputMode] = useState<'full' | 'white-removable'>('full');
  const [tmTextMode, setTmTextMode] = useState<'with-text' | 'text-free'>('with-text');
  const [tmLanguage, setTmLanguage] = useState<'english' | 'tamil' | 'bilingual'>('english');
  const [tmIncludeLogo, setTmIncludeLogo] = useState(true);
  const [tmIncludeSpeakers, setTmIncludeSpeakers] = useState(false);
  const [tmSpeakerCount, setTmSpeakerCount] = useState(2);
  const [tmClubName, setTmClubName] = useState('');
  const [tmEventTitle, setTmEventTitle] = useState('');
  const [tmEventDate, setTmEventDate] = useState('');
  const [tmEventTime, setTmEventTime] = useState('');
  const [tmEventVenue, setTmEventVenue] = useState('');
  const [tmTamilText, setTmTamilText] = useState('');

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

  // ── Toastmasters submit ──
  const handleToastmastersSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (tmAssetTypes.length === 0 || !onToastmastersGenerate) return;

    const tmInput: ToastmastersInput = {
      assetTypes: tmAssetTypes,
      dominantColor: tmDominantColor,
      outputMode: tmOutputMode,
      textMode: tmTextMode,
      language: tmLanguage,
      includeLogoPlaceholder: tmIncludeLogo,
      includeSpeakerPlaceholders: tmIncludeSpeakers,
      speakerCount: tmSpeakerCount,
      clubName: tmClubName,
      eventTitle: tmEventTitle,
      eventDate: tmEventDate,
      eventTime: tmEventTime,
      eventVenue: tmEventVenue,
      tamilText: tmTamilText,
    };

    onToastmastersGenerate(tmInput);
  };

  // Auto-toggle placeholder defaults when asset selection or text mode changes
  useEffect(() => {
    const anySpeakerEligible = tmAssetTypes.some((id) => getAssetEntry(id).speakerEligible);
    const isBackgroundOnly = tmAssetTypes.length === 1 && tmAssetTypes[0] === 'background-theme';
    if (isBackgroundOnly) {
      setTmIncludeLogo(false);
      setTmIncludeSpeakers(false);
    } else {
      const first = getAssetEntry(tmAssetTypes[0] ?? 'event-flyer');
      setTmIncludeLogo(first.defaultLogoPlaceholder);
      setTmIncludeSpeakers(anySpeakerEligible ? first.defaultSpeakerPlaceholder : false);
    }
  }, [tmAssetTypes]);

  useEffect(() => {
    if (tmTextMode === 'text-free') {
      setTmIncludeLogo(false);
      setTmIncludeSpeakers(false);
    }
  }, [tmTextMode]);

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

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

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
      if (isToastmasters) {
        handleToastmastersSubmit();
      } else {
        handleSubmit();
      }
    }
  };

  const isToastmasters = studioMode === 'toastmasters';

  return (
    <GlassCard variant="default" className="p-5 sm:p-6 space-y-6">
      {/* ── Studio Mode Tabs ── */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-muted border border-border">
        {([
          { id: 'prompt' as StudioMode, label: 'Prompt', icon: '⚡' },
          { id: 'toastmasters' as StudioMode, label: 'Toastmasters', icon: '🎤' },
        ]).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onStudioModeChange?.(tab.id)}
            aria-pressed={studioMode === tab.id}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              studioMode === tab.id
                ? 'bg-brand text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Toastmasters Mode ── */}
      {isToastmasters && (
        <form onSubmit={handleToastmastersSubmit} onKeyDown={handleFormKeyDown} className="space-y-6">
          {/* Asset Type Multi-Select */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              🎨 Asset Type
              <span className="text-[10px] font-normal text-text-muted normal-case tracking-normal">— select one or more</span>
            </label>
            {(['Social', 'Print / Flyer', 'Magazine', 'Background / Theme'] as const).map((cat) => {
              const catAssets = TOASTMASTERS_ASSET_CATALOG.filter((a) => a.category === cat);
              if (catAssets.length === 0) return null;
              return (
                <div key={cat} className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted pl-1">{cat}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {catAssets.map((asset) => {
                      const selected = tmAssetTypes.includes(asset.id);
                      return (
                        <button
                          key={asset.id}
                          type="button"
                          onClick={() => {
                            setTmAssetTypes((prev) =>
                              selected ? prev.filter((id) => id !== asset.id) : [...prev, asset.id]
                            );
                          }}
                          aria-pressed={selected}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                            selected
                              ? 'bg-brand text-white border-brand shadow-sm'
                              : 'bg-surface-card/60 border-border text-text-secondary hover:bg-surface-hover'
                          }`}
                        >
                          {asset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dominant Colour */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Dominant Colour</label>
            <div className="flex gap-2">
              {(['loyal-blue', 'true-maroon'] as const).map((color) => {
                const c = TOASTMASTERS_COLORS[color];
                const selected = tmDominantColor === color;
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setTmDominantColor(color)}
                    aria-pressed={selected}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      selected
                        ? 'border-brand ring-2 ring-brand/30 shadow-md shadow-brand/10'
                        : 'border-border hover:border-brand/40'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-text-primary">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Output Mode */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Output Mode</label>
            <div className="flex gap-2">
              {([
                { id: 'full' as const, label: 'Full Asset', desc: 'Complete visual with gradient/texture' },
                { id: 'white-removable' as const, label: 'White Removable', desc: 'Flat background for easy removal' },
              ]).map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setTmOutputMode(mode.id)}
                  aria-pressed={tmOutputMode === mode.id}
                  className={`flex-1 p-2.5 rounded-xl text-xs font-semibold border text-left transition-all ${
                    tmOutputMode === mode.id
                      ? 'bg-brand/15 border-brand text-text-primary ring-2 ring-brand/30'
                      : 'bg-surface-card/40 border-border text-text-secondary hover:border-brand/40'
                  }`}
                >
                  <span className="block font-bold">{mode.label}</span>
                  <span className="block text-[10px] text-text-muted font-normal mt-0.5">{mode.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Text Mode */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Text Mode</label>
            <div className="flex gap-2">
              {([
                { id: 'with-text' as const, label: 'With Text', desc: 'Render event text in the image' },
                { id: 'text-free' as const, label: 'Text-Free Template', desc: 'No text — overlay in post-production' },
              ]).map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setTmTextMode(mode.id)}
                  aria-pressed={tmTextMode === mode.id}
                  className={`flex-1 p-2.5 rounded-xl text-xs font-semibold border text-left transition-all ${
                    tmTextMode === mode.id
                      ? 'bg-brand/15 border-brand text-text-primary ring-2 ring-brand/30'
                      : 'bg-surface-card/40 border-border text-text-secondary hover:border-brand/40'
                  }`}
                >
                  <span className="block font-bold">{mode.label}</span>
                  <span className="block text-[10px] text-text-muted font-normal mt-0.5">{mode.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Language</label>
            <div className="flex gap-1.5">
              {([
                { id: 'english' as const, label: 'English' },
                { id: 'tamil' as const, label: 'Tamil' },
                { id: 'bilingual' as const, label: 'Bilingual (EN + TA)' },
              ]).map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setTmLanguage(lang.id)}
                  aria-pressed={tmLanguage === lang.id}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                    tmLanguage === lang.id
                      ? 'bg-brand text-white border-brand shadow-sm'
                      : 'bg-surface-card/60 border-border text-text-secondary hover:bg-surface-hover'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
            {(tmLanguage === 'tamil' || tmLanguage === 'bilingual') && (
              <div className="p-3 rounded-xl bg-warning/5 border border-warning/30">
                <p className="text-[11px] text-warning font-semibold flex items-center gap-1.5 mb-2">
                  ⚠️ Verify before publishing
                </p>
                <p className="text-[10px] text-text-muted leading-relaxed mb-2">
                  Tamil rendering quality depends on the image model's script support. Always verify the Tamil text is correctly rendered before sharing publicly.
                </p>
                <label className="text-[10px] font-semibold text-text-secondary block mb-1">Tamil text (verbatim — do not translate)</label>
                <textarea
                  value={tmTamilText}
                  onChange={(e) => setTmTamilText(e.target.value)}
                  placeholder="Type or paste the Tamil text exactly as it should appear"
                  rows={3}
                  className="w-full p-2.5 text-sm rounded-lg border border-border bg-surface-input text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand resize-none"
                />
              </div>
            )}
          </div>

          {/* Placeholder Toggles */}
          <div className="space-y-3 p-3 rounded-xl bg-surface-muted border border-border">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Placeholders</span>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-text-secondary">
              <input
                type="checkbox"
                checked={tmIncludeLogo}
                onChange={(e) => setTmIncludeLogo(e.target.checked)}
                className="w-4 h-4 rounded border-border text-brand focus:ring-brand"
              />
              <span>Include logo placeholder frame</span>
            </label>

            {tmAssetTypes.some((id) => getAssetEntry(id).speakerEligible) && (
              <>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-text-secondary">
                  <input
                    type="checkbox"
                    checked={tmIncludeSpeakers}
                    onChange={(e) => setTmIncludeSpeakers(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-brand focus:ring-brand"
                  />
                  <span>Include speaker placeholders</span>
                </label>
                {tmIncludeSpeakers && (
                  <div className="pl-6">
                    <label className="text-[10px] font-semibold text-text-secondary block mb-1">Number of speakers</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={tmSpeakerCount}
                      onChange={(e) => setTmSpeakerCount(Math.max(1, Math.min(12, Number(e.target.value) || 1)))}
                      className="w-20 p-1.5 text-xs rounded-lg border border-border bg-surface-input text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Event Text Fields */}
          <div className={`space-y-3 p-3 rounded-xl bg-surface-muted border border-border ${tmTextMode === 'text-free' ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Event Details</span>
              {tmTextMode === 'text-free' && (
                <span className="text-[10px] font-semibold text-warning">Disabled — text-free mode</span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-semibold text-text-secondary block mb-1">Club Name</label>
                <input
                  type="text"
                  value={tmClubName}
                  onChange={(e) => setTmClubName(e.target.value)}
                  placeholder="e.g., Chennai Speakers Club"
                  className="w-full p-2 text-xs rounded-lg border border-border bg-surface-input text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand"
                  disabled={tmTextMode === 'text-free'}
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-text-secondary block mb-1">Event Title</label>
                <input
                  type="text"
                  value={tmEventTitle}
                  onChange={(e) => setTmEventTitle(e.target.value)}
                  placeholder="e.g., Monthly Meeting — The Art of Public Speaking"
                  className="w-full p-2 text-xs rounded-lg border border-border bg-surface-input text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand"
                  disabled={tmTextMode === 'text-free'}
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-text-secondary block mb-1">Date</label>
                <input
                  type="text"
                  value={tmEventDate}
                  onChange={(e) => setTmEventDate(e.target.value)}
                  placeholder="e.g., Saturday, August 23, 2026"
                  className="w-full p-2 text-xs rounded-lg border border-border bg-surface-input text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand"
                  disabled={tmTextMode === 'text-free'}
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-text-secondary block mb-1">Time</label>
                <input
                  type="text"
                  value={tmEventTime}
                  onChange={(e) => setTmEventTime(e.target.value)}
                  placeholder="e.g., 6:00 PM IST"
                  className="w-full p-2 text-xs rounded-lg border border-border bg-surface-input text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand"
                  disabled={tmTextMode === 'text-free'}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-semibold text-text-secondary block mb-1">Venue / Link</label>
                <input
                  type="text"
                  value={tmEventVenue}
                  onChange={(e) => setTmEventVenue(e.target.value)}
                  placeholder="e.g., Online via Zoom / Community Hall, 2nd Floor"
                  className="w-full p-2 text-xs rounded-lg border border-border bg-surface-input text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand"
                  disabled={tmTextMode === 'text-free'}
                />
              </div>
            </div>
          </div>

          {/* Sticky Toastmasters Action Bar */}
          <div className="sticky bottom-3 z-20">
            <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-surface-card/90 backdrop-blur-md p-3 shadow-xl shadow-black/15">
              {/* Selection summary */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-text-secondary">
                <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-surface-muted border border-border">
                  🎤 {tmAssetTypes.length} asset{tmAssetTypes.length === 1 ? '' : 's'}
                </span>
                <span className="px-2 py-1 rounded-md bg-surface-muted border border-border">
                  {TOASTMASTERS_COLORS[tmDominantColor].name}
                </span>
                <span className="px-2 py-1 rounded-md bg-surface-muted border border-border">
                  {tmOutputMode === 'full' ? 'Full Asset' : 'White Removable'}
                </span>
                <span className="px-2 py-1 rounded-md bg-surface-muted border border-border">
                  {tmTextMode === 'with-text' ? 'With Text' : 'Text-Free'}
                </span>
                <span className="px-2 py-1 rounded-md bg-surface-muted border border-border capitalize">
                  {tmLanguage}
                </span>
              </div>

              <button
                type="submit"
                disabled={isGenerating || tmAssetTypes.length === 0}
                className="w-full py-3 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:via-indigo-400 hover:to-cyan-400 text-white shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2.5 disabled:opacity-50 transition-all duration-300 transform active:scale-[0.99]"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating…</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Create Toastmasters Prompt{tmAssetTypes.length > 1 ? ' Kit' : ''}</span>
                    <kbd className="ml-1 rounded-md border border-white/25 bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold opacity-80">
                      ⌘⏎
                    </kbd>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ── Standard Prompt Mode ── */}
      {!isToastmasters && (
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
            </label>
            <input
              id="custom-domain-input"
              type="text"
              value={customDomainText}
              onChange={(e) => setCustomDomainText(e.target.value)}
              placeholder="e.g. Healthcare clinical trials or game design"
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
                          {f.description}
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
      )}
    </GlassCard>
  );
}
