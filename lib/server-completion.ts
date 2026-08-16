import { GoogleGenAI } from '@google/genai';
import { ProviderConfig } from '@/types';
import { createOpenAIClient } from './openai-provider';
import { withModelFallback } from './model-fallback';

export interface CompletionMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Resolves the provider used to JUDGE an output, which should differ from the
 * model that produced the output so a model can't grade its own work. Prefers
 * the first configured model different from the executor; falls back to the
 * executor when only one model is available.
 */
export function resolveJudgeProvider(provider: ProviderConfig): ProviderConfig {
  const models = Array.isArray(provider.models)
    ? provider.models.map((m) => m?.trim()).filter((m): m is string => !!m)
    : [];
  const unique = [...new Set(models)].filter((m) => m !== provider.model);
  if (unique.length > 0) {
    return { ...provider, model: unique[0], activeModel: unique[0] };
  }
  return provider;
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
        headers: { 'User-Agent': 'promptcrafter-ai/1.1.0' },
      },
    });

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

    return await withModelFallback(provider, async (model) => {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: systemInstruction || undefined,
          temperature: options?.temperature ?? provider?.temperature ?? 0.7,
          maxOutputTokens: options?.maxTokens ?? provider?.maxTokens ?? 3000,
        },
      });
      return response.text || '';
    });
  }

  // OpenAI-compatible provider
  const client = createOpenAIClient(provider);
  return await withModelFallback(provider, async (model) => {
    const completion = await client.chat.completions.create({
      model,
      messages,
      temperature: options?.temperature ?? provider?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? provider?.maxTokens ?? 3000,
      stream: false,
    });
    return completion.choices?.[0]?.message?.content || '';
  });
}
