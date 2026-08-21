// Video Prompt Studio — Stage 1: story treatment (prose, no dialogue, no scene headers).
// Answers: does this story work before anyone writes a screenplay?

import { z } from 'zod';
import type { ProviderConfig } from '@/types';
import { clip, runStructured } from './shared';
import type { StoryTreatment, ScriptTreatment } from './types';

export const storySchema = z.object({
  logline: z
    .string()
    .describe('One-sentence premise that hooks the audience'),
  premise: z
    .string()
    .describe('2–4 paragraphs of prose expanding the logline with visual and emotional detail'),
  emotionalArc: z
    .string()
    .describe('The emotional journey: what the audience feels from start to middle to end'),
  theme: z
    .string()
    .describe('The underlying theme in a sentence'),
  acts: z
    .array(
      z.object({
        act: z.union([z.literal(1), z.literal(2), z.literal(3)]),
        title: z.string().describe('One-word or short title for the act'),
        beats: z.array(z.string()).min(1).max(4).describe('2–4 key story beats'),
      })
    )
    .length(3),
  endingImage: z
    .string()
    .describe('The final image the audience carries away — prose, present tense'),
});

export type StoryOutput = z.infer<typeof storySchema>;

export interface GenerateStoryArgs {
  provider: ProviderConfig;
  intent: string;
  customInstructions?: string;
  revisionPrompt?: string;
  previous?: StoryTreatment | ScriptTreatment | null;
}

const SYSTEM = `You are a development executive writing a prose story treatment for a short-form video production (30–90 seconds). You write in present tense, like a narrative the director can feel. No dialogue — the treatment shows what happens and how it feels, not what characters say. No camera language — this is story, not direction. Be specific and cinematic: concrete places, objects, and actions beat vague adjectives. The ending image should linger.`;

export async function generateStoryTreatment({
  provider,
  intent,
  customInstructions,
  revisionPrompt,
  previous,
}: GenerateStoryArgs): Promise<StoryTreatment> {
  // When seeding from a pre-Phase-B ScriptTreatment, map its fields into
  // the StoryTreatment shape so the director doesn't redo work.
  const seedContext = previous && 'actBeats' in previous
    ? `PREVIOUS SCRIPT TREATMENT (migrate this to a prose treatment):\nLogline: ${previous.logline}\nAct beats: ${previous.actBeats.join('; ')}\nTone: ${previous.tone}\nOverview: ${previous.overview}`
    : previous && 'premise' in previous
      ? `PREVIOUS STORY TREATMENT (revise this, keep what works):\n${clip(JSON.stringify(previous), 1600)}`
      : null;

  const context = [
    `PROJECT INTENT: ${clip(intent, 600)}`,
    customInstructions
      ? `DIRECTORIAL BRIEF: ${clip(customInstructions, 1000)}`
      : null,
    seedContext,
    revisionPrompt
      ? `REVISION NOTE FROM DIRECTOR: ${clip(revisionPrompt, 600)}`
      : null,
  ]
    .filter(Boolean)
    .join('\n\n');

  const prompt = `${context}\n\nDraft a prose story treatment: a logline, 2–4 paragraphs of premise, the emotional arc, the theme, three acts with beats, and a lingering ending image. Present tense, no dialogue, no camera language.`;

  const out = await runStructured({
    provider,
    schema: storySchema,
    system: SYSTEM,
    prompt,
    temperature: 0.7,
  });

  return {
    logline: out.logline.trim(),
    premise: out.premise.trim(),
    emotionalArc: out.emotionalArc.trim(),
    theme: out.theme.trim(),
    acts: out.acts.map((a) => ({
      act: a.act,
      title: a.title.trim(),
      beats: a.beats.map((b) => b.trim()),
    })),
    endingImage: out.endingImage.trim(),
  };
}
