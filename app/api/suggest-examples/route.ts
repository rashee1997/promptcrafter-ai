import { NextRequest, NextResponse } from 'next/server';
import { ImagePromptInput, PromptInput, ProviderConfig, SuggestExamplesRequest } from '@/types';
import { runNonStreamingCompletion } from '@/lib/server-completion';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Internal low-latency assist provider — ALWAYS the built-in Gemini Flash-Lite
 * family, never the user's configured generation provider. Primary model is
 * gemini-2.5-flash-lite with a gemini-3.x-flash-lite fallback (same tier order
 * as PRICING_TABLE in lib/model-pricing.ts) so a model rename never breaks the
 * suggestion chips.
 */
const SUGGEST_PROVIDER: ProviderConfig = {
  id: 'builtin-gemini-suggest',
  name: 'Google Gemini (Suggest)',
  baseUrl: 'https://generativelanguage.googleapis.com',
  apiKey: 'BUILTIN', // handled server-side with GEMINI_API_KEY
  useBuiltInGemini: true,
  model: 'gemini-2.5-flash-lite',
  models: ['gemini-2.5-flash-lite', 'gemini-3.5-flash-lite'],
  fallbackMode: 'auto',
  temperature: 0.9,
  maxTokens: 300,
};

const SUGGEST_SYSTEM_PROMPT = `You are an example-topic curator for PromptCrafter's prompt studio. Given the module and the user's current settings, suggest N short, concrete, varied example prompts (subjects/topics) that a user could click to fill the main input. Each must be a single line, 6-18 words, no numbering, no quotes, no markdown. They must make sense with the settings already chosen (e.g. if industry=coffee-shop and mark-type=lettermark, the logo examples should be coffee-brand lettermark subjects, not random other industries). If no settings are selected yet, return generically strong examples for the module/domain like a curated static list would. Respond with ONLY the examples, one per line, no commentary.`;

/** Compact digest of whatever the user has already picked — empty fields are skipped, never padded. */
function buildContextDigest(body: SuggestExamplesRequest): string {
  const parts: string[] = [];
  if (body.module === 'text') {
    const input = (body.currentInput || {}) as Partial<PromptInput>;
    if (body.domainName) parts.push(`Domain: ${body.domainName}`);
    if (input.tone) parts.push(`Tone: ${input.tone}`);
    if (input.framework) parts.push(`Framework: ${input.framework}`);
    if (input.targetAudience) parts.push(`Target audience: ${input.targetAudience}`);
  } else {
    const input = (body.currentInput || {}) as Partial<ImagePromptInput>;
    const style = body.module === 'logo' ? input.logoStyle : input.style;
    if (style) parts.push(`Style: ${style}`);
    if (input.lighting) parts.push(`Lighting: ${input.lighting}`);
    if (input.mood) parts.push(`Mood: ${input.mood}`);
    if (input.camera) parts.push(`Camera: ${input.camera}`);
    if (input.colorGrade) parts.push(`Color grade: ${input.colorGrade}`);
    if (input.palette) parts.push(`Color palette: ${input.palette}`);
    if (input.industry) parts.push(`Industry: ${input.industry}`);
    if (input.logoType) parts.push(`Mark type: ${input.logoType}`);
    if (input.concept) parts.push(`Concept: ${input.concept}`);
    if (input.aspectRatio) parts.push(`Aspect ratio: ${input.aspectRatio}`);
    if (input.platforms && input.platforms.length > 0) parts.push(`Platforms: ${input.platforms.join(', ')}`);
  }
  return parts.join('; ');
}

/** Reject after ~4s so a slow suggest call never blocks the chip row. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Suggestion request timed out.')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

/** Accept a JSON array OR newline-separated lines (stripping bullets/numbers/quotes). */
function parseExamples(raw: string, count: number): string[] {
  const trimmed = raw.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  let items: string[] = [];
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) items = parsed.map(String);
  } catch {
    // not JSON — split lines below
  }
  if (items.length === 0) {
    items = trimmed
      .split('\n')
      .map((line) => line.replace(/^[-*•\d.\s)\]]+\s*/, '').trim())
      .filter(Boolean);
  }
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const clean = item.replace(/^["']|["']$/g, '').trim();
    if (!clean || seen.has(clean)) continue;
    seen.add(clean);
    out.push(clean);
    if (out.length >= count) break;
  }
  return out;
}

export async function POST(req: NextRequest) {
  try {
    const body: SuggestExamplesRequest = await req.json();
    const mode = body.module || 'text';
    const count = Math.min(8, Math.max(1, body.count ?? 4));

    const digest = buildContextDigest(body);
    const userMessage = `Module: ${mode}${digest ? `\nCurrent settings: ${digest}` : ''}\n\nSuggest ${count} example topics:`;

    let raw = '';
    try {
      raw = await withTimeout(
        runNonStreamingCompletion(
          SUGGEST_PROVIDER,
          [
            { role: 'system', content: SUGGEST_SYSTEM_PROMPT },
            { role: 'user', content: userMessage },
          ],
          { temperature: 0.9, maxTokens: 300 }
        ),
        4000
      );
    } catch (err) {
      console.error('Suggest-examples assist failed, keeping static fallback:', err);
      return NextResponse.json({ examples: [], fallback: true });
    }

    const examples = parseExamples(raw, count);
    return NextResponse.json({ examples, fallback: examples.length === 0 });
  } catch (error: any) {
    console.error('API /api/suggest-examples Error:', error);
    // Never a 500 that blocks the UI — the client always has its static array.
    return NextResponse.json({ examples: [], fallback: true });
  }
}
