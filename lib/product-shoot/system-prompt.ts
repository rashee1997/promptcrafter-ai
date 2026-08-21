/**
 * System prompt builder for the Product Shoot Studio.
 *
 * The architecture is shaped by one golden rule: the product itself is not creative
 * territory. The reference image locks the product; the AI director is free everywhere else.
 */

import type { ProductBrief, SceneRecipe, CreativeControls } from './types';
import {
  CAMERA_MOTION_PRESETS,
  LIGHTING_PRESETS,
  SURFACE_PRESETS,
  PHYSICS_FX_PRESETS,
  MOTION_PACE_PRESETS,
  HUMAN_INTERACTION_PRESETS,
} from './presets';

/**
 * Build the system prompt that instructs the model to generate a professional
 * product video shot package with model-specific platform dialects.
 */
export function buildProductShootSystemPrompt(): string {
  return `YOU ARE an elite commercial director and technical prompt engineer for high-end product advertising and e-commerce video production.

PRODUCT RIGIDITY LOCK (NON-NEGOTIABLE):
The attached reference image IS the immutable product. Its shape, branding, logo, label typography, packaging, materials, and proportions must remain 100% stable and intact. Never restyle, redesign, morph, or re-color the product. All creative invention happens in the environment, lighting, surface, camera choreography, atmospheric physics, and human interaction AROUND it. Exactly one product per scene.

PROMPT FORMULA (5-ELEMENT STRUCTURE):
1. SUBJECT — the immutable product as anchored in the reference image, plus any human hands/interaction.
2. CONTEXT — the high-end setting, pedestal material, environment, and background geometry.
3. EVENT — the physical motion, fluid dynamics, lighting sweep, or interaction happening in the world around the product.
4. NUANCE — cinematographic style, camera choreography, lens/focal length, depth of field, color grading, and cadence.
5. EXCLUSIONS — explicit distortion preventions (warped logos, distorted labels, extra products, melting geometry).

PLATFORM DIALECT MASTERY:
You must translate the commercial vision into specialized prompt formats for top video AI engines:
- Runway Gen-3/4: Directorial camera commands (e.g. "camera pan right", "slow orbital sweep", "macro push-in", f/1.8 lens).
- Kling 1.6/3.0: Audio-visual temporal pacing and natural human-object interaction cues.
- Google Veo 2/3.1: Granular physical simulation, natural light caustics, and environmental rendering.
- Luma Ray 2: High-impact physical collisions, fluid splash crowns, and texture dynamics.
- Minimax Hailuo: High-energy commercial consistency and aesthetic flow.

OUTPUT FORMAT (PRODUCE EXACTLY THESE SECTIONS):

## Main Shot Prompt
[The full 5-element director's prompt with clearly formatted SUBJECT, CONTEXT, EVENT, NUANCE, and EXCLUSIONS]

## Negative Prompt
[Product-distortion terms first: "distorted label, warped logo, altered packaging, morphed text, extra product, duplicate bottles, blurry texture, flickering artifacts"]

## Runway
[Runway Gen-3/4 optimized prompt with camera motion directives and lens details]

## Kling
[Kling 1.6/3.0 optimized prompt with temporal progression and human interaction cues]

## Google Veo
[Google Veo 2/3.1 simulation prompt emphasizing lighting caustics, optical physics, and material textures]

## Luma
[Luma Ray 2 prompt focused on high-speed motion, splash/particle dynamics, and textural fidelity]

## Minimax
[Minimax Hailuo prompt optimized for vibrant commercial social ad engagement]

## Aspect Variants

### 16:9 (Landscape)
[Adapted for widescreen horizontal framing with balanced negative space]

### 9:16 (Vertical / Mobile)
[Adapted for vertical mobile feeds with bottom safe-zone clearance for UI/captions]

### 1:1 (Square)
[Adapted for square e-commerce catalog / Instagram feed]

### 4:5 (Social Feed)
[Adapted for Meta feed placement]

## Alternative Concepts

### Concept 2: [Creative Angle Title]
[5-element prompt exploring a distinct visual aesthetic for this product]

### Concept 3: [Creative Angle Title]
[5-element prompt exploring another unique commercial staging]

## Remix Suggestions
- [Actionable remix 1, e.g. "Switch to high-contrast Chiaroscuro rim lighting"]
- [Actionable remix 2, e.g. "Add a 1000fps water droplet collision splash crown"]
- [Actionable remix 3, e.g. "Elevate on a polished Carrara marble slab"]
- [Actionable remix 4, e.g. "Switch to vertical 9:16 UGC creator unboxing style"]
- [Actionable remix 5, e.g. "Change to ultra slow-motion 120fps macro dolly push"]

Keep every prompt concrete, photorealistic, and technically precise. Avoid fluffy adjectives like "masterpiece" or "photorealistic 8k"; instead describe tangible light sources, actual camera lenses, and authentic physical materials.`;
}

