import { NextRequest, NextResponse } from 'next/server';
import type { ProviderConfig } from '@/types';
import type { VideoCharacter } from '@/types/video';
import { regenerateCharacterImagePrompt } from '@/lib/video/bootstrap/character-image-prompt';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * D2 — regenerate ONE character's copy-ready image prompt via AI.
 * POST body: { provider, character, revisionNote?, styleContext? }
 * Cheap, fast, single-field structured output; used by the shared
 * CharacterReferencePanel in both the bootstrap wizard and the sidebar.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      provider: ProviderConfig;
      character: VideoCharacter;
      revisionNote?: string;
      styleContext?: string;
    };
    const { provider, character, revisionNote, styleContext } = body;

    if (!provider?.id) {
      return NextResponse.json({ error: 'A provider is required.' }, { status: 400 });
    }
    if (!character?.name?.trim()) {
      return NextResponse.json({ error: 'A character is required.' }, { status: 400 });
    }

    const imagePrompt = await regenerateCharacterImagePrompt({
      provider,
      character,
      revisionNote,
      styleContext,
    });

    return NextResponse.json({ imagePrompt });
  } catch (error: any) {
    console.error('API /api/video-character-image-prompt Error:', error);
    const message = error?.message || 'Image prompt regeneration failed. Please try again.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
