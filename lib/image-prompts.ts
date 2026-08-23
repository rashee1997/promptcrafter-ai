import { ImagePlatform, ImagePromptInput, ImagePromptReferenceImage } from '@/types';

// ────────────────────────────────────────────────────────────────────────────
// Image Prompt Studio — presets, meta-prompt builders, output parser, gallery
//
// Prompt anatomy follows the 2026 creative-director brief used across
// Midjourney, DALL·E, Stable Diffusion, Flux, Ideogram, and Gemini's Nano
// Banana image models: subject + action + location, style, lighting, camera/
// lens, composition, mood, color grade / film stock, and technical (aspect
// ratio, resolution, in-image text, negative prompt). Prompting guidance is
// grounded in Google's official Nano Banana prompting guides (see
// RESEARCH_IMAGE_PROMPTS.md) and the general image-prompt structure guides
// (Subject + Details + Style + Composition + Lighting + Quality + Extras).
// ────────────────────────────────────────────────────────────────────────────

export interface ChipOption {
  id: string;
  label: string;
  hint: string;
}

export const STYLE_PRESETS: ChipOption[] = [
  { id: 'photorealistic', label: 'Photorealistic', hint: 'True-to-life, 35mm photography, natural skin texture' },
  { id: 'cinematic', label: 'Cinematic', hint: 'Film still, anamorphic lens, teal-and-orange grade' },
  { id: 'editorial', label: 'Editorial Photo', hint: 'Magazine cover, studio-lit, styled subject' },
  { id: 'anime', label: 'Anime & Manga', hint: 'Clean line art, cel shading, expressive eyes' },
  { id: '3d-render', label: '3D Render', hint: 'Octane/Blender look, subsurface scattering, soft GI' },
  { id: 'minimalist', label: 'Minimalist', hint: 'Negative space, restrained palette, clean geometry' },
  { id: 'cyberpunk', label: 'Cyberpunk', hint: 'Neon signage, rain-slick streets, high contrast' },
  { id: 'fantasy', label: 'Fantasy', hint: 'Epic worldbuilding, matte painting, mythic light' },
  { id: 'watercolor', label: 'Watercolor', hint: 'Soft washes, paper texture, loose edges' },
  { id: 'isometric', label: 'Isometric', hint: 'Technical 30° axonometric view, diorama' },
  { id: 'pixel-art', label: 'Pixel Art', hint: 'Retro 16-bit, limited palette, crisp pixels' },
  { id: 'retrofuturism', label: 'Retro-Futurism', hint: 'Mid-century optimism, chrome, pastel interiors' },
  { id: 'product-photography', label: 'Product Photo', hint: 'Studio catalog shot, crisp focus, commercial light' },
  { id: 'noir', label: 'Film Noir', hint: 'Hard shadows, 1940s monochrome, moody streets' },
  { id: 'vaporwave', label: 'Vaporwave', hint: 'Retro synthwave, neon grids, chrome suns' },
  { id: 'ukiyo-e', label: 'Ukiyo-e', hint: 'Japanese woodblock, flat color, bold ink lines' },
  { id: 'papercraft', label: 'Papercraft', hint: 'Cut-paper layers, soft shadows, tactile depth' },
  { id: 'concept-art', label: 'Concept Art', hint: 'Production painting, dramatic key light, worldbuilding' },
];

export const LIGHTING_PRESETS: ChipOption[] = [
  { id: 'golden-hour', label: 'Golden Hour', hint: 'Low warm sun, long shadows' },
  { id: 'studio', label: 'Studio Softbox', hint: 'Even, flattering, controlled' },
  { id: 'neon', label: 'Neon Glow', hint: 'Colored signage spill, night' },
  { id: 'chiaroscuro', label: 'Chiaroscuro', hint: 'Rembrandt, dramatic dark/light' },
  { id: 'overcast', label: 'Overcast', hint: 'Soft diffused daylight' },
  { id: 'moonlight', label: 'Moonlight', hint: 'Cool blue night, deep shadows' },
  { id: 'high-key', label: 'High-Key', hint: 'Bright, airy, low contrast' },
  { id: 'low-key', label: 'Low-Key', hint: 'Dark, moody, single source' },
  { id: 'rim-light', label: 'Rim Light', hint: 'Edge-lit silhouette, dramatic separation' },
  { id: 'backlight', label: 'Backlight', hint: 'Glowing halo behind the subject' },
  { id: 'candlelight', label: 'Candlelight', hint: 'Warm flicker, intimate shadows' },
  { id: 'volumetric', label: 'Volumetric', hint: 'Visible god rays / light shafts' },
  { id: 'bioluminescent', label: 'Bioluminescent', hint: 'Glowing organic blues and greens' },
  { id: 'split', label: 'Split Lighting', hint: 'Half-lit face, half shadow' },
  { id: 'hard-sun', label: 'Hard Sunlight', hint: 'Midday sun, crisp shadows' },
  { id: 'blue-hour', label: 'Blue Hour', hint: 'Cool dusk light just after sunset' },
];

