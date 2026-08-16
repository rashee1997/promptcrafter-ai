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
// RESEARCH_LOGO_PROMPTS.md, the 2026 trend research (VistaPrint/99designs,
// Superside) and the shared image-prompt structure guides.
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
  // 2026 trend styles (VistaPrint / 99designs research)
  { id: 'storybook-gothic', label: 'Storybook Gothic', hint: 'Mythic anchors, illuminated initials, rich dark palettes' },
  { id: 'pixel-sharp', label: 'Pixel Sharp', hint: 'Clean 8–16px grid, crisp edges, digital-native' },
  { id: 'little-blip', label: 'Little Blip', hint: 'One intentional “off” move — a tilted shape or quirky gap' },
  { id: 'toasty', label: 'Toasty', hint: 'Warm rounded forms, soft hand-touched charm' },
  { id: 'stamp-seal', label: 'Stamp & Seal', hint: 'Postmark-style badge, arced text, distressed edge' },
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
  { id: 'charcoal-mint', label: 'Charcoal & Mint', hint: 'Calm modern contrast — wellness, tech', colors: ['#1f2937', '#6ee7b7'] },
  { id: 'indigo-gold', label: 'Indigo & Gold', hint: 'Premium heritage — law, finance, academia', colors: ['#312e81', '#c9a227'] },
  { id: 'rose-slate', label: 'Rose & Slate', hint: 'Editorial fashion — refined, contemporary', colors: ['#be185d', '#334155'] },
  { id: 'sand-navy', label: 'Sand & Navy', hint: 'Coastal outdoor — travel, craft', colors: ['#d4b483', '#1e3a8a'] },
  { id: 'raspberry-cream', label: 'Raspberry & Cream', hint: 'Playful food — bakery, kids', colors: ['#d81b60', '#fff3e0'] },
  { id: 'olive-rust', label: 'Olive & Rust', hint: 'Grounded organic — outdoor, craft', colors: ['#708238', '#b7410e'] },
];

/**
 * Industry presets — inject the category's expected audience and design
 * direction so the mark reads as *appropriate* (design principle #4), plus a
 * per-industry cliché ban list so it never reads as generic stock.
 */
export const LOGO_INDUSTRY_PRESETS: ChipOption[] = [
  { id: 'tech-saas', label: 'Tech & SaaS', hint: 'Clean, innovative, trustworthy. Ban generic chat bubbles, globes-with-swoosh, and circuit traces.' },
  { id: 'food-beverage', label: 'Food & Beverage', hint: 'Warm, appetite-forward, artisan or playful. Ban stock coffee cups, forks, and wheat stalks.' },
  { id: 'health-wellness', label: 'Health & Wellness', hint: 'Calm, caring, rounded shapes build trust. Ban sterile medical crosses and syringe icons.' },
  { id: 'finance-legal', label: 'Finance & Legal', hint: 'Confident, stable, heritage. Ban clip-art scales, dollar signs, and column clichés.' },
  { id: 'education', label: 'Education & Learning', hint: 'Approachable, open, growth-minded. Ban mortarboards and stacked-book clichés.' },
  { id: 'creative-studio', label: 'Creative & Design', hint: 'Bold, expressive, portfolio-grade — license to be unconventional.' },
  { id: 'retail-fashion', label: 'Retail & Fashion', hint: 'Editorial, ownable, trend-aware. Ban hangers, price tags, and shopping-bag icons.' },
  { id: 'fitness-sports', label: 'Fitness & Sports', hint: 'Kinetic, strong, energetic. Ban barbells, dumbbells, and lightning-bolt clichés.' },
  { id: 'real-estate', label: 'Real Estate & Construction', hint: 'Solid, trustworthy, premium. Ban stock rooftops, keys, and doorway icons.' },
  { id: 'hospitality-travel', label: 'Hospitality & Travel', hint: 'Warm, inviting, worldly. Ban suitcase, plane, and passport-stamp clichés.' },
  { id: 'gaming-esports', label: 'Gaming & Esports', hint: 'Bold, high-energy, character-forward. Ban joysticks, crosshairs, and controller icons.' },
  { id: 'nonprofit-community', label: 'Non-profit & Community', hint: 'Human, hopeful, approachable. Ban clasped-hands and heart-in-hand clichés.' },
  { id: 'beauty-personal-care', label: 'Beauty & Personal Care', hint: 'Refined, tactile, premium. Ban droplet, sparkle, and flower clichés.' },
];

