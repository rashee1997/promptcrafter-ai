import { NextRequest, NextResponse } from 'next/server';
import { ImagePromptInput, ProviderConfig, SuggestNegativePromptRequest } from '@/types';
import { runNonStreamingCompletion } from '@/lib/server-completion';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Internal low-latency assist provider — always the built-in Gemini Flash-Lite
 * family (gemini-2.5-flash-lite with a gemini-3.x-flash-lite fallback), never
 * the user's configured generation provider. See PRICING_TABLE in
 * lib/model-pricing.ts for the matching model tiers.
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
  temperature: 0.4,
  maxTokens: 200,
};

const SUGGEST_SYSTEM_PROMPT = `You are a negative-prompt specialist for image generation. Given this image/logo brief, suggest a single comma-separated negative-prompt line (things to AVOID) that is SPECIFIC to these settings — not generic boilerplate. E.g. a photorealistic style should exclude "illustration, cartoon, flat vector"; a flat-vector logo should exclude "photorealistic shading, gradients, drop shadows, clip art"; a lettermark should exclude "literal pictorial icons". Keep it under 25 words, comma-separated tokens only, no full sentences, no leading label like "Negative prompt:". Respond with ONLY the negative-prompt line, no commentary.`;

/** Compact digest of the brief — only the fields the user actually set. */
function buildBriefDigest(input: ImagePromptInput, mode: 'image' | 'logo'): string {
  const parts: string[] = [];
  const style = mode === 'logo' ? input.logoStyle : input.style;
  if (style) parts.push(`Style: ${style}`);
  if (input.lighting) parts.push(`Lighting: ${input.lighting}`);
  if (input.mood) parts.push(`Mood: ${input.mood}`);
  if (input.camera) parts.push(`Camera: ${input.camera}`);
  if (input.colorGrade) parts.push(`Color grade: ${input.colorGrade}`);
  if (input.resolution) parts.push(`Resolution: ${input.resolution}`);
  if (input.industry) parts.push(`Industry: ${input.industry}`);
  if (input.logoType) parts.push(`Mark type: ${input.logoType}`);
  if (input.concept) parts.push(`Concept: ${input.concept}`);
  if (input.palette) parts.push(`Color palette: ${input.palette}`);
  if (input.usage && input.usage.length > 0) parts.push(`Usage: ${input.usage.join(', ')}`);
  if (input.shapeLanguage) parts.push(`Shape language: ${input.shapeLanguage}`);
  if (input.typography) parts.push(`Typography: ${input.typography}`);
  if (input.inImageText) parts.push(`In-image text: ${input.inImageText}`);
  return parts.join('; ');
}

/** Reject after ~4s so a stuck assist call never holds the button. */
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

/** Strip leading labels ("Negative prompt:" / "Suggest:") and surrounding quotes. */
function cleanSuggestion(raw: string): string | null {
  const cleaned = raw
    .trim()
    .replace(/^```(?:text)?/i, '')
    .replace(/```$/, '')
    .replace(/^["'“”]|["'“”]$/g, '')
    .replace(/^(negative\s*prompt\s*[:—-]\s*|suggest(?:ion)?\s*[:—-]\s*)/i, '')
    .trim();
  return cleaned || null;
}

export async function POST(req: NextRequest) {
  try {
    const body: SuggestNegativePromptRequest = await req.json();
    const mode = body.mode === 'logo' ? 'logo' : 'image';
    const input = (body.input || {}) as ImagePromptInput;

    const digest = buildBriefDigest(input, mode);
    const userMessage = `Mode: ${mode}\nBrief:\n${digest || '(no settings selected yet)'}\n\nSuggest one comma-separated negative-prompt line for this brief:`;

    try {
      const raw = await withTimeout(
        runNonStreamingCompletion(
          SUGGEST_PROVIDER,
          [
            { role: 'system', content: SUGGEST_SYSTEM_PROMPT },
            { role: 'user', content: userMessage },
          ],
          { temperature: 0.4, maxTokens: 200 }
        ),
        4000
      );
      return NextResponse.json({ suggestion: cleanSuggestion(raw) });
    } catch (err) {
      console.error('Suggest-negative-prompt assist failed, hiding suggestion:', err);
      return NextResponse.json({ suggestion: null });
    }
  } catch (error: any) {
    console.error('API /api/suggest-negative-prompt Error:', error);
    // Never a 500 — this is a nice-to-have assist, not a critical path.
    return NextResponse.json({ suggestion: null });
  }
}
