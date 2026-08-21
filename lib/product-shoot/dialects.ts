/**
 * Dialect parsing and platform adaptation for Product Shoot Studio.
 *
 * Translates generated commercial prompts into model-specific dialects
 * (Runway Gen-3/4, Kling, Google Veo, Luma Ray 2, Minimax Hailuo),
 * parses streaming output into structured cards, and generates remix suggestions.
 */

import type { ProductShootSections, VideoPlatformDialect } from './types';

/** Platform metadata and formatting tips. */
export interface PlatformMeta {
  id: VideoPlatformDialect;
  name: string;
  badge: string;
  description: string;
  bestFor: string;
}

export const PLATFORM_METAS: Record<VideoPlatformDialect, PlatformMeta> = {
  master: {
    id: 'master',
    name: 'Master Prompt',
    badge: 'Standard 5-Part',
    description: 'Comprehensive director brief with Subject, Context, Event, Nuance & Exclusions.',
    bestFor: 'Universal base, script breakdown, reference prompt',
  },
  runway: {
    id: 'runway',
    name: 'Runway Gen-3 / Gen-4',
    badge: 'Camera Motion Syntax',
    description: 'Optimized with Runway camera motion syntax, lens specifications, and smooth velocity.',
    bestFor: 'Dynamic camera sweeps, macro tracking, cinematic lighting',
  },
  kling: {
    id: 'kling',
    name: 'Kling 1.6 / 3.0',
    badge: 'Temporal & Human Motion',
    description: 'Chronological timeline cues and natural human-object interaction.',
    bestFor: 'Human hand interactions, pouring, unboxing, UGC demos',
  },
  veo: {
    id: 'veo',
    name: 'Google Veo 2 / 3.1',
    badge: 'Physical World Simulation',
    description: 'Granular optical details, natural light dispersion, and material physics.',
    bestFor: 'Fluid dynamics, crystalline caustics, architectural lighting',
  },
  luma: {
    id: 'luma',
    name: 'Luma Ray 2',
    badge: 'High-Impact Physics',
    description: 'High-speed physical collisions, liquid dynamics, and textural macro fidelity.',
    bestFor: 'Water splash crowns, mist condensation, kinetic explosions',
  },
  minimax: {
    id: 'minimax',
    name: 'Minimax Hailuo',
    badge: 'Punchy Social Motion',
    description: 'Concise high-energy directives tuned for aesthetic commercial consistency.',
    bestFor: 'Fast-paced social media ads, viral hooks, vibrant lighting',
  },
};

/**
 * Robustly parse the AI generation stream into structured sections.
 */
