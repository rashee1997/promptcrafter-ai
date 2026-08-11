import { VersionSourceType } from '@/types';

export function unwrapCodeBlock(str: string): string {
  if (!str) return '';
  const trimmed = str.trim();
  const codeBlockMatch = trimmed.match(/^```(?:markdown|text|xml|json)?\n([\s\S]*?)\n?```$/i);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }
  return trimmed;
}

export function computePromptStats(content: string): { wordCount: number; charCount: number; estTokens: number } {
  const unwrapped = unwrapCodeBlock(content);
  const wordCount = unwrapped.trim() ? unwrapped.trim().split(/\s+/).length : 0;
  const charCount = unwrapped.length;
  const estTokens = Math.max(Math.ceil(charCount / 3.8), Math.round(wordCount * 1.3));
  return { wordCount, charCount, estTokens };
}

export function generateVersionName(
  instruction: string | undefined,
  versionNumber: number,
  sourceType: VersionSourceType
): string {
  if (versionNumber === 1 || sourceType === 'initial') {
    return 'Initial Generation';
  }
  if (sourceType === 'manual-edit') {
    return 'Manual Edit';
  }

  if (!instruction || !instruction.trim()) {
    return `Version ${versionNumber}`;
  }

  const stopWords = new Set([
    'a', 'an', 'the', 'make', 'it', 'add', 'please', 'and', 'with', 'to', 'for', 'in',
    'of', 'on', 'at', 'by', 'this', 'that', 'change', 'update', 'modify', 'more', 'less'
  ]);

  const words = instruction
    .trim()
    .replace(/[^\w\s-]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 0);

  const significantWords = words.filter((w) => !stopWords.has(w.toLowerCase()));
  const chosenWords = significantWords.length > 0 ? significantWords.slice(0, 5) : words.slice(0, 5);

  if (chosenWords.length === 0) {
    return `Refinement ${versionNumber}`;
  }

  const titleCased = chosenWords
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return titleCased.length > 30 ? titleCased.slice(0, 27) + '...' : titleCased;
}
