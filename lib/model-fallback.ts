import { GoogleGenAI } from '@google/genai';
import type { ProviderConfig } from '@/types';
import type { VideoChatFile } from '@/types/video';
import { GEMINI_DEFAULT_MODEL } from './storage';
import { resolveModelId } from './video-ai';

export const FALLBACK_MODES = ['none', 'manual', 'auto'] as const;
export type FallbackMode = (typeof FALLBACK_MODES)[number];

/**
 * Ordered, deduped list of models a request should attempt, primary first.
 *
 * - none:        just the primary model (backward compatible — no fallback)
 * - manual:      primary, then the user's `fallbackModel` (if it differs)
 * - auto:        primary, then every other configured model in list order
 *
 * Edge cases: empty model field falls back to the first configured model;
 * duplicate entries are collapsed; a manual fallback identical to the primary
 * is skipped.
 */
export function buildModelAttemptList(provider: ProviderConfig): string[] {
  const configured = Array.isArray(provider.models)
    ? [...new Set(provider.models.map((m) => m?.trim()).filter(Boolean))]
    : [];
  const primary = provider.model?.trim() || configured[0] || '';
  const attempts: string[] = [];
  if (primary) attempts.push(primary);

  const others = configured.filter((m) => m !== primary);
  if (provider.fallbackMode === 'manual') {
    const manual = provider.fallbackModel?.trim();
    if (manual && manual !== primary) attempts.push(manual);
  } else if (provider.fallbackMode === 'auto') {
    attempts.push(...others);
  }
  return attempts;
}

/**
 * True when an error is worth retrying with a different model. Retryable:
 * model-not-found (404 or 400 with a model message), rate limits (429),
 * provider server errors (5xx), and network hiccups that look transient.
 * Never retried: auth failures (401/403) and client-side bad requests —
 * switching models cannot fix those.
 */
export function isRetryableModelError(err: unknown): boolean {
  const status = (err as { status?: unknown })?.status ?? (err as { statusCode?: unknown })?.statusCode;
  if (typeof status === 'number') {
    if (status === 404 || status === 429) return true;
    if (status >= 500 && status <= 599) return true;
    if (status !== 400) return false;
  }
  const message =
    `${(err as { message?: unknown })?.message ?? ''} ${(err as { error?: { message?: unknown } })?.error?.message ?? ''}`
      .toLowerCase();
  return /model.*(not found|not support|does not exist|unavailable|invalid)|rate limit|quota|too many requests|overloaded|temporarily unavailable|server error|5\d\d|econnreset|econnrefused|etimedout/i.test(
    message
  );
}

/**
 * Runs `fn(model)` for each model in the provider's fallback attempt list until
 * one succeeds. Works for both non-streaming calls and stream creation — when a
 * stream fails before producing content, the next model is tried transparently;
 * a mid-stream failure (after content was delivered) cannot be retried and
 * surfaces to the client. Throws the last error when every attempt fails.
 */
