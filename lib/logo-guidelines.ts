import { ImagePromptInput } from '@/types';
import { LOGO_PALETTE_PRESETS } from './logo-prompts';

export interface ColorSpec {
  name: string;
  hex: string;
  rgb: string;
  cmyk: string;
  role: 'Primary' | 'Secondary' | 'Accent' | 'Background' | 'Neutral';
  contrastOnWhite: number;
  contrastOnDark: number;
  wcagWhitePass: 'AAA' | 'AA' | 'FAIL';
  wcagDarkPass: 'AAA' | 'AA' | 'FAIL';
}

export interface FontPairingSpec {
  primaryFont: string;
  primaryCategory: string;
  primaryWeights: string;
  secondaryFont: string;
  secondaryCategory: string;
  secondaryWeights: string;
  googleFontsUrl: string;
  usageHierarchy: string;
}

export interface BrandGuidelinesSpec {
  brandName: string;
  industry: string;
  conceptMeaning: string;
  markType: string;
  colors: ColorSpec[];
  typography: FontPairingSpec;
  clearSpaceRule: {
    formula: string;
    unitDescription: string;
    diagramHint: string;
  };
  minimumScale: {
    digitalFavicon: string;
    digitalNavbar: string;
    printSmall: string;
    printBillBoard: string;
  };
  dosAndDonts: {
    dos: string[];
    donts: string[];
  };
}

/** Convert Hex to RGB object */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleaned = hex.replace('#', '').trim();
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map((c) => c + c).join('');
  }
  const num = parseInt(cleaned, 16);
  if (isNaN(num)) return { r: 17, g: 17, b: 17 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/** Convert RGB to CMYK string */
export function rgbToCmyk(r: number, g: number, b: number): string {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const k = 1 - Math.max(rNorm, gNorm, bNorm);
  if (k === 1) return 'C: 0%, M: 0%, Y: 0%, K: 100%';
  const c = Math.round(((1 - rNorm - k) / (1 - k)) * 100);
  const m = Math.round(((1 - gNorm - k) / (1 - k)) * 100);
  const y = Math.round(((1 - bNorm - k) / (1 - k)) * 100);
  const kPercent = Math.round(k * 100);
  return `C: ${c}%, M: ${m}%, Y: ${y}%, K: ${kPercent}%`;
}

/** Calculate WCAG Relative Luminance */
export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/** Calculate WCAG 2.1 Contrast Ratio between two hex colors (e.g. 7.5:1) */
export function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
}

export function getWcagLevel(ratio: number): 'AAA' | 'AA' | 'FAIL' {
  if (ratio >= 7.0) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  return 'FAIL';
}

/** Curated font pairing recommendations based on typography preset id */
export const FONT_PAIRINGS_MAP: Record<string, FontPairingSpec> = {
  'geometric-sans': {
    primaryFont: 'Poppins / Futura',
    primaryCategory: 'Geometric Sans-Serif',
    primaryWeights: 'Bold 700 / SemiBold 600',
    secondaryFont: 'Inter',
    secondaryCategory: 'Humanist Sans-Serif',
    secondaryWeights: 'Regular 400 / Medium 500',
    googleFontsUrl: 'https://fonts.google.com/share?selection.family=Inter:wght@400;500;600|Poppins:wght@600;700',
    usageHierarchy: 'Poppins for brand wordmark and H1 headings; Inter for body copy, UI elements, and subtext.',
  },
  'humanist-sans': {
    primaryFont: 'Plus Jakarta Sans',
    primaryCategory: 'Humanist Sans-Serif',
    primaryWeights: 'Bold 700',
    secondaryFont: 'Source Sans 3',
    secondaryCategory: 'Clean Sans-Serif',
    secondaryWeights: 'Regular 400 / SemiBold 600',
    googleFontsUrl: 'https://fonts.google.com/share?selection.family=Plus+Jakarta+Sans:wght@700|Source+Sans+3:wght@400;600',
    usageHierarchy: 'Plus Jakarta Sans for primary brand lockup; Source Sans 3 for high-density documentation and editorial body.',
  },
  'modern-serif': {
    primaryFont: 'Playfair Display / Didot',
    primaryCategory: 'High-Contrast Modern Serif',
    primaryWeights: 'Bold 700 / Black 900',
    secondaryFont: 'Montserrat',
    secondaryCategory: 'Geometric Sans-Serif',
    secondaryWeights: 'Regular 400 / Light 300',
    googleFontsUrl: 'https://fonts.google.com/share?selection.family=Montserrat:wght@300;400;500|Playfair+Display:wght@700;900',
    usageHierarchy: 'Playfair Display for luxury mastheads and logo typography; clean Montserrat for secondary details and captions.',
  },
  'slab-serif': {
    primaryFont: 'Rockwell / Roboto Slab',
    primaryCategory: 'Sturdy Slab Serif',
    primaryWeights: 'ExtraBold 800',
    secondaryFont: 'Open Sans',
    secondaryCategory: 'Balanced Sans-Serif',
    secondaryWeights: 'Regular 400 / Medium 500',
    googleFontsUrl: 'https://fonts.google.com/share?selection.family=Open+Sans:wght@400;500|Roboto+Slab:wght@700;800',
    usageHierarchy: 'Roboto Slab for punchy badge emblems; Open Sans for universal legibility across web and print.',
  },
  script: {
    primaryFont: 'Dancing Script / Custom Lettering',
    primaryCategory: 'Expressive Humanist Script',
    primaryWeights: 'SemiBold 600',
    secondaryFont: 'Inter',
    secondaryCategory: 'Neutral Sans-Serif',
    secondaryWeights: 'Regular 400 / Medium 500',
    googleFontsUrl: 'https://fonts.google.com/share?selection.family=Dancing+Script:wght@600;700|Inter:wght@400;500',
    usageHierarchy: 'Dancing Script exclusively for primary wordmark signature; crisp Inter for all supporting typography to prevent decorative clash.',
  },
  monospace: {
    primaryFont: 'JetBrains Mono',
    primaryCategory: 'Engineered Monospace',
    primaryWeights: 'Bold 700 / Medium 500',
    secondaryFont: 'DM Sans',
    secondaryCategory: 'Geometric Sans-Serif',
    secondaryWeights: 'Regular 400 / SemiBold 600',
    googleFontsUrl: 'https://fonts.google.com/share?selection.family=DM+Sans:wght@400;600|JetBrains+Mono:wght@500;700',
    usageHierarchy: 'JetBrains Mono for technical wordmark and code labels; DM Sans for marketing text and interface paragraphs.',
  },
  'display-custom': {
    primaryFont: 'Bebas Neue / Custom Display',
    primaryCategory: 'Monolithic Heavy Display',
    primaryWeights: 'Regular 400 (All-Caps)',
    secondaryFont: 'Inter',
    secondaryCategory: 'Modern Neutral Sans',
    secondaryWeights: 'Regular 400 / Medium 500',
    googleFontsUrl: 'https://fonts.google.com/share?selection.family=Bebas+Neue|Inter:wght@400;500;600',
    usageHierarchy: 'Bebas Neue for monumental brand hero statements; Inter for readable structured body copy.',
  },
  'no-text': {
    primaryFont: 'Inter',
    primaryCategory: 'Symbol-Only Mark (Secondary Type)',
    primaryWeights: 'SemiBold 600',
    secondaryFont: 'Inter',
    secondaryCategory: 'Neutral Sans',
    secondaryWeights: 'Regular 400',
    googleFontsUrl: 'https://fonts.google.com/share?selection.family=Inter:wght@400;600',
    usageHierarchy: 'Mark is symbol-only. Standard Inter sans-serif is recommended for external collateral.',
  },
};

