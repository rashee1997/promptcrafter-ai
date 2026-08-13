import { NextRequest, NextResponse } from 'next/server';
import { CaseEvaluationRequest, CaseEvaluationResult } from '@/types';
import { runNonStreamingCompletion } from '@/lib/server-completion';
import { PASS_THRESHOLD } from '@/lib/prompt-quality';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const OUTPUT_JUDGE_RUBRIC = `You are a rigorous QA judge for AI model outputs. You will receive a TASK PROMPT, an INPUT, and the MODEL OUTPUT produced by executing the prompt on that input.

Return STRICT JSON ONLY (no markdown, no commentary) with exactly this shape:
{
  "score": <number 0-100>,
  "notes": "<one short sentence>",
  "passed": <true|false>
}

Scoring: does the output (1) follow the prompt's instructions and output format, (2) answer the input completely without omissions, (3) avoid hallucination and unsupported claims, and (4) stay within the prompt's guardrails? Score 90-100 excellent, 75-89 acceptable, 50-74 flawed, below 50 failed. "passed" is true when score >= ${PASS_THRESHOLD}.`;

interface JudgePayload {
  score?: number;
  notes?: string;
  passed?: boolean;
}

function parseJudge(text: string): JudgePayload | null {
  const trimmed = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const first = trimmed.indexOf('{');
  const last = trimmed.lastIndexOf('}');
  if (first === -1 || last === -1 || last <= first) return null;
  try {
    const parsed = JSON.parse(trimmed.slice(first, last + 1));
    return parsed && typeof parsed === 'object' ? (parsed as JudgePayload) : null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: CaseEvaluationRequest = await req.json();
    const { provider, prompt, testInput } = body;

    if (!provider) {
      return NextResponse.json({ error: 'Provider is required.' }, { status: 400 });
    }
    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
    }

    const userMessage = testInput?.trim() || 'Please execute the prompt with standard parameters.';

    // Phase 1: execute the prompt against the test input
    let output = '';
    try {
      output = await runNonStreamingCompletion(
        provider,
        [
          { role: 'system', content: prompt },
          { role: 'user', content: userMessage },
        ]
      );
    } catch (err: any) {
      return NextResponse.json({
        output: '',
        score: null,
        passed: false,
        error: err?.message || 'Prompt execution failed.',
      } satisfies CaseEvaluationResult);
    }

    // Phase 2: judge the output quality
    let score: number | null = null;
    let notes: string | undefined;
    let passed = output.trim().length > 0;

    try {
      const judgeRaw = await runNonStreamingCompletion(
        provider,
        [
          { role: 'system', content: OUTPUT_JUDGE_RUBRIC },
          {
            role: 'user',
            content: `TASK PROMPT:\n"""\n${prompt}\n"""\n\nINPUT:\n"""\n${userMessage}\n"""\n\nMODEL OUTPUT:\n"""\n${output.slice(0, 8000)}\n"""`,
          },
        ],
        { temperature: 0.2 }
      );
      const judged = parseJudge(judgeRaw);
      if (judged && typeof judged.score === 'number') {
        score = Math.max(0, Math.min(100, Math.round(judged.score)));
        notes = typeof judged.notes === 'string' ? judged.notes : undefined;
        passed = typeof judged.passed === 'boolean' ? judged.passed : score >= PASS_THRESHOLD;
      }
    } catch (err) {
      console.error('Output judge failed; using execution-only pass state:', err);
    }

    const result: CaseEvaluationResult = {
      output,
      score,
      passed,
      notes,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API /api/evaluate-output Error:', error);
    return NextResponse.json({ error: error?.message || 'Case evaluation failed.' }, { status: 500 });
  }
}
