import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { withModelFallback } from '@/lib/model-fallback';
import { ASSIST_PROVIDER, withTimeout } from '@/lib/assist-provider';
import {
  CAMERA_MOTION_PRESETS,
  FOCAL_LENGTH_PRESETS,
  LIGHTING_PRESETS,
  SURFACE_PRESETS,
  PHYSICS_FX_PRESETS,
  MOTION_PACE_PRESETS,
  HUMAN_INTERACTION_PRESETS,
  getRecipeById,
  SURPRISE_RECIPE_ID,
} from '@/lib/product-shoot';
import type { ProductShootConfigAssistRequest } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** Field keys that the assist endpoint will fill, in this order. */
const FIELD_DOMAIN = [
  'cameraMotion',
  'focalLength',
  'lightingStyle',
  'surfaceMaterial',
  'physicsFX',
  'motionPace',
  'humanInteraction',
] as const;

/** Map field key → allowed preset ids for validation. */
const ALLOWED_IDS: Record<string, Record<string, true>> = {
  cameraMotion: Object.fromEntries(CAMERA_MOTION_PRESETS.map((p) => [p.id, true])),
  focalLength: Object.fromEntries(FOCAL_LENGTH_PRESETS.map((p) => [p.id, true])),
  lightingStyle: Object.fromEntries(LIGHTING_PRESETS.map((p) => [p.id, true])),
  surfaceMaterial: Object.fromEntries(SURFACE_PRESETS.map((p) => [p.id, true])),
  physicsFX: Object.fromEntries(PHYSICS_FX_PRESETS.map((p) => [p.id, true])),
  motionPace: Object.fromEntries(MOTION_PACE_PRESETS.map((p) => [p.id, true])),
  humanInteraction: Object.fromEntries(HUMAN_INTERACTION_PRESETS.map((p) => [p.id, true])),
};

/** Compact digest of the brief — only the fields the user actually set. */
function buildBriefDigest(brief: unknown): string {
  const b = brief && typeof brief === 'object' ? (brief as Record<string, unknown>) : {};
  const lines: string[] = [];
  if (typeof b.name === 'string' && b.name.trim()) lines.push(`Name: ${b.name}`);
  if (typeof b.category === 'string' && b.category.trim()) lines.push(`Category: ${b.category}`);
  if (typeof b.description === 'string' && b.description.trim()) lines.push(`Description: ${b.description}`);
  if (typeof b.sellingPoint === 'string' && b.sellingPoint.trim()) lines.push(`Key selling point: ${b.sellingPoint}`);
  if (typeof b.targetAudience === 'string' && b.targetAudience.trim()) lines.push(`Target audience: ${b.targetAudience}`);
  if (typeof b.keyFeatures === 'string' && b.keyFeatures.trim()) lines.push(`Key features: ${b.keyFeatures}`);

  // Add recipe context if present.
  const recipeId = typeof b.recipeId === 'string' ? b.recipeId : null;
  if (recipeId) {
    if (recipeId === SURPRISE_RECIPE_ID) {
      lines.push(`Scene recipe: Director's Choice`);
    } else {
      const recipe = getRecipeById(recipeId);
      if (recipe) {
        lines.push(`Scene recipe: ${recipe.label} — ${recipe.summary}`);
      }
    }
  }

  return lines.join('\n');
}

/** Parse `{ mimeType, data }` reference-image URLs into Gemini inlineData parts. */
function buildInlineImageParts(referenceImages: ProductShootConfigAssistRequest['referenceImages']) {
  const parts: { inlineData: { mimeType: string; data: string } }[] = [];
  for (const ref of referenceImages || []) {
    if (!ref.mimeType || !ref.data) continue;
    parts.push({ inlineData: { mimeType: ref.mimeType, data: ref.data } });
  }
  return parts;
}

/** Strip a ```json fence if the model wraps its output despite responseMimeType. */
function parseFieldsResponse(raw: string, fieldKeys: readonly string[]): Record<string, { value: string; label: string }[]> | null {
  const cleaned = raw.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  if (!cleaned) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object') return null;
  const fields: Record<string, { value: string; label: string }[]> = {};
  for (const key of fieldKeys) {
    const options = (parsed as Record<string, unknown>)[key];
    if (!Array.isArray(options)) continue;
    const allowed = ALLOWED_IDS[key];
    const cleanOptions = (options as unknown[])
      .filter((o): o is { value: string; label: string } =>
        Boolean(o) && typeof o === 'object' && typeof (o as Record<string, unknown>).value === 'string' &&
        typeof (o as Record<string, unknown>).label === 'string' &&
        Boolean(allowed) && (o as Record<string, unknown>).value as string in allowed
      )
      .map((o) => ({ value: o.value, label: o.label }));
    if (cleanOptions.length > 0) fields[key] = cleanOptions;
  }
  return Object.keys(fields).length > 0 ? fields : null;
}

export async function POST(req: NextRequest) {
  try {
    const body: ProductShootConfigAssistRequest = await req.json();
    const brief = body.brief;

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error('Server environment variable GEMINI_API_KEY is missing.');

      const digest = buildBriefDigest(brief);
      const fieldList = FIELD_DOMAIN.join(', ');
      const allowedIdsPerField = FIELD_DOMAIN.map((field) => {
        const ids = Object.keys(ALLOWED_IDS[field] || {}).sort();
        return `${field}: ${ids.join(' | ')}`;
      }).join('\n');

      const systemInstruction = `You are PromptCrafter's Product Shoot Studio art-direction assistant. Given this product brief and reference images, choose the 3 best options for EACH field. You MUST pick values only from the allowed id list given for that field — never invent an id. Respond with ONLY a JSON object shaped as { "<fieldKey>": [{ "value": "<allowed id>", "label": "<short human label>" }, ...] } covering exactly these keys: ${fieldList}. No commentary, no markdown fences.`;
      const userText = `Product brief:\n${digest || '(no settings selected yet)'}\n\nAllowed preset ids per field:\n${allowedIdsPerField}\n\nPropose 3 best options for each field.`;

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
        5000
      );

      const jsonText = response.text?.trim() || '';
      const fields = parseFieldsResponse(jsonText, FIELD_DOMAIN);
      return NextResponse.json({ fields });
    } catch (err) {
      console.error('Product-shoot config-assist failed, falling back to manual:', err);
      return NextResponse.json({ fields: null });
    }
  } catch (error) {
    console.error('API /api/product-shoot/config-assist Error:', error);
    // Never a 500 — this is a nice-to-have assist, not a critical path.
    return NextResponse.json({ fields: null });
  }
}
