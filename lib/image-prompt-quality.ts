import { ImagePlatform, ImagePromptInput, ImagePromptLintIssue } from '@/types';
import { ImagePromptSections } from './image-prompts';

export type { ImagePromptLintIssue };

export interface ImagePromptScorecard {
  overallScore: number; // 0-100
  slotCoverage: {
    score: number;
    coveredSlots: string[];
    missingSlots: string[];
  };
  dialectHealth: {
    score: number;
    validDialects: string[];
  };
  concretenessScore: number;
  bannedTokenCount: number;
  bannedTokensFound: string[];
  lintIssues: ImagePromptLintIssue[];
}

/** Buzzwords and filler tokens that dilute prompt intent across modern models. */
export const BANNED_BUZZWORDS = [
  'photorealistic',
  'hyperrealistic',
  'ultra realistic',
  'stunning',
  'breathtaking',
  'masterpiece',
  'amazing',
  'award winning',
  'trending on artstation',
  'unreal engine',
  'octane render',
  '8k',
  '16k',
  'highly detailed',
  'insane detail',
];

const OPERATIONAL_VERBS = [
  'capture',
  'render',
  'create',
  'generate',
  'design',
  'craft',
  'show',
  'depict',
  'illustrate',
  'transform',
  'place',
  'construct',
];

