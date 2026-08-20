import {
  ToastmastersAssetId,
  ToastmastersBackgroundStyle,
  ToastmastersInput,
  ToastmastersLanguage,
  ToastmastersOutputMode,
  ToastmastersTextMode,
  ToastmastersBrandColor,
} from '@/types';

/* ── Brand Constants ────────────────────────────────────────────────────────── */

export const TOASTMASTERS_COLORS: Record<
  Exclude<ToastmastersBrandColor, 'custom'>,
  { hex: string; name: string }
> = {
  'loyal-blue': { hex: '#004165', name: 'Loyal Blue' },
  'true-maroon': { hex: '#772432', name: 'True Maroon' },
  'cool-gray': { hex: '#6D6E71', name: 'Cool Gray' },
  'happy-yellow': { hex: '#F2B01E', name: 'Happy Yellow' },
};

export const TOASTMASTERS_FONTS = {
  heading: 'Gotham',
  body: 'Myriad Pro',
} as const;

/* ── Asset Catalog ──────────────────────────────────────────────────────────── */

export interface ToastmastersAssetEntry {
  id: ToastmastersAssetId;
  label: string;
  category: 'Social' | 'Print / Flyer' | 'Magazine' | 'Background / Theme';
  defaultRatio: string;
  defaultResolution: string;
  /** Whether this asset type is eligible for speaker placeholders. */
  speakerEligible: boolean;
  /** Default on-state for the logo placeholder toggle. */
  defaultLogoPlaceholder: boolean;
  /** Default on-state for the speaker placeholder toggle (only relevant if speakerEligible). */
  defaultSpeakerPlaceholder: boolean;
}

export const TOASTMASTERS_ASSET_CATALOG: ToastmastersAssetEntry[] = [
  {
    id: 'event-flyer',
    label: 'Event Flyer',
    category: 'Print / Flyer',
    defaultRatio: '2:3',
    defaultResolution: '2K (1500×2250)',
    speakerEligible: true,
    defaultLogoPlaceholder: true,
    defaultSpeakerPlaceholder: true,
  },
  {
    id: 'speaker-lineup',
    label: 'Speaker Lineup',
    category: 'Print / Flyer',
    defaultRatio: '2:3',
    defaultResolution: '2K (1500×2250)',
    speakerEligible: true,
    defaultLogoPlaceholder: true,
    defaultSpeakerPlaceholder: true,
  },
  {
    id: 'social-square',
    label: 'Social Post (Square)',
    category: 'Social',
    defaultRatio: '1:1',
    defaultResolution: '2K (2160×2160)',
    speakerEligible: false,
    defaultLogoPlaceholder: true,
    defaultSpeakerPlaceholder: false,
  },
  {
    id: 'social-landscape',
    label: 'Social Post (Landscape)',
    category: 'Social',
    defaultRatio: '16:9',
    defaultResolution: '2K (2560×1440)',
    speakerEligible: false,
    defaultLogoPlaceholder: true,
    defaultSpeakerPlaceholder: false,
  },
  {
    id: 'social-story',
    label: 'Story / Reel Background',
    category: 'Social',
    defaultRatio: '9:16',
    defaultResolution: '2K (1080×1920)',
    speakerEligible: false,
    defaultLogoPlaceholder: true,
    defaultSpeakerPlaceholder: false,
  },
  {
    id: 'social-reel',
    label: 'Reel Cover',
    category: 'Social',
    defaultRatio: '9:16',
    defaultResolution: '4K (2160×3840)',
    speakerEligible: false,
    defaultLogoPlaceholder: true,
    defaultSpeakerPlaceholder: false,
  },
  {
    id: 'magazine-cover',
    label: 'Magazine Cover',
    category: 'Magazine',
    defaultRatio: '2:3',
    defaultResolution: '4K (2400×3600)',
    speakerEligible: false,
    defaultLogoPlaceholder: true,
    defaultSpeakerPlaceholder: false,
  },
  {
    id: 'magazine-spread',
    label: 'Magazine Spread',
    category: 'Magazine',
    defaultRatio: '1:1',
    defaultResolution: '4K (3600×3600)',
    speakerEligible: false,
    defaultLogoPlaceholder: true,
    defaultSpeakerPlaceholder: false,
  },
  {
    id: 'newsletter-header',
    label: 'Newsletter Header',
    category: 'Magazine',
    defaultRatio: '3:1',
    defaultResolution: '2K (2400×800)',
    speakerEligible: false,
    defaultLogoPlaceholder: true,
    defaultSpeakerPlaceholder: false,
  },
  {
    id: 'background-theme',
    label: 'Reusable Background / Theme',
    category: 'Background / Theme',
    defaultRatio: '16:9',
    defaultResolution: '2K (2560×1440)',
    speakerEligible: false,
    defaultLogoPlaceholder: false,
    defaultSpeakerPlaceholder: false,
  },
];

