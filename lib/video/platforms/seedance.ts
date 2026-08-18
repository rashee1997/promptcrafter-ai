// Video Prompt Studio — Phase 3 platform knowledge base: Seedance 2.5.
// Single source of truth for the drafting AI and the Phase 2 picker UI.

import type { PlatformSpec } from '@/types/video';

export const seedance: PlatformSpec = {
  id: 'seedance',
  label: 'Seedance 2.5',
  vendor: 'ByteDance',
  summary:
    "ByteDance's video generation model — multi-shot capable, massive reference capacity, native audio, and up to 30-second single takes with 4K output.",
  strengths: [
    'Multi-shot support with flexible shot planning',
    'Up to 50 multimodal references (30 images, 10 video clips, 10 audio clips) per generation',
    'Native 30-second single takes — longest in class for single-pass generation',
    'Native audio with improved lip-sync',
    '4K-ready output quality',
    'Strong prompt adherence with 20% improvement over 2.0',
  ],
  durationCeilingSeconds: 30,
  supportsMultiShot: true,
  supportsNativeDialogue: true,
  dialogueSyntaxNote:
    'Use inline dialogue attribution: Character: "Line text" — Seedance parses speaker names directly from the prompt text.',
  negativePromptConvention: 'dedicated-field',
  referenceImageLimit: 50,
  usageInstructions: [
    'Can generate up to 30-second single takes — use longer durations for complex sequences',
    'Up to 50 multimodal references per generation — use them to lock characters, objects, and environments',
    'Seedance 2.0 struggles with human faces — route face-heavy close-ups to 2.5 for better fidelity',
    'Use reference frames for shot-to-shot continuity — Seedance links frame chains across multi-shot',
    'Negative prompts go in a dedicated field — use short, direct terms for best results',
    'Native audio means dialogue is generated inline — keep lines short enough for the shot duration',
  ],
  draftingSystemPromptBlock: `PLATFORM CONSTRAINTS — Seedance 2.5:
- Duration ceiling: 30 seconds per shot. Seedance 2.5 supports the longest single takes in the market — up to 30 seconds of continuous video per generation. Use this for complex action sequences or dialogue scenes that need room to breathe.
- Multi-shot: Seedance supports multi-shot sequences. Draft each shot individually for storyboard control, but note that longer durations reduce the need for rapid cutting.
- Dialogue format: use inline attribution — write "Character: Line text" directly in the prompt. Seedance parses speaker names from the prompt text and generates synced audio.
- Example dialogue line: Elena: "The door is locked." or Elena (urgent): "We need to move."
- Reference images: up to 50 multimodal references per generation (30 images, 10 video clips, 10 audio clips). This is the highest reference capacity of any platform — use it to lock character appearance, object identity, and environmental style.
- IMPORTANT: Seedance 2.0 struggles with human face quality. For face-heavy close-ups, flag the shot for 2.5 rendering. Write clear, specific face descriptions as a fallback.
- Negative prompts go in a dedicated field, never inline. Use 3–5 short terms ordered by damage severity.
- For silent shots, note explicitly: AUDIO — score + ambience bed; no dialogue this shot.`,
};
