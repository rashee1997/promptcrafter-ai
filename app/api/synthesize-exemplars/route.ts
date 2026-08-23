import { NextRequest, NextResponse } from 'next/server';
import { FewShotExemplar, PromptInput, ProviderConfig } from '@/types';
import { runNonStreamingCompletion } from '@/lib/server-completion';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SYNTHESIZE_PROVIDER: ProviderConfig = {
  id: 'builtin-gemini-synthesize',
  name: 'Google Gemini (Synthesize)',
  baseUrl: 'https://generativelanguage.googleapis.com',
  apiKey: 'BUILTIN',
  useBuiltInGemini: true,
  model: 'gemini-2.5-flash-lite',
  models: ['gemini-2.5-flash-lite', 'gemini-3.5-flash-lite'],
  fallbackMode: 'auto',
  temperature: 0.7,
  maxTokens: 1000,
};

const SYNTHESIZE_SYSTEM_PROMPT = `You are an expert prompt engineer. Given a prompt goal, domain, and framework, generate 3 high-quality few-shot exemplar input/output pairs that demonstrate ideal edge-case handling, formatting, and high-signal output.

Return ONLY a valid JSON array of objects with this schema:
[
  {
    "id": "ex-1",
    "input": "Sample user query / input",
    "output": "Exact expected high-quality response",
    "explanation": "Why this output exemplifies optimal behavior"
  }
]
Do not wrap in markdown or commentary, output valid JSON only.`;

export async function POST(req: NextRequest) {
  try {
    const body: { input: PromptInput; count?: number } = await req.json();
    const { input } = body;

    if (!input || !input.topic) {
      return NextResponse.json({ error: 'Prompt topic is required.' }, { status: 400 });
    }

    const userPrompt = `Domain: ${input.domainId}\nTopic/Goal: "${input.topic}"\nTone: ${input.tone}\nFramework: ${input.framework}\nTarget Audience: ${input.targetAudience || 'General'}\nAdditional Notes: ${input.additionalNotes || 'None'}\n\nSynthesize 3 realistic few-shot exemplar pairs.`;

    const raw = await runNonStreamingCompletion(
      SYNTHESIZE_PROVIDER,
      [
        { role: 'system', content: SYNTHESIZE_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      { temperature: 0.7 },
    );

    const cleaned = raw.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    let exemplars: FewShotExemplar[] = [];

    try {
      exemplars = JSON.parse(cleaned);
    } catch {
      // Fallback simple exemplar if parsing failed
      exemplars = [
        {
          id: 'ex-1',
          input: `Example input for ${input.topic}`,
          output: `Detailed, production-grade output adhering to ${input.tone} tone and ${input.framework} structure.`,
          explanation: 'Standard nominal case demonstration.',
        },
      ];
    }

    return NextResponse.json({ exemplars });
  } catch (err: any) {
    console.error('Error synthesizing exemplars:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to synthesize exemplars.' },
      { status: 500 },
    );
  }
}
