import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { buildImagePromptSystemPrompt, buildImagePromptUserMessage } from '@/lib/image-prompts';
import { buildLogoPromptSystemPrompt, buildLogoPromptUserMessage } from '@/lib/logo-prompts';
import { handleOpenAIProviderRequest, formatOpenAIError } from '@/lib/openai-provider';
import { withModelFallback } from '@/lib/model-fallback';
import { GEMINI_DEFAULT_MODEL } from '@/lib/storage';
import { ImagePromptGenerationRequest } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const STREAM_HEADERS = {
  'Content-Type': 'text/plain; charset=utf-8',
  'Cache-Control': 'no-cache, no-transform',
  'X-Accel-Buffering': 'no',
  'Connection': 'keep-alive',
};

/**
 * Streams an image-ready prompt set: a universal full-anatomy master prompt
 * plus a tuned prompt per requested platform dialect (Midjourney, DALL·E,
 * SD/Flux, Ideogram, Gemini / Nano Banana). When the input is in logo mode,
 * a brand-identity brief (mark type, style, palette, wordmark) is used
 * instead. No web research — the model writes directly from its knowledge
 * and the USER BRIEF.
 */
export async function POST(req: NextRequest) {
  try {
    const body: ImagePromptGenerationRequest = await req.json();
    const { provider, input } = body;

    if (!input || !input.subject?.trim()) {
      return NextResponse.json({ error: 'Subject is required.' }, { status: 400 });
    }

    const isLogo = input.mode === 'logo';
    const systemInstruction = isLogo
      ? buildLogoPromptSystemPrompt(input)
      : buildImagePromptSystemPrompt(input);
    const userMessage = isLogo
      ? buildLogoPromptUserMessage(input)
      : buildImagePromptUserMessage(input);

    // Build multimodal content if reference images are attached
    const hasRefImages = !!input.referenceImages && input.referenceImages.length > 0;
    const refImageParts = hasRefImages
      ? input.referenceImages!.map((img) => {
          // Extract MIME type and base64 data from data URL
          const match = img.dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
          if (!match) return null;
          return {
            inlineData: {
              mimeType: match[1],
              data: match[2],
            },
          };
        }).filter((p): p is { inlineData: { mimeType: string; data: string } } => p !== null)
      : [];

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
        httpOptions: {
          headers: {
            'User-Agent': 'promptcrafter-ai/1.1.0',
          },
        },
      });

      const modelName = provider?.model || GEMINI_DEFAULT_MODEL;

      // When reference images are present, pass them as inline parts so
      // Gemini can see the references while writing platform-specific prompts.
      const multimodalContents = refImageParts.length > 0
        ? [{ role: 'user' as const, parts: [{ text: userMessage }, ...refImageParts] }]
        : userMessage;

      const responseStream = await withModelFallback(
        { ...provider, model: modelName },
        (model) =>
          ai.models.generateContentStream({
            model,
            contents: multimodalContents,
            config: {
              systemInstruction,
              temperature: provider?.temperature ?? 0.7,
              topP: provider?.topP ?? 0.95,
            },
          })
      );

      const encoder = new TextEncoder();
      const customStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of responseStream) {
              const text = chunk.text || '';
              if (text) {
                controller.enqueue(encoder.encode(text));
              }
            }
            controller.close();
          } catch (streamErr) {
            controller.error(streamErr);
          }
        },
      });

      return new Response(customStream, { headers: STREAM_HEADERS });
    }

    // Custom OpenAI-compatible provider.
    return await handleOpenAIProviderRequest(provider, [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: userMessage },
    ]);
  } catch (error: any) {
    console.error('API /api/image-prompt Error:', error);
    return formatOpenAIError(error);
  }
}
