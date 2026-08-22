'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { AppTab, Navbar } from '@/components/navbar';
import { ImagePromptStudio } from '@/components/image-prompt-studio';
import { ProjectDashboard } from '@/components/video-prompt/project-dashboard';
import { StudioHeader } from '@/components/video-prompt/studio-header';
import { NewProjectModal } from '@/components/video-prompt/new-project-modal';
import { ProjectWorkspace } from '@/components/video-prompt/project-workspace';
import { PromptForm } from '@/components/prompt-form';
import { PromptOutput } from '@/components/prompt-output';
import { HistoryPanel } from '@/components/history-panel';
import { ProviderSettings } from '@/components/provider-settings';
import { SettingsPage } from '@/components/settings-page';
import { TestPromptModal } from '@/components/test-prompt-modal';
import { CommandPalette, PaletteAction } from '@/components/command-palette';
import { Toaster, toast } from '@/components/toast';
import {
  Sparkles as SparklesIcon,
  Zap,
  Play,
  Copy,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Sun,
  Moon,
  ImagePlus,
  Clapperboard,
} from 'lucide-react';
import {
  AttachmentPayload,
  CodeFileAttachment,
  PdfAttachment,
  PromptInput,
  ProjectContext,
  ProviderConfig,
  PromptVersion,
  Session,
  TextStudioImageAttachment,
  TextStudioImagePurpose,

  ThreadMessage,
} from '@/types';
import { StoryTreatment, VideoProject } from '@/types/video';
import { ProductShootStudio } from '@/components/product-shoot/product-shoot-studio';
import {
  clearAllSessions,
  DEFAULT_BUILTIN_PROVIDER,
  deleteProviderConfig,
  deleteSession,
  deleteVersionFromSession,
  getActiveProviderId,
  getProviderActiveModel,
  getSavedProviders,
  getSessions,
  renameVersion,
  saveProviderConfig,
  saveSession,
  setActiveModelForProvider,
  setActiveProviderId,
  setActiveVersion,
  addVersionToSession,
  toggleFavoriteSession,
  getSessionById,
} from '@/lib/storage';
import { DOMAIN_PRESETS } from '@/lib/domains';
import { generatePromptStream, refinePromptStream } from '@/lib/ai-client';
import { formatProjectContext } from '@/lib/file-upload-utils';

