// Video Prompt Studio — Stage 7: visual style from curated library.
// The director picks a style from VIDEO_STYLE_LIBRARY (grouped by family),
// optionally asks the AI to tailor it to this project, and confirms.
// Replaces the old "AI invents 3 options" flow with a first-class,
// explicit selection grounded in published prompt structures.
//
// Phase E4 — library-first, AI tailoring is optional.

import type { ProviderConfig } from '@/types';
import type { VideoStyle } from '@/types/video';
import type { VideoCharacter } from '@/types/video';
import { clip, runStructured } from './shared';
import { getVisualStyle, type VisualStyle } from '@/lib/video/styles';
import { z } from 'zod';
import type { ScriptTreatment, StyleCandidate } from './types';
import { uid } from './shared';

/** Zod schema for AI-tailored style refinement. */
const tailoringSchema = z.object({
  lookAndMood: z.string().describe('Refined look and mood for this specific project'),
  colorGrade: z.string().describe('Refined color grade'),
  filmStock: z.string().describe('Refined film stock / render look'),
  aspectRatio: z.string().describe('Recommended aspect ratio for this project'),
});

export interface TailorStyleArgs {
  provider: ProviderConfig;
  styleId: string;
  script?: ScriptTreatment | null;
  characters?: VideoCharacter[] | null;
  customInstructions?: string;
  revisionPrompt?: string;
}

/**
 * E4 — produces a VideoStyle from the curated library. When a revision
 * prompt is supplied, the AI refines the library tokens to suit the
 * project; otherwise the library defaults are used directly.
 */
export async function tailorStyle({
  provider,
  styleId,
  script,
  characters,
  customInstructions,
  revisionPrompt,
}: TailorStyleArgs): Promise<StyleCandidate> {
  const libStyle = getVisualStyle(styleId);

  // Unknown or legacy style id — return defaults so the pipeline never
  // breaks on a stale project.
  if (!libStyle) {
    return {
      id: uid(),
      name: 'Custom Style',
      lookAndMood: 'cinematic look, natural lighting',
      colorGrade: 'balanced',
      filmStock: 'digital',
      aspectRatio: '16:9',
      styleId: undefined,
      cameraVocabulary: 'cinematic',
    };
  }

  // Without a revision prompt, use the library defaults directly.
  if (!revisionPrompt?.trim()) {
    return buildStyleFromLibrary(libStyle);
  }

  // With a revision prompt, ask the AI to tailor the library defaults.
  const context = [
    customInstructions
      ? `DIRECTORIAL BRIEF: ${clip(customInstructions, 900)}`
      : null,
    script
      ? `CONFIRMED SCRIPT TREATMENT:\n${clip(JSON.stringify(script), 1600)}`
      : null,
    characters?.length
      ? `CAST:\n${clip(
          characters.map((c) => `${c.name} (${c.role}) — ${c.appearance}`).join('\n'),
          1200
        )}`
      : null,
  ]
    .filter(Boolean)
    .join('\n\n');

  const system = `You are a director of photography tailoring a visual style for a short-form video production. The style comes from a curated library. Refine the four fields below to suit this specific project while preserving the style's core identity. Be specific enough that a colorist can lock it.`;

  const prompt = `${context}

SELECTED STYLE: ${libStyle.label}
STYLE SUMMARY: ${libStyle.summary}
STYLE PROMPT TOKENS: ${libStyle.promptTokens.join(', ')}
STYLE BEST FOR: ${libStyle.bestFor}

REVISION NOTE FROM DIRECTOR: ${clip(revisionPrompt, 600)}

Tailor the style to this project. Keep the core identity of "${libStyle.label}" intact.`;

  try {
    const refined = await runStructured({
      provider,
      schema: tailoringSchema,
      system,
      prompt,
      temperature: 0.5,
    });

    return {
      id: uid(),
      name: libStyle.label,
      lookAndMood: refined.lookAndMood.trim(),
      colorGrade: refined.colorGrade.trim(),
      filmStock: refined.filmStock.trim(),
      aspectRatio: refined.aspectRatio.trim(),
      styleId: libStyle.id,
      cameraVocabulary: libStyle.cameraVocabulary,
    };
  } catch {
    // AI tailoring failed — fall back to library defaults so the
    // pipeline never blocks on a transient error.
    return buildStyleFromLibrary(libStyle);
  }
}

/** Build a StyleCandidate directly from a library entry (no AI call). */
function buildStyleFromLibrary(lib: VisualStyle): StyleCandidate {
  return {
    id: uid(),
    name: lib.label,
    lookAndMood: `${lib.label} — ${lib.promptTokens.slice(0, 3).join(', ')}`,
    colorGrade: lib.promptTokens.includes('rich matte colors with tactile surfaces')
      ? 'rich matte colors, tactile surfaces'
      : lib.promptTokens.includes('vibrant pastel palette')
        ? 'vibrant pastel palette'
        : lib.promptTokens.includes('bright cheerful palette')
          ? 'bright cheerful palette'
          : 'matched to style',
    filmStock: lib.cameraVocabulary === 'cinematic'
      ? lib.promptTokens.find((t) => t.includes('35mm') || t.includes('film grain')) ?? 'digital'
      : lib.label,
    aspectRatio: '16:9',
    styleId: lib.id,
    cameraVocabulary: lib.cameraVocabulary,
  };
}

// ── Legacy compatibility ────────────────────────────────────────────────────
// The old `generateStyle` signature is still used by the API route for
// backward compat. When called with a styleLibraryId in the context, it
// delegates to tailorStyle. Otherwise falls back to the legacy AI-invent flow.

export { tailorStyle as generateStyle };