/** Look up an asset entry by its id. Falls back to event-flyer if not found. */
export function getAssetEntry(id: ToastmastersAssetId): ToastmastersAssetEntry {
  return (
    TOASTMASTERS_ASSET_CATALOG.find((a) => a.id === id) ??
    TOASTMASTERS_ASSET_CATALOG[0]
  );
}

/* ── Event text helpers ─────────────────────────────────────────────────────── */

function fieldOrPlaceholder(value: string, label: string): string {
  const trimmed = value.trim();
  if (!trimmed || trimmed === `[${label}]` || trimmed === `[${label.toUpperCase()}]`) {
    return `[${label.toUpperCase()}]`;
  }
  return trimmed;
}

function buildEventTextBlock(input: ToastmastersInput): string {
  const lines: string[] = [];
  lines.push(`Club Name: ${fieldOrPlaceholder(input.clubName, 'Club Name')}`);
  lines.push(`Event Title: ${fieldOrPlaceholder(input.eventTitle, 'Event Title')}`);
  lines.push(`Date: ${fieldOrPlaceholder(input.eventDate, 'Date')}`);
  lines.push(`Time: ${fieldOrPlaceholder(input.eventTime, 'Time')}`);
  lines.push(`Venue / Link: ${fieldOrPlaceholder(input.eventVenue, 'Venue')}`);
  return lines.join('\n');
}

/* ── Template Block Builders ────────────────────────────────────────────────── */

function logoPlaceholderBlock(): string {
  return [
    '[LOGO PLACEHOLDER]',
    'A clearly labeled empty rectangular frame in the top-left or top-right corner of the layout, sized to hold the Toastmasters International logo.',
    'Label text inside: "INSERT TOASTMASTERS LOGO HERE"',
    'Frame stroke: 2px dashed #999999 on a translucent white (#FFFFFFAA) background pill.',
    'The frame MUST NOT be filled with any AI-generated logo, icon, or text resembling the Toastmasters mark. The real logo is composited in post-production.',
  ].join('\n');
}

function speakerPlaceholderBlock(count: number): string {
  const slots = Array.from({ length: count }, (_, i) => {
    const num = i + 1;
    return [
      `• Speaker Slot ${num}: a circular mask (aspect 1:1, ~120px diameter at 2K) with a dashed border, labelled "SPEAKER ${num} PHOTO". No face, no illustration — just the empty frame.`,
    ].join('\n');
  });
  return [
    `[SPEAKER PLACEHOLDERS — ${count} slot${count === 1 ? '' : 's'}]`,
    'Empty circular photo frames arranged in a row or grid, each labelled:',
    ...slots,
    'These are composited in post-production with real speaker headshots.',
  ].join('\n');
}

/** Resolve a brand color key (or custom) to its hex + name. */
function resolveColor(color: ToastmastersBrandColor | 'none', customHex?: string): { hex: string; name: string } {
  if (color === 'none') return { hex: '#FFFFFF', name: 'None' };
  if (color === 'custom') return { hex: customHex || '#000000', name: 'Custom' };
  return TOASTMASTERS_COLORS[color];
}

