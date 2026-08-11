'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Navbar } from '@/components/navbar';
import { PromptForm } from '@/components/prompt-form';
import { PromptOutput } from '@/components/prompt-output';
import { HistoryPanel } from '@/components/history-panel';
import { ProviderSettings } from '@/components/provider-settings';
import { TestPromptModal } from '@/components/test-prompt-modal';
import { PromptInput, ProviderConfig, PromptVersion, Session, ThreadMessage } from '@/types';
import {
  clearAllSessions,
  DEFAULT_BUILTIN_PROVIDER,
  deleteProviderConfig,
  deleteSession,
  deleteVersionFromSession,
  getActiveProviderId,
  getSavedProviders,
  getSessions,
  getStorageType,
  renameVersion,
  saveProviderConfig,
  saveSession,
  setActiveProviderId,
  setActiveVersion,
  addVersionToSession,
  toggleFavoriteSession,
  getSessionById,
} from '@/lib/storage';
import { DOMAIN_PRESETS } from '@/lib/domains';
import { generatePromptStream, refinePromptStream } from '@/lib/ai-client';
import { computePromptStats, generateVersionName } from '@/lib/prompt-stats';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'generator' | 'history' | 'settings'>('generator');
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
  const [storageMode, setStorageMode] = useState<string>('INDEXED_DB');

  // Generation & Session state
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [streamingText, setStreamingText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Sandbox modal state
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [promptToTest, setPromptToTest] = useState('');

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

  // Load app storage data
  useEffect(() => {
    const loadAppData = async () => {
      const type = await getStorageType();
      setStorageMode(type);

      const savedProviders = await getSavedProviders();
      setProviders(savedProviders);

      const activeId = await getActiveProviderId();
      const current = savedProviders.find((p) => p.id === activeId) || DEFAULT_BUILTIN_PROVIDER;
      setActiveProvider(current);

      const loadedSessions = await getSessions();
      setSessions(loadedSessions);

      if (loadedSessions.length > 0) {
        setCurrentSession(loadedSessions[0]);
      }
    };

    loadAppData();
  }, []);

  const handleSelectActiveProvider = async (id: string) => {
    await setActiveProviderId(id);
    const target = providers.find((p) => p.id === id) || DEFAULT_BUILTIN_PROVIDER;
    setActiveProvider(target);
  };

  const handleSaveProvider = async (newProvider: ProviderConfig) => {
    await saveProviderConfig(newProvider);
    const updatedList = await getSavedProviders();
    setProviders(updatedList);
    setActiveProvider(newProvider);
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

  const handleGeneratePrompt = async (input: PromptInput) => {
    handleCancelGeneration();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsGenerating(true);
    setStreamingText('');

    const domain = DOMAIN_PRESETS.find((d) => d.id === input.domainId) || DOMAIN_PRESETS[0];
    let fullText = '';

    await generatePromptStream(
      {
        provider: activeProvider,
        input,
      },
      (chunk) => {
        fullText += chunk;
        setStreamingText(fullText);
      },
      async (completedText) => {
        setIsGenerating(false);

        const timestamp = Date.now();
        const rand = Math.random().toString(36).slice(2, 7);
        const sessId = `sess-${timestamp}-${rand}`;
        const v1Id = `v-${timestamp}-1`;
        const stats = computePromptStats(completedText);

        const initialVersion: PromptVersion = {
          id: v1Id,
          versionNumber: 1,
          name: 'Initial Generation',
          sourceType: 'initial',
          createdAt: timestamp,
          content: completedText,
          providerName: activeProvider.name,
          modelUsed: activeProvider.model,
          stats,
        };

        const newSession: Session = {
          id: sessId,
          title: input.topic || 'Initial Generation',
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
              content: completedText,
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

        await saveSession(newSession);
        setCurrentSession(newSession);
        const updatedSessions = await getSessions();
        setSessions(updatedSessions);
      },
      (error) => {
        setIsGenerating(false);
        setStreamingText(`⚠️ Generation Error: ${error.message}`);
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
      },
      (chunk) => {
        fullText += chunk;
        setStreamingText(fullText);
      },
      async (completedText) => {
        setIsGenerating(false);

        const timestamp = Date.now();
        const rand = Math.random().toString(36).slice(2, 7);
        const versionNumber = currentSession.versions.length + 1;
        const vId = `v-${timestamp}-${rand}`;
        const versionName = generateVersionName(instruction, versionNumber, 'refinement');
        const stats = computePromptStats(completedText);

        const newVersion: PromptVersion = {
          id: vId,
          versionNumber,
          name: versionName,
          sourceType: 'refinement',
          createdAt: timestamp,
          refinementInstruction: instruction,
          content: completedText,
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
          content: completedText,
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
        setStreamingText(`⚠️ Refinement Error: ${error.message}`);
      },
      controller.signal
    );
  };

  const handleSaveEditVersion = async (newContent: string) => {
    if (!currentSession) return;

    const timestamp = Date.now();
    const rand = Math.random().toString(36).slice(2, 7);
    const versionNumber = currentSession.versions.length + 1;
    const vId = `v-${timestamp}-${rand}`;
    const versionName = generateVersionName(undefined, versionNumber, 'manual-edit');
    const stats = computePromptStats(newContent);

    const editVersion: PromptVersion = {
      id: vId,
      versionNumber,
      name: versionName,
      sourceType: 'manual-edit',
      createdAt: timestamp,
      content: newContent,
      providerName: activeProvider.name,
      modelUsed: activeProvider.model,
      stats,
    };

    const assistantMsg: ThreadMessage = {
      id: `msg-${timestamp}-edit`,
      role: 'assistant',
      content: newContent,
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
      alert(err.message || 'Could not delete version');
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

  const handleOpenSandboxTest = (promptText: string) => {
    setPromptToTest(promptText);
    setTestModalOpen(true);
  };

  const activeVersion = currentSession
    ? currentSession.versions.find((v) => v.id === currentSession.activeVersionId) ||
      currentSession.versions[currentSession.versions.length - 1]
    : null;

  const displayOutput = isGenerating ? streamingText : activeVersion?.content || '';

  return (
    <div className="min-h-screen bg-surface-page text-text-primary transition-colors selection:bg-brand selection:text-white flex flex-col justify-between">
      {/* Dynamic Atmospheric Light Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-[-10%] w-[45%] h-[45%] bg-brand/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-1/3 w-[50%] h-[50%] bg-brand/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeProvider={activeProvider}
          historyCount={sessions.length}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-8">
          {activeTab === 'generator' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Generator Form Controls */}
              <div className="lg:col-span-6 space-y-6">
                <PromptForm onGenerate={handleGeneratePrompt} isGenerating={isGenerating} />
              </div>

              {/* Right Column: Live Output & Refinement Display */}
              <div className="lg:col-span-6 space-y-6 lg:sticky lg:top-20">
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
                />
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="max-w-4xl mx-auto">
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
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto">
              <ProviderSettings
                providers={providers}
                activeProviderId={activeProvider.id}
                onSelectActiveProvider={handleSelectActiveProvider}
                onSaveProvider={handleSaveProvider}
                onDeleteProvider={handleDeleteProvider}
              />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-auto border-t border-border py-4 px-4 sm:px-8 text-[11px] text-text-muted font-mono flex flex-wrap items-center justify-between gap-2 max-w-7xl w-full mx-auto">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              STORAGE: {storageMode} OK
            </span>
            <span>ENCRYPTION: AES-GCM</span>
          </div>
          <div>
            <span>&copy; {new Date().getFullYear()} PROMPTCRAFTER AI // THREADED SESSION MODEL</span>
          </div>
        </footer>
      </div>

      {/* Sandbox Execution Modal */}
      <TestPromptModal
        isOpen={testModalOpen}
        onClose={() => setTestModalOpen(false)}
        generatedPrompt={promptToTest}
        provider={activeProvider}
      />
    </div>
  );
}
