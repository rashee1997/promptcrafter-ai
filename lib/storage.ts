import { HistoryItem, PromptQuality, ProviderConfig, PromptVersion, Session, TestRun, ThreadMessage } from '@/types';
import { decryptSecret, encryptSecret } from './crypto';
import { computePromptStats } from './prompt-stats';

const DB_NAME = 'PromptCrafter_DB';
const DB_VERSION = 2;
const STORE_HISTORY = 'history';
const STORE_SESSIONS = 'sessions';
const STORE_PROVIDERS = 'providers';
const STORE_SETTINGS = 'settings';

export const DEFAULT_BUILTIN_PROVIDER: ProviderConfig = {
  id: 'default-gemini',
  name: 'Google Gemini 3.6 Flash (Server Default)',
  baseUrl: 'https://generativelanguage.googleapis.com',
  apiKey: 'BUILTIN', // handled server side with GEMINI_API_KEY
  model: 'gemini-3.6-flash',
  models: ['gemini-3.6-flash'],
  isDefault: true,
  useBuiltInGemini: true,
  temperature: 0.7,
  maxTokens: 4096,
  topP: 0.95,
};

// In-memory fallbacks if IndexedDB/LocalStorage are blocked
const memorySessions: Session[] = [];
const memoryHistory: HistoryItem[] = [];
const memoryProviders: ProviderConfig[] = [DEFAULT_BUILTIN_PROVIDER];
let memoryActiveProviderId: string = DEFAULT_BUILTIN_PROVIDER.id;
const memoryActiveModels: Record<string, string> = {};

function convertHistoryItemToSession(item: HistoryItem): Session {
  const timestamp = item.timestamp || Date.now();
  const rand = Math.random().toString(36).slice(2, 7);
  const sessId = `sess-${timestamp}-${rand}`;
  const v1Id = `v-${timestamp}-1`;
  const stats = computePromptStats(item.output || '');

  return {
    id: sessId,
    title: item.input?.topic || 'Initial Generation',
    domainId: item.domainId || 'general',
    domainName: item.domainName || 'General',
    originalInput: item.input,
    messages: [
      {
        id: `msg-${timestamp}-1`,
        role: 'user',
        content: item.input?.topic ? `Topic: ${item.input.topic}` : 'Initial Generation',
        createdAt: timestamp,
      },
      {
        id: `msg-${timestamp}-2`,
        role: 'assistant',
        content: item.output || '',
        createdAt: timestamp,
        resultingVersionId: v1Id,
      },
    ],
    versions: [
      {
        id: v1Id,
        versionNumber: 1,
        name: 'Initial Generation',
        sourceType: 'initial',
        createdAt: timestamp,
        content: item.output || '',
        providerName: item.providerName || 'Default Provider',
        modelUsed: item.modelUsed || 'gemini-3.6-flash',
        stats,
      },
    ],
    activeVersionId: v1Id,
    favorite: !!item.favorite,
    tags: item.tags || [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const tx = (event.target as IDBOpenDBRequest).transaction!;

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

        if (!db.objectStoreNames.contains(STORE_SESSIONS)) {
          const sessionsStore = db.createObjectStore(STORE_SESSIONS, { keyPath: 'id' });
          sessionsStore.createIndex('updatedAt', 'updatedAt', { unique: false });
          sessionsStore.createIndex('domainId', 'domainId', { unique: false });
        }

        // Schema migration v1 -> v2: read from `history` store and populate `sessions`
        if (db.objectStoreNames.contains(STORE_HISTORY) && db.objectStoreNames.contains(STORE_SESSIONS)) {
          const historyStore = tx.objectStore(STORE_HISTORY);
          const sessionsStore = tx.objectStore(STORE_SESSIONS);

          const getAllReq = historyStore.getAll();
          getAllReq.onsuccess = () => {
            const items: HistoryItem[] = getAllReq.result || [];
            for (const item of items) {
              if (item && item.id) {
                const session = convertHistoryItemToSession(item);
                sessionsStore.put(session);
              }
            }
          };
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

// Fallback LocalStorage functions
function getLocalSessions(): Session[] {
  if (typeof window === 'undefined') return memorySessions;
  try {
    const raw = localStorage.getItem('promptcrafter_sessions');
    if (raw) {
      return JSON.parse(raw);
    }

    // Fallback migration from old history store
    const rawHistory = localStorage.getItem('promptcrafter_history');
    if (rawHistory) {
      const historyItems: HistoryItem[] = JSON.parse(rawHistory);
      const migrated = historyItems.map(convertHistoryItemToSession);
      localStorage.setItem('promptcrafter_sessions', JSON.stringify(migrated));
      return migrated;
    }

    return memorySessions;
  } catch {
    return memorySessions;
  }
}

function setLocalSessions(sessions: Session[]): void {
  memorySessions.length = 0;
  memorySessions.push(...sessions);
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('promptcrafter_sessions', JSON.stringify(sessions));
  } catch (err) {
    console.warn('LocalStorage write skipped:', err);
  }
}

// --- Session Public Storage API ---

export async function saveSession(session: Session): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_SESSIONS, 'readwrite');
    const store = tx.objectStore(STORE_SESSIONS);
    await new Promise<void>((resolve, reject) => {
      const req = store.put(session);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    const sessions = getLocalSessions();
    const existingIndex = sessions.findIndex((s) => s.id === session.id);
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.unshift(session);
    }
    setLocalSessions(sessions);
  }
}

export async function getSessions(): Promise<Session[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_SESSIONS, 'readonly');
    const store = tx.objectStore(STORE_SESSIONS);
    const index = store.index('updatedAt');

    return new Promise((resolve, reject) => {
      const request = index.openCursor(null, 'prev'); // Latest updated first
      const items: Session[] = [];

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
    return getLocalSessions().sort((a, b) => b.updatedAt - a.updatedAt);
  }
}

export async function getSessionById(id: string): Promise<Session | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_SESSIONS, 'readonly');
    const store = tx.objectStore(STORE_SESSIONS);

    return new Promise((resolve, reject) => {
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    const sessions = getLocalSessions();
    return sessions.find((s) => s.id === id) || null;
  }
}