/** Build the colour instruction block based on primary + secondary + background style. */
function colorInstruction(input: ToastmastersInput): string {
  const primary = resolveColor(input.primaryColor, input.primaryColorHex);
  if (!input.secondaryColor || input.secondaryColor === 'none') {
    return `Dominant colour: ${primary.name} (${primary.hex}), used as a solid fill.`;
  }
  const secondary = resolveColor(input.secondaryColor, input.secondaryColorHex);
  const styleText: Record<ToastmastersBackgroundStyle, string> = {
    'two-tone-gradient': `a smooth gradient from ${primary.name} (${primary.hex}) to ${secondary.name} (${secondary.hex})`,
    'diagonal-split': `a diagonal split — ${primary.name} (${primary.hex}) on one side, ${secondary.name} (${secondary.hex}) on the other, hard edge`,
    'radial': `a radial gradient — ${primary.name} (${primary.hex}) at the center fading to ${secondary.name} (${secondary.hex}) at the edges`,
    solid: `${primary.name} (${primary.hex}) as the dominant fill with ${secondary.name} (${secondary.hex}) as an accent on secondary elements`,
  };
  return `Background treatment: ${styleText[input.backgroundStyle]}.`;
}

/** Resolve the active font names from the typeface picker. */
function resolveFonts(input: ToastmastersInput): { heading: string; body: string } {
  switch (input.typeface) {
    case 'montserrat':
      return { heading: 'Montserrat', body: 'Montserrat' };
    case 'custom':
      return { heading: input.customHeadingFont || 'Gotham', body: input.customBodyFont || 'Myriad Pro' };
    case 'brand-default':
    default:
      return { heading: 'Gotham', body: 'Myriad Pro' };
  }
}

function resolutionInstruction(entry: ToastmastersAssetEntry, input: ToastmastersInput): string {
  const res = input.outputMode === 'white-removable'
    ? '4K (3840×2160)'
    : (input.customResolution || entry.defaultResolution);
  const ratio = input.customRatio || entry.defaultRatio;
  return `Render at ${res} resolution, ${ratio} aspect ratio.`;
}

/* ── Per-Asset Purpose & Layout Descriptions ────────────────────────────────── */

const ASSET_PURPOSE: Record<ToastmastersAssetId, string> = {
  'event-flyer': 'A printable event flyer for a Toastmasters club meeting or special event, with clear hierarchy: headline, date/time/venue, and speaker info.',
  'speaker-lineup': 'A speaker showcase layout featuring placeholder frames for multiple speakers, with event branding and headline text.',
  'social-square': 'A square social media post optimised for Instagram feed and Facebook, with bold headline text and event branding.',
  'social-landscape': 'A wide landscape social media post for LinkedIn, Facebook events, and Twitter/X, with headline and event details.',
  'social-story': 'A tall story-format background for Instagram/Facebook Stories with event headline text positioned in the safe zone.',
  'social-reel': 'A full-bleed reel cover with bold headline text and event branding, safe for the 9:16 format.',
  'magazine-cover': 'A magazine-style front cover with a masthead area, feature headline, and club branding.',
  'magazine-spread': 'A double-page magazine spread layout for feature articles, with headline, body text area, and image zones.',
  'newsletter-header': 'A wide newsletter masthead with club name, event branding, and a clean typographic headline.',
  'background-theme': 'A plain background using the Toastmasters brand palette — either a dominant-color gradient or a flat white canvas. No text, no placeholders, no logos. Purely a reusable background asset.',
};

