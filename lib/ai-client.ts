import {
  ABTestRequest,
  ABTestResult,
  CaseEvaluationRequest,
  CaseEvaluationResult,
  EvaluateRequest,
  GenerationRequest,
  ImageConfigAssistRequest,
  ImageConfigAssistResponse,
  ImageEditRequest,
  ImageEditResult,
  ImagePromptGenerationRequest,
  LogoCritiqueRequest,
  LogoCritiqueResponse,
  LogoVariationRequest,
  LogoVariationResponse,
  ImagePromptRedoRequest,
  ImageToPromptRequest,
  ImageToPromptResult,
  PromptInput,
  PromptQuality,
  ProviderConfig,
  TemplateGenerationRequest,
  TemplateGenerationResult,
  RefineRequest,
  SuggestExamplesRequest,
  SuggestExamplesResponse,
  SuggestNegativePromptRequest,
  SuggestNegativePromptResponse,
  TestPromptRequest,
} from '@/types';
import type { VideoCharacter, VideoLocation } from '@/types/video';
import type {
  SuggestVideoLocationRequest,
  VideoBootstrapRequest,
  VideoBootstrapResponse,
} from '@/lib/video/bootstrap/types';

export async function generatePromptStream(
  request: GenerationRequest,
  onChunk: (chunk: string) => void,
  onComplete: (fullText: string) => void,
  onError: (error: Error) => void,
  signal?: AbortSignal
): Promise<void> {
  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ error: `Server HTTP ${res.status}` }));
      throw new Error(errData.error || `HTTP ${res.status}`);
    }

    if (!res.body) {
      throw new Error('Response body is empty');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      accumulatedText += chunk;
      onChunk(chunk);
    }

    onComplete(accumulatedText);
  } catch (err: any) {
    if (err.name === 'AbortError') return;
    onError(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function refinePromptStream(
  request: RefineRequest,
  onChunk: (chunk: string) => void,
  onComplete: (fullText: string) => void,
  onError: (error: Error) => void,
  signal?: AbortSignal
): Promise<void> {
  try {
    const res = await fetch('/api/refine', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ error: `Server HTTP ${res.status}` }));
      throw new Error(errData.error || `HTTP ${res.status}`);
    }

    if (!res.body) {
      throw new Error('Response body is empty');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      accumulatedText += chunk;
      onChunk(chunk);
    }

    onComplete(accumulatedText);
  } catch (err: any) {
    if (err.name === 'AbortError') return;
    onError(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function testPromptExecution(
  request: TestPromptRequest,
  onChunk: (chunk: string) => void,
  onComplete: (fullText: string) => void,
  onError: (error: Error) => void,
  signal?: AbortSignal
): Promise<void> {
  try {
    const res = await fetch('/api/test-prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ error: `Server HTTP ${res.status}` }));
      throw new Error(errData.error || `HTTP ${res.status}`);
    }

    if (!res.body) {
      throw new Error('Response body is empty');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      accumulatedText += chunk;
      onChunk(chunk);
    }

    onComplete(accumulatedText);
  } catch (err: any) {
    if (err.name === 'AbortError') return;
    onError(err instanceof Error ? err : new Error(String(err)));
  }
}

/** Image Studio — per-section redo: regenerate a single platform prompt from the existing brief. */
export async function redoImagePromptStream(
  request: ImagePromptRedoRequest,
  onChunk: (chunk: string) => void,
  onComplete: (fullText: string) => void,
  onError: (error: Error) => void,
  signal?: AbortSignal
): Promise<void> {
  try {
    const res = await fetch('/api/image-prompt-redo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ error: `Server HTTP ${res.status}` }));
      throw new Error(errData.error || `HTTP ${res.status}`);
    }

    if (!res.body) {
      throw new Error('Response body is empty');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      accumulatedText += chunk;
      onChunk(chunk);
    }

    onComplete(accumulatedText);
  } catch (err: any) {
    if (err.name === 'AbortError') return;
    onError(err instanceof Error ? err : new Error(String(err)));
  }
}

/** Image Studio — stream an image-ready, multi-platform image generation prompt. */
export async function generateImagePromptStream(
  request: ImagePromptGenerationRequest,
  onChunk: (chunk: string) => void,
  onComplete: (fullText: string) => void,
  onError: (error: Error) => void,
  signal?: AbortSignal
): Promise<void> {
  try {
    const res = await fetch('/api/image-prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ error: `Server HTTP ${res.status}` }));
      throw new Error(errData.error || `HTTP ${res.status}`);
    }

    if (!res.body) {
      throw new Error('Response body is empty');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      accumulatedText += chunk;
      onChunk(chunk);
    }

    onComplete(accumulatedText);
  } catch (err: any) {
    if (err.name === 'AbortError') return;
    onError(err instanceof Error ? err : new Error(String(err)));
  }
}

/** Image Studio — Reverse Engineer an image to structured prompt anatomy. */
export async function reverseEngineerImageToPrompt(
  request: ImageToPromptRequest
): Promise<ImageToPromptResult | null> {
  try {
    const res = await fetch('/api/image-to-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error('reverseEngineerImageToPrompt failed:', err);
    throw err;
  }
}

/** Image Studio — Conversational Edit Mode ("Edit, don't re-roll"). */
export async function editImagePrompt(
  request: ImageEditRequest
): Promise<ImageEditResult | null> {
  try {
    const res = await fetch('/api/image-edit-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error('editImagePrompt failed:', err);
    throw err;
  }
}

/** F1 — score a prompt against the quality rubric via the LLM judge. */
export async function evaluatePromptQuality(
  provider: ProviderConfig,
  prompt: string,
  context?: EvaluateRequest['context']
): Promise<PromptQuality | null> {
  try {
    const res = await fetch('/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, prompt, context }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.quality || null;
  } catch (err) {
    console.error('evaluatePromptQuality failed:', err);
    return null;
  }
}

/** F2 — run the same prompt + test input across multiple providers. */
export async function runABTest(request: ABTestRequest): Promise<ABTestResult | null> {
  try {
    const res = await fetch('/api/ab-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('runABTest failed:', err);
    return null;
  }
}

/** A1 — AI-refreshed example-topic suggestions (hybrid demo prompts). */
export async function suggestExamples(
  request: SuggestExamplesRequest
): Promise<SuggestExamplesResponse> {
  try {
    const res = await fetch('/api/suggest-examples', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) return { examples: [], fallback: true };
    const data = await res.json();
    return {
      examples: Array.isArray(data?.examples) ? data.examples.map(String) : [],
      fallback: data?.fallback !== false,
    };
  } catch (err) {
    console.error('suggestExamples failed:', err);
    return { examples: [], fallback: true };
  }
}

/** B1 — AI-suggested negative-prompt line for Image / Logo modes. */
export async function suggestNegativePrompt(
  request: SuggestNegativePromptRequest
): Promise<SuggestNegativePromptResponse> {
  try {
    const res = await fetch('/api/suggest-negative-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) return { suggestion: null };
    const data = await res.json();
    return { suggestion: typeof data?.suggestion === 'string' && data.suggestion.trim() ? data.suggestion.trim() : null };
  } catch (err) {
    console.error('suggestNegativePrompt failed:', err);
    return { suggestion: null };
  }
}

/** Image Prompt Studio AI Config Assist — proposes option chips for the Refine / Art direction sections. */
export async function getImageConfigAssist(
  request: ImageConfigAssistRequest,
  signal?: AbortSignal
): Promise<ImageConfigAssistResponse> {
  try {
    const res = await fetch('/api/image-config-assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal,
    });
    if (!res.ok) return { fields: null };
    const data = await res.json();
    return { fields: data?.fields && typeof data.fields === 'object' ? data.fields : null };
  } catch (err) {
    console.error('getImageConfigAssist failed:', err);
    return { fields: null };
  }
}

/** Logo Prompt Studio AI Critique — scores a brief against the seven logo design principles. */
export async function getLogoCritique(
  request: LogoCritiqueRequest,
  signal?: AbortSignal
): Promise<LogoCritiqueResponse> {
  const empty: LogoCritiqueResponse = { overallScore: null, principles: [], topRecommendation: '' };
  try {
    const res = await fetch('/api/logo-critique', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal,
    });
    if (!res.ok) return empty;
    const data = await res.json();
    return {
      overallScore: typeof data?.overallScore === 'number' ? data.overallScore : null,
      principles: Array.isArray(data?.principles) ? data.principles : [],
      topRecommendation: typeof data?.topRecommendation === 'string' ? data.topRecommendation : '',
    };
  } catch (err) {
    console.error('getLogoCritique failed:', err);
    return empty;
  }
}

/** Logo Prompt Studio AI Lockup Variation Suggestor — proposes a coherent lockup/variation set for the brief. */
export async function getLogoVariations(
  request: LogoVariationRequest,
  signal?: AbortSignal
): Promise<LogoVariationResponse> {
  try {
    const res = await fetch('/api/logo-variations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal,
    });
    if (!res.ok) return { variations: null };
    const data = await res.json();
    return { variations: Array.isArray(data?.variations) ? data.variations : null };
  } catch (err) {
    console.error('getLogoVariations failed:', err);
    return { variations: null };
  }
}

/** F3 — execute a prompt against one test input and judge the output. */
export async function runCaseEvaluation(
  request: CaseEvaluationRequest
): Promise<CaseEvaluationResult | null> {
  try {
    const res = await fetch('/api/evaluate-output', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('runCaseEvaluation failed:', err);
    return null;
  }
}

/** Video Prompt Studio — run one AI bootstrap stage (script → VFX). */
export async function runVideoBootstrap(
  request: VideoBootstrapRequest,
  signal?: AbortSignal
): Promise<VideoBootstrapResponse> {
  const res = await fetch('/api/video-bootstrap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: `Server HTTP ${res.status}` }));
    throw new Error(errData.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

/** Video Prompt Studio — regenerate ONE character's copy-ready image prompt. */
export async function regenerateCharacterImagePrompt(
  request: {
    provider: ProviderConfig;
    character: VideoCharacter;
    revisionNote?: string;
    styleContext?: string;
  },
  signal?: AbortSignal
): Promise<string> {
  const res = await fetch('/api/video-character-image-prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: `Server HTTP ${res.status}` }));
    throw new Error(errData.error || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return typeof data?.imagePrompt === 'string' && data.imagePrompt.trim() ? data.imagePrompt.trim() : '';
}

/** Video Prompt Studio — low-latency ad-hoc location scouting. */
export async function suggestVideoLocations(
  request: SuggestVideoLocationRequest
): Promise<VideoLocation[]> {
  try {
    const res = await fetch('/api/suggest-video-location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.locations) ? data.locations : [];
  } catch (err) {
    console.error('suggestVideoLocations failed:', err);
    return [];
  }
}

/** Image & Logo Prompt Studio — AI-Assisted Style / Logo Template generation */
export async function generateStyleTemplate(
  request: TemplateGenerationRequest,
  signal?: AbortSignal
): Promise<TemplateGenerationResult> {
  const res = await fetch('/api/image-style-template', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: `Server HTTP ${res.status}` }));
    throw new Error(errData.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

/** Logo Prompt Studio — Smart Brand Autopilot Strategist */
export async function runBrandStrategist(
  request: {
    provider: ProviderConfig;
    brandName: string;
    description: string;
  },
  signal?: AbortSignal
): Promise<any> {
  const res = await fetch('/api/brand-strategist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: `Server HTTP ${res.status}` }));
    throw new Error(errData.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

/** Phase 6 — Text Prompt Studio: Synthesize few-shot exemplars */
export async function synthesizeExemplars(
  input: PromptInput,
  signal?: AbortSignal
): Promise<import('@/types').FewShotExemplar[]> {
  try {
    const res = await fetch('/api/synthesize-exemplars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input }),
      signal,
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.exemplars) ? data.exemplars : [];
  } catch (err) {
    console.error('synthesizeExemplars failed:', err);
    return [];
  }
}

/** Phase 7 — Text Prompt Studio: Distill and compress prompt */
export async function distillPrompt(
  prompt: string,
  provider?: ProviderConfig,
  signal?: AbortSignal
): Promise<string> {
  const res = await fetch('/api/distill-prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, provider }),
    signal,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: `Server HTTP ${res.status}` }));
    throw new Error(errData.error || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.distilledPrompt || '';
}

/** Phase 8 — Text Prompt Studio: Run adversarial red-team audit */
export async function runRedTeamAudit(
  prompt: string,
  provider?: ProviderConfig,
  signal?: AbortSignal
): Promise<import('@/app/api/red-team-audit/route').RedTeamAuditResponse> {
  const res = await fetch('/api/red-team-audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, provider }),
    signal,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: `Server HTTP ${res.status}` }));
    throw new Error(errData.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

/** Phase 9 — Text Prompt Studio: Generate batch evaluation scenarios */
export async function generateBatchScenarios(
  input: PromptInput,
  signal?: AbortSignal
): Promise<import('@/app/api/batch-eval-scenarios/route').BatchScenario[]> {
  const res = await fetch('/api/batch-eval-scenarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input }),
    signal,
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data?.scenarios) ? data.scenarios : [];
}




