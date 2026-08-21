// ────────────────────────────────────────────────────────────────────────────
// Brand / Subject Kit — localStorage-backed reusable brief presets
//
// A kit captures the subject description, style preset, palette, industry
// context, and other repeatable fields so a director working on the same
// brand across many sessions doesn't retype the same context every time.
// Storage pattern mirrors SavedImagePrompt (separate key, synchronous API).
// ────────────────────────────────────────────────────────────────────────────

import { ImagePlatform, ImagePromptOutputFormat } from '@/types';
import { auditPlaceholders, fillPlaceholders } from './placeholder';

export interface PromptKit {
  id: string;
  name: string;
  /** Reusable subject description text. May include [VARIABLE] placeholders. */
  subjectDescription: string;
  /** Generic / legacy style preset field. */
  stylePreset?: string;
  /** Image mode — style preset id. */
  imageStyle?: string;
  /** Logo mode — style preset id. */
  logoStyle?: string;
  /** Logo mode — color palette id. */
  palette?: string;
  /** Logo mode — industry preset id. */
  industry?: string;
  /** Studio mode this kit was saved from. */
  mode?: 'image' | 'logo';
  /** Logo mode — brand name / wordmark text. */
  brandName?: string;
  /** Logo mode — mark type id. */
  logoType?: string;
  /** Logo mode — concept id. */
  concept?: string;
  /** Logo mode — shape language id. */
  shapeLanguage?: string;
  /** Logo mode — typography direction id. */
  typography?: string;
  /** Logo mode — lockup layout id. */
  lockup?: string;
  /** Logo mode — hidden meaning id. */
  hiddenMeaning?: string;
  /** Logo mode — versatility targets. */
  usage?: string[];
  /** Logo mode — concept boldness id. */
  boldness?: string;
  /** Lighting preset id. */
  lighting?: string;
  /** Mood preset id. */
  mood?: string;
  /** Composition preset id. */
  composition?: string;
  /** Camera preset id. */
  camera?: string;
  /** Color grade preset id. */
  colorGrade?: string;
  /** Aspect ratio. */
  aspectRatio?: string;
  /** Resolution tier: '512px' | '1K' | '2K' | '4K'. */
  resolution?: string;
  /** In-image text to render. */
  inImageText?: string;
  /** Output format: 'prose' | 'json' | 'both'. */
  outputFormat?: ImagePromptOutputFormat;
  /** Purpose / end-use intent. */
  purpose?: string;
  /** Platform dialects to generate. */
  platforms?: ImagePlatform[];
  /** Negative prompt guidance. */
  negativePrompt?: string;
  /** Additional notes. */
  additionalNotes?: string;
  createdAt: number;
}

const KITS_KEY = 'pc:image-prompt-kits';

export function getKits(): PromptKit[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KITS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveKit(kit: PromptKit): PromptKit[] {
  const saved = getKits();
  const existing = saved.findIndex((k) => k.id === kit.id);
  let next: PromptKit[];
  if (existing >= 0) {
    next = [...saved];
    next[existing] = kit;
  } else {
    next = [kit, ...saved].slice(0, 16);
  }
  try {
    localStorage.setItem(KITS_KEY, JSON.stringify(next));
  } catch {
    // Storage may be unavailable — keep the in-memory result.
  }
  return next;
}

export function deleteKit(id: string): PromptKit[] {
  const next = getKits().filter((k) => k.id !== id);
  try {
    localStorage.setItem(KITS_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
}

/** Check if a kit contains templated placeholders like [BRAND] or [PRODUCT]. */
export function getKitPlaceholders(kit: PromptKit): string[] {
  const combined = [
    kit.subjectDescription,
    kit.brandName,
    kit.inImageText,
    kit.additionalNotes,
  ].filter(Boolean).join(' ');
  const { keys } = auditPlaceholders(combined);
  return keys;
}

/** Fill bracket placeholders across a kit's text fields. */
export function fillKitPlaceholders(kit: PromptKit, values: Record<string, string>): PromptKit {
  return {
    ...kit,
    subjectDescription: fillPlaceholders(kit.subjectDescription, values),
    brandName: kit.brandName ? fillPlaceholders(kit.brandName, values) : undefined,
    inImageText: kit.inImageText ? fillPlaceholders(kit.inImageText, values) : undefined,
    additionalNotes: kit.additionalNotes ? fillPlaceholders(kit.additionalNotes, values) : undefined,
  };
}