const ASSET_LAYOUT: Record<ToastmastersAssetId, string> = {
  'event-flyer': 'Vertical portrait layout. Top zone: logo placeholder frame. Centre: large bold headline (event title) in Gotham. Below headline: date, time, venue in Myriad Pro. Bottom third: speaker placeholder frames (if enabled) in a 2-column grid. Accent stripe in the dominant brand colour runs along the left edge.',
  'speaker-lineup': 'Vertical portrait layout. Header zone: club name and logo placeholder. Centre: 2×2 or 1×3 grid of speaker placeholder circles. Below each circle: a name/role text line. Bottom: date, time, and venue.',
  'social-square': 'Square (1:1) layout. Full-bleed background gradient in the dominant colour. Centre: large headline text in Gotham. Lower third: date and venue in Myriad Pro. Top-left: logo placeholder (if enabled).',
  'social-landscape': 'Wide landscape (16:9). Left half: large headline text. Right half: decorative geometric pattern in brand colours. Bottom strip: date, time, venue. Top-left corner: logo placeholder (if enabled).',
  'social-story': 'Tall 9:16 story format. Top 20%: club name + logo placeholder (if enabled). Centre: large headline in Gotham. Lower third (safe zone above thumb): date and venue text. Background: dominant-colour gradient with subtle geometric texture.',
  'social-reel': 'Tall 9:16 reel cover. Full-bleed dominant-colour gradient. Centre: bold event headline. Top: logo placeholder. Bottom safe zone: date and venue.',
  'magazine-cover': 'Portrait 2:3. Top: masthead area with club name in Gotham bold. Centre: feature headline in large type. Lower half: decorative element or gradient. Top-right: logo placeholder (if enabled). Bottom: date/issue info.',
  'magazine-spread': 'Square or landscape double-page spread. Left page: large headline + sub-headline. Right page: body text zone with a decorative column rule. Top corners: logo placeholders (if enabled). Clean, editorial grid.',
  'newsletter-header': 'Wide panoramic (3:1). Left: club name in Gotham bold. Right: decorative geometric element. Centre: event headline in large type. Bottom: thin accent line in dominant colour. Logo placeholder (if enabled) top-left.',
  'background-theme': 'Full-bleed background only. Option A: smooth two-stop gradient from the dominant colour to a lighter tint (e.g., Loyal Blue #004165 fading to #006BA6). Option B: flat white (#FFFFFF) with a very faint geometric texture (diagonal lines at 3% opacity). No text, no frames, no placeholders.',
};

/* ── Prompt Template Builder ────────────────────────────────────────────────── */

function buildLanguageInstruction(language: ToastmastersLanguage): string {
  switch (language) {
    case 'english':
      return 'All text must be in English.';
    case 'tamil':
      return [
        'All text must be rendered in Tamil script (தமிழ்).',
        'Use the user-supplied Tamil text exactly as provided — do NOT translate or transliterate.',
        'Note: Tamil rendering quality depends on the model\'s script support. A manual check of the final output for correct Tamil glyph rendering is strongly recommended before publishing.',
      ].join('\n');
    case 'bilingual':
      return [
        'Render text in both English and Tamil (தமிழ்).',
        'Use a bilingual layout: English headline on one line, Tamil subline or translated text directly below (or in a stacked block), so neither language is cramped.',
        'Use the user-supplied Tamil text exactly as provided — do NOT translate or transliterate.',
        'Note: Tamil rendering quality depends on the model\'s script support. A manual check of the final output for correct Tamil glyph rendering is strongly recommended before publishing.',
      ].join('\n');
  }
}

function buildSampleReferenceInstruction(note: string | undefined): string {
  if (!note?.trim()) return '';
  return [
    '',
    'SAMPLE REFERENCE:',
    'The user has attached a sample/reference image. Reinterpret the layout, colour flow, and visual rhythm of that sample — do NOT replicate it pixel-for-pixel.',
    'Borrow the structural pattern and spacing, but apply the Toastmasters brand palette and the user\'s event details.',
  ].join('\n');
}

/** Build layout description using the user-chosen logo position and accent style. */
function dynamicLayoutText(
  assetId: ToastmastersAssetId,
  logoPosition: string,
  accentStyle: string,
): string {
  const posLabel = logoPosition === 'top-right' ? 'Top-right corner' : logoPosition === 'top-center' ? 'Top centre' : 'Top-left corner';
  const accentLabel = accentStyle === 'corner-badge' ? 'corner badge in the dominant brand colour' : accentStyle === 'none' ? '' : 'accent stripe in the dominant brand colour';
  const posDetails: Record<string, string> = {
    'top-left': 'top-left',
    'top-right': 'top-right',
    'top-center': 'top centre',
  };
  // Replace the hardcoded "top-left" / "logo placeholder" references in the layout prose
  let base = ASSET_LAYOUT[assetId];
  base = base.replace(/Top-left corner: logo placeholder/g, `${posLabel}: logo placeholder`);
  base = base.replace(/top-left or top-right corner/g, posDetails[logoPosition] || 'top-left corner');
  base = base.replace(/top-left: logo placeholder/g, `${posLabel.toLowerCase()}: logo placeholder`);
  base = base.replace(/Top-left:/g, `${posLabel}:`);
  if (accentLabel && accentLabel !== 'accent stripe in the dominant brand colour') {
    base = base.replace(/Accent stripe in the dominant brand colour/g, accentLabel.charAt(0).toUpperCase() + accentLabel.slice(1));
  }
  return base;
}

