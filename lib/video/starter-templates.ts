/**
 * Phase 9 — Genre / Format Starter Templates.
 * A handful of named starting points that pre-select a sensible
 * framework / style / platform combination. Fully skippable —
 * the chat-first flow works without them.
 */

import type { VideoTargetPlatform } from '@/types/video';

export interface StarterTemplate {
  id: string;
  label: string;
  /** Short tagline shown on the chip (≤6 words). */
  tagline: string;
  /** What the AI overview should aim for when this template is active. */
  description: string;
  /** Story-structure framework id (maps to STRUCTURE_FRAMEWORKS). */
  frameworkId?: string;
  /** Target video platform. */
  platform?: VideoTargetPlatform;
  /** Camera vocabulary hint for style. */
  cameraVocabulary?: 'cinematic' | 'animated' | 'graphic';
  /** Short style direction injected into the brief. */
  styleHint?: string;
}

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: 'cartoon-kids',
    label: '60-second cartoon for kids',
    tagline: 'Bright, playful, fast',
    description:
      'A 60-second animated short for children ages 4–8. Bright primary colours, exaggerated squash-and-stretch motion, simple character design, and a clear moral takeaway. No dialogue-heavy scenes — visual storytelling carries it.',
    frameworkId: 'three-act',
    platform: 'seedance',
    cameraVocabulary: 'animated',
    styleHint:
      'Vibrant 2D/3D cartoon style with saturated palette, soft outlines, and bouncy timing.',
  },
  {
    id: 'comedy-short',
    label: '3-act comedy short',
    tagline: 'Setup, punchline, tag',
    description:
      'A self-contained comedic short with a clear setup–confrontation–resolution arc. Snappy pacing, expressive character reactions, and a twist or callback that lands the ending. Live-action or stylised live-action.',
    frameworkId: 'three-act',
    platform: 'veo',
    cameraVocabulary: 'cinematic',
    styleHint:
      'Naturalistic live-action with warm tones, handheld energy on reactions, and locked-off wide shots for punchlines.',
  },
  {
    id: 'monologue-piece',
    label: 'Single-character monologue',
    tagline: 'One voice, one camera',
    description:
      'A single-character piece driven by a continuous monologue or direct-to-camera address. Intimate framing, minimal cuts, and performance-driven. The camera serves the speaker — no spectacle, just presence.',
    frameworkId: 'save-the-cat',
    platform: 'veo',
    cameraVocabulary: 'cinematic',
    styleHint:
      'Intimate close-up to medium shot. Soft key light, shallow depth of field, muted colour grade. The performance is the whole piece.',
  },
  {
    id: 'product-showcase',
    label: 'Product showcase reel',
    tagline: 'Clean, premium, aspirational',
    description:
      'A polished product showcase combining close-up detail shots with lifestyle context. Smooth camera moves, controlled lighting, and a premium grade. Designed to feel aspirational without being flashy.',
    frameworkId: 'eight-sequence',
    platform: 'veo',
    cameraVocabulary: 'cinematic',
    styleHint:
      'High-end commercial look — slow dolly and orbit moves, controlled reflections, teal-and-orange or neutral grade.',
  },
  {
    id: 'sci-fi-vignette',
    label: 'Sci-fi world vignette',
    tagline: 'Atmosphere over exposition',
    description:
      'A short atmospheric vignette that establishes a sci-fi world through visual detail and mood rather than exposition. Neon-lit environments, volumetric light, and a sense of scale. Dialogue-free or minimal.',
    frameworkId: 'heros-journey',
    platform: 'kling',
    cameraVocabulary: 'cinematic',
    styleHint:
      'Neo-cyberpunk or hard sci-fi aesthetic. High-contrast neon, volumetric fog, anamorphic lens flare, desaturated skin tones.',
  },
  {
    id: 'motion-graphics',
    label: 'Motion-graphics explainer',
    tagline: 'Kinetic type, data viz',
    description:
      'A kinetic-motion-graphics piece that communicates information through animated typography, data visualisation, and geometric transitions. No live-action — purely designed motion.',
    frameworkId: 'three-act',
    platform: 'seedance',
    cameraVocabulary: 'graphic',
    styleHint:
      'Flat or isometric graphic style with bold typography, geometric transitions, and a clean two- or three-colour palette.',
  },
];
