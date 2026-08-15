/**
 * F4 — Placeholder linter + variable fill.
 * LLM-generated prompts routinely invent inconsistent placeholder names
 * ([PRODUCT_NAME] here, [PRODUCT] there) or leave brackets unclosed.
 * This module audits placeholders deterministically and fills them.
 */

export interface PlaceholderToken {
  raw: string; // exact text including brackets, e.g. "[PRODUCT_NAME]"
  name: string; // inner text, e.g. "PRODUCT_NAME"
  normalized: string; // lowercase alphanumeric key for grouping
}

export interface PlaceholderIssue {
  kind: 'inconsistent-name' | 'unclosed-bracket' | 'duplicate-group';
  message: string;
}

export interface PlaceholderAudit {
  tokens: PlaceholderToken[];
  issues: PlaceholderIssue[];
  /** Distinct normalized keys that need values, in order of appearance. */
  keys: string[];
}

const TOKEN_RE = /\[([A-Za-z0-9_ .-]+)\]/g;

export function normalizeKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function auditPlaceholders(content: string): PlaceholderAudit {
  const tokens: PlaceholderToken[] = [];
  const issues: PlaceholderIssue[] = [];

  let match: RegExpExecArray | null;
  const regex = new RegExp(TOKEN_RE.source, 'g');
  while ((match = regex.exec(content)) !== null) {
    tokens.push({ raw: match[0], name: match[1].trim(), normalized: normalizeKey(match[1]) });
  }

  // Unclosed brackets: count '[' without a matching ']' after it
  let openCount = 0;
  for (const ch of content) {
    if (ch === '[') openCount++;
    else if (ch === ']') openCount = Math.max(0, openCount - 1);
  }
  if (openCount > 0) {
    issues.push({ kind: 'unclosed-bracket', message: `${openCount} unfinished field${openCount === 1 ? '' : 's'} — add a value or remove the brackets.` });
  }

  // Inconsistent names: multiple distinct raw names sharing a normalized key
  const byKey = new Map<string, PlaceholderToken[]>();
  for (const t of tokens) {
    if (!byKey.has(t.normalized)) byKey.set(t.normalized, []);
    byKey.get(t.normalized)!.push(t);
  }
  for (const [key, group] of byKey) {
    const distinctNames = new Set(group.map((t) => t.name.toLowerCase()));
    if (distinctNames.size > 1) {
      issues.push({
        kind: 'inconsistent-name',
        message: `Fields ${group.map((t) => t.raw).join(', ')} mean the same thing — use one name for both.`,
      });
    }
    if (group.length > 3) {
      issues.push({ kind: 'duplicate-group', message: `"${group[0].raw}" appears ${group.length} times — use it once to keep the prompt clear.` });
    }
  }

  const keys = [...byKey.keys()];
  return { tokens, issues, keys };
}

/** Replace all bracket placeholders with user-provided values (normalized-key match). */
export function fillPlaceholders(content: string, values: Record<string, string>): string {
  return content.replace(new RegExp(TOKEN_RE.source, 'g'), (_raw, inner: string) => {
    const key = normalizeKey(inner.trim());
    const value = values[key];
    return value !== undefined && value !== '' ? value : `[${inner.trim()}]`;
  });
}

/** Convenience: does the content contain any bracket placeholders? */
export function hasPlaceholders(content: string): boolean {
  return new RegExp(TOKEN_RE.source).test(content);
}
