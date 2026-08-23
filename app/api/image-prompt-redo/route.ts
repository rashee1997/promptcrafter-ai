import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { buildImagePromptSystemPrompt } from '@/lib/image-prompts';
import { buildLogoPromptSystemPrompt } from '@/lib/logo-prompts';
import { handleOpenAIProviderRequest, formatOpenAIError } from '@/lib/openai-provider';
import { withModelFallback } from '@/lib/model-fallback';
import { GEMINI_DEFAULT_MODEL } from '@/lib/storage';
import { ImagePromptRedoRequest, ProviderConfig } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const STREAM_HEADERS = {
  'Content-Type': 'text/plain; charset=utf-8',
  'Cache-Control': 'no-cache, no-transform',
  'X-Accel-Buffering': 'no',
  'Connection': 'keep-alive',
};

/**
 * Regenerates a single platform section from an existing brief. The model
 * receives the full system prompt for context, the existing sections so it
 * understands what the other platforms look like, and a focused instruction
 * to rewrite ONLY the target platform — preserving consistency across the set.
 */
export async function POST(req: NextRequest) {
  try {
    const body: ImagePromptRedoRequest = await req.json();
    const { provider, input, targetPlatform, existingSections, revisionNote } = body;

    if (!input || !input.subject?.trim()) {
      return NextResponse.json({ error: 'Subject is required.' }, { status: 400 });
    }
    if (!targetPlatform) {
      return NextResponse.json({ error: 'Target platform is required.' }, { status: 400 });
    }

    const systemInstruction = await buildRedoSystemInstruction(input);
    const userMessage = buildRedoUserMessage(targetPlatform, existingSections, revisionNote);
    const refImages = input.referenceImages ?? [];
    const hasRefImages = refImages.length > 0;

    if (isGeminiProvider(provider)) {
      return await streamGeminiRedo(provider, systemInstruction, userMessage, refImages, hasRefImages);
    }

    return streamOpenAIRedo(provider, systemInstruction, userMessage, refImages, hasRefImages);
  } catch (error: any) {
    console.error('API /api/image-prompt-redo Error:', error);
    return formatOpenAIError(error);
  }
}

async function buildRedoSystemInstruction(input: ImagePromptRedoRequest['input']): Promise<string> {
  if (input.mode === 'logo') {
    return buildLogoPromptSystemPrompt(input);
  }
  return buildImagePromptSystemPrompt(input);
}

function buildRedoUserMessage(
  targetPlatform: string,
  existingSections: Record<string, string>,
  revisionNote?: string,
): string {
  const sectionContext = Object.entries(existingSections)
    .map(([key, text]) => `## ${key.toUpperCase()}\n${text}`)
    .join('\n\n');

  const revisionClause = revisionNote
    ? `\n\nREVISION FOCUS: "${revisionNote}" — apply this change specifically to the ${targetPlatform.toUpperCase()} section.`
    : '';

  return `You are rewriting a SINGLE section of an image prompt set. Below is the full brief context and the existing sections for reference. Your ONLY job is to produce a NEW, REPLACEMENT prompt for the ${targetPlatform.toUpperCase()} section.\n\nRULES:\n1. Output ONLY the replacement prompt text — no markdown headers, no section labels, no commentary, no code fences.\n2. Preserve the subject, style, lighting, camera, composition, mood, and color grade from the brief.\n3. Match the quality and density of the other platform sections.\n4. Follow the platform-specific dialect rules from the system prompt.\n5. The replacement must be a complete, copy-paste-ready block — not a partial edit.${revisionClause}\n\nEXISTING SECTIONS (for context):\n${sectionContext}\n\nNow write ONLY the replacement ${targetPlatform.toUpperCase()} prompt. Start directly with the prompt text.`;
}

function isGeminiProvider(provider: ProviderConfig): boolean {
  return (
    provider?.useBuiltInGemini ||
    !provider?.baseUrl ||
    provider?.baseUrl.includes('googleapis.com')
  );
}

function toGeminiImageParts(
  images: NonNullable<ImagePromptRedoRequest['input']['referenceImages']>,
): Array<{ inlineData: { mimeType: string; data: string } }> {
  return images
    .map((img) => {
      const match = img.dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
      if (!match) return null;
      return { inlineData: { mimeType: match[1], data: match[2] } };
    })
    .filter((p): p is { inlineData: { mimeType: string; data: string } } => p !== null);
}

function toGeminiContents(
  userMessage: string,
  parts: Array<{ inlineData: { mimeType: string; data: string } }>,
): string | Array<{ role: 'user'; parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> }> {
  if (parts.length === 0) return userMessage;
  return [{ role: 'user' as const, parts: [{ text: userMessage }, ...parts] }];
}

async function streamGeminiRedo(
  provider: ProviderConfig,
  systemInstruction: string,
  userMessage: string,
  refImages: NonNullable<ImagePromptRedoRequest['input']['referenceImages']>,
  hasRefImages: boolean,
): Promise<Response> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Server environment variable GEMINI_API_KEY is missing.' },
      { status: 500 },
    );
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'promptcrafter-ai/1.1.0' } },
  });

  const modelName = provider?.model || GEMINI_DEFAULT_MODEL;
  const refImageParts = hasRefImages ? toGeminiImageParts(refImages) : [];
  const contents = toGeminiContents(userMessage, refImageParts);

  const responseStream = await withModelFallback(
    { ...provider, model: modelName },
    (model) =>
      ai.models.generateContentStream({
        model,
        contents,
        config: {
          systemInstruction,
          temperature: provider?.temperature ?? 0.7,
          topP: provider?.topP ?? 0.95,
        },
      }),
  );

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of responseStream) {
          const text = chunk.text || '';
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      } catch (streamErr) {
        controller.error(streamErr);
      }
    },
  });

  return new Response(stream, { headers: STREAM_HEADERS });
}

function streamOpenAIRedo(
  provider: ProviderConfig,
  systemInstruction: string,
  userMessage: string,
  refImages: NonNullable<ImagePromptRedoRequest['input']['referenceImages']>,
  hasRefImages: boolean,
): Promise<Response> {
  const openAIUserContent: any = hasRefImages
    ? [
        { type: 'text', text: userMessage },
        ...refImages.map((img) => ({
          type: 'image_url',
          image_url: { url: img.dataUrl, detail: 'auto' },
        })),
      ]
    : userMessage;

  return handleOpenAIProviderRequest(provider, [
    { role: 'system', content: systemInstruction },
    { role: 'user', content: openAIUserContent },
  ]);
}
