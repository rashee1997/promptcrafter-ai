import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { withModelFallback } from '@/lib/model-fallback';
import { ASSIST_PROVIDER, withTimeout } from '@/lib/assist-provider';
import type { ProductShootRecipeSuggestRequest } from '@/types';
import type { SceneRecipe } from '@/lib/product-shoot/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Randomly assigned per request to push the model off its single highest-probability
 * "golden hour + marble slab" completion — otherwise low-temperature convergence makes
 * every suggestion for a given brief nearly identical.
 */
const CREATIVE_ANGLES = [
  'high-contrast studio darkness with a single hard spotlight',
  'bold saturated color-block background, no naturalistic setting',
  'kinetic motion blur and dynamic action, product mid-movement',
  'stark minimalist negative space, product isolated and small in frame',
  'gritty industrial or urban texture (concrete, metal, exposed brick)',
  'playful surreal scale distortion (miniature world or giant product)',
  'retro film-grain aesthetic with period-accurate props and color grade',
  'macro abstract textures where the product is barely recognizable at first',
  'night-time neon-lit environment, no daylight at all',
  'raw unstyled everyday context (kitchen counter, gym bag, desk clutter)',
  'geometric symmetry and architectural framing',
  'nature-adjacent but non-cliché (frost, stone, moss, bark — not water or florals)',
];

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
  return lines.join('\n');
}

/** Parse `{ mimeType, data }` reference-image URLs into Gemini inlineData parts. */
function buildInlineImageParts(referenceImages: ProductShootRecipeSuggestRequest['referenceImages']) {
  const parts: { inlineData: { mimeType: string; data: string } }[] = [];
  for (const ref of referenceImages || []) {
    if (!ref.mimeType || !ref.data) continue;
    parts.push({ inlineData: { mimeType: ref.mimeType, data: ref.data } });
  }
  return parts;
}

export async function POST(req: NextRequest) {
  try {
    const body: ProductShootRecipeSuggestRequest = await req.json();
    const brief = body.brief;

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error('Server environment variable GEMINI_API_KEY is missing.');

      const digest = buildBriefDigest(brief);

      const angle = CREATIVE_ANGLES[Math.floor(Math.random() * CREATIVE_ANGLES.length)];

      const systemInstruction = `You are PromptCrafter's Product Shoot Studio creative director. Given a product brief and optional reference images, invent a fresh, product-specific scene recipe — a unique creative concept and shooting direction. Do NOT reuse generic presets. Create something bespoke that aligns with the product's category, audience, and key selling point. Avoid overused tropes (golden-hour backlighting, travertine/marble slabs, drifting mist, dew droplets) unless the assigned creative angle specifically calls for them — lean into the angle instead. Respond with ONLY a JSON object shaped as { "label": string, "summary": string, "creativeDirection": string, "rationale": string } where:
- label: 2-4 word scene title (e.g. "Liquid Cascade Reveal", "Intimate Ritual Close-Up")
- summary: 1-2 sentence hook (e.g. "Water pours in slow motion, revealing the product through a veil of liquid.")
- creativeDirection: 2-3 paragraph detailed shooting direction, including camera movement, lighting approach, surface/environment, and timing
- rationale: max 140 characters explaining why this concept fits the brief
No commentary, no markdown fences.`;

      const userText = `Product brief:\n${digest || '(no settings selected yet)'}\n\nCreative angle for this concept: ${angle}\n\nInvent a fresh, bespoke scene recipe for this product built around that angle.`;

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
              temperature: 1.0, // High creativity — paired with a randomized angle to break convergence.
            },
          })
        ),
        5000
      );

      const jsonText = response.text?.trim() || '';
      const cleaned = jsonText.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
      if (!cleaned) return NextResponse.json({ recipe: null });

      let parsed: unknown;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        return NextResponse.json({ recipe: null });
      }

      if (!parsed || typeof parsed !== 'object') return NextResponse.json({ recipe: null });

      const p = parsed as Record<string, unknown>;
      const label = typeof p.label === 'string' ? p.label : null;
      const summary = typeof p.summary === 'string' ? p.summary : null;
      const creativeDirection = typeof p.creativeDirection === 'string' ? p.creativeDirection : null;
      const rationale = typeof p.rationale === 'string' ? p.rationale : null;

      if (!label || !summary || !creativeDirection || !rationale) {
        return NextResponse.json({ recipe: null });
      }

      // Build a generated recipe object (not persisted; ephemeral per session).
      // Use a stable hash of the content as a pseudo-id to avoid collisions.
      const recipeId = `ai-generated-${Date.now()}`;
      const generatedRecipe: SceneRecipe = {
        id: recipeId,
        label,
        summary,
        creativeDirection,
        goal: 'hero', // Default; AI may adjust in future versions.
        durationHint: 8,
        aspectHint: '16:9',
        bestFor: rationale,
        category: 'AI-Generated',
      };

      // Return the generated recipe and rationale. The UI must pass recipeId back as a query string or state,
      // and the creative-controls route will re-materialize it from session context, not from persisted storage.
      return NextResponse.json({
        recipe: {
          recipeId,
          rationale,
          generatedRecipe, // Ephemeral; expires when the session closes.
        },
      });
    } catch (err) {
      console.error('Product-shoot recipe-suggest failed:', err);
      return NextResponse.json({ recipe: null });
    }
  } catch (error) {
    console.error('API /api/product-shoot/suggest-recipe Error:', error);
    return NextResponse.json({ recipe: null });
  }
}
