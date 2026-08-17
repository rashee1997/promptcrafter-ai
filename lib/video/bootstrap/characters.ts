// Video Prompt Studio — Stage 2: character extraction.
// Derives named characters from the confirmed script treatment with a fixed
// visual appearance so every downstream shot stays consistent.

import { z } from 'zod';
import type { ProviderConfig } from '@/types';
import type { VideoCharacter } from '@/types/video';
import { clip, runStructured, uid } from './shared';
import type { ScriptTreatment } from './types';

export const charactersSchema = z.object({
  characters: z
    .array(
      z.object({
        name: z.string().describe('Character name'),
        role: z.string().describe('Role in the story, e.g. "the getaway driver"'),
        appearance: z
          .string()
          .describe('Fixed visual appearance: age, build, face, hair, distinguishing marks'),
        wardrobe: z.string().describe('Fixed wardrobe: clothing, colors, textures, accessories'),
        voiceTone: z.string().describe('Voice/vocal tone for audio continuity'),
        narrativeDescription: z
          .string()
          .describe('Director-facing narrative description of the character in 1–2 sentences, for the story bible'),
        imagePrompt: z
          .string()
          .describe(
            'Copy-ready character-sheet image prompt for EXTERNAL image models in the exact structure: "[Subject details]. 360-degree character sheet turnaround: front view, side profile view, back view, and extreme face close-up. [Style]. Pure white background. Empty hands, no props. 4K resolution."'
          ),
      })
    )
    .min(1)
    .max(8),
});

export type CharactersOutput = z.infer<typeof charactersSchema>;

export interface GenerateCharactersArgs {
  provider: ProviderConfig;
  intent: string;
  script?: ScriptTreatment | null;
  customInstructions?: string;
  revisionPrompt?: string;
  previous?: VideoCharacter[] | null;
}

const SYSTEM = `You are a casting director for a short-form video production. You extract the people who must appear, then propose any missing supporting characters the script implies. Every character gets a FIXED visual appearance and wardrobe so the story bible can lock continuity — describe them the same way every time, as if writing a character sheet for a VFX team.

IMAGE PROMPT RULE — every character must also carry an \`imagePrompt\` for EXTERNAL image models (Midjourney, Imagen UI, …). Build it EXACTLY in this structure:
\"[Subject details]. 360-degree character sheet turnaround: front view, side profile view, back view, and extreme face close-up. [Style]. Pure white background. Empty hands, no props. 4K resolution.\"
The subject details name the character's locked appearance and wardrobe concretely; the style slot is the project's look direction (from the script treatment tone) in 2–4 words. The imagePrompt must be copy-paste ready — no labels, no JSON, just the prompt text.`;

export async function generateCharacters({
  provider,
  intent,
  script,
  customInstructions,
  revisionPrompt,
  previous,
}: GenerateCharactersArgs): Promise<VideoCharacter[]> {
  const context = [
    `PROJECT INTENT: ${clip(intent, 500)}`,
    customInstructions
      ? `DIRECTORIAL BRIEF: ${clip(customInstructions, 800)}`
      : null,
    script
      ? `CONFIRMED SCRIPT TREATMENT:\n${clip(JSON.stringify(script), 2000)}`
      : null,
    previous
      ? `PREVIOUS CHARACTERS (revise these, keep continuity):\n${clip(JSON.stringify(previous), 1600)}`
      : null,
    revisionPrompt
      ? `REVISION NOTE FROM DIRECTOR: ${clip(revisionPrompt, 600)}`
      : null,
  ]
    .filter(Boolean)
    .join('\n\n');

  const prompt = `${context}\n\nExtract and propose 2–6 characters with fixed appearance, wardrobe, and voice notes.`;

  const out = await runStructured({
    provider,
    schema: charactersSchema,
    system: SYSTEM,
    prompt,
    temperature: 0.7,
  });

  return out.characters.map((c) => ({
    id: uid(),
    name: c.name.trim(),
    role: c.role.trim(),
    appearance: c.appearance.trim(),
    wardrobe: c.wardrobe.trim(),
    voiceTone: c.voiceTone.trim(),
    narrativeDescription: c.narrativeDescription?.trim() ?? '',
    imagePrompt: c.imagePrompt?.trim() ?? '',
  }));
}
