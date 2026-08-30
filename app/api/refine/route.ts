import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { DOMAIN_PRESETS } from '@/lib/domains';
import { handleOpenAIProviderRequest, formatOpenAIError } from '@/lib/openai-provider';
import { withModelFallback } from '@/lib/model-fallback';
import { GEMINI_DEFAULT_MODEL } from '@/lib/storage';
import { DomainPreset, RefineRequest } from '@/types';
import { boundedText, MAX_INPUT_CHARS, MAX_PROMPT_CHARS, validateProvider } from '@/lib/request-validation';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Refinement uses a minimal EDITOR system prompt instead of the generation
 * meta-prompt. The generation directive ("engineer a top-tier prompt from your
 * requirements") is what caused refinements to silently regenerate the whole
 * prompt; here the model is told it may only modify the explicit BASE PROMPT.
 */
function buildRefineSystemPrompt(session: RefineRequest['session'], domain: DomainPreset): string {
  const input = session.originalInput;
  return `You are PromptCrafter's editor. You revise an EXISTING prompt — you do not regenerate it from scratch.

TASK CONTEXT (why this prompt exists):
- Domain: ${domain.name}
- Original request: ${input.topic}
- Framework: ${input.framework.toUpperCase()}
- Output format: ${input.outputFormat || 'markdown'}
- Tone: ${input.tone}${input.targetAudience ? `\n- Target audience: ${input.targetAudience}` : ''}${input.additionalNotes ? `\n- Additional notes: ${input.additionalNotes}` : ''}${input.outputCharLimit ? `\n- Character limit: the FULL revised prompt must stay under ${input.outputCharLimit} characters — tighten wording if the edit would push it over.` : ''}${input.includeConstraints ? `\n- The prompt currently includes explicit negative constraints/guardrails — keep them unless the change request specifically asks to remove them.` : ''}${domain.domainGuidance ? `\n- Domain requirements & anti-laziness rules the prompt must keep satisfying:\n${domain.domainGuidance}` : ''}

EDITING RULES:
1. The user message contains a BASE PROMPT TO EDIT and a CHANGE REQUEST. The BASE PROMPT is the ONLY text you may modify; conversation history is context only.
2. Make the smallest edit that satisfies the change request. Preserve the prompt's role, structure, sections, tone, and wording unless the request explicitly requires changing them. Do NOT rewrite from scratch, do NOT add unrelated sections, and do NOT restyle the whole prompt.
3. NEVER introduce code placeholders (like \`// ...\`, \`// TODO\`, or \`[INSERT_CODE]\`) during revisions.
4. If the change request would break a domain requirement listed above, keep the requirement and only make the requested change where it does not conflict.
5. OUTPUT ONLY THE FULL REVISED PROMPT: no commentary, no diffs, no explanations, and no markdown code fences around the prompt.`;
}

export async function POST(req: NextRequest) {
  try {
    const body: RefineRequest = await req.json();
    const provider = validateProvider(body.provider);
    const { session, priorMessages, instruction: rawInstruction, basePrompt: rawBasePrompt } = body;
    const instruction = boundedText(rawInstruction, MAX_INPUT_CHARS, 'Refinement instruction');
    const basePrompt = boundedText(rawBasePrompt, MAX_PROMPT_CHARS, 'Prompt');

    if (!instruction || !instruction.trim()) {
      return NextResponse.json({ error: 'Refinement instruction is required.' }, { status: 400 });
    }

    if (!session || !session.originalInput) {
      return NextResponse.json({ error: 'Session metadata is required.' }, { status: 400 });
    }

    if (!basePrompt || !basePrompt.trim()) {
      return NextResponse.json({ error: 'The prompt to refine is required.' }, { status: 400 });
    }

    const domain = DOMAIN_PRESETS.find((d) => d.id === session.domainId) || DOMAIN_PRESETS[0];
    const systemInstruction = buildRefineSystemPrompt(session, domain);

    const userRefineMessage = `BASE PROMPT TO EDIT:\n"""\n${basePrompt}\n"""\n\nCHANGE REQUEST: "${instruction}"\n\nReturn ONLY the full revised prompt (no commentary, no diffs, no code fences).`;

    // Refinement should make targeted edits, not free-form rewrites.
    const refineTemperature = Math.min(provider?.temperature ?? 0.7, 0.4);

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

      // Map prior messages for Gemini chat history
      const mappedHistory = (priorMessages || []).map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      // Chat creation + first message are retried across fallback models.
      const responseStream = await withModelFallback<AsyncIterable<{ text?: string }>>(
        { ...provider, model: modelName },
        async (model) => {
          const chat = await ai.chats.create({
            model,
            history: mappedHistory,
            config: {
              systemInstruction,
              temperature: refineTemperature,
              topP: provider?.topP ?? 0.95,
            },
          });
          return chat.sendMessageStream({ message: userRefineMessage });
        }
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

    // Custom OpenAI-compatible provider
    const messages = [
      { role: 'system' as const, content: systemInstruction },
      ...(priorMessages || []).map((m) => ({
        role: (m.role === 'assistant' ? 'assistant' : m.role === 'system' ? 'system' : 'user') as 'assistant' | 'system' | 'user',
        content: m.content,
      })),
      { role: 'user' as const, content: userRefineMessage },
    ];

    return await handleOpenAIProviderRequest(provider, messages, { temperature: refineTemperature });
  } catch (error: any) {
    console.error('API /api/refine Error:', error);
    return formatOpenAIError(error);
  }
}
