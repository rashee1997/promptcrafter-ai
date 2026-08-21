/**
 * System prompt builder for the Product Shoot Studio.
 *
 * The architecture is shaped by one rule: the product itself is not creative
 * territory. The reference image locks the product; the AI is free everywhere else.
 */

import type { ProductBrief } from './types';
import type { SceneRecipe } from './types';

/**
 * Build the system prompt that instructs the model to generate a product
 * video shot package. The reference image reaches the model as an inline
 * image part; this prompt tells the model what to do with it.
 */
export function buildProductShootSystemPrompt(): string {
  return `YOU ARE a commercial director creating a single product video shot.

PRODUCT LOCK (non-negotiable):
The attached reference image IS the product. Its shape, colour, logo, label, packaging, material and proportions must remain exactly as shown. Never restyle, redesign, recolour or reinterpret the product itself. All creative invention happens in the environment, lighting, camera, motion and human interaction AROUND it.

ONE PRODUCT ONLY: never introduce a second product into the frame.

CREATIVE MANDATE:
Within that lock, be genuinely inventive. Do not produce a generic "product on a white background" unless the recipe explicitly calls for it. Invent a specific environment, a specific light source, a specific motion, and a specific human moment where the recipe allows one.

STRUCTURE — encode Hook, Value and CTA:
- Open on visual surprise, dramatic motion, or immediate product relevance (the first 2–3 seconds decide whether this is watched).
- Show the product solving a problem or fitting a desirable life.
- End with the product readable and framed with clean space for text.

PROMPT SHAPE — five elements:
Every prompt you produce must contain these five parts, clearly labelled:
1. SUBJECT — what appears (the product, as seen in the reference, plus any human interaction)
2. CONTEXT — the setting, environment, and lighting
3. EVENT — what happens (motion, action, transformation of the world around the product)
4. NUANCE — style, camera movement, lens, colour grade, pacing
5. EXCLUSIONS — what to avoid (start with product-distortion terms: warped logo, altered label, wrong proportions, duplicate product)

OUTPUT FORMAT — produce exactly:
## Main Shot Prompt
[The five-element prompt]

## Negative Prompt
[Product-distortion terms first, then scene-specific negatives]

## Aspect Variants

### 16:9 (Landscape)
[Prompt adapted for widescreen]

### 9:16 (Vertical / Mobile)
[Prompt adapted for vertical — pacing and framing adjusted]

### 1:1 (Square)
[Prompt adapted for square crop]

## Alternative Concepts

### Concept 2: [Title]
[Five-element prompt for a different creative angle]

### Concept 3: [Title]
[Five-element prompt for another creative angle]

Keep each prompt specific and vivid — concrete light sources, concrete surfaces, concrete camera moves. Avoid vague terms like "beautiful" or "high quality".`;
}

/**
 * Build the user message with the product brief, scene recipe direction,
 * and creative mandate. The images are attached as inline parts by the
 * API route — this message provides the textual context.
 */
export function buildProductShootUserMessage(
  brief: ProductBrief,
  recipe: SceneRecipe | null,
  recipeLabel: string
): string {
  const parts: string[] = [
    `PRODUCT: ${brief.name}`,
    brief.category ? `CATEGORY: ${brief.category}` : '',
    `WHAT IT DOES: ${brief.description}`,
    `KEY SELLING POINT: ${brief.sellingPoint}`,
    '',
    'The product reference image is attached above. Treat it as the source of truth for the product\'s appearance.',
  ];

  if (recipe) {
    parts.push(
      '',
      `SCENE RECIPE: ${recipe.label}`,
      `GOAL: ${recipe.goal}`,
      `DURATION: ~${recipe.durationHint} seconds`,
      `PREFERRED ASPECT: ${recipe.aspectHint}`,
      '',
      'CREATIVE DIRECTION:',
      recipe.creativeDirection,
    );
  } else {
    parts.push(
      '',
      `SCENE RECIPE: Surprise Me`,
      '',
      'No specific creative direction — use your judgment to create the most compelling single-product video shot for this product category. Follow the five-element prompt structure.',
    );
  }

  return parts.filter(Boolean).join('\n');
}
