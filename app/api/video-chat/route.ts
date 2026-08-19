import { NextRequest, NextResponse } from 'next/server';
import { streamText } from 'ai';
import type { ProviderConfig } from '@/types';
import type { VideoChatFile, VideoProject } from '@/types/video';
import { resolveVideoModel } from '@/lib/video-ai';
import { buildShotDraftingSystemPrompt } from '@/lib/video/system-prompt';
import { routeMultimodalContext } from '@/lib/model-fallback';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Phase 4 — multi-turn shot drafting chat stream.
 * POST body: { messages, project, providerConfig }
 *
 * Phase 1 — multimodal ingestion & fallback routing. When the director
 * attaches files (reference images, script PDFs) to the latest user message,
 * routeMultimodalContext() decides how they reach the model:
 *   - vision-capable model + images only  → the images ride as image parts on
 *     the last user message (direct pass-through);
 *   - non-vision model or documents      → a vision-capable fallback extracts
 *     a structured Story Bible summary that is injected into the system
 *     prompt instead.
 *
 * The model is ALWAYS resolved through resolveVideoModel(providerConfig) —
 * the user's explicit Settings selection (or a per-stage override) — never a
 * hardcoded model identifier. Responses use the AI SDK UI message stream
 * protocol (DefaultChatTransport-compatible) via toUIMessageStreamResponse().
 */

interface IncomingMessagePart {
  type?: string;
  text?: string;
  filename?: string;
  mediaType?: string;
  url?: string;
}

interface IncomingMessage {
  role?: string;
  content?: unknown;
  parts?: IncomingMessagePart[];
}

interface VideoChatRequestBody {
  messages?: IncomingMessage[];
  project?: VideoProject;
  providerConfig?: ProviderConfig;
}

type ModelMessage =
  | {
      role: 'user';
      content: string | Array<{ type: 'text'; text: string } | { type: 'image'; image: string }>;
    }
  | { role: 'assistant'; content: string };

/** Flattens wire messages (UIMessage-shaped) into { role, content } turns. */
function toModelMessages(messages: IncomingMessage[]): ModelMessage[] {
  return messages
    .map((msg): ModelMessage | null => {
      if (!msg || typeof msg !== 'object') return null;
      const role: 'user' | 'assistant' = msg.role === 'assistant' ? 'assistant' : 'user';
      const content = (() => {
        if (typeof msg.content === 'string') return msg.content;
        const parts = Array.isArray(msg.parts) ? msg.parts : [];
        return parts
          .filter((part): part is IncomingMessagePart & { type: 'text'; text: string } => part?.type === 'text' && typeof part.text === 'string')
          .map((part) => part.text)
          .join('');
      })();
      return content.trim()
        ? role === 'assistant'
          ? { role: 'assistant', content }
          : { role: 'user', content }
        : null;
    })
    .filter((msg): msg is ModelMessage => msg !== null);
}

/**
 * Collects the file parts (data URLs) attached to the MOST RECENT user
 * message — the current turn. Older turns' attachments were already consumed
 * when they were sent, so they never re-trigger extraction.
 */
function collectLastUserFiles(messages: IncomingMessage[]): VideoChatFile[] {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (!msg || msg.role !== 'user') continue;
    const parts = Array.isArray(msg.parts) ? msg.parts : [];
    return parts
      .filter(
        (part): part is IncomingMessagePart & { type: 'file'; url: string } =>
          part?.type === 'file' && typeof part.url === 'string' && part.url.startsWith('data:')
      )
      .map((part) => ({
        filename: part.filename ?? 'attachment',
        mediaType: part.mediaType ?? 'application/octet-stream',
        dataUrl: part.url,
      }));
  }
  return [];
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as VideoChatRequestBody;
    const { messages, project, providerConfig } = body;

    if (!project?.id || !project.name) {
      return NextResponse.json({ error: 'A valid project is required.' }, { status: 400 });
    }
    if (!providerConfig?.id) {
      return NextResponse.json({ error: 'A provider is required.' }, { status: 400 });
    }

    const modelMessages = toModelMessages(messages ?? []);
    if (modelMessages.length === 0) {
      return NextResponse.json({ error: 'A message is required.' }, { status: 400 });
    }

    // ── Phase 1 multimodal routing ──
    const files = collectLastUserFiles(messages ?? []);
    const lastUserText =
      typeof modelMessages[modelMessages.length - 1].content === 'string'
        ? (modelMessages[modelMessages.length - 1].content as string)
        : '';
    const routing = await routeMultimodalContext(lastUserText, files, providerConfig);

    let system = buildShotDraftingSystemPrompt(project);

    if (routing.mode === 'direct') {
      system += `\n\nThe director attached ${routing.images.length} reference image${routing.images.length === 1 ? '' : 's'} to this message — study them and honor any character, wardrobe, location, or style details they show.`;
      const last = modelMessages[modelMessages.length - 1];
      if (last && last.role === 'user') {
        const text =
          typeof last.content === 'string'
            ? last.content
            : last.content
                .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
                .map((p) => p.text)
                .join('');
        last.content = [
          { type: 'text' as const, text },
          ...routing.images.map((img) => ({ type: 'image' as const, image: img.dataUrl })),
        ];
      }
    } else if (routing.mode === 'extracted') {
      system += `\n\nREFERENCE MATERIAL EXTRACTED FROM UPLOADED FILES (extracted via ${routing.viaModel}):\n${routing.context}`;
    }

    const result = streamText({
      model: resolveVideoModel(providerConfig),
      system,
      messages: modelMessages,
      temperature: providerConfig.temperature ?? 0.7,
      maxOutputTokens: providerConfig.maxTokens ?? 2048,
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error('API /api/video-chat Error:', error);
    const message = error?.message || 'Shot drafting failed. Please try again.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
