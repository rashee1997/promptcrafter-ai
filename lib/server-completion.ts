import { GoogleGenAI } from '@google/genai';
import { ProviderConfig } from '@/types';
import { createOpenAIClient } from './openai-provider';

export interface CompletionMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Runs a single non-streaming completion against either the built-in Gemini
 * provider or any OpenAI-compatible provider. Used by the evaluate / ab-test /
 * evaluate-output routes where a full response (not a stream) is required.
 */
export async function runNonStreamingCompletion(
  provider: ProviderConfig,
  messages: CompletionMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const isGemini =
    provider?.useBuiltInGemini ||
    !provider?.baseUrl ||
    provider?.baseUrl.includes('googleapis.com');

  if (isGemini) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Server environment variable GEMINI_API_KEY is missing.');
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { 'User-Agent': 'promptcrafter-ai/1.0.1' },
      },
    });

    const modelName = provider?.model || 'gemini-3.6-flash';
    const systemInstruction = messages
      .filter((m) => m.role === 'system')
      .map((m) => m.content)
      .join('\n\n');

    const contents = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction: systemInstruction || undefined,
        temperature: options?.temperature ?? provider?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens ?? provider?.maxTokens ?? 3000,
      },
    });

    return response.text || '';
  }

  // OpenAI-compatible provider
  const client = createOpenAIClient(provider);
  const completion = await client.chat.completions.create({
    model: provider.model || 'gpt-4o-mini',
    messages,
    temperature: options?.temperature ?? provider?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? provider?.maxTokens ?? 3000,
    stream: false,
  });

  return completion.choices?.[0]?.message?.content || '';
}
