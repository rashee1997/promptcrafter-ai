// Video Prompt Studio — Phase E: Curated visual style library.
// Each entry's promptTokens come from published, working prompt structures
// rather than invented phrasing. The library replaces the AI-invented style
// options with a first-class, explicit selection that genuinely changes
// model behaviour (Google's Veo guide mentions stop-motion as a style
// direction; labels help models understand the intended look).
//
// cameraVocabulary gates which camera language the shot drafter may use:
//   'cinematic' → lens / film-stock / aperture language applies.
//   'animated'  → shot framing and movement apply, but NOT film stock or lens.
//   'graphic'   → composition and transitions only.

export interface VisualStyle {
  id: string;
  label: string;
  family:
    | 'live-action'
    | 'animation-3d'
    | 'animation-2d'
    | 'stop-motion'
    | 'stylized'
    | 'graphic';
  summary: string;
  /** Injected verbatim into shot prompt construction. */
  promptTokens: string[];
  /** Style-specific things to suppress in the negative prompt. */
  negativeTokens: string[];
  bestFor: string;
  cameraVocabulary: 'cinematic' | 'animated' | 'graphic';
}

// ── Family ordering (display) ───────────────────────────────────────────────

export const STYLE_FAMILY_ORDER: VisualStyle['family'][] = [
  'live-action',
  'stop-motion',
  'animation-3d',
  'animation-2d',
  'stylized',
  'graphic',
];

export const STYLE_FAMILY_LABELS: Record<VisualStyle['family'], string> = {
  'live-action': 'Live Action',
  'stop-motion': 'Stop Motion',
  'animation-3d': '3D Animation',
  'animation-2d': '2D Animation',
  stylized: 'Stylized',
  graphic: 'Graphic & Illustration',
};

// ── The library ─────────────────────────────────────────────────────────────

