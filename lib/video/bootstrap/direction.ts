// Video Prompt Studio — Stage 4: direction plan.
// This is the ONLY stage allowed to specify camera, lens, movement, grade, and sound.

import { z } from 'zod';
import type { ProviderConfig } from '@/types';
import { clip, runStructured } from './shared';
import type {
  StoryTreatment,
  ScriptDialogueDraft,
  ScreenplayScene,
  DirectionPlan,
} from './types';

export const directionSchema = z.object({
  cameraLanguage: z
    .string()
    .describe('Overall camera approach: e.g. "handheld intimacy with occasional locked precision"'),
  lensPhilosophy: z
    .string()
    .describe('Lens strategy: e.g. "predominantly 35mm with 85mm for close-ups"'),
  colourPalette: z
    .string()
    .describe('Colour palette and grade: e.g. "desaturated cool tones with warm amber accents"'),
  lightingApproach: z
    .string()
    .describe('Lighting design: e.g. "practical sources, motivated window light, minimal fill"'),
  soundDesign: z
    .string()
    .describe('Sound design direction: e.g. "ambient textures with isolated foley, minimal score"'),
  visualMotif: z
    .string()
    .describe('A recurring visual motif: e.g. "reflections in glass and water"'),
  pacingRhythm: z
    .string()
    .describe('Pacing strategy: e.g. "slow build in Act I, accelerating through Act II to a breathless climax"'),
  perSceneNotes: z
    .array(
      z.object({
        sceneNumber: z.number().int().positive().describe('Must match a scene from the screenplay'),
        approach: z.string().describe('Scene-specific shooting direction'),
        shotFunction: z
          .string()
          .describe('Dramatic function: Establish / Reveal / Power / Pressure / Detail / Reaction / Shift / Impact / Aftermath / Exit'),
      })
    )
    .min(1),
});

export type DirectionOutput = z.infer<typeof directionSchema>;

export interface GenerateDirectionArgs {
  provider: ProviderConfig;
  intent: string;
  screenplay: ScreenplayScene[] | null;
  scriptDialogue: ScriptDialogueDraft | null;
  storyTreatment: StoryTreatment | null;
  previous?: DirectionPlan | null;
  revisionPrompt?: string;
}

const SYSTEM = `You are a director of photography and film director planning HOW to shoot a short-form video production (30–90 seconds). You receive the full screenplay, dialogue, and story treatment. Your job is to decide camera language, lens choices, colour palette, lighting, sound design, visual motifs, and pacing — and to give each scene specific shooting direction. CRITICAL: You are the ONLY stage that specifies camera, lens, movement, grade, lighting, and sound. The earlier stages deliberately excluded camera language. Make your choices specific and concrete — a DP and gaffer should be able to lock it without asking questions. Reference scene numbers from the screenplay.`;

export async function generateDirectionPlan({
  provider,
  intent,
  screenplay,
  scriptDialogue,
  storyTreatment,
  previous,
  revisionPrompt,
}: GenerateDirectionArgs): Promise<DirectionPlan> {
  const context = [
    `PROJECT INTENT: ${clip(intent, 600)}`,
    storyTreatment
      ? `STORY TREATMENT:\nLogline: ${storyTreatment.logline}\nEmotional arc: ${storyTreatment.emotionalArc}\nTheme: ${storyTreatment.theme}`
      : null,
    scriptDialogue?.scenes?.length
      ? `DIALOGUE (${scriptDialogue.scenes.length} scenes):\n${clip(JSON.stringify(scriptDialogue.scenes.map((s) => ({ n: s.sceneNumber, goal: s.sceneGoal }))), 800)}`
      : null,
    screenplay?.length
      ? `SCREENPLAY (${screenplay.length} scenes):\n${clip(JSON.stringify(screenplay.map((s) => ({ n: s.sceneNumber, slug: s.slugline, ie: s.interiorExterior, shots: s.estimatedShots, action: clip(s.action, 120) }))), 2000)}`
      : null,
    previous
      ? `PREVIOUS DIRECTION PLAN (revise this, keep what works):\n${clip(JSON.stringify(previous), 1600)}`
      : null,
    revisionPrompt
      ? `REVISION NOTE FROM DIRECTOR: ${clip(revisionPrompt, 600)}`
      : null,
  ]
    .filter(Boolean)
    .join('\n\n');

  const prompt = `${context}\n\nDesign the complete direction plan: camera language, lens philosophy, colour palette, lighting, sound design, visual motif, pacing, and per-scene shooting notes.`;

  const out = await runStructured({
    provider,
    schema: directionSchema,
    system: SYSTEM,
    prompt,
    temperature: 0.7,
  });

  return {
    cameraLanguage: out.cameraLanguage.trim(),
    lensPhilosophy: out.lensPhilosophy.trim(),
    colourPalette: out.colourPalette.trim(),
    lightingApproach: out.lightingApproach.trim(),
    soundDesign: out.soundDesign.trim(),
    visualMotif: out.visualMotif.trim(),
    pacingRhythm: out.pacingRhythm.trim(),
    perSceneNotes: out.perSceneNotes.map((n) => ({
      sceneNumber: n.sceneNumber,
      approach: n.approach.trim(),
      shotFunction: n.shotFunction.trim(),
    })),
  };
}
