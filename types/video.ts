// Video Prompt Studio — Phase 1 data contracts.
// Shared end-to-end models for projects, story bibles, characters, scene
// locations, shot items, continuity handoffs, and model dialects.

export type VideoDialect = 'veo' | 'higgsfield' | 'kling' | 'seedance';
export type ProjectStatus = 'draft' | 'active';

/**
 * Phase 3 — single source of truth for every video generation platform.
 * The drafting AI reads `draftingSystemPromptBlock`; the Phase 2 picker UI
 * reads `usageInstructions` and `strengths`. Both derive from the same
 * object — no duplicated information.
 */
export interface PlatformSpec {
  id: VideoTargetPlatform;
  label: string;
  vendor: string;
  summary: string;
  strengths: string[];
  durationCeilingSeconds: number;
  supportsMultiShot: boolean;
  supportsNativeDialogue: boolean;
  /**
   * Exact dialogue / negative-prompt syntax for this platform, shown to the
   * drafting AI so it uses the right format instead of a generic one.
   */
  dialogueSyntaxNote: string;
  /**
   * How negative prompts should be handled: 'dedicated-field' means a
   * separate parameter, 'inline' means appended to the prompt text.
   */
  negativePromptConvention: 'dedicated-field' | 'inline';
  /** Max reference images the platform accepts per generation. */
  referenceImageLimit: number;
  /** Short usage tips shown to the director in the picker card. */
  usageInstructions: string[];
  /**
   * Platform-specific block injected into the drafting AI's system prompt.
   * Overrides the generic 8–30s duration ceiling and dialogue rules with
   * this platform's real numbers and syntax.
   */
  draftingSystemPromptBlock: string;
}

/** Phase 2 — the director picks one target platform before any shot is drafted. */
export type VideoTargetPlatform =
  | 'veo'
  | 'kling'
  | 'seedance'
  | 'higgsfield'
  | 'runway'
  | 'luma'
  | 'pika';

/**
 * Stage 1 output — script treatment (logline, act beats, tone, overview).
 * Lives here (not in the bootstrap pipeline types) because VideoProject
 * persists a creation-time draft of it (Part 3 — AI-assisted Overview).
 */
export interface ScriptTreatment {
  logline: string;
  actBeats: string[];
  tone: string;
  overview: string;
}

/**
 * Stage 1a — prose treatment, present tense, NO dialogue, NO scene headers.
 * Answers: does this story work before anyone writes a screenplay?
 */
export interface StoryTreatment {
  logline: string;
  premise: string;
  emotionalArc: string;
  theme: string;
  acts: { act: 1 | 2 | 3; title: string; beats: string[] }[];
  endingImage: string;
}

/**
 * Stage 1b — the spoken layer. Deliberately NO camera language
 * (spec-script discipline).
 */
export interface ScriptDialogueDraft {
  scenes: {
    sceneNumber: number;
    sceneGoal: string;
    exchanges: { speaker: string; line: string; subtext?: string }[];
    actionSummary: string;
  }[];
}

/**
 * Stage 1c — formatted screenplay scenes. This is what Phase D assigns
 * locations against.
 */
export interface ScreenplayScene {
  sceneNumber: number;
  slugline: string;
  interiorExterior: 'INT' | 'EXT';
  locationId?: string;
  timeOfDay: string;
  presentCharacterIds: string[];
  action: string;
  dialogueRefs: number[];
  estimatedShots: number;
}

/**
 * Stage 1d — the director's plan for HOW it's shot. Camera language
 * lives ONLY here.
 */
export interface DirectionPlan {
  cameraLanguage: string;
  lensPhilosophy: string;
  colourPalette: string;
  lightingApproach: string;
  soundDesign: string;
  visualMotif: string;
  pacingRhythm: string;
  perSceneNotes: { sceneNumber: number; approach: string; shotFunction: string }[];
}

