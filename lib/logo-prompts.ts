import { ImagePlatform, ImagePromptInput } from '@/types';
import { ChipOption } from './image-prompts';

/** Platform ids reused from the image studio list — local copy avoids a runtime import cycle. */
const PLATFORM_IDS: ImagePlatform[] = [
  'midjourney',
  'dalle',
  'stable-diffusion',
  'flux',
  'ideogram',
  'gemini',
];

// ────────────────────────────────────────────────────────────────────────────
// Logo Prompt Studio — mark-type/style/palette presets and meta-prompt builders
//
// Logos are constrained design artifacts, not pictures: they must survive a
// 16px favicon, a billboard, a dark app icon, and a one-color print run. The
// brief anatomy follows the canonical 2026 logo formula (subject + style +
// color palette + vibe + technical constraints) plus the seven design
// principles (simplicity, memorability, versatility, appropriateness,
// distinctiveness, timelessness, intentional color ≤ 3). Grounded in
// RESEARCH_LOGO_PROMPTS.md and the shared image-prompt structure guides.
// ────────────────────────────────────────────────────────────────────────────

/** Structural mark types — what the logo is *built from* (distinct from style). */
export const LOGO_MARK_TYPES: ChipOption[] = [
  { id: 'wordmark', label: 'Wordmark', hint: 'The full name in a custom typeface' },
  { id: 'lettermark', label: 'Lettermark / Monogram', hint: 'Brand initials in stylized type' },
  { id: 'pictorial', label: 'Pictorial mark', hint: 'A recognizable symbol (apple, bird, shell)' },
  { id: 'abstract', label: 'Abstract mark', hint: 'Non-literal shapes that signal a feeling' },
  { id: 'emblem', label: 'Emblem / Badge', hint: 'Text + symbol inside a circle, shield, or crest' },
  { id: 'combination', label: 'Combination', hint: 'Separable icon + name lockup (most versatile)' },
];

/** Visual style idioms for logo marks — the aesthetic, applied to any mark type. */
export const LOGO_STYLE_PRESETS: ChipOption[] = [
  { id: 'minimalist', label: 'Minimalist', hint: 'Clean geometry, generous negative space' },
  { id: 'geometric', label: 'Geometric', hint: 'Precise shapes, golden-ratio construction' },
  { id: 'flat-vector', label: 'Flat Vector', hint: 'Solid two-tone shapes, no gradients or shadows' },
  { id: 'line-art', label: 'Line Art', hint: 'Single-weight strokes, elegant and modern' },
  { id: 'negative-space', label: 'Negative Space', hint: 'Hidden imagery formed by the whitespace' },
  { id: 'vintage-badge', label: 'Vintage Badge', hint: 'Heritage crest/seal, textured, ornamental' },
  { id: 'retro', label: 'Retro / Mid-century', hint: '1950s–70s typography and warm tones' },
  { id: 'hand-drawn', label: 'Hand-drawn', hint: 'Organic sketch, personal, imperfect' },
  { id: 'mascot', label: 'Mascot', hint: 'Character-based, expressive, memorable' },
  { id: '3d', label: '3D / Dimensional', hint: 'Depth and soft shading, glossy Octane look' },
  { id: 'isometric', label: 'Isometric', hint: '30° axonometric 3D, technical diorama' },
  { id: 'gradient', label: 'Gradient', hint: 'Smooth color transitions, modern tech feel' },
  { id: 'luxury', label: 'Luxury / Elegant', hint: 'Thin serifs, gold-foil feel, high-end' },
  { id: 'corporate', label: 'Corporate / Tech', hint: 'Clean sans-serif, structured, trustworthy' },
  { id: 'playful', label: 'Playful', hint: 'Rounded friendly shapes, soft and fun' },
  { id: 'neon', label: 'Neon', hint: 'Glowing signage, nightlife, high energy' },
  { id: 'origami', label: 'Origami', hint: 'Sharp folded facets, layered depth' },
  { id: 'watercolor', label: 'Watercolor', hint: 'Soft artistic washes, handcrafted' },
  { id: 'pixel-art', label: 'Pixel Art', hint: 'Retro 8-bit, crisp limited palette' },
];

/** A palette preset carries real hex colors so the UI can preview the swatch. */
export interface LogoPaletteOption extends ChipOption {
  colors: string[];
}

