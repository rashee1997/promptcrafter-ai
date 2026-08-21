import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { buildImagePromptSystemPrompt, buildImagePromptUserMessage } from '@/lib/image-prompts';
import { handleOpenAIProviderRequest, formatOpenAIError } from '@/lib/openai-provider';
import { withModelFallback } from '@/lib/model-fallback';
import { GEMINI_DEFAULT_MODEL } from '@/lib/storage';
import { ImagePromptRedoRequest } from '@/types';

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

    // Build the full system prompt for creative-director context
    const isLogo = input.mode === 'logo';
    const systemInstruction = isLogo
      ? (await import('@/lib/logo-prompts')).buildLogoPromptSystemPrompt(input)
      : buildImagePromptSystemPrompt(input);

    // Assemble existing sections for context so the model keeps the brief coherent
    const sectionContext = Object.entries(existingSections)
      .map(([key, text]) => `## ${key.toUpperCase()}\n${text}`)
      .join('\n\n');

    const revisionClause = revisionNote
      ? `\n\nREVISION FOCUS: "${revisionNote}" — apply this change specifically to the ${targetPlatform.toUpperCase()} section.`
      : '';

    const userMessage = `You are rewriting a SINGLE section of an image prompt set. Below is the full brief context and the existing sections for reference. Your ONLY job is to produce a NEW, REPLACEMENT prompt for the ${targetPlatform.toUpperCase()} section.\n\nRULES:\n1. Output ONLY the replacement prompt text — no markdown headers, no section labels, no commentary, no code fences.\n2. Preserve the subject, style, lighting, camera, composition, mood, and color grade from the brief.\n3. Match the quality and density of the other platform sections.\n4. Follow the platform-specific dialect rules from the system prompt.\n5. The replacement must be a complete, copy-paste-ready block — not a partial edit.${revisionClause}\n\nEXISTING SECTIONS (for context):\n${sectionContext}\n\nNow write ONLY the replacement ${targetPlatform.toUpperCase()} prompt. Start directly with the prompt text.`;

    // Build multimodal content if reference images are attached (Fix D3)
    const hasRefImages = !!input.referenceImages && input.referenceImages.length > 0;
    const refImageParts = hasRefImages
      ? input.referenceImages!.map((img) => {
          const match = img.dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
          if (!match) return null;
          return {
            inlineData: {
              mimeType: match[1],
              data: match[2],
            },
          };
        }).filter((p): p is { inlineData: { mimeType: string; data: string } } => p !== null)
      : [];

    const isGemini =
      provider?.useBuiltInGemini || !provider?.baseUrl || provider?.baseUrl.includes('googleapis.com');

    if (isGemini) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: 'Server environment variable GEMINI_API_KEY is missing.' },
          { status: 500 }
        );
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: { 'User-Agent': 'promptcrafter-ai/1.1.0' },
        },
      });

      const modelName = provider?.model || GEMINI_DEFAULT_MODEL;

      // Pass reference image parts so the model does not hallucinate visual traits on redo
      const multimodalContents = refImageParts.length > 0
        ? [{ role: 'user' as const, parts: [{ text: userMessage }, ...refImageParts] }]
        : userMessage;

      const responseStream = await withModelFallback(
        { ...provider, model: modelName },
        (model) =>
          ai.models.generateContentStream({
            model,
            contents: multimodalContents,
            config: {
              systemInstruction,
              temperature: provider?.temperature ?? 0.7,
              topP: provider?.topP ?? 0.95,
            },
          })
      );

      const encoder = new TextEncoder();
      const customStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of responseStream) {
              const text = chunk.text || '';
              if (text) {
                controller.enqueue(encoder.encode(text));
              }
            }
            controller.close();
          } catch (streamErr) {
            controller.error(streamErr);
          }
        },
      });

      return new Response(customStream, { headers: STREAM_HEADERS });
    }

    // Custom OpenAI-compatible provider with multimodal vision support
    const openAIUserContent: any =
      hasRefImages && input.referenceImages
        ? [
            { type: 'text', text: userMessage },
            ...input.referenceImages.map((img) => ({
              type: 'image_url',
              image_url: { url: img.dataUrl, detail: 'auto' },
            })),
          ]
        : userMessage;

    return await handleOpenAIProviderRequest(provider, [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: openAIUserContent },
    ]);
  } catch (error: any) {
    console.error('API /api/image-prompt-redo Error:', error);
    return formatOpenAIError(error);
  }
}
