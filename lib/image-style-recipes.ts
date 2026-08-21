import { ImageStyleRecipe } from '@/types';

export const SURPRISE_IMAGE_RECIPE_ID = '__surprise_image_recipe__';

export const IMAGE_RECIPE_CATEGORIES = [
  'All',
  'Editorial & Fashion',
  'Cinematic & Film',
  '3D & CGI',
  'Fine Art & Graphic',
  'Sci-Fi & Cyberpunk',
  'Architecture & Spaces',
] as const;

export const IMAGE_SCENE_RECIPES: ImageStyleRecipe[] = [
  // ── Editorial & Fashion ───────────────────────────────────────────────────
  {
    id: 'editorial-vogue-highkey',
    label: 'Studio High-Key Fashion',
    category: 'Editorial & Fashion',
    summary: 'Magazine cover lighting with softbox wraps, crisp skin textures, and 85mm compression.',
    goal: 'editorial',
    iconName: 'Crown',
    aspectHint: '4:5',
    config: {
      style: 'editorial',
      camera: '85mm',
      lighting: 'studio',
      composition: 'portrait',
      colorGrade: 'kodak-portra-400',
      mood: 'serene',
      aspectRatio: '4:5',
      negativePrompt: 'harsh shadows, heavy grain, cartoon, illustration, low contrast, oversaturated',
      sampleSubject: 'Haute couture model wearing structured architectural silk gown against neutral travertine',
      sampleFullPrompt: 'High-fashion editorial cover shot, model in avant-garde draped silk, pristine 85mm f/1.4 studio lighting, softbox wrap with silver bounce fill, subtle Kodak Portra 400 skin tone rendering, 4:5 vertical framing.',
      directorNotes: 'Balances luminous soft shadows with crisp fabric micro-texture.',
    },
  },
  {
    id: 'editorial-90s-direct-flash',
    label: '90s Gritty Direct Flash',
    category: 'Editorial & Fashion',
    summary: 'Hard direct ring/camera flash, deep drop shadow, raw candid disposable camera aesthetic.',
    goal: 'retro',
    iconName: 'Zap',
    aspectHint: '3:2',
    config: {
      style: 'photorealistic',
      camera: '35mm',
      lighting: 'hard-sun',
      composition: 'eye-level',
      colorGrade: 'cinestill-800t',
      mood: 'dramatic',
      aspectRatio: '3:2',
      negativePrompt: 'softbox, diffused studio light, airbrushed skin, CGI, clean 3D render',
      sampleSubject: 'Subject laughing at an underground midnight loft party with vintage leather jacket',
      sampleFullPrompt: 'Raw candid 1990s party photograph, direct on-camera flash casting a crisp dark drop shadow behind the subject, 35mm point-and-shoot lens, authentic film grain and slight lens vignette, unpolished documentary energy.',
      directorNotes: 'Direct on-camera flash gives an iconic indie fashion look.',
    },
  },
  {
    id: 'hasselblad-medium-format',
    label: 'Hasselblad Studio Hero',
    category: 'Editorial & Fashion',
    summary: '100MP medium-format fidelity, razor-sharp eye detail, creamy falloff, and neutral balanced light.',
    goal: 'photoreal',
    iconName: 'Sparkles',
    aspectHint: '1:1',
    config: {
      style: 'photorealistic',
      camera: '85mm',
      lighting: 'rim-light',
      composition: 'close-up',
      colorGrade: 'fujifilm-velvia-50',
      mood: 'serene',
      aspectRatio: '1:1',
      negativePrompt: 'motion blur, digital noise, cartoon, plastic skin, distorted anatomy, flat lighting',
      sampleSubject: 'Close-up portrait of an artisan ceramicist with clay-dusted fingers and focused gaze',
      sampleFullPrompt: 'Medium format studio portrait captured on Hasselblad H6D-100c, 100mm f/2.2 lens, razor-sharp iris and skin pore fidelity, subtle rim light separating hair from slate background, natural tonal gradation.',
      directorNotes: 'Extreme optical sharpness with tactile micro-textures.',
    },
  },

  // ── Cinematic & Film ──────────────────────────────────────────────────────
  {
    id: 'cinematic-anamorphic-epic',
    label: 'Anamorphic 35mm Film Still',
    category: 'Cinematic & Film',
    summary: '21:9 ultrawide aspect with horizontal cyan streak flares, oval bokeh, and volumetric dust.',
    goal: 'cinematic',
    iconName: 'Clapperboard',
    aspectHint: '21:9',
    config: {
      style: 'cinematic',
      camera: 'anamorphic',
      lighting: 'volumetric',
      composition: 'wide-shot',
      colorGrade: 'teal-and-orange',
      mood: 'epic',
      aspectRatio: '21:9',
      negativePrompt: 'square crop, vertical video, amateur snapshot, 3d render, flat daytime lighting',
      sampleSubject: 'Solitary rover pilot standing before a colossal derelict space station in a desert canyon',
      sampleFullPrompt: 'Panavision anamorphic 35mm cinema still, 2.39:1 widescreen framing, subtle horizontal lens flare streaks, atmospheric volumetric haze catching the dawn sun, deep cinematic teal-and-orange grading, shallow depth of field with oval bokeh.',
      directorNotes: 'Delivers wide cinematic scope and production-value atmosphere.',
    },
  },
  {
    id: 'cinestill-neon-night',
    label: 'CineStill 800T Neon Noir',
    category: 'Cinematic & Film',
    summary: 'Tungsten-balanced night photography with vibrant red halation around neon signage.',
    goal: 'cinematic',
    iconName: 'Flame',
    aspectHint: '16:9',
    config: {
      style: 'cinematic',
      camera: '35mm',
      lighting: 'neon',
      composition: 'leading-lines',
      colorGrade: 'cinestill-800t',
      mood: 'mysterious',
      aspectRatio: '16:9',
      negativePrompt: 'daylight, bright sun, clean digital look, noise reduction, desaturated',
      sampleSubject: 'Rain-slicked alleyway outside a late-night noodle bar with steaming vents and glowing signs',
      sampleFullPrompt: 'CineStill 800T night shot on 35mm Leica lens, distinct red halation around vibrant magenta and cyan neon signs, reflections shimmering in wet asphalt puddles, moody ambient tungsten glow, atmospheric street mist.',
      directorNotes: 'Red halation around highlights creates an unmistakable analog mood.',
    },
  },
  {
    id: 'vintage-kodachrome-70s',
    label: '1970s Kodachrome Road Trip',
    category: 'Cinematic & Film',
    summary: 'Warm saturated reds/yellows, organic dye grain, golden California coastal sunshine.',
    goal: 'retro',
    iconName: 'Sparkles',
    aspectHint: '3:2',
    config: {
      style: 'photorealistic',
      camera: '35mm',
      lighting: 'golden-hour',
      composition: 'rule-of-thirds',
      colorGrade: 'kodachrome-64',
      mood: 'nostalgic',
      aspectRatio: '3:2',
      negativePrompt: 'modern digital artifacts, HDR bloom, sterile lighting, 3D CGI',
      sampleSubject: 'Vintage 1974 convertible parked on Pacific Coast Highway overlooking rugged ocean cliffs',
      sampleFullPrompt: 'Authentic 1970s Kodachrome 64 slide film photograph, warm rich primary colors with signature Kodachrome red and yellow saturation, late afternoon coastal sun flare, organic film grain, nostalgic timeless warmth.',
      directorNotes: 'Rich color saturation with authentic 1970s nostalgic dye chemistry.',
    },
  },

  // ── 3D & CGI ──────────────────────────────────────────────────────────────
  {
    id: 'octane-3d-glassmorphism',
    label: 'Octane Glass & Caustic 3D',
    category: '3D & CGI',
    summary: 'Physically based path-tracing with subsurface scattering, chromatic dispersion, and frosted glass.',
    goal: 'cgi',
    iconName: 'Droplets',
    aspectHint: '1:1',
    config: {
      style: '3d-render',
      camera: 'macro',
      lighting: 'bioluminescent',
      composition: 'symmetry',
      colorGrade: 'vibrant-punch',
      mood: 'dreamy',
      renderEngine: 'Octane Render, Subsurface Scattering, Dispersion Caustics',
      aspectRatio: '1:1',
      negativePrompt: 'flat 2d vector, low polygon, blurry textures, pixelated, amateur render',
      sampleSubject: 'Floating translucent glass flower with iridescent liquid mercury core and glowing pistils',
      sampleFullPrompt: 'Octane Render 3D artwork, complex frosted glass and chromatic dispersion caustics, subsurface light scattering through translucent petals, soft studio global illumination, clean studio backdrop, 8k ray-traced reflections.',
      directorNotes: 'Accentuates physical light transmission, refraction, and specular details.',
    },
  },
  {
    id: 'unreal-engine-lumen-world',
    label: 'Unreal Engine 5.4 Lumen World',
    category: '3D & CGI',
    summary: 'Real-time raytraced global illumination, volumetric foliage, atmospheric fog, and Nanite geometry.',
    goal: 'cgi',
    iconName: 'Sparkles',
    aspectHint: '16:9',
    config: {
      style: '3d-render',
      camera: 'wide-angle',
      lighting: 'volumetric',
      composition: 'wide-shot',
      colorGrade: 'teal-and-orange',
      mood: 'awe',
      renderEngine: 'Unreal Engine 5.4, Lumen Global Illumination, Nanite',
      aspectRatio: '16:9',
      negativePrompt: '2d sketch, flat lighting, low-res textures, muddy shadows',
      sampleSubject: 'Ancient overgrown sci-fi sanctuary with towering moss-covered monoliths and sunlight shafts',
      sampleFullPrompt: 'Unreal Engine 5.4 cinematic environment, dynamic Lumen real-time global illumination, dense Nanite botanical micro-details, god rays breaking through a cathedral canopy, photorealistic atmospheric depth.',
      directorNotes: 'Provides grand architectural scale and production video-game fidelity.',
    },
  },
  {
    id: 'isometric-micro-diorama',
    label: 'Isometric Micro Diorama',
    category: '3D & CGI',
    summary: 'Charming 30° orthographic cross-section with miniature tilt-shift depth and miniature props.',
    goal: 'stylized',
    iconName: 'Square',
    aspectHint: '1:1',
    config: {
      style: 'isometric',
      camera: '35mm',
      lighting: 'studio',
      composition: 'negative-space',
      colorGrade: 'vibrant-punch',
      mood: 'whimsical',
      renderEngine: 'Blender Cycles, Stylized PBR',
      aspectRatio: '1:1',
      negativePrompt: 'distorted perspective, flat drawing, dark gritty textures, realistic human gore',
      sampleSubject: 'Tiny cozy ramen shop on a floating chunk of cobblestone street with glowing lanterns',
      sampleFullPrompt: 'Charming 3D isometric diorama rendered in Blender, 30-degree orthographic angle, miniature cutaway cross-section, warm interior lighting glowing through paper screens, clean vibrant stylized materials on solid pastel background.',
      directorNotes: 'Clean, charming geometry with high cutaway readability.',
    },
  },

  // ── Fine Art & Graphic ────────────────────────────────────────────────────
  {
    id: 'ukiyo-e-woodblock-heritage',
    label: 'Japanese Ukiyo-e Woodblock',
    category: 'Fine Art & Graphic',
    summary: 'Edo-period printmaking with dynamic black keylines, mineral pigment gradients, and washi paper.',
    goal: 'artistic',
    iconName: 'Palette',
    aspectHint: '3:4',
    config: {
      style: 'ukiyo-e',
      camera: '35mm',
      lighting: 'overcast',
      composition: 'rule-of-thirds',
      colorGrade: 'muted-editorial',
      mood: 'serene',
      aspectRatio: '3:4',
      negativePrompt: 'photorealistic, 3d render, glossy plastic, modern digital gradients',
      sampleSubject: 'Great crested crane gliding above stormy ocean breakers under a full harvest moon',
      sampleFullPrompt: 'Traditional Japanese Ukiyo-e woodblock print in the style of Hokusai and Hiroshige, bold black sumi ink keylines, bokashi color grading with indigo and vermilion pigments, subtle handmade washi paper fiber texture.',
      directorNotes: 'Harmonious composition with classic printmaking woodcut texture.',
    },
  },
  {
    id: 'risograph-3-color-print',
    label: '3-Color Risograph Art Print',
    category: 'Fine Art & Graphic',
    summary: 'Tactile halftones, slight mechanical ink misregistration, and fluorescent spot colors.',
    goal: 'artistic',
    iconName: 'Sparkles',
    aspectHint: '3:4',
    config: {
      style: 'minimalist',
      camera: '35mm',
      lighting: 'high-key',
      composition: 'negative-space',
      colorGrade: 'vibrant-punch',
      mood: 'joyful',
      aspectRatio: '3:4',
      negativePrompt: 'photorealism, 3d CGI, glossy gradients, raytracing, realistic skin',
      sampleSubject: 'Botanical greenhouse with stylized tropical monstera leaves and geometric potted ceramics',
      sampleFullPrompt: 'Three-color Risograph art print on uncoated cream stock, fluorescent pink, federal blue, and sunflower yellow inks, distinctive dithered halftone grain and slight mechanical overlay misregistration, modern indie graphic illustration.',
      directorNotes: 'Gives an authentic tactile indie-publishing and poster art aesthetic.',
    },
  },
  {
    id: 'baroque-chiaroscuro-masterpiece',
    label: 'Baroque Oil Chiaroscuro',
    category: 'Fine Art & Graphic',
    summary: 'Rembrandt side lighting, deep velvety umber shadows, visible oil impasto brushstrokes.',
    goal: 'artistic',
    iconName: 'Flame',
    aspectHint: '4:5',
    config: {
      style: 'concept-art',
      camera: '85mm',
      lighting: 'chiaroscuro',
      composition: 'portrait',
      colorGrade: 'bleach-bypass',
      mood: 'dramatic',
      aspectRatio: '4:5',
      negativePrompt: 'flat lighting, modern technology, neon colors, digital 3d look, smooth airbrushing',
      sampleSubject: 'Elderly astronomer peering through a brass telescope by a single flickering candle',
      sampleFullPrompt: 'Baroque oil painting masterpiece in the style of Caravaggio and Rembrandt, dramatic chiaroscuro key lighting carving the subject out of rich dark umber shadows, heavy impasto oil texture, classical fine art composition.',
      directorNotes: 'High emotional tension through directional lighting and rich shadow density.',
    },
  },

  // ── Sci-Fi & Cyberpunk ────────────────────────────────────────────────────
  {
    id: 'cyberpunk-rain-slick-alley',
    label: 'Cyberpunk Rain-Slick Metropolis',
    category: 'Sci-Fi & Cyberpunk',
    summary: 'Dense futuristic alley with dual-tone neon reflections, steam plumes, and holographic signage.',
    goal: 'cinematic',
    iconName: 'Zap',
    aspectHint: '16:9',
    config: {
      style: 'cyberpunk',
      camera: '35mm',
      lighting: 'neon',
      composition: 'leading-lines',
      colorGrade: 'teal-and-orange',
      mood: 'dramatic',
      aspectRatio: '16:9',
      negativePrompt: 'sunny daytime, pastoral countryside, historical vintage, flat 2d cartoon',
      sampleSubject: 'Cybernetic courier standing beside an electric motorcycle beneath towering holographic ads',
      sampleFullPrompt: 'Gritty cyberpunk metropolis streetscape at night, torrential rain reflecting intense neon magenta and electric cyan light, steam billowing from subterranean storm drains, dense vertical architecture with holographic Kanji signage.',
      directorNotes: 'Saturates reflections and highlights high-tech urban density.',
    },
  },
  {
    id: 'bioluminescent-alien-canopy',
    label: 'Bioluminescent Alien Canopy',
    category: 'Sci-Fi & Cyberpunk',
    summary: 'Glowing cyan and emerald flora, floating spores, translucent organisms in a twilight alien world.',
    goal: 'artistic',
    iconName: 'Droplets',
    aspectHint: '16:9',
    config: {
      style: 'fantasy',
      camera: 'wide-angle',
      lighting: 'bioluminescent',
      composition: 'wide-shot',
      colorGrade: 'vibrant-punch',
      mood: 'dreamy',
      aspectRatio: '16:9',
      negativePrompt: 'harsh white sunlight, boring office, grey city, low resolution, muddy shadows',
      sampleSubject: 'Wanderer marveling at colossal glowing fungal trees and shimmering floating manta creatures',
      sampleFullPrompt: 'Exotic alien biosphere at dusk, self-illuminating bioluminescent flora glowing with cyan and violet light, ethereal spores drifting through glowing atmospheric fog, deep rich contrast with organic luminescence.',
      directorNotes: 'Uses organic light sources to create an otherworldly sense of wonder.',
    },
  },
  {
    id: 'dark-souls-gothic-ruins',
    label: 'Dark Gothic Souls Ruins',
    category: 'Sci-Fi & Cyberpunk',
    summary: 'Cold pale moonlight, crumbling gothic cathedrals, heavy fog, and somber medieval armor.',
    goal: 'cinematic',
    iconName: 'Moon',
    aspectHint: '16:9',
    config: {
      style: 'concept-art',
      camera: 'low-angle',
      lighting: 'moonlight',
      composition: 'low-angle',
      colorGrade: 'bleach-bypass',
      mood: 'ominous',
      aspectRatio: '16:9',
      negativePrompt: 'bright sunshine, cheerful colors, modern cartoon, clean plastic render',
      sampleSubject: 'Armored knight resting by a dying bonfire amidst towering decaying cathedral spires',
      sampleFullPrompt: 'Dark fantasy concept art in the style of Gothic dark-souls worldbuilding, towering crumbling stone spires silhouetted against a pale crescent moon, thick ground fog rolling across ancient flagstones, desaturated somber color grading.',
      directorNotes: 'High-contrast silhouette framing with somber desaturated color grading.',
    },
  },

  // ── Architecture & Spaces ─────────────────────────────────────────────────
  {
    id: 'brutalist-architectural-horizon',
    label: 'Monolithic Brutalist Concrete',
    category: 'Architecture & Spaces',
    summary: 'Monumental raw concrete geometry, clean linear shadow patterns, and expansive sky negative space.',
    goal: 'photoreal',
    iconName: 'Square',
    aspectHint: '16:9',
    config: {
      style: 'photorealistic',
      camera: 'wide-angle',
      lighting: 'hard-sun',
      composition: 'negative-space',
      colorGrade: 'muted-editorial',
      mood: 'awe',
      aspectRatio: '16:9',
      negativePrompt: 'ornate clutter, floral wallpaper, messy wires, cartoon, oversaturated neon',
      sampleSubject: 'Monumental brutalist concrete civic pavilion with cantilevered roofs against a clear blue sky',
      sampleFullPrompt: 'Architectural photography of monumental brutalist architecture, raw board-formed concrete textures, sharp geometric diagonals casting dramatic hard shadows, vast negative space, captured on tilt-shift wide lens.',
      directorNotes: 'Focuses on strong geometric angles, texture fidelity, and minimal distraction.',
    },
  },
  {
    id: 'scandinavian-pastel-interior',
    label: 'Nordic Pastel Minimal Space',
    category: 'Architecture & Spaces',
    summary: 'Soft indirect window light, light blonde wood, warm plaster walls, and curated designer furniture.',
    goal: 'editorial',
    iconName: 'Smile',
    aspectHint: '4:3',
    config: {
      style: 'editorial',
      camera: '35mm',
      lighting: 'overcast',
      composition: 'rule-of-thirds',
      colorGrade: 'muted-editorial',
      mood: 'cozy',
      aspectRatio: '4:3',
      negativePrompt: 'harsh flash, dark shadows, neon signage, clutter, low quality render',
      sampleSubject: 'Sunlit living room with curved bouclé armchair, light oak flooring, and ceramic vase',
      sampleFullPrompt: 'Scandinavian architectural interior design photograph, soft diffuse daylight pouring through large floor-to-ceiling windows, light birch wood and textured plaster walls, muted organic palette, serene editorial composition.',
      directorNotes: 'Warm, airy minimalism with soft natural light diffusion.',
    },
  },
];

