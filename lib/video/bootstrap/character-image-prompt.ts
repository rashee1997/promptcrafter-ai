// Video Prompt Studio — single-character image-prompt regeneration (D2).
// Re-rolls ONE character's copy-ready character-sheet prompt via AI, scoped to
// that character + an optional director revision note ("more weathered",
// "different hairstyle"). Mirrors the imagePrompt structure rule embedded in
// characters.ts's SYSTEM string so the output stays paste-ready for external
// image models.
//
// Phase 6 — animation pose/expression set generation for illustrated-style
// character consistency. For animation projects, generates a small set of
// 3–4 pose/expression variants instead of a single static portrait.

import { z } from 'zod';
import type { ProviderConfig } from '@/types';
import type { VideoCharacter } from '@/types/video';
import { clip, runStructured } from './shared';

export const characterImagePromptSchema = z.object({
  imagePrompt: z
    .string()
    .describe(
      'Copy-ready character-sheet image prompt for EXTERNAL image models in the exact structure: "[Subject details]. 360-degree character sheet turnaround: front view, side profile view, back view, and extreme face close-up. [Style]. Pure white background. Empty hands, no props. 4K resolution."'
    ),
});

export interface RegenerateCharacterImagePromptArgs {
  provider: ProviderConfig;
  character: VideoCharacter;
  /** Optional director direction, e.g. "more weathered", "different hairstyle". */
  revisionNote?: string;
  /** The project's look direction (2–4 words) for the [Style] slot. */
  styleContext?: string;
}

const SYSTEM = `You are a character designer writing image prompts for EXTERNAL image models (Midjourney, Imagen UI, …). You write EXACTLY in this structure:
"[Subject details]. 360-degree character sheet turnaround: front view, side profile view, back view, and extreme face close-up. [Style]. Pure white background. Empty hands, no props. 4K resolution."
The subject details name the character's locked appearance and wardrobe concretely; the style slot is the project's look direction in 2–4 words. The imagePrompt must be copy-paste ready — no labels, no JSON, just the prompt text.`;

export async function regenerateCharacterImagePrompt({
  provider,
  character,
  revisionNote,
  styleContext,
}: RegenerateCharacterImagePromptArgs): Promise<string> {
  const context = [
    `CHARACTER: ${clip(character.name, 120)} — ${clip(character.role, 160)}`,
    `LOCKED APPEARANCE: ${clip(character.appearance, 400)}`,
    `LOCKED WARDROBE: ${clip(character.wardrobe, 400)}`,
    styleContext ? `PROJECT STYLE: ${clip(styleContext, 200)}` : null,
    character.imagePrompt
      ? `CURRENT IMAGE PROMPT (revise this, keep what works):\n${clip(character.imagePrompt, 900)}`
      : null,
    revisionNote
      ? `REVISION NOTE FROM DIRECTOR: ${clip(revisionNote, 400)}`
      : null,
  ]
    .filter(Boolean)
    .join('\n\n');

  const prompt = `${context}\n\nWrite the character-sheet image prompt for this single character.`;

  const out = await runStructured({
    provider,
    schema: characterImagePromptSchema,
    system: SYSTEM,
    prompt,
    temperature: 0.7,
  });

  return out.imagePrompt.trim();
}

// ── Phase 6 — animation pose/expression set ────────────────────────────────

/** One pose/expression variant in an animation character consistency set. */
export interface AnimationPoseVariant {
  /** Short label for the pose/expression (e.g. "Determined — clenched fist"). */
  label: string;
  /** The full image prompt for this specific pose/expression. */
  imagePrompt: string;
}

/** Zod schema for the animation pose/expression set output. */
const animationPoseSetSchema = z.object({
  poses: z
    .array(
      z.object({
        label: z.string().describe('Short label for the pose/expression'),
        imagePrompt: z
          .string()
          .describe('Full image prompt for this specific pose/expression, maintaining the same character identity and style'),
      })
    )
    .min(3)
    .max(4)
    .describe('3–4 pose/expression variants for animation character consistency'),
});

const ANIMATION_POSE_SYSTEM = `You are a character designer creating a POSE AND EXPRESSION SET for an animated character. Instead of a single static portrait, you generate 3–4 distinct pose/expression variants that capture the character's full performance range — so the animation can stay consistent across different emotional beats and physical actions.

Each variant must:
1. Keep the SAME character identity (face, build, hair, wardrobe) locked across all poses.
2. Show a DISTINCT pose and/or facial expression — not just a slightly different angle of the same neutral face.
3. Be useful for different shot types: one neutral/establishing, one intense/emotional, one dynamic/active, and optionally one comedic/exaggerated.
4. Each imagePrompt must be copy-paste ready for external image models (Midjourney, Imagen UI, etc.).
5. Match the project's animation style vocabulary.

Variety is the goal — a single portrait cannot anchor an entire animated performance. These variants give the director a toolkit for matching expression to shot function.`;

export interface GenerateAnimationPoseSetArgs {
  provider: ProviderConfig;
  character: VideoCharacter;
  /** The project's look direction (2–4 words) for the [Style] slot. */
  styleContext?: string;
  /** The animation vocabulary profile (e.g. 'anime', 'pixar-3d', 'claymation'). */
  animationStyle?: string;
}

/**
 * Phase 6 — generates a set of 3–4 pose/expression variants for an animated
 * character. Called when the project uses an animation family style, replacing
 * the single static portrait with a performance-range toolkit.
 */
export async function generateAnimationPoseSet({
  provider,
  character,
  styleContext,
  animationStyle,
}: GenerateAnimationPoseSetArgs): Promise<AnimationPoseVariant[]> {
  const context = [
    `CHARACTER: ${clip(character.name, 120)} — ${clip(character.role, 160)}`,
    `LOCKED APPEARANCE: ${clip(character.appearance, 400)}`,
    `LOCKED WARDROBE: ${clip(character.wardrobe, 400)}`,
    styleContext ? `PROJECT STYLE: ${clip(styleContext, 200)}` : null,
    animationStyle ? `ANIMATION STYLE: ${animationStyle}` : null,
    character.imagePrompt
      ? `BASE CHARACTER SHEET PROMPT (maintain this identity):\n${clip(character.imagePrompt, 900)}`
      : null,
  ]
    .filter(Boolean)
    .join('\n\n');

  const prompt = `${context}\n\nGenerate 3–4 pose/expression variants for this animated character. Each variant should capture a different performance range: neutral/establishing, intense/emotional, dynamic/active, and optionally comedic/exaggerated. Keep the character identity locked across all poses.`;

  const out = await runStructured({
    provider,
    schema: animationPoseSetSchema,
    system: ANIMATION_POSE_SYSTEM,
    prompt,
    temperature: 0.7,
  });

  return out.poses.map((p) => ({
    label: p.label.trim(),
    imagePrompt: p.imagePrompt.trim(),
  }));
}