/**
 * Ownable symbol concepts — each carries the MEANING the mark should encode.
 * Logos feel designed when the concept is meaningful to the brand story, not
 * decorative; the meta-prompt directs the model to build the mark around the
 * concept AND its meaning (e.g. a shield must convey protection).
 */
export const LOGO_CONCEPT_PRESETS: ChipOption[] = [
  { id: 'mountain', label: 'Mountain', hint: 'Growth, endurance, ambition — a summit reached' },
  { id: 'leaf', label: 'Leaf / Sprout', hint: 'Organic, fresh, renewal — new growth from a seed' },
  { id: 'shield', label: 'Shield', hint: 'Protection, trust, safety — what the brand defends' },
  { id: 'flame', label: 'Flame', hint: 'Energy, passion, heat — intensity that cannot be ignored' },
  { id: 'orbit', label: 'Orbit / Node', hint: 'Connection, technology, networks — people linked' },
  { id: 'wave', label: 'Wave', hint: 'Flow, calm, adaptability — motion without force' },
  { id: 'tree', label: 'Tree', hint: 'Stability, roots, growth over time — a deep foundation' },
  { id: 'bolt', label: 'Bolt / Spark', hint: 'Speed, electricity, insight — instant ignition' },
  { id: 'compass', label: 'Compass / North', hint: 'Direction, expertise, wayfinding — guiding decisions' },
  { id: 'key', label: 'Key / Unlock', hint: 'Access, solutions, entry — opening what was closed' },
  { id: 'drop', label: 'Water Drop', hint: 'Purity, clarity, hydration — essential and clean' },
  { id: 'sun', label: 'Sun / Rising', hint: 'Optimism, warmth, a new day — positive energy' },
  { id: 'crescent', label: 'Crescent / Moon', hint: 'Mystery, night, calm — the quiet side of things' },
  { id: 'paw', label: 'Paw / Print', hint: 'Companionship, care, loyalty — a friendly presence' },
  { id: 'hexagon', label: 'Hexagon / Cell', hint: 'Structure, precision, community — engineered unity' },
  { id: 'knot', label: 'Knot / Interlock', hint: 'Binding, partnership, strength in connection' },
  { id: 'lantern', label: 'Lantern / Light', hint: 'Guidance, hope, discovery — illuminating the way' },
  { id: 'arrow', label: 'Arrow / Motion', hint: 'Forward progress, direction, speed — momentum' },
  { id: 'lens', label: 'Lens / Aperture', hint: 'Focus, perspective, clarity — seeing clearly' },
  { id: 'nest', label: 'Nest / Home', hint: 'Shelter, belonging, care — a place to land' },
];

/**
 * Shape language — psychology-grounded geometry. Circles signal unity and
 * trust, squares signal stability and professionalism, triangles signal power
 * and ambition; the meta-prompt uses this to make the mark *say* something.
 */
export const LOGO_SHAPE_PRESETS: ChipOption[] = [
  { id: 'circular', label: 'Circles & Curves', hint: 'Unity, community, approachability' },
  { id: 'angular', label: 'Angular / Sharp', hint: 'Power, precision, energy' },
  { id: 'squared', label: 'Square / Stable', hint: 'Trust, professionalism, structure' },
  { id: 'organic', label: 'Organic / Flowing', hint: 'Natural, calm, human' },
  { id: 'symmetrical', label: 'Symmetrical Balance', hint: 'Formal, established, confident' },
  { id: 'asymmetric', label: 'Asymmetric Tension', hint: 'Modern, dynamic, memorable' },
];

