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
  /** Primary/default model. Always kept in sync with the first entry of `models`. */
  model: string;
  /**
   * All models configured for this provider. Falls back to `[model]` when absent
   * so older persisted configs remain readable. Stored locally (IndexedDB / LocalStorage).
   */
  models?: string[];
  /** Currently selected model for this provider (mirrors the persisted local selection). */
  activeModel?: string;
  isDefault?: boolean;
  useBuiltInGemini?: boolean;
  temperature: number;
  maxTokens?: number;
  topP?: number;
  disableStreaming?: boolean;
  /**
   * Fallback behavior when the active model fails (model not found, rate
   * limit, or provider server error). 'manual' retries with `fallbackModel`;
   * 'auto' rotates through every configured model in order. Absent = 'none'
   * (backward compatible with existing persisted configs).
   */
  fallbackMode?: 'none' | 'manual' | 'auto';
  /** Manual fallback model id used when `fallbackMode === 'manual'`. */
  fallbackModel?: string;
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
 * Fixed keys of the quality rubric. Used to tag improvement suggestions with
 * the dimension they belong to so fixes can be applied back through refine.
 */
export type QualityDimensionKey =
  | 'clarity'
  | 'structure'
  | 'outputSpec'
  | 'context'
  | 'errorHandling'
  | 'tokenEfficiency';

export type ImprovementSeverity = 'low' | 'medium' | 'high';

/**
 * Session context passed to the LLM judge so scoring is task-aware instead of
 * generic. Mirrors the relevant fields of PromptInput + the session's domain.
 */
export interface EvaluationContext {
  domainId?: string;
  domainName?: string;
  topic?: string;
  tone?: string;
  framework?: string;
  targetAudience?: string;
  additionalNotes?: string;
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
  improvements: { issue: string; fix: string; dimension?: QualityDimensionKey; severity?: ImprovementSeverity }[];
  modelUsed: string;
  providerName: string;
  evaluatedAt: number;
  source: 'llm-judge' | 'heuristic';
  /** Which model actually produced this score (fixed judge identity for comparability). */
  judgeModel?: string;
  /** Which provider actually produced this score. */
  judgeProvider?: string;
  /** Rubric/schema version this score was produced against. */
  judgeVersion?: string;
  /** Set when the LLM judge failed and this is a heuristic estimate instead. */
  fallbackReason?: string;
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
  // F1 — chronological score history for this version (newest last). `quality`
  // mirrors the last entry so older persisted sessions stay fully readable.
  qualityHistory?: PromptQuality[];
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
  /** Model that judged the outputs of this run (may differ from the executor). */
  judgeModel?: string;
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
  /** Session context so the judge scores against the task, not in a vacuum. */
  context?: EvaluationContext;
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
  /** Model that judged the output (may differ from the executing model). */
  judgeModel?: string;
  judgeProvider?: string;
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

/**
 * Image-generation dialects the Image Studio can emit a tuned prompt for.
 * `gemini` targets Google's Nano Banana image models (Gemini Flash/Pro Image),
 * which are prompted as a natural-language creative brief rather than a tag soup.
 */
export type ImagePlatform =
  | 'midjourney'
  | 'dalle'
  | 'stable-diffusion'
  | 'flux'
  | 'ideogram'
  | 'gemini';

/**
 * Input for the Image Prompt Studio — a multi-platform image generation
 * prompt built from a short description.
 */
export interface ImagePromptInput {
  /** What the image is actually of (the subject slot). */
  subject: string;
  /** Style preset id (see STYLE_PRESETS in lib/image-prompts.ts). */
  style: string;
  /** Lighting preset id, optional. */
  lighting?: string;
  /** Mood preset id, optional. */
  mood?: string;
  /** Composition / camera preset id, optional. */
  composition?: string;
  /** Aspect ratio, e.g. '1:1' | '16:9' | '9:16' | '4:3' | '3:2'. */
  aspectRatio: string;
  /** Which platform dialects to generate a tuned prompt for. */
  platforms: ImagePlatform[];
  /** Custom negative-prompt guidance (things to avoid in the image). */
  negativePrompt?: string;
  /** Camera / lens preset id (see CAMERA_PRESETS in lib/image-prompts.ts). */
  camera?: string;
  /** Color grading / film-stock preset id (see COLOR_GRADE_PRESETS). */
  colorGrade?: string;
  /** Output resolution: '1K' | '2K' | '4K' (Gemini-native; quality tags elsewhere). */
  resolution?: string;
  /** Exact in-image text to render, with typography guidance if desired. */
  inImageText?: string;
  additionalNotes?: string;
  /**
   * Studio mode. 'logo' drives a brand-identity brief (mark type, logo style,
   * color palette, wordmark) instead of a photographic one. Absent = 'image'
   * so persisted briefs and requests stay backward compatible.
   */
  mode?: 'image' | 'logo';
  /** Logo mode — mark type id (see LOGO_MARK_TYPES in lib/logo-prompts.ts). */
  logoType?: string;
  /** Logo mode — style preset id (see LOGO_STYLE_PRESETS in lib/logo-prompts.ts). */
  logoStyle?: string;
  /** Logo mode — color palette id (see LOGO_PALETTE_PRESETS in lib/logo-prompts.ts). */
  palette?: string;
  /** Logo mode — exact brand name / wordmark text to render in the mark. */
  brandName?: string;
  /**
   * Logo mode — industry preset id (see LOGO_INDUSTRY_PRESETS in
   * lib/logo-prompts.ts). Injects the category's expected audience and
   * design direction so the mark reads as appropriate, not generic.
   */
  industry?: string;
  /**
   * Logo mode — ownable symbol concept id (see LOGO_CONCEPT_PRESETS). The
   * mark is built around this concept AND its meaning, which is what makes
   * logos feel designed rather than stock.
   */
  concept?: string;
  /** Logo mode — shape-language id (see LOGO_SHAPE_PRESETS). */
  shapeLanguage?: string;
  /** Logo mode — typography direction id (see LOGO_TYPOGRAPHY_PRESETS). */
  typography?: string;
  /** Logo mode — lockup layout id (see LOGO_LOCKUP_PRESETS). */
  lockup?: string;
  /** Logo mode — hidden-meaning / negative-space treatment id (see LOGO_HIDDEN_MEANING_PRESETS). */
  hiddenMeaning?: string;
  /** Logo mode — versatility targets (see LOGO_USAGE_PRESETS); drives small-size + one-color constraints. */
  usage?: string[];
  /** Logo mode — concept boldness calibration id (see LOGO_BOLDNESS_PRESETS). */
  boldness?: string;
}

/** Request contract for the Image Prompt Studio API route. */
export interface ImagePromptGenerationRequest {
  provider: ProviderConfig;
  input: ImagePromptInput;
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
  /**
   * The exact prompt text being refined (the session's active version). The
   * model may ONLY modify this text — history is context, not the edit target.
   */
  basePrompt: string;
}

export interface TestPromptRequest {
  provider: ProviderConfig;
  generatedPrompt: string;
  testInput: string;
}
