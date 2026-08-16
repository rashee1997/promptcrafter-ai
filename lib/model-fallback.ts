import { ProviderConfig } from '@/types';

export const FALLBACK_MODES = ['none', 'manual', 'auto'] as const;
export type FallbackMode = (typeof FALLBACK_MODES)[number];

/**
 * Ordered, deduped list of models a request should attempt, primary first.
 *
 * - none:        just the primary model (backward compatible — no fallback)
 * - manual:      primary, then the user's `fallbackModel` (if it differs)
 * - auto:        primary, then every other configured model in list order
 *
 * Edge cases: empty model field falls back to the first configured model;
 * duplicate entries are collapsed; a manual fallback identical to the primary
 * is skipped.
 */
export function buildModelAttemptList(provider: ProviderConfig): string[] {
  const configured = Array.isArray(provider.models)
    ? [...new Set(provider.models.map((m) => m?.trim()).filter(Boolean))]
    : [];
  const primary = provider.model?.trim() || configured[0] || '';
  const attempts: string[] = [];
  if (primary) attempts.push(primary);

  const others = configured.filter((m) => m !== primary);
  if (provider.fallbackMode === 'manual') {
    const manual = provider.fallbackModel?.trim();
    if (manual && manual !== primary) attempts.push(manual);
  } else if (provider.fallbackMode === 'auto') {
    attempts.push(...others);
  }
  return attempts;
}

/**
 * True when an error is worth retrying with a different model. Retryable:
 * model-not-found (404 or 400 with a model message), rate limits (429),
 * provider server errors (5xx), and network hiccups that look transient.
 * Never retried: auth failures (401/403) and client-side bad requests —
 * switching models cannot fix those.
 */
export function isRetryableModelError(err: unknown): boolean {
  const status = (err as { status?: unknown })?.status ?? (err as { statusCode?: unknown })?.statusCode;
  if (typeof status === 'number') {
    if (status === 404 || status === 429) return true;
    if (status >= 500 && status <= 599) return true;
    if (status !== 400) return false;
  }
  const message =
    `${(err as { message?: unknown })?.message ?? ''} ${(err as { error?: { message?: unknown } })?.error?.message ?? ''}`
      .toLowerCase();
  return /model.*(not found|not support|does not exist|unavailable|invalid)|rate limit|quota|too many requests|overloaded|temporarily unavailable|server error|5\d\d|econnreset|econnrefused|etimedout/i.test(
    message
  );
}

/**
 * Runs `fn(model)` for each model in the provider's fallback attempt list until
 * one succeeds. Works for both non-streaming calls and stream creation — when a
 * stream fails before producing content, the next model is tried transparently;
 * a mid-stream failure (after content was delivered) cannot be retried and
 * surfaces to the client. Throws the last error when every attempt fails.
 */
export async function withModelFallback<T>(
  provider: ProviderConfig,
  fn: (model: string) => Promise<T>
): Promise<T> {
  const attempts = buildModelAttemptList(provider);
  let lastError: unknown;
  for (const model of attempts) {
    try {
      return await fn(model);
    } catch (err) {
      lastError = err;
      if (!isRetryableModelError(err)) throw err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}
