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
  PenLine,
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
  PenLine,
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
        <span id="domain-selector-label" className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Target Domain / Field
        </span>
        <span className="text-xs text-brand font-medium" aria-hidden="true">
          {selectedDomain.name} Selected
        </span>
      </div>

      {/* Grid of Domain Cards */}
      <div role="group" aria-labelledby="domain-selector-label" className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {DOMAIN_PRESETS.map((domain) => {
          const Icon = ICON_MAP[domain.iconName] || Sliders;
          const isSelected = domain.id === selectedDomainId;

          return (
            <button
              key={domain.id}
              type="button"
              onClick={() => onSelectDomain(domain)}
              aria-pressed={isSelected}
              className={`group relative p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-brand/10 dark:bg-brand/15 border-brand text-text-primary dark:text-indigo-100 ring-2 ring-indigo-500/30 shadow-md'
                  : 'bg-surface-card/50 border-border text-text-secondary hover:border-border-hover hover:bg-surface-card/80'
              }`}
            >
              <div className="flex items-start justify-between gap-1 w-full mb-2">
                <div
                  className={`p-2 rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-brand text-white'
                      : 'bg-surface-hover text-text-secondary group-hover:text-brand'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold leading-tight line-clamp-1">
                  {domain.name}
                </h4>
                <p className="mt-1 text-[11px] text-text-muted line-clamp-2 leading-tight">
                  {domain.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Domain Examples Bar */}
      {selectedDomain.exampleTopics.length > 0 && onPickExampleTopic && (
        <div className="p-3 rounded-xl bg-brand/5 border border-brand/10 dark:border-brand/20 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
            <Lightbulb className="w-3.5 h-3.5 text-warning shrink-0" />
            <span>Click an example topic to populate:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedDomain.exampleTopics.map((topic, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onPickExampleTopic(topic)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-surface-card border border-border text-text-secondary hover:border-brand/40 hover:text-brand transition-colors text-left"
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
