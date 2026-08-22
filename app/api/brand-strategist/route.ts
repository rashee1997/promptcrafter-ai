import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { handleOpenAIProviderRequest, formatOpenAIError } from '@/lib/openai-provider';
import { GEMINI_DEFAULT_MODEL } from '@/lib/storage';
import { ProviderConfig } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export interface BrandStrategistRequest {
  provider: ProviderConfig;
  brandName: string;
  description: string;
}

export interface BrandStrategistResult {
  brandName: string;
  archetypeId?: string;
  logoType: string;
  logoStyle: string;
  palette: string;
  industry: string;
  concept: string;
  shapeLanguage: string;
  typography: string;
  lockup: string;
  hiddenMeaning: string;
  boldness: string;
  usage: string[];
  strategyRationale: string;
}

interface BrandStrategistJsonCandidate {
  brandName?: string;
  logoType?: string;
  logoStyle?: string;
  palette?: string;
  industry?: string;
  concept?: string;
  shapeLanguage?: string;
  typography?: string;
  lockup?: string;
  hiddenMeaning?: string;
  boldness?: string;
  usage?: string[];
  strategyRationale?: string;
}

interface GeminiGenerateContentConfig {
  systemInstruction: string;
  responseMimeType: 'application/json';
  temperature: number;
}

function extractJson(str: string): BrandStrategistJsonCandidate {
  const cleaned: string = str.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    return JSON.parse(cleaned) as BrandStrategistJsonCandidate;
  } catch {
    const match: RegExpMatchArray | null = str.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]) as BrandStrategistJsonCandidate;
    }
    throw new Error('Failed to parse AI output as JSON.');
  }
}

function generateFallbackBrandStrategy(brandName: string, description: string): BrandStrategistResult {
  return {
    brandName: brandName || 'Brand Identity',
    logoType: 'combination',
    logoStyle: 'monoline',
    palette: 'charcoal-mint',
    industry: 'tech-saas',
    concept: 'shield',
    shapeLanguage: 'symmetrical',
    typography: 'geometric-sans',
    lockup: 'horizontal',
    hiddenMeaning: 'negative-space',
    boldness: 'balanced',
    usage: ['app-icon', 'website', 'print'],
    strategyRationale: `High-contrast combination mark with geometric symmetry ensures clean reduction to 16px favicons and versatile reproduction on dark/light surfaces for "${brandName}".`,
  };
}

export async function POST(req: NextRequest) {
  let brand = '';
  let desc = '';

  try {
    const body: BrandStrategistRequest = await req.json();
    const { provider, brandName, description } = body;

    brand = brandName?.trim() || '';
    desc = description?.trim() || '';

    if (!brand && !desc) {
      return NextResponse.json(
        { error: 'Brand name or description is required for brand strategy analysis.' },
        { status: 400 }
      );
    }

    const systemInstruction = `You are PromptCrafter's Chief Brand Strategist & Identity Director.
Analyze the provided brand name and narrative, and synthesize an optimal, ownable brand identity architecture.

VALID OPTION POOLS:
- logoType: 'wordmark' | 'lettermark' | 'pictorial' | 'abstract' | 'emblem' | 'combination'
- logoStyle: 'minimalist-flat' | 'geometric-flat' | 'monoline' | 'swiss-style' | 'negative-space' | 'stamp-seal' | 'storybook-gothic' | 'pixel-sharp' | 'vintage-badge'
- palette: 'monochrome' | 'duotone' | 'pastel' | 'neon' | 'earthy' | 'luxury-gold' | 'navy-silver' | 'forest-teal' | 'ocean' | 'crimson-gold' | 'terracotta-cream' | 'sunset' | 'primaries' | 'lavender-graphite' | 'charcoal-mint'
- industry: 'tech-saas' | 'food-beverage' | 'health-wellness' | 'finance-legal' | 'education' | 'creative-studio' | 'retail-fashion' | 'fitness-sports' | 'real-estate' | 'hospitality-travel' | 'gaming-esports' | 'beauty-personal-care'
- concept: 'mountain' | 'leaf' | 'shield' | 'flame' | 'orbit' | 'wave' | 'tree' | 'bolt' | 'compass' | 'key' | 'drop' | 'sun' | 'crescent' | 'hexagon' | 'knot' | 'lantern' | 'arrow' | 'lens'
- shapeLanguage: 'circular' | 'angular' | 'squared' | 'organic' | 'symmetrical' | 'asymmetric'
- typography: 'geometric-sans' | 'humanist-sans' | 'modern-serif' | 'slab-serif' | 'script' | 'monospace' | 'display-custom' | 'no-text'
- lockup: 'horizontal' | 'stacked' | 'emblem' | 'mark-only'
- hiddenMeaning: 'none' | 'negative-space' | 'hidden-glyph' | 'double-meaning'
- boldness: 'safe' | 'balanced' | 'daring'
- usage: subset from ['app-icon', 'website', 'packaging', 'print', 'apparel']

Return ONLY a clean valid JSON object with NO markdown fence or extra text.`;

    const userMessage = `Brand Name: "${brand || 'Untitled Brand'}"
Brand Narrative / Goal: "${desc || 'Modern startup'}"

Synthesize the optimal brand architecture JSON matching this schema:
{
  "brandName": "${brand || 'Brand'}",
  "logoType": "combination",
  "logoStyle": "monoline",
  "palette": "charcoal-mint",
  "industry": "tech-saas",
  "concept": "shield",
  "shapeLanguage": "symmetrical",
  "typography": "geometric-sans",
  "lockup": "horizontal",
  "hiddenMeaning": "negative-space",
  "boldness": "balanced",
  "usage": ["app-icon", "website"],
  "strategyRationale": "2-3 sentences explaining why this geometry, color science, and mark structure make the brand ownable, scalable to a 16px favicon, and category-distinctive."
}`;

    let jsonString = '';

    if (provider && provider.apiKey && provider.apiKey !== 'BUILTIN' && !provider.useBuiltInGemini) {
      const openAIResponse = await handleOpenAIProviderRequest(
        provider,
        [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: userMessage },
        ],
        { temperature: 0.6 }
      );
      jsonString = await openAIResponse.text();
    } else {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return NextResponse.json(generateFallbackBrandStrategy(brand, desc));
      }

      const client = new GoogleGenAI({ apiKey });
      const activeModel = provider?.activeModel || provider?.model || GEMINI_DEFAULT_MODEL;

      const models: string[] = [
        ...new Set([activeModel, GEMINI_DEFAULT_MODEL, 'gemini-3.6-flash']),
      ];
      let lastError: unknown;

      for (const modelName of models) {
        try {
          const res = await client.models.generateContent({
            model: modelName,
            contents: userMessage,
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              temperature: 0.6,
            },
          });
          jsonString = res.text || '';
          if (jsonString) break;
        } catch (error) {
          lastError = error;
        }
      }

      if (!jsonString && lastError) throw lastError;
    }

    const parsed = extractJson(jsonString) as BrandStrategistResult;
    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('Brand Strategist fallback activated:', error);
    return NextResponse.json(generateFallbackBrandStrategy(brand, desc));
  }
}
