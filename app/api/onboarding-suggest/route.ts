import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import type { ProviderConfig } from '@/types';
import type { OnboardingSuggestion } from '@/components/video-prompt/chat-onboarding';
import { STRUCTURE_FRAMEWORKS } from '@/lib/video/bootstrap/structure-frameworks';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SYSTEM_PROMPT = `You are a film and video production consultant. The user will give you a one-line idea for a video. You must return a JSON object with the following shape:

{
  "logline": "A polished one-sentence logline for the idea (max 25 words)",
  "genres": ["Genre 1", "Genre 2"],
  "tones": ["Tone 1", "Tone 2", "Tone 3"],
  "frameworkId": "one of: save-the-cat, three-act, heros-journey, eight-sequence",
  "frameworkLabel": "Human-readable name of the framework",
  "direction": "one of: animated, live-action, motion-graphics",
  "cameraVocabulary": "one of: cinematic, animated, graphic",
  "styleHint": "A 1-2 sentence visual style direction for the production"
}

RULES:
1. Return ONLY a valid JSON object. No markdown fences, no commentary.
2. Pick exactly 2 genres and 2-3 tones that fit the idea.
3. Choose the framework that best suits the story shape:
   - three-act: most stories, clear arc
   - save-the-cat: emotional transformation stories
   - heros-journey: adventure/discovery stories
   - eight-sequence: ensemble or complex plots
4. Choose direction based on what the idea implies:
   - animated: cartoons, kids content, abstract, fantasy worlds
   - live-action: realistic, human performances, documentary feel
   - motion-graphics: explainer, data-driven, typography-led
5. cameraVocabulary must match direction: animated→animated, live-action→cinematic, motion-graphics→graphic
6. styleHint should be concrete and actionable for a video director.`;

function extractJson(text: string): Record<string, unknown> | null {
  const trimmed = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const first = trimmed.indexOf('{');
  const last = trimmed.lastIndexOf('}');
  if (first === -1 || last === -1 || last <= first) return null;
  try {
    return JSON.parse(trimmed.slice(first, last + 1));
  } catch {
    return null;
  }
}

function validateSuggestion(data: Record<string, unknown>): OnboardingSuggestion | null {
  if (typeof data.logline !== 'string' || !data.logline.trim()) return null;
  if (!Array.isArray(data.genres) || data.genres.length < 1) return null;
  if (!Array.isArray(data.tones) || data.tones.length < 1) return null;

  const frameworkId = typeof data.frameworkId === 'string'
    ? data.frameworkId
    : 'three-act';
  const framework = STRUCTURE_FRAMEWORKS.find((f) => f.id === frameworkId);
  const frameworkLabel = typeof data.frameworkLabel === 'string'
    ? data.frameworkLabel
    : framework?.label ?? 'Three-Act Structure';

  const direction = ['animated', 'live-action', 'motion-graphics'].includes(data.direction as string)
    ? (data.direction as string)
    : 'live-action';

  const cameraVocab = ['cinematic', 'animated', 'graphic'].includes(data.cameraVocabulary as string)
    ? (data.cameraVocabulary as 'cinematic' | 'animated' | 'graphic')
    : 'cinematic';

  // Infer platform from direction
  const platform = direction === 'animated' ? 'seedance'
    : direction === 'motion-graphics' ? 'seedance'
    : 'veo';

  return {
    logline: data.logline.trim(),
    genres: data.genres.map(String),
    tones: data.tones.map(String),
    frameworkId: framework?.id ?? 'three-act',
    frameworkLabel,
    direction,
    platform,
    cameraVocabulary: cameraVocab,
    styleHint: typeof data.styleHint === 'string' ? data.styleHint : '',
  };
}

function isGeminiProvider(provider: ProviderConfig): boolean {
  return (
    provider?.useBuiltInGemini ||
    !provider?.baseUrl ||
    provider?.baseUrl.includes('googleapis.com')
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idea, provider } = body as { idea: string; provider: ProviderConfig };

    if (!idea || idea.trim().length < 8) {
      return NextResponse.json(
        { error: 'Please describe your idea in at least a few words.' },
        { status: 400 }
      );
    }

    if (!provider) {
      return NextResponse.json(
        { error: 'No AI provider configured. Add one in Settings first.' },
        { status: 400 }
      );
    }

    const userMessage = `Video idea: "${idea.trim()}"\n\nAnalyze this idea and return the JSON suggestion object.`;

    let jsonString = '';

    if (isGeminiProvider(provider)) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Fallback: generate a sensible local suggestion
        return NextResponse.json(buildFallbackSuggestion(idea.trim()));
      }

      const client = new GoogleGenAI({ apiKey });
      const modelName = provider.activeModel || provider.model || 'gemini-2.5-flash';

      const response = await client.models.generateContent({
        model: modelName,
        contents: userMessage,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 0.7,
          topP: 0.95,
        },
      });

      jsonString = response.text || '';
    } else {
      // OpenAI-compatible path
      const baseUrl = provider.baseUrl || 'https://api.openai.com/v1';
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${provider.apiKey}`,
        },
        body: JSON.stringify({
          model: provider.activeModel || provider.model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userMessage },
          ],
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        return NextResponse.json(
          buildFallbackSuggestion(idea.trim())
        );
      }

      const data = await res.json();
      jsonString = data.choices?.[0]?.message?.content || '';
    }

    const parsed = extractJson(jsonString);
    if (!parsed) {
      return NextResponse.json(buildFallbackSuggestion(idea.trim()));
    }

    const suggestion = validateSuggestion(parsed);
    if (!suggestion) {
      return NextResponse.json(buildFallbackSuggestion(idea.trim()));
    }

    return NextResponse.json(suggestion);
  } catch (error) {
    console.error('POST /api/onboarding-suggest Error:', error);
    const body = await req.json().catch(() => ({ idea: '' }));
    return NextResponse.json(buildFallbackSuggestion(body.idea || ''));
  }
}

/** Build a sensible local suggestion without hitting the AI. */
function buildFallbackSuggestion(idea: string): OnboardingSuggestion {
  const isAnimation =
    /\b(cartoon|animat|drawn|2d|3d|pixar|dreamworks|kids|children|fantasy|creature|monster|robot|alien)\b/i.test(idea);
  const isMotionGraphics =
    /\b(explain|data|chart|graph|infographic|kinetic|type|motion graphic|statistic)\b/i.test(idea);

  const direction = isMotionGraphics ? 'motion-graphics' : isAnimation ? 'animated' : 'live-action';
  const cameraVocab = isMotionGraphics ? 'graphic' : isAnimation ? 'animated' : 'cinematic';
  const platform = isMotionGraphics || isAnimation ? 'seedance' : 'veo';

  return {
    logline: idea.slice(0, 120),
    genres: isAnimation ? ['Animation', 'Short Film'] : isMotionGraphics ? ['Motion Graphics', 'Explainer'] : ['Drama', 'Short Film'],
    tones: ['Cinematic', 'Atmospheric'],
    frameworkId: 'three-act',
    frameworkLabel: 'Three-Act Structure',
    direction,
    platform,
    cameraVocabulary: cameraVocab,
    styleHint: isAnimation
      ? 'Stylised animation with expressive character design and a cohesive colour palette.'
      : isMotionGraphics
        ? 'Clean graphic style with bold typography and smooth geometric transitions.'
        : 'Cinematic live-action with controlled lighting and deliberate camera movement.',
  };
}