/** Audit and score an image prompt set deterministically. */
export function auditImagePromptQuality(
  input: ImagePromptInput,
  sections: ImagePromptSections
): ImagePromptScorecard {
  const issues: ImagePromptLintIssue[] = [];

  // 1. Slot coverage analysis
  const coveredSlots: string[] = [];
  const missingSlots: string[] = [];

  if (input.subject?.trim()) coveredSlots.push('subject');
  else missingSlots.push('subject');

  if (input.style) coveredSlots.push('style');
  else missingSlots.push('style');

  if (input.lighting) coveredSlots.push('lighting');
  else missingSlots.push('lighting');

  if (input.camera) coveredSlots.push('camera / lens');
  else missingSlots.push('camera / lens');

  if (input.composition) coveredSlots.push('composition');
  else missingSlots.push('composition');

  if (input.mood) coveredSlots.push('mood');
  else missingSlots.push('mood');

  if (input.colorGrade) coveredSlots.push('color grade');
  else missingSlots.push('color grade');

  if (input.aspectRatio) coveredSlots.push('aspect ratio');
  else missingSlots.push('aspect ratio');

  if (input.purpose) coveredSlots.push('purpose / end use');

  const slotScore = Math.round((coveredSlots.length / (coveredSlots.length + missingSlots.length)) * 100);

  if (missingSlots.includes('camera / lens') && input.mode !== 'logo') {
    issues.push({
      severity: 'info',
      rule: 'camera-unspecified',
      message: 'No camera lens or focal length selected.',
      suggestion: 'Specifying 35mm, 85mm, or anamorphic lens provides cinematic depth.',
    });
  }

  if (missingSlots.includes('lighting') && input.mode !== 'logo') {
    issues.push({
      severity: 'info',
      rule: 'lighting-unspecified',
      message: 'No lighting preset selected — model will infer ambient light.',
      suggestion: 'Add Golden Hour, Chiaroscuro, or Studio Softbox for intentional mood.',
    });
  }

  // 2. Banned buzzword scan across all generated text
  const fullText = sections.raw || Object.values(sections).join(' ');
  const lowerFull = fullText.toLowerCase();
  const bannedFound: string[] = [];

  for (const bw of BANNED_BUZZWORDS) {
    if (lowerFull.includes(bw)) {
      bannedFound.push(bw);
    }
  }

  if (bannedFound.length > 0) {
    issues.push({
      severity: 'warning',
      platform: 'universal',
      rule: 'banned-buzzwords',
      message: `Found ${bannedFound.length} quality-diluting buzzword(s): ${bannedFound.slice(0, 3).join(', ')}${bannedFound.length > 3 ? '...' : ''}`,
      suggestion: 'Replace subjective adjectives with concrete lighting, lens, and material nouns.',
    });
  }

  // 3. Dialect-specific linter
  const validDialects: string[] = [];

  // Midjourney lint
  if (sections.midjourney) {
    const mj = sections.midjourney;
    let mjHealthy = true;

    if (!mj.includes('--ar')) {
      issues.push({
        severity: 'warning',
        platform: 'midjourney',
        rule: 'mj-missing-ar',
        message: 'Midjourney prompt is missing the --ar parameter.',
        suggestion: `Append --ar ${input.aspectRatio} to the end of the prompt.`,
      });
      mjHealthy = false;
    }

    if (mj.includes('--cref') && !mj.includes('--v 7')) {
      issues.push({
        severity: 'warning',
        platform: 'midjourney',
        rule: 'mj-cref-v8-conflict',
        message: 'Midjourney V8 uses Omni Reference (--oref). --cref requires Midjourney V7 (--v 7).',
        suggestion: 'Use --oref <url> --ow 100 for V7 character/object consistency, or add --v 7.',
      });
    }

    const owMatch = mj.match(/--ow\s+(\d+)/);
    if (owMatch) {
      const val = parseInt(owMatch[1], 10);
      if (val < 0 || val > 1000) {
        issues.push({
          severity: 'error',
          platform: 'midjourney',
          rule: 'mj-ow-out-of-range',
          message: `--ow weight (${val}) is out of range. Valid range is 0 to 1000 (default 100).`,
          suggestion: 'Set --ow between 25 (style transfer) and 300-400 (face lock).',
        });
        mjHealthy = false;
      }
    }

    if (mj.startsWith('"') && mj.endsWith('"')) {
      issues.push({
        severity: 'warning',
        platform: 'midjourney',
        rule: 'mj-wrapped-quotes',
        message: 'Midjourney prompt should not be wrapped in outer quotation marks.',
      });
    }

    if (mjHealthy) validDialects.push('midjourney');
  }

  // Gemini / Nano Banana lint
  if (sections.gemini) {
    const gem = sections.gemini;
    let gemHealthy = true;

    const firstWord = gem.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '') || '';
    if (!OPERATIONAL_VERBS.includes(firstWord)) {
      issues.push({
        severity: 'info',
        platform: 'gemini',
        rule: 'gemini-operational-verb',
        message: `Gemini / Nano Banana performs best when starting with a direct operational verb ("Create", "Render", "Capture", "Design").`,
        suggestion: `Start with "${input.mode === 'logo' ? 'Design' : 'Capture'}" or "Render".`,
      });
    }

    if (gem.includes('Negative prompt:') || gem.includes('--no ')) {
      issues.push({
        severity: 'warning',
        platform: 'gemini',
        rule: 'gemini-negative-syntax',
        message: 'Gemini has no negative prompt syntax. Phrase exclusions as "without X" or "avoiding X".',
      });
      gemHealthy = false;
    }

    if (gemHealthy) validDialects.push('gemini');
  }

  // Flux 2 lint
  if (sections.flux) {
    const flx = sections.flux;
    let fluxHealthy = true;

    if (flx.includes('Negative prompt:') || flx.includes('--no ')) {
      issues.push({
        severity: 'warning',
        platform: 'flux',
        rule: 'flux-no-negative-prompt',
        message: 'Flux 2 takes natural language descriptions and does NOT use negative prompt syntax.',
      });
      fluxHealthy = false;
    }

    if (/\(\w+:\d+(\.\d+)?\)/.test(flx)) {
      issues.push({
        severity: 'warning',
        platform: 'flux',
        rule: 'flux-no-sd-weights',
        message: 'Flux 2 prefers natural language descriptions over Stable Diffusion token weight syntax (word:1.2).',
      });
    }

    if (fluxHealthy) validDialects.push('flux');
  }

  // GPT Image 2 lint
  if (sections.dalle) {
    const gptImg = sections.dalle;
    let gptHealthy = true;

    if (gptImg.includes('--ar') || gptImg.includes('--v ')) {
      issues.push({
        severity: 'warning',
        platform: 'gpt-image',
        rule: 'gpt-image-mj-params',
        message: 'GPT Image 2 does not use double-dash parameters. Describe aspect ratio in natural language.',
      });
      gptHealthy = false;
    }

    if (gptHealthy) validDialects.push('gpt-image');
  }

  // Stable Diffusion lint
  if (sections['stable-diffusion']) {
    validDialects.push('stable-diffusion');
  }

  // Ideogram lint
  if (sections.ideogram) {
    validDialects.push('ideogram');
  }

  // In-image text verification
  const expectedText = input.inImageText?.trim() || (input.mode === 'logo' ? input.brandName?.trim() : undefined);
  if (expectedText) {
    const quoted = `"${expectedText}"`;
    const lowerExp = expectedText.toLowerCase();
    const hasQuoted = fullText.includes(quoted) || fullText.toLowerCase().includes(lowerExp);
    if (!hasQuoted) {
      issues.push({
        severity: 'warning',
        rule: 'missing-in-image-text',
        message: `Requested text "${expectedText}" is not explicitly rendered in quotes in all platform sections.`,
        suggestion: `Ensure "${expectedText}" appears in quotes for typography accuracy.`,
      });
    }
  }

  // Calculate scores
  const dialectScore = Object.keys(sections).filter(k => k !== 'raw' && k !== 'preamble' && k !== 'research').length > 0
    ? Math.round((validDialects.length / Math.max(1, Object.keys(sections).filter(k => k !== 'raw' && k !== 'preamble' && k !== 'research').length)) * 100)
    : 80;

  const concretenessScore = Math.max(20, 100 - (bannedFound.length * 15));
  const overallScore = Math.round(slotScore * 0.4 + dialectScore * 0.35 + concretenessScore * 0.25);

  return {
    overallScore: Math.min(100, Math.max(0, overallScore)),
    slotCoverage: {
      score: slotScore,
      coveredSlots,
      missingSlots,
    },
    dialectHealth: {
      score: dialectScore,
      validDialects,
    },
    concretenessScore,
    bannedTokenCount: bannedFound.length,
    bannedTokensFound: bannedFound,
    lintIssues: issues,
  };
}