export const MOOD_PRESETS: ChipOption[] = [
  { id: 'serene', label: 'Serene', hint: 'Calm, quiet, meditative' },
  { id: 'epic', label: 'Epic', hint: 'Grand scale, awe, triumph' },
  { id: 'melancholic', label: 'Melancholic', hint: 'Wistful, subdued, introspective' },
  { id: 'joyful', label: 'Joyful', hint: 'Bright, energetic, playful' },
  { id: 'mysterious', label: 'Mysterious', hint: 'Enigmatic, veiled, intriguing' },
  { id: 'dramatic', label: 'Dramatic', hint: 'High stakes, bold contrast' },
  { id: 'dreamy', label: 'Dreamy', hint: 'Soft-focus, ethereal, surreal' },
  { id: 'ominous', label: 'Ominous', hint: 'Threatening, tense, foreboding' },
  { id: 'whimsical', label: 'Whimsical', hint: 'Playful, charming, storybook' },
  { id: 'nostalgic', label: 'Nostalgic', hint: 'Warm memories, faded tenderness' },
  { id: 'tense', label: 'Tense', hint: 'Suspense, coiled energy' },
  { id: 'cozy', label: 'Cozy', hint: 'Warm, safe, inviting' },
  { id: 'awe', label: 'Awe', hint: 'Wondrous, vast, humbling' },
];

export const COMPOSITION_PRESETS: ChipOption[] = [
  { id: 'close-up', label: 'Close-up', hint: 'Tight on the subject, shallow DOF' },
  { id: 'wide-shot', label: 'Wide Shot', hint: 'Subject small in expansive scene' },
  { id: 'low-angle', label: 'Low Angle', hint: 'Heroic, towering perspective' },
  { id: 'aerial', label: 'Aerial', hint: 'Top-down drone perspective' },
  { id: 'eye-level', label: 'Eye Level', hint: 'Neutral, documentary framing' },
  { id: 'portrait', label: 'Portrait', hint: '85mm, subject in left third' },
  { id: 'macro', label: 'Macro', hint: 'Extreme detail, magnified texture' },
  { id: 'rule-of-thirds', label: 'Rule of Thirds', hint: 'Subject on an intersection' },
  { id: 'dutch-angle', label: 'Dutch Angle', hint: 'Tilted horizon, unease' },
  { id: 'extreme-close-up', label: 'Extreme Close-up', hint: 'Detail fill, texture macro feel' },
  { id: 'over-the-shoulder', label: 'Over-the-Shoulder', hint: 'Subject seen past a foreground figure' },
  { id: 'pov', label: 'POV Shot', hint: 'First-person perspective' },
  { id: 'symmetry', label: 'Symmetrical', hint: 'Mirrored balance, formal calm' },
  { id: 'leading-lines', label: 'Leading Lines', hint: 'Lines pull the eye to the subject' },
  { id: 'frame-in-frame', label: 'Frame in Frame', hint: 'Composed within an arch or window' },
  { id: 'negative-space', label: 'Negative Space', hint: 'Subject small, breathing room' },
];

export const ASPECT_RATIOS: { id: string; label: string; hint: string }[] = [
  { id: '1:1', label: '1:1', hint: 'Square — social feeds' },
  { id: '3:2', label: '3:2', hint: 'Classic photo' },
  { id: '4:3', label: '4:3', hint: 'Standard / listings' },
  { id: '16:9', label: '16:9', hint: 'Widescreen / hero' },
  { id: '9:16', label: '9:16', hint: 'Vertical / stories' },
  { id: '2:3', label: '2:3', hint: 'Portrait classic' },
  { id: '3:4', label: '3:4', hint: 'Portrait standard' },
  { id: '4:5', label: '4:5', hint: 'Social portrait / IG' },
  { id: '5:4', label: '5:4', hint: 'Near-square / print' },
  { id: '21:9', label: '21:9', hint: 'Ultrawide / cinematic' },
];

/**
 * Camera / lens presets — photographic hardware and focal-length vocabulary.
 * Controls depth, distortion, perspective, and the "visual DNA" of the shot.
 */
export const CAMERA_PRESETS: ChipOption[] = [
  { id: '35mm', label: '35mm', hint: 'Classic lens, natural perspective' },
  { id: '85mm', label: '85mm Portrait', hint: 'Flattering compression, creamy bokeh' },
  { id: 'wide-angle', label: 'Wide-angle 16mm', hint: 'Expansive perspective, edge stretch' },
  { id: 'macro', label: 'Macro', hint: 'Extreme close detail, shallow DOF' },
  { id: 'fisheye', label: 'Fisheye', hint: 'Distorted, immersive 180° view' },
  { id: 'anamorphic', label: 'Anamorphic', hint: 'Cinematic widescreen flare, oval bokeh' },
  { id: 'telephoto', label: 'Telephoto', hint: 'Compressed depth, flattened layers' },
  { id: 'tilt-shift', label: 'Tilt-shift', hint: 'Miniature diorama focus falloff' },
  { id: 'drone', label: 'Drone / Aerial', hint: 'Top-down, epic scale' },
  { id: 'gopro', label: 'GoPro POV', hint: 'Action-cam wide, immersive feel' },
  { id: 'medium-format', label: 'Medium Format', hint: 'Analog richness, tonal depth' },
  { id: 'disposable', label: 'Disposable Camera', hint: 'Raw nostalgic flash aesthetic' },
];

/**
 * Color grade / film-stock presets — sets the emotional tone of the final image.
 */
