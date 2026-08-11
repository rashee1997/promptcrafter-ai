'use client';

import React from 'react';
import {
  Code2,
  LayoutGrid,
  TrendingUp,
  Sparkles,
  GraduationCap,
  FileText,
  ShieldCheck,
  Sliders,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react';
import { DOMAIN_PRESETS } from '@/lib/domains';
import { DomainPreset } from '@/types';

interface DomainSelectorProps {
  selectedDomainId: string;
  onSelectDomain: (domain: DomainPreset) => void;
  onPickExampleTopic?: (topic: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Code2,
  LayoutGrid,
  TrendingUp,
  Sparkles,
  GraduationCap,
  FileText,
  ShieldCheck,
  Sliders,
};

export function DomainSelector({
  selectedDomainId,
  onSelectDomain,
  onPickExampleTopic,
}: DomainSelectorProps) {
  const selectedDomain = DOMAIN_PRESETS.find((d) => d.id === selectedDomainId) || DOMAIN_PRESETS[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Target Domain / Field
        </label>
        <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
          {selectedDomain.name} Selected
        </span>
      </div>

      {/* Grid of Domain Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {DOMAIN_PRESETS.map((domain) => {
          const Icon = ICON_MAP[domain.iconName] || Sliders;
          const isSelected = domain.id === selectedDomainId;

          return (
            <button
              key={domain.id}
              type="button"
              onClick={() => onSelectDomain(domain)}
              className={`group relative p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-indigo-600/10 dark:bg-indigo-500/15 border-indigo-500 text-indigo-950 dark:text-indigo-100 ring-2 ring-indigo-500/30 shadow-md'
                  : 'bg-white/50 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white/80 dark:hover:bg-slate-900/70'
              }`}
            >
              <div className="flex items-start justify-between gap-1 w-full mb-2">
                <div
                  className={`p-2 rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold leading-tight line-clamp-1">
                  {domain.name}
                </h4>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">
                  {domain.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Domain Examples Bar */}
      {selectedDomain.exampleTopics.length > 0 && onPickExampleTopic && (
        <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 dark:border-indigo-500/20 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-900 dark:text-indigo-200">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Click an example topic to populate:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedDomain.exampleTopics.map((topic, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onPickExampleTopic(topic)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors text-left"
              >
                &quot;{topic}&quot;
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
