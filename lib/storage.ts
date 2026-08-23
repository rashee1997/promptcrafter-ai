import { AppSettings, DEFAULT_APP_SETTINGS, CustomPresetEntry, CustomPresetMode, HistoryItem, PromptFragment, PromptQuality, PromptTemplate, ProviderConfig, PromptVersion, Session, TestRun, ThreadMessage } from '@/types';
import type { StoryBibleCharacterImage } from '@/types/video';
import { decryptSecret, encryptSecret } from './crypto';
import { computePromptStats } from './prompt-stats';
import { blobToDataUrl } from './compression';
import { extractPromptVariables, lintPromptVariables } from './prompt-variables';

const DB_NAME = 'PromptCrafter_DB';
const DB_VERSION = 6;
const STORE_HISTORY = 'history';
const STORE_SESSIONS = 'sessions';
const STORE_PROVIDERS = 'providers';
const STORE_SETTINGS = 'settings';
const STORE_CUSTOM_PRESETS = 'customPresets';
const STORE_VIDEO_PROJECTS = 'videoProjects';
const STORE_STORY_BIBLE = 'storyBible';
const STORE_TEMPLATES = 'templates';
const STORE_FRAGMENTS = 'fragments';
const STORE_IMAGE_PROMPTS = 'imagePrompts';
const STORE_IMAGE_KITS = 'imageKits';

/**
 * Default Gemini model used whenever a request doesn't carry an explicit
 * model selection. Kept as a stable, broadly available model — the newest
 * models are available in GEMINI_MODEL_LIST for users who opt in.
 */
export const GEMINI_DEFAULT_MODEL = 'gemini-3.6-flash';

/**
 * Curated Gemini API model list (official docs, August 2026) exposed in the
 * built-in provider's model selector. Order: newest stable first, then
 * frontier previews, then the rest of the stable family, then the proven
 * 2.5 fallback tier. `activeModel` pins the default so the dropdown order
 * never silently changes what model fresh users get.
 */
export const GEMINI_MODEL_LIST: string[] = [
  // Latest stable — most capable Flash model
  'gemini-3.7-flash',
  // Current default — previous-gen Flash, reliable and multimodal
  GEMINI_DEFAULT_MODEL,
  // Frontier previews (may have tighter rate limits)
  'gemini-3.1-pro-preview',
  'gemini-3-flash-preview',
  // Stable 3.x family
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  // Fallback tier — proven 2.5 family
  'gemini-2.5-pro',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
];

