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
}

export interface ThreadMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;             // user's refinement instruction, or assistant's short ack/prompt output
  createdAt: number;
  resultingVersionId?: string; // links assistant turns to the PromptVersion they produced
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
  createdAt: number;
  updatedAt: number;
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
