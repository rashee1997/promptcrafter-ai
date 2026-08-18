// Video Prompt Studio — Phase 3 platform knowledge base: Luma Ray3.
// Single source of truth for the drafting AI and the Phase 2 picker UI.

import type { PlatformSpec } from '@/types/video';

export const luma: PlatformSpec = {
  id: 'luma',
  label: 'Luma Ray3',
  vendor: 'Luma Labs',
  summary:
    "Luma's reasoning-driven video model — best physical realism and naturalistic motion. Excels at product shots, environmental footage, and keyframe-based interpolation.",
  strengths: [
    'Best physical realism — shadows, reflections, and material interaction are highly accurate',
    'Start and end keyframe support for precise interpolation between two images',
    'Character reference support (Ray3) for consistent identity across generations',
    'HDR output with expanded dynamic range for dramatic lighting',
    '6 aspect ratios including 21:9 ultrawide for cinematic letterbox',
    'Seamless loop support for product showcases and repeating content',
  ],
  durationCeilingSeconds: 10,
  supportsMultiShot: false,
  supportsNativeDialogue: false,
  dialogueSyntaxNote:
    'Luma Ray3 does not generate native dialogue or lip-sync. Write speech as visual action descriptions. For character-driven scenes, describe the character\'s expression and movement that conveys speech, then add audio in post.',
  negativePromptConvention: 'inline',
  referenceImageLimit: 2,
  usageInstructions: [
    'Keep every shot under 10 seconds — that\'s the ceiling for text-to-video and image-to-video',
    'Use start and end keyframes for precise transitions between two images',
    'Write mid-action verbs ("running") not temporal phrases ("begins to run") — Luma is a positive-only model',
    'Avoid words like "vibrant", "whimsical", "hyper-realistic" — they degrade output quality',
    'Character reference (Ray3) locks identity across generations — use it for multi-shot narratives',
    'HDR mode excels with dramatic lighting: sunsets, neon, fire, stage lighting',
  ],
  draftingSystemPromptBlock: `PLATFORM CONSTRAINTS — Luma Ray3:
- Duration ceiling: 10 seconds per shot. Every shot MUST be ≤ 10s. Luma generates one clip per generation — chain via continuity handoffs.
- No native dialogue or lip-sync. Write speech as visual action: "Elena's lips move as she speaks, her expression urgent." Audio must be added in post-production.
- Keyframe support: use start and end frames to precisely control the transition between two images. Describe only what CHANGES between keyframes — don't re-describe static elements.
- Reference images: up to 2 per generation. Character reference (Ray3) locks identity across generations — upload once, reference in every shot.
- Luma is a "positive only" model — write what you WANT, never what to avoid. Do not use negative prompt terms.
- Prompt style: use mid-action verbs ("running", "pouring", "spinning") not temporal phrases ("begins to run"). Keep prompts ~100 words, action-focused, present tense.
- BANNED words that degrade quality: "vibrant", "whimsical", "hyper-realistic", "beautiful", "amazing", "stunning". Use specific, concrete descriptors instead.
- For silent shots, describe the visual action without speech cues: movement, expression, and environment carry the beat.`,
};