export interface VideoCharacter {
  id: string;
  name: string;
  role: string;
  appearance: string;
  wardrobe: string;
  voiceTone: string;
  /**
   * Copy-ready character-sheet image prompt for EXTERNAL image models
   * (Midjourney, Imagen UI, …): "[Subject]. 360-degree character sheet
   * turnaround: front view, side profile view, back view, and extreme face
   * close-up. [Style]. Pure white background. Empty hands, no props. 4K
   * resolution." Optional so characters persisted before this field shipped
   * stay fully readable.
   */
  imagePrompt?: string;
  /** Director-facing narrative description of the character (1–2 sentences). */
  narrativeDescription?: string;
}

export interface VideoLocation {
  id: string;
  name: string;
  description: string;
}

export interface VideoStyle {
  lookAndMood: string;
  colorGrade: string;
  filmStock: string;
  aspectRatio: string;
}

export interface VideoEffects {
  vfxDirection: string;
  particleDensity: string;
  pacing: string;
}

export interface StoryBible {
  characters: VideoCharacter[];
  locations: VideoLocation[];
  style?: VideoStyle;
  effects?: VideoEffects;
  continuityLog: string[];
}

export interface VideoShot {
  id: string;
  shotNumber: number;
  description: string;
  promptText: string;
  continuityHandoff: string;
  durationSeconds: number;
  confirmed: boolean;
  createdAt: number;
  /**
   * Story Bible character ids explicitly locked to this shot (drag a cast
   * member from the sidebar onto a shot). Dialect adapters use these to inject
   * the character's saved reference image into the video-model payload.
   * Optional — shots persisted before this field existed stay readable.
   */
  characterIds?: string[];
  /**
   * Exact spoken lines, kept short enough to fit durationSeconds. Empty /
   * missing = a silent shot (ambience & score carry it). Never embedded in
   * promptText — this is the structured field the dialect adapters render per
   * model convention. Optional — shots persisted before this feature stay
   * readable as silent shots.
   */
  dialogue?: DialogueLine[];
  /**
   * 3–5 comma-separated negative terms, most-damaging artifact first, or an
   * empty string. Kept out of promptText so each dialect emits it through the
   * target model's native negative field (Kling Negative Semantic Mapping,
   * Veo/Seedance negative lines, …).
   */
  negativePrompt?: string;
  /**
   * The emotion this shot carries (e.g. "guilt", "resolve", "quiet dread").
   * Director Skill — drives the emotional arc across a storyboard.
   */
  emotion?: string;
  /**
   * The dramatic function this shot serves in the sequence:
   * Establish / Reveal / Power / Pressure / Detail / Reaction / Shift /
   * Impact / Aftermath / Exit. Director Skill — makes the whole storyboard
   * have a shape instead of repeating the same beat.
   */
  shotFunction?: string;
}

/**
 * One spoken line locked to a shot. `speaker` must be an exact Story Bible
 * character name (Rule 4) — never a paraphrase — so dialect adapters can bind
 * the line to the right character's voice and mouth.
 */
