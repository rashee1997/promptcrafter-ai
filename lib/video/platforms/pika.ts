// Video Prompt Studio — Phase 3 platform knowledge base: Pika 2.5.
// Single source of truth for the drafting AI and the Phase 2 picker UI.

import type { PlatformSpec } from '@/types/video';

export const pika: PlatformSpec = {
  id: 'pika',
  label: 'Pika 2.5',
  vendor: 'Pika Labs',
  summary:
    "Pika's upgraded video engine — best for stylized and social content with precise start/end frame control via Pikaframes. Fast iteration at accessible pricing.",
  strengths: [
    'Pikaframes: precise start and end frame control for exact transitions',
    'Pikaffects: physics-based object transformations for creative effects',
    'Strong stylized and social content aesthetic',
    'Fast generation speed — good for rapid iteration cycles',
    'Improved physics and camera motion over Pika 2.0',
    'Pikaswaps and Pikadditions for element replacement and character insertion',
  ],
  durationCeilingSeconds: 10,
  supportsMultiShot: false,
  supportsNativeDialogue: false,
  nativeDialogueAudio: false,
  dialogueSyntaxNote:
    'Pika 2.5 does not generate native dialogue or lip-sync. Write speech as visual action descriptions. For talking-head content, use Pikaformance (talking face model) separately, then add audio.',
  negativePromptConvention: 'inline',
  referenceImageLimit: 2,
  usageInstructions: [
    'Keep every shot under 10 seconds — that\'s the hard ceiling per generation',
    'Use Pikaframes for precise start/end frame control — define exact first and last frames',
    'Best for stylized and social media content — not designed for photorealistic narrative work',
    'No native audio — add sound effects, music, and voiceover in post-production',
    'Use specific camera motion language: "slow push in", "gentle arc left", "steady tracking"',
    'Pikaffects for creative transformations; Pikaswaps for replacing elements in existing footage',
  ],
  draftingSystemPromptBlock: `PLATFORM CONSTRAINTS — Pika 2.5:
- Duration ceiling: 10 seconds per shot. Every shot MUST be ≤ 10s. Pika generates one clip per generation.
- No native dialogue or lip-sync. Write speech as visual action: "Character's mouth moves as they speak." Audio must be added in post-production.
- Pikaframes: define exact start and end frames for precise transitions. Describe the MOTION between frames, not the static content of each frame — the model interpolates.
- Reference images: up to 2 per generation. Use them as start/end frames for Pikaframes transitions.
- Pika is optimized for stylized and social content — lean into creative, expressive prompts rather than photorealistic descriptions.
- Camera motion: use specific language — "slow push in", "gentle arc left", "steady tracking shot". Pika 2.5 responds well to precise camera direction.
- For silent shots, describe the visual action without speech cues: movement, expression, and environment carry the beat.
- Negative prompts: phrase as action direction rather than term lists — "avoid rapid cuts" rather than listing negative terms.`,
};
