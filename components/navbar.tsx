'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ImagePlus,
  Clapperboard,
  History,
  Settings,
  BookOpen,
  Sun,
  Moon,
  Command,
} from 'lucide-react';
import { motion, LayoutGroup } from 'motion/react';
import { Tooltip } from './tooltip';

export type AppTab = 'generator' | 'image' | 'video' | 'history' | 'settings' | 'docs';

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenPalette?: () => void;
}

const TABS = [
  { id: 'generator', label: 'Create', Icon: Sparkles },
  { id: 'image', label: 'Image', Icon: ImagePlus },
  { id: 'video', label: 'Video', Icon: Clapperboard },
  { id: 'history', label: 'History', Icon: History },
  { id: 'docs', label: 'Docs', Icon: BookOpen },
  { id: 'settings', label: 'Settings', Icon: Settings },
] as const;

export function Navbar({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  onOpenPalette,
}: NavbarProps) {
  const [paletteOpen, setPaletteOpen] = useState(false);

  const handleTabClick = (tab: AppTab) => {
    setActiveTab(tab);
  };

  return (
    <LayoutGroup id="nav-tabs">
      <header className="sticky top-0 z-40 w-full bg-surface-card border-b border-border transition-colors duration-150">
        <div className="w-full mx-auto px-4 max-w-[1400px]">
          <div className="h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 rounded bg-brand flex items-center justify-center text-[var(--brand-foreground)]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-text-primary tracking-tight">
                  PromptCrafter AI
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-medium uppercase rounded bg-surface-muted text-text-secondary">
                  v1.1.0
                </span>
              </div>
            </div>

            <nav aria-label="Primary" className="hidden md:flex items-center p-1 rounded-md bg-surface-muted border border-border shrink-0">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded transition-colors duration-150 ${
                      isActive ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-tab-pill"
                        className="absolute inset-0 rounded bg-surface-card shadow-sm"
                        transition={{ duration: 0.15, ease: 'easeInOut' }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <tab.Icon className="w-4 h-4" />
                      <span className="hidden lg:inline">{tab.label}</span>
                    </span>
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-2 shrink-0">
              {onOpenPalette && (
                <Tooltip label="Quick actions (⌘K)" className="hidden md:inline-flex">
                  <button
                    onClick={() => {
                      setPaletteOpen(!paletteOpen);
                      if (onOpenPalette) onOpenPalette();
                    }}
                    className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded bg-surface-card hover:bg-surface-hover transition-colors border border-border text-sm font-medium text-text-secondary"
                  >
                    <Command className="w-4 h-4" />
                    <span>Search...</span>
                    <kbd className="px-1 py-0.5 rounded bg-surface-muted text-[10px] font-mono text-text-secondary">
                      ⌘K
                    </kbd>
                  </button>
                </Tooltip>
              )}

              <Tooltip label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-1.5 rounded bg-surface-card hover:bg-surface-hover transition-colors border border-border text-text-secondary"
                  aria-pressed={darkMode}
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Tab Bar */}
      <nav
        aria-label="Primary"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-surface-card pb-[env(safe-area-inset-bottom)]"
      >
        <div className="grid h-16 grid-cols-6 max-w-md mx-auto">
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
                  {tab.id === 'history' && (
                    <span className="px-1 py-0.5 text-[9px] font-bold rounded-full bg-brand/10 text-brand">
                      {activeTab === 'history' ? '•' : '*'}
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