/** Typography direction — the wordmark IS the brand when text appears. */
export const LOGO_TYPOGRAPHY_PRESETS: ChipOption[] = [
  { id: 'geometric-sans', label: 'Geometric Sans', hint: 'Modern, clean, tech-forward (Futura, Poppins)' },
  { id: 'humanist-sans', label: 'Humanist Sans', hint: 'Friendly, approachable, contemporary (Inter, Source Sans)' },
  { id: 'modern-serif', label: 'Modern Serif', hint: 'Editorial, elegant, trustworthy (Didot, Playfair)' },
  { id: 'slab-serif', label: 'Slab Serif', hint: 'Confident, sturdy, editorial (Rockwell, Archer)' },
  { id: 'script', label: 'Script / Handwritten', hint: 'Personal, artisanal, expressive' },
  { id: 'monospace', label: 'Monospace / Technical', hint: 'Engineered, digital-native, precise' },
  { id: 'display-custom', label: 'Custom Display', hint: 'Ownable, distinctive, character-led lettering' },
  { id: 'no-text', label: 'No Typography', hint: 'Symbol-only mark — pure and most scalable' },
];

/** Lockup layout — how the symbol and the name sit together. */
export const LOGO_LOCKUP_PRESETS: ChipOption[] = [
  { id: 'horizontal', label: 'Horizontal', hint: 'Icon left of the wordmark — best for headers & docs' },
  { id: 'stacked', label: 'Stacked', hint: 'Icon above the wordmark — compact, app-icon friendly' },
  { id: 'emblem', label: 'Emblem / Badge', hint: 'Text locked inside the mark — heritage & seals' },
  { id: 'mark-only', label: 'Mark Only', hint: 'Pure symbol, no text — most scalable (app icon)' },
];

/** Hidden-meaning / negative-space treatments — the FedEx-arrow class of idea. */
export const LOGO_HIDDEN_MEANING_PRESETS: ChipOption[] = [
  { id: 'none', label: 'No Hidden Element', hint: 'A clean, direct mark' },
  { id: 'negative-space', label: 'Negative-Space Cut', hint: 'A second shape carved out of the first (FedEx arrow)' },
  { id: 'hidden-glyph', label: 'Hidden Initial', hint: 'A letter or symbol concealed inside the mark' },
  { id: 'double-meaning', label: 'Double-Meaning Form', hint: 'One form reads as two objects at once' },
];

/** Versatility targets — where the logo must survive; drives small-size + one-color constraints. */
export const LOGO_USAGE_PRESETS: ChipOption[] = [
  { id: 'app-icon', label: 'App Icon / Avatar', hint: 'Must read at 32px, rounded-square, favicon-safe' },
  { id: 'website', label: 'Website & Digital', hint: 'Header lockups, favicon, dark & light backgrounds' },
  { id: 'packaging', label: 'Packaging', hint: 'Emboss/foil friendly, works on kraft & white' },
  { id: 'print', label: 'Print & Signage', hint: 'One-color print run, ink-safe, high contrast' },
  { id: 'apparel', label: 'Apparel / Merch', hint: 'Stitchable, embroidery-friendly, bold shapes' },
];

