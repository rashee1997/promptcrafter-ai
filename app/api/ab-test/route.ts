import { NextRequest, NextResponse } from 'next/server';
import { ABTestRequest, ABTestResult } from '@/types';
import { runNonStreamingCompletion } from '@/lib/server-completion';
import { consistencyScore } from '@/lib/similarity';
import { getModelPrice } from '@/lib/model-pricing';
import { boundedText, MAX_AB_PROVIDERS, MAX_PROMPT_CHARS, validateProvider } from '@/lib/request-validation';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body: ABTestRequest = await req.json();
    const { providers: rawProviders, generatedPrompt: rawPrompt, testInput: rawInput } = body;
    if (!Array.isArray(rawProviders) || rawProviders.length < 2 || rawProviders.length > MAX_AB_PROVIDERS) {
      return NextResponse.json({ error: `Between 2 and ${MAX_AB_PROVIDERS} providers are required.` }, { status: 400 });
    }
    const generatedPrompt = boundedText(rawPrompt, MAX_PROMPT_CHARS, 'Generated prompt');
    const providers = rawProviders.map(validateProvider);
    const userMessage = typeof rawInput === 'string' && rawInput.trim() ? rawInput.trim().slice(0, 40_000) : 'Please execute the prompt with standard parameters.';

    const settled = await Promise.allSettled(
      providers.map(async (provider) => {
        const start = Date.now();
        const output = await runNonStreamingCompletion(
          provider,
          [
            { role: 'system', content: generatedPrompt },
            { role: 'user', content: userMessage },
          ],
          { temperature: Math.min(provider?.temperature ?? 0.7, 0.5) }
        );
        const latencyMs = Date.now() - start;
        // Rough token estimate (chars / 3.8) for cost calculation
        const outputTokens = Math.max(Math.ceil(output.length / 3.8), 0);
        const price = getModelPrice(provider.model || provider.name);
        const estimatedCost = (outputTokens * price.outputPerM) / 1_000_000;
        return { provider, output, latencyMs, outputTokens, estimatedCost };
      })
    );

    const results = settled.map((entry, idx) => {
      const provider = providers[idx];
      if (entry.status === 'fulfilled') {
        return {
          providerId: provider.id,
          providerName: provider.name,
          model: provider.model || provider.name,
          output: entry.value.output,
          latencyMs: entry.value.latencyMs,
          estimatedCost: entry.value.estimatedCost,
          outputTokens: entry.value.outputTokens,
        };
      }
      return {
        providerId: provider.id,
        providerName: provider.name,
        model: provider.model || provider.name,
        output: '',
        error: entry.reason instanceof Error ? entry.reason.message : String(entry.reason),
      };
    });

    const abResult: ABTestResult = {
      results,
      consistency: consistencyScore(results.filter((r) => !r.error && r.output).map((r) => r.output)),
      ranAt: Date.now(),
    };

    return NextResponse.json(abResult);
  } catch (error: any) {
    console.error('API /api/ab-test Error:', error);
    return NextResponse.json({ error: error?.message || 'A/B test failed.' }, { status: 500 });
  }
}