export const LOGO_PALETTE_PRESETS: LogoPaletteOption[] = [
  { id: 'monochrome', label: 'Monochrome', hint: 'Black & white — maximum versatility', colors: ['#111111', '#ffffff'] },
  { id: 'duotone', label: 'Duotone', hint: 'Black + one accent — modern, editorial', colors: ['#111111', '#ff4d00'] },
  { id: 'pastel', label: 'Pastel', hint: 'Soft friendly tones — wellness, beauty', colors: ['#f9a8d4', '#a5b4fc', '#fde68a'] },
  { id: 'neon', label: 'Neon', hint: 'Electric glow — gaming, nightlife', colors: ['#22d3ee', '#a855f7', '#0f0f23'] },
  { id: 'earthy', label: 'Earthy', hint: 'Natural browns and creams — artisan', colors: ['#5c4033', '#8b5e3c', '#d2b48c'] },
  { id: 'luxury-gold', label: 'Luxury Gold', hint: 'Gold on black — premium, high-end', colors: ['#c9a227', '#1a1a1a'] },
  { id: 'navy-silver', label: 'Navy & Silver', hint: 'Corporate trust — finance, tech', colors: ['#1e3a8a', '#cbd5e1'] },
  { id: 'forest-teal', label: 'Forest & Teal', hint: 'Calm growth — eco, organic', colors: ['#065f46', '#0d9488'] },
  { id: 'ocean', label: 'Ocean Blues', hint: 'Trustworthy blues — SaaS, tech', colors: ['#0ea5e9', '#1e3a8a'] },
  { id: 'crimson-gold', label: 'Crimson & Gold', hint: 'Heritage — academic, sports', colors: ['#9f1239', '#eab308'] },
  { id: 'terracotta-cream', label: 'Terracotta & Cream', hint: 'Warm hospitality — food, craft', colors: ['#c2410c', '#fef3c7'] },
  { id: 'sunset', label: 'Sunset Gradient', hint: 'Playful creative — modern brands', colors: ['#f97316', '#ec4899'] },
  { id: 'primaries', label: 'Vibrant Primaries', hint: 'Bold youthful — consumer brands', colors: ['#ef4444', '#3b82f6', '#eab308'] },
  { id: 'lavender-graphite', label: 'Lavender & Graphite', hint: 'Calm premium — creative studios', colors: ['#7c3aed', '#334155'] },
  { id: 'muted', label: 'Muted Tones', hint: 'Understated neutrals — editorial', colors: ['#78716c', '#d6d3d1'] },
  { id: 'forest-mustard', label: 'Forest & Mustard', hint: 'Grounded contrast — outdoor, craft', colors: ['#14532d', '#ca8a04'] },
];

/** Logo example briefs — subjects that carry a brand name so the wordmark slot
 * stays meaningful when a user clicks one. */
export const LOGO_EXAMPLE_TOPICS = [
  'A specialty coffee roaster called Ember & Oak — artisan, warm, craft',
  'A cybersecurity startup named Vantia — sharp, trustworthy, modern',
  'A playful pet-care brand called Mochi & Co — friendly, soft, rounded',
  'A heritage craft brewery named Ironbridge — old-world, badge, strong',
];

export const DEFAULT_LOGO_INPUT = {
  logoType: 'combination',
  logoStyle: 'minimalist',
  palette: 'monochrome',
};

// ────────────────────────────────────────────────────────────────────────────
// Meta-prompt builders (logo mode)
// ────────────────────────────────────────────────────────────────────────────

/** Same section headers as image mode, so the existing output parser works. */
const LOGO_PLATFORM_HEADERS: Record<ImagePlatform, string> = {
  midjourney: 'MIDJOURNEY',
  dalle: 'DALL-E',
  'stable-diffusion': 'STABLE DIFFUSION',
  flux: 'FLUX',
  ideogram: 'IDEOGRAM',
  gemini: 'GEMINI / NANO BANANA',
};