export async function deleteSession(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_SESSIONS, 'readwrite');
    const store = tx.objectStore(STORE_SESSIONS);
    await new Promise<void>((resolve, reject) => {
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    const sessions = getLocalSessions().filter((s) => s.id !== id);
    setLocalSessions(sessions);
  }
}

export async function clearAllSessions(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_SESSIONS, 'readwrite');
    const store = tx.objectStore(STORE_SESSIONS);
    await new Promise<void>((resolve, reject) => {
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    setLocalSessions([]);
  }
}

export async function addVersionToSession(
  sessionId: string,
  version: PromptVersion,
  userMessage?: ThreadMessage,
  assistantMessage?: ThreadMessage
): Promise<Session> {
  const session = await getSessionById(sessionId);
  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }

  const updatedVersions = [...session.versions, version];
  const updatedMessages = [...session.messages];

  if (userMessage) updatedMessages.push(userMessage);
  if (assistantMessage) updatedMessages.push(assistantMessage);

  const updatedSession: Session = {
    ...session,
    versions: updatedVersions,
    messages: updatedMessages,
    activeVersionId: version.id,
    updatedAt: Date.now(),
  };

  await saveSession(updatedSession);
  return updatedSession;
}

// --- Measurement APIs (F1 scorecard, F3 regression suite, F6 health) ---

export async function setVersionQuality(sessionId: string, versionId: string, quality: PromptQuality): Promise<Session> {
  const session = await getSessionById(sessionId);
  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }

  const updatedVersions = session.versions.map((v) =>
    v.id === versionId ? { ...v, quality } : v
  );

  const updatedSession: Session = {
    ...session,
    versions: updatedVersions,
    updatedAt: Date.now(),
  };

  await saveSession(updatedSession);
  return updatedSession;
}

export async function saveTestSuite(sessionId: string, testSuite: string[]): Promise<Session> {
  const session = await getSessionById(sessionId);
  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }

  const updatedSession: Session = {
    ...session,
    testSuite,
    updatedAt: Date.now(),
  };

  await saveSession(updatedSession);
  return updatedSession;
}

export async function saveTestRun(sessionId: string, testRun: TestRun): Promise<Session> {
  const session = await getSessionById(sessionId);
  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }

  // Keep the last 20 runs per session to bound storage growth
  const updatedRuns = [testRun, ...(session.testRuns || [])].slice(0, 20);

  const updatedSession: Session = {
    ...session,
    testRuns: updatedRuns,
    updatedAt: Date.now(),
  };

  await saveSession(updatedSession);
  return updatedSession;
}

export async function setActiveVersion(sessionId: string, versionId: string): Promise<Session> {
  const session = await getSessionById(sessionId);
  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }

  const updatedSession: Session = {
    ...session,
    activeVersionId: versionId,
    updatedAt: Date.now(),
  };

  await saveSession(updatedSession);
  return updatedSession;
}

export async function renameVersion(sessionId: string, versionId: string, newName: string): Promise<Session> {
  const session = await getSessionById(sessionId);
  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }

  const updatedVersions = session.versions.map((v) =>
    v.id === versionId ? { ...v, name: newName } : v
  );

  const updatedSession: Session = {
    ...session,
    versions: updatedVersions,
    updatedAt: Date.now(),
  };

  await saveSession(updatedSession);
  return updatedSession;
}

