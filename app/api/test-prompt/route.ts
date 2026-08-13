import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { handleOpenAIProviderRequest, formatOpenAIError } from '@/lib/openai-provider';
import { TestPromptRequest } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body: TestPromptRequest = await req.json();
    const { provider, generatedPrompt, testInput } = body;

    if (!generatedPrompt) {
      return NextResponse.json({ error: 'Generated prompt is missing.' }, { status: 400 });
    }

    const systemInstruction = generatedPrompt;
    const userMessage = testInput || 'Please execute the prompt with standard parameters.';

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

      const responseStream = await ai.models.generateContentStream({
        model: provider?.model || 'gemini-3.6-flash',
        contents: userMessage,
        config: {
          systemInstruction,
          temperature: provider?.temperature ?? 0.7,
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

    // Custom OpenAI-compatible provider
    return await handleOpenAIProviderRequest(provider, [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: userMessage },
    ]);
  } catch (error: any) {
    console.error('API /api/test-prompt Error:', error);
    return formatOpenAIError(error);
  }
}
