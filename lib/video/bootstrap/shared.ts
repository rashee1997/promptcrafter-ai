// Video Prompt Studio — Phase 3 shared structured-generation helper.
// Thin wrapper over the Vercel AI SDK `generateObject()` so every bootstrap
// stage resolves the same way: model from resolveVideoModel(), low
// temperature, Zod schema, typed object out.

import { generateObject } from 'ai';
import type { FlexibleSchema } from 'ai';
import type { ProviderConfig } from '@/types';
import { resolveVideoModel } from '@/lib/video-ai';

/** Stable unique id for model-drafted proposals (Node 18+ / modern browsers). */
export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

interface RunStructuredArgs<T> {
  provider: ProviderConfig;
  schema: FlexibleSchema<T>;
  system: string;
  prompt: string;
  /** Structured drafting should stay close to the brief. */
  temperature?: number;
}

/**
 * Runs one structured generation pass. The AI SDK handles both native
 * response-schema mode (Gemini `responseSchema`) and the prompt-and-parse
 * fallback (JSON wrapped in markdown fences), so stage handlers stay small.
 */
export async function runStructured<T>({
  provider,
  schema,
  system,
  prompt,
  temperature = 0.6,
}: RunStructuredArgs<T>): Promise<T> {
  const model = resolveVideoModel(provider);
  const { object } = await generateObject({
    model,
    schema,
    system,
    prompt,
    temperature,
  });
  return object;
}

/** Truncates context so long story-bible fields never bloat a prompt. */
export function clip(text: string | null | undefined, max = 1200): string {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}
