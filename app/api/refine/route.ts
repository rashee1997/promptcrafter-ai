import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { buildMetaSystemPrompt, DOMAIN_PRESETS } from '@/lib/domains';
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
            'User-Agent': 'aistudio-build',
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

      const responseStream = await chat.sendMessageStream(userRefineInstruction);

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
    const baseUrl = provider.baseUrl.replace(/\/+$/, '');
    const endpoint = baseUrl.endsWith('/chat/completions') ? baseUrl : `${baseUrl}/chat/completions`;

    const customHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (provider.apiKey && provider.apiKey !== 'BUILTIN') {
      customHeaders['Authorization'] = `Bearer ${provider.apiKey}`;
    }

    const messages = [
      { role: 'system', content: systemInstruction },
      ...(priorMessages || []),
      { role: 'user', content: userRefineInstruction },
    ];

    const providerRes = await fetch(endpoint, {
      method: 'POST',
      headers: customHeaders,
      body: JSON.stringify({
        model: provider.model || 'gpt-4o-mini',
        messages,
        temperature: provider.temperature ?? 0.7,
        max_tokens: provider.maxTokens ?? 3000,
        stream: true,
      }),
    });

    if (!providerRes.ok) {
      const errorText = await providerRes.text();
      return NextResponse.json(
        { error: `Provider error (${providerRes.status}): ${errorText.slice(0, 300)}` },
        { status: providerRes.status }
      );
    }

    if (!providerRes.body) {
      return NextResponse.json({ error: 'Provider returned an empty response body.' }, { status: 500 });
    }

    const encoder = new TextEncoder();
    const reader = providerRes.body.getReader();
    const decoder = new TextDecoder();

    const transformStream = new ReadableStream({
      async start(controller) {
        let buffer = '';
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || trimmed.startsWith(':')) continue;
              if (trimmed === 'data: [DONE]') continue;

              if (trimmed.startsWith('data: ')) {
                try {
                  const json = JSON.parse(trimmed.slice(6));
                  const textChunk = json.choices?.[0]?.delta?.content || json.choices?.[0]?.text || '';
                  if (textChunk) {
                    controller.enqueue(encoder.encode(textChunk));
                  }
                } catch {
                  // Ignore JSON parse errors on partial lines
                }
              } else {
                controller.enqueue(encoder.encode(line + '\n'));
              }
            }
          }

          if (buffer.trim() && !buffer.includes('[DONE]')) {
            if (buffer.startsWith('data: ')) {
              try {
                const json = JSON.parse(buffer.slice(6));
                const textChunk = json.choices?.[0]?.delta?.content || '';
                if (textChunk) controller.enqueue(encoder.encode(textChunk));
              } catch {
                // Ignore
              }
            } else {
              controller.enqueue(encoder.encode(buffer));
            }
          }

          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(transformStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('API /api/refine Error:', error);
    return NextResponse.json({ error: error?.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
