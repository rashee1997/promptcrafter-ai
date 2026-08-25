/**
 * Shared assist provider configuration and utilities for AI-driven field suggestions.
 * Used by all AI-assist routes (image-config-assist, product-shoot config-assist, recipe-suggest, etc).
 */

import type { ProviderConfig } from '@/types';

/**
 * Internal low-latency assist provider — always the built-in Gemini Flash-Lite
 * family, never the user's configured generation provider.
 */
export const ASSIST_PROVIDER: ProviderConfig = {
  id: 'builtin-gemini-assist',
  name: 'Google Gemini (Assist)',
  baseUrl: 'https://generativelanguage.googleapis.com',
  apiKey: 'BUILTIN',
  useBuiltInGemini: true,
  model: 'gemini-3.5-flash-lite',
  models: ['gemini-3.5-flash-lite', 'gemini-2.5-flash-lite'],
  fallbackMode: 'auto',
  temperature: 0.5,
  maxTokens: 800,
};

/** Reject after `ms` so a stuck assist call never holds a button. */
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Assist request timed out.')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}
