import { z } from 'zod';

export const MAX_PROMPT_CHARS = 100_000;
export const MAX_INPUT_CHARS = 40_000;
export const MAX_ATTACHMENTS = 12;
export const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;
export const MAX_TOTAL_ATTACHMENT_BYTES = 24 * 1024 * 1024;
export const MAX_AB_PROVIDERS = 6;

export const providerSchema = z.object({
  id: z.string().trim().min(1).max(200),
  name: z.string().trim().min(1).max(200),
  baseUrl: z.string().trim().max(2_000).optional().default(''),
  apiKey: z.string().max(10_000).optional().default(''),
  model: z.string().trim().max(300).optional(),
  models: z.array(z.string().trim().min(1).max(300)).max(50).optional(),
  activeModel: z.string().trim().max(300).optional(),
  useBuiltInGemini: z.boolean().optional(),
  disableStreaming: z.boolean().optional(),
  temperature: z.number().finite().min(0).max(2).optional(),
  topP: z.number().finite().min(0).max(1).optional(),
  maxTokens: z.number().int().positive().max(100_000).optional(),
}).passthrough();

export function boundedText(value: unknown, max: number, field: string): string {
  const parsed = z.string().trim().min(1, `${field} is required`).max(max, `${field} is too long`).safeParse(value);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || `${field} is invalid`);
  return parsed.data;
}

export function validateProvider(value: unknown) {
  const parsed = providerSchema.safeParse(value);
  if (!parsed.success) throw new Error('Provider configuration is invalid.');
  return {
    ...parsed.data,
    model: parsed.data.model || parsed.data.activeModel || parsed.data.models?.[0] || 'default',
    temperature: parsed.data.temperature ?? 0.7,
    topP: parsed.data.topP ?? 0.95,
    maxTokens: parsed.data.maxTokens ?? 8192,
  };
}

export function validateProviderUrl(url: string): void {
  if (!url) return;
  const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  const parsed = new URL(normalized);
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Provider URL must use HTTP or HTTPS.');
  const hostname = parsed.hostname.toLowerCase();
  const blocked = hostname === 'localhost' || hostname === '::1' || hostname === '0.0.0.0' ||
    /^127\./.test(hostname) || /^10\./.test(hostname) || /^192\.168\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname) || hostname.endsWith('.local');
  if (blocked && process.env.NODE_ENV === 'production') throw new Error('Private provider endpoints are not allowed in production.');
}

export function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char] as string));
}

export function validateDataUrl(value: unknown, allowedPrefix = /^data:(image|application)\/[\w.+-]+;base64,/): string {
  if (typeof value !== 'string' || !allowedPrefix.test(value)) throw new Error('Invalid attachment data.');
  const comma = value.indexOf(',');
  const encoded = value.slice(comma + 1);
  const bytes = Math.floor(encoded.length * 0.75);
  if (bytes > MAX_ATTACHMENT_BYTES) throw new Error('Attachment is too large.');
  return value;
}
