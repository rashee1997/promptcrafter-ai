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
import { useDynamicExamples } from '@/hooks/use-dynamic-examples';
import { cn } from '@/lib/utils';
import { DomainPreset, PromptInput } from '@/types';
import { RefreshCw } from 'lucide-react';

interface DomainSelectorProps {
  selectedDomainId: string;
  onSelectDomain: (domain: DomainPreset) => void;
  onPickExampleTopic?: (topic: string) => void;
  /**
   * Current prompt selections (domain, tone, framework, audience) — passed as
   * context so the AI-refreshed example chips stay relevant to the settings.
   */
  currentInput?: Partial<PromptInput>;
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
  currentInput,
}: DomainSelectorProps) {
  const selectedDomain = DOMAIN_PRESETS.find((d) => d.id === selectedDomainId) || DOMAIN_PRESETS[0];
  const { examples, isRefreshing, refresh } = useDynamicExamples(
    'text',
    currentInput,
    selectedDomain.exampleTopics
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span id="domain-selector-label" className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Use case
        </span>
        <span className="text-xs text-brand font-medium" aria-hidden="true">
          {selectedDomain.name} selected
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
              className={`group relative p-3 rounded border text-left transition-colors duration-150 flex flex-col justify-between ${
                isSelected
                  ? 'bg-surface-elevated border-brand text-text-primary shadow-sm'
                  : 'bg-surface-card border-border text-text-secondary hover:border-border-hover'
              }`}
            >
              <div className="flex items-start justify-between gap-1 w-full mb-2">
                <div
                  className={`p-1.5 rounded transition-colors ${
                    isSelected
                      ? 'text-brand'
                      : 'text-text-secondary group-hover:text-text-primary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />
                )}
              </div>

              <div>
                <h4 className="text-xs font-semibold leading-tight line-clamp-1">
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

      {/* Domain Examples Bar — static examples render instantly, then quietly
          upgrade to AI-refreshed suggestions matched to the current settings. */}
      {selectedDomain.exampleTopics.length > 0 && onPickExampleTopic && (
        <div className="p-3 rounded bg-surface-muted border border-border space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
              <Lightbulb className="w-3.5 h-3.5 shrink-0" />
              <span>Try an example:</span>
            </div>
            <button
              type="button"
              onClick={refresh}
              disabled={isRefreshing}
              title="Get new suggestions"
              aria-label="Get new example suggestions"
              className="flex items-center gap-1 px-1.5 py-1 rounded text-[10px] font-medium text-text-muted hover:text-text-primary transition-colors disabled:opacity-60"
            >
              <RefreshCw className={cn('w-3 h-3', isRefreshing && 'animate-spin')} />
              {isRefreshing ? 'Refreshing' : 'New ideas'}
            </button>
          </div>
          <div
            className={cn(
              'flex flex-wrap gap-1.5 transition-opacity duration-150',
              isRefreshing && 'opacity-60'
            )}
            aria-busy={isRefreshing}
          >
            {examples.map((topic, i) => (
              <button
                key={`${topic}-${i}`}
                type="button"
                onClick={() => onPickExampleTopic(topic)}
                className="text-[11px] px-2 py-1 rounded bg-surface-card border border-border text-text-secondary hover:text-text-primary hover:border-border-hover transition-colors text-left"
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
