import { getSavedImagePrompts, SavedImagePrompt } from '@/lib/image-prompts';

const LOGO_GALLERY_KEY = 'pc:logo-prompts';
const IMAGE_GALLERY_KEY = 'pc:image-prompts'; // migration source only
const MAX_ITEMS = 24;

export function getSavedLogoPrompts(): SavedImagePrompt[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOGO_GALLERY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLogoPrompt(item: SavedImagePrompt): SavedImagePrompt[] {
  const saved = getSavedLogoPrompts();
  const next = [item, ...saved].slice(0, MAX_ITEMS);
  try {
    localStorage.setItem(LOGO_GALLERY_KEY, JSON.stringify(next));
  } catch {
    // Storage may be unavailable — keep the in-memory result.
  }
  return next;
}

export function deleteSavedLogoPrompt(id: string): SavedImagePrompt[] {
  const next = getSavedLogoPrompts().filter((s) => s.id !== id);
  try {
    localStorage.setItem(LOGO_GALLERY_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
}

export function clearSavedLogoPrompts(): SavedImagePrompt[] {
  try {
    localStorage.removeItem(LOGO_GALLERY_KEY);
  } catch {
    // ignore
  }
  return [];
}

/** Moves every mode === 'logo' item out of the image store into the logo store. Idempotent. */
export function migrateLogoPromptsOutOfImageGallery(): void {
  if (typeof window === 'undefined') return;

  const imageItems = getSavedImagePrompts();
  const logoItems = imageItems.filter((item) => item.mode === 'logo');
  if (logoItems.length === 0) return;

  const nonLogoItems = imageItems.filter((item) => item.mode !== 'logo');

  // Merge with the current logo store, first occurrence wins so existing
  // logo-store entries are preferred over the ones being migrated in.
  const byId = new Map<string, SavedImagePrompt>();
  for (const item of [...getSavedLogoPrompts(), ...logoItems]) {
    if (!byId.has(item.id)) byId.set(item.id, item);
  }
  const mergedLogoItems = Array.from(byId.values())
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, MAX_ITEMS);

  try {
    localStorage.setItem(LOGO_GALLERY_KEY, JSON.stringify(mergedLogoItems));
  } catch {
    // Logo write failed — leave the source image store untouched.
    return;
  }

  try {
    localStorage.setItem(IMAGE_GALLERY_KEY, JSON.stringify(nonLogoItems));
  } catch {
    // ignore
  }
}
