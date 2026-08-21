import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { handleOpenAIProviderRequest, formatOpenAIError } from '@/lib/openai-provider';
import { withModelFallback } from '@/lib/model-fallback';
import { GEMINI_DEFAULT_MODEL } from '@/lib/storage';
import { ImageToPromptRequest } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Image-to-Prompt (Reverse Engineering) endpoint:
 * Takes an image uploaded by the user, runs a deep multimodal analysis
 * across all visual dimensions (subject, style idiom, lighting, camera/lens,
 * composition, mood, color palette, in-image text), and returns a structured
 * JSON brief + master prompt ready to populate the studio form.
 */
export async function POST(req: NextRequest) {
  try {
    const body: ImageToPromptRequest = await req.json();
    const { provider, image, mode = 'image' } = body;

    if (!image?.dataUrl) {
      return NextResponse.json({ error: 'Image data is required.' }, { status: 400 });
    }

    const match = image.dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json({ error: 'Invalid base64 image data URL.' }, { status: 400 });
    }
    const mimeType = match[1];
    const base64Data = match[2];

    const isLogo = mode === 'logo';

    const systemInstruction = `You are PromptCrafter's Image Reverse Engineering Specialist.
Analyze the provided image and extract its complete visual anatomy into a structured JSON response.

${isLogo ? `LOGO MODE EXTRACTION RULES:
Extract:
- brandName: any brand name or wordmark text visible in the image, or empty string.
- subject: exact description of the ownable logo symbol, concept, and what it represents.
- logoType: one of 'wordmark' | 'lettermark' | 'pictorial' | 'abstract' | 'emblem' | 'combination'.
- style: one of 'minimalist' | 'geometric' | 'flat-vector' | 'line-art' | 'negative-space' | 'vintage-badge' | 'retro' | 'mascot' | '3d'.
- palette: one of 'monochrome' | 'duotone' | 'pastel' | 'neon' | 'earthy' | 'luxury-gold' | 'navy-silver' | 'ocean' | 'sunset'.
- shapeLanguage: one of 'circles' | 'squares' | 'triangles' | 'organic' | 'golden-ratio' | 'sharp-polygons'.
- summary: 1-2 sentence executive summary of the brand mark design.` : `IMAGE MODE EXTRACTION RULES:
Extract:
- subject: exact concrete description of the main subject and action (avoid vague adjectives).
- style: one of 'photorealistic' | 'cinematic' | 'editorial' | 'anime' | '3d-render' | 'minimalist' | 'cyberpunk' | 'fantasy' | 'watercolor' | 'isometric' | 'pixel-art' | 'product-photography' | 'noir'.
- lighting: lighting direction, quality, and source (e.g. 'golden-hour', 'studio', 'chiaroscuro', 'neon', 'overcast', 'moonlight', 'rim-light', 'volumetric').
- camera: camera feel or focal length (e.g. '35mm', '85mm', 'wide-angle', 'macro', 'anamorphic', 'medium-format', 'drone').
- composition: framing and perspective (e.g. 'close-up', 'wide-shot', 'low-angle', 'aerial', 'eye-level', 'portrait', 'rule-of-thirds', 'symmetry', 'leading-lines').
- mood: one honest atmosphere word (e.g. 'serene', 'epic', 'melancholic', 'mysterious', 'dramatic', 'dreamy', 'cozy', 'awe').
- colorGrade: color grading or film stock (e.g. 'kodak-portra', 'cinestill', 'teal-orange', 'monochrome', 'muted', 'vibrant', 'pastel').
- aspectRatio: estimated aspect ratio (e.g. '1:1', '16:9', '9:16', '4:3', '3:2').
- inImageText: any exact text visible inside the image.
- summary: 1-2 sentence creative director summary of the image.`}

Return ONLY a valid JSON object adhering to this schema:
{
  "extractedBrief": {
    "subject": string,
    "style": string,
    "lighting": string,
    "camera": string,
    "composition": string,
    "mood": string,
    "colorGrade": string,
    "aspectRatio": string,
    "palette": string,
    "inImageText": string,
    "summary": string
  },
  "suggestedPrompt": string
}`;

    const isGemini =
      provider?.useBuiltInGemini || !provider?.baseUrl || provider?.baseUrl.includes('googleapis.com');

    if (isGemini) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: 'Server environment variable GEMINI_API_KEY is missing.' },
          { status: 500 }
        );
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'promptcrafter-ai/1.1.0' } },
      });

      const modelName = provider?.model || GEMINI_DEFAULT_MODEL;

      const response = await withModelFallback(
        { ...provider, model: modelName },
        (model) =>
          ai.models.generateContent({
            model,
            contents: [
              {
                role: 'user',
                parts: [
                  { text: 'Deconstruct this image into its prompt anatomy components and return the JSON object.' },
                  { inlineData: { mimeType, data: base64Data } },
                ],
              },
            ],
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          })
      );

      const jsonText = response.text?.trim() || '{}';
      const parsed = JSON.parse(jsonText);
      return NextResponse.json(parsed);
    }

    // OpenAI provider fallback
    const clientResponse = await handleOpenAIProviderRequest(provider, [
      { role: 'system', content: systemInstruction },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Deconstruct this image into its prompt anatomy components and return the JSON object.' },
          { type: 'image_url', image_url: { url: image.dataUrl, detail: 'high' } },
        ],
      },
    ]);

    const rawText = await clientResponse.text();
    // Extract JSON if wrapped in markdown code fence
    const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    return NextResponse.json(JSON.parse(cleanJson));
  } catch (error: any) {
    console.error('API /api/image-to-prompt Error:', error);
    return formatOpenAIError(error);
  }
}