export function parseProductShootOutput(raw: string): ProductShootSections {
  if (!raw || raw.trim().length === 0) {
    return {
      mainPrompt: '',
      negativePrompt: '',
      aspectVariants: [],
      alternativeConcepts: [],
      remixSuggestions: [],
    };
  }

  // 1. Extract Main Prompt
  const mainPrompt = extractSection(raw, 'Main Shot Prompt', ['Negative Prompt', 'Runway', 'Kling', 'Veo', 'Luma', 'Minimax', 'Aspect Variants']);

  // 2. Extract Negative Prompt
  const negativePrompt = extractSection(raw, 'Negative Prompt', ['Runway', 'Kling', 'Veo', 'Luma', 'Minimax', 'Aspect Variants', 'Alternative Concepts']);

  // 3. Extract Model Dialects
  const runwayPrompt = extractSection(raw, 'Runway', ['Kling', 'Veo', 'Luma', 'Minimax', 'Aspect Variants', 'Alternative Concepts', 'Negative Prompt']);
  const klingPrompt = extractSection(raw, 'Kling', ['Veo', 'Luma', 'Minimax', 'Aspect Variants', 'Alternative Concepts', 'Negative Prompt']);
  const veoPrompt = extractSection(raw, 'Google Veo', ['Luma', 'Minimax', 'Aspect Variants', 'Alternative Concepts', 'Negative Prompt'])
    || extractSection(raw, 'Veo', ['Luma', 'Minimax', 'Aspect Variants', 'Alternative Concepts', 'Negative Prompt']);
  const lumaPrompt = extractSection(raw, 'Luma', ['Minimax', 'Aspect Variants', 'Alternative Concepts', 'Negative Prompt']);
  const minimaxPrompt = extractSection(raw, 'Minimax', ['Aspect Variants', 'Alternative Concepts', 'Negative Prompt', 'Remix'])
    || extractSection(raw, 'Hailuo', ['Aspect Variants', 'Alternative Concepts', 'Negative Prompt', 'Remix']);

  // 4. Extract Aspect Variants
  const aspectVariants: { ratio: string; prompt: string }[] = [];
  const ratios = ['16:9', '9:16', '1:1', '4:5'];
  for (const ratio of ratios) {
    const nextRatios = ratios.filter((r) => r !== ratio);
    const stopLabels = [...nextRatios.map((r) => `${r}`), 'Alternative Concepts', 'Remix'];
    const p = extractSection(raw, ratio, stopLabels);
    if (p && p.length > 10) {
      aspectVariants.push({ ratio, prompt: p });
    }
  }

  // 5. Extract Alternative Concepts
  const alternativeConcepts: { title: string; prompt: string }[] = [];
  const conceptMatches = raw.matchAll(
    /###\s*Concept\s*\d*:\s*([^\n\r]+)[\n\r]+([\s\S]*?)(?=###\s*Concept\s*\d*:|##\s|$)/gi
  );
  for (const match of conceptMatches) {
    const title = match[1].replace(/^[#\s*]+/, '').trim();
    const prompt = match[2].trim();
    if (title && prompt) {
      alternativeConcepts.push({ title, prompt });
    }
  }

  // 6. Extract Remix Suggestions
  const remixSuggestions: string[] = [];
  const remixRaw = extractSection(raw, 'Remix Suggestions', ['## ']);
  if (remixRaw) {
    const lines = remixRaw.split('\n');
    for (const line of lines) {
      const cleaned = line.replace(/^[-*•\d.)\s]+/, '').trim();
      if (cleaned && cleaned.length > 5 && cleaned.length < 120) {
        remixSuggestions.push(cleaned);
      }
    }
  }

  // Fallback default remix suggestions if model didn't output any
  if (remixSuggestions.length === 0 && mainPrompt) {
    remixSuggestions.push(
      'Switch to dramatic chiaroscuro rim lighting with deep shadows',
      'Add high-speed fluid splash crown around product base',
      'Convert to vertical 9:16 UGC creator unboxing style',
      'Elevate product on polished Carrara marble plinth',
      'Change to ultra slow-motion 120fps macro lens sweep'
    );
  }

  return {
    mainPrompt: mainPrompt || raw.slice(0, 500),
    negativePrompt: negativePrompt || 'distorted label, morphed text, extra products, warped packaging, blurry details, duplicate bottle',
    runwayPrompt: runwayPrompt || undefined,
    klingPrompt: klingPrompt || undefined,
    veoPrompt: veoPrompt || undefined,
    lumaPrompt: lumaPrompt || undefined,
    minimaxPrompt: minimaxPrompt || undefined,
    aspectVariants,
    alternativeConcepts,
    remixSuggestions,
  };
}

/** Helper to extract a subsection between markdown headers. */
function extractSection(text: string, headerName: string, stopHeaders: string[]): string {
  const headerRegex = new RegExp(
    `(?:##+\\s*|#+\\s*|\\*\\*\\s*)?${escapeRegExp(headerName)}[^\\n\\r]*[\\n\\r]+`,
    'i'
  );
  const match = headerRegex.exec(text);
  if (!match) return '';

  const startIndex = match.index + match[0].length;
  const subText = text.slice(startIndex);

  // Build stop pattern from stopHeaders
  const stopPatterns = stopHeaders.map((h) => escapeRegExp(h)).join('|');
  const stopRegex = new RegExp(
    `(?:[\\n\\r]+(?:##+|#+|\\*\\*|###+)\\s*(?:${stopPatterns}))`,
    'i'
  );

  const stopMatch = stopRegex.exec(subText);
  const result = stopMatch ? subText.slice(0, stopMatch.index) : subText;

  return result.trim();
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