export const DEFAULT_BUILTIN_PROVIDER: ProviderConfig = {
  id: 'default-gemini',
  name: 'Google Gemini (Server Default)',
  baseUrl: 'https://generativelanguage.googleapis.com',
  apiKey: 'BUILTIN', // handled server side with GEMINI_API_KEY
  model: GEMINI_DEFAULT_MODEL,
  models: GEMINI_MODEL_LIST,
  activeModel: GEMINI_DEFAULT_MODEL,
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
const memoryCustomPresets: CustomPresetEntry[] = [];
const memoryTemplates: PromptTemplate[] = [];
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
        modelUsed: item.modelUsed || GEMINI_DEFAULT_MODEL,
        stats,
        variables: extractPromptVariables(item.output || ''),
        variableLint: lintPromptVariables(item.output || ''),
      },
    ],
    activeVersionId: v1Id,
    favorite: !!item.favorite,
    tags: item.tags || [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function openDB(): Promise<IDBDatabase> {
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

        // Schema v3: dedicated store for user-saved custom chip presets (kept
        // separate from the arbitrary key-value STORE_SETTINGS so presets stay
        // queryable/deletable per studio field independently).
        if (!db.objectStoreNames.contains(STORE_CUSTOM_PRESETS)) {
          db.createObjectStore(STORE_CUSTOM_PRESETS, { keyPath: 'id' });
        }

        // Schema v4: dedicated store for Video Prompt Studio projects. Kept
        // separate from sessions so video projects stay queryable/deletable
        // per project independently of the prompt-engineering session store.
        if (!db.objectStoreNames.contains(STORE_VIDEO_PROJECTS)) {
          db.createObjectStore(STORE_VIDEO_PROJECTS, { keyPath: 'id' });
        }

        // Schema v5: Story Bible character images (compressed WebP blobs). Kept
        // separate from video projects because blobs are large and must be
        // queryable per project + timestamp without loading whole projects.
        if (!db.objectStoreNames.contains(STORE_STORY_BIBLE)) {
          const storyBibleStore = db.createObjectStore(STORE_STORY_BIBLE, { keyPath: 'id' });
          storyBibleStore.createIndex('projectId', 'projectId', { unique: false });
          storyBibleStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Store for saved prompt templates (configuration presets, not outputs).
        if (!db.objectStoreNames.contains(STORE_TEMPLATES)) {
          db.createObjectStore(STORE_TEMPLATES, { keyPath: 'id' });
        }

        // Schema v6: Image Prompt Studio gallery and reusable Brand/Subject kits
        if (!db.objectStoreNames.contains(STORE_IMAGE_PROMPTS)) {
          const imgStore = db.createObjectStore(STORE_IMAGE_PROMPTS, { keyPath: 'id' });
          imgStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORE_IMAGE_KITS)) {
          const kitStore = db.createObjectStore(STORE_IMAGE_KITS, { keyPath: 'id' });
          kitStore.createIndex('createdAt', 'createdAt', { unique: false });
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

// Fallback LocalStorage functions for custom presets (same shape as sessions)
function getLocalCustomPresets(): CustomPresetEntry[] {
  if (typeof window === 'undefined') return memoryCustomPresets;
  try {
    const raw = localStorage.getItem('promptcrafter_custom_presets');
    if (raw) {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : memoryCustomPresets;
    }
    return memoryCustomPresets;
  } catch {
    return memoryCustomPresets;
  }
}

function setLocalCustomPresets(entries: CustomPresetEntry[]): void {
  memoryCustomPresets.length = 0;
  memoryCustomPresets.push(...entries);
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('promptcrafter_custom_presets', JSON.stringify(entries));
  } catch (err) {
    console.warn('LocalStorage write skipped:', err);
  }
}

/**
 * Filter a preset list to one studio field, honoring the requested mode scope:
 * 'both' presets surface for every query; image/logo presets only for their own.
 */
function filterCustomPresets(
  entries: CustomPresetEntry[],
  field: string,
  mode: CustomPresetMode
): CustomPresetEntry[] {
  return entries
    .filter((e) => e.field === field && (mode === 'both' || e.mode === mode || e.mode === 'both'))
    .sort((a, b) => a.createdAt - b.createdAt);
}

// --- Custom Preset Public Storage API (Image/Logo Prompt Studio) ---

export async function getCustomPresets(field: string, mode: CustomPresetMode): Promise<CustomPresetEntry[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_CUSTOM_PRESETS, 'readonly');
    const store = tx.objectStore(STORE_CUSTOM_PRESETS);
    const all = await new Promise<CustomPresetEntry[]>((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
    return filterCustomPresets(all, field, mode);
  } catch {
    return filterCustomPresets(getLocalCustomPresets(), field, mode);
  }
}

export async function saveCustomPreset(
  entry: Omit<CustomPresetEntry, 'id' | 'createdAt'>
): Promise<CustomPresetEntry> {
  const full: CustomPresetEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_CUSTOM_PRESETS, 'readwrite');
    const store = tx.objectStore(STORE_CUSTOM_PRESETS);
    await new Promise<void>((resolve, reject) => {
      const req = store.put(full);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    const entries = getLocalCustomPresets();
    entries.push(full);
    setLocalCustomPresets(entries);
  }

  return full;
}

export async function deleteCustomPreset(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_CUSTOM_PRESETS, 'readwrite');
    const store = tx.objectStore(STORE_CUSTOM_PRESETS);
    await new Promise<void>((resolve, reject) => {
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    const entries = getLocalCustomPresets().filter((e) => e.id !== id);
    setLocalCustomPresets(entries);
  }
}

// --- Story Bible Character Image Storage API (Video Prompt Studio) ---
// Persists compressed WebP blobs per project. IndexedDB stores Blobs natively
// (structured clone); the LocalStorage fallback mirrors them as data URLs.

const STORY_BIBLE_LS_KEY = 'promptcrafter_story_bible';

function getLocalStoryBible(): StoryBibleCharacterImage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORY_BIBLE_LS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setLocalStoryBible(entries: StoryBibleCharacterImage[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORY_BIBLE_LS_KEY, JSON.stringify(entries));
  } catch (err) {
    console.warn('Story Bible LocalStorage write skipped:', err);
  }
}

/** LocalStorage fallback — Blobs become data URLs before JSON serialization. */
async function toSerializable(entry: StoryBibleCharacterImage): Promise<StoryBibleCharacterImage> {
  if (entry.imageBlob && !entry.imageDataUrl) {
    try {
      return { ...entry, imageBlob: undefined, imageDataUrl: await blobToDataUrl(entry.imageBlob) };
    } catch {
      return { ...entry, imageBlob: undefined };
    }
  }
  return entry;
}

/** Saves one compressed character reference image to the Story Bible store. */
export async function saveStoryBibleCharacterImage(
  input: Omit<StoryBibleCharacterImage, 'id' | 'timestamp'>
): Promise<StoryBibleCharacterImage> {
  const full: StoryBibleCharacterImage = {
    ...input,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_STORY_BIBLE, 'readwrite');
    const store = tx.objectStore(STORE_STORY_BIBLE);
    await new Promise<void>((resolve, reject) => {
      const req = store.put(full);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    const entries = getLocalStoryBible();
    entries.unshift(await toSerializable(full));
    setLocalStoryBible(entries);
  }

  return full;
}

/** Loads every Story Bible character image for a project (newest first). */
export async function getStoryBibleCharacterImages(
  projectId: string
): Promise<StoryBibleCharacterImage[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_STORY_BIBLE, 'readonly');
      const store = tx.objectStore(STORE_STORY_BIBLE);
      const index = store.index('projectId');
      const request = index.openCursor(IDBKeyRange.only(projectId), 'prev');
      const items: StoryBibleCharacterImage[] = [];
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
    return getLocalStoryBible()
      .filter((e) => e.projectId === projectId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }
}

/**
 * Marks one Story Bible image as the character's primary reference, clearing
 * the flag on the project's other entries. Falls back to LocalStorage.
 */
export async function setStoryBibleCharacterImagePrimary(projectId: string, id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_STORY_BIBLE, 'readwrite');
    const store = tx.objectStore(STORE_STORY_BIBLE);
    const index = store.index('projectId');
    const entries = await new Promise<StoryBibleCharacterImage[]>((resolve, reject) => {
      const req = index.getAll(IDBKeyRange.only(projectId));
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
    for (const entry of entries) {
      if (entry.isPrimary === (entry.id === id)) continue;
      await new Promise<void>((resolve, reject) => {
        const req = store.put({ ...entry, isPrimary: entry.id === id });
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    }
  } catch {
    setLocalStoryBible(
      getLocalStoryBible().map((e) =>
        e.projectId === projectId ? { ...e, isPrimary: e.id === id } : e
      )
    );
  }
}

/** Removes one Story Bible character image. */
export async function deleteStoryBibleCharacterImage(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_STORY_BIBLE, 'readwrite');
    const store = tx.objectStore(STORE_STORY_BIBLE);
    await new Promise<void>((resolve, reject) => {
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    setLocalStoryBible(getLocalStoryBible().filter((e) => e.id !== id));
  }
}

// --- App Settings Storage API (Phase 6) ---

const SETTINGS_STORAGE_KEY = 'promptcrafter_app_settings';
let memorySettings: AppSettings = { ...DEFAULT_APP_SETTINGS };

export async function getAppSettings(): Promise<AppSettings> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_SETTINGS, 'readonly');
    const store = tx.objectStore(STORE_SETTINGS);
    const result = await new Promise<AppSettings | undefined>((resolve, reject) => {
      const req = store.get('appSettings');
      req.onsuccess = () => resolve(req.result?.value as AppSettings | undefined);
      req.onerror = () => reject(req.error);
    });
    if (result && typeof result === 'object') {
      // Merge with defaults so new fields are always present
      return { ...DEFAULT_APP_SETTINGS, ...result };
    }
    return { ...DEFAULT_APP_SETTINGS };
  } catch {
    // LocalStorage fallback
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(SETTINGS_STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AppSettings>;
        return { ...DEFAULT_APP_SETTINGS, ...parsed };
      }
    } catch { /* ignore */ }
    return { ...memorySettings };
  }
}

