/**
 * Preset taxonomies and options for the Product Shoot Studio.
 *
 * Provides curated options for Camera Choreography, Lighting & Atmosphere,
 * Pedestal / Surface Materials, Physics & Environmental FX, Motion Pace,
 * Human / UGC Interaction, and Example Briefs.
 */

import type {
  ProductBrief,
  CreativeControls,
  VideoAspectRatio,
} from './types';

// ── Product Categories ──────────────────────────────────────────────────

export const PRODUCT_CATEGORIES = [
  'Skincare & Beauty',
  'Beverage & Food',
  'Tech & Electronics',
  'Luxury & Jewelry',
  'Fragrance & Perfume',
  'Fashion & Footwear',
  'Wellness & Supplements',
  'Home & Interior',
  'Sports & Outdoors',
  'Automotive & EDC',
] as const;

// ── Camera Choreography Presets ─────────────────────────────────────────

export interface OptionPreset {
  id: string;
  label: string;
  description: string;
  keyword: string;
}

export const CAMERA_MOTION_PRESETS: OptionPreset[] = [
  {
    id: 'orbit-360',
    label: 'Orbital 360°',
    description: 'Smooth full circular sweep showing every angle',
    keyword: 'seamless 360-degree orbital camera rotation around the product',
  },
  {
    id: 'macro-dolly-in',
    label: 'Macro Dolly-In',
    description: 'Slow push into ultra-close detail and texture',
    keyword: 'slow dramatic macro push-in towards the product label and surface texture',
  },
  {
    id: 'hero-low-angle-crane',
    label: 'Hero Low-Angle Crane',
    description: 'Ascending low-angle crane reveal with monumental presence',
    keyword: 'monumental low-angle camera slowly craning upwards to hero the silhouette',
  },
  {
    id: 'top-down-flatlay',
    label: 'Top-Down Flatlay',
    description: 'Direct overhead view with geometric composition',
    keyword: 'clean 90-degree overhead top-down perspective looking straight down',
  },
  {
    id: 'floating-fpv-glide',
    label: 'Floating FPV Glide',
    description: 'Dynamic kinetic glide swooping past the product',
    keyword: 'smooth fluid FPV-style dynamic glide sweeping closely around the curvature',
  },
  {
    id: 'whip-pan-reveal',
    label: 'Whip-Pan Reveal',
    description: 'High-energy snap transition landing in crisp focus',
    keyword: 'fast kinetic whip-pan transition snapping into razor-sharp focus on the product',
  },
  {
    id: 'static-lock-off',
    label: 'Static Lock-Off',
    description: 'Locked tripod framing letting environment and light move',
    keyword: 'locked-off tripod composition with depth of field, static camera with dynamic light movement',
  },
];

// ── Lighting & Mood Presets ─────────────────────────────────────────────

export const LIGHTING_PRESETS: OptionPreset[] = [
  {
    id: 'luxury-chiaroscuro',
    label: 'Luxury Chiaroscuro',
    description: 'High-contrast studio rim lights with deep rich shadows',
    keyword: 'luxury chiaroscuro studio lighting, crisp razor-sharp rim lights, deep black negative fill',
  },
  {
    id: 'softbox-diffused',
    label: 'Clean Studio Softbox',
    description: 'Even, pristine commercial lighting with soft wrap',
    keyword: 'commercial high-key softbox illumination, perfectly diffused highlights with clean soft reflections',
  },
  {
    id: 'golden-hour-sun',
    label: 'Golden Hour Sunlight',
    description: 'Warm low-raking sunlight with cinematic lens flares',
    keyword: 'warm low-angle golden hour sunlight casting elongated soft shadows with delicate warm lens flare',
  },
  {
    id: 'cyberpunk-neon',
    label: 'Cyberpunk Neon Glow',
    description: 'Dual-tone neon accents (magenta, cyan) with specular reflections',
    keyword: 'stylized dual-tone cyberpunk lighting, vibrant cyan and magenta edge reflections on surfaces',
  },
  {
    id: 'dramatic-backlit-rim',
    label: 'Dramatic Backlit Rim',
    description: 'Silhouetted edge glow highlighting product contours',
    keyword: 'powerful backlit rim illumination carving the product contours out of a dark background',
  },
  {
    id: 'moody-editorial',
    label: 'Moody Editorial',
    description: 'Subtle ambient tones, muted color palette, Scandinavian aesthetic',
    keyword: 'nordic minimalist editorial lighting, desaturated earthy tones, gentle indirect natural window light',
  },
];

