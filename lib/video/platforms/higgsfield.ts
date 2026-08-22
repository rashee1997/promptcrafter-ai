// Video Prompt Studio — Phase 3 platform knowledge base: Higgsfield.
// Single source of truth for the drafting AI and the Phase 2 picker UI.
// Higgsfield is a routing layer — its actual limits depend on the
// underlying model selected in Phase 2, Step 3.

import type { PlatformSpec } from '@/types/video';

export const higgsfield: PlatformSpec = {
  id: 'higgsfield',
  label: 'Higgsfield',
  vendor: 'Higgsfield AI',
  summary:
    'Routing layer over multiple video models with Soul ID (character-lock) and Cinema Studio (camera-control). Actual limits depend on the underlying model.',
  strengths: [
    'Soul ID: persistent character-lock across generations — upload once, use everywhere',
    'Cinema Studio: 6 camera bodies, 11 lenses, 15+ director-style movements, 4K output',
    'Routes to the best underlying model for each shot (Veo, Kling, or Seedance)',
    'Character consistency that survives across separate generations',
    'Fine-grained camera control via Cinema Studio parameter system',
  ],
  durationCeilingSeconds: 30,
  supportsMultiShot: false,
  supportsNativeDialogue: false,
  nativeDialogueAudio: false,
  dialogueSyntaxNote:
    'Dialogue support depends on the underlying model. Use narrative prose for the prompt; the Soul ID engine binds character identity, and the underlying model handles audio generation if supported.',
  negativePromptConvention: 'dedicated-field',
  referenceImageLimit: 4,
  usageInstructions: [
    'Higgsfield is a routing layer — pick the underlying model (Veo, Kling, or Seedance) in project setup',
    'Soul ID locks character identity across generations — upload a reference image once per character',
    'Cinema Studio gives precise camera control: specify body, lens, and movement per shot',
    'Duration and dialogue limits depend on the underlying model — check its constraints',
    'Best for character-driven narratives where consistency across shots is critical',
    'Use Soul ID references sparingly — too many locked characters in one shot can cause blending artifacts',
  ],
  draftingSystemPromptBlock: `PLATFORM CONSTRAINTS — Higgsfield (routing layer):
- Higgsfield is a routing layer — actual duration, dialogue, and multi-shot limits depend on the underlying model (Veo, Kling, or Seedance). Apply that model's constraints from its own platform spec.
- Soul ID: upload a character reference image once, and Higgsfield locks that character's appearance across all generations. Write character descriptions that complement (not duplicate) the reference image.
- Cinema Studio: specify camera parameters directly — body (ARRI Alexa, RED, etc.), lens (35mm, 50mm, 85mm, anamorphic), and movement (dolly, pan, tilt, crane, handheld, etc.). This replaces generic camera language with precise filmmaking terms.
- When drafting for Higgsfield, write the prompt as narrative prose — the Soul ID engine handles character binding, and Cinema Studio handles camera control.
- Negative prompts go in the dedicated field. Use short, direct terms.
- For silent shots, use the underlying model's convention for audio cues.`,
};
