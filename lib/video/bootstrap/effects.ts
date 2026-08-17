// Video Prompt Studio — Stage 5: VFX direction candidates.
// Drafts 2–3 VFX treatment options grounded in the confirmed visual style.
// Selecting one here locks the VFX direction for downstream shot drafting.

import { z } from 'zod';
import type { ProviderConfig } from '@/types';
import { clip, runStructured, uid } from './shared';
import type { ScriptTreatment, StyleCandidate, EffectsCandidate } from './types';

export const effectsSchema = z.object({
  options: z
    .array(
      z.object({
        id: z.string().describe('Short stable id, e.g. "a", "b", "c"'),
        name: z.string().describe('Catchy VFX direction name, e.g. "Particle Storm"'),
        vfxDirection: z
          .string()
          .describe('Practical vs CGI split and the signature VFX beats'),
        particleDensity: z
          .string()
          .describe('Particle/simulation density and complexity'),
        pacing: z.string().describe('VFX pacing relative to the edit, e.g. "slow burn, one burst per beat"'),
      })
    )
    .min(2)
    .max(3),
});

export type EffectsOutput = z.infer<typeof effectsSchema>;

export interface GenerateEffectsArgs {
  provider: ProviderConfig;
  script?: ScriptTreatment | null;
  style?: StyleCandidate | null;
  revisionPrompt?: string;
  previous?: EffectsCandidate[] | null;
}

const SYSTEM = `You are a VFX supervisor pitching effects treatments for a short-form video production. Each option must be a coherent, distinct direction — practical beats done in-camera, CGI reserved for the impossible. Keep particle work and pacing specific enough to budget against.`;

export async function generateEffects({
  provider,
  script,
  style,
  revisionPrompt,
  previous,
}: GenerateEffectsArgs): Promise<EffectsCandidate[]> {
  const context = [
    script
      ? `CONFIRMED SCRIPT TREATMENT:\n${clip(JSON.stringify(script), 1400)}`
      : null,
    style
      ? `LOCKED VISUAL STYLE: ${clip(style.name, 120)} — ${clip(style.lookAndMood, 400)}`
      : null,
    previous?.length
      ? `PREVIOUS VFX OPTIONS (pitch fresh alternatives):\n${clip(JSON.stringify(previous), 1200)}`
      : null,
    revisionPrompt
      ? `REVISION NOTE FROM DIRECTOR: ${clip(revisionPrompt, 600)}`
      : null,
  ]
    .filter(Boolean)
    .join('\n\n');

  const prompt = `${context}\n\nPitch 2–3 distinct VFX direction options.`;

  const out = await runStructured({
    provider,
    schema: effectsSchema,
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
      vfxDirection: o.vfxDirection.trim(),
      particleDensity: o.particleDensity.trim(),
      pacing: o.pacing.trim(),
    };
  });
}
