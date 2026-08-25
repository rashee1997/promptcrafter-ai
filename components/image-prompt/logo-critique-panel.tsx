'use client';

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { getLogoCritique } from '@/lib/ai-client';
import { ImagePromptInput, LogoPrincipleScore } from '@/types';

/** Score thresholds mirror components/prompt-output.tsx's quality dimension bars (PASS_THRESHOLD=75, warning>=50). */
function scoreColorClasses(score: number): { text: string; bar: string } {
  if (score >= 75) return { text: 'text-success', bar: 'bg-success' };
  if (score >= 50) return { text: 'text-warning', bar: 'bg-warning' };
  return { text: 'text-danger', bar: 'bg-danger' };
}

const PRINCIPLE_LABELS: Record<LogoPrincipleScore['principle'], string> = {
  simplicity: 'Simplicity',
  memorability: 'Memorability',
  versatility: 'Versatility',
  appropriateness: 'Appropriateness',
  distinctiveness: 'Distinctiveness',
  timelessness: 'Timelessness',
  colorDiscipline: 'Color discipline',
};

interface LogoCritiquePanelProps {
  input: ImagePromptInput;
}

/**
 * Logo Prompt Studio only — scores the current brief against the seven
 * design principles documented in lib/logo-prompts.ts. Manual (button press)
 * only, mirrors AiConfigAssist's "Generate options" convention: does not
 * fire on mount, never blocks the rest of the form.
 */
export function LogoCritiquePanel({ input }: LogoCritiquePanelProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'unavailable'>('idle');
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [principles, setPrinciples] = useState<LogoPrincipleScore[]>([]);
  const [topRecommendation, setTopRecommendation] = useState('');

  const handleCritique = async () => {
    setStatus('loading');
    const response = await getLogoCritique({ input });
    if (response.overallScore === null || response.principles.length === 0) {
      setStatus('unavailable');
      return;
    }
    setOverallScore(response.overallScore);
    setPrinciples(response.principles);
    setTopRecommendation(response.topRecommendation);
    setStatus('ready');
  };

  return (
    <div className="space-y-3 p-3 rounded-xl bg-surface-muted/40 border border-border">
      {status === 'idle' && (
        <button
          type="button"
          onClick={handleCritique}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-gradient-to-r from-brand/20 to-accent/20 hover:from-brand/30 hover:to-accent/30 text-text-primary border border-brand/30 transition-all"
        >
          <Sparkles className="w-3 h-3 text-brand" />
          Critique this brief
        </button>
      )}

      {status === 'loading' && (
        <div className="space-y-2 animate-pulse">
          <div className="h-3 w-24 rounded bg-surface-hover" />
          <div className="h-1.5 w-full rounded-full bg-surface-hover" />
          <div className="h-1.5 w-full rounded-full bg-surface-hover" />
        </div>
      )}

      {status === 'unavailable' && (
        <p className="text-[10px] text-warning font-medium leading-relaxed">
          AI critique unavailable — add a subject, industry, or concept and try again.
        </p>
      )}

      {status === 'ready' && overallScore !== null && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Brief score</span>
            <span className={`text-[13px] font-black ${scoreColorClasses(overallScore).text}`}>{overallScore}/100</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {principles.map((p) => {
              const colors = scoreColorClasses(p.score);
              return (
                <div key={p.principle} className="p-2 rounded-lg bg-surface-card border border-border/70">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold text-text-secondary">{PRINCIPLE_LABELS[p.principle]}</span>
                    <span className={`text-[10px] font-bold ${colors.text}`}>{p.score}</span>
                  </div>
                  <div className="h-1 rounded-full bg-surface-hover overflow-hidden">
                    <div className={`h-full rounded-full ${colors.bar}`} style={{ width: `${p.score}%` }} />
                  </div>
                  <p className="mt-1 text-[9px] text-text-muted leading-relaxed">{p.feedback}</p>
                </div>
              );
            })}
          </div>

          {topRecommendation && (
            <p className="text-[10px] text-text-secondary leading-relaxed">
              <span className="font-semibold text-brand">Top fix: </span>
              {topRecommendation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