// ── Surface & Pedestal Materials ────────────────────────────────────────

export const SURFACE_PRESETS: OptionPreset[] = [
  {
    id: 'carrara-marble',
    label: 'Carrara Marble',
    description: 'Polished white Italian stone with subtle grey veining',
    keyword: 'resting on an ultra-luxurious polished white Carrara marble slab with subtle grey veins',
  },
  {
    id: 'wet-black-obsidian',
    label: 'Wet Black Obsidian',
    description: 'Glossy dark stone with reflective water pool caustics',
    keyword: 'placed on a mirror-like wet black obsidian stone pedestal surrounded by shallow reflective water',
  },
  {
    id: 'raw-concrete',
    label: 'Architectural Concrete',
    description: 'Brutalist matte textured concrete with architectural lines',
    keyword: 'elevated on a brutalist textured raw concrete geometric plinth with clean architectural edges',
  },
  {
    id: 'warm-sand',
    label: 'Dune Sand & Rock',
    description: 'Organic desert rippled sand with natural earth stones',
    keyword: 'grounded in warm fine rippled desert sand with sun-warmed natural slate stones',
  },
  {
    id: 'brushed-titanium',
    label: 'Brushed Titanium',
    description: 'High-tech metallic plate with linear reflection brush lines',
    keyword: 'mounted on a futuristic brushed aerospace titanium surface with crisp metallic reflections',
  },
  {
    id: 'reflective-water-surface',
    label: 'Crystal Water Basin',
    description: 'Submerged base with delicate rippling water waves',
    keyword: 'standing in a shallow basin of crystal clear rippling water with dancing caustic light patterns',
  },
  {
    id: 'floating-in-air',
    label: 'Zero-G Levitation',
    description: 'Suspended in mid-air with depth and floating particles',
    keyword: 'levitating weightlessly in mid-air against an atmospheric gradient depth',
  },
];

// ── Physics & Environmental FX ──────────────────────────────────────────

export const PHYSICS_FX_PRESETS: OptionPreset[] = [
  {
    id: 'none',
    label: 'Clean (No FX)',
    description: 'Zero particles or fluids, pure focus on product and light',
    keyword: 'pristine clean atmosphere with crystal clear optics and zero clutter',
  },
  {
    id: 'water-splash-crown',
    label: 'Liquid Splash / Crown',
    description: 'High-speed fluid impact with explosive droplet crowns',
    keyword: 'high-speed 1000fps water droplet impact creating an explosive crystalline splash crown at the base',
  },
  {
    id: 'fine-mist-condensation',
    label: 'Condensation & Mist',
    description: 'Micro-droplets on cold surface with swirling cool vapor',
    keyword: 'chilled surface covered in crisp micro condensation beads with delicate swirling cool mist',
  },
  {
    id: 'powder-explosion',
    label: 'Cosmetic Powder Burst',
    description: 'Volumetric colorful pigment cloud bursting behind product',
    keyword: 'kinetic volumetric pigment powder explosion bursting in ultra slow motion behind the product',
  },
  {
    id: 'ambient-smoke-steam',
    label: 'Aromatic Steam / Haze',
    description: 'Warm rising steam or luxury ambient haze',
    keyword: 'delicate ribbons of warm aromatic steam curling elegantly upwards into cinematic haze',
  },
  {
    id: 'neon-light-refraction',
    label: 'Prism Light Refraction',
    description: 'Rainbow spectral flares and glass dispersion effects',
    keyword: 'dancing optical prism caustics and rainbow spectral light refractions sweeping across the scene',
  },
  {
    id: 'floating-botanical-petals',
    label: 'Botanical Drift',
    description: 'Slow-motion floating flowers, leaves, or natural elements',
    keyword: 'organic botanical leaves and delicate flower petals drifting gently in slow-motion air currents',
  },
];

