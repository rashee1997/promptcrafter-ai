import { NextRequest, NextResponse } from 'next/server';
import type { SuggestVideoLocationRequest } from '@/lib/video/bootstrap/types';
import { suggestScenes } from '@/lib/video/bootstrap/scenes';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Phase 3 — low-latency assist endpoint for ad-hoc location scouting
 * ("+ Add Location" in the scenes step / sidebar). Shares the exact
 * suggestScenes() engine used by bootstrap Stage 3 (Rule 3).
 * POST body: { intent, script?, style?, existingLocations?, provider }
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SuggestVideoLocationRequest;
    const { provider, intent, script, style, existingLocations } = body;

    if (!provider?.id) {
      return NextResponse.json({ error: 'A provider is required.' }, { status: 400 });
    }
    if (!intent || !intent.trim()) {
      return NextResponse.json({ error: 'A location hint is required.' }, { status: 400 });
    }

    const locations = await suggestScenes({
      provider,
      intent,
      script: script ?? null,
      style: style ?? null,
      existingLocations: existingLocations ?? null,
    });

    return NextResponse.json({ locations });
  } catch (error: any) {
    console.error('API /api/suggest-video-location Error:', error);
    const message =
      error?.message || 'Location scouting failed. Please try again.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
