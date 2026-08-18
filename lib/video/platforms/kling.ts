// Video Prompt Studio — Phase 3 platform knowledge base: Kling 3.0.
// Single source of truth for the drafting AI and the Phase 2 picker UI.

import type { PlatformSpec } from '@/types/video';

export const kling: PlatformSpec = {
  id: 'kling',
  label: 'Kling 3.0',
  vendor: 'Kuaishou',
  summary:
    'Strong physics and character animation, multi-shot in one generation, native dialogue and lip-sync across 5 languages.',
  strengths: [
    'Realistic motion and character animation with strong physics grounding',
    'Up to 6 shots in one generation (custom multi-shot mode)',
    'Dedicated negative-prompt field (Negative Semantic Mapping)',
    'Native dialogue + lip-sync with multi-character coreference (3+ characters)',
    'Multilingual support: Chinese, English, Japanese, Korean, Spanish — with dialects and accents',
    'Flexible duration from 3 to 15 seconds per generation',
    'Native 4K resolution output',
  ],
  durationCeilingSeconds: 15,
  supportsMultiShot: true,
  supportsNativeDialogue: true,
  dialogueSyntaxNote:
    'Use Kling\'s native bracket format: [Character: role, tone]: "Line" — bind each line to an exact Story Bible character name for correct lip-sync assignment.',
  negativePromptConvention: 'dedicated-field',
  referenceImageLimit: 4,
  usageInstructions: [
    'Keep individual shots under 15 seconds — that\'s the hard ceiling per generation',
    'Use custom multi-shot mode for sequences up to 6 shots in one generation',
    'Don\'t overload with more than 4 reference elements — hands and faces tend to melt beyond that',
    'Negative prompts work best as short direct terms in the dedicated field, not soft phrasing',
    'Tag speakers explicitly with their dialogue lines to avoid voice misattribution in multi-character scenes',
    'Element references lock character appearance across shots — use them for continuity',
  ],
  draftingSystemPromptBlock: `PLATFORM CONSTRAINTS — Kling 3.0:
- Duration ceiling: 15 seconds per shot. Every shot MUST be ≤ 15s. Kling supports custom multi-shot (up to 6 shots in one generation), but our drafting flow creates one shot at a time for storyboard control.
- Dialogue format: Kling uses its native bracket syntax. Write dialogue as [Character: role, tone]: "Line text". Bind each line to the EXACT Story Bible character name so the lip-sync engine assigns voice to the correct face.
- Example dialogue line: [Character: protagonist, urgent whisper]: "We need to move. Now."
- Reference images: up to 4 per generation. Use element references to lock character appearance — the model maintains consistency across shots when references are anchored.
- Negative prompts go in Kling's dedicated Negative Semantic Mapping field, never inline. Use 3–5 short, direct terms ordered by damage severity.
- Kling supports multi-character coreference (3+ characters) and multilingual code-switching within a single scene.
- For silent shots, state clearly: VOICE BINDING — no dialogue in this shot; ambience and score carry the beat across cuts.`,
};
