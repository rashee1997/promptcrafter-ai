import { NextRequest, NextResponse } from 'next/server';
import { LogoVariationRequest, LogoVariationResponse, LogoVariationSuggestion, ImagePromptInput } from '@/types';
import { runNonStreamingCompletion } from '@/lib/server-completion';
import { LOGO_LOCKUP_PRESETS } from '@/lib/logo-prompts';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Internal low-latency assist provider — always the built-in Gemini Flash-Lite
 * family, never the user's configured generation provider. Mirrors
 * SUGGEST_PROVIDER in suggest-examples/route.ts.
 */
const VARIATIONS_PROVIDER = {
  id: 'builtin-gemini-logo-variations',
  name: 'Google Gemini (Logo Variations)',
  baseUrl: 'https://generativelanguage.googleapis.com',
  apiKey: 'BUILTIN', // handled server-side with GEMINI_API_KEY
  useBuiltInGemini: true,
  model: 'gemini-2.5-flash-lite',
  models: ['gemini-2.5-flash-lite', 'gemini-3.5-flash-lite'],
  fallbackMode: 'auto' as const,
  temperature: 0.6,
  maxTokens: 500,
};

const VALID_LOCKUP_IDS = new Set(LOGO_LOCKUP_PRESETS.map((p) => p.id));

const VARIATIONS_SYSTEM_PROMPT = `You are a brand identity designer proposing a lockup/variation set for a logo brief. Choose 3-4 lockup layouts from EXACTLY this list (never invent others): ${LOGO_LOCKUP_PRESETS.map((p) => `"${p.id}" (${p.label}: ${p.hint})`).join(', ')}. For each, give a concrete real-world use case it solves for this specific brand (e.g. "Favicon / app icon", "Email signature", "Social avatar", "Letterhead header") and one sentence of reasoning tied to this brief. Respond with ONLY a JSON object shaped as { "variations": [{ "lockupType": "<id from the list>", "useCase": string, "reasoning": string }, ...] }. No commentary, no markdown fences.`;

/** Compact digest of the brief — only the fields the user actually set. */
function buildBriefDigest(input: ImagePromptInput): string {
  const parts: string[] = [];
  if (input.subject) parts.push(`Subject: ${input.subject}`);
  if (input.brandName) parts.push(`Brand name: ${input.brandName}`);
  if (input.industry) parts.push(`Industry: ${input.industry}`);
  if (input.logoType) parts.push(`Mark type: ${input.logoType}`);
  if (input.concept) parts.push(`Concept: ${input.concept}`);
  if (input.logoStyle) parts.push(`Style: ${input.logoStyle}`);
  return parts.join('; ');
}

/** Reject after ~4s so a stuck call never blocks the field row. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Variation request timed out.')), ms);
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

/** Strip a ```json fence and validate shape. Drops any suggestion whose lockupType isn't a real preset id — never lets the model hallucinate an unrenderable lockup type. */
function parseVariationsResponse(raw: string): LogoVariationSuggestion[] | null {
  const cleaned = raw.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  if (!cleaned) return null;
  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.variations)) return null;

  const seen = new Set<string>();
  const variations: LogoVariationSuggestion[] = [];
  for (const item of parsed.variations) {
    if (!item || typeof item.lockupType !== 'string' || typeof item.useCase !== 'string' || typeof item.reasoning !== 'string') continue;
    if (!VALID_LOCKUP_IDS.has(item.lockupType) || seen.has(item.lockupType)) continue;
    seen.add(item.lockupType);
    variations.push({
      lockupType: item.lockupType,
      useCase: item.useCase.trim(),
      reasoning: item.reasoning.trim(),
    });
  }
  return variations.length > 0 ? variations : null;
}

export async function POST(req: NextRequest) {
  try {
    const body: LogoVariationRequest = await req.json();
    const input = (body.input || {}) as ImagePromptInput;
    const digest = buildBriefDigest(input);

    if (!digest) {
      return NextResponse.json({ variations: null } satisfies LogoVariationResponse);
    }

    let raw = '';
    try {
      raw = await withTimeout(
        runNonStreamingCompletion(
          VARIATIONS_PROVIDER,
          [
            { role: 'system', content: VARIATIONS_SYSTEM_PROMPT },
            { role: 'user', content: `Logo brief:\n${digest}` },
          ],
          { temperature: 0.6, maxTokens: 500 }
        ),
        4000
      );
    } catch (err) {
      console.error('Logo-variations failed:', err);
      return NextResponse.json({ variations: null } satisfies LogoVariationResponse);
    }

    const variations = parseVariationsResponse(raw);
    return NextResponse.json({ variations } satisfies LogoVariationResponse);
  } catch (error: any) {
    console.error('Logo-variations route error:', error);
    return NextResponse.json({ variations: null } satisfies LogoVariationResponse);
  }
}