// ── Motion Pace ─────────────────────────────────────────────────────────

export const MOTION_PACE_PRESETS: OptionPreset[] = [
  {
    id: 'slow-mo-120fps',
    label: '120fps Slow-Mo',
    description: 'Dreamy hyper-detailed slow motion capturing every micro-particle',
    keyword: 'shot on phantom flex 4k in ultra slow motion 120fps, serene hyper-fluid pacing',
  },
  {
    id: 'cinematic-24fps',
    label: '24fps Cinematic',
    description: 'Natural film cadence with authentic shutter motion blur',
    keyword: 'standard cinematic 24fps film shutter cadence with natural motion blur and organic speed',
  },
  {
    id: 'fast-energy-cut',
    label: 'High-Energy Fast Cut',
    description: 'Pulsing rhythm, whip zooms, and dynamic punch-ins for social ads',
    keyword: 'high-velocity dynamic commercial pacing with rapid zoom punches and energetic movement',
  },
  {
    id: 'hyperlapse-timelapse',
    label: 'Light Hyperlapse',
    description: 'Accelerated shadows and shifting environmental light sweeps',
    keyword: 'accelerated environmental lighting sweep moving dynamically like an architectural timelapse',
  },
];

// ── Human Interaction / UGC Mode ────────────────────────────────────────

export const HUMAN_INTERACTION_PRESETS: OptionPreset[] = [
  {
    id: 'none-pure-product',
    label: 'Commercial (No Humans)',
    description: 'Pure product focus without hands or human models',
    keyword: 'pure product commercial focus, no humans or body parts visible in frame',
  },
  {
    id: 'hands-unboxing',
    label: 'Hands Unboxing',
    description: 'Elegantly opening premium packaging to reveal product',
    keyword: 'manicured elegant hands carefully sliding open the luxury packaging to reveal the product',
  },
  {
    id: 'hands-applying-routine',
    label: 'Application / Routine',
    description: 'Hand dispensing dropper, pressing pump, or applying texture',
    keyword: 'graceful hands gently pressing the pump dispenser and demonstrating the silky product texture',
  },
  {
    id: 'hands-holding-swatching',
    label: 'Hand Holding / Swatch',
    description: 'Holding product in natural grip showcasing scale and finish',
    keyword: 'human hand naturally holding the product against aesthetic lifestyle background to show true scale',
  },
  {
    id: 'ugc-creator-demo',
    label: 'UGC Social Creator',
    description: 'Authentic selfie / desktop creator framing with casual motion',
    keyword: 'first-person UGC creator perspective demonstrating the product live on camera with authentic lighting',
  },
];

// ── Aspect Ratio Presets ────────────────────────────────────────────────

export const ASPECT_RATIOS: { id: VideoAspectRatio; label: string; sublabel: string }[] = [
  { id: '9:16', label: '9:16 Vertical', sublabel: 'TikTok, Reels, Shorts' },
  { id: '16:9', label: '16:9 Widescreen', sublabel: 'YouTube, Commercial, TV' },
  { id: '1:1', label: '1:1 Square', sublabel: 'Instagram Feed, Shopify' },
  { id: '4:5', label: '4:5 Social', sublabel: 'Meta Ad Placements' },
];

// ── Curated Example Briefs ──────────────────────────────────────────────

export interface ExampleProductBrief {
  title: string;
  category: string;
  brief: ProductBrief;
  creativeControls: CreativeControls;
  recipeId: string;
}

