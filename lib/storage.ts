import { HistoryItem, ProviderConfig } from '@/types';
import { decryptSecret, encryptSecret } from './crypto';

const DB_NAME = 'PromptCrafter_DB';
const DB_VERSION = 1;
const STORE_HISTORY = 'history';
const STORE_PROVIDERS = 'providers';
const STORE_SETTINGS = 'settings';

export const DEFAULT_BUILTIN_PROVIDER: ProviderConfig = {
  id: 'default-gemini',
  name: 'Google Gemini 3.6 Flash (Server Default)',
  baseUrl: 'https://generativelanguage.googleapis.com',
  apiKey: 'BUILTIN', // handled server side with GEMINI_API_KEY
  model: 'gemini-3.6-flash',
  isDefault: true,
  useBuiltInGemini: true,
  temperature: 0.7,
  maxTokens: 4096,
  topP: 0.95,
};

// In-memory fallback if both IndexedDB and LocalStorage are blocked
const memoryHistory: HistoryItem[] = [];
const memoryProviders: ProviderConfig[] = [DEFAULT_BUILTIN_PROVIDER];
let memoryActiveProviderId: string = DEFAULT_BUILTIN_PROVIDER.id;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(STORE_HISTORY)) {
          const historyStore = db.createObjectStore(STORE_HISTORY, { keyPath: 'id' });
          historyStore.createIndex('timestamp', 'timestamp', { unique: false });
          historyStore.createIndex('domainId', 'domainId', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORE_PROVIDERS)) {
          db.createObjectStore(STORE_PROVIDERS, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
          db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('IndexedDB open error'));
      request.onblocked = () => reject(new Error('IndexedDB blocked'));
    } catch (err) {
      reject(err);
    }
  });
}

// Fallback LocalStorage functions if IndexedDB fails
function getLocalHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return memoryHistory;
  try {
    const raw = localStorage.getItem('promptcrafter_history');
    return raw ? JSON.parse(raw) : memoryHistory;
  } catch {
    return memoryHistory;
  }
}

function setLocalHistory(items: HistoryItem[]): void {
  memoryHistory.length = 0;
  memoryHistory.push(...items);
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('promptcrafter_history', JSON.stringify(items));
  } catch (err) {
    console.warn('LocalStorage write skipped:', err);
  }
}

// Public Storage API

export async function saveHistoryItem(item: HistoryItem): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_HISTORY, 'readwrite');
    const store = tx.objectStore(STORE_HISTORY);
    await new Promise<void>((resolve, reject) => {
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    const history = getLocalHistory();
    const existingIndex = history.findIndex((h) => h.id === item.id);
    if (existingIndex >= 0) {
      history[existingIndex] = item;
    } else {
      history.unshift(item);
    }
    setLocalHistory(history);
  }
}

export async function getHistoryItems(): Promise<HistoryItem[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_HISTORY, 'readonly');
    const store = tx.objectStore(STORE_HISTORY);
    const index = store.index('timestamp');

    return new Promise((resolve, reject) => {
      const request = index.openCursor(null, 'prev'); // Latest first
      const items: HistoryItem[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          items.push(cursor.value);
          cursor.continue();
        } else {
          resolve(items);
        }
      };

      request.onerror = () => reject(request.error);
    });
  } catch {
    return getLocalHistory();
  }
}

export async function deleteHistoryItem(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_HISTORY, 'readwrite');
    const store = tx.objectStore(STORE_HISTORY);
    await new Promise<void>((resolve, reject) => {
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    const history = getLocalHistory().filter((h) => h.id !== id);
    setLocalHistory(history);
  }
}

export async function clearAllHistory(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_HISTORY, 'readwrite');
    const store = tx.objectStore(STORE_HISTORY);
    await new Promise<void>((resolve, reject) => {
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    setLocalHistory([]);
  }
}

