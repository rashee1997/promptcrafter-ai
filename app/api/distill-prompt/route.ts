import { NextRequest, NextResponse } from 'next/server';
import { ProviderConfig } from '@/types';
import { runNonStreamingCompletion } from '@/lib/server-completion';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DISTILL_SYSTEM_PROMPT = `You are an elite Prompt Compression and Distillation Engine.
Your task is to compress and tighten the provided prompt text into an ultra-lean, highly token-efficient version without losing ANY functionality.

STRICT INVARIANTS (NEVER VIOLATE):
1. NEVER DROP OR WEAKEN A NEGATIVE CONSTRAINT or "what NOT to do" rule.
2. NEVER DROP A REQUIRED SECTION HEADER, OUTPUT SCHEMA, OR DIRECTIVE.
3. NEVER REMOVE VARIABLES ([VAR] or {{var}}).
4. REMOVE REPETITION, passive voice, fluff adjectives, and wordy phrasing.
5. KEEP FORMATTING (Markdown/XML tags/JSON) intact.

Return ONLY the distilled prompt text itself. No intros, no explanations, no markdown wrapper around the entire response unless the prompt itself is markdown.`;

export async function POST(req: NextRequest) {
  try {
    const body: { provider?: ProviderConfig; prompt: string } = await req.json();
    const { provider, prompt } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt content is required.' }, { status: 400 });
    }

    // Use built-in provider or user's active provider
    const distillationProvider: ProviderConfig = provider || {
      id: 'builtin-gemini-distill',
      name: 'Google Gemini (Distill)',
      baseUrl: 'https://generativelanguage.googleapis.com',
      apiKey: 'BUILTIN',
      useBuiltInGemini: true,
      model: 'gemini-2.5-flash',
      models: ['gemini-2.5-flash', 'gemini-3.5-flash'],
      temperature: 0.3,
      maxTokens: 4000,
    };

    const distilledText = await runNonStreamingCompletion(
      distillationProvider,
      [
        { role: 'system', content: DISTILL_SYSTEM_PROMPT },
        { role: 'user', content: `Please distill this prompt while keeping 100% of its constraints and rules:\n\n${prompt}` },
      ],
      { temperature: 0.2 },
    );

    return NextResponse.json({
      distilledPrompt: distilledText.trim(),
    });
  } catch (err: any) {
    console.error('Error distilling prompt:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to distill prompt.' },
      { status: 500 },
    );
  }
}