export const VIDEO_STYLE_LIBRARY: readonly VisualStyle[] = [
  // ── Live Action ─────────────────────────────────────────────────────────
  {
    id: 'live-action-cinematic',
    label: 'Live-Action Cinematic',
    family: 'live-action',
    summary:
      'Photorealistic, cinematic look — film-grade lighting, shallow depth of field, and real lens character.',
    promptTokens: [
      'highly detailed cinematic photograph',
      'movie still',
      'shot on 35mm anamorphic lens',
      'shallow depth of field',
      'bokeh',
      'film grain',
    ],
    negativeTokens: [
      'CGI look',
      'flat lighting',
      'over-sharpened',
      'cartoon',
      'illustration',
    ],
    bestFor: 'Narrative shorts, realistic dramas, documentary-style content, live-action commercials.',
    cameraVocabulary: 'cinematic',
  },

  // ── Stop Motion ─────────────────────────────────────────────────────────
  {
    id: 'claymation-stop-motion',
    label: 'Claymation / Stop-Motion',
    family: 'stop-motion',
    summary:
      'Handmade feel with visible thumbprints, soft studio lighting, and charming imperfections. Great when you want the video to feel human rather than overly digital.',
    promptTokens: [
      'stop-motion clay animation',
      'visible thumbprints',
      'hand-sculpted plasticine clay models',
      'visible tool marks and fingerprint ridges',
      'soft studio lighting',
      'slight imperfections',
      '24fps frame stutter',
      'rich matte colors with tactile surfaces',
    ],
    negativeTokens: [
      'smooth CGI',
      'photorealistic',
      'digital perfection',
      'sharp edges',
      'glossy surfaces',
    ],
    bestFor: 'Brand storytelling, whimsical narratives, artisanal products, children\'s content, handmade aesthetics.',
    cameraVocabulary: 'animated',
  },

  // ── 3D Animation ────────────────────────────────────────────────────────
  {
    id: 'pixar-3d',
    label: 'Pixar-Style 3D',
    family: 'animation-3d',
    summary:
      'Expressive 3D render with subsurface scattering, warm rim lighting, and appealing character design.',
    promptTokens: [
      'Pixar-style 3D render',
      '3D animation style',
      'CGI render aesthetic',
      'expressive eyes',
      'soft subsurface scattering',
      'warm rim lighting',
    ],
    negativeTokens: [
      'photorealistic',
      'live-action',
      'flat 2D',
      'gritty texture',
      'uncanny valley',
    ],
    bestFor: 'Animated shorts, character-driven stories, family-friendly content, product explainers.',
    cameraVocabulary: 'animated',
  },

  // ── 2D Animation ────────────────────────────────────────────────────────
  {
    id: 'ghibli-2d',
    label: 'Ghibli-Style 2D',
    family: 'animation-2d',
    summary:
      'Hand-painted backgrounds, watercolor textures, gentle wind motion, and a soft pastel palette inspired by Studio Ghibli.',
    promptTokens: [
      'hand-drawn 2D animation',
      'hand-painted backgrounds',
      'watercolor textures',
      'gentle wind motion',
      'soft pastel palette',
      'Studio Ghibli aesthetic',
    ],
    negativeTokens: [
      '3D render',
      'photorealistic',
      'neon colors',
      'digital look',
      'sharp vector edges',
    ],
    bestFor: 'Quiet emotional stories, nature scenes, nostalgic or dreamlike narratives, period pieces.',
    cameraVocabulary: 'animated',
  },

  // ── Stylized ────────────────────────────────────────────────────────────
  {
    id: 'anime-cel-shaded',
    label: 'Anime / Cel-Shaded',
    family: 'stylized',
    summary:
      'Crisp lines, vibrant flat colors, dramatic lighting, and intricate detail in the anime tradition.',
    promptTokens: [
      'anime style',
      'masterpiece',
      'high quality',
      'vibrant flat colors',
      'crisp lines',
      'intricate details',
      'soft cinematic lighting',
      'visual novel key visual',
    ],
    negativeTokens: [
      'photorealistic',
      '3D render',
      'western cartoon',
      'blurry',
      'low quality',
    ],
    bestFor: 'Action sequences, dramatic reveals, stylized narratives, manga-inspired content.',
    cameraVocabulary: 'animated',
  },

  {
    id: 'anime-hybrid',
    label: 'Anime-on-Live-Action Hybrid',
    family: 'stylized',
    summary:
      'Live-action plates blended with cel-shaded anime characters, matched lighting, and slight motion blur to bind layers.',
    promptTokens: [
      'live-action plate with anime character',
      'cel-shading',
      'matched lighting between layers',
      'slight motion blur to bind the two layers',
      'composite anime-real blend',
    ],
    negativeTokens: [
      'pure CGI',
      'unmatched lighting',
      'flat compositing',
      'seam artifacts',
      'inconsistent shadows',
    ],
    bestFor: 'Creative commercials, music videos, genre-blending narratives, fantasy-meets-reality.',
    cameraVocabulary: 'animated',
  },

  {
    id: 'oil-painting',
    label: 'Oil Painting / Painterly',
    family: 'stylized',
    summary:
      'Textured brushstrokes, layered pigments, and chiaroscuro lighting — a canvas that breathes.',
    promptTokens: [
      'textured brushstrokes',
      'rich colors',
      'layered pigments',
      'impasto technique',
      'canvas texture',
      'blended transitions',
      'chiaroscuro lighting',
      'palette knife textures',
    ],
    negativeTokens: [
      'photorealistic',
      'clean digital',
      'flat colors',
      'vector art',
      'smooth gradients',
    ],
    bestFor: 'Artistic narratives, period pieces, dream sequences, luxury brand stories.',
    cameraVocabulary: 'animated',
  },

  {
    id: 'modern-cartoon',
    label: 'Modern Cartoon',
    family: 'stylized',
    summary:
      'Clean flat shapes, bold confident outlines, bright cheerful palette, and simple readable scenes.',
    promptTokens: [
      'clean flat shapes',
      'bold confident outlines',
      'bright cheerful palette',
      'simple readable scene',
      'modern cartoon style',
    ],
    negativeTokens: [
      'photorealistic',
      'gritty',
      'complex shading',
      'muted colors',
      'dark palette',
    ],
    bestFor: 'Explainer videos, social media content, upbeat brand messaging, educational content.',
    cameraVocabulary: 'animated',
  },

  // ── Graphic & Illustration ──────────────────────────────────────────────
  {
    id: 'flat-vector-storybook',
    label: 'Flat Vector / Storybook',
    family: 'graphic',
    summary:
      'Whimsical editorial art with modern gouache texture, vibrant pastels, and a matte finish.',
    promptTokens: [
      'flat vector illustration',
      'whimsical editorial art',
      'modern gouache texture',
      'vibrant pastel palette',
      'storybook aesthetic',
      'matte finish',
      '2D flat design',
      'no harsh shadows',
    ],
    negativeTokens: [
      '3D render',
      'photorealistic',
      'dark palette',
      'glossy',
      'realistic shadows',
    ],
    bestFor: 'Editorial content, children\'s books, lifestyle brands, infographics in motion.',
    cameraVocabulary: 'graphic',
  },

  {
    id: 'isometric-explainer',
    label: 'Isometric / Explainer',
    family: 'graphic',
    summary:
      'Angled 3D-like visuals with clean geometry — the look of tech, SaaS, finance, and workflow explainers.',
    promptTokens: [
      'isometric animation',
      'angled 3D-like visuals',
      'clean geometric shapes',
      'tech explainer aesthetic',
      'isometric projection',
      'flat shading with subtle depth',
    ],
    negativeTokens: [
      'photorealistic',
      'organic shapes',
      'hand-drawn',
      'gritty texture',
      'cinematic lighting',
    ],
    bestFor: 'Tech/SaaS demos, product walkthroughs, data visualization, workflow explanations.',
    cameraVocabulary: 'graphic',
  },
] as const;

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Find a style by id. Returns undefined for unknown ids (backward compat). */
export function getVisualStyle(id: string): VisualStyle | undefined {
  return VIDEO_STYLE_LIBRARY.find((s) => s.id === id);
}

/** Group styles by family, preserving family order. */
export function groupStylesByFamily(
  styles: readonly VisualStyle[] = VIDEO_STYLE_LIBRARY,
): { family: VisualStyle['family']; label: string; styles: VisualStyle[] }[] {
  const grouped = new Map<VisualStyle['family'], VisualStyle[]>();
  for (const style of styles) {
    const existing = grouped.get(style.family) ?? [];
    existing.push(style);
    grouped.set(style.family, existing);
  }
  return STYLE_FAMILY_ORDER
    .filter((f) => grouped.has(f))
    .map((f) => ({
      family: f,
      label: STYLE_FAMILY_LABELS[f],
      styles: grouped.get(f)!,
    }));
}
