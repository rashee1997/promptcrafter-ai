import { PromptQuality, PromptVersion } from '@/types';
import { heuristicPromptQuality, isComparableQuality } from './prompt-quality';
import { estimateCostPerCompletion, estimateGenerationCost } from './model-pricing';

/**
 * Cost-Per-Quality ledger math.
 *
 * Every version of a session gets: token count, estimated cost per 1,000
 * production completions (the number that silently explodes when a prompt edit
 * adds tokens), estimated one-shot generation cost, the quality score (stored
 * LLM-judge score when available, local heuristic otherwise) and
 * score-per-dollar. Versions where cost went up but score did not are flagged
 * as "silent cost blowouts".
 */

export interface LedgerRow {
  version: PromptVersion;
  quality: PromptQuality;
  tokens: number;
  costPer1kCompletions: number; // USD for 1,000 production completions of this prompt
  generationCost: number; // USD to generate this prompt once
  scorePerDollar: number | null; // overall / $1 of runtime cost; null when the model is free/local
  costDelta: number; // costPer1kCompletions vs previous version (first row: 0)
  scoreDelta: number | null; // overall vs previous version (first row: null)
  silentCostBlowout: boolean; // cost ↑ but score did not improve vs previous version
}

function qualityFor(version: PromptVersion): PromptQuality {
  return version.quality || heuristicPromptQuality(version.content);
}

export function buildCostLedger(versions: PromptVersion[]): LedgerRow[] {
  const rows: LedgerRow[] = [];

  for (let i = 0; i < versions.length; i++) {
    const version = versions[i];
    const tokens = version.stats?.estTokens ?? Math.max(Math.ceil(version.content.length / 3.8), 0);
    const model = version.modelUsed || 'unknown';
    const costPerCompletion = estimateCostPerCompletion(model, tokens);
    const costPer1kCompletions = costPerCompletion * 1000;
    const generationCost = estimateGenerationCost(model, tokens);
    const quality = qualityFor(version);

    const prev = i > 0 ? rows[i - 1] : null;
    const costDelta = prev ? costPer1kCompletions - prev.costPer1kCompletions : 0;
    // Score deltas are only meaningful between comparable measurements
    // (same source and, for LLM scores, the same judge model + rubric version).
    const scoreDelta = prev
      ? isComparableQuality(prev.quality, quality)
        ? quality.overall - prev.quality.overall
        : null
      : null;
    const silentCostBlowout =
      !!prev && costDelta > 0 && scoreDelta !== null && scoreDelta <= 0;

    rows.push({
      version,
      quality,
      tokens,
      costPer1kCompletions,
      generationCost,
      scorePerDollar:
        costPer1kCompletions > 0 ? quality.overall / costPer1kCompletions : null,
      costDelta,
      scoreDelta,
      silentCostBlowout,
    });
  }

  return rows;
}

export interface ScoreAttribution {
  a: PromptVersion;
  b: PromptVersion;
  qualityA: PromptQuality;
  qualityB: PromptQuality;
  tokensDelta: number;
  wordDelta: number;
  overallDelta: number;
  dimensionDeltas: {
    key: string;
    label: string;
    before: number;
    after: number;
    delta: number;
    beforeNote: string;
    afterNote: string;
  }[];
}

const DIMENSION_LABELS: { key: string; label: string }[] = [
  { key: 'clarity', label: 'Clarity & Specificity' },
  { key: 'structure', label: 'Structure & Organization' },
  { key: 'outputSpec', label: 'Output Specification' },
  { key: 'context', label: 'Contextual Guidance' },
  { key: 'errorHandling', label: 'Error Handling / Guardrails' },
  { key: 'tokenEfficiency', label: 'Token Efficiency' },
];

/**
 * Why a score moved between two versions: per-dimension deltas plus
 * token/word drift, so teams see the cause, not just the number.
 */
export function computeScoreAttribution(a: PromptVersion, b: PromptVersion): ScoreAttribution | null {
  const qualityA = a.quality || heuristicPromptQuality(a.content);
  const qualityB = b.quality || heuristicPromptQuality(b.content);

  return {
    a,
    b,
    qualityA,
    qualityB,
    tokensDelta: (b.stats?.estTokens ?? 0) - (a.stats?.estTokens ?? 0),
    wordDelta: (b.stats?.wordCount ?? 0) - (a.stats?.wordCount ?? 0),
    overallDelta: qualityB.overall - qualityA.overall,
    dimensionDeltas: DIMENSION_LABELS.map(({ key, label }) => ({
      key,
      label,
      before: qualityA.dimensions[key as keyof PromptQuality['dimensions']].score,
      after: qualityB.dimensions[key as keyof PromptQuality['dimensions']].score,
      delta:
        qualityB.dimensions[key as keyof PromptQuality['dimensions']].score -
        qualityA.dimensions[key as keyof PromptQuality['dimensions']].score,
      beforeNote: qualityA.dimensions[key as keyof PromptQuality['dimensions']].notes,
      afterNote: qualityB.dimensions[key as keyof PromptQuality['dimensions']].notes,
    })),
  };
}

/** Sparkline-safe score series across all versions (stored score or heuristic). */
export function scoreSeries(versions: PromptVersion[]): number[] {
  return versions.map((v) => qualityFor(v).overall);
}

/** Sparkline-safe cost series (USD per 1,000 completions) across all versions. */
export function costSeries(versions: PromptVersion[]): number[] {
  return versions.map((v) => {
    const tokens = v.stats?.estTokens ?? Math.max(Math.ceil(v.content.length / 3.8), 0);
    return estimateCostPerCompletion(v.modelUsed || 'unknown', tokens) * 1000;
  });
}
