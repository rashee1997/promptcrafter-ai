// Video Prompt Studio — Phase 3 platform knowledge base: Veo 3.1 / Flow.
// Single source of truth for the drafting AI and the Phase 2 picker UI.

import type { PlatformSpec } from '@/types/video';

export const veo: PlatformSpec = {
  id: 'veo',
  label: 'Veo 3.1 / Flow',
  vendor: 'Google DeepMind',
  summary:
    "Google's flagship video generation model — cinematic 4K quality, strong physics, native audio, and a workflow designed for structured ingredient-based prompting.",
  strengths: [
    'Cinematic 4K output with strong real-world physics',
    'Native audio generation (dialogue, ambience, score)',
    'Ingredient-based prompting via [Subject], [Action], [Camera] tags',
    'Flow workflow for structured, repeatable generation',
    'Up to 3 reference images per generation for character/object anchoring',
  ],
  durationCeilingSeconds: 8,
  supportsMultiShot: false,
  supportsNativeDialogue: true,
  dialogueSyntaxNote:
    'Use colon format: "Speaker says: line" — no quotes around the line text. Colons avoid Veo\'s baked-in subtitle failure mode. Never use bracket dialogue syntax.',
  negativePromptConvention: 'dedicated-field',
  referenceImageLimit: 3,
  usageInstructions: [
    'Keep every shot under 8 seconds — that\'s the hard ceiling per generation',
    'Use colon-style dialogue ("Speaker says: line") to avoid fake subtitles',
    'Structure prompts with ingredient tags: [Subject], [Action], [Camera], etc.',
    'Up to 3 reference images per generation — use them to anchor characters or products',
    'No true multi-shot in a single generation — draft one shot at a time, chain via continuity',
  ],
  draftingSystemPromptBlock: `PLATFORM CONSTRAINTS — Veo 3.1 / Flow:
- Duration ceiling: 8 seconds per shot. Every shot MUST be ≤ 8s. There is no multi-shot mode — each generation produces exactly one clip.
- Dialogue format: use COLON syntax, never brackets. Write dialogue as "Speaker says: Line text" — the colon form avoids Veo's baked-in subtitle failure mode. Do NOT wrap lines in quotes.
- Example dialogue line: "Elena says: The door is locked." NOT [Character: Elena]: "The door is locked."
- Reference images: up to 3 per generation. Use them to anchor character appearance or product identity; the model locks visual traits from reference more reliably than from text description.
- Negative prompts go in the dedicated [Negative:] tag, never inline in the action or subject sections.
- For silent shots, include an explicit audio cue: [Audio: ambience + score, no dialogue this shot].`,
};
