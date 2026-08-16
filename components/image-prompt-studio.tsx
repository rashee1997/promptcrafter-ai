'use client';

import React, { useEffect, useRef, useState } from 'react';
import { toast } from './toast';
import {
  buildOutputTabs,
  clearSavedImagePrompts,
  DEFAULT_IMAGE_INPUT,
  deleteSavedImagePrompt,
  EXAMPLE_TOPICS,
  getSavedImagePrompts,
  ImagePromptSections,
  parseImagePromptOutput,
  saveImagePrompt,
  SavedImagePrompt,
  STYLE_PRESETS,
} from '@/lib/image-prompts';
import { generateImagePromptStream } from '@/lib/ai-client';
import { getProviderModelList } from '@/lib/storage';
import { ImagePlatform, ImagePromptInput, ProviderConfig } from '@/types';
import { OutputPanel } from './image-prompt/output-panel';
import { PromptForm } from './image-prompt/prompt-form';
import { SavedGallery } from './image-prompt/saved-gallery';
import { StudioFormHandlers, StudioFormState } from './image-prompt/studio-types';
import { StudioHeader } from './image-prompt/studio-header';

interface ImagePromptStudioProps {
  activeProvider: ProviderConfig;
  /** Called when the user switches the active model of the active provider. */
  onSelectActiveModel?: (model: string) => void;
}

/**
 * Image Prompt Studio — orchestrates the image prompt form, the streaming
 * output panel, and the saved gallery. All UI is delegated to focused
 * sub-components under components/image-prompt/.
 */
export function ImagePromptStudio({ activeProvider, onSelectActiveModel }: ImagePromptStudioProps) {
  const providerModels = getProviderModelList(activeProvider);

  // ── Form state ──
  const [subject, setSubject] = useState('');
  const [style, setStyle] = useState(DEFAULT_IMAGE_INPUT.style);
  const [lighting, setLighting] = useState<string | undefined>(undefined);
  const [mood, setMood] = useState<string | undefined>(undefined);
  const [composition, setComposition] = useState<string | undefined>(undefined);
  const [aspectRatio, setAspectRatio] = useState(DEFAULT_IMAGE_INPUT.aspectRatio);
  const [platforms, setPlatforms] = useState<ImagePlatform[]>(DEFAULT_IMAGE_INPUT.platforms);
  const [negativePrompt, setNegativePrompt] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [showArtDirection, setShowArtDirection] = useState(false);

  // ── Output state ──
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [sections, setSections] = useState<ImagePromptSections | null>(null);
  const [activeTab, setActiveTab] = useState<keyof ImagePromptSections | 'raw'>('raw');
  const abortControllerRef = useRef<AbortController | null>(null);

  // ── Saved gallery ──
  const [savedPrompts, setSavedPrompts] = useState<SavedImagePrompt[]>([]);

  useEffect(() => {
    setSavedPrompts(getSavedImagePrompts());
  }, []);

  const formState: StudioFormState = {
    subject,
    style,
    lighting,
    mood,
    composition,
    aspectRatio,
    platforms,
    negativePrompt,
    additionalNotes,
    showArtDirection,
  };

  const formHandlers: StudioFormHandlers = {
    setSubject,
    setStyle,
    setLighting,
    setMood,
    setComposition,
    setAspectRatio,
    togglePlatform: (id) =>
      setPlatforms((prev) =>
        prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
      ),
    setNegativePrompt,
    setAdditionalNotes,
    setShowArtDirection,
  };

  const buildInput = (): ImagePromptInput => ({
    subject: subject.trim(),
    style,
    lighting: lighting || undefined,
    mood: mood || undefined,
    composition: composition || undefined,
    aspectRatio,
    platforms,
    negativePrompt: negativePrompt.trim() || undefined,
    additionalNotes: additionalNotes.trim() || undefined,
  });

  const handleGenerate = async () => {
    if (!subject.trim() || isGenerating) return;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsGenerating(true);
    setStreamingText('');
    setSections(null);
    setActiveTab('raw');

    const input = buildInput();
    let fullText = '';

    await generateImagePromptStream(
      { provider: activeProvider, input },
      (chunk) => {
        fullText += chunk;
        setStreamingText(fullText);
      },
      (completedText) => {
        setIsGenerating(false);
        let parsed = parseImagePromptOutput(completedText);
        const tabs = buildOutputTabs(parsed);
        if (tabs.length === 0) {
          // Model ignored the section format — fall back to a single prompt pane.
          parsed = { ...parsed, master: completedText.trim() };
        }
        setSections(parsed);
        setActiveTab('master');
        toast.success('Image prompts ready', 'Master + platform prompts are ready to copy.');
      },
      (error) => {
        setIsGenerating(false);
        setStreamingText(`⚠️ Couldn't research this brief: ${error.message}`);
        toast.error("Couldn't create the brief", error.message);
      },
      controller.signal
    );
  };

  const handleCancel = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsGenerating(false);
  };

  const handleNew = () => {
    handleCancel();
    setStreamingText('');
    setSections(null);
    setActiveTab('raw');
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`, 'Paste it straight into your image tool.');
    } catch {
      toast.error('Copy failed', 'Your browser blocked clipboard access.');
    }
  };

  const handleSave = () => {
    if (!sections?.master || !subject.trim()) return;
    const styleLabel = STYLE_PRESETS.find((s) => s.id === style)?.label ?? style;
    const item: SavedImagePrompt = {
      id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: subject.trim().slice(0, 60),
      subject: subject.trim(),
      styleLabel,
      platforms,
      aspectRatio,
      master: sections.master,
      negative: sections.negative,
      createdAt: Date.now(),
    };
    setSavedPrompts(saveImagePrompt(item));
    toast.success('Saved to gallery', 'Reopen it anytime from this tab.');
  };

  const handleDeleteSaved = (id: string) => {
    setSavedPrompts(deleteSavedImagePrompt(id));
  };

  return (
    <div className="space-y-6">
      <StudioHeader platformCount={platforms.length} />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(340px,5fr)_minmax(0,7fr)] gap-6 lg:items-start">
        {/* ── Left: Image prompt form ── */}
        <PromptForm
          state={formState}
          handlers={formHandlers}
          isGenerating={isGenerating}
          activeProvider={activeProvider}
          providerModels={providerModels}
          onSelectActiveModel={onSelectActiveModel}
          onSubmit={handleGenerate}
        />

        {/* ── Right: Output & brief viewer ── */}
        <OutputPanel
          isGenerating={isGenerating}
          streamingText={streamingText}
          sections={sections}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeProvider={activeProvider}
          onUseExample={() => setSubject(EXAMPLE_TOPICS[0])}
          onCopy={handleCopy}
          onSave={handleSave}
          onNew={handleNew}
        />
      </div>

      {/* ── Saved gallery ── */}
      {savedPrompts.length > 0 && (
        <SavedGallery
          items={savedPrompts}
          onCopy={handleCopy}
          onDelete={handleDeleteSaved}
          onClear={() => setSavedPrompts(clearSavedImagePrompts())}
        />
      )}
    </div>
  );
}
