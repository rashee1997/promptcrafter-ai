// Video Prompt Studio — shared location scouting engine (Rule 3).
// Serves BOTH the bootstrap Stage 3 step AND ad-hoc "+ Add Location" requests
// via /api/suggest-video-location. Parameterized so generation stays DRY.

import { z } from 'zod';
import type { ProviderConfig } from '@/types';
import type { VideoLocation } from '@/types/video';
import { clip, runStructured, uid } from './shared';
import type { ScriptTreatment, StyleCandidate } from './types';

export const scenesSchema = z.object({
  locations: z
    .array(
      z.object({
        name: z.string().describe('Location name, specific and evocative'),
        description: z
          .string()
          .describe('Fixed environment description: place, light, texture, practical set dressing'),
      })
    )
    .min(1)
    .max(8),
});

export type ScenesOutput = z.infer<typeof scenesSchema>;

export interface SuggestScenesArgs {
  provider: ProviderConfig;
  intent: string;
  script?: ScriptTreatment | null;
  style?: StyleCandidate | null;
  existingLocations?: VideoLocation[] | null;
  revisionPrompt?: string;
}

const SYSTEM = `You are a location scout for a short-form video production. Propose distinctive, actually shootable locations — real places with specific light, texture, and practical set dressing a VFX team can lock in. Never invent street addresses; describe the environment so it stays visually consistent across shots.`;

export async function suggestScenes({
  provider,
  intent,
  script,
  style,
  existingLocations,
  revisionPrompt,
}: SuggestScenesArgs): Promise<VideoLocation[]> {
  const existing = existingLocations?.length
    ? existingLocations.map((l) => l.name).join(', ')
    : null;

  const context = [
    `PROJECT INTENT: ${clip(intent, 500)}`,
    script ? `SCRIPT TREATMENT:\n${clip(JSON.stringify(script), 1800)}` : null,
    style
      ? `VISUAL STYLE: ${clip(style.name, 120)} — ${clip(style.lookAndMood, 400)}`
      : null,
    existing
      ? `ALREADY SCOUTED (do not repeat these): ${existing}`
      : null,
    revisionPrompt
      ? `SCOUTING NOTE FROM DIRECTOR: ${clip(revisionPrompt, 600)}`
      : null,
  ]
    .filter(Boolean)
    .join('\n\n');

  const prompt = `${context}\n\nScout 3–6 candidate locations with fixed environment descriptions.`;

  const out = await runStructured({
    provider,
    schema: scenesSchema,
    system: SYSTEM,
    prompt,
    temperature: 0.7,
  });

  return out.locations.map((l) => ({
    id: uid(),
    name: l.name.trim(),
    description: l.description.trim(),
  }));
}
