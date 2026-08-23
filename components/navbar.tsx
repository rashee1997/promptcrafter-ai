'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ImagePlus,
  Clapperboard,
  History,
  Settings,
  Cpu,
  ShieldCheck,
  Sun,
  Moon,
  ChevronDown,
  Command,
  Check,
  MoreHorizontal,
} from 'lucide-react';
import { motion, LayoutGroup } from 'motion/react';
import { ProviderConfig } from '@/types';
import { getProviderModelList } from '@/lib/storage';
import { Tooltip } from './tooltip';

export type AppTab = 'generator' | 'image' | 'video' | 'history' | 'settings';

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  activeProvider: ProviderConfig;
  /** Currently selected model for the active provider. */
  activeModel?: string;
  /** Called when the user switches the active model of the active provider. */
  onSelectActiveModel?: (model: string) => void;
  historyCount: number;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenPalette?: () => void;
}

const TABS = [
  { id: 'generator', label: 'Create', Icon: Sparkles },
  { id: 'image', label: 'Image', Icon: ImagePlus },
  { id: 'video', label: 'Video', Icon: Clapperboard },
  { id: 'history', label: 'History', Icon: History },
  { id: 'settings', label: 'Settings', Icon: Settings },
] as const;

export function Navbar({
  activeTab,
  setActiveTab,
  activeProvider,
  activeModel,
  onSelectActiveModel,
  historyCount,
  darkMode,
  setDarkMode,
  onOpenPalette,
}: NavbarProps) {
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const modelList = getProviderModelList(activeProvider);

  const handleTabClick = (tab: AppTab) => {
    setActiveTab(tab);
  };

  return (
    <LayoutGroup id="nav-tabs">
      <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-surface-card/80 border-b border-border transition-colors duration-300">
        {/* Step 1 — Fluid width: clamp() padding scales with viewport, cap raised to 1800px */}
        <div className="w-full mx-auto px-[clamp(1rem,3vw,3rem)] max-w-[1800px]">
          {/* Main Bar */}
          <div className="h-16 flex items-center justify-between gap-2 sm:gap-4 min-w-0">
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-brand flex items-center justify-center shadow-orb border border-brand/30">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-base sm:text-lg font-bold tracking-tight bg-gradient-to-r from-text-primary via-brand to-text-secondary bg-clip-text text-transparent whitespace-nowrap">
                    PromptCrafter<span className="text-brand font-light">AI</span>
                  </span>
                  <span className="inline-block px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold tracking-widest uppercase rounded-full bg-brand/10 text-brand border border-brand/20">
                    v1.1.0
                  </span>
                </div>
                <p className="hidden lg:block text-[11px] text-text-muted">
                  Create, refine, and test prompts
                </p>
              </div>
            </div>

            {/* Step 3 — Desktop nav tabs: icon-only between md–lg, full labels at lg+ */}
            <nav aria-label="Primary" className="hidden md:flex items-center p-1 rounded-2xl bg-surface-sunken border border-border shrink-0">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative flex items-center gap-1.5 lg:gap-2 px-2 py-1.5 lg:px-3.5 text-xs font-semibold rounded-xl transition-colors duration-200 ${
                      isActive ? 'text-brand' : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-tab-pill"
                        className="absolute inset-0 rounded-xl bg-surface-card border border-border shadow-sm shadow-brand/10"
                        transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5 lg:gap-2">
                      <tab.Icon className="w-3.5 h-3.5" />
                      <span className="hidden lg:inline">{tab.label}</span>
                      {tab.id === 'history' && historyCount > 0 && (
                        <span
                          className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                            isActive ? 'bg-brand/10 text-brand' : 'bg-surface-hover text-text-muted'
                          }`}
                        >
                          {historyCount}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Step 2 — Right-hand status controls: always single row, collapse at xl- */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
              {/* Settings shortcut — hidden at xl+ where the wider provider pill group takes over */}
              <button
                onClick={() => handleTabClick('settings')}
                className="xl:hidden p-2 rounded-xl bg-surface-muted text-text-secondary hover:bg-surface-hover transition-colors border border-border"
                aria-label="Connection & settings"
                title="Connection & settings"
              >
                <Cpu className="w-4 h-4 text-brand" />
              </button>

              {/* Inline provider + model + privacy (≥ xl) */}
              <div className="hidden xl:flex items-center gap-1.5">
                {/* Provider pill */}
                <button
                  onClick={() => handleTabClick('settings')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-surface-muted border border-border hover:border-brand/50 text-text-secondary transition-colors"
                  title={`Active connection: ${activeProvider.name}`}
                >
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <Cpu className="w-3.5 h-3.5 text-brand" />
                  {/* Step 4 — Viewport-aware truncation */}
                  <span className="max-w-[min(120px,12vw)] truncate font-semibold text-text-primary">
                    {activeProvider.name}
                  </span>
                </button>

                {/* Model switcher */}
                {onSelectActiveModel && modelList.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setModelMenuOpen((open) => !open)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono bg-surface-muted border border-border hover:border-brand/50 text-text-secondary transition-colors"
                      title={`Model: ${activeModel || activeProvider.model}`}
                      aria-expanded={modelMenuOpen}
                      aria-haspopup="menu"
                    >
                      {/* Step 4 — Viewport-aware truncation */}
                      <span className="max-w-[min(110px,10vw)] truncate">{activeModel || activeProvider.model}</span>
                      <ChevronDown
                        className={`w-3 h-3 text-text-muted transition-transform ${modelMenuOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {modelMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setModelMenuOpen(false)}
                          aria-hidden="true"
                        />
                        <div
                          role="menu"
                          className="absolute right-0 top-full mt-1.5 z-20 min-w-[190px] p-1 rounded-xl bg-surface-card border border-border shadow-lg"
                        >
                          {modelList.map((m) => {
                            const isActive = m === (activeModel || activeProvider.model);
                            return (
                              <button
                                key={m}
                                role="menuitem"
                                onClick={() => {
                                  onSelectActiveModel(m);
                                  setModelMenuOpen(false);
                                }}
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between gap-2 transition-colors ${
                                  isActive
                                    ? 'bg-brand/10 text-brand font-semibold'
                                    : 'text-text-secondary hover:bg-surface-hover'
                                }`}
                              >
                                <span className="truncate">{m}</span>
                                {isActive && <Check className="w-3.5 h-3.5 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Privacy badge */}
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium bg-success/10 text-success border border-success/20"
                  title="Your data stays in your browser"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Private &amp; local</span>
                </div>
              </div>

              {/* Collapsed status menu (< xl): same info in a dropdown */}
              <div className="xl:hidden relative">
                <button
                  onClick={() => setStatusMenuOpen((o) => !o)}
                  className="p-2 rounded-xl bg-surface-muted text-text-secondary hover:bg-surface-hover transition-colors border border-border"
                  aria-label="More status info"
                  aria-expanded={statusMenuOpen}
                  aria-haspopup="menu"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {statusMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setStatusMenuOpen(false)}
                      aria-hidden="true"
                    />
                    <div
                      role="menu"
                      className="absolute right-0 top-full mt-1.5 z-20 min-w-[220px] p-1.5 rounded-xl bg-surface-card border border-border shadow-lg"
                    >
                      {/* Provider info row */}
                      <button
                        role="menuitem"
                        onClick={() => {
                          setStatusMenuOpen(false);
                          handleTabClick('settings');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-text-secondary hover:bg-surface-hover transition-colors"
                      >
                        <div className="w-2 h-2 rounded-full bg-success shrink-0" />
                        <Cpu className="w-3.5 h-3.5 text-brand shrink-0" />
                        <span className="truncate font-semibold text-text-primary">{activeProvider.name}</span>
                      </button>

                      {/* Model selector row */}
                      {onSelectActiveModel && modelList.length > 0 && (
                        <div className="relative">
                          <button
                            onClick={() => setModelMenuOpen((open) => !open)}
                            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-mono text-text-secondary hover:bg-surface-hover transition-colors"
                            aria-expanded={modelMenuOpen}
                            aria-haspopup="menu"
                          >
                            <span className="truncate">{activeModel || activeProvider.model}</span>
                            <ChevronDown
                              className={`w-3 h-3 text-text-muted shrink-0 transition-transform ${modelMenuOpen ? 'rotate-180' : ''}`}
                            />
                          </button>

                          {modelMenuOpen && (
                            <div
                              role="menu"
                              className="ml-3 mt-0.5 min-w-[170px] p-1 rounded-lg bg-surface-sunken border border-border"
                            >
                              {modelList.map((m) => {
                                const isActive = m === (activeModel || activeProvider.model);
                                return (
                                  <button
                                    key={m}
                                    role="menuitem"
                                    onClick={() => {
                                      onSelectActiveModel(m);
                                      setModelMenuOpen(false);
                                      setStatusMenuOpen(false);
                                    }}
                                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between gap-2 transition-colors ${
                                      isActive
                                        ? 'bg-brand/10 text-brand font-semibold'
                                        : 'text-text-secondary hover:bg-surface-hover'
                                    }`}
                                  >
                                    <span className="truncate">{m}</span>
                                    {isActive && <Check className="w-3.5 h-3.5 shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Privacy badge row */}
                      <div className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium text-success">
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                        <span>Private &amp; local</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Command Palette Trigger (⌘K) */}
              {onOpenPalette && (
                <Tooltip label="Quick actions (⌘K)" className="hidden md:inline-flex">
                  <button
                    onClick={onOpenPalette}
                    className="hidden md:flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-surface-muted text-text-secondary hover:bg-surface-hover transition-colors border border-border"
                    aria-label="Open quick actions"
                  >
                    <Command className="w-4 h-4 text-brand" />
                    <kbd className="px-1 py-0.5 rounded-md bg-surface-card border border-border text-[10px] font-mono text-text-muted">
                      ⌘K
                    </kbd>
                  </button>
                </Tooltip>
              )}

              {/* Dark / Light Theme Toggle */}
              <Tooltip label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-xl bg-surface-muted text-text-secondary hover:bg-surface-hover transition-colors border border-border"
                  aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
                  aria-pressed={darkMode}
                >
                  {darkMode ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4 text-brand" />}
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar (fixed, thumb-first; hidden ≥ md) */}
      <nav
        aria-label="Primary"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-surface-card/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]"
      >
        <div className="grid h-16 grid-cols-5 max-w-md mx-auto">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-colors duration-200 ${
                  isActive ? 'text-brand' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <span className="relative">
                  <tab.Icon className="w-5 h-5" />
                  {isActive && (
                    <motion.span
                      layoutId="mobile-tab-dot"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand"
                      transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
                    />
                  )}
                </span>
                <span className="flex items-center gap-1">
                  {tab.label}
                  {tab.id === 'history' && historyCount > 0 && (
                    <span className="px-1 py-0.5 text-[9px] font-bold rounded-full bg-brand/10 text-brand">
                      {historyCount}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </LayoutGroup>
  );
}
