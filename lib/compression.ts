// Video Prompt Studio — Phase 3 client-side compression helpers.
// User-uploaded character images are compressed to WebP locally (off-screen
// canvas) before they hit the Story Bible IndexedDB store, so memory and
// storage stay bounded even with large camera exports.

/** Reads a File into a data URL (base64). */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('Could not read file.'));
    reader.readAsDataURL(file);
  });
}

/** Converts a Blob (e.g. a compressed WebP) into a data URL. */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('Could not read blob.'));
    reader.readAsDataURL(blob);
  });
}

function loadImage(source: string | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = typeof source === 'string' ? source : URL.createObjectURL(source);
    const img = new Image();
    img.onload = () => {
      if (typeof source !== 'string') URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      if (typeof source !== 'string') URL.revokeObjectURL(url);
      reject(new Error('Image could not be decoded.'));
    };
    img.src = url;
  });
}

/**
 * Scales an image down to `maxWidth` (aspect preserved) and re-encodes it as
 * a WebP Blob. Falls back to the original data URL's bytes when canvas
 * encoding is unavailable, so the upload path never hard-fails.
 */
export async function compressToWebP(
  source: string | File | Blob,
  maxWidth = 1024,
  quality = 0.8
): Promise<Blob> {
  try {
    const img = await loadImage(source);
    const scale = Math.min(1, maxWidth / Math.max(1, img.naturalWidth || img.width));
    const width = Math.max(1, Math.round((img.naturalWidth || img.width) * scale));
    const height = Math.max(1, Math.round((img.naturalHeight || img.height) * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable.');

    // White underlay keeps character-sheet transparency from blacking out.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', quality)
    );
    if (blob) return blob;

    // Canvas toBlob unsupported — hand back the original bytes.
    if (source instanceof File || source instanceof Blob) return source;
    const match = parseBase64DataUrl(source);
    if (match) return new Blob([match.bytes], { type: match.mimeType });
    throw new Error('Image compression produced no output.');
  } catch {
    if (source instanceof File || source instanceof Blob) return source;
    const match = parseBase64DataUrl(source);
    if (match) return new Blob([match.bytes], { type: match.mimeType });
    throw new Error('Unsupported image source.');
  }
}

/** Decodes `data:<mime>;base64,...` without regex flags newer than the TS target. */
function parseBase64DataUrl(dataUrl: string): { mimeType: string; bytes: Uint8Array<ArrayBuffer> } | null {
  const comma = dataUrl.indexOf(',');
  const header = comma > -1 ? dataUrl.slice(0, comma) : '';
  const payload = comma > -1 ? dataUrl.slice(comma + 1) : '';
  const match = /^data:([^;]+);base64$/i.exec(header);
  if (!match || !payload) return null;
  try {
    const binary = atob(payload);
    const buffer = new ArrayBuffer(binary.length);
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return { mimeType: match[1], bytes };
  } catch {
    return null;
  }
}
