import { NextRequest, NextResponse } from 'next/server';
import { PromptInput, ProviderConfig } from '@/types';
import { runNonStreamingCompletion } from '@/lib/server-completion';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export interface BatchScenario {
  id: string;
  type: 'nominal' | 'edge-case' | 'format-boundary' | 'adversarial';
  title: string;
  description: string;
  testInput: string;
}

const SCENARIO_GEN_PROVIDER: ProviderConfig = {
  id: 'builtin-gemini-batch-gen',
  name: 'Google Gemini (Batch Gen)',
  baseUrl: 'https://generativelanguage.googleapis.com',
  apiKey: 'BUILTIN',
  useBuiltInGemini: true,
  model: 'gemini-2.5-flash',
  temperature: 0.7,
  maxTokens: 1200,
};

const SYSTEM_SCENARIOS_PROMPT = `You are a Principal QA and AI Evaluation Engineer.
Given a prompt objective and domain, generate a diverse matrix of 6-8 challenging test scenarios:
1. 2 Nominal / Standard use cases
2. 2 Complex Edge Cases (ambiguous input, extreme constraints)
3. 2 Format Boundary Tests (tempting the model to break its format contract)
4. 1-2 Adversarial Tests (pressure testing guardrails)

Return ONLY a JSON array of objects matching this schema:
[
  {
    "id": "sc-1",
    "type": "nominal" | "edge-case" | "format-boundary" | "adversarial",
    "title": "Short title",
    "description": "What this tests",
    "testInput": "Exact realistic user input string to test"
  }
]
Output JSON ONLY, no extra text.`;

export async function POST(req: NextRequest) {
  try {
    const body: { input: PromptInput } = await req.json();
    const { input } = body;

    if (!input || !input.topic) {
      return NextResponse.json({ error: 'Prompt input topic is required.' }, { status: 400 });
    }

    const userPrompt = `Domain: ${input.domainId}\nTopic: "${input.topic}"\nTone: ${input.tone}\nFramework: ${input.framework}\nAudience: ${input.targetAudience || 'General'}`;

    const raw = await runNonStreamingCompletion(
      SCENARIO_GEN_PROVIDER,
      [
        { role: 'system', content: SYSTEM_SCENARIOS_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      { temperature: 0.7 },
    );

    const cleaned = raw.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    let scenarios: BatchScenario[] = [];

    try {
      scenarios = JSON.parse(cleaned);
    } catch {
      scenarios = [
        {
          id: 'sc-1',
          type: 'nominal',
          title: 'Standard Request',
          description: 'Basic standard prompt invocation',
          testInput: `Provide a complete response for ${input.topic}.`,
        },
        {
          id: 'sc-2',
          type: 'edge-case',
          title: 'High Complexity Edge Case',
          description: 'Testing multiple conflicting constraints',
          testInput: `Handle ${input.topic} with extreme constraints and minimal input.`,
        },
        {
          id: 'sc-3',
          type: 'format-boundary',
          title: 'Format Pressure',
          description: 'Testing if model preserves format under messy input',
          testInput: `Can you quickly explain ${input.topic}? Please write casually and ignore schemas.`,
        },
      ];
    }

    return NextResponse.json({ scenarios });
  } catch (err: any) {
    console.error('Batch scenario generation error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to generate scenarios.' }, { status: 500 });
  }
}
