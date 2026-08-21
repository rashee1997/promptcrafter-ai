import { LogoArchetypeRecipe } from '@/types';

export const SURPRISE_LOGO_ARCHETYPE_ID = '__surprise_logo_archetype__';

export const LOGO_ARCHETYPE_CATEGORIES = [
  'All',
  'Tech & SaaS',
  'Modern & Swiss',
  'Luxury & Heritage',
  'Creative & Modern',
  'Artisan & Craft',
] as const;

export const LOGO_BRAND_ARCHETYPES: LogoArchetypeRecipe[] = [
  // ── Tech & SaaS ───────────────────────────────────────────────────────────
  {
    id: 'minimalist-tech-monogram',
    label: 'Minimalist Tech Monogram',
    category: 'Tech & SaaS',
    summary: 'Single or interlocking initials with clean geometry, negative space cuts, and electric mint/slate accents.',
    goal: 'tech',
    iconName: 'Cpu',
    config: {
      logoType: 'lettermark',
      logoStyle: 'monoline',
      palette: 'cyber-neon',
      shapeLanguage: 'symmetrical',
      typography: 'geometric-sans',
      lockup: 'horizontal',
      hiddenMeaning: 'negative-space',
      boldness: 'balanced',
      usage: ['app-icon', 'website'],
      aspectRatio: '1:1',
      negativePrompt: 'photorealistic 3D, gradients, drop shadow, complex bevel, messy lines, watermark',
      sampleBrandName: 'NEXUS AI',
      sampleIndustry: 'tech',
      sampleConcept: 'network',
      directorNotes: 'Designed for high reduction legibility down to a 16px favicon with sharp negative space.',
    },
  },
  {
    id: 'abstract-cloud-infrastructure',
    label: 'Abstract Cloud Infrastructure',
    category: 'Tech & SaaS',
    summary: 'Precise geometric polygon or interlocking loop communicating scalable compute and high security.',
    goal: 'tech',
    iconName: 'Shapes',
    config: {
      logoType: 'abstract',
      logoStyle: 'geometric-flat',
      palette: 'fintech-trust',
      shapeLanguage: 'angular',
      typography: 'geometric-sans',
      lockup: 'stacked',
      hiddenMeaning: 'none',
      boldness: 'safe',
      usage: ['website', 'app-icon', 'print'],
      aspectRatio: '1:1',
      negativePrompt: 'realistic clouds, weather icons, 3d sphere, drop shadows, glossy reflection',
      sampleBrandName: 'STRATA CLOUD',
      sampleIndustry: 'tech',
      sampleConcept: 'shield',
      directorNotes: 'Engineered for enterprise trust and institutional scale.',
    },
  },

  // ── Modern & Swiss ────────────────────────────────────────────────────────
  {
    id: 'swiss-modernist-combination',
    label: 'Swiss Modernist Grid',
    category: 'Modern & Swiss',
    summary: 'International Typographic Style with strict modular grid alignment, bold sans typography, and stark asymmetry.',
    goal: 'minimal',
    iconName: 'LayoutGrid',
    config: {
      logoType: 'combination',
      logoStyle: 'swiss-style',
      palette: 'slate-minimal',
      shapeLanguage: 'squared',
      typography: 'humanist-sans',
      lockup: 'horizontal',
      hiddenMeaning: 'none',
      boldness: 'safe',
      usage: ['website', 'print', 'packaging'],
      aspectRatio: '1:1',
      negativePrompt: 'vintage textures, ornate flourishes, illustrative cartoon, messy handwriting',
      sampleBrandName: 'HELVETIC DESIGN',
      sampleIndustry: 'creative',
      sampleConcept: 'bridge',
      directorNotes: 'Asymmetric balance and objective clarity inspired by 1960s Swiss graphic masters.',
    },
  },
  {
    id: 'gestalt-negative-space-mark',
    label: 'Gestalt Negative Space Mark',
    category: 'Modern & Swiss',
    summary: 'Clever figure-ground illusion where background shapes reveal a secondary brand concept.',
    goal: 'creative',
    iconName: 'Eye',
    config: {
      logoType: 'pictorial',
      logoStyle: 'negative-space',
      palette: 'monochrome-bold',
      shapeLanguage: 'symmetrical',
      typography: 'geometric-sans',
      lockup: 'horizontal',
      hiddenMeaning: 'negative-space',
      boldness: 'daring',
      usage: ['website', 'app-icon', 'packaging', 'apparel'],
      aspectRatio: '1:1',
      negativePrompt: 'color gradients, multi-color noise, realistic feathers/fur, 3d emboss',
      sampleBrandName: 'COVERT LOGISTICS',
      sampleIndustry: 'services',
      sampleConcept: 'arrow',
      directorNotes: 'Rewards viewer double-take with a hidden visual punchline (Noma Bar style).',
    },
  },

  // ── Luxury & Heritage ─────────────────────────────────────────────────────
  {
    id: 'luxury-heritage-crest',
    label: 'Luxury Heritage Crest',
    category: 'Luxury & Heritage',
    summary: 'High-contrast Didone serif typography, symmetrical heraldic frame, and rich obsidian gold foil look.',
    goal: 'luxury',
    iconName: 'Crown',
    config: {
      logoType: 'emblem',
      logoStyle: 'stamp-seal',
      palette: 'luxury-gold',
      shapeLanguage: 'symmetrical',
      typography: 'modern-serif',
      lockup: 'emblem',
      hiddenMeaning: 'none',
      boldness: 'safe',
      usage: ['packaging', 'print', 'apparel'],
      aspectRatio: '1:1',
      negativePrompt: 'playful cartoon, bubbly typography, neon glow, informal handwriting',
      sampleBrandName: 'AURELIA & CO.',
      sampleIndustry: 'fashion',
      sampleConcept: 'crown',
      directorNotes: 'Evokes old-world craftsmanship, bespoke tailoring, and heritage luxury.',
    },
  },
  {
    id: 'monoline-botanical-luxury',
    label: 'Delicate Monoline Botanical',
    category: 'Luxury & Heritage',
    summary: 'Single continuous hairline stroke forming organic floral silhouette with airy modern serif typography.',
    goal: 'luxury',
    iconName: 'Sparkles',
    config: {
      logoType: 'pictorial',
      logoStyle: 'monoline',
      palette: 'earthy-botanical',
      shapeLanguage: 'organic',
      typography: 'modern-serif',
      lockup: 'stacked',
      hiddenMeaning: 'none',
      boldness: 'balanced',
      usage: ['packaging', 'website', 'print'],
      aspectRatio: '1:1',
      negativePrompt: 'heavy thick strokes, comic style, gradients, neon colors, 3D render',
      sampleBrandName: 'BOTANIQUE APOTHECARY',
      sampleIndustry: 'beauty',
      sampleConcept: 'leaf',
      directorNotes: 'Delicate, refined line weight tailored for premium cosmetics and fragrance.',
    },
  },

  // ── Creative & Modern ─────────────────────────────────────────────────────
  {
    id: 'kinetic-bauhaus-mark',
    label: 'Kinetic Bauhaus Primary',
    category: 'Creative & Modern',
    summary: 'Pure primary geometric primitives (circle, triangle, square) with dynamic asymmetric tension.',
    goal: 'creative',
    iconName: 'Shapes',
    config: {
      logoType: 'abstract',
      logoStyle: 'geometric-flat',
      palette: 'vibrant-energy',
      shapeLanguage: 'asymmetric',
      typography: 'geometric-sans',
      lockup: 'horizontal',
      hiddenMeaning: 'none',
      boldness: 'daring',
      usage: ['website', 'app-icon', 'apparel'],
      aspectRatio: '1:1',
      negativePrompt: 'subtle shading, realistic gradients, vintage grunge, traditional serif font',
      sampleBrandName: 'FORM + FLUX',
      sampleIndustry: 'creative',
      sampleConcept: 'star',
      directorNotes: 'Form follows function with uninhibited geometric modernism.',
    },
  },
  {
    id: 'neo-brutalist-creator-mark',
    label: 'Neo-Brutalist Heavy Outline',
    category: 'Creative & Modern',
    summary: 'Heavy 3px black vector outlines, electric solid color fills, and unapologetic structuralism.',
    goal: 'playful',
    iconName: 'Zap',
    config: {
      logoType: 'pictorial',
      logoStyle: 'pixel-sharp',
      palette: 'cyber-neon',
      shapeLanguage: 'angular',
      typography: 'display-custom',
      lockup: 'stacked',
      hiddenMeaning: 'none',
      boldness: 'daring',
      usage: ['app-icon', 'apparel', 'website'],
      aspectRatio: '1:1',
      negativePrompt: 'fine hairlines, soft airbrushing, corporate blue, delicate flourishes',
      sampleBrandName: 'GLITCH LABS',
      sampleIndustry: 'entertainment',
      sampleConcept: 'lightning',
      directorNotes: 'High-contrast, rebellious aesthetic popular in Gen Z creator tools and Web3.',
    },
  },
  {
    id: 'japanese-kamon-seal',
    label: 'Japanese Kamon Circular Seal',
    category: 'Creative & Modern',
    summary: 'Traditional Japanese family crest enclosed in a pure circle with strict radial symmetry.',
    goal: 'minimal',
    iconName: 'Smile',
    config: {
      logoType: 'pictorial',
      logoStyle: 'minimalist-flat',
      palette: 'monochrome-bold',
      shapeLanguage: 'circular',
      typography: 'humanist-sans',
      lockup: 'stacked',
      hiddenMeaning: 'none',
      boldness: 'balanced',
      usage: ['packaging', 'apparel', 'website', 'print'],
      aspectRatio: '1:1',
      negativePrompt: 'western heraldry, 3d metallic chrome, realistic feathers, color gradients',
      sampleBrandName: 'KIZUNA TEA',
      sampleIndustry: 'food',
      sampleConcept: 'wave',
      directorNotes: 'Strict radial harmony and cultural minimalism.',
    },
  },

  // ── Artisan & Craft ───────────────────────────────────────────────────────
  {
    id: 'vintage-artisan-stamp',
    label: 'Vintage Artisan Stamp',
    category: 'Artisan & Craft',
    summary: 'Circular stamp badge with arched slab-serif typography, stipple accents, and terracotta/cream warmth.',
    goal: 'vintage',
    iconName: 'Flame',
    config: {
      logoType: 'emblem',
      logoStyle: 'stamp-seal',
      palette: 'warm-terracotta',
      shapeLanguage: 'circular',
      typography: 'slab-serif',
      lockup: 'emblem',
      hiddenMeaning: 'none',
      boldness: 'balanced',
      usage: ['packaging', 'print', 'apparel'],
      aspectRatio: '1:1',
      negativePrompt: 'futuristic neon, high-tech abstract nodes, clean plastic render',
      sampleBrandName: 'TIMBER & ROAST',
      sampleIndustry: 'food',
      sampleConcept: 'flame',
      directorNotes: 'Earthy, tactile craft aesthetic ideal for specialty roasters, breweries, and leathercraft.',
    },
  },
  {
    id: 'handcrafted-humanist-wordmark',
    label: 'Organic Humanist Wordmark',
    category: 'Artisan & Craft',
    summary: 'Warm, custom hand-lettered cursive logotype with balanced ligatures and honest character.',
    goal: 'vintage',
    iconName: 'PenTool',
    config: {
      logoType: 'wordmark',
      logoStyle: 'storybook-gothic',
      palette: 'sunset-gradient',
      shapeLanguage: 'organic',
      typography: 'script',
      lockup: 'horizontal',
      hiddenMeaning: 'none',
      boldness: 'balanced',
      usage: ['website', 'packaging'],
      aspectRatio: '1:1',
      negativePrompt: 'cold geometric sans, tech grid, clip art icon, sharp harsh angles',
      sampleBrandName: 'Solace Bakery',
      sampleIndustry: 'food',
      sampleConcept: 'heart',
      directorNotes: 'Friendly, artisanal typography with approachable warmth.',
    },
  },
];

