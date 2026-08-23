export type StudioMode = 'prompt';

// ── Phase 6: App Settings ─────────────────────────────────────────────────

/** Auto-routing preference for attachments that the active model can't read. */
export type AutoRoutingPreference = 'always' | 'ask' | 'never';

/** Manual override for a model's multimodal capabilities. */
export interface ModelCapabilityOverride {
  /** Model name (as shown in the provider's model list). */
  model: string;
  /** Provider id this override applies to. '*' = all providers. */
  providerId: string;
  supportsVision: boolean;
  supportsPdf: boolean;
}

/** User-configurable app settings persisted via IndexedDB/localStorage. */
export interface AppSettings {
  /** Version for forward-compatible migrations. */
  _version: number;

  // ── Model Capabilities (§2)
  modelCapabilityOverrides: ModelCapabilityOverride[];

  // ── File & Upload Preferences (§3)
  /** Extra glob/directory patterns to exclude beyond the hardcoded defaults. */
  uploadExclusions: string[];
  /** Max files allowed in a project upload. */
  uploadMaxFiles: number;
  /** Max combined size in MB for a project upload. */
  uploadMaxSizeMB: number;
  /** Auto-routing behavior when the active model can't read attachments. */
  autoRoutingPreference: AutoRoutingPreference;

  // ── Defaults (§5)
  /** Default domain id for new sessions. Empty string = no default (show selector). */
  defaultDomainId: string;
  /** Default framework for new sessions. Empty string = no default. */
  defaultFramework: string;
  /** Default tone for new sessions. Empty string = no default. */
  defaultTone: string;
  /** Default output format. Empty string = no default (uses 'markdown'). */
  defaultOutputFormat: string;
  /** Default target model for steering output format and token limits. */
  defaultTargetModel?: TargetModel;
  /** Default character limit (replaces DEFAULT_OUTPUT_CHAR_LIMIT constant). 0 = no limit. */
  defaultCharLimit: number;

  // ── Phase 4: Video Prompt Studio Director Defaults
  /** Default prompt form override for new video shots ('auto' = let AI choose). */
  videoPromptFormOverride?: string;
  /** Default platform override for new video shots (empty = inherit project platform). */
  videoPlatformOverride?: string;
  /** Product Studio — dialects to skip by default. */
  videoSkippedDialects?: string[];
  /** Product Studio — extension beats enabled by default. */
  videoExtensionBeatsEnabled?: boolean;
}

/** Schema version — bump when AppSettings shape changes. */
export const APP_SETTINGS_VERSION = 1;

/** Default settings shape. */
export const DEFAULT_APP_SETTINGS: AppSettings = {
  _version: APP_SETTINGS_VERSION,
  modelCapabilityOverrides: [],
  uploadExclusions: [],
  uploadMaxFiles: 500,
  uploadMaxSizeMB: 5,
  autoRoutingPreference: 'always',
  defaultDomainId: '',
  defaultFramework: '',
  defaultTone: '',
  defaultOutputFormat: '',
  defaultCharLimit: 0,
};


export type TargetModel = 'claude' | 'gpt' | 'gemini' | 'deepseek' | 'other-or-unsure';

export interface TargetModelOption {
  value: TargetModel;
  label: string;
  description: string;
  recommendedFormat: 'markdown' | 'xml' | 'json' | 'bullet-points' | 'structured-text';
  iconName?: string;
}

export type PromptVariableType = 'string' | 'number' | 'boolean' | 'enum' | 'json';

export interface PromptVariable {
  name: string;
  rawSyntax: string; // e.g. "[TARGET_AUDIENCE]" or "{{tone}}"
  type: PromptVariableType;
  enumValues?: string[];
  defaultValue?: string;
  description?: string;
  required: boolean;
  isDeclaredInSchema?: boolean;
  occurrences: number;
}

export type VariableLintKind =
  | 'unclosed-brace'
  | 'duplicate-name'
  | 'unused-declaration'
  | 'undeclared-reference'
  | 'invalid-type-default';

export interface VariableLintIssue {
  kind: VariableLintKind;
  severity: 'warning' | 'error' | 'info';
  message: string;
  variableName?: string;
  position?: { start: number; end: number };
}

export interface VariableLintReport {
  variables: PromptVariable[];
  issues: VariableLintIssue[];
  hasErrors: boolean;
  hasWarnings: boolean;
}

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
  /** Guidance explaining when this tone is the right choice. */
  bestFor?: string;
  category: string;
}