export const COLOR_GRADE_PRESETS: ChipOption[] = [
  { id: 'kodak-portra', label: 'Kodak Portra', hint: 'Warm skin tones, soft film look' },
  { id: 'cinestill', label: 'Cinestill 800T', hint: 'Halation neon nights, tungsten' },
  { id: 'teal-orange', label: 'Cinematic Teal & Orange', hint: 'Blockbuster color contrast' },
  { id: 'film-noir', label: 'Film Noir', hint: 'Stark shadows, monochrome or desaturated' },
  { id: 'monochrome', label: 'Monochrome', hint: 'Pure black & white, hard contrast' },
  { id: 'muted', label: 'Desaturated Muted', hint: 'Moody, subdued, restrained' },
  { id: 'vibrant', label: 'High Saturation', hint: 'Punchy, vivid, saturated color' },
  { id: 'pastel', label: 'Pastel', hint: 'Soft airy palette, gentle tones' },
  { id: 'film-80s', label: '1980s Film', hint: 'Warm faded grain, nostalgic' },
  { id: 'sepia', label: 'Sepia', hint: 'Aged archival warmth' },
  { id: 'infrared', label: 'Infrared', hint: 'Dreamlike false color, glowing foliage' },
];

/** Output resolution — Gemini-native 512px/1K/2K/4K; mapped to quality tags elsewhere. */
export const RESOLUTION_OPTIONS: { id: string; label: string; hint: string }[] = [
  { id: '512px', label: '512px', hint: 'Fast / volume draft (Nano Banana 2)' },
  { id: '1K', label: '1K', hint: 'Standard 1024px output' },
  { id: '2K', label: '2K', hint: 'High-res — large screens & prints' },
  { id: '4K', label: '4K', hint: 'Maximum detail — wallpapers & large print' },
];

export const PLATFORM_OPTIONS: {
  id: ImagePlatform;
  label: string;
  hint: string;
  bestFor: string;
  color: string;
}[] = [
  {
    id: 'midjourney',
    label: 'Midjourney',
    hint: 'V8.x / V7 --oref --ow --sref --style raw --ar',
    bestFor: 'Best for composition, lighting & aesthetic beauty (Omni-ref --oref for character lock, --sref for style)',
    color: 'text-[#8f8feb]',
  },
  {
    id: 'gpt-image',
    label: 'GPT Image 2',
    hint: 'Reasoning image model · multilingual text · layout',
    bestFor: 'Arena #1 reasoning model — unmatched in-image text, complex layout, infographics & typography',
    color: 'text-[#7ec699]',
  },
  {
    id: 'gemini',
    label: 'Gemini / Nano Banana',
    hint: 'Pro & 2 · 512px–4K · Web search grounding',
    bestFor: 'Best for creative-director briefs, complex scenes, diagrams & real-time grounding',
    color: 'text-[#8ab4f8]',
  },
  {
    id: 'flux',
    label: 'Flux 2',
    hint: 'Natural language · hex colors · multi-reference',
    bestFor: 'Best for rapid prompt adherence, hex-color precision, and natural language scenes (no negative syntax)',
    color: 'text-[#e879f9]',
  },
  {
    id: 'stable-diffusion',
    label: 'SDXL / SD',
    hint: 'Weighted tokens + negative prompt + sampler',
    bestFor: 'Best for local checkpoints, LoRAs, weighted token control & batch rendering',
    color: 'text-[#e0a458]',
  },
  {
    id: 'ideogram',
    label: 'Ideogram 4.0',
    hint: 'Typography specialist · posters · lettering',
    bestFor: 'Best for stylized graphic design, typography, posters, packaging & signage',
    color: 'text-[#6fc3df]',
  },
  {
    id: 'recraft',
    label: 'Recraft V4.1',
    hint: 'Native vector / SVG · icon sets · clean line art',
    bestFor: 'Best for clean SVG vector marks, flat line art, illustrations & logo design',
    color: 'text-[#f59e0b]',
  },
  {
    id: 'seedream',
    label: 'Seedream 5.x',
    hint: 'Fashion & portrait photorealism · multilingual',
    bestFor: 'Leader for editorial, fashion, photorealistic portraits & multilingual text',
    color: 'text-[#ec4899]',
  },
];

// ────────────────────────────────────────────────────────────────────────────
// Purpose routing — "What matters most for this image?"
//
// A lightweight question at the top of the form that auto-suggests (not
// forces) the matching platform(s). Each option maps to one or more
// platforms and a one-line reason shown in the picker.
// ────────────────────────────────────────────────────────────────────────────

export interface PurposeOption {
  id: string;
  label: string;
  /** Platforms to pre-suggest when this purpose is selected. */
  suggestPlatforms: ImagePlatform[];
  /** One-line reason shown in the picker after selection. */
  reason: string;
}