export async function deleteVersionFromSession(sessionId: string, versionId: string): Promise<Session> {
  const session = await getSessionById(sessionId);
  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }

  if (session.versions.length <= 1) {
    throw new Error('Cannot delete the only remaining version in a session');
  }

  const updatedVersions = session.versions.filter((v) => v.id !== versionId);
  const updatedMessages = session.messages.filter((m) => m.resultingVersionId !== versionId);

  const activeVersionId = session.activeVersionId === versionId
    ? updatedVersions[updatedVersions.length - 1].id
    : session.activeVersionId;

  const updatedSession: Session = {
    ...session,
    versions: updatedVersions,
    messages: updatedMessages,
    activeVersionId,
    updatedAt: Date.now(),
  };

  await saveSession(updatedSession);
  return updatedSession;
}

export async function toggleFavoriteSession(id: string): Promise<boolean> {
  const session = await getSessionById(id);
  if (session) {
    session.favorite = !session.favorite;
    session.updatedAt = Date.now();
    await saveSession(session);
    return session.favorite;
  }
  return false;
}

// --- Deprecated History API (Kept for backwards compatibility) ---

export async function saveHistoryItem(item: HistoryItem): Promise<void> {
  const session = convertHistoryItemToSession(item);
  await saveSession(session);
}

export async function getHistoryItems(): Promise<HistoryItem[]> {
  const sessions = await getSessions();
  return sessions.map((s) => {
    const activeVersion = s.versions.find((v) => v.id === s.activeVersionId) || s.versions[0];
    return {
      id: s.id,
      timestamp: s.createdAt,
      domainId: s.domainId,
      domainName: s.domainName,
      input: s.originalInput,
      output: activeVersion ? activeVersion.content : '',
      providerName: activeVersion ? activeVersion.providerName : '',
      modelUsed: activeVersion ? activeVersion.modelUsed : '',
      favorite: s.favorite,
      tags: s.tags,
    };
  });
}

export async function deleteHistoryItem(id: string): Promise<void> {
  await deleteSession(id);
}

export async function clearAllHistory(): Promise<void> {
  await clearAllSessions();
}

export async function toggleFavoriteHistoryItem(id: string): Promise<boolean> {
  return toggleFavoriteSession(id);
}

// --- Provider Persistence ---

/**
 * Normalizes a provider's model list: returns `models` when populated, otherwise
 * falls back to `[model]` so older persisted configs stay fully readable.
 */
export function getProviderModelList(provider: ProviderConfig): string[] {
  const explicit = Array.isArray(provider.models)
    ? provider.models.map((m) => m?.trim()).filter(Boolean)
    : [];
  if (explicit.length > 0) return explicit;
  const base = provider.model?.trim();
  if (base) return [base];
  return ['gpt-4o-mini'];
}

/** Reads the locally persisted active model for a provider (LocalStorage map). */
export async function getActiveModelForProvider(providerId: string): Promise<string | null> {
  if (typeof window === 'undefined') return memoryActiveModels[providerId] ?? null;
  try {
    const raw = localStorage.getItem('promptcrafter_active_models');
    if (raw) {
      const map = JSON.parse(raw) as Record<string, string>;
      return map?.[providerId] ?? null;
    }
  } catch {
    // Fall through to memory
  }
  return memoryActiveModels[providerId] ?? null;
}

/** Persists the selected model for a provider locally (LocalStorage map). */
export async function setActiveModelForProvider(providerId: string, model: string): Promise<void> {
  memoryActiveModels[providerId] = model;
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('promptcrafter_active_models');
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    map[providerId] = model;
    localStorage.setItem('promptcrafter_active_models', JSON.stringify(map));
  } catch {
    // Ignore storage write error
  }
}

/**
 * Resolves the currently selected model for a provider: persisted selection first,
 * then `activeModel`, then the first entry of the model list.
 */
export async function getProviderActiveModel(provider: ProviderConfig): Promise<string> {
  const list = getProviderModelList(provider);
  const stored = await getActiveModelForProvider(provider.id);
  if (stored && list.includes(stored)) return stored;
  if (provider.activeModel && list.includes(provider.activeModel)) return provider.activeModel;
  return list[0];
}

function normalizeProviderModels(provider: ProviderConfig): ProviderConfig {
  return {
    ...provider,
    models: getProviderModelList(provider),
  };
}

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
      const decrypted = await Promise.all(
        customList.map(async (p) => ({
          ...normalizeProviderModels(p),
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
              ...normalizeProviderModels(p),
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
  if (provider.id === DEFAULT_BUILTIN_PROVIDER.id) return;

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