export interface FrameworkOption {
  value: FrameworkType;
  label: string;
  tag: string;
  /** Longer guidance explaining when this framework is the right choice. */
  bestFor: string;
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

export interface PromptFragment {
  id: string;
  title: string;
  category: 'guardrail' | 'persona' | 'output-spec' | 'technique' | 'custom';
  content: string;
  description?: string;
  createdAt: number;
}

export interface PromptTemplate {
  id: string;
  name: string;
  domainId: string;
  tone: ToneType;
  framework: FrameworkType;
  targetAudience?: string;
  outputFormat?: 'markdown' | 'json' | 'bullet-points' | 'xml' | 'structured-text';
  includeConstraints: boolean;
  includeExamples: boolean;
  requireEvidence?: boolean;
  additionalNotes?: string;
  outputCharLimit?: number;
  createdAt: number;
}

export interface FewShotExemplar {
  id: string;
  input: string;
  output: string;
  explanation?: string;
}

export interface PromptInput {
  topic: string;
  domainId: string;
  customDomain?: string;
  tone: ToneType;
  framework: FrameworkType;
  targetAudience?: string;
  outputFormat?: 'markdown' | 'json' | 'bullet-points' | 'xml' | 'structured-text';
  targetModel?: TargetModel;
  includeConstraints: boolean;
  includeExamples: boolean;
  /** Phase 6 — Synthesized or user-edited few-shot exemplar input/output pairs. */
  exemplars?: FewShotExemplar[];
  /** When true, the generated prompt instructs its target AI to cite a source or explicitly flag unverified claims instead of stating them as fact. */
  requireEvidence?: boolean;
  additionalNotes?: string;
  /**
   * Optional hard cap on the length of the ENGINEERED prompt, in characters or tokens.
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
  // Phase 1 — Prompt variables & placeholders detected/declared in this version
  variables?: PromptVariable[];
  // Phase 1 — Real-time lint report for variables in this version
  variableLint?: VariableLintReport;
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

// A1 — AI-refreshed example-topic suggestions (hybrid demo prompts).
// The static per-domain/module arrays are the instant fallback; this request
// asks a low-latency model to suggest context-aware replacements.
export interface SuggestExamplesRequest {
  module: 'text' | 'image' | 'logo';
  /** Text module only — the selected domain preset id. */
  domainId?: string;
  /** Text module only — the selected domain name, for the prompt. */
  domainName?: string;
  /** Whatever the user has already picked, so suggestions make sense with it. */
  currentInput?: Partial<ImagePromptInput> | Partial<PromptInput>;
  /** Number of suggestions wanted. Default 4. */
  count?: number;
}

export interface SuggestExamplesResponse {
  examples: string[];
  /** True when the request failed and the client should keep its static array. */
  fallback: boolean;
}

// B1 — AI-suggested negative-prompt line for Image / Logo modes.
export interface SuggestNegativePromptRequest {
  mode: 'image' | 'logo';
  input: ImagePromptInput;
}

export interface SuggestNegativePromptResponse {
  /** Null on any failure — the client just hides the suggestion. */
  suggestion: string | null;
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
  /** Round-trip latency in milliseconds. */
  latencyMs?: number;
  /** Estimated cost of this single run in USD (from local pricing table). */
  estimatedCost?: number;
  /** Estimated output token count (for cost estimation). */
  outputTokens?: number;
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
 * `gpt-image` targets OpenAI's GPT Image 2 reasoning image model (arena #1),
 * `midjourney` targets Midjourney V8/V7 (Omni-reference `--oref` + style `--sref`),
 * `flux` targets Flux 2 (Pro/Flex/Max with natural language and hex colors),
 * `stable-diffusion` targets SDXL / SD with weighted tokens and negative prompts,
 * `ideogram` targets Ideogram 4.0 text-in-image specialist,
 * `recraft` targets Recraft V4.1 for native SVG and vector brand marks,
 * `seedream` targets Seedream 5.x for fashion and photorealism.
 * `dalle` is preserved as a backward-compatible alias for `gpt-image`.
 */
export type ImagePlatform =
  | 'midjourney'
  | 'gpt-image'
  | 'dalle'
  | 'stable-diffusion'
  | 'flux'
  | 'ideogram'
  | 'gemini'
  | 'recraft'
  | 'seedream';

/** Output format for image prompts: prose brief, structured JSON schema, or both. */
export type ImagePromptOutputFormat = 'prose' | 'json' | 'both';

/**
 * A reference image uploaded for the Image Prompt Studio. Kept client-side
 * only (session scope) — not persisted to the gallery by default unless opt-in.
 */
export interface ImagePromptReferenceImage {
  id: string;
  /** Base-64 data URL kept client-side only. */
  dataUrl: string;
  /** Purpose tag — changes how the system prompt describes the image per platform. */
  purpose: 'subject' | 'style' | 'brand-consistency' | 'redesign-reference';
}

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
  /** High-level purpose / end-use signal that shapes composition, crop, and grade. */
  purpose?: string;
  /** Output format: prose, JSON schema, or both. */
  outputFormat?: ImagePromptOutputFormat;
  /** Custom negative-prompt guidance (things to avoid in the image). */
  negativePrompt?: string;
  /** Camera / lens preset id (see CAMERA_PRESETS in lib/image-prompts.ts). */
  camera?: string;
  /** Color grading / film-stock preset id (see COLOR_GRADE_PRESETS). */
  colorGrade?: string;
  /** Output resolution: '512px' | '1K' | '2K' | '4K' (Gemini-native; quality tags elsewhere). */
  resolution?: string;
  /** Exact in-image text to render, with typography guidance if desired. */
  inImageText?: string;
  additionalNotes?: string;
  /**
   * Reference images uploaded for the brief. Each carries a purpose tag that
   * changes how the platform-specific prompt sections reference the image.
   * Max 3 — too many dilute the brief. Session-only by default; opt-in to
   * persist with a saved prompt.
   */
  referenceImages?: ImagePromptReferenceImage[];
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

/**
 * Persistence scope of a saved custom chip preset — image-only rows
 * (lighting, composition…), logo-only rows (mark type, palette…), shared
 * rows (style, mood, resolution…) that appear in both studio modes, or the
 * text studio's rows (tone, framework).
 */
export type CustomPresetMode = 'image' | 'logo' | 'text' | 'both';

/**
 * A user-saved custom chip value for the Image/Logo Prompt Studio. Custom
 * values are field-scoped (one list per StudioFormState key) and mode-scoped
 * so image-only, logo-only, and shared rows each keep their own presets.
 */
export interface CustomPresetEntry {
  id: string; // uuid (crypto.randomUUID)
  field: string; // StudioFormState key this belongs to, e.g. 'style', 'lighting', 'palette', 'usage'
  mode: CustomPresetMode;
  label: string; // what's shown on the chip
  value: string; // the raw string used as the actual setting value
  createdAt: number;
}

/** Request contract for the Image Prompt Studio API route. */
export interface ImagePromptGenerationRequest {
  provider: ProviderConfig;
  input: ImagePromptInput;
}

/** Request contract for per-section (single platform) regeneration. */
export interface ImagePromptRedoRequest {
  provider: ProviderConfig;
  input: ImagePromptInput;
  /** The section key to regenerate (e.g. 'midjourney', 'gpt-image', 'ideogram', 'gemini', 'flux', 'recraft'). */
  targetPlatform: string;
  /** The existing full parsed sections for context. */
  existingSections: Record<string, string>;
  /** Optional short text describing what to change (e.g. 'make the lighting warmer'). */
  revisionNote?: string;
}

/** Request contract for Image-to-Prompt (reverse engineering an image). */
export interface ImageToPromptRequest {
  provider: ProviderConfig;
  image: {
    dataUrl: string;
    mimeType?: string;
  };
  mode?: 'image' | 'logo';
}

/** Response contract for Image-to-Prompt reverse engineering. */
export interface ImageToPromptResult {
  extractedBrief: {
    subject: string;
    style?: string;
    lighting?: string;
    camera?: string;
    composition?: string;
    mood?: string;
    colorGrade?: string;
    aspectRatio?: string;
    palette?: string;
    inImageText?: string;
    summary: string;
    /** Logo-mode fields extracted from the image. */
    brandName?: string;
    logoType?: string;
    shapeLanguage?: string;
  };
  suggestedPrompt: string;
}

/** Response from the Image Edit API. */
export interface ImageEditResult {
  editedPrompt: string;
  deltaSummary?: string;
}


/** Request contract for Image Edit ("Edit, don't re-roll"). */
export interface ImageEditRequest {
  provider: ProviderConfig;
  basePrompt: string;
  editInstruction: string;
  platform?: ImagePlatform;
  mode?: 'image' | 'logo';
}

/** Response contract for Image Edit instructions. */
export interface ImageStyleRecipeConfig {
  style?: string;
  lighting?: string;
  camera?: string;
  composition?: string;
  colorGrade?: string;
  mood?: string;
  renderEngine?: string;
  aspectRatio: string;
  resolution?: string;
  negativePrompt?: string;
  sampleSubject?: string;
  sampleFullPrompt?: string;
  directorNotes?: string;
}

export interface ImageStyleRecipe {
  id: string;
  label: string;
  category: 'Editorial & Fashion' | 'Cinematic & Film' | '3D & CGI' | 'Fine Art & Graphic' | 'Sci-Fi & Cyberpunk' | 'Architecture & Spaces' | 'Custom AI' | string;
  summary: string;
  goal: 'photoreal' | 'cinematic' | 'artistic' | 'cgi' | 'stylized' | 'retro' | 'editorial' | string;
  iconName?: string;
  aspectHint: string;
  isAiGenerated?: boolean;
  userPromptBasis?: string;
  createdAt?: number;
  config: ImageStyleRecipeConfig;
}

export interface LogoArchetypeConfig {
  logoType: string;
  logoStyle: string;
  palette: string;
  shapeLanguage: string;
  typography: string;
  lockup: string;
  hiddenMeaning?: string;
  boldness: string;
  usage: string[];
  aspectRatio: string;
  negativePrompt?: string;
  sampleBrandName?: string;
  sampleIndustry?: string;
  sampleConcept?: string;
  directorNotes?: string;
}

export interface LogoArchetypeRecipe {
  id: string;
  label: string;
  category: 'Tech & SaaS' | 'Modern & Swiss' | 'Luxury & Heritage' | 'Creative & Modern' | 'Artisan & Craft' | 'Custom AI' | string;
  summary: string;
  goal: 'tech' | 'luxury' | 'creative' | 'vintage' | 'minimal' | 'playful' | string;
  iconName?: string;
  isAiGenerated?: boolean;
  userPromptBasis?: string;
  createdAt?: number;
  config: LogoArchetypeConfig;
}

/** Request contract for AI-Assisted Style / Logo Template generation */
export interface TemplateGenerationRequest {
  provider: ProviderConfig;
  prompt: string;
  mode: 'image' | 'logo';
  contextCategory?: string;
}

/** Response contract for AI-Assisted Template generation */
export interface TemplateGenerationResult {
  mode: 'image' | 'logo';
  recipe?: ImageStyleRecipe;
  archetype?: LogoArchetypeRecipe;
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

// ── Phase 5: File, Project, PDF & Image Upload ──────────────────────────────

/** Purpose tag for an image attachment in the Text Prompt Studio. */
export type TextStudioImagePurpose =
  | 'screenshot-to-describe'
  | 'diagram-mockup-reference'
  | 'example-output-style';

/** A single code file read as text, client-side only. */
export interface CodeFileAttachment {
  id: string;
  /** Relative path inside the project (e.g. 'src/components/Button.tsx'). */
  path: string;
  /** The file's text content. */
  content: string;
  /** Byte size of the original file. */
  size: number;
}

/** A processed project upload — the filtered file list plus metadata. */
export interface ProjectContext {
  /** Files that passed all filters (exclusions, gitignore, size caps). */
  files: CodeFileAttachment[];
  /** Total number of files in the original upload. */
  totalFilesFound: number;
  /** Total number of files actually included after filtering. */
  includedCount: number;
  /** Files that were excluded by size cap — summarized for the user. */
  omittedSummary?: {
    count: number;
    /** Largest file that was omitted (path + size). */
    largestOmitted: { path: string; size: number };
    totalSizeExceeded: number;
  };
  /** Human-readable name for this project (folder name). */
  projectName: string;
}

/** A PDF file read as base64, client-side only. */
export interface PdfAttachment {
  id: string;
  /** Original filename (e.g. 'spec.pdf'). */
  name: string;
  /** Base-64 encoded data (without the data: prefix). */
  base64Data: string;
  /** MIME type — always 'application/pdf'. */
  mimeType: string;
  /** Byte size. */
  size: number;
}

/** An image attachment for the Text Prompt Studio (reuses the same pattern
 * as ImagePromptReferenceImage but with text-studio-specific purposes). */
export interface TextStudioImageAttachment {
  id: string;
  /** Base-64 data URL kept client-side only. */
  dataUrl: string;
  /** Original filename. */
  name: string;
  /** Purpose tag — changes the extraction prompt. */
  purpose: TextStudioImagePurpose;
  /** Byte size. */
  size: number;
}

/** All possible attachment types for the Text Prompt Studio. */
export interface TextStudioAttachments {
  /** Code files (single or project). */
  codeFiles: CodeFileAttachment[];
  /** Project context (when a folder was uploaded). */
  projectContext?: ProjectContext;
  /** Attached PDFs. */
  pdfs: PdfAttachment[];
  /** Attached images. */
  images: TextStudioImageAttachment[];
}

/** Attachment sent to the API alongside the generation request. */
export interface AttachmentPayload {
  /** Structured project context text block (already formatted). */
  projectContextText?: string;
  /** PDF inline data parts for Gemini. */
  pdfParts?: { mimeType: string; data: string }[];
  /** Image inline data parts for vision models. */
  imageParts?: { mimeType: string; data: string; purpose: string }[];
  /** Text-extracted content from PDFs (fallback when model can't read PDFs). */
  extractedPdfText?: string;
  /** Text-extracted content from images (fallback when model can't read images). */
  extractedImageText?: string;
  /** Whether auto-routing was used (for the visible toast). */
  autoRouted?: boolean;
  /** Message explaining what was auto-extracted (for the visible toast). */
  autoRouteMessage?: string;
}

export interface GenerationRequest {
  provider: ProviderConfig;
  input: PromptInput;
  /** Optional file/PDF/image attachments for the text studio. */
  attachments?: AttachmentPayload;
}
