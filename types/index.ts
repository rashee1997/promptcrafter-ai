export type ToneType = 
  | 'professional'
  | 'concise'
  | 'creative'
  | 'detailed'
  | 'analytical'
  | 'academic'
  | 'executive'
  | 'socratic'
  | 'persuasive'
  | 'empathic'
  | 'adversarial'
  | 'pedagogical'
  | 'diplomatic'
  | 'narrative';

export type FrameworkType = 
  | 'rtf' // Role-Task-Format
  | 'car' // Context-Action-Result
  | 'cot' // Chain of Thought
  | 'few-shot' // Few-Shot Exemplar
  | 'system-instruction' // Meta System Prompt
  | 'react' // ReAct (Reasoning + Acting)
  | 'risen' // Role-Instructions-Steps-EndGoal-Narrowing
  | 'tot' // Tree-of-Thoughts
  | 'self-refine' // Self-Refine & Critique
  | 'ape' // Action-Purpose-Expectation
  | 'coast' // Context-Objective-Actions-Scenario-Task
  | 'socratic-architecture'; // Socratic Meta-Cognitive Framework

export interface DomainPreset {
  id: string;
  name: string;
  iconName: string;
  description: string;
  systemPromptFragment: string;
  placeholders: {
    topic: string;
    audience?: string;
    additionalNotes?: string;
  };
  exampleTopics: string[];
  /**
   * Optional domain-specific mandatory directives injected into the meta-prompt
   * so every engineered prompt embeds the domain's full requirements
   * (e.g., SEO deliverables + anti-AI-writing-pattern guardrails for Blog Writer).
   */
  domainGuidance?: string;
}

export interface ToneOption {
  value: ToneType;
  label: string;
  description: string;
  category: string;
}

export interface FrameworkOption {
  value: FrameworkType;
  label: string;
  tag: string;
  description: string;
  category: string;
}

export interface ProviderConfig {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  isDefault?: boolean;
  useBuiltInGemini?: boolean;
  temperature: number;
  maxTokens?: number;
  topP?: number;
  disableStreaming?: boolean;
}

export interface PromptInput {
  topic: string;
  domainId: string;
  customDomain?: string;
  tone: ToneType;
  framework: FrameworkType;
  targetAudience?: string;
  outputFormat?: 'markdown' | 'json' | 'bullet-points' | 'xml' | 'structured-text';
  includeConstraints: boolean;
  includeExamples: boolean;
  additionalNotes?: string;
  /**
   * Optional hard cap on the length of the ENGINEERED prompt, in characters.
   * When set, the generator is instructed to keep its output under this limit.
   * Leave undefined for no limit.
   */
  outputCharLimit?: number;
}

/**
 * F1 — Prompt Quality Scorecard.
 * A 0-100 production-readiness assessment across a fixed rubric,
 * produced by an LLM judge (with a client-side heuristic fallback).
 */
export interface QualityDimension {
  score: number; // 0-100
  notes: string;
}

export interface PromptQuality {
  overall: number; // 0-100 arithmetic mean of dimensions
  dimensions: {
    clarity: QualityDimension; // Clarity & Specificity
    structure: QualityDimension; // Structure & Organization
    outputSpec: QualityDimension; // Output Specification
    context: QualityDimension; // Contextual Guidance
    errorHandling: QualityDimension; // Error Handling / Guardrails
    tokenEfficiency: QualityDimension; // Leanness vs bloat
  };
  strengths: string[];
  improvements: { issue: string; fix: string }[];
  modelUsed: string;
  providerName: string;
  evaluatedAt: number;
  source: 'llm-judge' | 'heuristic';
}

export type VersionSourceType = 'initial' | 'refinement' | 'manual-edit';

export interface PromptVersion {
  id: string;                  // `v-${timestamp}-${rand}`
  versionNumber: number;       // 1, 2, 3... sequential within the session
  name: string;                // auto-generated, user-renameable
  sourceType: VersionSourceType;
  createdAt: number;
  // The refinement instruction that produced this version (empty for 'initial')
  refinementInstruction?: string;
  // The full engineered prompt content at this version
  content: string;
  providerName: string;
  modelUsed: string;
  // Token/word/char stats snapshot, computed at save time
  stats: { wordCount: number; charCount: number; estTokens: number };
  // F1 — cached prompt-quality assessment for this version (optional)
  quality?: PromptQuality;
}

export interface ThreadMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;             // user's refinement instruction, or assistant's short ack/prompt output
  createdAt: number;
  resultingVersionId?: string; // links assistant turns to the PromptVersion they produced
}

// F3 — one executed regression-suite case (a prompt version run against one test input)
export interface TestCaseResult {
  input: string;
  output: string;
  score: number | null; // 0-100 output-quality score, null when execution failed
  passed: boolean; // score >= pass threshold
  error?: string;
}

// F3 — a full regression-suite run for one prompt version
export interface TestRun {
  id: string;
  versionId: string;
  versionNumber: number;
  ranAt: number;
  providerName: string;
  modelUsed: string;
  cases: TestCaseResult[];
}

export interface Session {
  id: string;                  // `sess-${timestamp}-${rand}`
  title: string;                // derived from original topic, editable
  domainId: string;
  domainName: string;
  originalInput: PromptInput;  // the form input that started the session
  messages: ThreadMessage[];   // full conversational thread, chronological
  versions: PromptVersion[];   // chronological, versionNumber ascending
  activeVersionId: string;     // which version is currently shown in the output pane
  favorite?: boolean;
  tags?: string[];
  // F3 — saved regression-suite test inputs and historical run results
  testSuite?: string[];
  testRuns?: TestRun[];
  createdAt: number;
  updatedAt: number;
}

// F1 — request to score a prompt against the quality rubric
export interface EvaluateRequest {
  provider: ProviderConfig;
  prompt: string;
}

// F2 — run the same prompt + test input across multiple providers
export interface ABTestRequest {
  providers: ProviderConfig[];
  generatedPrompt: string;
  testInput: string;
}

export interface ABTestResultItem {
  providerId: string;
  providerName: string;
  model: string;
  output: string;
  error?: string;
}

export interface ABTestResult {
  results: ABTestResultItem[];
  consistency: number | null; // 0-100 semantic similarity across successful outputs
  ranAt: number;
}

// F3 — execute a prompt against one test input and judge the output
export interface CaseEvaluationRequest {
  provider: ProviderConfig;
  prompt: string;
  testInput: string;
}

export interface CaseEvaluationResult {
  output: string;
  score: number | null;
  passed: boolean;
  notes?: string;
  error?: string;
}

/**
 * @deprecated Use Session and PromptVersion instead. Kept for DB migration compatibility.
 */
export interface HistoryItem {
  id: string;
  timestamp: number;
  domainId: string;
  domainName: string;
  input: PromptInput;
  output: string;
  providerName: string;
  modelUsed: string;
  favorite?: boolean;
  tags?: string[];
}

export interface GenerationRequest {
  provider: ProviderConfig;
  input: PromptInput;
}

export interface RefineRequest {
  provider: ProviderConfig;
  session: Pick<Session, 'id' | 'originalInput' | 'domainId'>;
  // Full message history sent for context — NOT just the latest instruction
  priorMessages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  instruction: string;         // the new user refinement instruction
}

export interface TestPromptRequest {
  provider: ProviderConfig;
  generatedPrompt: string;
  testInput: string;
}
