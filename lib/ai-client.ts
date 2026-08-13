import {
  ABTestRequest,
  ABTestResult,
  CaseEvaluationRequest,
  CaseEvaluationResult,
  GenerationRequest,
  PromptQuality,
  ProviderConfig,
  RefineRequest,
  TestPromptRequest,
} from '@/types';

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

/** F1 — score a prompt against the quality rubric via the LLM judge. */
export async function evaluatePromptQuality(
  provider: ProviderConfig,
  prompt: string
): Promise<PromptQuality | null> {
  try {
    const res = await fetch('/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, prompt }),
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