function buildSingleAssetPrompt(
  assetId: ToastmastersAssetId,
  input: ToastmastersInput,
): string {
  const entry = getAssetEntry(assetId);
  const isTextFree = input.textMode === 'text-free';
  const showLogo = input.includeLogoPlaceholder;
  const showSpeakers = input.includeSpeakerPlaceholders && entry.speakerEligible;
  const fonts = resolveFonts(input);
  const logoPos = input.logoPosition || 'top-left';
  const accent = input.accentStyle || 'stripe';

  const sections: string[] = [];

  // Header
  sections.push(`# Toastmasters ${entry.label} — Image Generation Prompt`);
  sections.push('');

  // Role
  sections.push('## ROLE');
  sections.push('You are a professional graphic designer creating brand-compliant visual assets for a Toastmasters International club. You produce ready-to-use image prompts that an AI image generator (such as Nano Banana Pro / Gemini) can render directly.');
  sections.push('');

  // Brand Rules
  sections.push('## BRAND RULES');
  sections.push(colorInstruction(input));
  sections.push('- Secondary/accent colours in the Toastmasters palette: Loyal Blue (#004165), True Maroon (#772432), Cool Gray (#6D6E71), Happy Yellow (#F2B01E).');
  sections.push(`- Heading font: ${fonts.heading} (bold, clean sans-serif).`);
  sections.push(`- Body font: ${fonts.body} (regular weight sans-serif).`);
  sections.push('- The Toastmasters logo must NEVER be drawn, generated, or approximated by the AI. Use a placeholder frame only (see Logo Placeholder below).');
  sections.push('- Do not alter, truncate, or recolour the real logo — it comes with its own background and must be composited in post-production.');
  sections.push('');

  // Output Mode
  sections.push('## OUTPUT MODE');
  if (input.outputMode === 'white-removable') {
    sections.push('WHITE REMOVABLE — Produce a flat, clean background with no gradient or texture. The background should be pure white (#FFFFFF) or a very light flat tint so it can be easily removed (chroma-key style) in post-production.');
  } else {
    sections.push('FULL ASSET — Produce a complete, production-ready visual with gradient, texture, and all layout elements rendered at full quality.');
  }
  sections.push('');

  // Text Mode
  sections.push('## TEXT MODE');
  if (isTextFree) {
    sections.push('TEXT-FREE TEMPLATE — Do NOT render any event text, headlines, dates, or venue information. The output is a clean visual layout with brand styling only — no readable text of any kind. Event text will be overlaid in post-production.');
  } else {
    sections.push('WITH TEXT — Render all event text as specified below. Use clear, legible typography with strong contrast against the background.');
  }
  sections.push('');

  // Asset Purpose & Layout
  sections.push('## ASSET PURPOSE');
  sections.push(ASSET_PURPOSE[assetId]);
  sections.push('');
  sections.push('## LAYOUT');
  sections.push(dynamicLayoutText(assetId, logoPos, accent));
  sections.push('');

  // Resolution
  sections.push('## RESOLUTION & FORMAT');
  sections.push(resolutionInstruction(entry, input));
  sections.push('');

  // Event Text (only if text mode is with-text)
  if (!isTextFree) {
    sections.push('## EVENT TEXT');
    sections.push(buildEventTextBlock(input));
    sections.push('');
  }

  // Language
  sections.push('## LANGUAGE');
  sections.push(buildLanguageInstruction(input.language));
  sections.push('');

  // Tamil text (if applicable)
  if (input.language === 'tamil' || input.language === 'bilingual') {
    sections.push('## TAMIL TEXT (verbatim — do not translate)');
    sections.push(input.tamilText.trim() || '[INSERT TAMIL TEXT]');
    sections.push('');
  }

  // Logo Placeholder
  if (showLogo) {
    sections.push('## LOGO PLACEHOLDER');
    sections.push(logoPlaceholderBlock());
    sections.push('');
  }

  // Speaker Placeholders
  if (showSpeakers) {
    sections.push('## SPEAKER PLACEHOLDERS');
    sections.push(speakerPlaceholderBlock(input.speakerCount || 2));
    sections.push('');
  }

  // Design quality instructions
  sections.push('## DESIGN QUALITY');
  sections.push('- Strong visual hierarchy: headline is the largest element, supporting text is clearly smaller.');
  sections.push('- Ample whitespace/padding — avoid cramped layouts.');
  sections.push('- Use subtle geometric patterns (circles, diagonal lines, arcs) in brand colours as background texture, not as the focal point.');
  sections.push('- Maintain a premium, clean aesthetic consistent with Toastmasters International branding.');
  sections.push('');

  // Negative constraints
  sections.push('## WHAT NOT TO DO');
  sections.push('- Do NOT generate a Toastmasters logo or any logo-like mark.');
  sections.push('- Do NOT include lorem ipsum or placeholder body text (beyond the labelled frames).');
  sections.push('- Do NOT use stock photo imagery — this is a graphic design prompt, not a photography prompt.');
  sections.push('- Do NOT use non-brand colours outside the approved palette.');
  sections.push('- Do NOT render tiny, illegible, or distorted text.');

  // Sample reference
  const refNote = buildSampleReferenceInstruction(input.sampleReferenceNote);
  if (refNote) {
    sections.push('');
    sections.push(refNote);
  }

  return sections.join('\n');
}