export const EXAMPLE_PRODUCT_BRIEFS: ExampleProductBrief[] = [
  {
    title: 'Aura Glow Vitamin C Serum',
    category: 'Skincare & Beauty',
    brief: {
      name: 'Aura Glow Vitamin C Radiance Serum',
      category: 'Skincare & Beauty',
      description: 'Ultra-pure antioxidant facial serum with 15% Vitamin C and hyaluronic acid',
      sellingPoint: 'Instant glass-skin luminosity and 24-hour hydration barrier',
      targetAudience: 'Skincare enthusiasts seeking glowing, radiant complexion',
      keyFeatures: 'Amber glass dropper bottle, gold typography, golden liquid droplet',
    },
    creativeControls: {
      cameraMotion: 'macro-dolly-in',
      lightingStyle: 'luxury-chiaroscuro',
      surfaceMaterial: 'reflective-water-surface',
      physicsFX: 'water-splash-crown',
      motionPace: 'slow-mo-120fps',
      humanInteraction: 'hands-applying-routine',
      aspectRatio: '9:16',
    },
    recipeId: 'hydro-explosion',
  },
  {
    title: 'Volt X Pro ANC Earbuds',
    category: 'Tech & Electronics',
    brief: {
      name: 'Volt X Pro Spatial ANC Wireless Earbuds',
      category: 'Tech & Electronics',
      description: 'Next-generation wireless earbuds with active noise cancellation and spatial audio',
      sellingPoint: 'Studio acoustic master sound in an ultra-compact matte titanium chassis',
      targetAudience: 'Audiophiles, tech innovators, and commuters',
      keyFeatures: 'Matte titanium case, glowing LED battery pulse, precision acoustic mesh',
    },
    creativeControls: {
      cameraMotion: 'orbit-360',
      lightingStyle: 'cyberpunk-neon',
      surfaceMaterial: 'brushed-titanium',
      physicsFX: 'zero-gravity-float',
      motionPace: 'cinematic-24fps',
      humanInteraction: 'none-pure-product',
      aspectRatio: '16:9',
    },
    recipeId: 'levitation-hero',
  },
  {
    title: 'Noir Nectar Artisanal Cold Brew',
    category: 'Beverage & Food',
    brief: {
      name: 'Noir Nectar Nitro Cold Brew Coffee',
      category: 'Beverage & Food',
      description: 'Single-origin Ethiopian nitro cold brew canned with velvet micro-foam cascade',
      sellingPoint: 'Silky smooth nitrogen cascade with rich notes of dark cacao and citrus',
      targetAudience: 'Specialty coffee lovers and design-conscious urbanites',
      keyFeatures: 'Matte black aluminum slim can, condensation droplets, cascading foam',
    },
    creativeControls: {
      cameraMotion: 'macro-dolly-in',
      lightingStyle: 'golden-hour-sun',
      surfaceMaterial: 'raw-concrete',
      physicsFX: 'fine-mist-condensation',
      motionPace: 'slow-mo-120fps',
      humanInteraction: 'hands-holding-swatching',
      aspectRatio: '9:16',
    },
    recipeId: 'condensation-close-up',
  },
  {
    title: 'Oud Imperial Luxury Extrait',
    category: 'Fragrance & Perfume',
    brief: {
      name: 'Oud Imperial Extrait de Parfum',
      category: 'Fragrance & Perfume',
      description: 'Rare Cambodian oud and smoked amber in an architectural crystal flacon',
      sellingPoint: 'Seductive 18-hour sillage crafted for royalty',
      targetAudience: 'Luxury fragrance collectors and high-net-worth connoisseurs',
      keyFeatures: 'Heavy multifaceted crystal bottle, 24k gold cap, black velvet ribbon',
    },
    creativeControls: {
      cameraMotion: 'hero-low-angle-crane',
      lightingStyle: 'dramatic-backlit-rim',
      surfaceMaterial: 'wet-black-obsidian',
      physicsFX: 'ambient-smoke-steam',
      motionPace: 'slow-mo-120fps',
      humanInteraction: 'none-pure-product',
      aspectRatio: '9:16',
    },
    recipeId: 'luxury-pedestal',
  },
];

export const DEFAULT_CREATIVE_CONTROLS: CreativeControls = {
  cameraMotion: 'orbit-360',
  lightingStyle: 'luxury-chiaroscuro',
  surfaceMaterial: 'carrara-marble',
  physicsFX: 'none',
  motionPace: 'slow-mo-120fps',
  humanInteraction: 'none-pure-product',
  aspectRatio: '9:16',
  negativeConstraints: '',
  customVisualNotes: '',
};
