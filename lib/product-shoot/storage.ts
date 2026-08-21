/**
 * Storage helpers for Product Shoot Studio.
 *
 * Provides persistence for saved product shoots and brief history,
 * allowing users to review, search, favorite, export, and reload previous
 * product video generations.
 */

import type { SavedProductShoot } from './types';

const STORAGE_KEY = 'promptcrafter_product_shoots_v1';
const MAX_SAVED_ITEMS = 50;

/** Retrieve all saved product shoot generations from client storage. */
export function getSavedProductShoots(): SavedProductShoot[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (err) {
    console.error('Failed to load saved product shoots from storage:', err);
    return [];
  }
}

/** Save or update a product shoot generation record. */
export function saveProductShoot(shoot: SavedProductShoot): SavedProductShoot[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = getSavedProductShoots();
    const index = existing.findIndex((item) => item.id === shoot.id);
    let updated: SavedProductShoot[];

    if (index >= 0) {
      updated = [...existing];
      updated[index] = shoot;
    } else {
      updated = [shoot, ...existing].slice(0, MAX_SAVED_ITEMS);
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (quotaErr) {
      console.warn('LocalStorage quota exceeded, saving without thumbnail data to preserve prompts:', quotaErr);
      const stripped = updated.map((item) => ({ ...item, imageThumbnails: undefined }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stripped));
      return stripped;
    }
    return updated;
  } catch (err) {
    console.error('Failed to save product shoot to storage:', err);
    return [];
  }
}

/** Delete a saved product shoot by ID. */
export function deleteSavedProductShoot(id: string): SavedProductShoot[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = getSavedProductShoots();
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to delete product shoot from storage:', err);
    return [];
  }
}

/** Toggle favorite status for a saved product shoot. */
export function toggleFavoriteProductShoot(id: string): SavedProductShoot[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = getSavedProductShoots();
    const updated = existing.map((item) =>
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to toggle favorite on product shoot:', err);
    return [];
  }
}

/** Clear all saved product shoots. */
export function clearAllSavedProductShoots(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear saved product shoots:', err);
  }
}
