import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { handleOpenAIProviderRequest, formatOpenAIError } from '@/lib/openai-provider';
import { withModelFallback } from '@/lib/model-fallback';
import { GEMINI_DEFAULT_MODEL } from '@/lib/storage';
import { TemplateGenerationRequest, TemplateGenerationResult, ImageStyleRecipe, LogoArchetypeRecipe } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/image-style-template
 * Synthesizes a new Image Style Scene Recipe or Logo Brand Archetype
 * based on the user's natural language request or creative vibe.
 */
export async function POST(req: NextRequest) {
  try {
    const body: TemplateGenerationRequest = await req.json();
    const { provider, prompt, mode = 'image', contextCategory } = body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt is required to generate a template.' }, { status: 400 });
    }

    const isLogo = mode === 'logo';

    const systemInstruction = `You are PromptCrafter's Master Visual Architect & Brand Identity Director.
The user wants to generate a complete, production-grade ${isLogo ? 'Brand Identity Archetype Template' : 'Visual Scene Style Recipe'} based on their creative prompt: "${prompt.trim()}".

${isLogo ? `LOGO ARCHETYPE GENERATION RULES:
Synthesize a complete brand identity recipe that guarantees vector-grade clarity, anti-raster safety, and strong geometric meaning.
Valid option IDs:
- logoType: 'wordmark' | 'lettermark' | 'pictorial' | 'abstract' | 'emblem' | 'combination'
- logoStyle: 'minimalist-flat' | 'geometric-flat' | 'monoline' | 'swiss-style' | 'negative-space' | 'stamp-seal' | 'storybook-gothic' | 'pixel-sharp' | '3d-clay' | 'vintage-badge'
- palette: 'monochrome-bold' | 'slate-minimal' | 'cyber-neon' | 'fintech-trust' | 'luxury-gold' | 'earthy-botanical' | 'sunset-gradient' | 'vibrant-energy' | 'warm-terracotta'
- shapeLanguage: 'circular' | 'angular' | 'squared' | 'organic' | 'symmetrical' | 'asymmetric'
- typography: 'geometric-sans' | 'humanist-sans' | 'modern-serif' | 'slab-serif' | 'script' | 'monospace' | 'display-custom' | 'no-text'
- lockup: 'horizontal' | 'stacked' | 'emblem' | 'mark-only'
- hiddenMeaning: 'none' | 'negative-space' | 'hidden-glyph' | 'double-meaning'
- boldness: 'safe' | 'balanced' | 'daring'
- usage: array from ['app-icon', 'website', 'packaging', 'print', 'apparel']
- aspectRatio: '1:1'
- category: one of 'Tech & SaaS' | 'Modern & Swiss' | 'Luxury & Heritage' | 'Creative & Modern' | 'Artisan & Craft' | 'Custom AI'
- goal: 'tech' | 'luxury' | 'creative' | 'vintage' | 'minimal' | 'playful'
- iconName: Lucide icon name, e.g. 'Cpu', 'Crown', 'Shapes', 'Zap', 'LayoutGrid', 'Eye', 'Sparkles', 'Flame', 'Smile', 'PenTool'` : `IMAGE SCENE RECIPE GENERATION RULES:
Synthesize a complete photographic or artistic scene recipe based on physics-based optics, lighting rigs, film stocks, and composition geometry.
Valid option IDs:
- style: 'photorealistic' | 'cinematic' | 'editorial' | 'anime' | '3d-render' | 'minimalist' | 'cyberpunk' | 'fantasy' | 'watercolor' | 'isometric' | 'pixel-art' | 'retrofuturism' | 'product-photography' | 'noir' | 'vaporwave' | 'ukiyo-e' | 'papercraft' | 'concept-art'
- lighting: 'golden-hour' | 'studio' | 'neon' | 'chiaroscuro' | 'overcast' | 'moonlight' | 'high-key' | 'low-key' | 'rim-light' | 'backlight' | 'volumetric' | 'bioluminescent' | 'hard-sun'
- camera: '35mm' | '85mm' | 'wide-angle' | 'macro' | 'fisheye' | 'anamorphic'
- composition: 'close-up' | 'wide-shot' | 'low-angle' | 'aerial' | 'eye-level' | 'portrait' | 'macro' | 'rule-of-thirds' | 'dutch-angle' | 'symmetry' | 'leading-lines' | 'negative-space'
- colorGrade: 'kodak-portra-400' | 'cinestill-800t' | 'fujifilm-velvia-50' | 'kodachrome-64' | 'bleach-bypass' | 'ilford-hp5' | 'teal-and-orange' | 'muted-editorial' | 'vibrant-punch'
- mood: 'serene' | 'epic' | 'melancholic' | 'joyful' | 'mysterious' | 'dramatic' | 'dreamy' | 'ominous' | 'whimsical' | 'nostalgic' | 'cozy' | 'awe'
- aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:2' | '4:5' | '21:9'
- category: one of 'Editorial & Fashion' | 'Cinematic & Film' | '3D & CGI' | 'Fine Art & Graphic' | 'Sci-Fi & Cyberpunk' | 'Architecture & Spaces' | 'Custom AI'
- goal: 'photoreal' | 'cinematic' | 'artistic' | 'cgi' | 'stylized' | 'retro' | 'editorial'
- iconName: Lucide icon name, e.g. 'Crown', 'Zap', 'Sparkles', 'Clapperboard', 'Flame', 'Droplets', 'Square', 'Palette', 'Smile'`}

Return ONLY a clean valid JSON object with NO markdown fence or extra commentary.`;

    const userMessage = `User Creative Vibe Prompt: "${prompt.trim()}"
Context Category: "${contextCategory || 'Custom AI'}"
Generate a complete, highly refined ${isLogo ? 'LogoArchetypeRecipe' : 'ImageStyleRecipe'} object.

JSON Schema format for ${isLogo ? 'Logo mode' : 'Image mode'}:
${isLogo ? `{
  "id": "custom-logo-${Date.now()}",
  "label": "Short Punchy Title (2-4 words)",
  "category": "Tech & SaaS",
  "summary": "1-2 sentence compelling summary of the visual vibe, geometry, and brand feel.",
  "goal": "tech",
  "iconName": "Cpu",
  "isAiGenerated": true,
  "config": {
    "logoType": "lettermark",
    "logoStyle": "monoline",
    "palette": "cyber-neon",
    "shapeLanguage": "symmetrical",
    "typography": "geometric-sans",
    "lockup": "horizontal",
    "hiddenMeaning": "negative-space",
    "boldness": "balanced",
    "usage": ["app-icon", "website"],
    "aspectRatio": "1:1",
    "negativePrompt": "photorealistic 3D, gradients, drop shadow, complex bevel, messy lines",
    "sampleBrandName": "Sample Brand Name",
    "sampleIndustry": "tech",
    "sampleConcept": "network",
    "directorNotes": "Directorial rationale on why this archetype succeeds."
  }
}` : `{
  "id": "custom-style-${Date.now()}",
  "label": "Short Punchy Title (2-4 words)",
  "category": "Cinematic & Film",
  "summary": "1-2 sentence compelling summary of the visual vibe, lighting, and optics.",
  "goal": "cinematic",
  "iconName": "Clapperboard",
  "aspectHint": "16:9",
  "isAiGenerated": true,
  "config": {
    "style": "cinematic",
    "camera": "anamorphic",
    "lighting": "volumetric",
    "composition": "wide-shot",
    "colorGrade": "teal-and-orange",
    "mood": "epic",
    "aspectRatio": "16:9",
    "negativePrompt": "blurry, low quality, oversaturated, amateur photography",
    "sampleSubject": "Descriptive concrete sample subject",
    "sampleFullPrompt": "Complete ready-to-run sample prompt combining all elements",
    "directorNotes": "Directorial rationale on lighting, lens choice, and atmosphere."
  }
}`}`;

    let jsonString = '';

    if (provider && provider.apiKey && provider.apiKey !== 'BUILTIN' && !provider.useBuiltInGemini) {
      jsonString = await handleOpenAIProviderRequest({
        provider,
        systemInstruction,
        messages: [{ role: 'user', content: userMessage }],
        jsonMode: true,
      });
    } else {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ error: 'Gemini API key is not configured on the server.' }, { status: 500 });
      }

      const client = new GoogleGenAI({ apiKey });
      const activeModel = provider?.activeModel || provider?.model || GEMINI_DEFAULT_MODEL;

      jsonString = await withModelFallback(
        async (modelName) => {
          const res = await client.models.generateContent({
            model: modelName,
            contents: userMessage,
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              temperature: 0.7,
            },
          });
          return res.text || '';
        },
        activeModel,
        [GEMINI_DEFAULT_MODEL, 'gemini-2.5-flash']
      );
    }

    // Clean JSON formatting
    const cleaned = jsonString.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleaned);

    const result: TemplateGenerationResult = {
      mode,
      recipe: !isLogo ? (parsed as ImageStyleRecipe) : undefined,
      archetype: isLogo ? (parsed as LogoArchetypeRecipe) : undefined,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Failed to generate style template:', error);
    const errorDetails = formatOpenAIError(error);
    return NextResponse.json(
      { error: errorDetails.message || 'Failed to generate style template. Please try again.' },
      { status: errorDetails.statusCode || 500 }
    );
  }
}