export interface DialogueLine {
  /** Exact Story Bible character name — never a paraphrase. */
  speaker: string;
  /** The exact words spoken, short enough to fit the clip's durationSeconds. */
  line: string;
  /** Optional delivery direction, e.g. "urgent whisper", "flat, sarcastic". */
  tone?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

/**
 * A file attached to a shot-drafting message. Clients send these as data URLs
 * (converted from the AI SDK file parts in the chat input); the server routes
 * them through routeMultimodalContext before the main model call.
 */
export interface VideoChatFile {
  filename: string;
  mediaType: string;
  /** data URL (base64) payload — images, PDFs, etc. */
  dataUrl: string;
}

/**
 * A character reference image saved to the local Story Bible store
 * (IndexedDB, with a LocalStorage fallback). Stored compressed as WebP to
 * keep the browser memory footprint bounded.
 */
export interface StoryBibleCharacterImage {
  id: string;
  projectId: string;
  /** VideoCharacter.id this image locks, when known. */
  characterId?: string;
  characterName: string;
  /** The character-sheet image prompt that produced this image. */
  imagePrompt: string;
  /** Compressed WebP blob — used by the IndexedDB path (structured clone). */
  imageBlob?: Blob | null;
  /** Data URL mirror — used by the LocalStorage fallback path. */
  imageDataUrl?: string;
  timestamp: number;
  /**
   * Director-chosen primary reference for this character. Consumers pick the
   * primary entry (falling back to the newest) for the sidebar thumbnail and
   * dialect exports instead of blindly taking saved[0]. Optional — entries
   * saved before this field existed behave as non-primary.
   */
  isPrimary?: boolean;
}

/**
 * A shot proposal drafted by the chat assistant, parsed from the structured
 * JSON block the model emits per turn (Phase 4). "Approve" promotes it into a
 * confirmed VideoShot on the project; "Request Revision" re-drafts it.
 */
export interface DraftedShot {
  /** Sequential shot number — continues from the project's last confirmed shot. */
  shotNumber: number;
  /** One-line storyboard summary. */
  description: string;
  /** The full 6-part shot prompt (Subject · Action · Camera · Lighting · Environment · Lens). */
  promptText: string;
  /** Subject + camera ending state handed to the next shot. */
  continuityHandoff: string;
  /** Target clip duration in seconds (8–30). */
  durationSeconds: number;
  /** Empty array = a silent/no-dialogue shot (ambience & score carry it). */
  dialogue: DialogueLine[];
  /** Comma-separated or short-phrase negative terms, 3–5 recommended. */
  negativePrompt: string;
  /**
   * UI metadata (not persisted): set when the model's requested duration was
   * clamped to the 8–30s ceiling, so the card can tell the director instead of
   * silently truncating.
   */
  durationClampedFrom?: number;
  /** The emotion this shot carries (e.g. "guilt", "resolve"). */
  emotion?: string;
  /**
   * The dramatic function this shot serves in the sequence:
   * Establish / Reveal / Power / Pressure / Detail / Reaction / Shift /
   * Impact / Aftermath / Exit.
   */
  shotFunction?: string;
}

export interface VideoProject {
  id: string;
  name: string;
  customInstructions: string;
  status: ProjectStatus;
  storyBible: StoryBible;
  shots: VideoShot[];
  chatHistory: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  /**
   * Script treatment confirmed during project creation (Part 3). When
   * present, BootstrapFlow seeds Stage 1 from this instead of generating a
   * fresh one, and opens directly on Stage 2. Cleared once the director
   * revises/reconfirms Stage 1 inside the full wizard.
   */
  draftScriptOverview?: ScriptTreatment | null;
  /**
   * Phase 2 — the director picks a target platform before any shot is
   * drafted. Every subsequent shot is written for that platform's constraints.
   * Optional for backward compatibility: old projects without a platform set
   * fall back to generic behavior.
   */
  targetPlatform?: VideoTargetPlatform | null;
  /**
   * Phase 2 — only used when targetPlatform === 'higgsfield'. Higgsfield is a
   * routing layer over other models; the director picks the underlying model
   * here so the drafting AI knows the real constraints.
   */
  targetPlatformSubModel?: string | null;
  /**
   * Phase B — Story → Script → Screenplay → Direction pipeline.
   * Optional for backward compatibility with pre-Phase-B projects.
   */
  storyTreatment?: StoryTreatment | null;
  scriptDialogue?: ScriptDialogueDraft | null;
  screenplay?: ScreenplayScene[] | null;
  directionPlan?: DirectionPlan | null;
}

export type ThinkingOrbState =
  | 'working'
  | 'searching'
  | 'solving'
  | 'connecting'
  | 'weaving'
  | 'composing'
  | 'shaping'
  | 'breathing'
  | 'listening';
