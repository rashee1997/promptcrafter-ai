import { NextRequest, NextResponse } from 'next/server';
import { EvaluateRequest, PromptQuality, QualityDimension } from '@/types';
import { QUALITY_RUBRIC_PROMPT, heuristicPromptQuality } from '@/lib/prompt-quality';
import { runNonStreamingCompletion } from '@/lib/server-completion';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function parseDimension(value: unknown): QualityDimension {
  const obj = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
  const score = typeof obj.score === 'number' ? clamp(obj.score) : 50;
  const notes = typeof obj.notes === 'string' ? obj.notes : '';
  return { score, notes };
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

function parseQuality(raw: string, providerName: string, modelUsed: string): PromptQuality | null {
  const parsed = extractJson(raw);
  if (!parsed || typeof parsed.overall !== 'number') return null;

  const dims = (parsed.dimensions && typeof parsed.dimensions === 'object' ? parsed.dimensions : {}) as Record<string, unknown>;

  const improvements = Array.isArray(parsed.improvements)
    ? parsed.improvements
        .filter(
          (item): item is { issue: string; fix: string } =>
            !!item && typeof item === 'object' &&
            typeof (item as { issue?: unknown }).issue === 'string' &&
            typeof (item as { fix?: unknown }).fix === 'string'
        )
        .map((item) => ({ issue: item.issue, fix: item.fix }))
    : [];

  return {
    overall: clamp(parsed.overall),
    dimensions: {
      clarity: parseDimension(dims.clarity),
      structure: parseDimension(dims.structure),
      outputSpec: parseDimension(dims.outputSpec),
      context: parseDimension(dims.context),
      errorHandling: parseDimension(dims.errorHandling),
      tokenEfficiency: parseDimension(dims.tokenEfficiency),
    },
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : [],
    improvements,
    modelUsed,
    providerName,
    evaluatedAt: Date.now(),
    source: 'llm-judge',
  };
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
    try {
      const raw = await runNonStreamingCompletion(
        provider,
        [
          { role: 'system', content: QUALITY_RUBRIC_PROMPT },
          { role: 'user', content: `PROMPT TO EVALUATE:\n"""\n${prompt}\n"""` },
        ],
        { temperature: 0.2 }
      );
      quality = parseQuality(raw, provider.name, provider.model || provider.name);
    } catch (err) {
      console.error('LLM judge failed, falling back to heuristic:', err);
    }

    if (!quality) {
      quality = heuristicPromptQuality(prompt);
    }

    return NextResponse.json({ quality });
  } catch (error: any) {
    console.error('API /api/evaluate Error:', error);
    return NextResponse.json({ error: error?.message || 'Evaluation failed.' }, { status: 500 });
  }
}
