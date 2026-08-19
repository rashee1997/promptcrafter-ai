// Video Prompt Studio — Stage 4: visual style candidates.
// Drafts 2–3 distinct look options (grade, stock, aspect) from the confirmed
// script + characters + Directorial Brief. One is locked at Stage 5 confirm.

import { z } from 'zod';
import type { ProviderConfig } from '@/types';
import type { VideoCharacter } from '@/types/video';
import { clip, runStructured, uid } from './shared';
import type { ScriptTreatment, StyleCandidate } from './types';

export const styleSchema = z.object({
  options: z
    .array(
      z.object({
        id: z.string().describe('Short stable id, e.g. "a", "b", "c"'),
        name: z.string().describe('Catchy style name, e.g. "Neon Noir"'),
        lookAndMood: z.string().describe('Look and mood: lighting, palette, emotional register'),
        colorGrade: z.string().describe('Color grade: contrast, saturation, dominant hues'),
        filmStock: z.string().describe('Film stock / sensor look, e.g. "Kodak 2383 print, halation"'),
        aspectRatio: z.string().describe('Aspect ratio, e.g. "16:9", "2.39:1", "9:16"'),
      })
    )
    .min(2)
    .max(3),
});

export type StyleOutput = z.infer<typeof styleSchema>;

export interface GenerateStyleArgs {
  provider: ProviderConfig;
  script?: ScriptTreatment | null;
  characters?: VideoCharacter[] | null;
  customInstructions?: string;
  revisionPrompt?: string;
  previous?: StyleCandidate[] | null;
}

const SYSTEM = `You are a director of photography pitching visual styles for a short-form video production. Each option must be a coherent, distinct look — never three shades of the same idea. Be specific enough that a colorist and a VFX team can lock it without further direction.`;

export async function generateStyle({
  provider,
  script,
  characters,
  customInstructions,
  revisionPrompt,
  previous,
}: GenerateStyleArgs): Promise<StyleCandidate[]> {
  const context = [
    customInstructions
      ? `DIRECTORIAL BRIEF: ${clip(customInstructions, 900)}`
      : null,
    script
      ? `CONFIRMED SCRIPT TREATMENT:\n${clip(JSON.stringify(script), 1600)}`
      : null,
    characters?.length
      ? `CAST:\n${clip(
          characters.map((c) => `${c.name} (${c.role}) — ${c.appearance}`).join('\n'),
          1200
        )}`
      : null,
    previous?.length
      ? `PREVIOUS STYLE OPTIONS (pitch fresh alternatives):\n${clip(JSON.stringify(previous), 1200)}`
      : null,
    revisionPrompt
      ? `REVISION NOTE FROM DIRECTOR: ${clip(revisionPrompt, 600)}`
      : null,
  ]
    .filter(Boolean)
    .join('\n\n');

  const prompt = `${context}\n\nPitch 2–3 distinct visual style options.`;

  const out = await runStructured({
    provider,
    schema: styleSchema,
    system: SYSTEM,
    prompt,
    temperature: 0.8,
  });

  const seen = new Set<string>();
  return out.options.slice(0, 3).map((o) => {
    const id = o.id.trim() || uid();
    const uniqueId = seen.has(id) ? uid() : id;
    seen.add(uniqueId);
    return {
      id: uniqueId,
      name: o.name.trim(),
      lookAndMood: o.lookAndMood.trim(),
      colorGrade: o.colorGrade.trim(),
      filmStock: o.filmStock.trim(),
      aspectRatio: o.aspectRatio.trim(),
    };
  });
}