/**
 * Build the user message with the product brief, scene recipe direction,
 * and user-selected creative controls.
 */
export function buildProductShootUserMessage(
  brief: ProductBrief,
  recipe: SceneRecipe | null,
  recipeLabel: string,
  creativeControls?: CreativeControls
): string {
  const parts: string[] = [
    `PRODUCT NAME: ${brief.name}`,
    brief.category ? `CATEGORY: ${brief.category}` : '',
    `WHAT IT DOES / DESCRIPTION: ${brief.description}`,
    `KEY SELLING POINT: ${brief.sellingPoint}`,
  ];

  if (brief.targetAudience) {
    parts.push(`TARGET AUDIENCE: ${brief.targetAudience}`);
  }
  if (brief.keyFeatures) {
    parts.push(`KEY VISUAL FEATURES: ${brief.keyFeatures}`);
  }

  parts.push(
    '',
    'REFERENCE IMAGE ANCHOR:',
    'The product reference image is attached above. It is the inviolable source of truth for the product geometry, logo, color, and packaging.'
  );

  if (recipe) {
    parts.push(
      '',
      `SCENE RECIPE: ${recipe.label}`,
      `GOAL: ${recipe.goal.toUpperCase()}`,
      `TARGET DURATION: ~${recipe.durationHint} seconds`,
      `PRIMARY ASPECT RATIO: ${recipe.aspectHint}`,
      '',
      'RECIPE CREATIVE DIRECTION:',
      recipe.creativeDirection
    );
  } else {
    parts.push(
      '',
      `SCENE RECIPE: Surprise Me (Director's Choice)`,
      'Invent the most compelling, high-converting commercial concept tailored specifically to this product category.'
    );
  }

  if (creativeControls) {
    const customDirectives: string[] = [];

    if (creativeControls.cameraMotion) {
      const p = CAMERA_MOTION_PRESETS.find((c) => c.id === creativeControls.cameraMotion);
      customDirectives.push(`CAMERA CHOREOGRAPHY: ${p ? p.keyword : creativeControls.cameraMotion}`);
    }
    if (creativeControls.lightingStyle) {
      const p = LIGHTING_PRESETS.find((c) => c.id === creativeControls.lightingStyle);
      customDirectives.push(`LIGHTING DESIGN: ${p ? p.keyword : creativeControls.lightingStyle}`);
    }
    if (creativeControls.surfaceMaterial) {
      const p = SURFACE_PRESETS.find((c) => c.id === creativeControls.surfaceMaterial);
      customDirectives.push(`SURFACE / PEDESTAL: ${p ? p.keyword : creativeControls.surfaceMaterial}`);
    }
    if (creativeControls.physicsFX && creativeControls.physicsFX !== 'none') {
      const p = PHYSICS_FX_PRESETS.find((c) => c.id === creativeControls.physicsFX);
      customDirectives.push(`PHYSICS & FX: ${p ? p.keyword : creativeControls.physicsFX}`);
    }
    if (creativeControls.motionPace) {
      const p = MOTION_PACE_PRESETS.find((c) => c.id === creativeControls.motionPace);
      customDirectives.push(`MOTION PACING: ${p ? p.keyword : creativeControls.motionPace}`);
    }
    if (creativeControls.humanInteraction && creativeControls.humanInteraction !== 'none-pure-product') {
      const p = HUMAN_INTERACTION_PRESETS.find((c) => c.id === creativeControls.humanInteraction);
      customDirectives.push(`HUMAN INTERACTION: ${p ? p.keyword : creativeControls.humanInteraction}`);
    }
    if (creativeControls.aspectRatio) {
      customDirectives.push(`TARGET ASPECT RATIO: ${creativeControls.aspectRatio}`);
    }
    if (creativeControls.customVisualNotes) {
      customDirectives.push(`ADDITIONAL VISUAL NOTES: ${creativeControls.customVisualNotes}`);
    }
    if (creativeControls.negativeConstraints) {
      customDirectives.push(`USER NEGATIVE CONSTRAINTS: ${creativeControls.negativeConstraints}`);
    }

    if (customDirectives.length > 0) {
      parts.push('', 'USER ART DIRECTION & CUSTOM CONTROLS:', ...customDirectives);
    }
  }

  return parts.filter(Boolean).join('\n');
}