export async function setAppSettings(settings: AppSettings): Promise<void> {
  const toSave = { ...settings, _version: settings._version || DEFAULT_APP_SETTINGS._version };
  memorySettings = { ...toSave };
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_SETTINGS, 'readwrite');
    const store = tx.objectStore(STORE_SETTINGS);
    await new Promise<void>((resolve, reject) => {
      const req = store.put({ key: 'appSettings', value: toSave });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(toSave));
      }
    } catch (err) {
      console.warn('AppSettings LocalStorage write skipped:', err);
    }
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

  const populatedVersion: PromptVersion = {
    ...version,
    variables: version.variables || extractPromptVariables(version.content || ''),
    variableLint: version.variableLint || lintPromptVariables(version.content || ''),
  };

  const updatedVersions = [...session.versions, populatedVersion];
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

  // Append to the version's score history instead of overwriting, so drift
  // detection keeps its baseline. Seed history from the existing `quality` for
  // sessions saved before qualityHistory existed (backward compatible).
  const updatedVersions = session.versions.map((v) => {
    if (v.id !== versionId) return v;
    const seeded = v.qualityHistory?.length ? v.qualityHistory : v.quality ? [v.quality] : [];
    const last = seeded[seeded.length - 1];
    const history =
      last && last.evaluatedAt === quality.evaluatedAt ? seeded : [...seeded, quality];
    return { ...v, quality, qualityHistory: history };
  });

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