export function getImageRecipeById(id: string): ImageStyleRecipe | undefined {
  const custom = getCustomImageRecipes();
  return custom.find((r) => r.id === id) || IMAGE_SCENE_RECIPES.find((r) => r.id === id);
}

export function filterImageRecipesByCategory(
  recipes: ImageStyleRecipe[],
  category: string
): ImageStyleRecipe[] {
  if (category === 'All') return recipes;
  return recipes.filter((r) => r.category === category);
}

const CUSTOM_RECIPES_STORAGE_KEY = 'pc:custom-image-style-recipes';

export function getCustomImageRecipes(): ImageStyleRecipe[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_RECIPES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomImageRecipe(recipe: ImageStyleRecipe): ImageStyleRecipe[] {
  const existing = getCustomImageRecipes();
  const idx = existing.findIndex((r) => r.id === recipe.id);
  let updated: ImageStyleRecipe[];
  if (idx >= 0) {
    updated = [...existing];
    updated[idx] = recipe;
  } else {
    updated = [recipe, ...existing].slice(0, 30);
  }
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CUSTOM_RECIPES_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save custom image recipe to localStorage', e);
    }
  }
  return updated;
}

export function deleteCustomImageRecipe(id: string): ImageStyleRecipe[] {
  const existing = getCustomImageRecipes();
  const updated = existing.filter((r) => r.id !== id);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CUSTOM_RECIPES_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to delete custom image recipe from localStorage', e);
    }
  }
  return updated;
}

