import { NextRequest, NextResponse } from 'next/server';
import { ABTestRequest, ABTestResult } from '@/types';
import { runNonStreamingCompletion } from '@/lib/server-completion';
import { consistencyScore } from '@/lib/similarity';
import { getModelPrice } from '@/lib/model-pricing';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body: ABTestRequest = await req.json();
    const { providers, generatedPrompt, testInput } = body;

    if (!Array.isArray(providers) || providers.length === 0) {
      return NextResponse.json({ error: 'At least one provider is required.' }, { status: 400 });
    }
    if (!generatedPrompt || !generatedPrompt.trim()) {
      return NextResponse.json({ error: 'Generated prompt is required.' }, { status: 400 });
    }

    const userMessage = testInput?.trim() || 'Please execute the prompt with standard parameters.';

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
      consistency: consistencyScore(results.map((r) => r.output)),
      ranAt: Date.now(),
    };

    return NextResponse.json(abResult);
  } catch (error: any) {
    console.error('API /api/ab-test Error:', error);
    return NextResponse.json({ error: error?.message || 'A/B test failed.' }, { status: 500 });
  }
}