export async function toggleFavoriteHistoryItem(id: string): Promise<boolean> {
  const items = await getHistoryItems();
  const target = items.find((i) => i.id === id);
  if (target) {
    target.favorite = !target.favorite;
    await saveHistoryItem(target);
    return target.favorite;
  }
  return false;
}

// Provider Persistence

export async function getSavedProviders(): Promise<ProviderConfig[]> {
  let providers: ProviderConfig[] = [DEFAULT_BUILTIN_PROVIDER];

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_PROVIDERS, 'readonly');
    const store = tx.objectStore(STORE_PROVIDERS);
    const customList = await new Promise<ProviderConfig[]>((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    if (customList.length > 0) {
      // Decrypt keys
      const decrypted = await Promise.all(
        customList.map(async (p) => ({
          ...p,
          apiKey: p.apiKey ? await decryptSecret(p.apiKey) : '',
        }))
      );
      providers = [DEFAULT_BUILTIN_PROVIDER, ...decrypted];
    }
  } catch {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('promptcrafter_custom_providers');
      if (raw) {
        try {
          const customList: ProviderConfig[] = JSON.parse(raw);
          const decrypted = await Promise.all(
            customList.map(async (p) => ({
              ...p,
              apiKey: p.apiKey ? await decryptSecret(p.apiKey) : '',
            }))
          );
          providers = [DEFAULT_BUILTIN_PROVIDER, ...decrypted];
        } catch {
          // Keep default
        }
      }
    }
  }

  return providers;
}

export async function saveProviderConfig(provider: ProviderConfig): Promise<void> {
  if (provider.id === DEFAULT_BUILTIN_PROVIDER.id) return; // Don't overwrite built-in default

  const encryptedProvider = {
    ...provider,
    apiKey: provider.apiKey ? await encryptSecret(provider.apiKey) : '',
  };

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_PROVIDERS, 'readwrite');
    const store = tx.objectStore(STORE_PROVIDERS);
    await new Promise<void>((resolve, reject) => {
      const req = store.put(encryptedProvider);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    if (typeof window !== 'undefined') {
      const existing = await getSavedProviders();
      const customs = existing
        .filter((p) => p.id !== DEFAULT_BUILTIN_PROVIDER.id)
        .filter((p) => p.id !== provider.id);
      customs.push(encryptedProvider);
      localStorage.setItem('promptcrafter_custom_providers', JSON.stringify(customs));
    }
  }
}

export async function deleteProviderConfig(id: string): Promise<void> {
  if (id === DEFAULT_BUILTIN_PROVIDER.id) return;

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_PROVIDERS, 'readwrite');
    const store = tx.objectStore(STORE_PROVIDERS);
    await new Promise<void>((resolve, reject) => {
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    if (typeof window !== 'undefined') {
      const existing = await getSavedProviders();
      const customs = existing
        .filter((p) => p.id !== DEFAULT_BUILTIN_PROVIDER.id && p.id !== id);
      localStorage.setItem('promptcrafter_custom_providers', JSON.stringify(customs));
    }
  }
}

export async function getActiveProviderId(): Promise<string> {
  if (typeof window === 'undefined') return memoryActiveProviderId;
  try {
    return localStorage.getItem('promptcrafter_active_provider_id') || memoryActiveProviderId;
  } catch {
    return memoryActiveProviderId;
  }
}

export async function setActiveProviderId(id: string): Promise<void> {
  memoryActiveProviderId = id;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('promptcrafter_active_provider_id', id);
  } catch {
    // Ignore storage write error
  }
}

export async function getStorageType(): Promise<'INDEXED_DB' | 'LOCAL_STORAGE' | 'IN_MEMORY'> {
  try {
    const db = await openDB();
    db.close();
    return 'INDEXED_DB';
  } catch {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('__test_storage__', '1');
        localStorage.removeItem('__test_storage__');
        return 'LOCAL_STORAGE';
      } catch {
        return 'IN_MEMORY';
      }
    }
    return 'IN_MEMORY';
  }
}
