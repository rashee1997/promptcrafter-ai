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
  /**
   * Phase 6 — sub-profile within 'animated' camera vocabulary. Gates which
   * descriptive language family the shot drafter uses. Anime vocabulary
   * stays anime; western-cartoon vocabulary stays western-cartoon. Absent
   * means the base cameraVocabulary is used without sub-profiling.
   */
  animationVocabulary?: AnimationVocabularyProfile;
}

/**
 * Phase 6 — distinct descriptive vocabulary profiles within the 'animated'
 * camera vocabulary. Each profile carries its own word lists that the
 * system prompt injects so styles don't borrow each other's language.
 */
export type AnimationVocabularyProfile =
  | 'anime'
  | 'western-cartoon'
  | 'pixar-3d'
  | 'ghibli'
  | 'claymation';

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
    animationVocabulary: 'claymation',
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
    animationVocabulary: 'pixar-3d',
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
    animationVocabulary: 'ghibli',
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
    animationVocabulary: 'anime',
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
    animationVocabulary: 'anime',
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
    animationVocabulary: 'western-cartoon',
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

// ── Phase 6 — Animation Studio Track ───────────────────────────────────────

/** Families that represent animation styles (trigger animation-principle rules). */
export const ANIMATION_FAMILIES: ReadonlySet<VisualStyle['family']> = new Set([
  'animation-3d',
  'animation-2d',
  'stop-motion',
  'stylized',
]);

/** Returns true when the style's family is an animation family. */
export function isAnimationFamily(family: VisualStyle['family']): boolean {
  return ANIMATION_FAMILIES.has(family);
}

/**
 * Phase 6 — style-lock enforcement: per-family keywords that CONTRADICT
 * the animation style. If a shot prompt contains any of these, the draft
 * card flags it before approval. Each entry is a regex-friendly substring
 * match (lowercased against the prompt text).
 */
export const STYLE_CONFLICT_KEYWORDS: Record<string, string[]> = {
  'claymation-stop-motion': [
    'photorealistic skin texture',
    'photorealistic',
    'smooth cgi',
    'digital perfection',
    'glossy',
    'sharp edges',
    'uncanny valley',
    '3d render',
    'hyperrealistic',
    'photo-realistic',
  ],
  'pixar-3d': [
    'photorealistic',
    'live-action',
    'flat 2d',
    'gritty texture',
    'film grain',
    'hand-drawn',
    'watercolor',
    'visible thumbprint',
  ],
  'ghibli-2d': [
    'photorealistic',
    '3d render',
    'cgi',
    'subsurface scattering',
    'neon colors',
    'sharp vector',
    'glossy',
    'stop-motion',
  ],
  'anime-cel-shaded': [
    'photorealistic',
    '3d render',
    'western cartoon',
    'blurry',
    'low quality',
    'hand-painted',
    'watercolor',
    'visible thumbprint',
  ],
  'anime-hybrid': [
    'pure cgi',
    'unmatched lighting',
    'flat compositing',
    'seam artifacts',
    'hand-painted',
    'watercolor',
  ],
  'modern-cartoon': [
    'photorealistic',
    'gritty',
    'complex shading',
    'film grain',
    'anamorphic',
    'hand-drawn',
    'watercolor',
    'stop-motion',
  ],
  'oil-painting': [
    'clean digital',
    'flat colors',
    'vector art',
    'smooth gradients',
    'cgi',
    'sharp edges',
    'stop-motion',
  ],
  'flat-vector-storybook': [
    '3d render',
    'photorealistic',
    'realistic shadows',
    'glossy',
    'film grain',
    'stop-motion',
  ],
  'isometric-explainer': [
    'photorealistic',
    'organic shapes',
    'hand-drawn',
    'gritty texture',
    'cinematic lighting',
    'stop-motion',
  ],
};

/**
 * Detects style-family conflicts in a shot's prompt text. Returns an array
 * of conflict descriptions (empty = no conflicts detected).
 */
export function detectStyleConflicts(
  promptText: string,
  styleId: string,
): string[] {
  const keywords = STYLE_CONFLICT_KEYWORDS[styleId];
  if (!keywords) return [];
  const lower = promptText.toLowerCase();
  const conflicts: string[] = [];
  for (const kw of keywords) {
    if (lower.includes(kw)) {
      conflicts.push(kw);
    }
  }
  return conflicts;
}

// ── Phase 6 — animation vocabulary sub-profiles ────────────────────────────

/**
 * Per-profile descriptive language. The system prompt injects the matching
 * list so the shot drafter uses vocabulary consistent with the animation
 * tradition — anime language stays anime; western-cartoon stays western.
 */
export const ANIMATION_VOCABULARY_PROFILES: Record<
  AnimationVocabularyProfile,
  { label: string; preferredTerms: string[]; bannedTerms: string[] }
