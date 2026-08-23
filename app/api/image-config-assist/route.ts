import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { withModelFallback } from '@/lib/model-fallback';
import { ImageConfigAssistRequest, ImagePromptInput, ProviderConfig } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Internal low-latency assist provider — always the built-in Gemini Flash-Lite
 * family, never the user's configured generation provider. Mirrors
 * SUGGEST_PROVIDER in suggest-negative-prompt/route.ts.
 */
const ASSIST_PROVIDER: ProviderConfig = {
  id: 'builtin-gemini-config-assist',
  name: 'Google Gemini (Config Assist)',
  baseUrl: 'https://generativelanguage.googleapis.com',
  apiKey: 'BUILTIN', // handled server-side with GEMINI_API_KEY
  useBuiltInGemini: true,
  model: 'gemini-3.5-flash-lite',
  models: ['gemini-3.5-flash-lite', 'gemini-2.5-flash-lite'],
  fallbackMode: 'auto',
  temperature: 0.5,
  maxTokens: 800,
};

/** Field keys requested from/returned by the model, per mode + section. Never includes 'style'. */
const FIELD_DOMAIN: Record<'refine' | 'artDirection', Record<'image' | 'logo', string[]>> = {
  refine: {
    image: ['platforms'],
    logo: ['industry', 'logoType', 'concept', 'palette', 'platforms'],
  },
  artDirection: {
    image: ['lighting', 'mood', 'composition', 'camera', 'colorGrade', 'resolution'],
    logo: ['shapeLanguage', 'typography', 'lockup', 'hiddenMeaning', 'usage', 'boldness', 'mood', 'resolution'],
  },
};

/** Reject after ~4s so a stuck assist call never holds the button. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Config assist request timed out.')), ms);
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

/** Compact digest of the brief — only the fields the user actually set. Mirrors buildBriefDigest in suggest-negative-prompt/route.ts. */
function buildBriefDigest(input: ImagePromptInput, mode: 'image' | 'logo'): string {
  const parts: string[] = [];
  if (input.subject) parts.push(`Subject: ${input.subject}`);
  const style = mode === 'logo' ? input.logoStyle : input.style;
  if (style) parts.push(`Style: ${style}`);
  if (input.lighting) parts.push(`Lighting: ${input.lighting}`);
  if (input.mood) parts.push(`Mood: ${input.mood}`);
  if (input.composition) parts.push(`Composition: ${input.composition}`);
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
  if (input.brandName) parts.push(`Brand name: ${input.brandName}`);
  if (input.inImageText) parts.push(`In-image text: ${input.inImageText}`);
  if (input.purpose) parts.push(`Purpose: ${input.purpose}`);
  return parts.join('; ');
}

/** Parse `data:image/xyz;base64,...` reference-image URLs into Gemini inlineData parts. */
function buildInlineImageParts(referenceImages: ImageConfigAssistRequest['referenceImages']) {
  const parts: { inlineData: { mimeType: string; data: string } }[] = [];
  for (const ref of referenceImages || []) {
    const match = ref.dataUrl?.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) continue;
    parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
  }
  return parts;
}

/** Strip a ```json fence if the model wraps its output despite responseMimeType. */
function parseFieldsResponse(raw: string, fieldKeys: string[]): Record<string, { value: string; label: string }[]> | null {
  const cleaned = raw.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  if (!cleaned) return null;
  const parsed = JSON.parse(cleaned);
  if (!parsed || typeof parsed !== 'object') return null;
  const fields: Record<string, { value: string; label: string }[]> = {};
  for (const key of fieldKeys) {
    const options = parsed[key];
    if (!Array.isArray(options)) continue;
    const cleanOptions = options
      .filter((o) => o && typeof o.value === 'string' && typeof o.label === 'string')
      .map((o) => ({ value: o.value, label: o.label }));
    if (cleanOptions.length > 0) fields[key] = cleanOptions;
  }
  return Object.keys(fields).length > 0 ? fields : null;
}

export async function POST(req: NextRequest) {
  try {
    const body: ImageConfigAssistRequest = await req.json();
    const mode = body.mode === 'logo' ? 'logo' : 'image';
    const section = body.section === 'artDirection' ? 'artDirection' : 'refine';
    const input = (body.input || {}) as ImagePromptInput;
    const fieldKeys = FIELD_DOMAIN[section][mode];

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error('Server environment variable GEMINI_API_KEY is missing.');

      const digest = buildBriefDigest(input, mode);
      const systemInstruction = `You are PromptCrafter's Image Prompt Studio config assistant. Given this ${mode} brief, propose 3-5 editable option chips for EACH of these fields: ${fieldKeys.join(', ')}. Each option needs a short "value" (preset id / raw setting string) and a human-readable "label". Options must be specific to the brief, not generic boilerplate. Respond with ONLY a JSON object shaped as { "<fieldKey>": [{ "value": string, "label": string }, ...], ... } covering exactly these keys: ${fieldKeys.join(', ')}. No commentary, no markdown fences.`;
      const userText = `Mode: ${mode}\nSection: ${section}\nBrief:\n${digest || '(no settings selected yet)'}\n\nPropose option chips for: ${fieldKeys.join(', ')}`;

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'promptcrafter-ai/1.1.0' } },
      });

      const inlineParts = buildInlineImageParts(body.referenceImages);

      const response = await withTimeout(
        withModelFallback(ASSIST_PROVIDER, (model) =>
          ai.models.generateContent({
            model,
            contents: [
              {
                role: 'user',
                parts: [{ text: userText }, ...inlineParts],
              },
            ],
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              temperature: 0.5,
            },
          })
        ),
        4000
      );

      const jsonText = response.text?.trim() || '';
      const fields = parseFieldsResponse(jsonText, fieldKeys);
      return NextResponse.json({ fields });
    } catch (err) {
      console.error('Image-config-assist failed, falling back to static presets:', err);
      return NextResponse.json({ fields: null });
    }
  } catch (error: any) {
    console.error('API /api/image-config-assist Error:', error);
    // Never a 500 — this is a nice-to-have assist, not a critical path.
    return NextResponse.json({ fields: null });
  }
}
