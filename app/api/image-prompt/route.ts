import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { buildImageResearchSystemPrompt, buildImageResearchUserMessage } from '@/lib/image-prompts';
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
 * Streams a Gemini generation with Google Search grounding (deep web research).
 * If the model/API rejects the googleSearch tool before any text was emitted,
 * the request transparently retries without grounding so the Image Studio
 * always produces output even for models without search support.
 */
async function streamGeminiResearch(
  ai: GoogleGenAI,
  modelName: string,
  contents: string,
  systemInstruction: string,
  temperature: number,
  topP: number,
  useGrounding: boolean
): Promise<Response> {
  const encoder = new TextEncoder();

  const buildStream = (grounding: boolean) =>
    ai.models.generateContentStream({
      model: modelName,
      contents,
      config: {
        systemInstruction,
        temperature,
        topP,
        ...(grounding ? { tools: [{ googleSearch: {} }] } : {}),
      },
    });

  return new Response(
    new ReadableStream({
      async start(controller) {
        let grounding = useGrounding;
        let emitted = false;
        let attempt = 0;

        while (attempt < 2) {
          attempt += 1;
          try {
            const responseStream = await buildStream(grounding);
            for await (const chunk of responseStream) {
              const text = chunk.text || '';
              if (text) {
                emitted = true;
                controller.enqueue(encoder.encode(text));
              }
            }
            controller.close();
            return;
          } catch (streamErr) {
            // Grounding rejected before any output? Retry without the search tool.
            if (grounding && !emitted) {
              grounding = false;
              continue;
            }
            controller.error(streamErr);
            return;
          }
        }
        controller.close();
      },
    }),
    { headers: STREAM_HEADERS }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body: ImagePromptGenerationRequest = await req.json();
    const { provider, input } = body;

    if (!input || !input.subject?.trim()) {
      return NextResponse.json({ error: 'Subject is required.' }, { status: 400 });
    }

    const systemInstruction = buildImageResearchSystemPrompt(input);
    const userMessage = buildImageResearchUserMessage(input);

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

      return await streamGeminiResearch(
        ai,
        modelName,
        userMessage,
        systemInstruction,
        provider?.temperature ?? 0.7,
        provider?.topP ?? 0.95,
        input.deepResearch
      );
    }

    // Custom OpenAI-compatible provider — no live web search; the system
    // prompt instructs the model to run its knowledge-based research pass.
    return await handleOpenAIProviderRequest(provider, [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: userMessage },
    ]);
  } catch (error: any) {
    console.error('API /api/image-prompt Error:', error);
    return formatOpenAIError(error);
  }
}