> = {
  anime: {
    label: 'Anime',
    preferredTerms: [
      'speed lines',
      'dramatic perspective',
      'chibi proportions',
      'sakuga fluid motion',
      'impact frame',
      'vignette frame',
      'screen tone',
      'manga-style composition',
      'dramatic close-up',
      'exaggerated expression',
      'dynamic angle',
      'motion smear',
      'dramatic wind',
      'starburst background',
    ],
    bannedTerms: [
      'squash and stretch',
      'cartoon outlines',
      'saturday morning',
      'flat color blocks',
      'bold outlines',
      'exaggerated proportions',
    ],
  },
  'western-cartoon': {
    label: 'Western Cartoon',
    preferredTerms: [
      'squash and stretch',
      'bold outlines',
      'exaggerated expressions',
      'cartoon physics',
      'anticipation pose',
      'follow-through',
      'smear frame',
      'flat color blocks',
      'saturday morning energy',
      'rubber-hose motion',
      'clean silhouette',
      'oversized gestures',
      'broad comedy timing',
    ],
    bannedTerms: [
      'speed lines',
      'sakuga',
      'chibi',
      'screen tone',
      'manga-style',
      'dramatic perspective',
      'sakuga fluid motion',
    ],
  },
  'pixar-3d': {
    label: 'Pixar-Style 3D',
    preferredTerms: [
      'subsurface scattering',
      'rim lighting',
      'expressive eyes',
      'appealing proportions',
      'soft shadow',
      'global illumination',
      'warm key light',
      'character appeal',
      'broad silhouette',
      'emotional lighting',
    ],
    bannedTerms: [
      'speed lines',
      'cel-shading',
      'flat colors',
      'hand-drawn',
      'watercolor',
      'manga',
    ],
  },
  ghibli: {
    label: 'Ghibli-Style 2D',
    preferredTerms: [
      'gentle wind motion',
      'hand-painted backgrounds',
      'watercolor textures',
      'soft pastel palette',
      'natural light',
      'ambient movement',
      'delicate brushwork',
      'atmospheric haze',
      'gentle parallax',
      'organic motion',
    ],
    bannedTerms: [
      'speed lines',
      'dramatic perspective',
      'cgi render',
      'sharp vector',
      'neon',
      'bold outlines',
    ],
  },
  claymation: {
    label: 'Claymation',
    preferredTerms: [
      'visible thumbprints',
      'hand-sculpted',
      'plasticine',
      'frame stutter',
      'matte surfaces',
      'tactile texture',
      'tool marks',
      'finger ridges',
      'soft studio lighting',
      'charming imperfections',
    ],
    bannedTerms: [
      'photorealistic',
      'smooth cgi',
      'digital perfection',
      'glossy',
      'sharp edges',
      '3d render',
      'subsurface scattering',
    ],
  },
};

// ── Phase 6 — animation-principle rules ────────────────────────────────────

/**
 * Injected into the system prompt ONLY when the project uses an animation
 * family style. These rules ensure the drafter applies medium-appropriate
 * animation craft instead of defaulting to live-action realism.
 */
export const ANIMATION_PRINCIPLE_RULES = `ANIMATION PRINCIPLES (active because this project uses an animation style):
- Squash-and-stretch: when a character or object moves fast or impacts something, EXPLICITLY describe the deformation in the prompt (e.g. "the ball squashes flat on impact then stretches tall as it bounces", "her cheeks compress as she lands, then spring back"). Do not imply motion blur as a substitute — name the shape distortion.
- Exaggeration: key emotional beats SHOULD be exaggerated beyond naturalistic proportions — this is correct for the medium, not an error. A shocked expression should be wider than life; a joyful leap should tower. Do not soften animated reactions to "realistic" levels.
- Comedic timing: every comedic beat needs an explicit held pause BEFORE and/or AFTER the punchline moment (e.g. "a one-beat stillness before the vase shatters", "holds the freeze-frame for a beat after the pratfall"). The pause is what makes the joke land — do not rush through the beat.
- Silhouette readability: even in chaotic multi-character shots, keep character silhouettes bold and readable. Describe poses that are distinct in outline (one character hunched, another arms-wide) rather than similar overlapping stances.`;

/**
 * Phase 6 — animation vocabulary block: per-profile language gate.
 * Injected into the system prompt when the style has an animationVocabulary.
 */
export function buildAnimationVocabularyBlock(
  profile: AnimationVocabularyProfile,
): string {
  const data = ANIMATION_VOCABULARY_PROFILES[profile];
  if (!data) return '';
  return `
ANIMATION VOCABULARY (${data.label}):
PREFERRED TERMS — prefer these when describing motion, framing, and effects:
${data.preferredTerms.join(', ')}

DO NOT USE these terms (they belong to a different animation tradition):
${data.bannedTerms.join(', ')}
`;
}

/**
 * Phase 6 — two-character composition guard: soft-warning threshold.
 * Current models reliably struggle with more than 2 characters in frame.
 * Returns a warning string when the character count exceeds the threshold,
 * or null when it's fine.
 */
export function compositionGuard(
  characterCount: number,
): string | null {
  if (characterCount <= 2) return null;
  return `COMPOSITION NOTE: this shot has ${characterCount} characters in frame — current video models reliably struggle with 3+ characters. Consider reducing to 2 characters or splitting into multiple shots for cleaner results.`;
}
