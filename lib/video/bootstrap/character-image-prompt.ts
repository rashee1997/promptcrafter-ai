// Video Prompt Studio — single-character image-prompt regeneration (D2).
// Re-rolls ONE character's copy-ready character-sheet prompt via AI, scoped to
// that character + an optional director revision note ("more weathered",
// "different hairstyle"). Mirrors the imagePrompt structure rule embedded in
// characters.ts's SYSTEM string so the output stays paste-ready for external
// image models.

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