/** Concept boldness — how safe vs. ownable the design should be. */
export const LOGO_BOLDNESS_PRESETS: ChipOption[] = [
  { id: 'safe', label: 'Safe', hint: 'Category-proven — fit in and look like the category at its best' },
  { id: 'balanced', label: 'Balanced', hint: 'Familiar shape with one ownable twist' },
  { id: 'daring', label: 'Daring', hint: 'Unconventional and memorable — still legible at small sizes' },
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
  industry: undefined as string | undefined,
  concept: undefined as string | undefined,
  shapeLanguage: undefined as string | undefined,
  typography: undefined as string | undefined,
  lockup: undefined as string | undefined,
  hiddenMeaning: undefined as string | undefined,
  usage: undefined as string[] | undefined,
  boldness: undefined as string | undefined,
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

/** Resolve a preset label from any of the logo option pools, falling back to the raw id. */
function labelOf(pool: ChipOption[], id: string | undefined): string | undefined {
  if (!id) return undefined;
  return pool.find((o) => o.id === id)?.label ?? id;
}

/** Resolve a preset label + hint as one line (used in USER BRIEF + principles). */
function hintOf(pool: ChipOption[], id: string | undefined): string | undefined {
  if (!id) return undefined;
  const opt = pool.find((o) => o.id === id);
  return opt ? `${opt.label} — ${opt.hint}` : id;
}

export function buildLogoPromptSystemPrompt(input: ImagePromptInput): string {
  const markType = LOGO_MARK_TYPES.find((m) => m.id === input.logoType);
  const logoStyle = LOGO_STYLE_PRESETS.find((s) => s.id === input.logoStyle);
  const palette = LOGO_PALETTE_PRESETS.find((p) => p.id === input.palette);
  const mood = input.mood;
  const platformList = PLATFORM_IDS.filter((p) => input.platforms.includes(p));

  const paletteLine = palette
    ? `${palette.label}${input.palette === 'monochrome' ? ' (pure black & white, high-contrast silhouette, no gradients — designed for single-color print)' : ''} — ${palette.hint}${palette.colors ? `; reference colors ${palette.colors.join(', ')}` : ''}`
    : input.palette
      ? `"${input.palette}"`
      : 'director\u2019s choice — pick a restrained palette';

  const dialectGuide = platformList
    .map((id) => {
      switch (id) {
        case 'midjourney':
          return `MIDJOURNEY dialect: concise comma-separated keyword phrases (not full sentences), the most important words first, parameters appended at the end: --ar ${input.aspectRatio}; use --style raw for flat/minimal marks; when the brief is a symbol-only concept (no wordmark), add --no text so the model does not garble letters; always add --no watermark, clip art, photorealistic background; if a negative prompt is provided, fold its key exclusions into --no. Put any wordmark in quotes at the end and keep it to short labels — Midjourney mangles long text.`;
        case 'dalle':
          return `DALL-E dialect: a single flowing natural-language paragraph (3-6 rich descriptive sentences) that reads like a brand-design brief; state the mark type, lockup layout, concept meaning, and exact wordmark text in quotes; say "flat vector logo on a white background, ${input.aspectRatio} aspect ratio" and "scales cleanly to a 16px favicon"; no parameter flags, no negative-prompt syntax — exclusions are phrased as "without X" (without gradients, without shadows).`;
        case 'stable-diffusion':
          return `STABLE DIFFUSION / FLUX dialect: dense keyword tokens with weighting syntax like (flat vector:1.2), (minimal:1.1) and restrained quality tags; put the negative prompt on its own line starting with "Negative prompt:" and always include text artifacts, garbled letters, watermark, clip art, photorealistic background (drop gradients/shadows if the style is flat); add a final sampler line "Steps: 28, CFG: 5.5, Sampler: DPM++ 2M Karras"; keep any in-image text to short labels.`;
        case 'ideogram':
          return `IDEOGRAM dialect: natural-language prompt optimized for legible in-image text — Ideogram is the strongest typography model, so put the exact wordmark in quotes, describe the typeface (weight, case, spacing), and make the lockup layout explicit (centered emblem, icon left of name); avoid cluttered backgrounds that blur text.`;
        case 'gemini':
          return `GEMINI / NANO BANANA dialect: a natural-language creative brief in full sentences — act like a brand designer, not a keyword list. Open with a strong verb ("Design", "Create", "Craft") and follow the formula [Brand/subject] + [Concept & meaning] + [Mark type & lockup] + [Style idiom] + [Shape language] + [Palette, max three colors, named or hexed] + [Vibe/audience] + [Technical: flat vector, white background, ${input.aspectRatio}, scales to 16px]. Put the exact wordmark in quotes and describe the typography ("heavy geometric sans-serif, uppercase, wide tracking"). Use positive framing ("without gradients" not "no gradients") and, when the mark is simple, explicitly request "scales cleanly to a 16px favicon". When the palette is monochrome, say "designed in pure black on white, high-contrast silhouette, no gradients, single-color print-ready".`;
        default:
          return '';
      }
    })
    .filter(Boolean)
    .join('\n\n');

  return `You are PromptCrafter's Logo Direction Studio: a senior brand-identity designer and logo-prompt engineer who has written logo prompts for Midjourney, DALL-E, Stable Diffusion, Flux, Ideogram, and Google's Nano Banana image models (Gemini Flash/Pro Image).

YOUR MISSION
Take the user's brand brief and options and deliver a logo-ready prompt set: a compact universal master prompt built on the full logo brief anatomy (brand name/wordmark, mark concept & meaning, mark type & lockup, style idiom, shape language, typography, color palette, vibe, usage, technical), then a tuned prompt for every requested platform dialect. Present each brief the way a senior brand designer presents concepts: name the concept, what it means, the mark, the type system, and how it scales. The prompt must read like a design brief, not like a stock-photo description.

LOGO DESIGN PRINCIPLES (apply to every prompt you output)
1. ONE OWNABLE CONCEPT WITH MEANING — Commit to a single distinctive concept and make the mark encode its MEANING, not just its picture: a shield must convey protection, a wave must convey calm motion, a mountain must convey ambition.${input.concept ? ` The user chose the concept "${labelOf(LOGO_CONCEPT_PRESETS, input.concept)}" — ${hintOf(LOGO_CONCEPT_PRESETS, input.concept)}. Build the mark around it and name what it means in the prompt.` : ' When no concept is chosen, invent one from the brand story (never a decorative afterthought) and state its meaning explicitly.'} Ban generic clip-art clichés: globe-with-swoosh, gradient spheres, generic chat bubbles, "tech" sparkles, stock leaves, stock coffee cups.
2. SIMPLICITY & SCALABILITY — the mark must read in under two seconds at any size, from a 16px favicon to a billboard. Prefer minimal detail, clean geometry, and generous negative space; never allow intricate illustrations that turn to soup at small sizes. When the mark is simple, explicitly request "scales cleanly to a 16px favicon".
3. INDUSTRY & AUDIENCE APPROPRIATENESS — the mark must feel native to its category:${input.industry ? ` the user chose "${hintOf(LOGO_INDUSTRY_PRESETS, input.industry)}". Enforce the category's expected visual language and ban the category's clichés.` : ' infer the industry from the brief and match its expected visual language (trustworthy and structured for finance, warm and rounded for healthcare, kinetic for fitness) without copying its clichés.'}
4. SHAPE LANGUAGE — geometry communicates before anyone reads a word:${input.shapeLanguage ? ` the user chose "${hintOf(LOGO_SHAPE_PRESETS, input.shapeLanguage)}".` : ' choose a shape language that fits the brand (circles = unity/approachability, squares = stability/trust, triangles = power/energy, organic = natural/calm) and state it explicitly.'}
5. INTENTIONAL COLOR — no more than three colors, each chosen for meaning and contrast. Honor the chosen palette exactly: ${paletteLine}. For monochrome, say "pure black on white, high-contrast silhouette, no gradients — designed for single-color print", never just "black and white".
6. TYPOGRAPHY IS THE BRAND — when a wordmark or initials appear, put the exact text in quotes and dictate the type system concretely:${input.typography ? ` use "${hintOf(LOGO_TYPOGRAPHY_PRESETS, input.typography)}"` : ' choose a type direction'} and specify weight, case, and spacing (e.g. "heavy geometric sans-serif, uppercase, wide tracking"). Never invent in-image text the user didn't request. If no wordmark text is provided and the mark type needs none (pictorial/abstract), do not add text.
7. LOCKUP & LAYOUT — state the arrangement explicitly:${input.lockup ? ` the user chose "${hintOf(LOGO_LOCKUP_PRESETS, input.lockup)}"` : ' icon above name (stacked), icon left of name (horizontal), monogram centered, or emblem with text wrapped inside the shape'}.${input.logoType === 'combination' ? ' For a combination mark, make the icon and the wordmark work independently.' : ''}
8. HIDDEN MEANING & NEGATIVE SPACE — the smartest logos hide a second idea in the whitespace:${input.hiddenMeaning ? ` the user chose "${hintOf(LOGO_HIDDEN_MEANING_PRESETS, input.hiddenMeaning)}" — direct the mark to deliver it (e.g. "the arrow between the E and the x", "the initials hidden in the negative space").` : ' if the concept naturally supports one, propose a hidden second meaning in the master prompt.'}
9. VERSATILITY / WHERE IT WORKS — design to work on light and dark backgrounds and in a one-color version:${input.usage && input.usage.length > 0 ? ` the user needs it to work for ${input.usage.map((u) => labelOf(LOGO_USAGE_PRESETS, u) ?? u).join(', ')} — encode the matching constraints` : ' encode constraints for web, print, and app-icon use'}; unless the chosen style/palette demands otherwise (3D, gradient, neon), keep the mark flat vector with a white or transparent background — no shadows, no photo texture, no photorealistic background.
10. BOLDNESS CALIBRATION —${input.boldness ? ` the user chose "${hintOf(LOGO_BOLDNESS_PRESETS, input.boldness)}" — tune how conventional vs. unconventional the concept is` : ' tune the concept to feel ownable but still legible'} (safe = category-proven, balanced = familiar with one twist, daring = unconventional yet scalable).
11. MARK TYPE — honor the requested mark type: ${markType ? `${markType.label} — ${markType.hint}` : 'choose the most fitting mark type from wordmark, lettermark/monogram, pictorial, abstract, emblem/badge, or combination'}.
12. STYLE — one coherent visual idiom: ${logoStyle ? `${logoStyle.label} — ${logoStyle.hint}` : input.logoStyle ?? 'chosen style'}. Never stack conflicting styles (no "minimalist ornate mascot").
13. VIBE — let the audience and purpose shape the mood: ${mood ? `${mood}` : 'one honest vibe word (trustworthy, playful, luxurious, energetic…) aligned with the industry'}. When additional notes give context (industry, audience, use case), let it shape the mark concept, palette, and mood.
14. POSITIVE FRAMING — say what you WANT, not what you don't ("clean flat shapes" not "no messy details"); phrase exclusions as "without X" in prose dialects; only SD/Flux gets a dedicated negative-prompt line.
15. TECHNICAL — aspect ratio ${input.aspectRatio}${input.resolution ? `, ${input.resolution} resolution` : ''}; flat vector unless the style demands otherwise; ${input.aspectRatio === '1:1' ? '1:1 suits avatars, app icons, and social profiles.' : ''}
16. DESIGN VOCABULARY, NOT BUZZWORDS — this is the single most important writing rule. The words "sleek", "modern", "professional", "corporate", "futuristic", "innovative", "dynamic", "elegant", "creative", "premium", "vibrant", "clean" are FORBIDDEN as standalone descriptors — they are what makes AI logos look like stock. Every prompt must instead describe concrete visual form: "a single continuous line", "a negative-space cut", "three concentric arcs", "a heavy geometric sans-serif, uppercase, wide tracking", "a pure black silhouette on white". If you catch yourself using a buzzword, replace it with the specific shape, stroke, type, or palette that produces that feeling.
17. Every prompt must be a single copy-paste-ready block — no commentary around it.
18. No cross-section duplication: every section must be a DIFFERENT prompt. The MASTER PROMPT is the compact universal version; each platform section re-expresses the same brief in its own dialect. Never repeat the same text in two sections.

OUTPUT FORMAT — obey EXACTLY. Every section MUST start with a markdown "## " header on its own line — no bold labels, no numbering, no colons. Write these headers, in this order:
## MASTER PROMPT
(A COMPACT universal prompt — 1-2 dense sentences of comma-separated slot phrases covering brand, mark concept + meaning, mark type & lockup, style, shape language, typography, palette, vibe, usage, and technical tags. No prose paragraphs, no dialect syntax, no parameters.)

${platformList.map((id) => `## ${LOGO_PLATFORM_HEADERS[id]}\n(Tuned ${id} logo prompt.)`).join('\n\n')}

${input.negativePrompt ? `## NEGATIVE PROMPT\n(Comma-separated exclusions derived from the user's request: ${input.negativePrompt}.)\n\n` : ''}PLATFORM DIALECT RULES
${dialectGuide}

USER BRIEF
- Brand / subject: "${input.subject}"
${input.brandName ? `- Wordmark text to render: "${input.brandName}"` : '- Wordmark text: none requested'}
- Mark type: ${markType?.label ?? input.logoType ?? 'director\u2019s choice'}
- Logo style: ${logoStyle?.label ?? input.logoStyle ?? 'director\u2019s choice'}${logoStyle ? ` (${logoStyle.hint})` : ''}
- Color palette: ${paletteLine}
${input.industry ? `- Industry / audience: ${hintOf(LOGO_INDUSTRY_PRESETS, input.industry)}` : ''}
${input.concept ? `- Ownable concept: ${hintOf(LOGO_CONCEPT_PRESETS, input.concept)}` : ''}
${input.shapeLanguage ? `- Shape language: ${hintOf(LOGO_SHAPE_PRESETS, input.shapeLanguage)}` : ''}
${input.typography ? `- Typography direction: ${hintOf(LOGO_TYPOGRAPHY_PRESETS, input.typography)}` : ''}
${input.lockup ? `- Lockup layout: ${hintOf(LOGO_LOCKUP_PRESETS, input.lockup)}` : ''}
${input.hiddenMeaning ? `- Hidden meaning: ${hintOf(LOGO_HIDDEN_MEANING_PRESETS, input.hiddenMeaning)}` : ''}
${input.usage && input.usage.length > 0 ? `- Where the logo must work: ${input.usage.map((u) => labelOf(LOGO_USAGE_PRESETS, u) ?? u).join(', ')}` : ''}
${input.boldness ? `- Concept boldness: ${hintOf(LOGO_BOLDNESS_PRESETS, input.boldness)}` : ''}
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
    input.industry && `Industry: ${labelOf(LOGO_INDUSTRY_PRESETS, input.industry)}`,
    input.concept && `Concept: ${labelOf(LOGO_CONCEPT_PRESETS, input.concept)}`,
    input.shapeLanguage && `Shape language: ${labelOf(LOGO_SHAPE_PRESETS, input.shapeLanguage)}`,
    input.typography && `Typography: ${labelOf(LOGO_TYPOGRAPHY_PRESETS, input.typography)}`,
    input.lockup && `Lockup: ${labelOf(LOGO_LOCKUP_PRESETS, input.lockup)}`,
    input.hiddenMeaning && `Hidden meaning: ${labelOf(LOGO_HIDDEN_MEANING_PRESETS, input.hiddenMeaning)}`,
    input.usage && input.usage.length > 0 && `Usage: ${input.usage.map((u) => labelOf(LOGO_USAGE_PRESETS, u) ?? u).join(', ')}`,
    input.boldness && `Boldness: ${labelOf(LOGO_BOLDNESS_PRESETS, input.boldness)}`,
    input.resolution && `Resolution: ${input.resolution}`,
  ].filter(Boolean);
  const extrasLine = extras.length > 0 ? `\n${extras.join('\n')}` : '';
  return `Brand brief: "${input.subject}"\n\nGenerate the master prompt and ${input.platforms.length} platform-tuned logo prompts as specified. Start with "## MASTER PROMPT".${extrasLine}`;
}
