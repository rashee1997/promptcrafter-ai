import { ImagePlatform, ImagePromptInput } from '@/types';

// ────────────────────────────────────────────────────────────────────────────
// Image Prompt Studio — presets, meta-prompt builders, output parser, gallery
//
// Prompt anatomy follows the 2026 "six-slot brief" used across Midjourney,
// DALL·E, Stable Diffusion, Flux, and Ideogram: subject, style, lighting,
// composition, mood, and technical (aspect ratio / negative prompt).
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
];

export const ASPECT_RATIOS: { id: string; label: string; hint: string }[] = [
  { id: '1:1', label: '1:1', hint: 'Square — social feeds' },
  { id: '3:2', label: '3:2', hint: 'Classic photo' },
  { id: '4:3', label: '4:3', hint: 'Standard / listings' },
  { id: '16:9', label: '16:9', hint: 'Widescreen / hero' },
  { id: '9:16', label: '9:16', hint: 'Vertical / stories' },
];

export const PLATFORM_OPTIONS: {
  id: ImagePlatform;
  label: string;
  hint: string;
  color: string;
}[] = [
  { id: 'midjourney', label: 'Midjourney', hint: 'Parameters: --ar --style --stylize --no', color: 'text-[#8f8feb]' },
  { id: 'dalle', label: 'DALL·E', hint: 'Conversational natural-language description', color: 'text-[#7ec699]' },
  { id: 'stable-diffusion', label: 'SD / Flux', hint: 'Weighted tokens + negative prompt', color: 'text-[#e0a458]' },
  { id: 'ideogram', label: 'Ideogram', hint: 'Text-in-image specialist', color: 'text-[#6fc3df]' },
];

export const DEFAULT_IMAGE_INPUT: ImagePromptInput = {
  subject: '',
  style: 'photorealistic',
  aspectRatio: '16:9',
  platforms: ['midjourney', 'dalle', 'stable-diffusion'],
  deepResearch: true,
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
};

