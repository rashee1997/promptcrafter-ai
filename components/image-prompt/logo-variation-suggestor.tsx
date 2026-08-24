'use client';

import React, { useState } from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getLogoVariations } from '@/lib/ai-client';
import { LOGO_LOCKUP_PRESETS } from '@/lib/logo-prompts';
import { ImagePromptInput, LogoVariationSuggestion } from '@/types';

interface LogoVariationSuggestorProps {
  input: ImagePromptInput;
  currentLockup: string | undefined;
  onSelect: (lockupType: string) => void;
}

/**
 * Logo Prompt Studio only — proposes a coherent 3-4 item lockup/variation set
 * (icon-only for favicon, horizontal for header, etc.) reasoned from the
 * current brief. Manual (button press) only, same convention as
 * AiConfigAssist/LogoCritiquePanel. Selecting a suggestion applies its
 * lockupType via the existing setLockup handler — never invents a new one.
 */
export function LogoVariationSuggestor({ input, currentLockup, onSelect }: LogoVariationSuggestorProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'unavailable'>('idle');
  const [variations, setVariations] = useState<LogoVariationSuggestion[]>([]);

  const handleSuggest = async () => {
    setStatus('loading');
    const response = await getLogoVariations({ input });
    if (!response.variations || response.variations.length === 0) {
      setStatus('unavailable');
      return;
    }
    setVariations(response.variations);
    setStatus('ready');
  };

  return (
    <div className="space-y-2">
      {status === 'idle' && (
        <button
          type="button"
          onClick={handleSuggest}
          className="flex items-center gap-1.5 text-[10px] font-semibold text-brand hover:text-brand-hover transition-colors"
        >
          <Sparkles className="w-3 h-3" />
          Suggest a variation set
        </button>
      )}

      {status === 'loading' && (
        <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
          <RefreshCw className="w-3 h-3 animate-spin" />
          Reasoning about lockup variations…
        </div>
      )}

      {status === 'unavailable' && (
        <p className="text-[10px] text-warning font-medium leading-relaxed">
          AI variation suggestions unavailable — add a subject or concept and try again.
        </p>
      )}

      {status === 'ready' && (
        <div className="space-y-1.5">
          {variations.map((v) => {
            const preset = LOGO_LOCKUP_PRESETS.find((p) => p.id === v.lockupType);
            const selected = currentLockup === v.lockupType;
            return (
              <button
                key={v.lockupType}
                type="button"
                onClick={() => onSelect(v.lockupType)}
                className={cn(
                  'w-full text-left p-2 rounded-lg border transition-all',
                  selected
                    ? 'bg-brand/15 border-brand ring-1 ring-brand/40'
                    : 'bg-surface-card/50 border-border hover:border-brand/40 hover:bg-surface-hover'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-text-primary">{preset?.label ?? v.lockupType}</span>
                  <span className="text-[9px] font-medium text-text-muted">{v.useCase}</span>
                </div>
                <p className="mt-0.5 text-[9px] text-text-muted leading-relaxed">{v.reasoning}</p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
