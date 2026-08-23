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
  PURPOSE_OPTIONS,
  STYLE_PRESETS,
} from '@/lib/image-prompts';
import {
  editImagePrompt,
  generateImagePromptStream,
  redoImagePromptStream,
  reverseEngineerImageToPrompt,
} from '@/lib/ai-client';
import { getProviderModelList } from '@/lib/storage';
import { DEFAULT_LOGO_INPUT, LOGO_EXAMPLE_TOPICS, LOGO_STYLE_PRESETS } from '@/lib/logo-prompts';
import { getKits, saveKit, deleteKit, PromptKit } from '@/lib/image-prompt-kits';
import { saveCustomImageRecipe } from '@/lib/image-style-recipes';
import { saveCustomLogoArchetype } from '@/lib/logo-archetypes';
import { Bookmark, Save } from 'lucide-react';
import {
  ImagePlatform,
  ImagePromptInput,
  ImagePromptOutputFormat,
  ImagePromptReferenceImage,
  ImageStyleRecipe,
  ImageStyleRecipeConfig,
  LogoArchetypeConfig,
  LogoArchetypeRecipe,
  ProviderConfig,
} from '@/types';
import { AiTemplateGeneratorModal } from './image-prompt/ai-template-generator-modal';
import { OutputPanel } from './image-prompt/output-panel';
import { PromptForm } from './image-prompt/prompt-form';
import { SavedGallery } from './image-prompt/saved-gallery';
import { StudioFormHandlers, StudioFormState, StudioMode } from './image-prompt/studio-types';
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
  const [mode, setMode] = useState<StudioMode>('image');
  const [purpose, setPurpose] = useState<string | undefined>(undefined);
  const [outputFormat, setOutputFormat] = useState<ImagePromptOutputFormat>('prose');
  const [logoType, setLogoType] = useState(DEFAULT_LOGO_INPUT.logoType);
  const [logoStyle, setLogoStyle] = useState(DEFAULT_LOGO_INPUT.logoStyle);
  const [palette, setPalette] = useState(DEFAULT_LOGO_INPUT.palette);
  const [brandName, setBrandName] = useState('');
  const [industry, setIndustry] = useState<string | undefined>(undefined);
  const [concept, setConcept] = useState<string | undefined>(undefined);
  const [shapeLanguage, setShapeLanguage] = useState<string | undefined>(undefined);
  const [typography, setTypography] = useState<string | undefined>(undefined);
  const [lockup, setLockup] = useState<string | undefined>(undefined);
  const [hiddenMeaning, setHiddenMeaning] = useState<string | undefined>(undefined);
  const [usage, setUsage] = useState<string[]>([]);
  const [boldness, setBoldness] = useState<string | undefined>(undefined);
  const [lighting, setLighting] = useState<string | undefined>(undefined);
  const [mood, setMood] = useState<string | undefined>(undefined);
  const [composition, setComposition] = useState<string | undefined>(undefined);
  const [camera, setCamera] = useState<string | undefined>(undefined);
  const [colorGrade, setColorGrade] = useState<string | undefined>(undefined);
  const [resolution, setResolution] = useState<string | undefined>(undefined);
  const [aspectRatio, setAspectRatio] = useState(DEFAULT_IMAGE_INPUT.aspectRatio);
  const [platforms, setPlatforms] = useState<ImagePlatform[]>(DEFAULT_IMAGE_INPUT.platforms);
  const [negativePrompt, setNegativePrompt] = useState('');
  const [inImageText, setInImageText] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [showArtDirection, setShowArtDirection] = useState(false);
  const [showRefine, setShowRefine] = useState(false);
  const [referenceImages, setReferenceImages] = useState<ImagePromptReferenceImage[]>([]);
  const [keepRefImages, setKeepRefImages] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [showAiTemplateModal, setShowAiTemplateModal] = useState(false);

  // ── Reverse-engineering state ──
  const [isReverseEngineering, setIsReverseEngineering] = useState(false);
  const [reverseEngineeringId, setReverseEngineeringId] = useState<string | null>(null);

  // ── Output state ──
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [sections, setSections] = useState<ImagePromptSections | null>(null);
  const [activeTab, setActiveTab] = useState<keyof ImagePromptSections | 'raw'>('raw');
  const abortControllerRef = useRef<AbortController | null>(null);

  // ── Saved gallery ──
  const [savedPrompts, setSavedPrompts] = useState<SavedImagePrompt[]>([]);

  // ── Version history (last N sections snapshots for comparison) ──
  const [previousSections, setPreviousSections] = useState<ImagePromptSections | null>(null);
  const [isRedoing, setIsRedoing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const redoAbortRef = useRef<AbortController | null>(null);

  // ── Brand / Subject Kits ──
  const [kits, setKits] = useState<PromptKit[]>([]);
  const [showKitDropdown, setShowKitDropdown] = useState(false);

  useEffect(() => {
    setSavedPrompts(getSavedImagePrompts());
    setKits(getKits());

    // Cleanup abort controllers on unmount (Fix D8)
    return () => {
      abortControllerRef.current?.abort();
      redoAbortRef.current?.abort();
    };
  }, []);

  /** Switching modes swaps the brief anatomy; logos are square-first artifacts. */
  const handleSetMode = (next: StudioMode) => {
    setMode(next);
    setSelectedRecipeId(null);
    if (next === 'logo') setAspectRatio('1:1');
    else setAspectRatio(DEFAULT_IMAGE_INPUT.aspectRatio);
  };

  const handleSelectImageRecipe = (recipe: ImageStyleRecipe | null) => {
    if (!recipe) {
      setSelectedRecipeId(null);
      return;
    }
    setSelectedRecipeId(recipe.id);
    if (!subject.trim() && recipe.config.sampleSubject) {
      setSubject(recipe.config.sampleSubject);
    }
    if (recipe.config.style) setStyle(recipe.config.style);
    if (recipe.config.camera) setCamera(recipe.config.camera);
    if (recipe.config.lighting) setLighting(recipe.config.lighting);
    if (recipe.config.composition) setComposition(recipe.config.composition);
    if (recipe.config.colorGrade) setColorGrade(recipe.config.colorGrade);
    if (recipe.config.mood) setMood(recipe.config.mood);
    if (recipe.config.aspectRatio) setAspectRatio(recipe.config.aspectRatio);
    if (recipe.config.negativePrompt) setNegativePrompt(recipe.config.negativePrompt);
    if (recipe.config.resolution) setResolution(recipe.config.resolution);
    toast.success('Style Recipe Applied', `Loaded "${recipe.label}" with matched optics & lighting.`);
  };

  const handleSelectLogoArchetype = (archetype: LogoArchetypeRecipe | null) => {
    if (!archetype) {
      setSelectedRecipeId(null);
      return;
    }
    setSelectedRecipeId(archetype.id);
    if (archetype.config.sampleBrandName && !brandName.trim()) {
      setBrandName(archetype.config.sampleBrandName);
    }
    if (archetype.config.sampleIndustry && !industry) {
      setIndustry(archetype.config.sampleIndustry);
    }
    if (archetype.config.sampleConcept && !concept) {
      setConcept(archetype.config.sampleConcept);
    }
    if (archetype.config.logoType) setLogoType(archetype.config.logoType);
    if (archetype.config.logoStyle) setLogoStyle(archetype.config.logoStyle);
    if (archetype.config.palette) setPalette(archetype.config.palette);
    if (archetype.config.shapeLanguage) setShapeLanguage(archetype.config.shapeLanguage);
    if (archetype.config.typography) setTypography(archetype.config.typography);
    if (archetype.config.lockup) setLockup(archetype.config.lockup);
    if (archetype.config.hiddenMeaning) setHiddenMeaning(archetype.config.hiddenMeaning);
    if (archetype.config.boldness) setBoldness(archetype.config.boldness);
    if (archetype.config.usage && archetype.config.usage.length > 0) {
      setUsage(archetype.config.usage);
    }
    if (archetype.config.negativePrompt) setNegativePrompt(archetype.config.negativePrompt);
    toast.success('Brand Archetype Applied', `Loaded "${archetype.label}" identity architecture.`);
  };

  const formState: StudioFormState = {
    subject,
    style,
    mode,
    purpose,
    outputFormat,
    logoType,
    logoStyle,
    palette,
    brandName,
    industry,
    concept,
    shapeLanguage,
    typography,
    lockup,
    hiddenMeaning,
    usage,
    boldness,
    lighting,
    mood,
    composition,
    camera,
    colorGrade,
    resolution,
    aspectRatio,
    platforms,
    negativePrompt,
    inImageText,
    additionalNotes,
    showArtDirection,
    showRefine,
    referenceImages,
    keepRefImages,
    selectedRecipeId,
  };

  const formHandlers: StudioFormHandlers = {
    setSubject,
    setStyle,
    setMode: handleSetMode,
    setPurpose,
    setOutputFormat,
    setLogoType,
    setLogoStyle,
    setPalette,
    setBrandName,
    setIndustry,
    setConcept,
    setShapeLanguage,
    setTypography,
    setLockup,
    setHiddenMeaning,
    setUsage,
    setBoldness,
    setLighting,
    setMood,
    setComposition,
    setCamera,
    setColorGrade,
    setResolution,
    setAspectRatio,
    togglePlatform: (id) =>
      setPlatforms((prev) =>
        prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
      ),
    setNegativePrompt,
    setInImageText,
    setAdditionalNotes,
    setShowArtDirection,
    setShowRefine,
    addReferenceImage: (img) => setReferenceImages((prev) => [...prev, img]),
    removeReferenceImage: (id) => setReferenceImages((prev) => prev.filter((r) => r.id !== id)),
    updateReferenceImagePurpose: (id, purpose) =>
      setReferenceImages((prev) => prev.map((r) => (r.id === id ? { ...r, purpose } : r))),
    setKeepRefImages,
    setSelectedRecipeId,
  };

  const buildInput = (): ImagePromptInput => ({
    subject: subject.trim(),
    style,
    mode,
    purpose,
    outputFormat,
    logoType: mode === 'logo' ? logoType : undefined,
    logoStyle: mode === 'logo' ? logoStyle : undefined,
    palette: mode === 'logo' ? palette : undefined,
    brandName: mode === 'logo' ? brandName.trim() || undefined : undefined,
    industry: mode === 'logo' ? industry || undefined : undefined,
    concept: mode === 'logo' ? concept || undefined : undefined,
    shapeLanguage: mode === 'logo' ? shapeLanguage || undefined : undefined,
    typography: mode === 'logo' ? typography || undefined : undefined,
    lockup: mode === 'logo' ? lockup || undefined : undefined,
    hiddenMeaning: mode === 'logo' ? hiddenMeaning || undefined : undefined,
    usage: mode === 'logo' && usage.length > 0 ? [...usage] : undefined,
    boldness: mode === 'logo' ? boldness || undefined : undefined,
    lighting: lighting || undefined,
    mood: mood || undefined,
    composition: composition || undefined,
    camera: camera || undefined,
    colorGrade: colorGrade || undefined,
    resolution: resolution || undefined,
    aspectRatio,
    platforms,
    negativePrompt: negativePrompt.trim() || undefined,
    inImageText: inImageText.trim() || undefined,
    additionalNotes: additionalNotes.trim() || undefined,
    referenceImages: referenceImages.length > 0 ? referenceImages : undefined,
  });

  const handleGenerate = async (notesOverride?: string) => {
    if (!subject.trim() || isGenerating) return;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsGenerating(true);
    setStreamingText('');
    // Snapshot current sections for version history comparison
    if (sections) {
      setPreviousSections(sections);
    } else {
      setPreviousSections(null);
    }
    setSections(null);
    setActiveTab('raw');

    // Remix suggestions pass the merged notes explicitly so the generation
    // always includes the tweak (avoids stale-closure reads of state).
    const input: ImagePromptInput =
      notesOverride !== undefined
        ? { ...buildInput(), additionalNotes: notesOverride.trim() || undefined }
        : buildInput();
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
        // Default to the purpose-matched platform tab when a purpose was selected
        const purposeOpt = purpose ? PURPOSE_OPTIONS.find((o) => o.id === purpose) : undefined;
        const purposePlatform = purposeOpt?.suggestPlatforms[0];
        const purposeTab =
          purposePlatform && tabs.some((t) => t.key === purposePlatform) ? purposePlatform : 'master';
        setActiveTab(purposeTab as keyof ImagePromptSections | 'raw');
        toast.success('Image prompts ready', 'Master + platform prompts are ready to copy.');
      },
      (error) => {
        setIsGenerating(false);
        setStreamingText(`⚠️ Couldn't generate this brief: ${error.message}`);
        toast.error("Couldn't generate this brief", error.message);
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

  const handleSave = () => {
    if (!sections?.master || !subject.trim()) return;
    const styleLabel =
      mode === 'logo'
        ? (LOGO_STYLE_PRESETS.find((s) => s.id === logoStyle)?.label ?? logoStyle)
        : (STYLE_PRESETS.find((s) => s.id === style)?.label ?? style);
    // Store the full parsed sections (minus the raw doc) + the exact form input
    // so the gallery can preview/copy every platform prompt and restore it.
    const { raw: _raw, ...sectionsCopy } = sections;
    const item: SavedImagePrompt = {
      id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: subject.trim().slice(0, 60),
      subject: subject.trim(),
      styleLabel,
      platforms,
      aspectRatio,
      master: sections.master,
      negative: sections.negative,
      mode,
      sections: sectionsCopy,
      input: buildInput(),
      referenceImages: keepRefImages && referenceImages.length > 0 ? referenceImages : undefined,
      createdAt: Date.now(),
    };
    setSavedPrompts(saveImagePrompt(item));
    toast.success('Saved to gallery', 'Reopen, preview, copy, or reuse it anytime.');
  };

  /** Restore a saved brief into the form (gallery → edit loop). */
  const handleRestore = (item: SavedImagePrompt) => {
    const inp = item.input;
    const rawMode = inp?.mode ?? item.mode ?? 'image';
    const restoredMode: StudioMode = (rawMode as string) === 'toastmasters' ? 'image' : rawMode;
    setSubject(inp?.subject ?? item.subject);
    setStyle(inp?.style ?? DEFAULT_IMAGE_INPUT.style);
    setMode(restoredMode);
    setPurpose(inp?.purpose ?? undefined);
    setOutputFormat(inp?.outputFormat ?? 'prose');
    setLogoType(inp?.logoType ?? DEFAULT_LOGO_INPUT.logoType);
    setLogoStyle(inp?.logoStyle ?? DEFAULT_LOGO_INPUT.logoStyle);
    setPalette(inp?.palette ?? DEFAULT_LOGO_INPUT.palette);
    setBrandName(inp?.brandName ?? '');
    setIndustry(inp?.industry ?? undefined);
    setConcept(inp?.concept ?? undefined);
    setShapeLanguage(inp?.shapeLanguage ?? undefined);
    setTypography(inp?.typography ?? undefined);
    setLockup(inp?.lockup ?? undefined);
    setHiddenMeaning(inp?.hiddenMeaning ?? undefined);
    setUsage(inp?.usage ?? []);
    setBoldness(inp?.boldness ?? undefined);
    setLighting(inp?.lighting ?? undefined);
    setMood(inp?.mood ?? undefined);
    setComposition(inp?.composition ?? undefined);
    setCamera(inp?.camera ?? undefined);
    setColorGrade(inp?.colorGrade ?? undefined);
    setResolution(inp?.resolution ?? undefined);
    setAspectRatio(inp?.aspectRatio ?? item.aspectRatio ?? DEFAULT_IMAGE_INPUT.aspectRatio);
    setPlatforms(
      inp?.platforms ?? (item.platforms.length > 0 ? item.platforms : DEFAULT_IMAGE_INPUT.platforms)
    );
    setNegativePrompt(inp?.negativePrompt ?? '');
    setInImageText(inp?.inImageText ?? '');
    setAdditionalNotes(inp?.additionalNotes ?? '');
    setReferenceImages(inp?.referenceImages ?? []);
    setKeepRefImages(false);
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      // ignore
    }
    toast.success('Brief loaded', 'Tweak any option and regenerate — or copy from the preview.');
  };

  /** Related-Prompts pattern: apply a remix suggestion and regenerate. */
  const handleRefineSuggestion = (suggestion: string) => {
    const merged = additionalNotes.trim() ? `${additionalNotes.trim()} — ${suggestion}` : suggestion;
    setAdditionalNotes(merged);
    toast.info('Remixing brief', suggestion);
    requestAnimationFrame(() => {
      handleGenerate(merged);
    });
  };

  /** Per-section redo: regenerate only one platform's prompt. */
  const handleRedoPlatform = async (platformKey: string) => {
    if (!sections || isRedoing) return;

    redoAbortRef.current?.abort();
    const controller = new AbortController();
    redoAbortRef.current = controller;

    setIsRedoing(true);
    // Save current as previous for comparison
    setPreviousSections(sections);
    setActiveTab(platformKey as keyof ImagePromptSections);

    // Strip 'raw' and build a clean sections record
    const { raw: _raw, ...cleanSections } = sections;
    const existingSections: Record<string, string> = {};
    for (const [k, v] of Object.entries(cleanSections)) {
      if (v && typeof v === 'string') existingSections[k] = v;
    }

    const input = buildInput();
    let fullText = '';

    await redoImagePromptStream(
      {
        provider: activeProvider,
        input,
        targetPlatform: platformKey,
        existingSections,
      },
      (chunk) => {
        fullText += chunk;
      },
      (completedText) => {
        setIsRedoing(false);
        const trimmed = completedText.trim();
        if (trimmed) {
          setSections((prev) => (prev ? { ...prev, [platformKey]: trimmed } : prev));
          toast.success(`${platformKey} prompt regenerated`, 'Only this section was updated.');
        } else {
          toast.error('Redo returned empty', 'The model did not produce output for this section.');
        }
      },
      (error) => {
        setIsRedoing(false);
        toast.error('Redo failed', error.message);
      },
      controller.signal
    );
  };

  /** Conversational Edit Mode ("Edit, don't re-roll"). */
  const handleEditPrompt = async (platformKey: string, basePrompt: string, instruction: string) => {
    if (isEditing) return;
    setIsEditing(true);
    try {
      toast.info('Applying edit', `Iterating ${platformKey} prompt…`);
      const result = await editImagePrompt({
        provider: activeProvider,
        basePrompt,
        editInstruction: instruction,
        platform: platformKey as ImagePlatform,
        mode,
      });
      if (result?.editedPrompt) {
        if (sections) {
          setPreviousSections(sections);
          setSections((prev) => (prev ? { ...prev, [platformKey]: result.editedPrompt } : prev));
        }
        toast.success('Prompt updated', result.deltaSummary || 'Conversational delta applied.');
      }
    } catch (err: any) {
      toast.error('Edit failed', err.message || 'Could not apply conversational edit');
    } finally {
      setIsEditing(false);
    }
  };

  /** Image-to-Prompt (Reverse Engineering). */
  const handleReverseEngineerImage = async (img: ImagePromptReferenceImage) => {
    setIsReverseEngineering(true);
    setReverseEngineeringId(img.id);
    try {
      toast.info('Analyzing image', 'Extracting subject, style, lighting, camera, and palette…');
      const result = await reverseEngineerImageToPrompt({
        provider: activeProvider,
        image: img,
        mode,
      });
      if (result?.extractedBrief) {
        const b = result.extractedBrief;
        if (b.subject) setSubject(b.subject);
        if (b.style) {
          if (mode === 'logo') setLogoStyle(b.style);
          else setStyle(b.style);
        }
        if (b.lighting) setLighting(b.lighting);
        if (b.camera) setCamera(b.camera);
        if (b.composition) setComposition(b.composition);
        if (b.mood) setMood(b.mood);
        if (b.colorGrade) setColorGrade(b.colorGrade);
        if (b.aspectRatio) setAspectRatio(b.aspectRatio);
        if (b.palette) setPalette(b.palette);
        if (b.inImageText) setInImageText(b.inImageText);
        if (b.brandName) setBrandName(b.brandName);
        if (b.logoType) setLogoType(b.logoType);
        if (b.shapeLanguage) setShapeLanguage(b.shapeLanguage);
        toast.success('Image reverse-engineered', 'The brief has been populated from your image.');
      }
    } catch (err: any) {
      toast.error('Reverse engineering failed', err.message || 'Could not analyze image');
    } finally {
      setIsReverseEngineering(false);
      setReverseEngineeringId(null);
    }
  };

  /** Save the current form state as a reusable, lossless Brand/Subject Kit. */
  const handleSaveKit = () => {
    if (!subject.trim()) return;
    const kit: PromptKit = {
      id: `kit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: subject.trim().slice(0, 40),
      subjectDescription: subject.trim(),
      stylePreset: mode === 'logo' ? logoStyle : style,
      imageStyle: mode === 'image' ? style : undefined,
      logoStyle: mode === 'logo' ? logoStyle : undefined,
      palette: mode === 'logo' ? palette : undefined,
      industry: mode === 'logo' ? industry : undefined,
      mode,
      brandName: mode === 'logo' ? brandName.trim() || undefined : undefined,
      logoType: mode === 'logo' ? logoType : undefined,
      concept: mode === 'logo' ? concept : undefined,
      shapeLanguage: mode === 'logo' ? shapeLanguage : undefined,
      typography: mode === 'logo' ? typography : undefined,
      lockup: mode === 'logo' ? lockup : undefined,
      hiddenMeaning: mode === 'logo' ? hiddenMeaning : undefined,
      usage: mode === 'logo' && usage.length > 0 ? [...usage] : undefined,
      boldness: mode === 'logo' ? boldness : undefined,
      lighting,
      mood,
      composition,
      camera,
      colorGrade,
      resolution,
      aspectRatio,
      outputFormat,
      purpose,
      platforms: [...platforms],
      negativePrompt: negativePrompt.trim() || undefined,
      inImageText: inImageText.trim() || undefined,
      additionalNotes: additionalNotes.trim() || undefined,
      createdAt: Date.now(),
    };
    setKits(saveKit(kit));
    toast.success('Kit saved', `"${kit.name}" can be loaded into any new brief.`);
  };

  /**
   * Save the current applied form state as a reusable Style Recipe / Brand
   * Archetype, using the same existing save functions AiTemplateGeneratorModal
   * calls — so it reappears in StyleRecipePicker identically to an AI-Template
   * generated recipe.
   */
  const handleSaveStyleRecipe = () => {
    if (!subject.trim()) return;
    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const label = subject.trim().slice(0, 40);
    if (mode === 'logo') {
      const config: LogoArchetypeConfig = {
        logoType,
        logoStyle,
        palette,
        shapeLanguage: shapeLanguage || '',
        typography: typography || '',
        lockup: lockup || '',
        hiddenMeaning,
        boldness: boldness || '',
        usage: [...usage],
        aspectRatio,
        negativePrompt: negativePrompt.trim() || undefined,
      };
      const archetype: LogoArchetypeRecipe = {
        id,
        label,
        category: 'Custom AI',
        summary: `Saved brand archetype for: "${label}"`,
        goal: 'creative',
        isAiGenerated: true,
        createdAt: Date.now(),
        config,
      };
      saveCustomLogoArchetype(archetype);
      toast.success('Style Recipe saved', `"${label}" can be applied from Style Recipe picker.`);
    } else {
      const config: ImageStyleRecipeConfig = {
        style,
        lighting,
        camera,
        composition,
        colorGrade,
        mood,
        aspectRatio,
        resolution,
        negativePrompt: negativePrompt.trim() || undefined,
      };
      const recipe: ImageStyleRecipe = {
        id,
        label,
        category: 'Custom AI',
        summary: `Saved style recipe for: "${label}"`,
        goal: 'stylized',
        aspectHint: aspectRatio,
        isAiGenerated: true,
        createdAt: Date.now(),
        config,
      };
      saveCustomImageRecipe(recipe);
      toast.success('Style Recipe saved', `"${label}" can be applied from Style Recipe picker.`);
    }
  };

  /** Load a saved kit into the current form. */
  const handleLoadKit = (kit: PromptKit) => {
    setSubject(kit.subjectDescription);
    if (kit.mode) handleSetMode(kit.mode);
    if (kit.imageStyle) setStyle(kit.imageStyle);
    else if (kit.stylePreset && kit.mode !== 'logo') setStyle(kit.stylePreset);
    if (kit.logoStyle) setLogoStyle(kit.logoStyle);
    else if (kit.stylePreset && kit.mode === 'logo') setLogoStyle(kit.stylePreset);
    if (kit.palette) setPalette(kit.palette);
    if (kit.industry) setIndustry(kit.industry);
    if (kit.brandName) setBrandName(kit.brandName);
    if (kit.logoType) setLogoType(kit.logoType);
    if (kit.concept) setConcept(kit.concept);
    if (kit.shapeLanguage) setShapeLanguage(kit.shapeLanguage);
    if (kit.typography) setTypography(kit.typography);
    if (kit.lockup) setLockup(kit.lockup);
    if (kit.hiddenMeaning) setHiddenMeaning(kit.hiddenMeaning);
    if (kit.usage) setUsage(kit.usage);
    if (kit.boldness) setBoldness(kit.boldness);
    if (kit.lighting) setLighting(kit.lighting);
    if (kit.mood) setMood(kit.mood);
    if (kit.composition) setComposition(kit.composition);
    if (kit.camera) setCamera(kit.camera);
    if (kit.colorGrade) setColorGrade(kit.colorGrade);
    if (kit.resolution) setResolution(kit.resolution);
    if (kit.aspectRatio) setAspectRatio(kit.aspectRatio);
    if (kit.outputFormat) setOutputFormat(kit.outputFormat);
    if (kit.purpose) setPurpose(kit.purpose);
    if (kit.platforms) setPlatforms(kit.platforms);
    if (kit.negativePrompt) setNegativePrompt(kit.negativePrompt);
    if (kit.inImageText) setInImageText(kit.inImageText);
    if (kit.additionalNotes) setAdditionalNotes(kit.additionalNotes);
    setShowKitDropdown(false);
    toast.success('Kit loaded', `"${kit.name}" pre-filled into the form.`);
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      /* ignore */
    }
  };

  const handleDeleteKit = (id: string) => {
    setKits(deleteKit(id));
  };

  const handleDeleteSaved = (id: string) => {
    setSavedPrompts(deleteSavedImagePrompt(id));
  };

  return (
    <div className="space-y-6">
      <StudioHeader platformCount={platforms.length} mode={mode} />

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
          kits={kits}
          onSaveKit={handleSaveKit}
          onSaveStyleRecipe={handleSaveStyleRecipe}
          onLoadKit={handleLoadKit}
          onDeleteKit={handleDeleteKit}
          showKitDropdown={showKitDropdown}
          onToggleKitDropdown={() => setShowKitDropdown(!showKitDropdown)}
          onReverseEngineerImage={handleReverseEngineerImage}
          isReverseEngineering={isReverseEngineering}
          reverseEngineeringId={reverseEngineeringId}
          onSelectImageRecipe={handleSelectImageRecipe}
          onSelectLogoArchetype={handleSelectLogoArchetype}
          onOpenAiGenerator={() => setShowAiTemplateModal(true)}
        />

        <div className="flex items-center gap-2 mt-4">
          <button
            type="button"
            onClick={handleSaveStyleRecipe}
            disabled={!subject.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-brand/20 hover:bg-brand/30 text-brand border border-brand/35 shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save as Style Recipe</span>
          </button>
        </div>

        {/* ── Right: Output & brief viewer ── */}
        <OutputPanel
          isGenerating={isGenerating}
          streamingText={streamingText}
          sections={sections}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeProvider={activeProvider}
          mode={mode}
          input={buildInput()}
          requestedPlatforms={platforms}
          onUseExample={() => setSubject(mode === 'logo' ? LOGO_EXAMPLE_TOPICS[0] : EXAMPLE_TOPICS[0])}
          onSave={handleSave}
          onNew={handleNew}
          onRefineSuggestion={handleRefineSuggestion}
          onRedoPlatform={handleRedoPlatform}
          onEditPrompt={handleEditPrompt}
          isEditing={isEditing}
          previousSections={previousSections}
          isRedoing={isRedoing}
        />
      </div>

      {/* ── Saved gallery (history) ── */}
      {savedPrompts.length > 0 && (
        <SavedGallery
          items={savedPrompts}
          onDelete={handleDeleteSaved}
          onClear={() => setSavedPrompts(clearSavedImagePrompts())}
          onRestore={handleRestore}
        />
      )}

      {/* ── AI Template Architect Modal ── */}
      <AiTemplateGeneratorModal
        isOpen={showAiTemplateModal}
        onClose={() => setShowAiTemplateModal(false)}
        mode={mode}
        activeProvider={activeProvider}
        onApplyImageRecipe={handleSelectImageRecipe}
        onApplyLogoArchetype={handleSelectLogoArchetype}
      />
    </div>
  );
}

