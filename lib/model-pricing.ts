/**
 * Local model-pricing estimates used by the Cost-Per-Quality Ledger.
 *
 * Prices are approximate published list prices (USD per 1M tokens) for common
 * model families, used ONLY for on-device estimation. Nothing here is fetched
 * from a network — the ledger is computed entirely in the browser.
 */

export interface ModelPrice {
  inputPerM: number; // USD per 1M input tokens
  outputPerM: number; // USD per 1M output tokens
  /** false when the model name was not recognized and a generic mid-range estimate was used. */
  known: boolean;
}

interface PriceEntry {
  match: RegExp;
  inputPerM: number;
  outputPerM: number;
}

// Order matters: more specific patterns must come first.
const PRICING_TABLE: PriceEntry[] = [
  { match: /gpt-4o-mini/i, inputPerM: 0.15, outputPerM: 0.6 },
  { match: /gpt-4\.1-mini/i, inputPerM: 0.4, outputPerM: 1.6 },
  { match: /gpt-4\.1-nano/i, inputPerM: 0.1, outputPerM: 0.4 },
  { match: /gpt-4\.1/i, inputPerM: 2.0, outputPerM: 8.0 },
  { match: /gpt-4o/i, inputPerM: 2.5, outputPerM: 10.0 },
  { match: /o3-mini/i, inputPerM: 1.1, outputPerM: 4.4 },
  { match: /gpt-4/i, inputPerM: 2.5, outputPerM: 10.0 },
  // Gemini family — specific entries first, generic /gemini/i catch-all last.
  { match: /gemini-2\.5-pro/i, inputPerM: 1.25, outputPerM: 10.0 },
  { match: /gemini-2\.5-flash-lite/i, inputPerM: 0.1, outputPerM: 0.4 },
  { match: /gemini-2\.5-flash/i, inputPerM: 0.3, outputPerM: 2.5 },
  { match: /gemini-3\.1-pro/i, inputPerM: 1.25, outputPerM: 10.0 },
  { match: /gemini-3\.(5|6|7)-flash-lite|gemini-3\.1-flash-lite/i, inputPerM: 0.2, outputPerM: 0.6 },
  { match: /gemini-3-flash-preview|gemini-3\.(5|6|7)-flash/i, inputPerM: 0.5, outputPerM: 3.0 },
  { match: /gemini/i, inputPerM: 0.35, outputPerM: 1.75 },
  { match: /claude-3-5-haiku/i, inputPerM: 0.8, outputPerM: 4.0 },
  { match: /claude/i, inputPerM: 3.0, outputPerM: 15.0 },
  { match: /llama-3\.3-70b/i, inputPerM: 0.59, outputPerM: 0.79 },
  { match: /llama-3\.1-8b/i, inputPerM: 0.05, outputPerM: 0.08 },
  { match: /llama/i, inputPerM: 0.25, outputPerM: 0.85 },
  { match: /deepseek/i, inputPerM: 0.14, outputPerM: 0.28 },
  { match: /mistral/i, inputPerM: 0.15, outputPerM: 0.6 },
];

/** Generic mid-range fallback for unrecognized model identifiers. */
const GENERIC_PRICE: ModelPrice = { inputPerM: 1.0, outputPerM: 3.0, known: false };

export function getModelPrice(model: string): ModelPrice {
  if (!model) return GENERIC_PRICE;
  const entry = PRICING_TABLE.find((e) => e.match.test(model));
  if (!entry) return GENERIC_PRICE;
  return { inputPerM: entry.inputPerM, outputPerM: entry.outputPerM, known: true };
}

/**
 * Cost of ONE production completion where this prompt is the input
 * (the "silent cost blowout" number — prompt edits that add tokens
 * multiply every future completion).
 */
export function estimateCostPerCompletion(model: string, inputTokens: number): number {
  const price = getModelPrice(model);
  return (inputTokens * price.inputPerM) / 1_000_000;
}

/** Cost of generating this prompt once (the output side of a generation call). */
export function estimateGenerationCost(model: string, outputTokens: number): number {
  const price = getModelPrice(model);
  return (outputTokens * price.outputPerM) / 1_000_000;
}

/** Format a dollar figure compactly: $0.0014, $0.08, $12.50 … */
export function formatCostDollars(n: number): string {
  if (!isFinite(n)) return '—';
  if (n === 0) return '$0.00';
  if (n < 0.001) return `$${(n * 1_000_000).toFixed(0)}µ`;
  if (n < 0.01) return `$${n.toFixed(4)}`;
  if (n < 1) return `$${n.toFixed(3)}`;
  return `$${n.toFixed(2)}`;
}

/** Format a large points-per-dollar figure: 12,480 pts/$1. */
export function formatScorePerDollar(n: number | null): string {
  if (n === null || !isFinite(n)) return '—';
  if (n >= 10_000) return `${(n / 1000).toFixed(1)}k pts/$1`;
  return `${Math.round(n).toLocaleString()} pts/$1`;
}
