import { NextRequest, NextResponse } from 'next/server';
import { LogoCritiqueRequest, LogoCritiqueResponse, LogoPrincipleScore, ImagePromptInput } from '@/types';
import { runNonStreamingCompletion } from '@/lib/server-completion';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Internal low-latency assist provider — always the built-in Gemini Flash-Lite
 * family, never the user's configured generation provider. Mirrors
 * SUGGEST_PROVIDER in suggest-examples/route.ts.
 */
const CRITIQUE_PROVIDER = {
  id: 'builtin-gemini-logo-critique',
  name: 'Google Gemini (Logo Critique)',
  baseUrl: 'https://generativelanguage.googleapis.com',
  apiKey: 'BUILTIN', // handled server-side with GEMINI_API_KEY
  useBuiltInGemini: true,
  model: 'gemini-2.5-flash-lite',
  models: ['gemini-2.5-flash-lite', 'gemini-3.5-flash-lite'],
  fallbackMode: 'auto' as const,
  temperature: 0.4,
  maxTokens: 700,
};

const PRINCIPLE_KEYS: LogoPrincipleScore['principle'][] = [
  'simplicity',
  'memorability',
  'versatility',
  'appropriateness',
  'distinctiveness',
  'timelessness',
  'colorDiscipline',
];

/**
 * Grounds the model in the same seven design principles documented atop
 * lib/logo-prompts.ts — single source of truth for principle definitions,
 * not redefined structurally there since that file only carries them as a
 * doc comment.
 */
const CRITIQUE_SYSTEM_PROMPT = `You are a senior brand identity designer critiquing a logo brief before it goes to generation. Score the brief against these seven design principles, each 0-100:
- simplicity: can it be recognized and reproduced at a glance, without excess detail?
- memorability: does it have one distinctive, ownable feature worth remembering?
- versatility: will it still work as a 16px favicon, one-color print, and a billboard?
- appropriateness: does it fit the stated industry and audience without being generic?
- distinctiveness: does it avoid category clichés (globes, swooshes, chat bubbles, gradient spheres, stock leaves/coffee cups, generic sparkles)?
- timelessness: does it lean on an enduring concept rather than a fleeting trend?
- colorDiscipline: does the palette use 3 or fewer intentional colors?
Respond with ONLY a JSON object shaped as { "principles": [{ "principle": "<key>", "score": number, "feedback": "<one to two sentence actionable note>" }, ...] covering exactly these seven keys, "topRecommendation": "<single highest-leverage fix, one sentence>" }. No commentary, no markdown fences.`;

/** Compact digest of the brief — only the fields the user actually set. Mirrors buildBriefDigest in image-config-assist/route.ts. */
function buildBriefDigest(input: ImagePromptInput): string {
  const parts: string[] = [];
  if (input.subject) parts.push(`Subject: ${input.subject}`);
  if (input.brandName) parts.push(`Brand name: ${input.brandName}`);
  if (input.industry) parts.push(`Industry: ${input.industry}`);
  if (input.logoType) parts.push(`Mark type: ${input.logoType}`);
  if (input.concept) parts.push(`Concept: ${input.concept}`);
  if (input.logoStyle) parts.push(`Style: ${input.logoStyle}`);
  if (input.palette) parts.push(`Color palette: ${input.palette}`);
  if (input.typography) parts.push(`Typography: ${input.typography}`);
  if (input.lockup) parts.push(`Lockup: ${input.lockup}`);
  return parts.join('; ');
}

/** Reject after ~4s so a stuck critique call never blocks the panel. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Critique request timed out.')), ms);
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

/** Strip a ```json fence and validate shape; unparseable/malformed output returns null so the client renders nothing. */
function parseCritiqueResponse(raw: string): LogoCritiqueResponse | null {
  const cleaned = raw.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  if (!cleaned) return null;
  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.principles)) return null;

  const principles: LogoPrincipleScore[] = [];
  for (const key of PRINCIPLE_KEYS) {
    const found = parsed.principles.find((p: any) => p && p.principle === key);
    if (!found || typeof found.score !== 'number' || typeof found.feedback !== 'string') continue;
    principles.push({
      principle: key,
      score: Math.max(0, Math.min(100, Math.round(found.score))),
      feedback: found.feedback.trim(),
    });
  }
  if (principles.length === 0) return null;

  const overallScore = Math.round(principles.reduce((sum, p) => sum + p.score, 0) / principles.length);
  const topRecommendation = typeof parsed.topRecommendation === 'string' ? parsed.topRecommendation.trim() : '';

  return { overallScore, principles, topRecommendation };
}

export async function POST(req: NextRequest) {
  try {
    const body: LogoCritiqueRequest = await req.json();
    const input = (body.input || {}) as ImagePromptInput;
    const digest = buildBriefDigest(input);

    if (!digest) {
      return NextResponse.json({ overallScore: null, principles: [], topRecommendation: '' } satisfies LogoCritiqueResponse);
    }

    let raw = '';
    try {
      raw = await withTimeout(
        runNonStreamingCompletion(
          CRITIQUE_PROVIDER,
          [
            { role: 'system', content: CRITIQUE_SYSTEM_PROMPT },
            { role: 'user', content: `Logo brief:\n${digest}` },
          ],
          { temperature: 0.4, maxTokens: 700 }
        ),
        4000
      );
    } catch (err) {
      console.error('Logo-critique failed:', err);
      return NextResponse.json({ overallScore: null, principles: [], topRecommendation: '' } satisfies LogoCritiqueResponse);
    }

    const result = parseCritiqueResponse(raw);
    return NextResponse.json(result ?? ({ overallScore: null, principles: [], topRecommendation: '' } satisfies LogoCritiqueResponse));
  } catch (error: any) {
    console.error('Logo-critique route error:', error);
    return NextResponse.json({ overallScore: null, principles: [], topRecommendation: '' } satisfies LogoCritiqueResponse);
  }
}
