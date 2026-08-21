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
      'Product stays centered, elevated and dominant. Editorial studio lighting with slow orbit.',
    durationHint: 8,
    aspectHint: '16:9',
    category: 'Commercial',
    iconName: 'Crown',
    creativeDirection:
      'Stage a premium product hero commercial. The product sits center-frame, dominant and elevated. ' +
      'Use a slow orbit or gentle push-in to showcase dimensionality. Lighting is editorial — ' +
      'one key light with soft fill, creating defined highlights on the product surface. ' +
      'Background is minimal: a gradient wash, a textured surface, or a subtle architectural plinth ' +
      'that implies luxury without competing. The product is NOT restyled, recoloured, or ' +
      'redesigned — it appears exactly as photographed. Looping-friendly 6–8 seconds.',
    bestFor: 'Landing pages, hero banners, paid social ads',
  },
  {
    id: 'scroll-stopper-hook',
    label: 'Scroll-Stopper Hook',
    goal: 'hook',
    summary:
      'First 2–3 seconds high-velocity visual surprise to immediately stop user scroll on social feeds.',
    durationHint: 3,
    aspectHint: '9:16',
    category: 'Social Ad',
    iconName: 'Zap',
    creativeDirection:
      'Open with high-impact first 2–3 seconds that hook viewer attention immediately. Options: ' +
      '(a) extreme close-up of a product texture pulling back rapidly to reveal the silhouette, ' +
      '(b) product entering frame with kinetic motion (splash, drop, slide, light sweep), ' +
      '(c) dynamic light flare catching the product logo. ' +
      'Use slow motion, shallow depth of field, and dramatic lighting to create visual ' +
      'surprise. The product remains unchanged — all drama is in the cinematic environment.',
    bestFor: 'TikTok, Reels, Shorts — opening 3 seconds of any ad',
  },
  {
    id: 'hydro-explosion',
    label: 'Hydro Splash & Crown',
    goal: 'demo',
    summary:
      'High-speed 1000fps water droplet impact with crystalline splash crowns and fluid ripples.',
    durationHint: 6,
    aspectHint: '9:16',
    category: 'Sensory / FX',
    iconName: 'Droplets',
    creativeDirection:
      'High-speed phantom slow-motion commercial. The product stands in a shallow pristine basin of water. ' +
      'A crystal water droplet collides with the surface, sending a majestic fluid splash crown rising ' +
      'around the base of the product without obscuring the label. Caustic sunlight ripples reflect ' +
      'across the glass and packaging. Crisp, pristine, refreshing aesthetic.',
    bestFor: 'Skincare, beverages, waterproofing, summer campaigns',
  },
  {
    id: 'levitation-hero',
    label: 'Zero-G Levitation',
    goal: 'hero',
    summary:
      'Product weightlessly floating in mid-air with gentle rotational drift and futuristic lighting.',
    durationHint: 7,
    aspectHint: '16:9',
    category: 'Tech / Modern',
    iconName: 'Sparkles',
    creativeDirection:
      'Futuristic zero-gravity staging. The product floats weightlessly in the center of the frame, ' +
      'slowly rotating along its vertical axis. Subtle atmospheric micro-particles or gentle vapor ' +
      'float around it in depth. Dynamic colored rim lighting highlights the industrial design edges. ' +
      'The camera executes a slow, buttery-smooth push-in.',
    bestFor: 'Tech hardware, audio, footwear, luxury innovations',
  },
  {
    id: 'luxury-pedestal',
    label: 'Chiaroscuro Pedestal',
    goal: 'hero',
    summary:
      'Monumental marble or obsidian pedestal with razor-sharp rim lights and dark moody elegance.',
    durationHint: 8,
    aspectHint: '9:16',
    category: 'Luxury',
    iconName: 'Flame',
    creativeDirection:
      'High-end luxury commercial aesthetic. The product is elevated on a monolithic raw stone or polished ' +
      'black obsidian plinth. Extreme chiaroscuro lighting — razor-sharp golden or silver rim lights carve ' +
      'the silhouette out of a deep velvety shadow. The camera cranes upwards in a heroic low-angle reveal.',
    bestFor: 'Perfume, watches, jewelry, premium cosmetics, spirits',
  },
  {
    id: 'condensation-close-up',
    label: 'Chilled Condensation Mist',
    goal: 'demo',
    summary:
      'Macro beads of icy condensation slowly trickling down cold packaging with swirling vapor.',
    durationHint: 6,
    aspectHint: '9:16',
    category: 'Sensory / FX',
    iconName: 'Snowflake',
    creativeDirection:
      'Sensory macro close-up. The product is ice-cold, covered in crisp glistening beads of condensation. ' +
      'A single water droplet slowly trickles down the surface in 120fps slow motion. Cool, refreshing ' +
      'vapor mist swirls gently around the base. Golden or cool daylight backlighting illuminates the droplets.',
    bestFor: 'Beverages, chilled cosmetics, cooling gels, summer refreshers',
  },
  {
    id: 'lifestyle-in-use',
    label: 'Lifestyle In-Use',
    goal: 'lifestyle',
    summary:
      'Natural human interaction — hands holding, applying, or using the product in an aspirational setting.',
    durationHint: 10,
    aspectHint: '9:16',
    category: 'Lifestyle',
    iconName: 'Smile',
    creativeDirection:
      'Show the product being used by a real person in a relatable, aspirational setting. ' +
      'Hands or fingers interact naturally — opening, applying, pouring, ' +
      'holding, or swatching. The human touch makes the product tangible and desirable. ' +
      'The product itself is unchanged (exact packaging, label, shape); the environment ' +
      'and the human moment are where creativity lives. Warm natural window light.',
    bestFor: 'Social media ads, conversion campaigns, routine demos',
  },
  {
    id: 'ugc-creator',
    label: 'UGC / Creator-Style',
    goal: 'ugc',
    summary:
      'Authentic creator perspective with handheld smartphone cadence, natural lighting, and casual pacing.',
    durationHint: 8,
    aspectHint: '9:16',
    category: 'Social Ad',
    iconName: 'Smartphone',
    creativeDirection:
      'Create a prompt that reads as authentic user-generated content. ' +
      'Specify the capture feel: "shot on a smartphone," "natural room lighting," "handheld subtle motion." ' +
      'The product remains pristine and center-stage; the authenticity is in the unpretentious ' +
      'desktop/vanity setting, genuine first-person interaction, and quick demonstration.',
    bestFor: 'TikTok organic, creator partnerships, authenticity-first campaigns',
  },
  {
    id: 'cta-endframe',
    label: 'CTA End-Frame',
    goal: 'cta',
    summary:
      'Product framed with clean negative space for logo overlays, discount badges, and Shop Now buttons.',
    durationHint: 5,
    aspectHint: '16:9',
    category: 'Commercial',
    iconName: 'CheckCircle2',
    creativeDirection:
      'End with the product clearly framed in the center or right third of the shot, ' +
      'with clean negative space for text overlay, headline, and a "Shop Now" call-to-action button. ' +
      'Product details must be fully accurate and readable. ' +
      'Lighting is bright, clean, and commercial. The product is in perfect focus with zero motion blur.',
    bestFor: 'Final frame of any ad, retargeting campaigns, landing page headers',
  },
];

/** Get a recipe by id, or undefined if not found. */
export function getRecipeById(id: string): SceneRecipe | undefined {
  return SCENE_RECIPES.find((r) => r.id === id);
}

/** The special "Surprise me" option. */
export const SURPRISE_RECIPE_ID = 'surprise-me';

