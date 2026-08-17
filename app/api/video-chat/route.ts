import { NextRequest, NextResponse } from 'next/server';
import { streamText } from 'ai';
import type { ProviderConfig } from '@/types';
import type { VideoProject } from '@/types/video';
import { resolveVideoModel } from '@/lib/video-ai';
import { buildShotDraftingSystemPrompt } from '@/lib/video/system-prompt';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Phase 4 — multi-turn shot drafting chat stream.
 * POST body: { messages, project, providerConfig }
 *
 * The model is ALWAYS resolved through resolveVideoModel(providerConfig) —
 * the user's explicit Settings selection (or a per-stage override) — never a
 * hardcoded model identifier. Responses use the AI SDK UI message stream
 * protocol (DefaultChatTransport-compatible) via toUIMessageStreamResponse().
 */

interface IncomingMessagePart {
  type?: string;
  text?: string;
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

/** Flattens wire messages (UIMessage-shaped) into { role, content } turns. */
function toModelMessages(messages: IncomingMessage[]): { role: 'user' | 'assistant'; content: string }[] {
  return messages
    .map((msg): { role: 'user' | 'assistant'; content: string } | null => {
      if (!msg || typeof msg !== 'object') return null;
      const role: 'user' | 'assistant' = msg.role === 'assistant' ? 'assistant' : 'user';
      if (typeof msg.content === 'string' && msg.content.trim()) {
        return { role, content: msg.content };
      }
      const parts = Array.isArray(msg.parts) ? msg.parts : [];
      const text = parts
        .filter((part): part is IncomingMessagePart & { type: 'text'; text: string } => part?.type === 'text' && typeof part.text === 'string')
        .map((part) => part.text)
        .join('');
      return text.trim() ? { role, content: text } : null;
    })
    .filter((msg): msg is { role: 'user' | 'assistant'; content: string } => msg !== null);
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

    const result = streamText({
      model: resolveVideoModel(providerConfig),
      system: buildShotDraftingSystemPrompt(project),
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
