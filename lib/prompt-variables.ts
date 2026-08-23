/**
 * lib/prompt-variables.ts
 *
 * Phase 1 — Variable Schema Foundation:
 * Deterministic detection, contextual type inference, schema extraction,
 * linting, and substitution for prompt placeholders.
 *
 * Supports:
 * 1. Classic brackets: `[TARGET_AUDIENCE]`
 * 2. Mustache/Jinja template variables: `{{tone}}`
 * 3. Embedded meta schema blocks:
 *    ```yaml
 *    # @variables:
 *    #   - name: tone
 *    #     type: enum
 *    #     enumValues: ["formal", "casual"]
 *    #     default: "formal"
 *    #     required: true
 *    ```
 */

import {
  PromptVariable,
  PromptVariableType,
  VariableLintIssue,
  VariableLintReport,
} from '@/types';

// Regex patterns for matching placeholders
export const BRACKET_VAR_REGEX = /\[([A-Za-z0-9_\- .]+)\]/g;
export const MUSTACHE_VAR_REGEX = /\{\{([A-Za-z0-9_\- .]+)\}\}/g;

/** Normalizes a variable key for loose/canonical comparisons (e.g. `user_name` -> `username`). */
export function normalizeVariableKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Contextual type inference heuristic based on common naming patterns.
 */
export function inferVariableType(name: string): PromptVariableType {
  const lower = name.toLowerCase();

  // Number heuristics
  if (
    /(?:^|_|-)(count|limit|length|max|min|size|age|year|duration|quantity|amount|num|tokens|percent|ratio)(?:$|_|-)/i.test(
      lower,
    )
  ) {
    return 'number';
  }

  // Boolean heuristics
  if (
    /^(is|has|enable|enabled|include|included|require|required|allow|show|hide)(?:_|-|[A-Z])/i.test(
      lower,
    ) ||
    /(?:^|_|-)(flag|bool|boolean)(?:$|_|-)/i.test(lower)
  ) {
    return 'boolean';
  }

  // JSON / structured heuristics
  if (/(?:^|_|-)(json|schema|payload|object|data_structure|dict|config_obj)(?:$|_|-)/i.test(lower)) {
    return 'json';
  }

  // Enum heuristics
  if (/(?:^|_|-)(mode|choice|status|category|tier|type|format_choice)(?:$|_|-)/i.test(lower)) {
    return 'enum';
  }

  return 'string';
}

/**
 * Extracts meta-schema variables declared in YAML/JSON comment blocks.
 * Example syntax:
 *   # @variables:
 *   #   - name: audience
 *   #     type: string
 *   #     default: "Developers"
 *   #     required: true
 */
