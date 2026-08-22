// Video Prompt Studio — Phase 3 platform knowledge base: Runway Gen-4.5.
// Single source of truth for the drafting AI and the Phase 2 picker UI.

import type { PlatformSpec } from '@/types/video';

export const runway: PlatformSpec = {
  id: 'runway',
  label: 'Runway Gen-4.5',
  vendor: 'Runway',
  summary:
    "Runway's most advanced model — best-in-class world consistency (characters and objects stay coherent across cuts) with a built-in editor for assembling multi-shot sequences.",
  strengths: [
    'Best world consistency — characters, objects, and environments stay coherent across cuts',
    'Built-in editor for assembling multi-shot sequences from individual generations',
    'Precise camera control with prompt-responsive motion',
    'Turbo mode for fast iteration at slightly lower quality',
    'Strong character reference anchoring via reference images',
    'Integrated production workflow — generate, edit, and assemble in one platform',
  ],
  durationCeilingSeconds: 10,
  supportsMultiShot: false,
  supportsNativeDialogue: false,
  nativeDialogueAudio: false,
  dialogueSyntaxNote:
    'Runway Gen-4.5 does not generate native dialogue or lip-sync. Write dialogue as narrative action descriptions: "Character speaks, delivering the line with urgency." For audio, add voiceover in post-production.',
  negativePromptConvention: 'inline',
  referenceImageLimit: 3,
  usageInstructions: [
    'Keep every shot under 10 seconds — that\'s the hard ceiling per generation',
    'No native dialogue — write speech as narrative action, add audio in post',
    'Use reference images to anchor character appearance across generations',
    'World consistency is the strength — characters and objects stay coherent across cuts',
    'Chain clips in Runway\'s built-in editor for multi-shot sequences',
    'Turbo mode trades some quality for speed — good for iteration, not finals',
  ],
  draftingSystemPromptBlock: `PLATFORM CONSTRAINTS — Runway Gen-4.5:
- Duration ceiling: 10 seconds per shot. Every shot MUST be ≤ 10s. Runway generates one clip per generation — chain clips via the built-in editor for multi-shot sequences.
- No native dialogue or lip-sync. Write spoken lines as narrative action: "Elena speaks, her voice tight with urgency: We need to move." Audio must be added in post-production.
- Reference images: up to 3 per generation. Use them to anchor character appearance — Runway's world consistency engine maintains coherence across cuts when references are consistent.
- Negative prompts: Runway uses inline prompt language rather than a dedicated negative field. Phrase avoidance as action direction: "Avoid rapid cuts" rather than listing negative terms.
- Runway's strength is world consistency — characters and objects remain visually stable across multiple generations. Lean into this for narrative sequences.
- For silent shots, describe the visual action without dialogue cues: pure movement, expression, and environment carry the beat.`,
};