export async function withModelFallback<T>(
  provider: ProviderConfig,
  fn: (model: string) => Promise<T>
): Promise<T> {
  const attempts = buildModelAttemptList(provider);
  let lastError: unknown;
  for (const model of attempts) {
    try {
      return await fn(model);
    } catch (err) {
      lastError = err;
      if (!isRetryableModelError(err)) throw err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

// ============================================================================
// Multimodal ingestion & fallback routing (Video Prompt Studio Phase 1)
//
// Uploaded files (reference images, script PDFs, …) either ride through to a
// vision-capable model directly, or — when the selected model cannot see — are
// routed through a vision-capable fallback (the built-in Gemini default) that
// extracts a compact Story Bible summary which is injected into the main
// model's system prompt instead.
// ============================================================================

/**
 * Heuristic check for whether a model id can ingest images directly. Covers
 * the Gemini family, modern GPT/Claude multimodal tiers, and common open
 * vision models. Unknown ids are treated as non-vision so they route through
 * the extraction fallback instead of erroring mid-stream.
 */
export function modelSupportsVision(modelId: string): boolean {
  const id = modelId?.toLowerCase() ?? '';
  return /(gemini|gemma-3|gpt-4o|gpt-4\.1|gpt-4-turbo|gpt-4\.5|gpt-5|claude-3|claude-4|claude-sonnet-4|claude-haiku-3|qwen[^\s]*vl|qwen2[^\s]*-vl|llava|pixtral|llama-3\.2|llama-4|glm-4v|glm-4\.1v|mistral-vl|moondream|internvl|minicpm-v|phi-3\.5-vision|phi-4-multimodal|o3|o4-mini|o5|grok[^\s]*vision)/i.test(
    id
  );
}

export type MultimodalRoutingResult =
  | { mode: 'none' }
  | { mode: 'direct'; images: VideoChatFile[] }
  | { mode: 'extracted'; context: string; viaModel: string };

/**
 * Decides how attached files reach the shot-drafting model:
 *
 * - `none`     — no files attached.
 * - `direct`   — the selected model is vision-capable AND only image files
 *                were attached; the images are appended to the last user
 *                message as image parts.
 * - `extracted`— the selected model cannot see (or a non-image document was
 *                attached); a vision-capable fallback extracts a structured
 *                Story Bible summary that the caller injects into the system
 *                prompt.
 */
export async function routeMultimodalContext(
  prompt: string,
  files: VideoChatFile[],
  provider: ProviderConfig
): Promise<MultimodalRoutingResult> {
  if (!files || files.length === 0) return { mode: 'none' };

  const images = files.filter((f) => f.mediaType?.startsWith('image/'));
  const documents = files.filter((f) => !f.mediaType?.startsWith('image/'));
  const modelId = resolveModelId(provider);

  if (modelSupportsVision(modelId) && documents.length === 0) {
    return { mode: 'direct', images };
  }

  const context = await extractStoryBibleContext(prompt, files, modelId);
  return { mode: 'extracted', context, viaModel: FALLBACK_VISION_MODEL };
}

/** Vision-capable fallback for non-vision text models (stable multimodal tier). */
const FALLBACK_VISION_MODEL = GEMINI_DEFAULT_MODEL;

const EXTRACTION_SYSTEM = `You are the story bible analyst for a short-form video production. The director attached reference material (images, PDFs, and possibly other documents) plus their current direction. Extract everything that must stay consistent across every future shot — characters (name, age, build, face, hair, distinguishing marks), wardrobe, props, locations, set dressing, color/style direction, and any lore or narrative details. Write it as a compact structured summary that a shot-drafting model can reuse verbatim. If a file cannot be read (e.g. an unsupported document type), say so in one short line and move on.`;

function splitDataUrl(dataUrl: string): { mimeType: string; base64: string } | null {
  const comma = dataUrl.indexOf(',');
  const header = comma > -1 ? dataUrl.slice(0, comma) : '';
  const payload = comma > -1 ? dataUrl.slice(comma + 1) : '';
  const match = /^data:([^;,]+);base64$/i.exec(header);
  if (!match || !payload) return null;
  return { mimeType: match[1], base64: payload };
}

/**
 * Sends the attached files to the vision-capable fallback and returns a
 * structured Story Bible summary (the plan's extraction prompt verbatim).
 * DOCX files can't be ingested inline by Gemini, so they become a short note
 * in the summary instead of a hard failure.
 */
export async function extractStoryBibleContext(
  prompt: string,
  files: VideoChatFile[],
  selectedModel: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Attachments need a vision-capable fallback model, but the server GEMINI_API_KEY is missing.'
    );
  }

  const docxNames: string[] = [];
  const inlineParts: { inlineData: { mimeType: string; data: string } }[] = [];
  for (const file of files) {
    if (file.mediaType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      docxNames.push(file.filename || 'document.docx');
      continue;
    }
    const parsed = splitDataUrl(file.dataUrl);
    if (parsed) {
      inlineParts.push({ inlineData: { mimeType: parsed.mimeType, data: parsed.base64 } });
    }
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: FALLBACK_VISION_MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Extract all character descriptions, lore, and visual data from these files into a structured JSON summary.\n\nDIRECTOR'S CURRENT DIRECTION (for context): ${prompt || '(none supplied)'}`,
          },
          ...inlineParts,
        ],
      },
    ],
    config: {
      systemInstruction: EXTRACTION_SYSTEM,
      temperature: 0.3,
      maxOutputTokens: 2400,
    },
  });

  const summary = response.text?.trim();
  if (!summary) {
    throw new Error('The vision fallback returned no extracted context.');
  }

  const note =
    docxNames.length > 0
      ? `\n\nNOTE: ${docxNames.join(', ')} is a DOCX file that cannot be read directly — ask the director for a PDF or pasted text version.`
      : '';
  return `${summary}${note} (extracted from ${files.length} attachment${files.length === 1 ? '' : 's'}${selectedModel ? `; primary model ${selectedModel} is not vision-capable` : ''})`;
}
