/**
 * POST /api/product-shoot
 *
 * Streams a full creative shot package for a product video. The reference
 * image is attached inline so the model can lock the product's appearance.
 * Follows the same Gemini / OpenAI-compatible routing as /api/image-prompt.
 */

import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import {
  buildProductShootSystemPrompt,
  buildProductShootUserMessage,
} from '@/lib/product-shoot/system-prompt';
import { getRecipeById, SURPRISE_RECIPE_ID } from '@/lib/product-shoot/scene-recipes';
import { handleOpenAIProviderRequest, formatOpenAIError } from '@/lib/openai-provider';
import { withModelFallback } from '@/lib/model-fallback';
import { GEMINI_DEFAULT_MODEL } from '@/lib/storage';
import type { ProductShootGenerationRequest } from '@/lib/product-shoot/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const STREAM_HEADERS = {
  'Content-Type': 'text/plain; charset=utf-8',
  'Cache-Control': 'no-cache, no-transform',
  'X-Accel-Buffering': 'no',
  'Connection': 'keep-alive',
};

/**
 * Streams a product video shot package: main prompt, negative prompt,
 * aspect-ratio variants, and 2–3 alternative creative concepts.
 */
export async function POST(req: NextRequest) {
  try {
    const body: ProductShootGenerationRequest = await req.json();
    const { provider, brief, recipeId, creativeControls, imageParts } = body;

    if (!brief?.name?.trim()) {
      return NextResponse.json(
        { error: 'Product name is required.' },
        { status: 400 }
      );
    }

    if (!imageParts || imageParts.length === 0) {
      return NextResponse.json(
        { error: 'At least one product reference image is required.' },
        { status: 400 }
      );
    }

    // Resolve recipe
    const isSurprise = recipeId === SURPRISE_RECIPE_ID;
    const recipe = isSurprise ? null : (getRecipeById(recipeId) ?? null);
    const recipeLabel = isSurprise ? 'Surprise Me' : (recipe?.label ?? recipeId);

    // Build prompts
    const systemInstruction = buildProductShootSystemPrompt();
    const userMessage = buildProductShootUserMessage(brief, recipe, recipeLabel, creativeControls);

    // Build multimodal image parts for Gemini
    const geminiImageParts = imageParts.map((img) => ({
      inlineData: {
        mimeType: img.mimeType,
        data: img.data,
      },
    }));

    const isGemini =
      provider?.useBuiltInGemini ||
      !provider?.baseUrl ||
      provider?.baseUrl.includes('googleapis.com');

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

      // Attach reference images inline
      const multimodalContents = [
        {
          role: 'user' as const,
          parts: [{ text: userMessage }, ...geminiImageParts],
        },
      ];

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

    // For OpenAI-compatible providers without native image support,
    // build a text-only user message with an image description prefix.
    const textOnlyUserMessage =
      '[Note: The user uploaded product reference images that cannot be rendered by this model. ' +
      'The images should be treated as the canonical product reference — describe the product ' +
      'exactly as shown in the attached images: its shape, colour, logo, label, packaging, ' +
      'and proportions must remain exactly as depicted.]\n\n' +
      userMessage;

    return await handleOpenAIProviderRequest(provider, [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: textOnlyUserMessage },
    ]);
  } catch (error: any) {
    console.error('API /api/product-shoot Error:', error);
    return formatOpenAIError(error);
  }
}