/* ── Public: Build one or more prompts ──────────────────────────────────────── */

/**
 * Build the complete prompt text for a Toastmasters request.
 * When multiple asset types are selected, one fenced block is produced per asset,
 * all sharing the same event text, colour, and language settings.
 */
export function buildToastmastersPrompt(input: ToastmastersInput): string {
  const assets: ToastmastersAssetId[] = input.assetTypes.length > 0 ? input.assetTypes : ['event-flyer'];

  if (assets.length === 1) {
    return buildSingleAssetPrompt(assets[0], input);
  }

  // Multi-asset kit: one block per asset, separated by a clear divider
  return assets
    .map((assetId, index) => {
      const header = `---\n## Asset ${index + 1} of ${assets.length}: ${getAssetEntry(assetId).label}\n---\n`;
      return header + buildSingleAssetPrompt(assetId, input);
    })
    .join('\n\n');
}

/**
 * Build a user-message hint that tells the meta-prompt engine what the
 * Toastmasters request is about (for the standard generation flow).
 */
export function buildToastmastersUserMessage(input: ToastmastersInput): string {
  const assets = input.assetTypes.map((id) => getAssetEntry(id).label).join(', ');
  const primary = resolveColor(input.primaryColor, input.primaryColorHex);
  return [
    `Create a brand-compliant image-generation prompt for Toastmasters assets: ${assets}.`,
    `Primary colour: ${primary.name} (${primary.hex}).`,
    input.secondaryColor && input.secondaryColor !== 'none'
      ? `Secondary colour: ${resolveColor(input.secondaryColor, input.secondaryColorHex).name}. Background style: ${input.backgroundStyle}.`
      : 'Single colour (solid).',
    `Output mode: ${input.outputMode === 'white-removable' ? 'White Removable' : 'Full Asset'}.`,
    `Text mode: ${input.textMode === 'text-free' ? 'Text-Free Template' : 'With Text'}.`,
    `Language: ${input.language}.`,
    input.includeLogoPlaceholder ? 'Include logo placeholder frame.' : 'No logo placeholder.',
    input.includeSpeakerPlaceholders && getAssetEntry(input.assetTypes[0] ?? 'event-flyer').speakerEligible
      ? `Include ${input.speakerCount || 2} speaker placeholder frames.`
      : 'No speaker placeholders.',
    `Event: ${input.clubName || '[Club Name]'} — ${input.eventTitle || '[Event Title]'} on ${input.eventDate || '[Date]'} at ${input.eventVenue || '[Venue]'}.`,
  ].join('\n');
}
