import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { buildMetaSystemPrompt, DOMAIN_PRESETS } from '@/lib/domains';
import { handleOpenAIProviderRequest, formatOpenAIError } from '@/lib/openai-provider';
import { RefineRequest } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body: RefineRequest = await req.json();
    const { provider, session, priorMessages, instruction } = body;

    if (!instruction || !instruction.trim()) {
      return NextResponse.json({ error: 'Refinement instruction is required.' }, { status: 400 });
    }

    if (!session || !session.originalInput) {
      return NextResponse.json({ error: 'Session metadata is required.' }, { status: 400 });
    }

    const domain = DOMAIN_PRESETS.find((d) => d.id === session.domainId) || DOMAIN_PRESETS[0];
    const systemInstruction = buildMetaSystemPrompt(session.originalInput, domain);

    const userRefineInstruction = `Refine the previous prompt with this instruction: "${instruction}". Return ONLY the full revised prompt — do not include commentary, diffs, or explanations of what changed.`;

    const isGemini =
      provider?.useBuiltInGemini ||
      !provider?.baseUrl ||
      provider?.baseUrl.includes('googleapis.com');

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

      // Map prior messages for Gemini chat history
      const mappedHistory = (priorMessages || []).map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      const chat = ai.chats.create({
        model: modelName,
        history: mappedHistory,
        config: {
          systemInstruction,
          temperature: provider?.temperature ?? 0.7,
          topP: provider?.topP ?? 0.95,
        },
      });

      const responseStream = await chat.sendMessageStream({ message: userRefineInstruction });

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
    const messages = [
      { role: 'system' as const, content: systemInstruction },
      ...(priorMessages || []).map((m) => ({
        role: (m.role === 'assistant' ? 'assistant' : m.role === 'system' ? 'system' : 'user') as 'assistant' | 'system' | 'user',
        content: m.content,
      })),
      { role: 'user' as const, content: userRefineInstruction },
    ];

    return await handleOpenAIProviderRequest(provider, messages);
  } catch (error: any) {
    console.error('API /api/refine Error:', error);
    return formatOpenAIError(error);
  }
}