export const PURPOSE_OPTIONS: PurposeOption[] = [
  {
    id: 'mood-aesthetic',
    label: 'Mood & aesthetic',
    suggestPlatforms: ['midjourney'],
    reason: 'Midjourney — unmatched composition, lighting, and cinematic atmosphere',
  },
  {
    id: 'photorealism',
    label: 'Photorealism & portraits',
    suggestPlatforms: ['gemini', 'seedream', 'stable-diffusion'],
    reason: 'Gemini, Seedream & SD — authentic skin textures, photographic optics, and true-to-life lighting',
  },
  {
    id: 'text-readable',
    label: 'Text & typography',
    suggestPlatforms: ['gpt-image', 'ideogram', 'gemini'],
    reason: 'GPT Image 2, Ideogram 4 & Gemini — 95%+ legible lettering, slogans, packaging, and signs',
  },
  {
    id: 'complex-scene',
    label: 'Complex scene & reasoning',
    suggestPlatforms: ['gemini', 'gpt-image'],
    reason: 'Gemini Nano Banana & GPT Image 2 — reasons through multi-object physics, spatial logic, and infographics',
  },
  {
    id: 'brand-vector',
    label: 'Logo, vector & SVG',
    suggestPlatforms: ['recraft', 'ideogram'],
    reason: 'Recraft V4.1 & Ideogram — native SVG vector geometry, scalable brand marks, and clean iconography',
  },
  {
    id: 'packaging-product',
    label: 'Product & packaging',
    suggestPlatforms: ['gpt-image', 'gemini', 'ideogram'],
    reason: 'GPT Image 2 & Gemini — studio lighting, exact label typography, and photorealistic commercial surfaces',
  },
  {
    id: 'character-consistency',
    label: 'Character / asset consistency',
    suggestPlatforms: ['midjourney', 'flux', 'gemini'],
    reason: 'Midjourney (--oref / --ow), Flux 2 & Gemini — holds facial identity and styling across batches',
  },
  {
    id: 'fast-iteration',
    label: 'Fast exploration & draft',
    suggestPlatforms: ['flux', 'gemini'],
    reason: 'Flux 2 & Gemini Flash — fastest iteration cycle for quick creative exploration',
  },
];

export const DEFAULT_IMAGE_INPUT: ImagePromptInput = {
  subject: '',
  style: 'photorealistic',
  aspectRatio: '16:9',
  platforms: ['gemini', 'gpt-image', 'midjourney', 'flux'],
};

export const EXAMPLE_TOPICS = [
  'A lone lighthouse keeper on a storm-wracked cliff at night',
  'A neon-lit ramen stall in a rainy Tokyo alley, steam rising',
  'A cozy reading nook with a sleeping cat by a glowing fireplace',
  'An astronaut tending a greenhouse on the surface of Mars',
];

// ────────────────────────────────────────────────────────────────────────────
// Meta-prompt builders
// ────────────────────────────────────────────────────────────────────────────

/** Canonical `## ` section headers emitted by the model for each platform. */
const PLATFORM_HEADERS: Record<ImagePlatform, string> = {
  midjourney: 'MIDJOURNEY',
  'gpt-image': 'GPT IMAGE 2',
  dalle: 'GPT IMAGE 2',
  'stable-diffusion': 'STABLE DIFFUSION',
  flux: 'FLUX 2',
  ideogram: 'IDEOGRAM',
  gemini: 'GEMINI / NANO BANANA',
  recraft: 'RECRAFT V4.1',
  seedream: 'SEEDREAM',
};

