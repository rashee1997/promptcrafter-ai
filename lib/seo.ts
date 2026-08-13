import { SITE_URL } from '@/lib/site';

/**
 * Shared product description, drawn from README.md's "Why PromptCrafter?"
 * section (Generate → Refine → Version → Test and the no-account /
 * no-cloud-database positioning).
 */
export const SITE_DESCRIPTION =
  'PromptCrafter AI is a browser-based prompt engineering workbench. Describe what you want and it engineers a structured, role-aware AI prompt, then lets you refine it conversationally, version every change, and test it live against any model before you ship it. No accounts, no cloud database, no vendor lock-in — sessions and provider keys stay on your device.';

/**
 * SoftwareApplication structured data (schema.org), injected into the root
 * layout. featureList reflects the README Key Features plus the F1–F6
 * measurement-lab features shipped on this branch.
 */
export const SOFTWARE_APPLICATION_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'PromptCrafter AI',
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Prompt generation across 12+ domains, 14 tone presets, and 12 prompt frameworks',
    'Conversational refinement with the full message thread as context',
    'Versioned prompt threads with immutable versions, diff, rename, favorite, and rollback',
    'Prompt test sandbox that runs a prompt as a system instruction with streaming output',
    'Prompt quality scorecard: 0–100 score across six rubric dimensions with per-version fix suggestions',
    'Cross-model A/B lab that runs the same prompt and input across multiple providers side by side',
    'Prompt regression suite with per-case pass/fail and score tracking per version',
    'Placeholder linter and variable fill for consistent, ready-to-use prompts',
    'Multi-model export adapters for Claude, GPT, Gemini, Markdown, and JSON',
    'Prompt health monitor that flags score drift and model changes with one-click re-verify',
    'Bring-your-own-model support: built-in Gemini or any OpenAI-compatible provider',
    'Local-first storage with AES-GCM on-device encryption of provider API keys',
  ],
};
