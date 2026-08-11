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

export interface TestPromptRequest {
  provider: ProviderConfig;
  generatedPrompt: string;
  testInput: string;
}
