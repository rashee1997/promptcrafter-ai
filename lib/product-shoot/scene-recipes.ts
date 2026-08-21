/**
 * Scene Recipes — the creative library for the Product Shoot Studio.
 *
 * Each recipe is a structured creative direction, not a fixed template.
 * The AI fills it with project-specific invention while respecting the
 * product-lock rule: the product itself is not creative territory.
 */

import type { SceneRecipe } from './types';

export const SCENE_RECIPES: SceneRecipe[] = [
  {
    id: 'ecommerce-hero',
    label: 'E-Commerce Hero',
    goal: 'hero',
    summary:
      'Product stays centered and dominant. Clean, premium feel — best for landing pages, product launches, and paid social.',
    durationHint: 9,
    aspectHint: '16:9',
    creativeDirection:
      'Stage a premium product hero video. The product sits center-frame, dominant and elevated. ' +
      'Use a slow orbit or gentle push-in to showcase dimensionality. Lighting is editorial — ' +
      'one key light with soft fill, creating defined highlights on the product surface. ' +
      'Background is minimal: a gradient wash, a textured surface, or a subtle environment ' +
      'that implies luxury without competing. The product is NOT restyled, recoloured, or ' +
      'redesigned — it appears exactly as photographed. 8–10 seconds, looping-friendly.',
    bestFor: 'Landing pages, product launches, paid social ads',
  },
  {
    id: 'scroll-stopper-hook',
    label: 'Scroll-Stopper Hook',
    goal: 'hook',
    summary:
      'First 2–3 seconds only — visual surprise, dramatic motion, or immediate product relevance to stop the scroll.',
    durationHint: 3,
    aspectHint: '9:16',
    creativeDirection:
      'Open with the first 2–3 seconds that decide whether this is watched. Options: ' +
      '(a) extreme close-up of a product texture pulling back to reveal the full product, ' +
      '(b) the product entering frame with dramatic motion (splash, drop, pour, slide), ' +
      '(c) a human hand or body reaching for or revealing the product. ' +
      'Use slow motion, shallow depth of field, and dramatic lighting to create visual ' +
      'surprise. The product remains exactly as it is — all drama comes from the world ' +
      'around it. This is a hook, not a story.',
    bestFor: 'TikTok, Reels, Shorts — the opening 3 seconds of any ad',
  },
  {
    id: 'lifestyle-in-use',
    label: 'Lifestyle In-Use',
    goal: 'lifestyle',
    summary:
      'Human hands/body interacting with the product — 40% higher conversion than isolated shots.',
    durationHint: 10,
    aspectHint: '16:9',
    creativeDirection:
      'Show the product being used by a real person in a relatable, aspirational setting. ' +
      'Hands, fingers, or body should interact naturally — opening, applying, pouring, ' +
      'holding, wearing. The human element makes the product tangible. ' +
      'The product itself is unchanged (exact packaging, label, shape); the environment ' +
      'and the human moment are where creativity lives. ' +
      'One product per frame — no competing products. ' +
      'Lighting is warm and natural (golden hour, kitchen window light, soft studio). ' +
      'Duration 8–12 seconds showing one clear use moment.',
    bestFor: 'Social media ads, conversion campaigns, product demos',
  },
  {
    id: 'ugc-creator',
    label: 'UGC / Creator-Style',
    goal: 'ugc',
    summary:
      'Deliberately unpolished — smartphone capture feel with grain and casual framing.',
    durationHint: 8,
    aspectHint: '9:16',
    creativeDirection:
      'Create a prompt that reads as user-generated content, not a studio ad. ' +
      'Specify the capture feel: "shot on a smartphone," "slight grain," "soft focus edges," ' +
      '"handheld camera movement." Add texture cues to avoid an overly clean AI look. ' +
      'Use negative directives: "--no studio lighting, perfect composition, airbrushed skin." ' +
      'The product remains exactly as it is; the "authenticity" is in the capture style, ' +
      'the setting (a kitchen counter, a bathroom mirror, a desk), and the casual human moment. ' +
      'Formula: creator type + product + setting + first 2-second hook + demo. ' +
      'Duration 6–10 seconds.',
    bestFor: 'TikTok organic, creator partnerships, authenticity-first campaigns',
  },
  {
    id: 'texture-closeup',
    label: 'Texture / Sensory Close-Up',
    goal: 'demo',
    summary:
      'Category-specific sensory detail — steam, pour, fabric physics, glow — that makes the viewer feel the product.',
    durationHint: 7,
    aspectHint: '1:1',
    creativeDirection:
      'Extreme close-up or macro shot focusing on the product\'s sensory qualities. ' +
      'Category-specific direction: ' +
      'Food — texture, steam, pour, and colour saturation are the four levers. ' +
      'Fashion — how the garment moves — fabric physics and environmental interaction. ' +
      'Beauty — texture, glow, and transformation. ' +
      'Electronics — materials, finish, precision details. ' +
      'Use slow motion and shallow depth of field. The product is the star — ' +
      'it is NOT restyled. Fill the frame with the real product texture. ' +
      'Duration 5–8 seconds.',
    bestFor: 'Food & beverage, fashion, beauty, premium materials',
  },
  {
    id: 'cta-endframe',
    label: 'CTA End-Frame',
    goal: 'cta',
    summary:
      'Product centered or right-of-frame with clean space for text and a call-to-action button.',
    durationHint: 5,
    aspectHint: '16:9',
    creativeDirection:
      'End with the product clearly in the center or right third of the frame, ' +
      'with clean negative space on the left or above for text overlay and a ' +
      'call-to-action button. Product details must be fully accurate and readable. ' +
      'Lighting is bright and even — no dramatic shadows on the product itself. ' +
      'Background is simple (solid colour, subtle gradient, or blurred environment). ' +
      'The product is in perfect focus. This is a closing frame, not an opening — ' +
      'it should feel resolved and confident. Duration 3–5 seconds.',
    bestFor: 'Final frame of any ad, retargeting campaigns, landing page headers',
  },
];

/** Get a recipe by id, or undefined if not found. */
export function getRecipeById(id: string): SceneRecipe | undefined {
  return SCENE_RECIPES.find((r) => r.id === id);
}

/** The special "Surprise me" option. */
export const SURPRISE_RECIPE_ID = 'surprise-me';