export function buildImagePromptSystemPrompt(input: ImagePromptInput): string {
  const style = STYLE_PRESETS.find((s) => s.id === input.style);
  const lighting = LIGHTING_PRESETS.find((l) => l.id === input.lighting);
  const mood = MOOD_PRESETS.find((m) => m.id === input.mood);
  const composition = COMPOSITION_PRESETS.find((c) => c.id === input.composition);
  const camera = CAMERA_PRESETS.find((c) => c.id === input.camera);
  const colorGrade = COLOR_GRADE_PRESETS.find((c) => c.id === input.colorGrade);
  const platformList = PLATFORM_OPTIONS.filter((p) => input.platforms.includes(p.id));
  const hasInImageText = !!input.inImageText?.trim();
  const hasRefImages = !!input.referenceImages && input.referenceImages.length > 0;
  const refImages = input.referenceImages ?? [];
  const includeJson = input.outputFormat === 'json' || input.outputFormat === 'both';
  const purposeOpt = input.purpose ? PURPOSE_OPTIONS.find((o) => o.id === input.purpose) : undefined;

  // Build per-platform reference image dialect additions
  const refDialectGuide = hasRefImages
    ? platformList.map((p) => {
        switch (p.id) {
          case 'gemini':
            return `GEMINI REFERENCE IMAGES: The director attached ${refImages.length} reference image(s). Gemini Nano Banana accepts multimodal inputs natively. Describe the subject's key visual traits from the reference (shape, texture, logo placement, facial traits, styling) in words, and structure the brief so Nano Banana synthesizes or edits the reference with high fidelity.`;
          case 'midjourney':
            return `MIDJOURNEY REFERENCE IMAGES: Midjourney V7/V8 supports Omni Reference (--oref) for character/object lock and Style Reference (--sref) for aesthetic transfer. Instruct the user to use --oref <image_url> with --ow 100-400 for character/subject fidelity (default 100; use ~25 for subtle style, 300-400 for exact facial/outfit lock; note: --oref runs on Midjourney V7 / --v 7). For style reference, use --sref <image_url> --sw 100. Describe the key visual markers in words so the text prompt stands alone.`;
          case 'ideogram':
            return `IDEOGRAM REFERENCE IMAGES: Ideogram Character Reference maintains visual identity. Reference key visual traits (hair, outfit, geometry) and instruct the user to upload the reference image when using Character Reference.`;
          case 'gpt-image':
          case 'dalle':
            return `GPT IMAGE 2 REFERENCE IMAGES: GPT Image 2 performs deep visual reasoning. Describe the reference image's visual traits (shape, materials, lighting, typography placement) in natural language paragraphs.`;
          case 'flux':
            return `FLUX 2 REFERENCE IMAGES: Flux 2 supports multi-reference input. Describe the subject's exact form and hex-color references in descriptive natural language.`;
          case 'stable-diffusion':
            return `STABLE DIFFUSION REFERENCE IMAGES: Describe visual traits in weighted tokens and key phrases. Note: "For SDXL/SD, describe visual traits explicitly in tokens, or use ControlNet/IP-Adapter."`;
          case 'recraft':
            return `RECRAFT REFERENCE IMAGES: Recraft supports clean vector and style references. Describe clean vector shapes, path strokes, and palette colors.`;
          case 'seedream':
            return `SEEDREAM REFERENCE IMAGES: Describe facial bone structure, skin tone, fabric weave, and lighting scheme in rich natural language.`;
          default:
            return '';
        }
      }).filter(Boolean).join('\n\n')
    : '';

  const dialectGuide = platformList
    .map((p) => {
      switch (p.id) {
        case 'midjourney':
          return `MIDJOURNEY dialect: concise comma-separated keyword phrases (not full sentences), most important visual tokens first, parameters at the end: --ar ${input.aspectRatio}; use --style raw for photorealistic or flat vector styles; add --stylize 100-250 for house aesthetic (note: high stylize competes with --ow reference weight); for negative prompt, use --no with key exclusions; never wrap the prompt in quotes. Fold in camera lens and film stock ("35mm", "Kodak Portra"). For character/object lock in Midjourney, use Omni Reference: --oref <url> --ow 100 (note: --oref requires --v 7). For cheap exploration, note Midjourney Draft Mode (512x512).`;
        case 'gpt-image':
        case 'dalle':
          return `GPT IMAGE 2 dialect: a structured natural-language creative brief (3-6 rich descriptive sentences) formatted for OpenAI's reasoning image model with Thinking mode. State the aspect ratio in natural language ("wide 16:9 frame"). If in-image text is requested, put the exact wording in quotes and describe typography, placement, and contrast ("centered bold serif text reading '...' with clean kerning"). GPT Image 2 is arena #1 for complex scenes, diagrams, maps, and multilingual typography. No double-dash flags, no negative prompt syntax.`;
        case 'gemini':
          return `GEMINI / NANO BANANA dialect: a natural-language creative brief in full sentences. Nano Banana (Pro for complex reasoning/infographics, 2 for speed & web grounding) is a thinking model. Open with a strong operational verb ("Capture", "Render", "Create", "Design", "Transform", "Place"). Use concrete two-word phrases ("soft golden backlighting, shallow depth of field, 35mm film grain") over single buzzwords. State the aspect ratio in words and request resolution (512px, 1K, 2K, or 4K — e.g. "render at native ${input.resolution ?? '2K'} resolution"). If current events or real-time data are relevant, add a line instructing the model to ground the visual in current search information. Positive framing only — phrase exclusions as "without X". Put in-image text in quotes with typography direction.`;
        case 'flux':
          return `FLUX 2 dialect: natural language description with precise visual nouns, hex-color codes (e.g. #1E3A8A, #FF4D00), and crisp spatial placement. Flux 2 excels at prompt adherence and color precision. Do NOT use Stable Diffusion negative-prompt syntax ("Negative prompt:") or weighted token brackets (word:1.2). State aspect ratio in natural language.`;
        case 'stable-diffusion':
          return `STABLE DIFFUSION / SDXL dialect: dense keyword tokens with emoji-free weighting syntax like (golden hour:1.2), (volumetric fog:1.1), and quality tags; put the negative prompt on its own line starting with "Negative prompt:" with comma-separated exclusions (blurry, deformed, watermark); include a final sampler line: "Steps: 28, CFG: 5.5, Sampler: DPM++ 2M Karras".`;
        case 'ideogram':
          return `IDEOGRAM 4.0 dialect: natural-language prompt optimized for legible in-image text and graphic design. Describe exact text in quotes, typography layout (headline centered, subtext tracked, poster composition), and background contrast.`;
        case 'recraft':
          return `RECRAFT V4.1 dialect: prompt optimized for clean native vector / SVG output, icon sets, or illustrations. Specify stroke weight, geometry, clean path lines, and flat color fills. State "clean vector illustration on an isolated white background, scalable SVG structure".`;
        case 'seedream':
          return `SEEDREAM 5.x dialect: rich editorial description optimized for fashion, photorealistic human portraits, and multilingual text. Specify skin texture, fabric weave, lighting setup (key/fill/rim), and focal perspective.`;
        default:
          return '';
      }
    })
    .filter(Boolean)
    .join('\n\n');

  const fullDialectGuide = dialectGuide + (refDialectGuide ? '\n\nREFERENCE IMAGE DIALECT RULES\n' + refDialectGuide : '');

  return `You are PromptCrafter's Image Direction Studio: a prompt engineer and creative director who writes precise image prompts for Midjourney, GPT Image 2, Google Nano Banana (Gemini Pro/Flash Image), Flux 2, Stable Diffusion SDXL, Ideogram 4, Recraft V4.1, and Seedream 5.

YOUR MISSION
Take the user's subject and options and deliver an image-ready prompt set: a compact universal master prompt built on the full brief anatomy (subject, action, location, style, lighting, camera/lens, composition, mood, color grade, technical), then a tuned prompt for every requested platform dialect. Direct each scene like a film director briefing a studio: name what is in the frame, how it is lit, how it is shot, and how it feels.

PROMPT WRITING RULES (apply to every prompt you output)
1. Fill every slot explicitly: SUBJECT (specific noun + action, never "a woman"/"a scene"), ACTION (what is happening), LOCATION/CONTEXT (where and when), STYLE (one clear visual idiom: ${style?.label ?? 'chosen style'}${style ? ` — ${style.hint}` : ''}), LIGHTING (${lighting ? `${lighting.label} — ${lighting.hint}` : 'choose a deliberate light source, direction, quality, and time of day'}), CAMERA/LENS (${camera ? `${camera.label} — ${camera.hint}` : 'an explicit lens or camera feel'}), COMPOSITION (${composition ? `${composition.label} — ${composition.hint}` : 'explicit framing and camera angle'}), MOOD (${mood ? `${mood.label} — ${mood.hint}` : 'one honest mood word'}), COLOR GRADE (${colorGrade ? `${colorGrade.label} — ${colorGrade.hint}` : 'a deliberate palette or film-stock feel'}), TECHNICAL (aspect ratio ${input.aspectRatio}${input.resolution ? `, ${input.resolution} resolution` : ''}${input.inImageText ? ', in-image text' : ''}${input.negativePrompt ? ' + negative prompt' : ''}).
2. Order matters: lead with the subject and the most important visual elements, then refine; put technical details (ratio, resolution, negative) last.
3. Use concrete visual signals ("35mm lens", "Rembrandt lighting", "Kodak Portra film", "matte painting", "isometric") and ban weak buzzwords: beautiful, stunning, amazing, masterpiece, breathtaking, highly detailed, 4k, 8k (unless SDXL quality tags apply).
4. Be concrete: concrete nouns, materiality, and two-word descriptive phrases beat abstractions ("a navy blue tweed coat" not "a nice jacket"; "soft golden backlighting, shallow depth of field" not "moody cinematic").
5. Positive framing: describe what you WANT, not what you don't want ("an empty street" not "no cars"). Rephrase negative-prompt exclusions as "without X" or "avoiding X" in prose dialects; only SD gets a dedicated negative prompt line.
6. In-image text: when text must appear in the image, wrap the exact wording in quotes and describe the typography ("bold, white, sans-serif", "hand-lettered script"). Never invent in-image text the user didn't request.
7. One visual direction: never stack conflicting styles (no "photorealistic anime oil painting"); commit to a single coherent idiom.
8. Purpose & end-use: ${purposeOpt ? `The user selected the purpose "${purposeOpt.label}" (${purposeOpt.reason}). Shape the framing, composition, typography, and crop specifically for this intent.` : 'Let any stated purpose shape composition, mood, and color.'}
8a. Reference images: when the director attaches reference images, use the platform-specific reference-image conventions above. Describe the reference's key visual traits in words so the text prompt captures specificity even when the image isn't attached.
9. Every prompt must be a single copy-paste-ready block — no commentary around it.
10. Five-part brief anatomy: each prompt you produce must internally cover all five parts — Subject/Task Context, Style & Mood, Reference Material, Constraints, and Core Deliverable.
11. Evidence discipline: when the brief touches factual, branded, or infographic content, flag any uncertain detail as [VERIFY: description] instead of hallucinating specifics.
12. No cross-section duplication: every section must be a DIFFERENT prompt. The MASTER PROMPT is the compact universal version; each platform section re-expresses the same brief in its own dialect.
${includeJson ? `13. Structured JSON Output: In the "## JSON PROMPT" section, emit a valid, compact JSON object with keys: "subject", "action", "setting", "composition", "camera", "lighting", "color", "style", "text", "constraints", "technical".` : ''}

OUTPUT FORMAT — obey EXACTLY. Every section MUST start with a markdown "## " header on its own line — no bold labels, no numbering, no colons. Write these headers, in this order:
## MASTER PROMPT
(A COMPACT universal prompt — 1–2 dense sentences of comma-separated slot phrases covering subject, action, location, style, lighting, camera/lens, composition, mood, color grade, and technical tags. No prose paragraphs, no dialect syntax, no parameters.)

${platformList.map((p) => `## ${PLATFORM_HEADERS[p.id]}\n(Tuned ${p.label} prompt.)`).join('\n\n')}

${includeJson ? `## JSON PROMPT\n(Structured JSON schema prompt for batch reproducibility.)\n\n` : ''}${input.negativePrompt ? `## NEGATIVE PROMPT\n(Comma-separated exclusions derived from the user's request: ${input.negativePrompt}.)\n\n` : ''}PLATFORM DIALECT RULES
${fullDialectGuide}

USER BRIEF
- Subject: "${input.subject}"
${input.purpose ? `- Purpose / End use: ${purposeOpt?.label ?? input.purpose} (${purposeOpt?.reason ?? 'shape composition and framing accordingly'})` : ''}
- Style: ${style?.label ?? input.style}${style ? ` (${style.hint})` : ''}
- Lighting: ${lighting?.label ?? (input.lighting ? `"${input.lighting}"` : 'director\u2019s choice')}
- Camera / lens: ${camera?.label ?? (input.camera ? `"${input.camera}"` : 'director\u2019s choice')}
- Composition: ${composition?.label ?? (input.composition ? `"${input.composition}"` : 'director\u2019s choice')}
- Mood: ${mood?.label ?? (input.mood ? `"${input.mood}"` : 'director\u2019s choice')}
- Color grade / film stock: ${colorGrade?.label ?? (input.colorGrade ? `"${input.colorGrade}"` : 'director\u2019s choice')}
- Aspect ratio: ${input.aspectRatio}
- Resolution: ${input.resolution ?? 'model default'}
${input.inImageText ? `- In-image text: "${input.inImageText}"` : ''}
- Platform dialects to emit: ${platformList.map((p) => p.label).join(', ') || 'master only'}
${input.outputFormat ? `- Output format: ${input.outputFormat}` : ''}
${input.negativePrompt ? `- Negative guidance: ${input.negativePrompt}` : ''}
${hasRefImages ? `- Reference images: ${refImages.length} attached (${refImages.map((r) => r.purpose).join(', ')}). Use platform-specific reference conventions.` : ''}
${input.additionalNotes ? `- Additional notes: ${input.additionalNotes}` : ''}

Now write the prompts. Start directly with "## MASTER PROMPT".`;
}

export function buildImagePromptUserMessage(input: ImagePromptInput): string {
  const extras = [
    input.purpose && `Purpose: ${input.purpose}`,
    input.outputFormat && `Output format: ${input.outputFormat}`,
    input.camera && `Camera: ${CAMERA_PRESETS.find((c) => c.id === input.camera)?.label ?? input.camera}`,
    input.colorGrade && `Color grade: ${COLOR_GRADE_PRESETS.find((c) => c.id === input.colorGrade)?.label ?? input.colorGrade}`,
    input.resolution && `Resolution: ${input.resolution}`,
    input.inImageText && `In-image text: ${input.inImageText}`,
    ...(input.referenceImages && input.referenceImages.length > 0
      ? [`Reference images: ${input.referenceImages.length} attached (${input.referenceImages.map((r) => r.purpose).join(', ')})`]
      : []),
  ].filter(Boolean);
  const extrasLine = extras.length > 0 ? `\n${extras.join('\n')}` : '';
  return `Subject: "${input.subject}"\n\nGenerate the master prompt and ${input.platforms.length} platform-tuned prompts as specified. Start with "## MASTER PROMPT".${extrasLine}`;
}

// ────────────────────────────────────────────────────────────────────────────
// Output parser — splits the streamed document into labeled sections.
// ────────────────────────────────────────────────────────────────────────────

export interface ImagePromptSections {
  research?: string;
  master?: string;
  midjourney?: string;
  dalle?: string; // holds gpt-image / dalle
  'stable-diffusion'?: string;
  flux?: string;
  ideogram?: string;
  gemini?: string;
  recraft?: string;
  seedream?: string;
  json?: string;
  negative?: string;
  /** Any text that appeared before the first recognized section header. */
  preamble?: string;
  /** The full raw document. */
  raw: string;
}

const SECTION_ALIASES: Record<string, keyof ImagePromptSections> = {
  'research brief': 'research',
  'research': 'research',
  'master prompt': 'master',
  'master': 'master',
  'midjourney': 'midjourney',
  'midjourney v7': 'midjourney',
  'midjourney v8': 'midjourney',
  'gpt image 2': 'dalle',
  'gpt image': 'dalle',
  'gpt-image': 'dalle',
  'dall-e 3': 'dalle',
  'dall-e': 'dalle',
  'dall e': 'dalle',
  'dalle': 'dalle',
  'stable diffusion': 'stable-diffusion',
  'stable diffusion / flux': 'stable-diffusion',
  'sdxl': 'stable-diffusion',
  'sd / flux': 'stable-diffusion',
  'flux': 'flux',
  'flux 2': 'flux',
  'flux.1': 'flux',
  'flux pro': 'flux',
  'ideogram': 'ideogram',
  'ideogram 4.0': 'ideogram',
  'ideogram 4': 'ideogram',
  'gemini': 'gemini',
  'gemini / nano banana': 'gemini',
  'gemini/nano banana': 'gemini',
  'gemini prompt': 'gemini',
  'gemini / nano banana prompt': 'gemini',
  'gemini / nano banana pro': 'gemini',
  'nano banana': 'gemini',
  'nano banana prompt': 'gemini',
  'nano-banana': 'gemini',
  'nanobanana': 'gemini',
  'nano banana pro': 'gemini',
  'nano banana 2': 'gemini',
  'gemini 2.5 flash image': 'gemini',
  'gemini 3 pro image': 'gemini',
  'gemini 3.1 flash image': 'gemini',
  'gemini pro image': 'gemini',
  'gemini flash image': 'gemini',
  'recraft': 'recraft',
  'recraft v4.1': 'recraft',
  'recraft v4': 'recraft',
  'seedream': 'seedream',
  'seedream 5.x': 'seedream',
  'seedream 5': 'seedream',
  'json prompt': 'json',
  'json': 'json',
  'structured json': 'json',
  'negative prompt': 'negative',
  'negative': 'negative',
};

/** Lowercase a header title, stripping trailing colons and stray asterisks/spaces. */
function normalizeHeaderTitle(title: string): string {
  return title.replace(/:+$/, '').replace(/^[*\s#]+|[*\s]+$/g, '').trim().toLowerCase();
}

export function parseImagePromptOutput(raw: string): ImagePromptSections {
  const sections: ImagePromptSections = { raw };

  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  let currentKey: keyof ImagePromptSections | null = null;
  const buffer: string[] = [];

  const flush = () => {
    if (currentKey && buffer.length > 0) {
      const text = buffer.join('\n').trim();
      if (text) {
        // Fix D6: Append on duplicate headers rather than silently dropping content
        if (currentKey in sections && typeof sections[currentKey] === 'string') {
          sections[currentKey] = `${sections[currentKey]}\n\n${text}`;
        } else {
          sections[currentKey] = text;
        }
      }
    }
    buffer.length = 0;
  };

  for (const line of lines) {
    // 1. Markdown headers: ## MASTER PROMPT or # MASTER PROMPT
    const md = line.match(/^#{1,3}\s+(.+)$/);
    // 2. Bold-only labels the model often uses instead: **GEMINI / NANO BANANA**
    const bold = line.match(/^\*\*(.+?)\*\*\s*:?\s*$/);
    let title: string | null = null;
    if (md) title = md[1];
    else if (bold) title = bold[1];
    else {
      // 3. Plain label headers ("MASTER PROMPT:")
      const stripped = line.trim().replace(/:+$/, '').replace(/^[*\s]+|[*\s]+$/g, '');
      if (stripped.length > 0 && stripped.length <= 48 && SECTION_ALIASES[normalizeHeaderTitle(stripped)]) {
        title = stripped;
      }
    }
    if (title) {
      const aliasKey = SECTION_ALIASES[normalizeHeaderTitle(title)];
      if (aliasKey) {
        flush();
        currentKey = aliasKey;
        continue;
      }
    }
    if (currentKey) {
      buffer.push(line);
    } else if (line.trim()) {
      buffer.push(line);
      currentKey = 'preamble';
    }
  }
  flush();

  return sections;
}

/** Check if any of the requested platforms did not return a section. */
export function getMissingSections(
  requestedPlatforms: ImagePlatform[],
  sections: ImagePromptSections
): ImagePlatform[] {
  const missing: ImagePlatform[] = [];
  for (const p of requestedPlatforms) {
    const key = p === 'gpt-image' || p === 'dalle' ? 'dalle' : p;
    if (!sections[key as keyof ImagePromptSections]) {
      missing.push(p);
    }
  }
  return missing;
}

/** Ordered display tabs for the output pane: label → section key. */
export function buildOutputTabs(sections: ImagePromptSections): { key: keyof ImagePromptSections; label: string }[] {
  const tabs: { key: keyof ImagePromptSections; label: string }[] = [];
  if (sections.research) tabs.push({ key: 'research', label: 'Research brief' });
  if (sections.master) tabs.push({ key: 'master', label: 'Master prompt' });
  if (sections.midjourney) tabs.push({ key: 'midjourney', label: 'Midjourney' });
  if (sections.dalle) tabs.push({ key: 'dalle', label: 'GPT Image 2' });
  if (sections.gemini) tabs.push({ key: 'gemini', label: 'Gemini / Nano Banana' });
  if (sections.flux) tabs.push({ key: 'flux', label: 'Flux 2' });
  if (sections['stable-diffusion']) tabs.push({ key: 'stable-diffusion', label: 'SDXL / SD' });
  if (sections.ideogram) tabs.push({ key: 'ideogram', label: 'Ideogram' });
  if (sections.recraft) tabs.push({ key: 'recraft', label: 'Recraft V4.1' });
  if (sections.seedream) tabs.push({ key: 'seedream', label: 'Seedream 5.x' });
  if (sections.json) tabs.push({ key: 'json', label: 'JSON Prompt' });
  if (sections.negative) tabs.push({ key: 'negative', label: 'Negative prompt' });
  return tabs;
}

// ────────────────────────────────────────────────────────────────────────────
// Saved gallery — lightweight localStorage collection (separate key, so the
// existing session/provider storage schema is untouched).
// ────────────────────────────────────────────────────────────────────────────

export interface SavedImagePrompt {
  id: string;
  title: string;
  subject: string;
  styleLabel: string;
  platforms: ImagePlatform[];
  aspectRatio: string;
  master: string;
  negative?: string;
  createdAt: number;
  /** Studio mode that produced this brief — lets the gallery badge logos. */
  mode?: 'image' | 'logo';
  /**
   * Full parsed sections (minus the raw document) so the gallery can preview
   * and copy every platform prompt, not just the master. Older saved briefs
   * without this field still work — they fall back to `master`/`negative`.
   */
  sections?: Partial<Omit<ImagePromptSections, 'raw'>>;
  /**
   * The exact form input that produced this brief — enables one-click "reuse"
   * that restores every option back into the studio form. Optional for
   * backward compatibility with previously saved briefs.
   */
  input?: ImagePromptInput;
  /**
   * Reference images the user explicitly chose to keep with this saved prompt.
   * Absent or empty = session-only (the default). Image data blows past
   * localStorage limits fast, so opt-in only.
   */
  referenceImages?: ImagePromptReferenceImage[];
}

const GALLERY_KEY = 'pc:image-prompts';

export function getSavedImagePrompts(): SavedImagePrompt[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(GALLERY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveImagePrompt(item: SavedImagePrompt): SavedImagePrompt[] {
  const saved = getSavedImagePrompts();
  const next = [item, ...saved].slice(0, 24);
  try {
    localStorage.setItem(GALLERY_KEY, JSON.stringify(next));
  } catch {
    // Storage may be unavailable — keep the in-memory result.
  }
  return next;
}

export function deleteSavedImagePrompt(id: string): SavedImagePrompt[] {
  const next = getSavedImagePrompts().filter((s) => s.id !== id);
  try {
    localStorage.setItem(GALLERY_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
}

export function clearSavedImagePrompts(): SavedImagePrompt[] {
  try {
    localStorage.removeItem(GALLERY_KEY);
  } catch {
    // ignore
  }
  return [];
}
