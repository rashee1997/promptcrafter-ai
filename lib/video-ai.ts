import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import type { LanguageModel } from 'ai';
import type { ProviderConfig } from '@/types';
import { GEMINI_DEFAULT_MODEL } from './storage';
import { normalizeBaseUrl } from './openai-provider';

/**
 * True when a provider config routes through Google's Gemini API (the built-in
 * server default, or a custom config pointed at googleapis.com). Mirrors the
 * `isGemini` check used by the existing /api/generate and /api/refine routes.
 */
export function isGeminiProvider(provider: ProviderConfig): boolean {
  return (
    provider.useBuiltInGemini === true ||
    !provider.baseUrl ||
    provider.baseUrl.includes('googleapis.com')
  );
}

/**
 * Resolves the model id to use for a provider: persisted selection first, then
 * `activeModel`, then `model`, then the first entry of `models`, then the
 * server default. Mirrors lib/storage.ts `getProviderActiveModel` precedence.
 */
export function resolveModelId(provider: ProviderConfig): string {
  return (
    provider.activeModel?.trim() ||
    provider.model?.trim() ||
    provider.models?.[0]?.trim() ||
    GEMINI_DEFAULT_MODEL
  );
}

/**
 * Resolves a ProviderConfig to an AI SDK LanguageModel so Video Prompt Studio
 * routes can stream through either the built-in Gemini default (server key) or
 * any custom OpenAI-compatible provider configured in Settings (user key).
 */
export function resolveVideoModel(provider: ProviderConfig): LanguageModel {
  if (isGeminiProvider(provider)) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Server environment variable GEMINI_API_KEY is missing.');
    }
    const gemini = createGoogleGenerativeAI({ apiKey });
    return gemini.languageModel(resolveModelId(provider));
  }

  const baseURL = normalizeBaseUrl(provider.baseUrl);
  const apiKey =
    provider.apiKey &&
    provider.apiKey.trim() !== '' &&
    provider.apiKey !== 'BUILTIN'
      ? provider.apiKey.trim()
      : undefined;

  const compatible = createOpenAICompatible({
    name: provider.id,
    baseURL,
    ...(apiKey ? { apiKey } : {}),
  });
  return compatible.chatModel(resolveModelId(provider));
}
