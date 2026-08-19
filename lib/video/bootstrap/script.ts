// Video Prompt Studio — Stage 1: script treatment (logline, act beats, tone).
// Turns the initial intent + Directorial Brief into a reviewable treatment.

import { z } from 'zod';
import type { ProviderConfig } from '@/types';
import { clip, runStructured } from './shared';
import type { ScriptTreatment } from './types';

export const scriptSchema = z.object({
  logline: z
    .string()
    .describe('One-sentence premise that hooks the audience'),
  actBeats: z
    .array(z.string())
    .length(3)
    .describe('Three act beats: setup, confrontation, resolution'),
  tone: z.string().describe('Narrative tone in 2–4 words'),
  overview: z
    .string()
    .describe('3–5 sentence overview of the story arc'),
});

export type ScriptOutput = z.infer<typeof scriptSchema>;

export interface GenerateScriptArgs {
  provider: ProviderConfig;
  intent: string;
  customInstructions?: string;
  revisionPrompt?: string;
  previous?: ScriptTreatment | null;
}

const SYSTEM = `You are a development executive drafting the script treatment for a short-form video production (30–90 seconds). You write for screen, not prose: every beat must be visual and shootable. Be specific — concrete places, objects, and actions beat vague adjectives. Stay ruthlessly on-brief and on-tone.`;

export async function generateScript({
  provider,
  intent,
  customInstructions,
  revisionPrompt,
  previous,
}: GenerateScriptArgs): Promise<ScriptTreatment> {
  const context = [
    `PROJECT INTENT: ${clip(intent, 600)}`,
    customInstructions
      ? `DIRECTORIAL BRIEF: ${clip(customInstructions, 1000)}`
      : null,
    previous ? `PREVIOUS TREATMENT (revise this, keep what works):\n${clip(JSON.stringify(previous), 1600)}` : null,
    revisionPrompt
      ? `REVISION NOTE FROM DIRECTOR: ${clip(revisionPrompt, 600)}`
      : null,
  ]
    .filter(Boolean)
    .join('\n\n');

  const prompt = `${context}\n\nDraft a tight script treatment: a logline, exactly three act beats, a short narrative tone, and a 3–5 sentence overview.`;

  const out = await runStructured({
    provider,
    schema: scriptSchema,
    system: SYSTEM,
    prompt,
    temperature: 0.7,
  });

  return {
    logline: out.logline.trim(),
    actBeats: out.actBeats.map((b) => b.trim()).slice(0, 3),
    tone: out.tone.trim(),
    overview: out.overview.trim(),
  };
}
