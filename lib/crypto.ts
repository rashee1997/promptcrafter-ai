/**
 * Client-side Web Crypto API encryption helpers.
 * Encrypts sensitive provider API keys before saving to local browser storage.
 */

const DEVICE_KEY_NAME = 'prompt_crafter_device_salt';

function getOrCreateDeviceSalt(): Uint8Array {
  if (typeof window === 'undefined') return new Uint8Array(16);

  try {
    let saltHex: string | null = null;
    try {
      saltHex = localStorage.getItem(DEVICE_KEY_NAME);
    } catch {
      // Storage access disabled or restricted in iframe
    }

    if (!saltHex) {
      const randomArray = new Uint8Array(16);
      if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        crypto.getRandomValues(randomArray);
      }
      saltHex = Array.from(randomArray, (b) => b.toString(16).padStart(2, '0')).join('');
      try {
        localStorage.setItem(DEVICE_KEY_NAME, saltHex);
      } catch {
        // LocalStorage write failed
      }
    }

    const matches = saltHex.match(/.{1,2}/g) || [];
    return new Uint8Array(matches.map((byte) => parseInt(byte, 16)));
  } catch {
    const fallback = new Uint8Array(16);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(fallback);
    }
    return fallback;
  }
}

async function getEncryptionKey(salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode('PromptCrafterLocalVaultSecretKey2026!'),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptSecret(plainText: string): Promise<string> {
  if (!plainText) return '';
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    return plainText; // SSR fallback
  }

  try {
    const salt = getOrCreateDeviceSalt();
    const key = await getEncryptionKey(salt);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();

    const encryptedContent = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(plainText)
    );

    const combined = new Uint8Array(iv.length + encryptedContent.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedContent), iv.length);

    return Array.from(combined, (b) => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    console.warn('Encryption failed, returning raw key:', err);
    return plainText;
  }
}

export async function decryptSecret(cipherHex: string): Promise<string> {
  if (!cipherHex) return '';
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    return cipherHex;
  }

  // Check if string is hex formatted or raw string
  if (!/^[0-9a-fA-F]+$/.test(cipherHex) || cipherHex.length < 24) {
    return cipherHex; // Was stored in plain text previously
  }

  try {
    const salt = getOrCreateDeviceSalt();
    const key = await getEncryptionKey(salt);

    const matches = cipherHex.match(/.{1,2}/g) || [];
    const combined = new Uint8Array(matches.map((byte) => parseInt(byte, 16)));

    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decryptedContent = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedContent);
  } catch (err) {
    console.warn('Decryption failed, returning input string:', err);
    return cipherHex;
  }
}
