// Video Prompt Studio — AI vision analysis of uploaded character reference images.
// Server-safe: sends the image to a vision-capable model (Gemini default) and
// returns structured appearance data that can auto-fill VideoCharacter fields.
//
// Runs on upload in character-reference-panel.tsx and as a pre-pass for
// text-only drafting models (C5 routing).

import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';
import type { CharacterImageAnalysis } from '@/types/video';
import { GEMINI_DEFAULT_MODEL } from '@/lib/storage';

/** Schema for structured vision analysis output. */
const analysisSchema = z.object({
  appearance: z
    .string()
    .describe('Concise appearance summary: age range, build, face shape, skin tone. 1–2 sentences max.'),
  build: z
    .string()
    .describe('Build details: height impression, body type, proportions. Short phrase.'),
  hairDetail: z
    .string()
    .describe('Hair detail: color, length, style, texture. One sentence.'),
  distinguishingFeatures: z
    .string()
    .describe('Distinguishing features: scars, tattoos, glasses, jewelry, facial hair, notable marks. Comma-separated or one sentence.'),
  apparentWardrobe: z
    .string()
    .describe('Wardrobe visible in the reference image: garments, colors, accessories. One sentence.'),
  imageQualityNote: z
    .string()
    .optional()
    .describe('Optional quality note: is the image well-lit, clear, front-facing? Any issues?'),
});

/**
 * Splits a data URL into mimeType and base64 payload.
 * Returns null for non-data-URL inputs.
 */
function splitDataUrl(dataUrl: string): { mimeType: string; base64: string } | null {
  const comma = dataUrl.indexOf(',');
  const header = comma > -1 ? dataUrl.slice(0, comma) : '';
  const payload = comma > -1 ? dataUrl.slice(comma + 1) : '';
  const match = /^data:([^;,]+);base64$/i.exec(header);
  if (!match || !payload) return null;
  return { mimeType: match[1], base64: payload };
}

/**
 * Converts a Blob (e.g. compressed WebP from IndexedDB) into a data URL.
 * Server-safe: only called when imageDataUrl is missing.
 */
function blobToDataUrlServer(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('Could not read blob.'));
    reader.readAsDataURL(blob);
  });
}

const ANALYSIS_SYSTEM = `You are a visual analyst for a video production. Given a character reference image, extract structured appearance data. Be precise and concise. Focus on what a shot-drafting AI needs to maintain identity consistency across clips:
- Face structure and skin
- Body build
- Hair
- Distinctive marks or accessories
- Clothing visible in the image
- Image quality assessment

Never invent details not visible in the image. If something is unclear, say so.`;

/**
 * Analyzes a character reference image and returns structured appearance data.
 *
 * @param imageDataUrl - Data URL (base64) of the character image.
 * @param characterName - Name of the character for context.
 * @param existingAppearance - Optional existing appearance text for context.
 * @returns Structured analysis result.
 */
export async function analyzeCharacterImage(
  imageDataUrl: string,
  characterName: string,
  existingAppearance?: string,
): Promise<CharacterImageAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Character image analysis requires a vision model, but the server GEMINI_API_KEY is missing.',
    );
  }

  const parsed = splitDataUrl(imageDataUrl);
  if (!parsed) {
    throw new Error('Invalid image data URL — expected a base64 data URL.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = [
    `Analyze this character reference image for "${characterName}".`,
    existingAppearance
      ? `Existing appearance notes for context (verify or correct): "${existingAppearance}"`
      : '',
    'Extract the structured appearance data.',
  ]
    .filter(Boolean)
    .join('\n');

  const response = await ai.models.generateContent({
    model: GEMINI_DEFAULT_MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: parsed.mimeType,
              data: parsed.base64,
            },
          },
        ],
      },
    ],
    config: {
      systemInstruction: ANALYSIS_SYSTEM,
      temperature: 0.3,
      maxOutputTokens: 800,
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'object',
        properties: {
          appearance: { type: 'string' },
          build: { type: 'string' },
          hairDetail: { type: 'string' },
          distinguishingFeatures: { type: 'string' },
          apparentWardrobe: { type: 'string' },
          imageQualityNote: { type: 'string' },
        },
        required: ['appearance', 'build', 'hairDetail', 'distinguishingFeatures', 'apparentWardrobe'],
      },
    },
  });

  const text = response.text?.trim();
  if (!text) {
    throw new Error('Vision analysis returned no data.');
  }

  let parsed2: unknown;
  try {
    parsed2 = JSON.parse(text);
  } catch {
    throw new Error('Vision analysis returned unparseable JSON.');
  }

  const result = analysisSchema.safeParse(parsed2);
  if (!result.success) {
    throw new Error(`Vision analysis returned invalid shape: ${result.error.message}`);
  }

  return result.data;
}

/**
 * Builds a text digest of a character analysis for injection into
 * text-only model prompts. This is the fallback when the drafting model
 * cannot process images directly (C5 routing).
 */
export function buildAnalysisDigest(
  analysis: CharacterImageAnalysis,
  characterName: string,
  imageNumber?: number,
): string {
  const ref = imageNumber != null ? ` (reference image ${imageNumber})` : '';
  const lines = [
    `[VISUAL ANALYSIS — ${characterName}${ref}]`,
    `Appearance: ${analysis.appearance}`,
    `Build: ${analysis.build}`,
    `Hair: ${analysis.hairDetail}`,
    `Distinguishing features: ${analysis.distinguishingFeatures}`,
    `Wardrobe in reference: ${analysis.apparentWardrobe}`,
  ];
  if (analysis.imageQualityNote) {
    lines.push(`Image quality: ${analysis.imageQualityNote}`);
  }
  return lines.join('\n');
}
