'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  History,
  Settings,
  Cpu,
  ShieldCheck,
  Sun,
  Moon,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Command,
  Check,
} from 'lucide-react';
import { ProviderConfig } from '@/types';
import { getProviderModelList } from '@/lib/storage';

interface NavbarProps {
  activeTab: 'generator' | 'history' | 'settings';
  setActiveTab: (tab: 'generator' | 'history' | 'settings') => void;
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const modelList = getProviderModelList(activeProvider);

  const handleTabClick = (tab: 'generator' | 'history' | 'settings') => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-surface-card/80 border-b border-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Bar */}
        <div className="h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-brand flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)] border border-brand/30">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-base sm:text-lg font-bold tracking-tight bg-gradient-to-r from-text-primary via-brand to-text-secondary bg-clip-text text-transparent">
                  PromptCrafter<span className="text-brand font-light">AI</span>
                </span>
                <span className="inline-block px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold tracking-widest uppercase rounded-full bg-brand/10 text-brand border border-brand/20">
                  v1.1.0
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-text-muted">
                Create, refine, and test prompts
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Hidden on mobile < md) */}
          <nav aria-label="Primary" className="hidden md:flex items-center p-1 rounded-2xl bg-surface-muted border border-border shadow-inner">
            <button
              onClick={() => handleTabClick('generator')}
              aria-pressed={activeTab === 'generator'}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 ${
                activeTab === 'generator'
                  ? 'bg-surface-card text-brand shadow-md shadow-brand/20 border border-border'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create</span>
            </button>

            <button
              onClick={() => handleTabClick('history')}
              aria-pressed={activeTab === 'history'}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 ${
                activeTab === 'history'
                  ? 'bg-surface-card text-brand shadow-md shadow-brand/20 border border-border'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>History</span>
              {historyCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-brand/10 text-brand">
                  {historyCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleTabClick('settings')}
              aria-pressed={activeTab === 'settings'}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 ${
                activeTab === 'settings'
                  ? 'bg-surface-card text-brand shadow-md shadow-brand/20 border border-border'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
          </nav>

          {/* Right Status & Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Active Provider Pill + Model Switcher */}
            <div className="hidden lg:flex items-center gap-1.5">
              <button
                onClick={() => handleTabClick('settings')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-surface-muted border border-border hover:border-brand/50 text-text-secondary transition-colors"
                title="Active connection"
              >
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <Cpu className="w-3.5 h-3.5 text-brand" />
                <span className="max-w-[120px] truncate font-semibold text-text-primary">
                  {activeProvider.name}
                </span>
              </button>

              {/* Active Model Switcher (multi-model providers) */}
              {onSelectActiveModel && modelList.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setModelMenuOpen((open) => !open)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono bg-surface-muted border border-border hover:border-brand/50 text-text-secondary transition-colors"
                    title="Choose model"
                    aria-expanded={modelMenuOpen}
                    aria-haspopup="menu"
                  >
                    <span className="max-w-[110px] truncate">{activeModel || activeProvider.model}</span>
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
                        className="absolute right-0 top-full mt-1.5 z-20 min-w-[190px] p-1 rounded-xl bg-surface-card border border-border shadow-xl shadow-black/20"
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
            </div>

            {/* Privacy badge */}
            <div
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium bg-success/10 text-success border border-success/20"
              title="Your data stays in your browser"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Private &amp; local</span>
            </div>

            {/* Command Palette Trigger (⌘K) */}
            {onOpenPalette && (
              <button
                onClick={onOpenPalette}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-surface-muted text-text-secondary hover:bg-surface-hover transition-colors border border-border"
                aria-label="Open quick actions"
                title="Quick actions (⌘K)"
              >
                <Command className="w-4 h-4 text-brand" />
                <kbd className="px-1 py-0.5 rounded-md bg-surface-card border border-border text-[10px] font-mono text-text-muted">
                  ⌘K
                </kbd>
              </button>
            )}

            {/* Dark / Light Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-surface-muted text-text-secondary hover:bg-surface-hover transition-colors border border-border"
              aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
              aria-pressed={darkMode}
            >
              {darkMode ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4 text-brand" />}
            </button>

            {/* Mobile Navigation Toggle Button (Visible on < md) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-brand/10 text-brand border border-brand/20 hover:bg-brand/20 transition-colors"
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation Menu */}
        {mobileMenuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden pt-2 pb-4 border-t border-border space-y-2 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-surface-muted border border-border">
              <button
                onClick={() => handleTabClick('generator')}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'generator'
                    ? 'bg-brand text-white shadow-md shadow-brand/20'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Create</span>
              </button>

              <button
                onClick={() => handleTabClick('history')}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'history'
                    ? 'bg-brand text-white shadow-md shadow-brand/20'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <div className="flex items-center gap-1">
                  <History className="w-4 h-4" />
                  {historyCount > 0 && (
                    <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-white/20 text-white">
                      {historyCount}
                    </span>
                  )}
                </div>
                <span>History</span>
              </button>

              <button
                onClick={() => handleTabClick('settings')}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'settings'
                    ? 'bg-brand text-white shadow-md shadow-brand/20'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>

            {/* Mobile Active Provider Indicator + Model Switcher */}
            <div
              onClick={() => handleTabClick('settings')}
              className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-surface-muted border border-border text-xs text-text-secondary cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse shrink-0" />
                <Cpu className="w-4 h-4 text-brand shrink-0" />
                <span className="font-semibold truncate">Active: {activeProvider.name}</span>
              </div>
              {onSelectActiveModel && modelList.length > 0 ? (
                <select
                  value={activeModel || activeProvider.model}
                  onChange={(e) => onSelectActiveModel(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="max-w-[150px] bg-surface-card border border-border rounded-lg px-1.5 py-1 text-[11px] font-mono text-text-secondary focus:outline-none focus:ring-1 focus:ring-brand"
                  title="Choose model"
                >
                  {modelList.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              ) : (
                <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
