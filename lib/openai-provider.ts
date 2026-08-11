import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { ProviderConfig } from '@/types';

/**
 * Normalizes user-provided Base URL:
 * Removes trailing slashes and automatically strips endpoint paths like /chat/completions
 * if the user accidentally pasted a full endpoint URL rather than the API base address.
 */
export function normalizeBaseUrl(url: string): string {
  if (!url) return 'https://api.openai.com/v1';
  let cleaned = url.trim().replace(/\/+$/, '');
  // Strip trailing /chat/completions or /chat/completions/
  cleaned = cleaned.replace(/\/chat\/completions\/?$/i, '');
  cleaned = cleaned.replace(/\/+$/, '');
  return cleaned;
}

/**
 * Constructs a fresh OpenAI client instance per request with provider configuration.
 * Provides an inert placeholder key if key is blank (e.g. for local self-hosted models like Ollama/LM Studio).
 */
export function createOpenAIClient(provider: ProviderConfig): OpenAI {
  const baseURL = normalizeBaseUrl(provider.baseUrl);
  const apiKey =
    provider.apiKey && provider.apiKey.trim() !== '' && provider.apiKey !== 'BUILTIN'
      ? provider.apiKey.trim()
      : 'no-key-required';

  return new OpenAI({
    baseURL,
    apiKey,
  });
}

/**
 * Executes a chat completion request using the official OpenAI client SDK.
 * Respects `provider.disableStreaming`. Returns a standard Web Response stream or text response.
 */
export async function handleOpenAIProviderRequest(
  provider: ProviderConfig,
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  overrideOptions?: { temperature?: number; maxTokens?: number }
): Promise<Response> {
  const client = createOpenAIClient(provider);
  const model = provider.model || 'gpt-4o-mini';
  const temperature = overrideOptions?.temperature ?? provider.temperature ?? 0.7;
  const max_tokens = overrideOptions?.maxTokens ?? provider.maxTokens ?? 3000;

  if (provider.disableStreaming) {
    // Single complete non-streamed request
    const completion = await client.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens,
      stream: false,
    });

    const content = completion.choices?.[0]?.message?.content || '';
    return new Response(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  }

  // Streamed request using Official OpenAI client stream interface
  const stream = await client.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens,
    stream: true,
  });

  const encoder = new TextEncoder();
  const customStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices?.[0]?.delta?.content || '';
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
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

/**
 * Formats errors from OpenAI SDK (APIError, RateLimitError, AuthenticationError, ConnectionError, etc.)
 * into NextResponse JSON with real status codes and exact error messages.
 */
export function formatOpenAIError(error: any): NextResponse {
  if (error instanceof OpenAI.APIError) {
    const status = error.status || 500;
    const message = error.message || 'OpenAI API error occurred.';
    return NextResponse.json({ error: message }, { status });
  }

  const status = typeof error?.status === 'number' ? error.status : 500;
  const message = error?.message || 'An unexpected error occurred.';
  return NextResponse.json({ error: message }, { status: typeof status === 'number' ? status : 500 });
}
