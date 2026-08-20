import { NextRequest, NextResponse } from 'next/server';
import { EvaluateRequest, PromptQuality, QualityDimension } from '@/types';
import {
  QUALITY_RUBRIC_PROMPT,
  QUALITY_RUBRIC_VERSION,
  heuristicPromptQuality,
  normalizeImprovementTag,
} from '@/lib/prompt-quality';
import { runNonStreamingCompletion, resolveJudgeProvider } from '@/lib/server-completion';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function parseDimension(value: unknown): QualityDimension | null {
  const obj = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
  if (typeof obj.score !== 'number') return null;
  const notes = typeof obj.notes === 'string' ? obj.notes : '';
  return { score: clamp(obj.score), notes };
}

/** Extract the first balanced JSON object from a model response. */
function extractJson(text: string): Record<string, unknown> | null {
  const trimmed = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const first = trimmed.indexOf('{');
  const last = trimmed.lastIndexOf('}');
  if (first === -1 || last === -1 || last <= first) return null;
  try {
    const parsed = JSON.parse(trimmed.slice(first, last + 1));
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

const DIM_KEYS = ['clarity', 'structure', 'outputSpec', 'context', 'errorHandling', 'tokenEfficiency'] as const;

/**
 * Parse and VALIDATE a judge response. Returns null (→ heuristic fallback)
 * unless every dimension is present with a numeric score. `overall` is always
 * recomputed as the mean of the dimensions — the model's own `overall` is never
 * trusted, so invalid JSON cannot inflate a score.
 */
function parseQuality(raw: string, providerName: string, modelUsed: string, judgeVersion: string): PromptQuality | null {
  const parsed = extractJson(raw);
  if (!parsed || typeof parsed !== 'object') return null;

  const dims = (parsed.dimensions && typeof parsed.dimensions === 'object' ? parsed.dimensions : {}) as Record<string, unknown>;

  const dimensions = {} as PromptQuality['dimensions'];
  for (const key of DIM_KEYS) {
    const dim = parseDimension(dims[key]);
    if (!dim) return null;
    dimensions[key] = dim;
  }

  const overall = clamp(
    Math.round(DIM_KEYS.reduce((sum, key) => sum + dimensions[key].score, 0) / DIM_KEYS.length)
  );

  const improvements = Array.isArray(parsed.improvements)
    ? parsed.improvements
        .filter(
          (item): item is { issue: string; fix: string } =>
            !!item && typeof item === 'object' &&
            typeof (item as { issue?: unknown }).issue === 'string' &&
            typeof (item as { fix?: unknown }).fix === 'string'
        )
        .map((item) => ({
          issue: item.issue,
          fix: item.fix,
          ...normalizeImprovementTag(
            (item as { dimension?: unknown }).dimension,
            (item as { severity?: unknown }).severity
          ),
        }))
    : [];

  return {
    overall,
    dimensions,
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : [],
    improvements,
    modelUsed,
    providerName,
    evaluatedAt: Date.now(),
    source: 'llm-judge',
    judgeModel: modelUsed,
    judgeProvider: providerName,
    judgeVersion,
  };
}

function buildTaskContextBlock(context: EvaluateRequest['context'] | undefined): string {
  if (!context) return '';
  const lines: string[] = [];
  if (context.topic) lines.push(`- Original request: ${context.topic}`);
  if (context.domainName) lines.push(`- Domain: ${context.domainName}`);
  if (context.tone) lines.push(`- Tone: ${context.tone}`);
  if (context.framework) lines.push(`- Framework: ${context.framework}`);
  if (context.targetAudience) lines.push(`- Target audience: ${context.targetAudience}`);
  if (context.additionalNotes) lines.push(`- Additional notes: ${context.additionalNotes}`);
  if (lines.length === 0) return '';
  return `TASK CONTEXT (score the prompt against this purpose, not in a vacuum):\n${lines.join('\n')}\n`;
}

export async function POST(req: NextRequest) {
  try {
    const body: EvaluateRequest = await req.json();
    const { provider, prompt } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
    }
    if (!provider) {
      return NextResponse.json({ error: 'Provider is required.' }, { status: 400 });
    }

    let quality: PromptQuality | null = null;
    let raw: string | null = null;

    try {
      const judgeProvider = resolveJudgeProvider(provider);
      raw = await runNonStreamingCompletion(
        judgeProvider,
        [
          { role: 'system', content: QUALITY_RUBRIC_PROMPT },
          {
            role: 'user',
            content: `PROMPT TO EVALUATE:\n"""\n${prompt}\n"""\n\n${buildTaskContextBlock(body.context)}Rate the prompt strictly against the task context when provided.`,
          },
        ],
        // Pinned judge settings: temperature 0 keeps scores stable between runs.
        { temperature: 0 }
      );
      quality = parseQuality(raw, judgeProvider.name, judgeProvider.model || judgeProvider.name, QUALITY_RUBRIC_VERSION);
    } catch (err) {
      console.error('LLM judge failed, falling back to heuristic:', err);
    }

    if (!quality) {
      quality = heuristicPromptQuality(prompt);
      quality = {
        ...quality,
        fallbackReason: raw
          ? 'The AI review returned an unreadable response — showing a quick estimate.'
          : 'AI review unavailable — showing a quick estimate.',
      };
    }

    return NextResponse.json({ quality });
  } catch (error: any) {
    console.error('API /api/evaluate Error:', error);
    return NextResponse.json({ error: error?.message || 'Evaluation failed.' }, { status: 500 });
  }
}