export function parseMetaSchemaVariables(content: string): PromptVariable[] {
  const schemaVariables: PromptVariable[] = [];

  // Match `@variables:` block in comments or frontmatter
  const blockMatch = content.match(
    /(?:#|\/\/|\/\*|<!--)\s*@variables:?\s*([\s\S]*?)(?:-->|\*\/|\n\s*\n|$)/i,
  );

  if (!blockMatch || !blockMatch[1]) {
    return schemaVariables;
  }

  const rawBlock = blockMatch[1];
  const itemBlocks = rawBlock.split(/(?:^|\n)\s*-\s+/).filter((s) => s.trim().length > 0);

  for (const item of itemBlocks) {
    const nameMatch = item.match(/name:\s*["']?([A-Za-z0-9_\- .]+)["']?/i);
    if (!nameMatch) continue;

    const name = nameMatch[1].trim();
    const typeMatch = item.match(/type:\s*["']?(string|number|boolean|enum|json)["']?/i);
    const type: PromptVariableType = typeMatch
      ? (typeMatch[1].toLowerCase() as PromptVariableType)
      : inferVariableType(name);

    const defaultMatch = item.match(/default:\s*["']?([^"'\n]+)["']?/i);
    const defaultValue = defaultMatch ? defaultMatch[1].trim() : undefined;

    const requiredMatch = item.match(/required:\s*(true|false)/i);
    const required = requiredMatch ? requiredMatch[1].toLowerCase() === 'true' : true;

    const descMatch = item.match(/(?:desc|description):\s*["']?([^"'\n]+)["']?/i);
    const description = descMatch ? descMatch[1].trim() : undefined;

    const enumMatch = item.match(/enumValues:\s*\[([^\]]+)\]/i);
    const enumValues = enumMatch
      ? enumMatch[1].split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean)
      : undefined;

    schemaVariables.push({
      name,
      rawSyntax: `{{${name}}}`,
      type,
      enumValues,
      defaultValue,
      description,
      required,
      isDeclaredInSchema: true,
      occurrences: 0,
    });
  }

  return schemaVariables;
}

/**
 * Scans prompt text for `[VARIABLE]` and `{{variable}}` patterns and combines them
 * with any declared meta-schema variables.
 */
export function extractPromptVariables(content: string): PromptVariable[] {
  const metaVars = parseMetaSchemaVariables(content);
  const varMap = new Map<string, PromptVariable>();

  // Initialize map with schema variables
  for (const v of metaVars) {
    varMap.set(normalizeVariableKey(v.name), { ...v });
  }

  // Scan mustache {{variable}}
  let match: RegExpExecArray | null;
  const mustacheRegex = new RegExp(MUSTACHE_VAR_REGEX.source, 'g');
  while ((match = mustacheRegex.exec(content)) !== null) {
    const raw = match[0];
    const name = match[1].trim();
    const key = normalizeVariableKey(name);

    if (varMap.has(key)) {
      const existing = varMap.get(key)!;
      existing.occurrences = (existing.occurrences || 0) + 1;
    } else {
      varMap.set(key, {
        name,
        rawSyntax: raw,
        type: inferVariableType(name),
        required: true,
        isDeclaredInSchema: false,
        occurrences: 1,
      });
    }
  }

  // Scan bracket [VARIABLE] (skipping markdown links [label](url))
  const bracketRegex = new RegExp(BRACKET_VAR_REGEX.source, 'g');
  while ((match = bracketRegex.exec(content)) !== null) {
    const raw = match[0];
    const name = match[1].trim();
    const matchIndex = match.index;

    // Check if it's a markdown link `[text](url)`
    const nextChar = content[matchIndex + raw.length];
    if (nextChar === '(') {
      continue;
    }

    const key = normalizeVariableKey(name);
    if (varMap.has(key)) {
      const existing = varMap.get(key)!;
      existing.occurrences = (existing.occurrences || 0) + 1;
    } else {
      varMap.set(key, {
        name,
        rawSyntax: raw,
        type: inferVariableType(name),
        required: true,
        isDeclaredInSchema: false,
        occurrences: 1,
      });
    }
  }

  return Array.from(varMap.values());
}

/**
 * Deterministic real-time linter for prompt variables and placeholders.
 */
export function lintPromptVariables(content: string): VariableLintReport {
  const issues: VariableLintIssue[] = [];
  const variables = extractPromptVariables(content);

  // 1. Check for unclosed mustache `{{` without `}}`
  let mustacheOpen = 0;
  let inDoubleBrace = false;
  for (let i = 0; i < content.length; i++) {
    if (content[i] === '{' && content[i + 1] === '{') {
      mustacheOpen++;
      inDoubleBrace = true;
      i++;
    } else if (content[i] === '}' && content[i + 1] === '}') {
      if (mustacheOpen > 0) mustacheOpen--;
      inDoubleBrace = false;
      i++;
    }
  }
  if (mustacheOpen > 0) {
    issues.push({
      kind: 'unclosed-brace',
      severity: 'error',
      message: `${mustacheOpen} unclosed '{{' placeholder brace${mustacheOpen === 1 ? '' : 's'} found.`,
    });
  }

  // 2. Check for unclosed bracket `[` without `]`
  let bracketOpen = 0;
  for (let i = 0; i < content.length; i++) {
    if (content[i] === '[') {
      bracketOpen++;
    } else if (content[i] === ']') {
      if (bracketOpen > 0) bracketOpen--;
    }
  }
  if (bracketOpen > 0) {
    issues.push({
      kind: 'unclosed-brace',
      severity: 'warning',
      message: `${bracketOpen} unclosed bracket '[' placeholder${bracketOpen === 1 ? '' : 's'} found.`,
    });
  }

  // 3. Check for meta-schema declared variables that are never referenced in prompt text
  for (const v of variables) {
    if (v.isDeclaredInSchema && v.occurrences === 0) {
      issues.push({
        kind: 'unused-declaration',
        severity: 'info',
        variableName: v.name,
        message: `Variable '${v.name}' is declared in the @variables schema but never referenced in the prompt.`,
      });
    }
  }

  // 4. Inconsistent casing / naming checks (e.g. `[TARGET_AUDIENCE]` vs `{{targetAudience}}`)
  const byNorm = new Map<string, string[]>();
  const allRawTokens: string[] = [];

  const mRegex = new RegExp(MUSTACHE_VAR_REGEX.source, 'g');
  let mMatch: RegExpExecArray | null;
  while ((mMatch = mRegex.exec(content)) !== null) {
    allRawTokens.push(mMatch[1].trim());
  }

  const bRegex = new RegExp(BRACKET_VAR_REGEX.source, 'g');
  let bMatch: RegExpExecArray | null;
  while ((bMatch = bRegex.exec(content)) !== null) {
    const raw = bMatch[0];
    if (content[bMatch.index + raw.length] !== '(') {
      allRawTokens.push(bMatch[1].trim());
    }
  }

  for (const token of allRawTokens) {
    const key = normalizeVariableKey(token);
    if (!byNorm.has(key)) byNorm.set(key, []);
    byNorm.get(key)!.push(token);
  }

  for (const [key, group] of byNorm) {
    const uniqueForms = Array.from(new Set(group));
    if (uniqueForms.length > 1) {
      issues.push({
        kind: 'duplicate-name',
        severity: 'warning',
        variableName: group[0],
        message: `Variables ${uniqueForms.map((f) => `'${f}'`).join(' and ')} represent the same field with inconsistent naming.`,
      });
    }
  }

  const hasErrors = issues.some((i) => i.severity === 'error');
  const hasWarnings = issues.some((i) => i.severity === 'warning');

  return {
    variables,
    issues,
    hasErrors,
    hasWarnings,
  };
}

/**
 * Safely substitutes variables in the prompt with user-supplied values.
 * Supports both `[VAR]` and `{{var}}` syntax matching via normalized keys.
 */
export function substitutePromptVariables(
  content: string,
  values: Record<string, string>,
): string {
  // Replace mustache {{var}}
  let replaced = content.replace(new RegExp(MUSTACHE_VAR_REGEX.source, 'g'), (_raw, inner: string) => {
    const key = normalizeVariableKey(inner.trim());
    const val = values[key];
    return val !== undefined && val !== '' ? val : `{{${inner.trim()}}}`;
  });

  // Replace bracket [VAR]
  replaced = replaced.replace(new RegExp(BRACKET_VAR_REGEX.source, 'g'), (raw, inner: string, offset: number, fullStr: string) => {
    if (fullStr[offset + raw.length] === '(') {
      return raw; // preserve markdown links
    }
    const key = normalizeVariableKey(inner.trim());
    const val = values[key];
    return val !== undefined && val !== '' ? val : `[${inner.trim()}]`;
  });

  return replaced;
}
