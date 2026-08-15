import { PromptQuality } from '@/types';
import { computePromptStats, unwrapCodeBlock } from './prompt-stats';

/** Case score at or above this threshold counts as "passed" in regression runs. */
export const PASS_THRESHOLD = 75;

/**
 * The rubric prompt used by the LLM judge in /api/evaluate.
 * The judge must return strict JSON matching the PromptQuality shape.
 */
export const QUALITY_RUBRIC_PROMPT = `You are a rigorous prompt-quality auditor. Evaluate the AI prompt below and return STRICT JSON ONLY (no markdown, no commentary) with exactly this shape:

{
  "overall": <number 0-100>,
  "dimensions": {
    "clarity": { "score": <0-100>, "notes": "<one sentence>" },
    "structure": { "score": <0-100>, "notes": "<one sentence>" },
    "outputSpec": { "score": <0-100>, "notes": "<one sentence>" },
    "context": { "score": <0-100>, "notes": "<one sentence>" },
    "errorHandling": { "score": <0-100>, "notes": "<one sentence>" },
    "tokenEfficiency": { "score": <0-100>, "notes": "<one sentence>" }
  },
  "strengths": ["<2-3 concrete strengths>"],
  "improvements": [{ "issue": "<specific gap>", "fix": "<one-line actionable fix>" }]
}

Scoring rubric:
- clarity: are instructions unambiguous, specific, and impossible to misinterpret?
- structure: does the prompt flow logically (role -> context -> task -> constraints -> output)?
- outputSpec: is the expected output format, structure, and length explicitly defined?
- context: does it give the model enough background to avoid making assumptions?
- errorHandling: does it cover edge cases, what NOT to do, and guardrails?
- tokenEfficiency: is it lean (no fluff, repetition, or irrelevant boilerplate)? Long prompts should score lower unless every word earns its place.

overall = mean of the six dimensions. Score 90-100 production-ready, 75-89 functional with gaps, 50-74 unreliable, below 50 structurally broken.`;

/** Run a deterministic heuristic assessment (used before/without the LLM judge). */
export function heuristicPromptQuality(prompt: string): PromptQuality {
  const unwrapped = unwrapCodeBlock(prompt);
  const { wordCount, estTokens } = computePromptStats(unwrapped);
  const text = unwrapped;

  const hasRole = /\b(system|role|persona|expert|act as|you are)\b/i.test(text);
  const hasClearTask = /\b(task|goal|objective|create|write|build|generate|draft|design)\b/i.test(text);
  const hasFormat = /\b(format|markdown|json|xml|bullet|output|return|structure|schema)\b/i.test(text);
  const hasContext = /\b(context|background|audience|user|stakeholder|scenario|environment)\b/i.test(text);
  const hasConstraints = /\b(do not|don't|never|avoid|constraint|guardrail|must not|not allowed)\b/i.test(text);
  const hasExamples = /\b(example|e\.g\.|for instance|sample)\b/i.test(text);
  const hasPlaceholders = /\[[A-Z0-9_]+\]/i.test(text);
  const hasEdgeCases = /\b(edge case|fallback|if .* then|when .* is missing|error|ambiguous|incomplete)\b/i.test(text);

  const headingCount = (text.match(/^#{1,3}\s+.+$/gm) || []).length;

  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

  const clarityScore = clamp(45 + (hasRole ? 12 : 0) + (hasClearTask ? 18 : 0) + (hasPlaceholders ? 8 : 0));
  const structureScore = clamp(40 + headingCount * 6 + (hasClearTask ? 10 : 0) + (hasConstraints ? 8 : 0));
  const outputSpecScore = clamp(40 + (hasFormat ? 22 : 0) + (hasExamples ? 12 : 0) + (hasPlaceholders ? 8 : 0));
  const contextScore = clamp(40 + (hasContext ? 20 : 0) + (hasRole ? 12 : 0));
  const errorHandlingScore = clamp(30 + (hasConstraints ? 28 : 0) + (hasEdgeCases ? 14 : 0));
  const tokenEfficiencyScore =
    estTokens > 1200 ? 55 : estTokens > 800 ? 65 : estTokens > 500 ? 78 : estTokens > 250 ? 88 : 95;

  const dimensions = {
    clarity: { score: clarityScore, notes: hasClearTask ? 'States the goal clearly.' : 'Add one sentence stating the goal.' },
    structure: {
      score: structureScore,
      notes: headingCount > 0 ? `Uses ${headingCount} clearly labeled section${headingCount === 1 ? '' : 's'}.` : 'Add labeled sections (goal, steps, rules, output).',
    },
    outputSpec: {
      score: outputSpecScore,
      notes: hasFormat ? 'Output format is specified.' : 'Specify the exact output format (sections, bullet points, JSON, XML).',
    },
    context: {
      score: contextScore,
      notes: hasContext ? 'Provides helpful background.' : 'Add background so the AI does not have to guess.',
    },
    errorHandling: {
      score: errorHandlingScore,
      notes: hasConstraints ? 'Includes "what to avoid" guidance.' : 'Add clear rules about what to avoid.',
    },
    tokenEfficiency: {
      score: tokenEfficiencyScore,
      notes: estTokens > 800 ? `~${estTokens} tokens — may be too long; aim under 600.` : `Concise prompt (~${estTokens} tokens).`,
    },
  };

  const strengths: string[] = [];
  if (hasRole) strengths.push('Defines who the AI should act as.');
  if (hasClearTask) strengths.push('States a concrete task or goal.');
  if (hasFormat) strengths.push('Specifies the desired output format.');
  if (hasConstraints) strengths.push('Includes "what to avoid" guidance.');
  if (hasExamples) strengths.push('Uses examples to show the expected result.');
  if (strengths.length === 0) strengths.push('Has a clear structure to build on.');

  const improvements: { issue: string; fix: string }[] = [];
  if (!hasRole) improvements.push({ issue: 'No clear role is defined.', fix: 'Open with "You are a [expert role]..."' });
  if (!hasClearTask) improvements.push({ issue: 'Task is vague.', fix: 'Add one sentence stating the goal: "Build/Draft/Write [deliverable]."' });
  if (!hasFormat) improvements.push({ issue: 'Output format is not specified.', fix: 'State the exact format: sections, bullet points, JSON, or XML.' });
  if (!hasContext) improvements.push({ issue: 'Missing context.', fix: 'Provide background, the audience, and any reference material.' });
  if (!hasConstraints) improvements.push({ issue: 'No "what to avoid" guidance.', fix: 'Add clear rules about what the AI should not do.' });
  if (estTokens > 800) improvements.push({ issue: 'The prompt may be too long.', fix: 'Remove repeated text and keep it concise (aim under ~600 tokens).' });

  const overall = clamp(
    (clarityScore + structureScore + outputSpecScore + contextScore + errorHandlingScore + tokenEfficiencyScore) / 6
  );

  return {
    overall,
    dimensions,
    strengths,
    improvements,
    modelUsed: 'heuristic',
    providerName: 'Local Heuristic',
    evaluatedAt: Date.now(),
    source: 'heuristic',
  };
}

/** Merge a heuristic assessment with stored word/token counts for display. */
export function formatQualityLabel(quality: PromptQuality | undefined | null): string {
  if (!quality) return '—';
  const grade =
    quality.overall >= 90 ? 'Ready to use' : quality.overall >= 75 ? 'Good' : quality.overall >= 50 ? 'Needs improvement' : 'Needs a rewrite';
  return `${quality.overall}/100 · ${grade}`;
}
