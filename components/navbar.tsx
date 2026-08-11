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
} from 'lucide-react';
import { ProviderConfig } from '@/types';

interface NavbarProps {
  activeTab: 'generator' | 'history' | 'settings';
  setActiveTab: (tab: 'generator' | 'history' | 'settings') => void;
  activeProvider: ProviderConfig;
  historyCount: number;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export function Navbar({
  activeTab,
  setActiveTab,
  activeProvider,
  historyCount,
  darkMode,
  setDarkMode,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: 'generator' | 'history' | 'settings') => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-white/80 dark:bg-[#020617]/85 border-b border-slate-200/80 dark:border-white/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Bar */}
        <div className="h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)] border border-indigo-400/30">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-base sm:text-lg font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                  PromptCrafter<span className="text-indigo-600 dark:text-indigo-400 font-light">AI</span>
                </span>
                <span className="hidden xs:inline-block px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold tracking-widest uppercase rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
                  PRO
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-500 dark:text-slate-400">
                Atmospheric Prompt Engineering &amp; Optimization
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Hidden on mobile < md) */}
          <nav className="hidden md:flex items-center p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200/70 dark:border-white/10 shadow-inner">
            <button
              onClick={() => handleTabClick('generator')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 ${
                activeTab === 'generator'
                  ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-md shadow-indigo-600/20 border border-slate-200/50 dark:border-indigo-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generator</span>
            </button>

            <button
              onClick={() => handleTabClick('history')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 ${
                activeTab === 'history'
                  ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-md shadow-indigo-600/20 border border-slate-200/50 dark:border-indigo-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>History</span>
              {historyCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-indigo-100 dark:bg-white/20 text-indigo-700 dark:text-white">
                  {historyCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleTabClick('settings')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 ${
                activeTab === 'settings'
                  ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-md shadow-indigo-600/20 border border-slate-200/50 dark:border-indigo-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Providers</span>
            </button>
          </nav>

          {/* Right Status & Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Active Provider Pill */}
            <button
              onClick={() => handleTabClick('settings')}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100/90 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-indigo-500/50 text-slate-700 dark:text-slate-300 transition-colors"
              title="Active AI Provider"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Cpu className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span className="max-w-[120px] truncate font-semibold text-slate-800 dark:text-slate-200">
                {activeProvider.name}
              </span>
            </button>

            {/* Privacy badge */}
            <div
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
              title="Local Client Encryption"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Local Encryption</span>
            </div>

            {/* Dark / Light Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors border border-slate-200 dark:border-white/10"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* Mobile Navigation Toggle Button (Visible on < md) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 hover:bg-indigo-600/20 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-2 pb-4 border-t border-slate-200/80 dark:border-white/10 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10">
              <button
                onClick={() => handleTabClick('generator')}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'generator'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Generator</span>
              </button>

              <button
                onClick={() => handleTabClick('history')}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'history'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Providers</span>
              </button>
            </div>

            {/* Mobile Active Provider Indicator */}
            <div
              onClick={() => handleTabClick('settings')}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <Cpu className="w-4 h-4 text-indigo-500" />
                <span className="font-semibold">Active AI: {activeProvider.name}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
