import { ImagePlatform, ImagePromptInput } from '@/types';

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

/** Output resolution — Gemini-native 1K/2K/4K; mapped to quality tags elsewhere. */
export const RESOLUTION_OPTIONS: { id: string; label: string; hint: string }[] = [
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
  { id: 'midjourney', label: 'Midjourney', hint: 'Parameters: --ar --style --stylize --no', bestFor: 'Best for mood, composition, and visual beauty — even weak prompts land in a strong place', color: 'text-[#8f8feb]' },
  { id: 'dalle', label: 'DALL·E', hint: 'Conversational natural-language description', bestFor: 'Fast conversational iteration — quick drafts and creative exploration', color: 'text-[#7ec699]' },
  { id: 'stable-diffusion', label: 'SD / Flux', hint: 'Weighted tokens + negative prompt', bestFor: 'Best for photorealism and large-batch generation — strong prompt adherence', color: 'text-[#e0a458]' },
  { id: 'ideogram', label: 'Ideogram', hint: 'Text-in-image specialist', bestFor: 'Best when the image needs real, readable text — packaging, posters, signage, taglines', color: 'text-[#6fc3df]' },
  {
    id: 'gemini',
    label: 'Gemini / Nano Banana',
    hint: 'Natural-language creative brief · 2K/4K · sharp text',
    bestFor: 'Best for complex scenes, diagrams, infographics, and reliable text rendering',
    color: 'text-[#8ab4f8]',
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
  { id: 'mood-aesthetic', label: 'Mood & aesthetic', suggestPlatforms: ['midjourney'], reason: 'Midjourney — unmatched composition, lighting, and mood' },
  { id: 'photorealism', label: 'Photorealism', suggestPlatforms: ['stable-diffusion'], reason: 'SD / Flux — strongest photorealism and prompt adherence' },
  { id: 'text-readable', label: 'Text must be readable', suggestPlatforms: ['ideogram', 'gemini'], reason: 'Ideogram + Gemini — most reliable text rendering (90–95% accuracy)' },
  { id: 'complex-scene', label: 'Complex scene or diagram', suggestPlatforms: ['gemini'], reason: 'Gemini / Nano Banana — reasons through logic, physics, and composition' },
  { id: 'fast-iteration', label: 'Fast iteration', suggestPlatforms: ['dalle'], reason: 'DALL·E — fastest conversational creative loop' },
];

export const DEFAULT_IMAGE_INPUT: ImagePromptInput = {
  subject: '',
  style: 'photorealistic',
  aspectRatio: '16:9',
  platforms: ['gemini', 'midjourney', 'dalle', 'stable-diffusion'],
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
  dalle: 'DALL-E',
  'stable-diffusion': 'STABLE DIFFUSION',
  flux: 'FLUX',
  ideogram: 'IDEOGRAM',
  gemini: 'GEMINI / NANO BANANA',
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

  const dialectGuide = platformList
    .map((p) => {
      switch (p.id) {
        case 'midjourney':
          return `MIDJOURNEY dialect: concise comma-separated keyword phrases (not full sentences), the most important words first, and parameters appended at the very end with double dashes: --ar ${input.aspectRatio}; use --style raw for photorealistic or photographic styles; add --stylize 100-250 for a bit of house style or --stylize 0 for raw adherence; if a negative prompt is provided, express it as --no with the key exclusions; never wrap the prompt in quotes. Fold in the camera/lens and film-stock vocabulary from the brief as high-signal phrases (e.g. "35mm", "Kodak Portra", "anamorphic"); keep any in-image text to short labels — Midjourney mangles long text.${hasInImageText ? ` WARNING — Midjourney is not reliable for in-image text. Keep any text extremely short (1–2 words) or omit it entirely and recommend Ideogram or Gemini instead for text-accurate rendering.` : ''}`;
        case 'dalle':
          return `DALL-E dialect: a single flowing natural-language paragraph (3-6 rich descriptive sentences) that reads like a creative brief; explicitly state the aspect ratio in words (e.g. "wide 16:9 cinematic frame"); no parameter flags, no comma-stacking, no negative-prompt syntax — exclusions are phrased as "without X" or "avoiding X". If in-image text is requested, put the exact wording in quotes and describe the typography; DALL·E handles short text well.${hasInImageText ? ` WARNING — DALL·E is not reliable for in-image text beyond very short words (1–2 words). For longer or typographically precise text, recommend Ideogram or Gemini instead.` : ''}`;
        case 'stable-diffusion':
          return `STABLE DIFFUSION / FLUX dialect: dense keyword tokens with emoji-free weighting syntax like (golden hour:1.2), (volumetric fog:1.1), and quality tags; put the negative prompt on its own line starting with "Negative prompt:" and list exclusions as comma-separated tokens (blurry, deformed hands, watermark, oversaturated); include sampler guidance only as a final line: "Steps: 28, CFG: 5.5, Sampler: DPM++ 2M Karras". Map the requested output resolution to restrained quality tags (e.g. "4k", "ultra-detailed" at most one or two); avoid rendering long in-image text — short labels only.`;
        case 'ideogram':
          return `IDEOGRAM dialect: natural-language prompt optimized for legible in-image text — describe the exact text/lettering to render in quotes and keep the design layout explicit (centered headline, poster composition); avoid anti-aliasing and cluttered backgrounds that would blur text.`;
        case 'gemini':
          return `GEMINI / NANO BANANA dialect: a natural-language creative brief in full sentences — Nano Banana is a thinking model that reasons about intent, physics, and composition, so act like a creative director, not a keyword list. Open with a strong verb ("Capture", "Render", "Create", "Show") and follow the formula [Subject] + [Action] + [Location/context] + [Composition] + [Style], then layer in lighting, camera/lens, color grade, and mood as prose. State the aspect ratio in words (e.g. "a wide 16:9 frame") and explicitly request the output resolution (1K, 2K or 4K — e.g. "render at native 2K resolution"). Use positive framing: phrase exclusions as "without X" or "avoiding X" ("an empty street" not "no cars") — Nano Banana has no negative-prompt syntax. If in-image text is requested, put the exact wording in quotes and describe the typography ("bold, white, sans-serif", "hand-lettered script"); Gemini renders text better than any other dialect here, so give it the full text spec. Use photographic and cinematic vocabulary: lens (35mm, macro, wide-angle), camera feel (shot on medium-format film, GoPro), lighting design (three-point softbox, golden-hour backlighting, chiaroscuro), and film stock/color grade. If the subject involves real-time data or current events, add one line asking the model to ground the image in current information before rendering.`;
        default:
          return '';
      }
    })
    .filter(Boolean)
    .join('\n\n');

  return `You are PromptCrafter's Image Direction Studio: a world-class creative director, art buyer, and image-prompt engineer who has written prompts for Midjourney, DALL-E, Stable Diffusion, Flux, Ideogram, and Google's Nano Banana image models (Gemini Flash/Pro Image).

YOUR MISSION
Take the user's subject and options and deliver an image-ready prompt set: a compact universal master prompt built on the full brief anatomy (subject, action, location, style, lighting, camera/lens, composition, mood, color grade, technical), then a tuned prompt for every requested platform dialect. Direct each scene like a film director briefing a studio: name what is in the frame, how it is lit, how it is shot, and how it feels.

PROMPT WRITING RULES (apply to every prompt you output)
1. Fill every slot explicitly: SUBJECT (specific noun + action, never "a woman"/"a scene"), ACTION (what is happening), LOCATION/CONTEXT (where and when), STYLE (one clear visual idiom: ${style?.label ?? 'chosen style'}${style ? ` — ${style.hint}` : ''}), LIGHTING (${lighting ? `${lighting.label} — ${lighting.hint}` : 'choose a deliberate light source, direction, quality, and time of day'}), CAMERA/LENS (${camera ? `${camera.label} — ${camera.hint}` : 'an explicit lens or camera feel'}), COMPOSITION (${composition ? `${composition.label} — ${composition.hint}` : 'explicit framing and camera angle'}), MOOD (${mood ? `${mood.label} — ${mood.hint}` : 'one honest mood word'}), COLOR GRADE (${colorGrade ? `${colorGrade.label} — ${colorGrade.hint}` : 'a deliberate palette or film-stock feel'}), TECHNICAL (aspect ratio ${input.aspectRatio}${input.resolution ? `, ${input.resolution} resolution` : ''}${input.inImageText ? ', in-image text' : ''}${input.negativePrompt ? ' + negative prompt' : ''}).
2. Order matters: lead with the subject and the most important visual elements, then refine; put technical details (ratio, resolution, negative) last.
3. Use strong visual signals ("35mm lens", "Rembrandt lighting", "Kodak Portra film", "matte painting", "isometric") and ban weak tokens: beautiful, stunning, amazing, masterpiece, breathtaking, highly detailed, 4k, 8k (unless the dialect genuinely needs quality tags — SD/Flux only).
4. Be concrete: concrete nouns and materiality beat abstractions — "a navy blue tweed coat" not "a nice jacket"; "ornate elven plate armor etched with silver leaf" not "armor". Include textures, materials, and small authentic details.
5. Positive framing: describe what you WANT, not what you don't want ("an empty street" not "no cars"). Rephrase negative-prompt exclusions as "without X" or "avoiding X" in prose dialects; only SD/Flux gets a dedicated negative prompt line.
6. In-image text: when text must appear in the image, wrap the exact wording in quotes and describe the typography ("bold, white, sans-serif", "hand-lettered script"). Never invent in-image text the user didn't request.
7. One visual direction: never stack conflicting styles (no "photorealistic anime oil painting"); commit to a single coherent idiom.
8. Respect purpose: when additional notes give context (audience, brand, use case), let it shape composition, mood, and color.
9. Every prompt must be a single copy-paste-ready block — no commentary around it.
10. No cross-section duplication: every section must be a DIFFERENT prompt. The MASTER PROMPT is the compact universal version; each platform section re-expresses the same brief in its own dialect (keyword phrases, weighted tokens, parameters, or full prose). Never repeat the same text in two sections — in particular, the GEMINI / NANO BANANA section carries the full prose creative brief while the MASTER PROMPT stays short and distinct from it.

OUTPUT FORMAT — obey EXACTLY. Every section MUST start with a markdown "## " header on its own line — no bold labels, no numbering, no colons. Write these headers, in this order:
## MASTER PROMPT
(A COMPACT universal prompt — 1–2 dense sentences of comma-separated slot phrases covering subject, action, location, style, lighting, camera/lens, composition, mood, color grade, and technical tags. No prose paragraphs, no dialect syntax, no parameters — the long description belongs only in the prose dialects below.)

${platformList.map((p) => `## ${PLATFORM_HEADERS[p.id]}\n(Tuned ${p.label} prompt.)`).join('\n\n')}

${input.negativePrompt ? `## NEGATIVE PROMPT\n(Comma-separated exclusions derived from the user's request: ${input.negativePrompt}.)\n\n` : ''}PLATFORM DIALECT RULES
${dialectGuide}

USER BRIEF
- Subject: "${input.subject}"
- Style: ${style?.label ?? input.style}${style ? ` (${style.hint})` : ''}
- Lighting: ${lighting?.label ?? (input.lighting ? `"${input.lighting}"` : 'director\u2019s choice')}
- Camera / lens: ${camera?.label ?? (input.camera ? `"${input.camera}"` : 'director\u2019s choice')}
- Composition: ${composition?.label ?? (input.composition ? `"${input.composition}"` : 'director\u2019s choice')}
- Mood: ${mood?.label ?? (input.mood ? `"${input.mood}"` : 'director\u2019s choice')}
- Color grade / film stock: ${colorGrade?.label ?? (input.colorGrade ? `"${input.colorGrade}"` : 'director\u2019s choice')}
- Aspect ratio: ${input.aspectRatio}
- Resolution: ${input.resolution ?? 'model default'}
${input.inImageText ? `- In-image text: ${input.inImageText}` : ''}
- Platform dialects to emit: ${platformList.map((p) => p.label).join(', ') || 'master only'}
${input.negativePrompt ? `- Negative guidance: ${input.negativePrompt}` : ''}
${input.additionalNotes ? `- Additional notes: ${input.additionalNotes}` : ''}

Now write the prompts. Start directly with "## MASTER PROMPT".`;
}

export function buildImagePromptUserMessage(input: ImagePromptInput): string {
  const extras = [
    input.camera && `Camera: ${CAMERA_PRESETS.find((c) => c.id === input.camera)?.label ?? input.camera}`,
    input.colorGrade && `Color grade: ${COLOR_GRADE_PRESETS.find((c) => c.id === input.colorGrade)?.label ?? input.colorGrade}`,
    input.resolution && `Resolution: ${input.resolution}`,
    input.inImageText && `In-image text: ${input.inImageText}`,
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
  dalle?: string;
  'stable-diffusion'?: string;
  flux?: string;
  ideogram?: string;
  gemini?: string;
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
  'dall-e': 'dalle',
  'dall e': 'dalle',
  'dalle': 'dalle',
  'stable diffusion': 'stable-diffusion',
  'stable diffusion / flux': 'stable-diffusion',
  'sdxl': 'stable-diffusion',
  'flux': 'flux',
  'ideogram': 'ideogram',
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
  'negative prompt': 'negative',
  'negative': 'negative',
};

/** Lowercase a header title, stripping trailing colons and stray asterisks/spaces. */
function normalizeHeaderTitle(title: string): string {
  return title.replace(/:+$/, '').replace(/^[*\s]+|[*\s]+$/g, '').trim().toLowerCase();
}

export function parseImagePromptOutput(raw: string): ImagePromptSections {
  const sections: ImagePromptSections = { raw };

  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  let currentKey: keyof ImagePromptSections | null = null;
  const buffer: string[] = [];

  const flush = () => {
    if (currentKey && buffer.length > 0) {
      const text = buffer.join('\n').trim();
      if (text && !(currentKey in sections)) {
        sections[currentKey] = text;
      }
    }
    buffer.length = 0;
  };

  for (const line of lines) {
    // 1. Markdown headers: ## MASTER PROMPT
    const md = line.match(/^#{1,3}\s+(.+)$/);
    // 2. Bold-only labels the model often uses instead: **GEMINI / NANO BANANA**
    const bold = line.match(/^\*\*(.+?)\*\*\s*:?\s*$/);
    let title: string | null = null;
    if (md) title = md[1];
    else if (bold) title = bold[1];
    else {
      // 3. Plain label headers ("MASTER PROMPT:") — only when the whole line
      //    is a known section name so prose lines are never mistaken for headers.
      const stripped = line.trim().replace(/:+$/, '').replace(/^[*\s]+|[*\s]+$/g, '');
      if (stripped.length > 0 && stripped.length <= 48 && SECTION_ALIASES[normalizeHeaderTitle(stripped)]) {
        title = stripped;
      }
    }
    if (title) {
      flush();
      currentKey = SECTION_ALIASES[normalizeHeaderTitle(title)] ?? null;
      continue;
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

/** Ordered display tabs for the output pane: label → section key. */
export function buildOutputTabs(sections: ImagePromptSections): { key: keyof ImagePromptSections; label: string }[] {
  const tabs: { key: keyof ImagePromptSections; label: string }[] = [];
  if (sections.research) tabs.push({ key: 'research', label: 'Research brief' });
  if (sections.master) tabs.push({ key: 'master', label: 'Master prompt' });
  if (sections.midjourney) tabs.push({ key: 'midjourney', label: 'Midjourney' });
  if (sections.dalle) tabs.push({ key: 'dalle', label: 'DALL·E' });
  if (sections['stable-diffusion']) tabs.push({ key: 'stable-diffusion', label: 'SD / Flux' });
  if (sections.flux) tabs.push({ key: 'flux', label: 'Flux' });
  if (sections.ideogram) tabs.push({ key: 'ideogram', label: 'Ideogram' });
  if (sections.gemini) tabs.push({ key: 'gemini', label: 'Gemini / Nano Banana' });
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
