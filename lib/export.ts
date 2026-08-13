/**
 * F5 — Multi-model export adapters.
 * Deterministically reformat a generated prompt for the conventions of
 * each target model family. No LLM calls — pure text transformation, so
 * the exported prompt is byte-identical in meaning to the source version.
 */

export type ExportTarget = 'markdown' | 'claude' | 'gpt' | 'gemini' | 'json';

export const EXPORT_TARGETS: { value: ExportTarget; label: string; hint: string }[] = [
  { value: 'markdown', label: 'Markdown (generic)', hint: 'Plain markdown, works everywhere' },
  { value: 'claude', label: 'Claude (XML tags)', hint: 'Anthropic-style <role> / <instructions> tags' },
  { value: 'gpt', label: 'GPT (structured text)', hint: 'OpenAI-friendly plain structured prompt' },
  { value: 'gemini', label: 'Gemini (bold labels)', hint: 'Google-friendly concise labeled directives' },
  { value: 'json', label: 'JSON payload', hint: '{"system_prompt": ...} for API usage' },
];

const HEADING_RE = /^(#{1,6})\s+(.+)$/gm;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32) || 'section';
}

function claudeTagFor(heading: string): string {
  const h = heading.toLowerCase();
  if (/(role|persona|identity|expert)/.test(h)) return 'role';
  if (/(context|background|audience|scenario)/.test(h)) return 'context';
  if (/(instruction|task|objective|goal|step|directive)/.test(h)) return 'instructions';
  if (/(constraint|guardrail|negative|avoid|not to)/.test(h)) return 'constraints';
  if (/(output|format|response|result)/.test(h)) return 'output_format';
  return `section_${slugify(heading)}`;
}

function transformHeadings(content: string, map: (heading: string, depth: number) => string): string {
  return content.replace(HEADING_RE, (_m, hashes: string, text: string) => {
    const depth = hashes.length;
    return map(text.trim(), depth);
  });
}

/** Wrap a raw prompt for the given target convention. */
export function exportPromptFor(prompt: string, target: ExportTarget): string {
  const trimmed = prompt.trim();
  if (!trimmed) return '';

  switch (target) {
    case 'markdown':
      return trimmed;
    case 'json':
      return JSON.stringify({ system_prompt: trimmed }, null, 2);
    case 'gpt':
      return transformHeadings(trimmed, (text, _depth) => `${text.toUpperCase()}`) + '\n';
    case 'claude':
      return (
        transformHeadings(trimmed, (text) => `<${claudeTagFor(text)}>\n${text}\n</${claudeTagFor(text)}>`) + '\n'
      );
    case 'gemini':
      return transformHeadings(trimmed, (text) => `**${text.toUpperCase()}**`) + '\n';
    default:
      return trimmed;
  }
}
