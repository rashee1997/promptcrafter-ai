/**
 * F2 — Deterministic text similarity for cross-model consistency scoring.
 * No external embedding service required: uses character n-gram cosine
 * similarity plus word-level Jaccard, then normalizes to 0-100.
 */

const N_GRAM = 3;

function tokenizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

function nGrams(text: string, n: number): string[] {
  const cleaned = text.toLowerCase().replace(/\s+/g, ' ');
  const grams: string[] = [];
  for (let i = 0; i + n <= cleaned.length; i++) {
    grams.push(cleaned.slice(i, i + n));
  }
  return grams;
}

function cosineSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const countsA = new Map<string, number>();
  const countsB = new Map<string, number>();
  for (const g of a) countsA.set(g, (countsA.get(g) || 0) + 1);
  for (const g of b) countsB.set(g, (countsB.get(g) || 0) + 1);

  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (const [g, count] of countsA) {
    dot += count * (countsB.get(g) || 0);
    normA += count * count;
  }
  for (const count of countsB.values()) normB += count * count;
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function jaccardSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 1;
  const setA = new Set(a);
  const setB = new Set(b);
  let intersection = 0;
  for (const w of setA) if (setB.has(w)) intersection++;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 1 : intersection / union;
}

/** Pairwise similarity (0-1) between two texts, blending n-gram cosine and word Jaccard. */
export function textSimilarity(a: string, b: string): number {
  if (!a.trim() && !b.trim()) return 1;
  if (!a.trim() || !b.trim()) return 0;
  const cosine = cosineSimilarity(nGrams(a, N_GRAM), nGrams(b, N_GRAM));
  const jaccard = jaccardSimilarity(tokenizeWords(a), tokenizeWords(b));
  return 0.7 * cosine + 0.3 * jaccard;
}

/**
 * Average pairwise similarity (0-100) across all model outputs.
 * Returns null when fewer than 2 outputs are available.
 */
export function consistencyScore(outputs: string[]): number | null {
  const valid = outputs.filter((o) => o && o.trim().length > 0);
  if (valid.length < 2) return null;
  let total = 0;
  let pairs = 0;
  for (let i = 0; i < valid.length; i++) {
    for (let j = i + 1; j < valid.length; j++) {
      total += textSimilarity(valid[i], valid[j]);
      pairs++;
    }
  }
  return Math.round((total / pairs) * 100);
}

export function consistencyLabel(score: number | null): { label: string; tone: 'success' | 'warning' | 'danger' } {
  if (score === null) return { label: 'N/A', tone: 'warning' };
  if (score >= 80) return { label: `${score}/100 · Consistent`, tone: 'success' };
  if (score >= 55) return { label: `${score}/100 · Varies`, tone: 'warning' };
  return { label: `${score}/100 · Inconsistent`, tone: 'danger' };
}
