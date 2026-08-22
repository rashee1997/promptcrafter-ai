// Video Prompt Studio — Stage 3: screenplay scenes with sluglines.
// Scene numbers are permanent identifiers — every later document references them.

import { z } from 'zod';
import type { ProviderConfig } from '@/types';
import { clip, runStructured } from './shared';
import type { StoryTreatment, ScriptDialogueDraft, ScreenplayScene } from './types';

export const screenplaySchema = z.object({
  scenes: z
    .array(
      z.object({
        sceneNumber: z.number().int().positive().describe('Scene number — must match the dialogue draft'),
        slugline: z
          .string()
          .describe('Standard slugline, e.g. "INT. ROOFTOP BAR — NIGHT"'),
        interiorExterior: z.enum(['INT', 'EXT']).describe('INT or EXT'),
        timeOfDay: z.string().describe('Time of day: morning, afternoon, evening, night, dawn, dusk'),
        presentCharacterIds: z
          .array(z.string())
          .describe('Character names present in this scene (exact names from the treatment)'),
        action: z
          .string()
          .describe('Prose action description — what happens in this scene, no camera language'),
        dialogueRefs: z
          .array(z.number().int().positive())
          .describe('Index(es) into the ScriptDialogueDraft.scenes array for dialogue in this scene'),
        estimatedShots: z
          .number()
          .int()
          .min(1)
          .max(8)
          .describe('Estimated number of shots for this scene (1–8)'),
      })
    )
    .min(1)
    .max(12),
});

export type ScreenplayOutput = z.infer<typeof screenplaySchema>;

export interface GenerateScreenplayArgs {
  provider: ProviderConfig;
  intent: string;
  storyTreatment: StoryTreatment | null;
  scriptDialogue: ScriptDialogueDraft | null;
  previous?: ScreenplayScene[] | null;
  revisionPrompt?: string;
}

const SYSTEM = `You are a script supervisor formatting a screenplay for a short-form video production (30–90 seconds). You receive a story treatment and dialogue scenes, and you format them as a structured screenplay with proper sluglines, scene numbers, and location assignments. CRITICAL: Scene numbers are permanent identifiers — they never change and every later document (location assignment, shot list, continuity) references them. Keep the same scene structure from the dialogue draft. Estimate how many shots each scene needs (1–8). Never invent new scenes — only reformat what the dialogue draft provides.`;

export async function generateScreenplay({
  provider,
  intent,
  storyTreatment,
  scriptDialogue,
  previous,
  revisionPrompt,
}: GenerateScreenplayArgs): Promise<ScreenplayScene[]> {
  const context = [
    `PROJECT INTENT: ${clip(intent, 600)}`,
    storyTreatment
      ? `STORY TREATMENT:\nLogline: ${storyTreatment.logline}\nPremise: ${clip(storyTreatment.premise, 600)}\nActs: ${storyTreatment.acts.map((a) => `Act ${a.act} (${a.title}): ${a.beats.map((b) => typeof b === 'string' ? b : b.text).join('; ')}`).join('\n')}`
      : null,
    scriptDialogue
      ? `DIALOGUE DRAFT (${scriptDialogue.scenes.length} scenes):\n${clip(JSON.stringify(scriptDialogue.scenes.map((s) => ({ n: s.sceneNumber, goal: s.sceneGoal, lines: s.exchanges.map((e) => `${e.speaker}: ${e.line}`) }))), 2000)}`
      : null,
    previous?.length
      ? `PREVIOUS SCREENPLAY (revise, keep scene numbers stable):\n${clip(JSON.stringify(previous.map((s) => ({ n: s.sceneNumber, slug: s.slugline, ie: s.interiorExterior }))), 1200)}`
      : null,
    revisionPrompt
      ? `REVISION NOTE FROM DIRECTOR: ${clip(revisionPrompt, 600)}`
      : null,
  ]
    .filter(Boolean)
    .join('\n\n');

  const prompt = `${context}\n\nFormat the screenplay with sluglines, scene numbers, and estimated shot counts.`;

  const out = await runStructured({
    provider,
    schema: screenplaySchema,
    system: SYSTEM,
    prompt,
    temperature: 0.5,
  });

  return out.scenes.map((s) => ({
    sceneNumber: s.sceneNumber,
    slugline: s.slugline.trim(),
    interiorExterior: s.interiorExterior,
    timeOfDay: s.timeOfDay.trim(),
    presentCharacterIds: s.presentCharacterIds.map((c) => c.trim()),
    action: s.action.trim(),
    dialogueRefs: s.dialogueRefs,
    estimatedShots: s.estimatedShots,
  }));
}
