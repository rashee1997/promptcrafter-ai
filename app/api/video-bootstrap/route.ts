import { NextRequest, NextResponse } from 'next/server';
import type {
  BootstrapContext,
  VideoBootstrapRequest,
  VideoBootstrapStage,
} from '@/lib/video/bootstrap/types';
import { generateScript } from '@/lib/video/bootstrap/script';
import { generateCharacters } from '@/lib/video/bootstrap/characters';
import { suggestScenes } from '@/lib/video/bootstrap/scenes';
import { generateStyle } from '@/lib/video/bootstrap/style';
import { generateEffects } from '@/lib/video/bootstrap/effects';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Phase 3 — 5-stage AI-orchestrated project bootstrap.
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
      case 1: {
        const data = await generateScript({
          provider,
          intent,
          customInstructions,
          revisionPrompt,
          previous: ctx.script ?? null,
        });
        return NextResponse.json({ stage: 1, data });
      }
      case 2: {
        const characters = await generateCharacters({
          provider,
          intent,
          script: ctx.script ?? null,
          customInstructions,
          revisionPrompt,
          previous: ctx.characters ?? null,
        });
        return NextResponse.json({ stage: 2, data: { characters } });
      }
      case 3: {
        const locations = await suggestScenes({
          provider,
          intent,
          script: ctx.script ?? null,
          style: ctx.style ?? null,
          existingLocations: ctx.locations ?? null,
          revisionPrompt,
        });
        return NextResponse.json({ stage: 3, data: { locations } });
      }
      case 4: {
        const options = await generateStyle({
          provider,
          script: ctx.script ?? null,
          characters: ctx.characters ?? null,
          customInstructions,
          revisionPrompt,
          previous: ctx.style ? [ctx.style] : null,
        });
        return NextResponse.json({ stage: 4, data: { options } });
      }
      case 5: {
        const options = await generateEffects({
          provider,
          script: ctx.script ?? null,
          style: ctx.style ?? null,
          revisionPrompt,
          previous: ctx.effects ? [ctx.effects] : null,
        });
        return NextResponse.json({ stage: 5, data: { options } });
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
