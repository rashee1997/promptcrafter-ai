/**
 * Local model-capability table for multimodal routing decisions.
 *
 * Approximate, on-device — not fetched from a live API. Used to decide
 * whether an attached PDF or image can be sent directly to the active
 * model, or whether it must be auto-extracted via the built-in Gemini.
 */

export interface ModelCapability {
  /** Whether the model can process image inputs (vision). */
  supportsVision: boolean;
  /** Whether the model can process inline PDF documents. */
  supportsPdf: boolean;
  /** Whether the model was recognized in the table. */
  known: boolean;
}

interface CapabilityEntry {
  match: RegExp;
  supportsVision: boolean;
  supportsPdf: boolean;
}

// Order matters: more specific patterns must come first.
const CAPABILITY_TABLE: CapabilityEntry[] = [
  // Gemini family — full multimodal (PDF + vision)
  { match: /gemini-2\.5-pro/i, supportsVision: true, supportsPdf: true },
  { match: /gemini-2\.5-flash/i, supportsVision: true, supportsPdf: true },
  { match: /gemini-3/i, supportsVision: true, supportsPdf: true },
  { match: /gemini/i, supportsVision: true, supportsPdf: true },
  // Claude family — vision + PDF via document feature
  { match: /claude-4/i, supportsVision: true, supportsPdf: true },
  { match: /claude-3\.5/i, supportsVision: true, supportsPdf: true },
  { match: /claude-3/i, supportsVision: true, supportsPdf: true },
  { match: /claude/i, supportsVision: true, supportsPdf: true },
  // OpenAI family — vision but PDFs require explicit extraction
  { match: /gpt-5/i, supportsVision: true, supportsPdf: false },
  { match: /gpt-4o-mini/i, supportsVision: true, supportsPdf: false },
  { match: /gpt-4o/i, supportsVision: true, supportsPdf: false },
  { match: /gpt-4\.1-nano/i, supportsVision: true, supportsPdf: false },
  { match: /gpt-4\.1-mini/i, supportsVision: true, supportsPdf: false },
  { match: /gpt-4\.1/i, supportsVision: true, supportsPdf: false },
  { match: /o3-mini/i, supportsVision: true, supportsPdf: false },
  // Llama, Deepseek, Mistral — generally text-only or unknown
];

const UNKNOWN_CAPABILITY: ModelCapability = {
  supportsVision: false,
  supportsPdf: false,
  known: false,
};

/**
 * Get the multimodal capability of a model by name.
 * Returns conservative defaults (no vision, no PDF) for unknown models.
 */
export function getModelCapability(modelName: string): ModelCapability {
  if (!modelName) return UNKNOWN_CAPABILITY;
  const entry = CAPABILITY_TABLE.find((e) => e.match.test(modelName));
  if (!entry) return UNKNOWN_CAPABILITY;
  return {
    supportsVision: entry.supportsVision,
    supportsPdf: entry.supportsPdf,
    known: true,
  };
}
