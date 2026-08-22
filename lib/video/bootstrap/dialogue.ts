// Video Prompt Studio — Stage 2: script dialogue (spoken lines + action, no camera directions).
// Spec-script discipline: camera language belongs ONLY in Stage 4 (direction).

import { z } from 'zod';
import type { ProviderConfig } from '@/types';
import { clip, runStructured } from './shared';
import type { StoryTreatment, ScriptDialogueDraft } from './types';

export const dialogueSchema = z.object({
  scenes: z
    .array(
      z.object({
        sceneNumber: z.number().int().positive().describe('Sequential scene number, starting at 1'),
        sceneGoal: z.string().describe('What changes in this scene — the dramatic purpose'),
        exchanges: z
          .array(
            z.object({
              speaker: z.string().describe('Character name (exact, from the story treatment cast)'),
              line: z.string().describe('The spoken line, short enough to fit an 8–30s clip'),
              subtext: z.string().optional().describe('What the character really means underneath'),
            })
          )
          .min(1),
        actionSummary: z
          .string()
          .describe('Prose description of physical action and environment — no camera directions'),
      })
    )
    .min(1)
    .max(12),
});

export type DialogueOutput = z.infer<typeof dialogueSchema>;

export interface GenerateDialogueArgs {
  provider: ProviderConfig;
  intent: string;
  storyTreatment: StoryTreatment | null;
  previous?: ScriptDialogueDraft | null;
  revisionPrompt?: string;
}

const SYSTEM = `You are a screenwriter adapting a prose story treatment into a short-form video screenplay (30–90 seconds, 1–12 scenes). You write spoken lines and action descriptions only. CRITICAL RULE: This is a spec script — absolutely no camera directions, shot descriptions, lens choices, or camera movement language. You write WHAT characters say and WHAT physically happens, never HOW it is filmed. Keep each line short enough to fit an 8–30s clip. Each scene must have a clear dramatic purpose — what changes in the story because this scene exists.`;

export async function generateScriptDialogue({
  provider,
  intent,
  storyTreatment,
  previous,
  revisionPrompt,
}: GenerateDialogueArgs): Promise<ScriptDialogueDraft> {
  const context = [
    `PROJECT INTENT: ${clip(intent, 600)}`,
    storyTreatment
      ? `CONFIRMED STORY TREATMENT:\nLogline: ${storyTreatment.logline}\nPremise: ${clip(storyTreatment.premise, 800)}\nEmotional arc: ${storyTreatment.emotionalArc}\nActs: ${storyTreatment.acts.map((a) => `Act ${a.act} (${a.title}): ${a.beats.map((b) => typeof b === 'string' ? b : b.text).join('; ')}`).join('\n')}\nEnding image: ${storyTreatment.endingImage}`
      : null,
    previous
      ? `PREVIOUS DIALOGUE DRAFT (revise this, keep what works):\n${clip(JSON.stringify(previous), 1600)}`
      : null,
    revisionPrompt
      ? `REVISION NOTE FROM DIRECTOR: ${clip(revisionPrompt, 600)}`
      : null,
  ]
    .filter(Boolean)
    .join('\n\n');

  const prompt = `${context}\n\nAdapt the treatment into scenes with spoken dialogue and action. No camera language.`;

  const out = await runStructured({
    provider,
    schema: dialogueSchema,
    system: SYSTEM,
    prompt,
    temperature: 0.7,
  });

  return {
    scenes: out.scenes.map((s) => ({
      sceneNumber: s.sceneNumber,
      sceneGoal: s.sceneGoal.trim(),
      exchanges: s.exchanges.map((e) => ({
        speaker: e.speaker.trim(),
        line: e.line.trim(),
        ...(e.subtext ? { subtext: e.subtext.trim() } : {}),
      })),
      actionSummary: s.actionSummary.trim(),
    })),
  };
}