import { deleteVideoProject, getVideoProjects, saveVideoProject } from '@/lib/video-storage';
import { computePromptStats, generateVersionName, unwrapCodeBlock } from '@/lib/prompt-stats';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<AppTab>('generator');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });

  // Storage state
  const [providers, setProviders] = useState<ProviderConfig[]>([DEFAULT_BUILTIN_PROVIDER]);
  const [activeProvider, setActiveProvider] = useState<ProviderConfig>(DEFAULT_BUILTIN_PROVIDER);
  const [sessions, setSessions] = useState<Session[]>([]);

  // Generation & Session state
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [streamingText, setStreamingText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Sandbox modal state
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [promptToTest, setPromptToTest] = useState('');

  // Character limit warning — set when generated output exceeds the requested limit
  const [charLimitWarning, setCharLimitWarning] = useState<{ limit: number; actual: number } | null>(null);

  // Phase 5 — attachments state (code files, PDFs, images)
  const pendingAttachmentsRef = useRef<{
    codeFiles: CodeFileAttachment[];
    projectContext?: ProjectContext;
    pdfs: PdfAttachment[];
    images: TextStudioImageAttachment[];
  }>({ codeFiles: [], pdfs: [], images: [] });

  // Command palette state
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Video Prompt Studio state (Phase 2 — production hub)
  const [videoProjects, setVideoProjects] = useState<VideoProject[]>([]);
  const [activeVideoProjectId, setActiveVideoProjectId] = useState<string | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  // Video sub-tab: 'projects' (existing storyboard) | 'product-shoot' (new isolated feature)
  const [videoSubTab, setVideoSubTab] = useState<'projects' | 'product-shoot'>('projects');

  // Deep link from the workspace version picker into History's diff view
  const [pendingHistoryDiff, setPendingHistoryDiff] = useState<{
    sessionId: string;
    versionAId: string;
    versionBId: string;
  } | null>(null);

  // §8.2 — resizable two-pane splitter (generator view, persisted locally)
  const [splitPct, setSplitPct] = useState(50);
  const splitDragRef = useRef<{ startX: number; startPct: number } | null>(null);
  const splitPctRef = useRef<number>(50);

  useEffect(() => {
    const stored = localStorage.getItem('pc:split');
    const n = stored ? Number(stored) : NaN;
    if (!Number.isNaN(n) && n >= 24 && n <= 76) {
      setSplitPct(n);
      splitPctRef.current = n;
    }
  }, []);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // "New prompt" event (used by History's empty state and elsewhere)
  useEffect(() => {
    const onNewPrompt = () => {
      setCurrentSession(null);
      setStreamingText('');
      setActiveTab('generator');
      window.dispatchEvent(new Event('pc:focus-topic'));
    };
    window.addEventListener('pc:new-prompt', onNewPrompt);
    return () => window.removeEventListener('pc:new-prompt', onNewPrompt);
  }, []);

  // ⌘K / Ctrl+K toggles the command palette
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Load app storage data
  useEffect(() => {
    const loadAppData = async () => {
      const savedProviders = await getSavedProviders();
      setProviders(savedProviders);

      const activeId = await getActiveProviderId();
      const current = savedProviders.find((p) => p.id === activeId) || DEFAULT_BUILTIN_PROVIDER;
      const activeModel = await getProviderActiveModel(current);
      setActiveProvider({ ...current, model: activeModel, activeModel });

      const loadedSessions = await getSessions();
      setSessions(loadedSessions);

      if (loadedSessions.length > 0) {
        setCurrentSession(loadedSessions[0]);
      }
    };

    loadAppData();
  }, []);

  // Load the Video Prompt Studio production portfolio.
  useEffect(() => {
    getVideoProjects().then(setVideoProjects);
  }, []);

  const handleSelectActiveProvider = async (id: string) => {
    await setActiveProviderId(id);
    const target = providers.find((p) => p.id === id) || DEFAULT_BUILTIN_PROVIDER;
    const activeModel = await getProviderActiveModel(target);
    setActiveProvider({ ...target, model: activeModel, activeModel });
  };

  /** Switches the active model of the current provider and persists it locally. */
  const handleSelectActiveModel = async (model: string) => {
    if (!activeProvider) return;
    await setActiveModelForProvider(activeProvider.id, model);
    setActiveProvider((prev) => ({ ...prev, model, activeModel: model }));
    setProviders((prev) =>
      prev.map((p) => (p.id === activeProvider.id ? { ...p, activeModel: model } : p))
    );
  };

  const handleSaveProvider = async (newProvider: ProviderConfig) => {
    await saveProviderConfig(newProvider);
    const updatedList = await getSavedProviders();
    setProviders(updatedList);
    const activeModel = await getProviderActiveModel(newProvider);
    setActiveProvider({ ...newProvider, model: activeModel, activeModel });
    await setActiveProviderId(newProvider.id);
  };

  const handleDeleteProvider = async (id: string) => {
    await deleteProviderConfig(id);
    const updatedList = await getSavedProviders();
    setProviders(updatedList);

    if (activeProvider.id === id) {
      setActiveProvider(DEFAULT_BUILTIN_PROVIDER);
      await setActiveProviderId(DEFAULT_BUILTIN_PROVIDER.id);
    }
  };

  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  };

  const handleClearOutput = () => {
    handleCancelGeneration();
    setStreamingText('');
    setCurrentSession(null);
    setCharLimitWarning(null);
    window.dispatchEvent(new Event('pc:focus-topic'));
  };

  /** §8.2 — drag the splitter between the form and output panes (lg+). */
  const handleSplitDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = e.currentTarget.parentElement;
    if (!container) return;
    e.preventDefault();
    const rect = container.getBoundingClientRect();
    const startPct = ((e.clientX - rect.left) / rect.width) * 100;
    splitDragRef.current = { startX: e.clientX, startPct };
    document.body.classList.add('cursor-col-resize', 'select-none');

    const onMove = (ev: PointerEvent) => {
      const ref = splitDragRef.current;
      if (!ref) return;
      const r = container.getBoundingClientRect();
      const delta = ((ev.clientX - ref.startX) / r.width) * 100;
      const next = Math.min(76, Math.max(24, ref.startPct + delta));
      splitPctRef.current = next;
      setSplitPct(next);
    };
    const onUp = () => {
      splitDragRef.current = null;
      document.body.classList.remove('cursor-col-resize', 'select-none');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      localStorage.setItem('pc:split', String(splitPctRef.current));
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  /** §9.6 — version picker "compare" jumps to the History diff for this session. */
  const handleOpenHistoryDiff = (versionAId: string, versionBId: string) => {
    if (!currentSession) return;
    setPendingHistoryDiff({
      sessionId: currentSession.id,
      versionAId,
      versionBId,
    });
    setActiveTab('history');
  };

  const handleGeneratePrompt = async (
    input: PromptInput,
    directAttachments?: {
      codeFiles: CodeFileAttachment[];
      projectContext?: ProjectContext;
      pdfs: PdfAttachment[];
      images: TextStudioImageAttachment[];
    },
  ) => {
    handleCancelGeneration();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsGenerating(true);
    setStreamingText('');
    setCharLimitWarning(null);

    const domain = DOMAIN_PRESETS.find((d) => d.id === input.domainId) || DOMAIN_PRESETS[0];
    let fullText = '';

    // Build attachment payload from direct attachments or pending state
    const att = directAttachments || pendingAttachmentsRef.current;
    if (directAttachments) {
      pendingAttachmentsRef.current = directAttachments;
    }

    const hasAttachments =
      (att.codeFiles && att.codeFiles.length > 0) ||
      !!att.projectContext ||
      (att.pdfs && att.pdfs.length > 0) ||
      (att.images && att.images.length > 0);

    let projectContextText: string | undefined = undefined;
    if (att.projectContext) {
      projectContextText = formatProjectContext(att.projectContext);
    } else if (att.codeFiles && att.codeFiles.length > 0) {
      projectContextText = formatProjectContext({
        files: att.codeFiles,
        totalFilesFound: att.codeFiles.length,
        includedCount: att.codeFiles.length,
        projectName: 'Attached Code Files',
      });
    }

    const attachmentPayload: AttachmentPayload | undefined = hasAttachments ? {
      projectContextText,
      pdfParts: att.pdfs?.map((pdf) => ({ mimeType: pdf.mimeType, data: pdf.base64Data })),
      imageParts: att.images?.map((img) => ({
        mimeType: img.dataUrl.split(';')[0].replace('data:', '') || 'image/png',
        data: img.dataUrl.split(',')[1] || '',
        purpose: img.purpose,
      })),
    } : undefined;

    // Show auto-route toast when non-Gemini provider has file attachments
    if (attachmentPayload && (attachmentPayload.pdfParts?.length || attachmentPayload.imageParts?.length)) {
      const providerName = activeProvider.useBuiltInGemini ? 'Gemini' : activeProvider.name;
      const hasPdfs = (attachmentPayload.pdfParts?.length ?? 0) > 0;
      const hasImages = (attachmentPayload.imageParts?.length ?? 0) > 0;
      const fileTypes = [hasPdfs && 'PDFs', hasImages && 'images'].filter(Boolean).join(' and ');
      toast.info('Auto-routing attachments', `${providerName} will receive ${fileTypes} as context via the built-in Gemini extractor.`);
    }

    await generatePromptStream(
      {
        provider: activeProvider,
        input,
        attachments: attachmentPayload,
      },
      (chunk) => {
        fullText += chunk;
        setStreamingText(fullText);
      },
      async (completedText) => {
        setIsGenerating(false);

        // Store the unwrapped, non-empty prompt so saved content, the copy
        // button, and the test suite all operate on the same artifact.
        const cleaned = unwrapCodeBlock(completedText).trim();
        if (!cleaned) {
          setStreamingText('');
          toast.error("Couldn't create the prompt", 'The model returned an empty response. Try again.');
          return;
        }

        const timestamp = Date.now();
        const rand = Math.random().toString(36).slice(2, 7);
        const sessId = `sess-${timestamp}-${rand}`;
        const v1Id = `v-${timestamp}-1`;
        const stats = computePromptStats(cleaned);

        const initialVersion: PromptVersion = {
          id: v1Id,
          versionNumber: 1,
          name: 'Original',
          sourceType: 'initial',
          createdAt: timestamp,
          content: cleaned,
          providerName: activeProvider.name,
          modelUsed: activeProvider.model,
          stats,
        };

        const newSession: Session = {
          id: sessId,
          title: input.topic || 'Original',
          domainId: input.domainId,
          domainName: domain.name,
          originalInput: input,
          messages: [
            {
              id: `msg-${timestamp}-1`,
              role: 'user',
              content: input.topic,
              createdAt: timestamp,
            },
            {
              id: `msg-${timestamp}-2`,
              role: 'assistant',
              content: cleaned,
              createdAt: timestamp,
              resultingVersionId: v1Id,
            },
          ],
          versions: [initialVersion],
          activeVersionId: v1Id,
          favorite: false,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        // Check character limit
        if (input.outputCharLimit && cleaned.length > input.outputCharLimit) {
          setCharLimitWarning({ limit: input.outputCharLimit, actual: cleaned.length });
        } else {
          setCharLimitWarning(null);
        }

        await saveSession(newSession);
        setCurrentSession(newSession);
        const updatedSessions = await getSessions();
        setSessions(updatedSessions);
      },
      (error) => {
        setIsGenerating(false);
        setStreamingText(`⚠️ Couldn't create the prompt: ${error.message}`);
        toast.error("Couldn't create the prompt", error.message);
      },
      controller.signal
    );
  };

  const handleRefinePrompt = async (instruction: string) => {
    if (!currentSession) return;

    handleCancelGeneration();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsGenerating(true);
    setStreamingText('');

    const priorMessages = currentSession.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // The exact version being refined — the model may only edit this text.
    const baseForRefine =
      currentSession.versions.find((v) => v.id === currentSession.activeVersionId) ||
      currentSession.versions[currentSession.versions.length - 1];

    let fullText = '';

    await refinePromptStream(
      {
        provider: activeProvider,
        session: {
          id: currentSession.id,
          originalInput: currentSession.originalInput,
          domainId: currentSession.domainId,
        },
        priorMessages,
        instruction,
        basePrompt: baseForRefine?.content || '',
      },
      (chunk) => {
        fullText += chunk;
        setStreamingText(fullText);
      },
      async (completedText) => {
        setIsGenerating(false);

        const cleaned = unwrapCodeBlock(completedText).trim();
        if (!cleaned) {
          toast.error("Couldn't update the prompt", 'The model returned an empty response. Your current version is unchanged.');
          return;
        }

        const timestamp = Date.now();
        const rand = Math.random().toString(36).slice(2, 7);
        const versionNumber = currentSession.versions.length + 1;
        const vId = `v-${timestamp}-${rand}`;
        const versionName = generateVersionName(instruction, versionNumber, 'refinement');
        const stats = computePromptStats(cleaned);

        const newVersion: PromptVersion = {
          id: vId,
          versionNumber,
          name: versionName,
          sourceType: 'refinement',
          createdAt: timestamp,
          refinementInstruction: instruction,
          content: cleaned,
          providerName: activeProvider.name,
          modelUsed: activeProvider.model,
          stats,
        };

        const userMsg: ThreadMessage = {
          id: `msg-${timestamp}-1`,
          role: 'user',
          content: instruction,
          createdAt: timestamp,
        };

        const assistantMsg: ThreadMessage = {
          id: `msg-${timestamp}-2`,
          role: 'assistant',
          content: cleaned,
          createdAt: timestamp,
          resultingVersionId: vId,
        };

        const updatedSession = await addVersionToSession(
          currentSession.id,
          newVersion,
          userMsg,
          assistantMsg
        );

        setCurrentSession(updatedSession);
        const updatedSessions = await getSessions();
        setSessions(updatedSessions);
      },
      (error) => {
        setIsGenerating(false);
        setStreamingText(`⚠️ Couldn't update the prompt: ${error.message}`);
        toast.error("Couldn't update the prompt", 'Your current version is unchanged.');
      },
      controller.signal
    );
  };

  const handleSaveEditVersion = async (newContent: string) => {
    if (!currentSession) return;

    const cleaned = unwrapCodeBlock(newContent).trim();
    if (!cleaned) {
      toast.error('Could not save edit', 'The prompt cannot be empty.');
      return;
    }

    const timestamp = Date.now();
    const rand = Math.random().toString(36).slice(2, 7);
    const versionNumber = currentSession.versions.length + 1;
    const vId = `v-${timestamp}-${rand}`;
    const versionName = generateVersionName(undefined, versionNumber, 'manual-edit');
    const stats = computePromptStats(cleaned);

    const editVersion: PromptVersion = {
      id: vId,
      versionNumber,
      name: versionName,
      sourceType: 'manual-edit',
      createdAt: timestamp,
      content: cleaned,
      providerName: activeProvider.name,
      modelUsed: activeProvider.model,
      stats,
    };

    const assistantMsg: ThreadMessage = {
      id: `msg-${timestamp}-edit`,
      role: 'assistant',
      content: cleaned,
      createdAt: timestamp,
      resultingVersionId: vId,
    };

    const updatedSession = await addVersionToSession(
      currentSession.id,
      editVersion,
      undefined,
      assistantMsg
    );

    setCurrentSession(updatedSession);
    const updatedSessions = await getSessions();
    setSessions(updatedSessions);
  };

  const handleSelectVersion = async (versionId: string) => {
    if (!currentSession) return;
    const updated = await setActiveVersion(currentSession.id, versionId);
    setCurrentSession(updated);
  };

  const handleSelectSession = async (session: Session, versionId?: string) => {
    let targetSession = session;
    if (versionId && versionId !== session.activeVersionId) {
      targetSession = await setActiveVersion(session.id, versionId);
    }
    setCurrentSession(targetSession);
    setActiveTab('generator');
  };

  const handleDeleteSession = async (id: string) => {
    await deleteSession(id);
    const updated = await getSessions();
    setSessions(updated);
    if (currentSession?.id === id) {
      setCurrentSession(updated[0] || null);
    }
  };

  const handleDeleteVersion = async (sessionId: string, versionId: string) => {
    try {
      const updated = await deleteVersionFromSession(sessionId, versionId);
      if (currentSession?.id === sessionId) {
        setCurrentSession(updated);
      }
      const updatedSessions = await getSessions();
      setSessions(updatedSessions);
    } catch (err: any) {
      toast.error('Could not delete version', err?.message || 'Please try again.');
    }
  };

  const handleClearAllSessions = async () => {
    await clearAllSessions();
    setSessions([]);
    setCurrentSession(null);
  };

  const handleToggleFavorite = async (id: string) => {
    await toggleFavoriteSession(id);
    const updated = await getSessions();
    setSessions(updated);
    if (currentSession?.id === id) {
      const fresh = await getSessionById(id);
      if (fresh) setCurrentSession(fresh);
    }
  };

  const handleRenameVersion = async (sessionId: string, versionId: string, newName: string) => {
    const updated = await renameVersion(sessionId, versionId, newName);
    if (currentSession?.id === sessionId) {
      setCurrentSession(updated);
    }
    const updatedSessions = await getSessions();
    setSessions(updatedSessions);
  };

  const handleImportSessions = async (importedSessions: Session[]) => {
    for (const sess of importedSessions) {
      await saveSession(sess);
    }
    const updated = await getSessions();
    setSessions(updated);
    if (updated.length > 0) {
      setCurrentSession(updated[0]);
    }
  };

  // F1/F3/F6 — propagate storage-backed measurement updates (quality, suite, runs)
  const handleSessionUpdate = (session: Session) => {
    setCurrentSession(session);
    getSessions().then(setSessions);
  };

  const handleOpenSandboxTest = (promptText: string) => {
    setPromptToTest(promptText);
    setTestModalOpen(true);
  };

  // ── Video Prompt Studio (Phase 2 — production hub) ──
  const activeVideoProject =
    videoProjects.find((p) => p.id === activeVideoProjectId) ?? null;

  const handleCreateVideoProject = async (
    title: string,
    customInstructions: string,
    confirmedStory?: StoryTreatment | null
  ) => {
    const timestamp = Date.now();
    const project: VideoProject = {
      id: `video-${timestamp}-${Math.random().toString(36).slice(2, 7)}`,
      name: title,
      customInstructions,
      status: 'draft',
      storyBible: { characters: [], locations: [], continuityLog: [] },
      shots: [],
      chatHistory: [],
      createdAt: timestamp,
      updatedAt: timestamp,
      // Part 3 — the AI story treatment confirmed before creation; BootstrapFlow
      // seeds Stage 1 from it instead of regenerating.
      storyTreatment: confirmedStory ?? null,
    };
    await saveVideoProject(project);
    setVideoProjects(await getVideoProjects());
    setVideoModalOpen(false);
    setActiveVideoProjectId(project.id);
    toast.success('Project created', `"${project.name}" is ready for production planning.`);
  };

  const handleSelectVideoProject = (id: string) => setActiveVideoProjectId(id);

  const handleBackToVideoDashboard = () => setActiveVideoProjectId(null);

  const handleDeleteVideoProject = async (id: string) => {
    await deleteVideoProject(id);
    setVideoProjects(await getVideoProjects());
    setActiveVideoProjectId((prev) => (prev === id ? null : prev));
    toast.success('Project deleted', 'Removed from your production portfolio.');
  };

  // Phase 3 + Phase 4 — called whenever the workspace persists an updated
  // project (bootstrap activation, sidebar edits, shot approvals, chat sync).
  // Refresh the portfolio from storage and surface the change neutrally.
  const handleVideoProjectUpdate = async (project: VideoProject) => {
    const wasActive = activeVideoProject?.status === 'active';
    setVideoProjects(await getVideoProjects());
    setActiveVideoProjectId(project.id);
    if (wasActive) {
      toast.success('Project saved', `"${project.name}" — storyboard and continuity updated.`);
    } else {
      toast.success(
        'Production activated',
        `"${project.name}" — story bible locked, ready for shot drafting.`
      );
    }
  };

  const activeVersion = currentSession
    ? currentSession.versions.find((v) => v.id === currentSession.activeVersionId) ||
      currentSession.versions[currentSession.versions.length - 1]
    : null;

  const displayOutput = isGenerating ? streamingText : activeVersion?.content || '';

  const paletteActions: PaletteAction[] = [
    {
      id: 'new-prompt',
      label: 'New prompt',
      hint: 'Start fresh — clears the current prompt',
      icon: <SparklesIcon className="w-4 h-4" />,
      group: 'Create',
      shortcut: '/',
      run: () => {
        setCurrentSession(null);
        setStreamingText('');
        setActiveTab('generator');
        window.dispatchEvent(new Event('pc:focus-topic'));
      },
    },
    {
      id: 'generate',
      label: 'Create prompt',
      hint: 'Create with the current settings',
      icon: <Zap className="w-4 h-4" />,
      group: 'Create',
      shortcut: '⌘⏎',
      run: () => window.dispatchEvent(new Event('pc:generate')),
    },
    {
      id: 'test',
      label: 'Test current prompt',
      hint: activeVersion?.content ? 'Run the current prompt to see how it responds' : 'Create a prompt first',
      icon: <Play className="w-4 h-4" />,
      group: 'Create',
      run: () => {
        if (activeVersion?.content) handleOpenSandboxTest(activeVersion.content);
      },
    },
    {
      id: 'copy',
      label: 'Copy current prompt',
      hint: 'Copy the current prompt to the clipboard',
      icon: <Copy className="w-4 h-4" />,
      group: 'Create',
      run: () => {
        if (activeVersion?.content) navigator.clipboard.writeText(activeVersion.content);
      },
    },
    {
      id: 'image',
      label: 'Open image studio',
      hint: 'Research image briefs on the web and generate platform prompts',
      icon: <ImagePlus className="w-4 h-4" />,
      group: 'Navigate',
      run: () => setActiveTab('image'),
    },
    {
      id: 'video',
      label: 'Open video studio',
      hint: 'Plan video productions and manage shot-level prompts',
      icon: <Clapperboard className="w-4 h-4" />,
      group: 'Navigate',
      run: () => setActiveTab('video'),
    },
    {
      id: 'history',
      label: 'Open history',
      hint: `${sessions.length} saved prompt${sessions.length === 1 ? '' : 's'}`,  
      icon: <HistoryIcon className="w-4 h-4" />,
      group: 'Navigate',
      run: () => setActiveTab('history'),
    },
    {
      id: 'settings',
      label: 'Open settings',
      hint: 'Manage AI connections and models',
      icon: <SettingsIcon className="w-4 h-4" />,
      group: 'Navigate',
      run: () => setActiveTab('settings'),
    },
    {
      id: 'theme',
      label: darkMode ? 'Switch to light theme' : 'Switch to dark theme',
      hint: 'Toggle appearance',
      icon: darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />,
      group: 'Appearance',
      run: () => setDarkMode((mode) => !mode),
    },
  ];

  return (
    <div className="min-h-screen bg-surface-page text-text-primary transition-colors selection:bg-brand selection:text-white flex flex-col justify-between">
      {/* Dynamic Atmospheric Light Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand/15 rounded-full blur-[120px] dark:animate-orb-drift" />
        <div className="absolute top-1/3 right-[-10%] w-[45%] h-[45%] bg-brand/10 rounded-full blur-[120px] dark:animate-orb-drift [animation-delay:-15s]" />
        <div className="absolute bottom-[-10%] left-1/3 w-[50%] h-[50%] bg-brand/10 rounded-full blur-[120px] dark:animate-orb-drift [animation-delay:-30s]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeProvider={activeProvider}
          activeModel={activeProvider.model}
          onSelectActiveModel={handleSelectActiveModel}
          historyCount={sessions.length}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onOpenPalette={() => setPaletteOpen(true)}
        />

        {/* Main Content Area */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 md:pb-8"
        >
          {/* Static intro block — server-rendered into the initial HTML for SEO/AEO */}
          <section aria-labelledby="home-intro-heading" className="mb-6 lg:mb-8 max-w-3xl">
            <h1
              id="home-intro-heading"
              className="text-2xl sm:text-[28px] font-bold tracking-tight leading-tight text-text-primary"
            >
              Create clear prompts, refine them, and keep every version
            </h1>
            <p className="mt-3 text-sm sm:text-base text-text-secondary leading-relaxed">
              Describe what you want, and PromptCrafter writes a complete prompt, checks its quality,
              and lets you test and adjust it before you use it. Every change is saved as a new
              version you can compare and reuse. No account needed — your work stays in your browser.
            </p>
            <p className="mt-2 text-xs sm:text-sm text-text-muted">
              See how it works in the{' '}
              <Link href="/blog" className="font-semibold text-brand hover:underline">
                blog
              </Link>
              , or read the{' '}
              <Link href="/faq" className="font-semibold text-brand hover:underline">
                FAQ
              </Link>
              .
            </p>
          </section>

          <AnimatePresence mode="wait" initial={false}>
            {activeTab === 'generator' && (
              <motion.div
                key="generator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
                className="w-full flex flex-col gap-4"
              >
                {/* Modern Text Studio Action Header */}
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-surface-card/80 backdrop-blur-md border border-border shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center border border-brand/20 shadow-xs">
                      <SparklesIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-text-primary tracking-tight">
                        Text Prompt Studio
                      </span>
                      <span className="hidden sm:inline-block ml-2 text-xs text-text-muted font-normal">
                        {currentSession ? currentSession.title : 'Ready to draft'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentSession && (
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentSession(null);
                          setStreamingText('');
                          window.dispatchEvent(new Event('pc:focus-topic'));
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-surface-sunken hover:bg-surface-elevated text-text-secondary hover:text-text-primary border border-border transition-all"
                      >
                        <Zap className="w-3.5 h-3.5 text-brand" />
                        <span>New Prompt</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Main Split Multi-Column Studio */}
                <div className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-0 w-full">
                  {/* Left Column: Generator Form Controls (§8.2 — resizable on lg+) */}
                  <div
                    className="w-full space-y-6 lg:shrink-0 lg:min-w-[340px] lg:w-[var(--split-w)]"
                    style={{ '--split-w': `${splitPct}%` } as React.CSSProperties}
                  >
                    <PromptForm
                      onGenerate={handleGeneratePrompt}
                      isGenerating={isGenerating}
                      activeProvider={activeProvider}
                      onSelectActiveModel={handleSelectActiveModel}
                      onAttachmentsChange={(att) => { pendingAttachmentsRef.current = att; }}
                    />
                  </div>

                  {/* Resize handle (§8.2) — lg+ only */}
                  <div
                    role="separator"
                    aria-orientation="vertical"
                    aria-label="Resize panes"
                    onPointerDown={handleSplitDragStart}
                    className="hidden lg:flex group/handle items-center justify-center w-6 shrink-0 self-stretch cursor-col-resize touch-none select-none"
                  >
                    <div className="w-1 h-14 rounded-full bg-border transition-colors group-hover/handle:bg-brand/60 group-active/handle:bg-brand shadow-xs" />
                  </div>

                  {/* Right Column: Live Output & Refinement Display */}
                  <div className="w-full space-y-6 lg:sticky lg:top-20 lg:flex-1 lg:min-w-[340px]">
                    <PromptOutput
                      output={displayOutput}
                      isGenerating={isGenerating}
                      onTestPrompt={handleOpenSandboxTest}
                      onToggleFavorite={() =>
                        currentSession && handleToggleFavorite(currentSession.id)
                      }
                      activeProvider={activeProvider}
                      currentSession={currentSession}
                      activeVersion={activeVersion}
                      onSelectVersion={handleSelectVersion}
                      onRefinePrompt={handleRefinePrompt}
                      onSaveEditVersion={handleSaveEditVersion}
                      onCancelGeneration={handleCancelGeneration}
                      onClearOutput={handleClearOutput}
                      onSessionUpdate={handleSessionUpdate}
                      onOpenHistoryDiff={handleOpenHistoryDiff}
                      charLimitWarning={charLimitWarning}
                    />
                  </div>
                </div>
              </motion.div>
            )}
            {activeTab === 'image' && (
              <motion.div
                key="image"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
                className="max-w-5xl mx-auto"
              >
                <ImagePromptStudio
                  activeProvider={activeProvider}
                  onSelectActiveModel={handleSelectActiveModel}
                />
              </motion.div>
            )}
            {activeTab === 'video' && (
              <motion.div
                key="video"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
                className="w-full max-w-[1560px] mx-auto px-2 sm:px-4 lg:px-6"
              >
                <div className="space-y-6">
                  {/* Sub-tab switch: Projects | Product Shoot */}
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-sunken/60 w-fit">
                    <button
                      type="button"
                      onClick={() => setVideoSubTab('projects')}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                        ${
                          videoSubTab === 'projects'
                            ? 'bg-surface-card text-text-primary shadow-sm border border-border'
                            : 'text-text-muted hover:text-text-secondary'
                        }`}
                    >
                      Projects
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoSubTab('product-shoot')}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                        ${
                          videoSubTab === 'product-shoot'
                            ? 'bg-surface-card text-text-primary shadow-sm border border-border'
                            : 'text-text-muted hover:text-text-secondary'
                        }`}
                    >
                      Product Shoot
                    </button>
                  </div>

                  {videoSubTab === 'projects' ? (
                    <>
                      <StudioHeader
                        activeProject={activeVideoProject}
                        projects={videoProjects}
                        onSelectProject={handleSelectVideoProject}
                        onNewProject={() => setVideoModalOpen(true)}
                        onBackToDashboard={handleBackToVideoDashboard}
                      />
                      {activeVideoProject ? (
                        <ProjectWorkspace
                          project={activeVideoProject}
                          provider={activeProvider}
                          onUpdate={handleVideoProjectUpdate}
                        />
                      ) : (
                        <ProjectDashboard
                          projects={videoProjects}
                          onSelectProject={handleSelectVideoProject}
                          onNewProject={() => setVideoModalOpen(true)}
                          onDeleteProject={handleDeleteVideoProject}
                        />
                      )}
                    </>
                  ) : (
                    <ProductShootStudio
                      activeProvider={activeProvider}
                      onSelectActiveModel={handleSelectActiveModel}
                    />
                  )}
                </div>
              </motion.div>
            )}
            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
                className="max-w-4xl mx-auto"
              >
              <HistoryPanel
                sessions={sessions}
                onSelectSession={handleSelectSession}
                onDeleteSession={handleDeleteSession}
                onDeleteVersion={handleDeleteVersion}
                onClearAllSessions={handleClearAllSessions}
                onToggleFavorite={handleToggleFavorite}
                onRenameVersion={handleRenameVersion}
                onTestPrompt={handleOpenSandboxTest}
                onImportSessions={handleImportSessions}
                activeProvider={activeProvider}
                onSessionUpdate={handleSessionUpdate}
                pendingDiff={pendingHistoryDiff}
                onPendingDiffHandled={() => setPendingHistoryDiff(null)}
              />
              </motion.div>
            )}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
                className="max-w-4xl mx-auto"
              >
              <SettingsPage
                providers={providers}
                activeProviderId={activeProvider.id}
                onSelectActiveProvider={handleSelectActiveProvider}
                onSaveProvider={handleSaveProvider}
                onDeleteProvider={handleDeleteProvider}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                onImportSessions={handleImportSessions}
              />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="mt-auto border-t border-border py-4 px-4 sm:px-8 text-[11px] text-text-muted font-mono flex flex-wrap items-center justify-between gap-2 max-w-7xl w-full mx-auto">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            SAVED LOCALLY IN YOUR BROWSER
          </span>
          <span>&copy; {new Date().getFullYear()} PROMPTCRAFTER AI</span>
        </footer>
      </div>

      {/* Sandbox Execution Modal */}
      <TestPromptModal
        isOpen={testModalOpen}
        onClose={() => setTestModalOpen(false)}
        generatedPrompt={promptToTest}
        provider={activeProvider}
        providers={providers.map((p) => ({ ...p, model: p.activeModel ?? p.model }))}
      />

      {/* Video Prompt Studio — Directorial Brief modal (Phase 2) */}
      <NewProjectModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        provider={activeProvider}
        onCreate={handleCreateVideoProject}
      />

      {/* Command Palette (⌘K) */}
      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        actions={paletteActions}
      />

      {/* Toast viewport (DESIGN.md §9.13) */}
      <Toaster />
    </div>
  );
}
