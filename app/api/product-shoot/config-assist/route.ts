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

/** Fisher-Yates shuffle — randomizes preset id order so the model isn't nudged toward whichever id happens to be listed first. */
function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
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
    // Accept either a known preset id or a short freeform creative phrase the
    // model invented for this product — ChipSelector/system-prompt already
    // fall back to rendering/using the raw value when it isn't a preset id,
    // the same path manual custom chip entries take.
    const cleanOptions = (options as unknown[])
      .filter((o): o is { value: string; label: string } =>
        Boolean(o) && typeof o === 'object' &&
        typeof (o as Record<string, unknown>).value === 'string' &&
        typeof (o as Record<string, unknown>).label === 'string' &&
        ((o as Record<string, unknown>).value as string).trim().length > 0 &&
        ((o as Record<string, unknown>).value as string).length <= 120
      )
      .map((o) => ({ value: o.value.trim(), label: o.label.trim() }));
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
        const ids = shuffle(Object.keys(ALLOWED_IDS[field] || {}));
        return `${field}: ${ids.join(' | ')}`;
      }).join('\n');

      const systemInstruction = `You are PromptCrafter's Product Shoot Studio art-direction assistant. Given this product brief and reference images, propose 3 options for EACH field.

At least 2 of the 3 options per field must be bespoke ideas you invent specifically for THIS product — read its category, description, selling point, and audience, and let those drive the choice (e.g. a supplement's physics/FX or surface should reflect its ingredients or use-case, not a generic template). Do not default to overused tropes (water splashes, marble slabs, flower petals, sand) unless the product itself genuinely calls for them. A bespoke option's "value" is a short freeform descriptive phrase (under 12 words, same concrete/sensory style as a cinematography keyword) — never invent an id string for it.

At most 1 of the 3 options per field may instead reuse one of the platform's built-in presets — its "value" MUST then be exactly one of the allowed ids listed below for that field, never invented.

Respond with ONLY a JSON object shaped as { "<fieldKey>": [{ "value": "<bespoke phrase OR allowed id>", "label": "<short human label>" }, ...] } covering exactly these keys: ${fieldList}. No commentary, no markdown fences.`;
      const userText = `Product brief:\n${digest || '(no settings selected yet)'}\n\nBuilt-in preset ids available per field (use sparingly — prefer bespoke ideas tailored to this product):\n${allowedIdsPerField}\n\nPropose 3 options for each field, mostly bespoke to this exact product.`;

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
              temperature: 0.9,
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
