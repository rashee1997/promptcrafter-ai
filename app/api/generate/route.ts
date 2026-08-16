import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { buildMetaSystemPrompt, buildUserPromptMessage, DOMAIN_PRESETS } from '@/lib/domains';
import { handleOpenAIProviderRequest, formatOpenAIError } from '@/lib/openai-provider';
import { GEMINI_DEFAULT_MODEL } from '@/lib/storage';
import { GenerationRequest } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body: GenerationRequest = await req.json();
    const { provider, input } = body;

    if (!input || !input.topic) {
      return NextResponse.json({ error: 'Topic is required.' }, { status: 400 });
    }

    const domain = DOMAIN_PRESETS.find((d) => d.id === input.domainId) || DOMAIN_PRESETS[0];
    const systemInstruction = buildMetaSystemPrompt(input, domain);
    const userMessage = buildUserPromptMessage(input, domain);

    // Case 1: Built-in Gemini Provider or Gemini specified
    const isGemini = provider?.useBuiltInGemini || !provider?.baseUrl || provider?.baseUrl.includes('googleapis.com');

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

      return new Response(customStream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          'X-Accel-Buffering': 'no',
          'Connection': 'keep-alive',
        },
      });
    }

    // Case 2: Custom OpenAI-compatible provider (OpenAI, Groq, OpenRouter, Ollama, etc.)
    return await handleOpenAIProviderRequest(provider, [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: userMessage },
    ]);
  } catch (error: any) {
    console.error('API /api/generate Error:', error);
    return formatOpenAIError(error);
  }
}
