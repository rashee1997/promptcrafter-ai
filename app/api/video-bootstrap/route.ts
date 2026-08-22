import { NextRequest, NextResponse } from 'next/server';
import type {
  BootstrapContext,
  VideoBootstrapRequest,
  VideoBootstrapStage,
} from '@/lib/video/bootstrap/types';
import { generateStoryTreatment } from '@/lib/video/bootstrap/story';
import { generateScriptDialogue } from '@/lib/video/bootstrap/dialogue';
import { generateScreenplay } from '@/lib/video/bootstrap/screenplay';
import { generateDirectionPlan } from '@/lib/video/bootstrap/direction';
import { generateCharacters } from '@/lib/video/bootstrap/characters';
import { suggestScenes } from '@/lib/video/bootstrap/scenes';
import { tailorStyle } from '@/lib/video/bootstrap/style';
import { generateEffects } from '@/lib/video/bootstrap/effects';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Phase B — 8-stage AI-orchestrated project bootstrap.
 * POST body: { stage, intent, customInstructions?, previousContext?, revisionPrompt?, provider }
 * Delegates to the matching lib/video/bootstrap module and returns typed JSON.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as VideoBootstrapRequest;
    const {
      stage,
      provider,
      intent,
      customInstructions,
      previousContext,
      revisionPrompt,
    } = body;

    if (!provider?.id) {
      return NextResponse.json({ error: 'A provider is required.' }, { status: 400 });
    }
    if (!intent || !intent.trim()) {
      return NextResponse.json({ error: 'A project intent is required.' }, { status: 400 });
    }

    const ctx = (previousContext ?? {}) as BootstrapContext;

    switch (stage as VideoBootstrapStage) {
      // Phase B — Story pipeline (1–4)
      case 1: {
        const data = await generateStoryTreatment({
          provider,
          intent,
          customInstructions,
          revisionPrompt,
          previous: ctx.storyTreatment ?? ctx.script ?? null,
          frameworkId: body.frameworkId,
        });
        return NextResponse.json({ stage: 1, data });
      }
      case 2: {
        const data = await generateScriptDialogue({
          provider,
          intent,
          storyTreatment: ctx.storyTreatment ?? null,
          previous: ctx.scriptDialogue ?? null,
          revisionPrompt,
        });
        return NextResponse.json({ stage: 2, data });
      }
      case 3: {
        const data = await generateScreenplay({
          provider,
          intent,
          storyTreatment: ctx.storyTreatment ?? null,
          scriptDialogue: ctx.scriptDialogue ?? null,
          previous: ctx.screenplay ?? null,
          revisionPrompt,
        });
        return NextResponse.json({ stage: 3, data });
      }
      case 4: {
        const data = await generateDirectionPlan({
          provider,
          intent,
          screenplay: ctx.screenplay ?? null,
          scriptDialogue: ctx.scriptDialogue ?? null,
          storyTreatment: ctx.storyTreatment ?? null,
          previous: ctx.directionPlan ?? null,
          revisionPrompt,
        });
        return NextResponse.json({ stage: 4, data });
      }
      // Legacy pipeline (5–8, renumbered from 1–4)
      case 5: {
        const characters = await generateCharacters({
          provider,
          intent,
          script: ctx.script ?? null,
          customInstructions,
          revisionPrompt,
          previous: ctx.characters ?? null,
        });
        return NextResponse.json({ stage: 5, data: { characters } });
      }
      case 6: {
        const locations = await suggestScenes({
          provider,
          intent,
          script: ctx.script ?? null,
          style: ctx.style ?? null,
          existingLocations: ctx.locations ?? null,
          revisionPrompt,
        });
        return NextResponse.json({ stage: 6, data: { locations } });
      }
      case 7: {
        const styleLibraryId = body.styleLibraryId;
        if (!styleLibraryId) {
          return NextResponse.json(
            { error: 'A styleLibraryId is required for stage 7 (Phase E — curated style library).' },
            { status: 400 }
          );
        }
        const option = await tailorStyle({
          provider,
          styleId: styleLibraryId,
          script: ctx.script ?? null,
          characters: ctx.characters ?? null,
          customInstructions,
          revisionPrompt,
        });
        return NextResponse.json({ stage: 7, data: { options: [option] } });
      }
      case 8: {
        const options = await generateEffects({
          provider,
          script: ctx.script ?? null,
          style: ctx.style ?? null,
          revisionPrompt,
          previous: ctx.effects ? [ctx.effects] : null,
        });
        return NextResponse.json({ stage: 8, data: { options } });
      }
      default:
        return NextResponse.json(
          { error: `Unknown bootstrap stage: ${stage}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('API /api/video-bootstrap Error:', error);
    const message =
      error?.message || 'Video bootstrap generation failed. Please try again.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