/**
 * Generate a complete Brand Identity Guidelines Spec Sheet from the brief input
 */
export function generateBrandGuidelinesSpec(input: ImagePromptInput): BrandGuidelinesSpec {
  const brandName = input.brandName?.trim() || input.subject || 'Brand Identity';
  const industry = input.industry || 'General Commercial';
  const markType = input.logoType || 'Combination Mark';
  const conceptMeaning = input.concept || 'Ownable Brand Narrative';

  // Palette resolution
  const presetPalette = LOGO_PALETTE_PRESETS.find((p) => p.id === input.palette);
  const rawColors = presetPalette?.colors || (input.palette === 'monochrome' ? ['#111111', '#FFFFFF'] : ['#0F172A', '#3B82F6', '#F8FAFC']);

  const roles: ColorSpec['role'][] = ['Primary', 'Secondary', 'Accent', 'Background', 'Neutral'];

  const colorSpecs: ColorSpec[] = rawColors.map((hex, idx) => {
    const rgb = hexToRgb(hex);
    const rgbStr = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    const contrastOnWhite = getContrastRatio(hex, '#FFFFFF');
    const contrastOnDark = getContrastRatio(hex, '#111111');
    const role = roles[idx] || 'Accent';

    return {
      name: `${role} Color`,
      hex: hex.toUpperCase(),
      rgb: rgbStr,
      cmyk,
      role,
      contrastOnWhite,
      contrastOnDark,
      wcagWhitePass: getWcagLevel(contrastOnWhite),
      wcagDarkPass: getWcagLevel(contrastOnDark),
    };
  });

  // Typography pairing
  const typographyKey = input.typography || 'geometric-sans';
  const typography = FONT_PAIRINGS_MAP[typographyKey] || FONT_PAIRINGS_MAP['geometric-sans'];

  return {
    brandName,
    industry,
    conceptMeaning,
    markType,
    colors: colorSpecs,
    typography,
    clearSpaceRule: {
      formula: 'Clear Space = 0.5X',
      unitDescription: 'Where X is defined as the height of the primary brand icon/symbol.',
      diagramHint: 'Keep at least 50% of the mark height completely clear of text, margins, and busy graphics.',
    },
    minimumScale: {
      digitalFavicon: '16px × 16px (Icon-only sub-mark)',
      digitalNavbar: '32px height (Primary horizontal lockup)',
      printSmall: '20mm / 0.75in width (Business card & packaging)',
      printBillBoard: 'Full vector scale without resolution limit',
    },
    dosAndDonts: {
      dos: [
        'Always maintain the 0.5X clear space margin around the mark.',
        'Use the pure monochrome (#111111 on #FFFFFF) version for single-color print runs.',
        'Ensure the icon and wordmark maintain their optical alignment ratio.',
        'Use high-contrast backgrounds that satisfy WCAG AA standards (4.5:1).',
      ],
      donts: [
        'Do NOT stretch, skew, rotate, or alter the aspect ratio of the mark.',
        'Do NOT apply drop shadows, 3D bevels, or photographic textures.',
        'Do NOT place the logo over busy photographic backgrounds without a solid backdrop.',
        'Do NOT alter the kerning or replace the wordmark with an unapproved font.',
      ],
    },
  };
}
