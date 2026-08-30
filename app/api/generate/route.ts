import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { buildMetaSystemPrompt, buildUserPromptMessage, DOMAIN_PRESETS } from '@/lib/domains';
import { handleOpenAIProviderRequest, formatOpenAIError } from '@/lib/openai-provider';
import { withModelFallback } from '@/lib/model-fallback';
import { GEMINI_DEFAULT_MODEL } from '@/lib/storage';
import { AttachmentPayload, GenerationRequest } from '@/types';
import { boundedText, MAX_ATTACHMENTS, MAX_INPUT_CHARS, MAX_TOTAL_ATTACHMENT_BYTES, validateDataUrl, validateProvider } from '@/lib/request-validation';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * When the active provider can't read PDFs or images directly, extract
 * their content via the built-in Gemini provider and return as text.
 */
async function extractAttachmentsViaGemini(
  attachments: AttachmentPayload,
): Promise<{ extractedPdfText?: string; extractedImageText?: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return {};

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'promptcrafter-ai/1.1.0' } },
  });

  const results: { extractedPdfText?: string; extractedImageText?: string } = {};

  // Extract PDFs
  if (attachments.pdfParts && attachments.pdfParts.length > 0) {
    try {
      const pdfContents = attachments.pdfParts.map((part) => ({
        inlineData: { mimeType: part.mimeType, data: part.data },
      }));

      const response = await ai.models.generateContent({
        model: GEMINI_DEFAULT_MODEL,
        contents: [
          {
            role: 'user',
            parts: [
              ...pdfContents,
              { text: 'Extract and transcribe the full content of this/these PDF document(s). Preserve the structure: headings, lists, and key sections. Return ONLY the extracted text, no commentary.' },
            ],
          },
        ],
      });

      const text = response.text || '';
      if (text.trim()) {
        const names = attachments.pdfParts.map((_, i) => `Document ${i + 1}`).join(', ');
        results.extractedPdfText = `\nATTACHED FILE (auto-extracted since the active provider doesn't read PDFs directly):\n${names}:\n${text}`;
      }
    } catch (err) {
      console.error('PDF extraction via Gemini failed:', err);
    }
  }

  // Extract images
  if (attachments.imageParts && attachments.imageParts.length > 0) {
    try {
      const imageContents = attachments.imageParts.map((part) => ({
        inlineData: { mimeType: part.mimeType, data: part.data },
      }));

      const purposeNotes = attachments.imageParts
        .map((p, i) => `Image ${i + 1} (purpose: ${p.purpose})`)
        .join('; ');

      const response = await ai.models.generateContent({
        model: GEMINI_DEFAULT_MODEL,
        contents: [
          {
            role: 'user',
            parts: [
              ...imageContents,
              { text: `Describe these images in detail for use as context in prompt engineering. For each image, note its purpose: ${purposeNotes}. Describe what you see: layout, text, UI elements, structure, colors, and any readable content. Be thorough but concise.` },
            ],
          },
        ],
      });

      const text = response.text || '';
      if (text.trim()) {
        results.extractedImageText = `\nATTACHED FILE (auto-extracted since the active provider doesn't read images directly):\n${text}`;
      }
    } catch (err) {
      console.error('Image extraction via Gemini failed:', err);
    }
  }

  return results;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerationRequest;
    const provider = validateProvider(body.provider);
    const input = body.input;
    const attachments = body.attachments;

    if (!input || !input.topic) {
      return NextResponse.json({ error: 'Topic is required.' }, { status: 400 });
    }

    const topic = boundedText(input.topic, MAX_INPUT_CHARS, 'Topic');
    if (attachments) {
      const allParts = [...(attachments.pdfParts || []), ...(attachments.imageParts || [])];
      if (allParts.length > MAX_ATTACHMENTS) throw new Error(`No more than ${MAX_ATTACHMENTS} attachments are allowed.`);
      let totalBytes = 0;
      for (const part of allParts) {
        const data = validateDataUrl(`data:${part.mimeType};base64,${part.data}`);
        totalBytes += Math.floor(data.split(',')[1].length * 0.75);
      }
      if (totalBytes > MAX_TOTAL_ATTACHMENT_BYTES) throw new Error('Total attachment size is too large.');
    }
    const domain = DOMAIN_PRESETS.find((d) => d.id === input.domainId) || DOMAIN_PRESETS[0];
    const systemInstruction = buildMetaSystemPrompt(input, domain);

    // Determine if we need auto-extraction for non-multimodal providers
    const hasPdfs = (attachments?.pdfParts?.length ?? 0) > 0;
    const hasImages = (attachments?.imageParts?.length ?? 0) > 0;
    const needsExtraction = (hasPdfs || hasImages) && !attachments?.autoRouted;

    let extractedPdfText = attachments?.extractedPdfText;
    let extractedImageText = attachments?.extractedImageText;

    // Auto-route: if the provider can't read files, extract via Gemini
    if (needsExtraction && !isGeminiProvider(provider)) {
      const extracted = await extractAttachmentsViaGemini(attachments!);
      extractedPdfText = extracted.extractedPdfText || extractedPdfText;
      extractedImageText = extracted.extractedImageText || extractedImageText;
    }

    // Build user message with project context and extracted attachment text
    const extractedText = [extractedPdfText, extractedImageText].filter(Boolean).join('\n');
    const userMessage = buildUserPromptMessage(
      { ...input, topic },
      domain,
      attachments?.projectContextText,
      extractedText || undefined,
    );

    // Case 1: Built-in Gemini Provider or Gemini specified
    const isGemini = isGeminiProvider(provider);

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
          headers: {
            'User-Agent': 'promptcrafter-ai/1.1.0',
          },
        },
      });

      const modelName = provider?.model || GEMINI_DEFAULT_MODEL;

      // Build contents with inline parts for PDFs/images when using Gemini directly
      let contents: string | { role: string; parts: any[] } = userMessage;

      if (hasPdfs || hasImages) {
        const parts: any[] = [{ text: userMessage }];
        if (attachments?.pdfParts) {
          for (const pdf of attachments.pdfParts) {
            parts.push({ inlineData: { mimeType: pdf.mimeType, data: pdf.data } });
          }
        }
        if (attachments?.imageParts) {
          for (const img of attachments.imageParts) {
            parts.push({ inlineData: { mimeType: img.mimeType, data: img.data } });
          }
        }
        contents = { role: 'user', parts };
      }

      const responseStream = await withModelFallback<AsyncIterable<{ text?: string }>>(
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

      return new Response(customStream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          'X-Accel-Buffering': 'no',
          'Connection': 'keep-alive',
        },
      });
    }

    // Case 2: Custom OpenAI-compatible provider (OpenAI, Groq, OpenRouter, Ollama, etc.)
    return await handleOpenAIProviderRequest(provider, [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: userMessage },
    ]);
  } catch (error: any) {
    console.error('API /api/generate Error:', error);
    return formatOpenAIError(error);
  }
}

/** Check if the provider is the built-in Gemini or targets googleapis.com. */
function isGeminiProvider(provider?: GenerationRequest['provider']): boolean {
  return !!provider?.useBuiltInGemini || !provider?.baseUrl || provider.baseUrl.includes('googleapis.com');
}