// --- Prompt Template Storage API ---

function getLocalTemplates(): PromptTemplate[] {
  if (typeof window === 'undefined') return memoryTemplates;
  try {
    const raw = localStorage.getItem('promptcrafter_templates');
    if (raw) {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : memoryTemplates;
    }
    return memoryTemplates;
  } catch {
    return memoryTemplates;
  }
}

function setLocalTemplates(templates: PromptTemplate[]): void {
  memoryTemplates.length = 0;
  memoryTemplates.push(...templates);
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('promptcrafter_templates', JSON.stringify(templates));
  } catch (err) {
    console.warn('LocalStorage write skipped:', err);
  }
}

export async function getTemplates(): Promise<PromptTemplate[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_TEMPLATES, 'readonly');
    const store = tx.objectStore(STORE_TEMPLATES);
    const all = await new Promise<PromptTemplate[]>((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
    return all.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return getLocalTemplates().sort((a, b) => b.createdAt - a.createdAt);
  }
}

export async function saveTemplate(template: PromptTemplate): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_TEMPLATES, 'readwrite');
    const store = tx.objectStore(STORE_TEMPLATES);
    await new Promise<void>((resolve, reject) => {
      const req = store.put(template);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    const templates = getLocalTemplates();
    const idx = templates.findIndex((t) => t.id === template.id);
    if (idx >= 0) {
      templates[idx] = template;
    } else {
      templates.unshift(template);
    }
    setLocalTemplates(templates);
  }
}

