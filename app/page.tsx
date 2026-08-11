'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Navbar } from '@/components/navbar';
import { PromptForm } from '@/components/prompt-form';
import { PromptOutput } from '@/components/prompt-output';
import { HistoryPanel } from '@/components/history-panel';
import { ProviderSettings } from '@/components/provider-settings';
import { TestPromptModal } from '@/components/test-prompt-modal';
import { HistoryItem, PromptInput, ProviderConfig } from '@/types';
import {
  clearAllHistory,
  DEFAULT_BUILTIN_PROVIDER,
  deleteHistoryItem,
  deleteProviderConfig,
  getActiveProviderId,
  getHistoryItems,
  getSavedProviders,
  getStorageType,
  saveHistoryItem,
  saveProviderConfig,
  setActiveProviderId,
  toggleFavoriteHistoryItem,
} from '@/lib/storage';
import { DOMAIN_PRESETS } from '@/lib/domains';
import { generatePromptStream } from '@/lib/ai-client';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'generator' | 'history' | 'settings'>('generator');
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Storage state
  const [providers, setProviders] = useState<ProviderConfig[]>([DEFAULT_BUILTIN_PROVIDER]);
  const [activeProvider, setActiveProvider] = useState<ProviderConfig>(DEFAULT_BUILTIN_PROVIDER);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [storageMode, setStorageMode] = useState<string>('INDEXED_DB');

  // Generation state
  const [generatedOutput, setGeneratedOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentHistoryItem, setCurrentHistoryItem] = useState<HistoryItem | null>(null);

  // Sandbox modal state
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [promptToTest, setPromptToTest] = useState('');

  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize Dark Mode & Storage Data
  useEffect(() => {
    // Sync dark mode class
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const loadAppData = async () => {
      // Determine Storage Type
      const type = await getStorageType();
      setStorageMode(type);

      // Load Providers
      const savedProviders = await getSavedProviders();
      setProviders(savedProviders);

      const activeId = await getActiveProviderId();
      const current = savedProviders.find((p) => p.id === activeId) || DEFAULT_BUILTIN_PROVIDER;
      setActiveProvider(current);

      // Load History
      const historyItems = await getHistoryItems();
      setHistory(historyItems);
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

  const handleGeneratePrompt = async (input: PromptInput) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsGenerating(true);
    setGeneratedOutput('');

    const domain = DOMAIN_PRESETS.find((d) => d.id === input.domainId) || DOMAIN_PRESETS[0];

    let fullText = '';

    await generatePromptStream(
      {
        provider: activeProvider,
        input,
      },
      (chunk) => {
        fullText += chunk;
        setGeneratedOutput(fullText);
      },
      async (completedText) => {
        setIsGenerating(false);

        // Save entry into History
        const newHistoryItem: HistoryItem = {
          id: `hist-${Date.now()}`,
          timestamp: Date.now(),
          domainId: input.domainId,
          domainName: domain.name,
          input,
          output: completedText,
          providerName: activeProvider.name,
          modelUsed: activeProvider.model,
          favorite: false,
        };

        await saveHistoryItem(newHistoryItem);
        setCurrentHistoryItem(newHistoryItem);

        const updatedHistory = await getHistoryItems();
        setHistory(updatedHistory);
      },
      (error) => {
        setIsGenerating(false);
        setGeneratedOutput(`⚠️ Generation Error: ${error.message}`);
      },
      controller.signal
    );
  };

  const handleDeleteHistory = async (id: string) => {
    await deleteHistoryItem(id);
    const updated = await getHistoryItems();
    setHistory(updated);
  };

  const handleClearAllHistory = async () => {
    await clearAllHistory();
    setHistory([]);
  };

  const handleToggleFavorite = async (id: string) => {
    await toggleFavoriteHistoryItem(id);
    const updated = await getHistoryItems();
    setHistory(updated);
  };

  const handleImportHistory = async (items: HistoryItem[]) => {
    for (const item of items) {
      await saveHistoryItem(item);
    }
    const updated = await getHistoryItems();
    setHistory(updated);
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setGeneratedOutput(item.output);
    setCurrentHistoryItem(item);
    setActiveTab('generator');
  };

  const handleOpenSandboxTest = (promptText: string) => {
    setPromptToTest(promptText);
    setTestModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 dark:bg-[#020617] text-slate-900 dark:text-slate-200 transition-colors selection:bg-indigo-500 selection:text-white flex flex-col justify-between">
      {/* Dynamic Atmospheric Light Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-[-10%] w-[45%] h-[45%] bg-teal-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-1/3 w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeProvider={activeProvider}
          historyCount={history.length}
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

              {/* Right Column: Live Output Display */}
              <div className="lg:col-span-6 space-y-6 lg:sticky lg:top-20">
                <PromptOutput
                  output={generatedOutput}
                  isGenerating={isGenerating}
                  onTestPrompt={handleOpenSandboxTest}
                  onSaveFavorite={async (item) => {
                    await saveHistoryItem(item);
                    const updated = await getHistoryItems();
                    setHistory(updated);
                  }}
                  activeProvider={activeProvider}
                  currentHistoryItem={currentHistoryItem}
                />
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="max-w-4xl mx-auto">
              <HistoryPanel
                historyItems={history}
                onSelectHistoryItem={handleSelectHistoryItem}
                onDeleteHistoryItem={handleDeleteHistory}
                onClearAllHistory={handleClearAllHistory}
                onToggleFavorite={handleToggleFavorite}
                onTestPrompt={handleOpenSandboxTest}
                onImportHistory={handleImportHistory}
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
        <footer className="mt-auto border-t border-slate-200/60 dark:border-white/5 py-4 px-4 sm:px-8 text-[11px] text-slate-500 dark:text-slate-500 font-mono flex flex-wrap items-center justify-between gap-2 max-w-7xl w-full mx-auto">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              STORAGE: {storageMode} OK
            </span>
            <span>ENCRYPTION: AES-GCM</span>
          </div>
          <div>
            <span>&copy; {new Date().getFullYear()} PROMPTCRAFTER AI // LOCAL-FIRST ARCHITECTURE</span>
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
