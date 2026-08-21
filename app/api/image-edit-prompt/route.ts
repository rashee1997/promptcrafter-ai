import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { handleOpenAIProviderRequest, formatOpenAIError } from '@/lib/openai-provider';
import { withModelFallback } from '@/lib/model-fallback';
import { GEMINI_DEFAULT_MODEL } from '@/lib/storage';
import { ImageEditRequest } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Image Edit Mode ("Edit, don't re-roll"):
 * Emits a targeted conversational edit instruction and delta prompt rather than
 * forcing full re-generation. Tuned for Gemini Nano Banana 2 ("Edit..."),
 * GPT Image 2 conversational instructions, and Midjourney vary/inpainting syntax.
 */
export async function POST(req: NextRequest) {
  try {
    const body: ImageEditRequest = await req.json();
    const { provider, basePrompt, editInstruction, platform, mode = 'image' } = body;

    if (!basePrompt?.trim() || !editInstruction?.trim()) {
      return NextResponse.json({ error: 'Base prompt and edit instruction are required.' }, { status: 400 });
    }

    const systemInstruction = `You are PromptCrafter's Image Edit Specialist.
The official prompting guidance from Google (Nano Banana), OpenAI (GPT Image 2), and Midjourney is: "EDIT, DON'T RE-ROLL".

When a user has an image that is 80% right and needs a specific adjustment:
1. Produce an updated whole prompt ('editedPrompt') with the modification cleanly incorporated.
2. Produce a targeted conversational instruction ('conversationalInstruction') suitable for iterative conversational image models (e.g. Gemini Nano Banana: "Change the background lighting to sunset while keeping the subject identical", or Midjourney /vary region mask instruction).
3. Produce a 1-line delta summary ('deltaSummary').

Return ONLY a valid JSON object:
{
  "editedPrompt": string,
  "conversationalInstruction": string,
  "deltaSummary": string
}`;

    const userMessage = `BASE PROMPT:\n${basePrompt}\n\nUSER EDIT INSTRUCTION:\n"${editInstruction}"\n\nTARGET PLATFORM: ${platform ?? 'Universal'}\nSTUDIO MODE: ${mode}\n\nGenerate the structured edit delta.`;

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
            contents: userMessage,
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              temperature: 0.3,
            },
          })
      );

      const jsonText = response.text?.trim() || '{}';
      return NextResponse.json(JSON.parse(jsonText));
    }

    const clientResponse = await handleOpenAIProviderRequest(provider, [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: userMessage },
    ]);

    const rawText = await clientResponse.text();
    const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    return NextResponse.json(JSON.parse(cleanJson));
  } catch (error: any) {
    console.error('API /api/image-edit-prompt Error:', error);
    return formatOpenAIError(error);
  }
}