export async function deleteTemplate(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_TEMPLATES, 'readwrite');
    const store = tx.objectStore(STORE_TEMPLATES);
    await new Promise<void>((resolve, reject) => {
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    setLocalTemplates(getLocalTemplates().filter((t) => t.id !== id));
  }
}

// ── Phase 10: Reusable Prompt Fragment Storage ──────────────────────────────

const FRAGMENTS_STORAGE_KEY = 'pc_saved_fragments';

export const BUILT_IN_FRAGMENTS: PromptFragment[] = [
  {
    id: 'frag-anti-laziness',
    title: 'Anti-Laziness & Zero TODOs',
    category: 'guardrail',
    description: 'Strictly forbids placeholders, pseudo-code, and omissions.',
    content: 'ANTI-LAZINESS DIRECTIVE: Never emit placeholder code, ellipses (`// ...`), `// TODO`, or pseudo-code abbreviations. Every function and type definition must be 100% fully implemented, valid, and copy-paste ready.',
    createdAt: 1,
  },
  {
    id: 'frag-json-schema',
    title: 'Strict JSON Schema Enforcement',
    category: 'output-spec',
    description: 'Forces pure valid JSON response without conversational wrapper.',
    content: 'OUTPUT FORMAT DIRECTIVE: Respond with a strictly valid JSON object matching the requested schema. Do NOT include markdown code blocks (```json), conversational pleasantries, or preamble.',
    createdAt: 2,
  },
  {
    id: 'frag-hallucination-defense',
    title: 'Hallucination Defense & Evidence',
    category: 'guardrail',
    description: 'Instructs the model to flag unverified claims and cite sources.',
    content: 'FACTUAL INTEGRITY DIRECTIVE: Verify all claims against provided context. If a fact is unknown or uncertain, explicitly state "Unverified" instead of guessing or hallucinating plausible details.',
    createdAt: 3,
  },
  {
    id: 'frag-executive-voice',
    title: 'Executive / Decision-Maker Voice',
    category: 'persona',
    description: 'High-signal, concise, decision-oriented tone.',
    content: 'TONE DIRECTIVE: Adopt an executive advisory voice. Front-load conclusions, use bulleted action items, omit fluff, and emphasize ROI, risks, and strategic tradeoffs.',
    createdAt: 4,
  },
];

export function getLocalFragments(): PromptFragment[] {
  if (typeof window === 'undefined') return BUILT_IN_FRAGMENTS;
  try {
    const raw = localStorage.getItem(FRAGMENTS_STORAGE_KEY);
    if (!raw) return BUILT_IN_FRAGMENTS;
    const userCustom: PromptFragment[] = JSON.parse(raw);
    return [...BUILT_IN_FRAGMENTS, ...userCustom];
  } catch {
    return BUILT_IN_FRAGMENTS;
  }
}

export function saveLocalFragment(fragment: PromptFragment): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalFragments().filter((f) => !BUILT_IN_FRAGMENTS.some((b) => b.id === f.id));
    const idx = current.findIndex((f) => f.id === fragment.id);
    if (idx >= 0) {
      current[idx] = fragment;
    } else {
      current.unshift(fragment);
    }
    localStorage.setItem(FRAGMENTS_STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.warn('saveLocalFragment error:', err);
  }
}

export function deleteLocalFragment(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalFragments().filter((f) => !BUILT_IN_FRAGMENTS.some((b) => b.id === f.id && b.id !== id));
    localStorage.setItem(FRAGMENTS_STORAGE_KEY, JSON.stringify(current.filter((f) => f.id !== id)));
  } catch (err) {
    console.warn('deleteLocalFragment error:', err);
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
