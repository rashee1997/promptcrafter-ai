import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { buildImagePromptSystemPrompt, buildImagePromptUserMessage } from '@/lib/image-prompts';
import { handleOpenAIProviderRequest, formatOpenAIError } from '@/lib/openai-provider';
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
 * SD/Flux, Ideogram, Gemini / Nano Banana). No web research — the model
 * writes directly from its knowledge and the USER BRIEF.
 */
export async function POST(req: NextRequest) {
  try {
    const body: ImagePromptGenerationRequest = await req.json();
    const { provider, input } = body;

    if (!input || !input.subject?.trim()) {
      return NextResponse.json({ error: 'Subject is required.' }, { status: 400 });
    }

    const systemInstruction = buildImagePromptSystemPrompt(input);
    const userMessage = buildImagePromptUserMessage(input);

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

      const modelName = provider?.model || 'gemini-3.6-flash';

      const responseStream = await ai.models.generateContentStream({
        model: modelName,
        contents: userMessage,
        config: {
          systemInstruction,
          temperature: provider?.temperature ?? 0.7,
          topP: provider?.topP ?? 0.95,
        },
      });

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