export function buildImageResearchSystemPrompt(input: ImagePromptInput): string {
  const style = STYLE_PRESETS.find((s) => s.id === input.style);
  const lighting = LIGHTING_PRESETS.find((l) => l.id === input.lighting);
  const mood = MOOD_PRESETS.find((m) => m.id === input.mood);
  const composition = COMPOSITION_PRESETS.find((c) => c.id === input.composition);
  const platformList = PLATFORM_OPTIONS.filter((p) => input.platforms.includes(p.id));

  const dialectGuide = platformList
    .map((p) => {
      switch (p.id) {
        case 'midjourney':
          return `MIDJOURNEY dialect: concise comma-separated keyword phrases (not full sentences), the most important words first, and parameters appended at the very end with double dashes: --ar ${input.aspectRatio}; use --style raw for photorealistic or photographic styles; add --stylize 100-250 for a bit of house style or --stylize 0 for raw adherence; if a negative prompt is provided, express it as --no with the key exclusions; never wrap the prompt in quotes.`;
        case 'dalle':
          return `DALL-E dialect: a single flowing natural-language paragraph (3-6 rich descriptive sentences) that reads like a creative brief; explicitly state the aspect ratio in words (e.g. "wide 16:9 cinematic frame"); no parameter flags, no comma-stacking, no negative-prompt syntax — exclusions are phrased as "without X" or "avoiding X".`;
        case 'stable-diffusion':
          return `STABLE DIFFUSION / FLUX dialect: dense keyword tokens with emoji-free weighting syntax like (golden hour:1.2), (volumetric fog:1.1), and quality tags; put the negative prompt on its own line starting with "Negative prompt:" and list exclusions as comma-separated tokens (blurry, deformed hands, watermark, oversaturated); include sampler guidance only as a final line: "Steps: 28, CFG: 5.5, Sampler: DPM++ 2M Karras".`;
        case 'ideogram':
          return `IDEOGRAM dialect: natural-language prompt optimized for legible in-image text — describe the exact text/lettering to render in quotes and keep the design layout explicit (centered headline, poster composition); avoid anti-aliasing and cluttered backgrounds that would blur text.`;
        default:
          return '';
      }
    })
    .filter(Boolean)
    .join('\n\n');

  return `You are PromptCrafter's Image Direction Studio: a world-class creative director, art buyer, and image-prompt engineer who has written prompts for Midjourney, DALL-E, Stable Diffusion, Flux, and Ideogram.

YOUR MISSION
Take the user's subject and options and deliver a researched, production-ready image-generation brief: first a deep web research pass on the subject's visual culture, then a universal master prompt built on the six-slot anatomy (subject, style, lighting, composition, mood, technical), then a tuned prompt for every requested platform dialect.

RESEARCH PHASE (do this BEFORE writing any prompt)
${
  input.deepResearch
    ? `1. Use Google Search to research the subject and its established visual culture: the iconic way it is depicted, reference artists/art movements, key visual elements, common stylistic tropes, and frequent mistakes that make AI generations of it look generic or wrong.
2. Synthesize the findings into the RESEARCH BRIEF section below: 3-6 tight bullets covering (a) the visual canon of the subject, (b) 2-3 named reference styles/artists/eras that would elevate it, (c) the 2-3 strongest visual elements to anchor the prompt, and (d) what to explicitly avoid. Keep it factual and specific — no filler.
3. Ground your brief in the web results; if the search is unavailable, clearly say "web research unavailable" and fall back to your own knowledge, still filling all four parts.`
    : `1. Skip web search. Write the RESEARCH BRIEF from your own expert knowledge: (a) the visual canon of the subject, (b) 2-3 named reference styles/artists/eras, (c) the 2-3 strongest visual elements to anchor the prompt, (d) what to explicitly avoid. 3-6 tight bullets.`
}

PROMPT WRITING RULES (apply to every prompt you output)
1. Fill all six slots explicitly: SUBJECT (specific noun + action, never "a woman"/"a scene"), STYLE (one clear visual idiom: ${style?.label ?? 'chosen style'}${style ? ` — ${style.hint}` : ''}), LIGHTING (${lighting ? `${lighting.label} — ${lighting.hint}` : 'choose a deliberate light source, direction, quality, and time of day'}), COMPOSITION (${composition ? `${composition.label} — ${composition.hint}` : 'explicit framing, lens, camera angle'}), MOOD (${mood ? `${mood.label} — ${mood.hint}` : 'one honest mood word'}), TECHNICAL (aspect ratio ${input.aspectRatio}${input.negativePrompt ? ' + negative prompt' : ''}).
2. Use strong visual signals ("35mm lens", "Rembrandt lighting", "matte painting", "isometric") and ban weak tokens: beautiful, stunning, amazing, masterpiece, breathtaking, highly detailed, 4k, 8k (unless the dialect genuinely needs quality tags — SD/Flux only).
3. Every prompt must be a single copy-paste-ready block — no commentary around it.

OUTPUT FORMAT — use EXACTLY these section headers, in this order:
## RESEARCH BRIEF
(3-6 bullets from the research phase)

## MASTER PROMPT
(The universal six-slot prompt in clean prose — works everywhere.)

${platformList.map((p) => `## ${PLATFORM_HEADERS[p.id]}\n(Tuned ${p.label} prompt.)`).join('\n\n')}

${input.negativePrompt ? `## NEGATIVE PROMPT\n(Comma-separated exclusions derived from the user's request: ${input.negativePrompt}.)\n\n` : ''}PLATFORM DIALECT RULES
${dialectGuide}

USER BRIEF
- Subject: "${input.subject}"
- Style: ${style?.label ?? input.style}${style ? ` (${style.hint})` : ''}
- Lighting: ${lighting?.label ?? (input.lighting ? `"${input.lighting}"` : 'director\u2019s choice')}
- Mood: ${mood?.label ?? (input.mood ? `"${input.mood}"` : 'director\u2019s choice')}
- Composition: ${composition?.label ?? (input.composition ? `"${input.composition}"` : 'director\u2019s choice')}
- Aspect ratio: ${input.aspectRatio}
- Platform dialects to emit: ${platformList.map((p) => p.label).join(', ') || 'master only'}
${input.negativePrompt ? `- Negative guidance: ${input.negativePrompt}` : ''}
${input.additionalNotes ? `- Additional notes: ${input.additionalNotes}` : ''}

Now research, then write the brief and all prompts. Start directly with "## RESEARCH BRIEF".`;
}

export function buildImageResearchUserMessage(input: ImagePromptInput): string {
  return `Subject: "${input.subject}"\n\nGenerate the researched image brief and ${input.platforms.length} platform-tuned prompts as specified. Start with "## RESEARCH BRIEF".`;
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
  'negative prompt': 'negative',
  'negative': 'negative',
};

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
    const match = line.match(/^#{1,3}\s+(.+)$/);
    if (match) {
      flush();
      const title = match[1].trim().toLowerCase();
      const alias = SECTION_ALIASES[title];
      currentKey = alias ?? null;
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
