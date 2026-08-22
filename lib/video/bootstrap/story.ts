// Video Prompt Studio — Stage 1: story treatment (prose, no dialogue, no scene headers).
// Answers: does this story work before anyone writes a screenplay?

import { z } from 'zod';
import type { ProviderConfig } from '@/types';
import { clip, runStructured } from './shared';
import type { StoryTreatment, ScriptTreatment } from './types';
import {
  STRUCTURE_FRAMEWORKS,
  getFramework,
  type StructureFramework,
} from './structure-frameworks';

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
        beats: z.array(z.object({
          text: z.string().describe('The prose content for this story beat'),
        })).min(1).max(6).describe('2–6 story beats for this act'),
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
  /** Structure framework id to constrain the beat list. Absent = AI chooses freely. */
  frameworkId?: string;
}

const SYSTEM = `You are a development executive writing a prose story treatment for a short-form video production (30–90 seconds). You write in present tense, like a narrative the director can feel. No dialogue — the treatment shows what happens and how it feels, not what characters say. No camera language — this is story, not direction. Be specific and cinematic: concrete places, objects, and actions beat vague adjectives. The ending image should linger.`;

export async function generateStoryTreatment({
  provider,
  intent,
  customInstructions,
  revisionPrompt,
  previous,
  frameworkId,
}: GenerateStoryArgs): Promise<StoryTreatment> {
  // When seeding from a pre-Phase-B ScriptTreatment, map its fields into
  // the StoryTreatment shape so the director doesn't redo work.
  const seedContext = previous && 'actBeats' in previous
    ? `PREVIOUS SCRIPT TREATMENT (migrate this to a prose treatment):\nLogline: ${previous.logline}\nAct beats: ${previous.actBeats.join('; ')}\nTone: ${previous.tone}\nOverview: ${previous.overview}`
    : previous && 'premise' in previous
      ? `PREVIOUS STORY TREATMENT (revise this, keep what works):\n${clip(JSON.stringify(previous), 1600)}`
      : null;

  // Build framework constraints for the prompt
  const framework = frameworkId ? getFramework(frameworkId as StructureFramework['id']) : null;
  let frameworkConstraint = '';

  if (framework) {
    const beatList = framework.beats
      .map((b) => `  - ${b.name} (${b.targetPercent}%): ${b.purpose}`)
      .join('\n');
    frameworkConstraint = `
STRUCTURE FRAMEWORK: ${framework.label}
You MUST structure the treatment's beats around this framework. Each beat in your output must correspond to one of these named beats, in order:

${beatList}

Group beats into three acts as appropriate for the framework. Each beat should accomplish the stated purpose. The beat count per act should reflect the framework's natural pacing — don't force equal distribution.`;
  }

  const context = [
    `PROJECT INTENT: ${clip(intent, 600)}`,
    customInstructions
      ? `DIRECTORIAL BRIEF: ${clip(customInstructions, 1000)}`
      : null,
    seedContext,
    revisionPrompt
      ? `REVISION NOTE FROM DIRECTOR: ${clip(revisionPrompt, 600)}`
      : null,
    frameworkConstraint || null,
  ]
    .filter(Boolean)
    .join('\n\n');

  const prompt = `${context}\n\nDraft a prose story treatment: a logline, 2–4 paragraphs of premise, the emotional arc, the theme, story acts with beats, and a lingering ending image. Present tense, no dialogue, no camera language.${framework ? ` Follow the ${framework.label} beat structure above.` : ' Choose 6–12 beats that serve the dramatic shape of the story.'}`;

  const out = await runStructured({
    provider,
    schema: storySchema,
    system: SYSTEM,
    prompt,
    temperature: 0.7,
  });

  // Map AI output beats to framework beats when a framework is selected
  const actsWithFrameworkBeats = out.acts.map((a) => {
    if (!framework) {
      // Freeform: no beat metadata
      return {
        act: a.act,
        title: a.title.trim(),
        beats: a.beats.map((b) => ({ text: b.text.trim() })),
      };
    }

    // Collect all beats flattened, then assign framework beats in order
    return {
      act: a.act,
      title: a.title.trim(),
      beats: a.beats.map((b, beatIndex) => {
        // Find the matching framework beat by counting across acts
        const flatBeats = out.acts.flatMap((aa) => aa.beats);
        const globalIndex = flatBeats.indexOf(b);
        const frameworkBeat = framework.beats[globalIndex] ?? null;
        return {
          text: b.text.trim(),
          ...(frameworkBeat ? {
            beatId: frameworkBeat.id,
            name: frameworkBeat.name,
            purpose: frameworkBeat.purpose,
          } : {}),
        };
      }),
    };
  });

  return {
    logline: out.logline.trim(),
    premise: out.premise.trim(),
    emotionalArc: out.emotionalArc.trim(),
    theme: out.theme.trim(),
    ...(framework ? { frameworkId: framework.id } : {}),
    acts: actsWithFrameworkBeats,
    endingImage: out.endingImage.trim(),
  };
}

/**
 * Regenerate a single beat within a story treatment. Keeps all other beats
 * and the framework mapping intact.
 */
export async function regenerateStoryBeat({
  provider,
  treatment,
  actIndex,
  beatIndex,
  frameworkId,
  revisionPrompt,
}: {
  provider: ProviderConfig;
  treatment: StoryTreatment;
  actIndex: number;
  beatIndex: number;
  frameworkId?: string;
  revisionPrompt?: string;
}): Promise<StoryTreatment> {
  const beat = treatment.acts[actIndex]?.beats[beatIndex];
  if (!beat) return treatment;

  const framework = frameworkId ? getFramework(frameworkId as StructureFramework['id']) : null;
  const beatMeta = beat.name ? `${beat.name}: ${beat.purpose ?? ''}` : `Beat ${beatIndex + 1}`;

  const context = [
    `CURRENT TREATMENT:\n${clip(treatment.logline, 200)}\n\n${clip(treatment.premise, 600)}`,
    `EMOTIONAL ARC: ${clip(treatment.emotionalArc, 300)}`,
    `THEME: ${treatment.theme}`,
    `BEAT TO REGENERATE — Act ${actIndex + 1}, ${beatMeta}:\n"${beat.text}"`,
    revisionPrompt ? `DIRECTOR'S NOTE: ${clip(revisionPrompt, 400)}` : null,
    framework ? `\nThis beat is the "${beat.name}" beat (${beat.purpose}). Keep it performing that dramatic function.` : null,
  ]
    .filter(Boolean)
    .join('\n\n');

  const prompt = `${context}\n\nRewrite ONLY this one story beat. Keep it the same length and dramatic function. Output only the new prose text for the beat, nothing else.`;

  const singleBeatSchema = z.object({
    text: z.string().describe('The rewritten prose for this beat'),
  });

  const out = await runStructured({
    provider,
    schema: singleBeatSchema,
    system: SYSTEM,
    prompt,
    temperature: 0.7,
  });

  // Create new treatment with the replaced beat
  const newActs = treatment.acts.map((a, ai) => {
    if (ai !== actIndex) return a;
    return {
      ...a,
      beats: a.beats.map((b, bi) => {
        if (bi !== beatIndex) return b;
        return { ...b, text: out.text.trim() };
      }),
    };
  });

  return { ...treatment, acts: newActs };
}