export function buildLogoPromptSystemPrompt(input: ImagePromptInput): string {
  const markType = LOGO_MARK_TYPES.find((m) => m.id === input.logoType);
  const logoStyle = LOGO_STYLE_PRESETS.find((s) => s.id === input.logoStyle);
  const palette = LOGO_PALETTE_PRESETS.find((p) => p.id === input.palette);
  const mood = input.mood;
  const platformList = PLATFORM_IDS.filter((p) => input.platforms.includes(p));

  const paletteLine = palette
    ? `${palette.label}${input.palette === 'monochrome' ? ' (black & white)' : ''} — ${palette.hint}${palette.colors ? `; reference colors ${palette.colors.join(', ')}` : ''}`
    : input.palette
      ? `"${input.palette}"`
      : 'director\u2019s choice — pick a restrained palette';

  const dialectGuide = platformList
    .map((id) => {
      switch (id) {
        case 'midjourney':
          return `MIDJOURNEY dialect: concise comma-separated keyword phrases (not full sentences), the most important words first, parameters appended at the end: --ar ${input.aspectRatio}; use --style raw for flat/minimal marks; when the brief is a symbol-only concept (no wordmark), add --no text so the model does not garble letters; always add --no watermark, clip art, photorealistic background; if a negative prompt is provided, fold its key exclusions into --no. Put any wordmark in quotes at the end and keep it to short labels — Midjourney mangles long text.`;
        case 'dalle':
          return `DALL-E dialect: a single flowing natural-language paragraph (3-6 rich descriptive sentences) that reads like a brand-design brief; state the mark type, lockup layout, and exact wordmark text in quotes; say "flat vector logo on a white background, ${input.aspectRatio} aspect ratio" and "scales cleanly to a 16px favicon"; no parameter flags, no negative-prompt syntax — exclusions are phrased as "without X" (without gradients, without shadows).`;
        case 'stable-diffusion':
          return `STABLE DIFFUSION / FLUX dialect: dense keyword tokens with weighting syntax like (flat vector:1.2), (minimal:1.1) and restrained quality tags; put the negative prompt on its own line starting with "Negative prompt:" and always include text artifacts, garbled letters, watermark, clip art, photorealistic background (drop gradients/shadows if the style is flat); add a final sampler line "Steps: 28, CFG: 5.5, Sampler: DPM++ 2M Karras"; keep any in-image text to short labels.`;
        case 'ideogram':
          return `IDEOGRAM dialect: natural-language prompt optimized for legible in-image text — Ideogram is the strongest typography model, so put the exact wordmark in quotes, describe the typeface (weight, case, spacing), and make the lockup layout explicit (centered emblem, icon left of name); avoid cluttered backgrounds that blur text.`;
        case 'gemini':
          return `GEMINI / NANO BANANA dialect: a natural-language creative brief in full sentences — act like a brand designer, not a keyword list. Open with a strong verb ("Design", "Create", "Craft") and follow the formula [Brand/subject] + [Mark type & lockup] + [Style idiom] + [Palette, max three colors, named or hexed] + [Vibe/audience] + [Technical: flat vector, white background, ${input.aspectRatio}, scales to 16px]. Put the exact wordmark in quotes and describe the typography ("heavy geometric sans-serif, uppercase, wide tracking"). Use positive framing ("without gradients" not "no gradients") and, when the mark is simple, explicitly request "scales cleanly to a 16px favicon".`;
        default:
          return '';
      }
    })
    .filter(Boolean)
    .join('\n\n');

  return `You are PromptCrafter's Logo Direction Studio: a brand-identity designer and logo-prompt engineer who has written logo prompts for Midjourney, DALL-E, Stable Diffusion, Flux, Ideogram, and Google's Nano Banana image models (Gemini Flash/Pro Image).

YOUR MISSION
Take the user's brand brief and options and deliver a logo-ready prompt set: a compact universal master prompt built on the full logo brief anatomy (brand name/wordmark, mark concept, mark type & lockup, style idiom, color palette, vibe, technical), then a tuned prompt for every requested platform dialect. Direct each brief like a brand designer presenting concepts: name the mark, the palette, the type system, and how it scales.

LOGO DESIGN PRINCIPLES (apply to every prompt you output)
1. SIMPLICITY & SCALABILITY — the mark must read in under two seconds at any size, from a 16px favicon to a billboard. Prefer minimal detail, clean geometry, and generous negative space; never allow intricate illustrations that turn to soup at small sizes. When the brief is a simple mark, explicitly request "scales cleanly to a 16px favicon".
2. ONE OWNABLE CONCEPT — commit to a single distinctive concept (a hidden shape, an unusual color pairing, a meaningful symbol from the brand story). Ban generic clip-art clichés: globe-with-swoosh, gradient spheres, generic chat bubbles, "tech" sparkles.
3. VERSATILITY — design to work on light and dark backgrounds and in a one-color version; unless the chosen style/palette demands otherwise (3D, gradient, neon), keep the mark flat vector with a white or transparent background — no shadows, no photo texture, no photorealistic background.
4. INTENTIONAL COLOR — no more than three colors, each chosen for meaning and contrast. Honor the chosen palette exactly: ${paletteLine}.
5. TYPOGRAPHY IS THE BRAND — when a wordmark or initials appear, put the exact text in quotes and dictate weight/spacing/case ("heavy geometric sans-serif, uppercase, wide tracking"). Never invent in-image text the user didn't request. If no wordmark text is provided and the mark type needs none (pictorial/abstract), do not add text.
6. LOCKUP & LAYOUT — state the arrangement explicitly: icon above name (stacked), icon left of name (horizontal), monogram centered, or emblem with text wrapped inside the shape.${input.logoType === 'combination' ? ' For a combination mark, make the icon and the wordmark work independently.' : ''}
7. MARK TYPE — honor the requested mark type: ${markType ? `${markType.label} — ${markType.hint}` : 'choose the most fitting mark type from wordmark, lettermark/monogram, pictorial, abstract, emblem/badge, or combination'}.
8. STYLE — one coherent visual idiom: ${logoStyle ? `${logoStyle.label} — ${logoStyle.hint}` : input.logoStyle ?? 'chosen style'}. Never stack conflicting styles (no "minimalist ornate mascot").
9. VIBE — let the audience and purpose shape the mood: ${mood ? `${mood}` : 'one honest vibe word (trustworthy, playful, luxurious, energetic…) aligned with the industry'}. When additional notes give context (industry, audience, use case), let it shape the mark concept, palette, and mood.
10. POSITIVE FRAMING — say what you WANT, not what you don't ("clean flat shapes" not "no messy details"); phrase exclusions as "without X" in prose dialects; only SD/Flux gets a dedicated negative-prompt line.
11. TECHNICAL — aspect ratio ${input.aspectRatio}${input.resolution ? `, ${input.resolution} resolution` : ''}; flat vector unless the style demands otherwise; ${input.aspectRatio === '1:1' ? '1:1 suits avatars, app icons, and social profiles.' : ''}
12. Every prompt must be a single copy-paste-ready block — no commentary around it.
13. No cross-section duplication: every section must be a DIFFERENT prompt. The MASTER PROMPT is the compact universal version; each platform section re-expresses the same brief in its own dialect. Never repeat the same text in two sections.

OUTPUT FORMAT — obey EXACTLY. Every section MUST start with a markdown "## " header on its own line — no bold labels, no numbering, no colons. Write these headers, in this order:
## MASTER PROMPT
(A COMPACT universal prompt — 1-2 dense sentences of comma-separated slot phrases covering brand, mark type & lockup, style, palette, vibe, and technical tags. No prose paragraphs, no dialect syntax, no parameters.)

${platformList.map((id) => `## ${LOGO_PLATFORM_HEADERS[id]}\n(Tuned ${id} logo prompt.)`).join('\n\n')}

${input.negativePrompt ? `## NEGATIVE PROMPT\n(Comma-separated exclusions derived from the user's request: ${input.negativePrompt}.)\n\n` : ''}PLATFORM DIALECT RULES
${dialectGuide}

USER BRIEF
- Brand / subject: "${input.subject}"
${input.brandName ? `- Wordmark text to render: "${input.brandName}"` : '- Wordmark text: none requested'}
- Mark type: ${markType?.label ?? input.logoType ?? 'director\u2019s choice'}
- Logo style: ${logoStyle?.label ?? input.logoStyle ?? 'director\u2019s choice'}${logoStyle ? ` (${logoStyle.hint})` : ''}
- Color palette: ${paletteLine}
- Vibe / mood: ${mood ?? 'director\u2019s choice'}
- Aspect ratio: ${input.aspectRatio}
- Resolution: ${input.resolution ?? 'model default'}
${input.inImageText ? `- Extra text inside the mark: ${input.inImageText}` : ''}
- Platform dialects to emit: ${platformList.map((id) => id.toUpperCase()).join(', ') || 'master only'}
${input.negativePrompt ? `- Negative guidance: ${input.negativePrompt}` : ''}
${input.additionalNotes ? `- Additional notes: ${input.additionalNotes}` : ''}

Now write the prompts. Start directly with "## MASTER PROMPT".`;
}

export function buildLogoPromptUserMessage(input: ImagePromptInput): string {
  const extras = [
    input.brandName && `Wordmark text: "${input.brandName}"`,
    input.logoType && `Mark type: ${LOGO_MARK_TYPES.find((m) => m.id === input.logoType)?.label ?? input.logoType}`,
    input.palette && `Color palette: ${LOGO_PALETTE_PRESETS.find((p) => p.id === input.palette)?.label ?? input.palette}`,
    input.resolution && `Resolution: ${input.resolution}`,
  ].filter(Boolean);
  const extrasLine = extras.length > 0 ? `\n${extras.join('\n')}` : '';
  return `Brand brief: "${input.subject}"\n\nGenerate the master prompt and ${input.platforms.length} platform-tuned logo prompts as specified. Start with "## MASTER PROMPT".${extrasLine}`;
}