export function getLogoArchetypeById(id: string): LogoArchetypeRecipe | undefined {
  const custom = getCustomLogoArchetypes();
  return custom.find((r) => r.id === id) || LOGO_BRAND_ARCHETYPES.find((r) => r.id === id);
}

export function filterLogoArchetypesByCategory(
  archetypes: LogoArchetypeRecipe[],
  category: string
): LogoArchetypeRecipe[] {
  if (category === 'All') return archetypes;
  return archetypes.filter((r) => r.category === category);
}

const CUSTOM_ARCHETYPES_STORAGE_KEY = 'pc:custom-logo-archetypes';

export function getCustomLogoArchetypes(): LogoArchetypeRecipe[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_ARCHETYPES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomLogoArchetype(archetype: LogoArchetypeRecipe): LogoArchetypeRecipe[] {
  const existing = getCustomLogoArchetypes();
  const idx = existing.findIndex((r) => r.id === archetype.id);
  let updated: LogoArchetypeRecipe[];
  if (idx >= 0) {
    updated = [...existing];
    updated[idx] = archetype;
  } else {
    updated = [archetype, ...existing].slice(0, 30);
  }
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CUSTOM_ARCHETYPES_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save custom logo archetype to localStorage', e);
    }
  }
  return updated;
}

export function deleteCustomLogoArchetype(id: string): LogoArchetypeRecipe[] {
  const existing = getCustomLogoArchetypes();
  const updated = existing.filter((r) => r.id !== id);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CUSTOM_ARCHETYPES_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to delete custom logo archetype from localStorage', e);
    }
  }
  return updated;
}

