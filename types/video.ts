// Video Prompt Studio — Phase 1 data contracts.
// Shared end-to-end models for projects, story bibles, characters, scene
// locations, shot items, continuity handoffs, and model dialects.

export type VideoDialect = 'veo' | 'higgsfield' | 'kling' | 'seedance';
export type ProjectStatus = 'draft' | 'active';

/**
 * Phase 3 — AI-chosen prompt form per shot. Structure follows the shot
 * instead of forcing every shot through the same 6-section template.
 * Derived from practitioner examples (awesome-seedance collection) where
 * genuinely different shots take genuinely different shapes.
 */
export type PromptForm =
  | 'flowing-prose'
  | 'minimal-labeled'
  | 'time-coded'
  | 'reference-directive';

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
   * Phase 5 — whether this platform generates its own dialogue audio
   * inline. When true, dialogue audio is baked into the video model's
   * output (no external voice pipeline needed). When false, each
   * dialogue line should be routed through the external voice pipeline
   * to produce a separate audio + lip-sync package.
   */
  nativeDialogueAudio: boolean;
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
 *
 * When a structure framework is selected, each beat carries a `beatId`
 * that maps to the framework's named beat (e.g. 'catalyst', 'midpoint').
 * The `purpose` field contains the beat's dramatic requirement so the
 * director can verify the AI did its job.
 */
export interface StoryTreatment {
  logline: string;
  premise: string;
  emotionalArc: string;
  theme: string;
  /** Structure framework used to generate this treatment. Absent = AI chose freely. */
  frameworkId?: string;
  acts: {
    act: 1 | 2 | 3;
    title: string;
    beats: {
      /** Matched beat ID from the structure framework (e.g. 'catalyst'). Absent = freeform. */
      beatId?: string;
      /** Name of the story beat (e.g. 'Catalyst'). Always present. */
      name?: string;
      /** What this beat must accomplish — the framework's purpose text. */
      purpose?: string;
      /** The AI-generated content for this beat (replaces the old plain string). */
      text: string;
    }[];
  }[];
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

export interface CharacterWardrobeLook {
  id: string;
  label: string;              // "Act 1 — work uniform", "Act 3 — rain-soaked"
  description: string;        // specific, verbatim wardrobe detail
  referenceImageId?: string;  // optional look-specific image (StoryBibleCharacterImage.id)
}

/**
 * Phase 5 — voice asset attached to a character, mirroring how character
 * images anchor visual identity. The voice is a Story Bible asset: it
 * travels with the character across shots and into the external voice
 * pipeline when the target platform lacks native dialogue audio.
 */
export interface CharacterVoice {
  id: string;
  /**
   * Where this voice comes from. 'elevenlabs' = external voice-cloning
   * service; 'platform-native' = the director is relying on the target
   * platform's built-in voice generation (toneNotes only, no audio ref).
   */
  provider: 'elevenlabs' | 'platform-native';
  /** ElevenLabs voice id or equivalent service-side identifier. */
  voiceId?: string;
  /** Rich free-text delivery notes — always present, even without an audio ref. */
  toneNotes: string;
  /**
   * Story Bible image id for a reference audio sample (upload-to-clone
   * flow). Optional — voice can exist as toneNotes only.
   */
  referenceAudioId?: string;
}

export interface VideoCharacter {
  id: string;
  name: string;
  role: string;
  appearance: string;
  wardrobe: string;
  voiceTone: string;
  /**
   * Phase 5 — structured voice asset. Optional so characters persisted
   * before Phase 5 stay fully readable. When present, the external voice
   * pipeline uses this to generate per-line audio; when absent, the
   * pipeline falls back to the plain voiceTone string.
   */
  voice?: CharacterVoice;
  /**
   * Wardrobe variants — selectable per shot. Identity (face/build) stays
   * locked to the character's reference image; only clothing changes.
   * Optional for backward compat: characters without looks use the top-level
   * `wardrobe` field as-is.
   */
  wardrobeLooks?: CharacterWardrobeLook[];
  /** The look active when no shot-level override is set. */
  defaultLookId?: string;
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

/**
 * Structured result from vision analysis of a character reference image.
 * Returned by the analyze-character-image server function and optionally
 * auto-filled onto the VideoCharacter fields after upload.
 */
export interface CharacterImageAnalysis {
  /** Concise appearance summary: age range, build, face shape, skin tone. */
  appearance: string;
  /** Build details: height impression, body type. */
  build: string;
  /** Hair detail: color, length, style. */
  hairDetail: string;
  /** Distinguishing features: scars, tattoos, glasses, accessories. */
  distinguishingFeatures: string;
  /** Wardrobe visible in the reference image. */
  apparentWardrobe: string;
  /** Overall quality assessment of the reference image. */
  imageQualityNote?: string;
}

export interface VideoLocation {
  id: string;
  name: string;
  description: string;
}

/**
 * Phase D4 — per-shot environmental conditions. A location's geography is
 * fixed; its conditions (time-of-day, weather, lighting, occupancy) are
 * shot-level overrides. Same rooftop bar at golden hour in shot 3 and in a
 * storm at night in shot 19 — one location record, two condition sets.
 */
export interface ShotLocationConditions {
  timeOfDay?: string;
  weather?: string;
  lightingMood?: string;
  /** empty / sparse / crowded */
  occupancy?: string;
}

export interface VideoStyle {
  lookAndMood: string;
  colorGrade: string;
  filmStock: string;
  aspectRatio: string;
  /**
   * Phase E — the curated library entry this style was derived from.
   * When present, the system prompt injects the library's promptTokens
   * and negativeTokens, and cameraVocabulary gates which camera language
   * the shot drafter may use. Optional for backward compatibility:
   * projects created before Phase E behave as if cinematic.
   */
  styleId?: string;
  /**
   * Phase E — gates camera language in the shot-drafting system prompt:
   * 'cinematic' → lens / film-stock / aperture language applies.
   * 'animated'  → framing + movement apply; no film stock or lens.
   * 'graphic'   → composition and transitions only.
   */
  cameraVocabulary?: 'cinematic' | 'animated' | 'graphic';
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
   * Phase D1 — the screenplay scene this shot belongs to. Links the shot
   * back to the scene's location and present characters so the drafting
   * system prompt can scope the Story Bible digest per-shot.
   */
  sceneNumber?: number;
  /**
   * Phase D1 — the location for THIS shot. Derived from the scene's
   * locationId; overridable when a shot cuts elsewhere.
   */
  locationId?: string;
  /**
   * Phase D1 — per-shot location conditions (time-of-day, weather, etc.).
   * The location's geography is fixed; these are shot-level overrides.
   */
  locationConditions?: ShotLocationConditions;
  /**
   * Phase D1 — per-character wardrobe look for this shot. Maps
   * characterId → CharacterWardrobeLook.id. Defaults to the character's
   * defaultLookId when absent.
   */
  wardrobeLookIds?: Record<string, string>;
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
  /**
   * Phase 3 — the AI-chosen prompt form for this shot. Determines the
   * structural shape of promptText (flowing prose, minimal labels, time-coded,
   * or reference-directive). Surfaced as a visible tag on the shot card.
   */
  promptForm?: PromptForm;
  /**
   * Phase 4 — director override for the prompt form. When set to a specific
   * form, the AI's own choice is overridden for this shot only. 'auto' or
   * absent = let the AI choose (the default behavior).
   */
  promptFormOverride?: PromptForm | 'auto';
  /**
   * Phase 4 — custom label for minimal-labeled form. When a promptForm
   * override of 'minimal-labeled' is active, this text is injected as an
   * additional label the AI should use if relevant (e.g. "Sound cue",
   * "Match-cut note").
   */
  customLabel?: string;
  /**
   * Phase 4 — per-shot platform override. Default: inherit the project's
   * chosen platform. When set, this shot is drafted for the overridden
   * platform's constraints regardless of the project default.
   */
  platformOverride?: VideoTargetPlatform;
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
  /**
   * Delivery direction — how the line is performed, not just what is
   * said. Phase 5 makes this consistently populated: "leans forward,
   * eyes narrowing, whispering" or "flat, sarcastic, arms crossed".
   * Optional for backward compat with pre-Phase-5 persisted shots, but
   * the drafting AI is now instructed to always include it.
   */
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
  /**
   * Phase D1 — the screenplay scene this shot belongs to. Overridden by
   * the scene selector in the drafting UI.
   */
  sceneNumber?: number;
  /**
   * Phase D1 — the location for this shot. Overridden by the scene
   * selector in the drafting UI.
   */
  locationId?: string;
  /**
   * Phase D1 — per-character wardrobe look for this shot.
   */
  wardrobeLookIds?: Record<string, string>;
  /**
   * Phase D4 — per-shot location conditions.
   */
  locationConditions?: ShotLocationConditions;
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
  /**
   * Phase 3 — the AI-chosen prompt form for this shot. Determines the
   * structural shape of promptText (flowing prose, minimal labels, time-coded,
   * or reference-directive). Surfaced as a visible tag on the shot card.
   */
  promptForm?: PromptForm;
  /**
   * Phase 4 — director override for the prompt form. When set to a specific
   * form, the AI's own choice is overridden for this shot only. 'auto' or
   * absent = let the AI choose.
   */
  promptFormOverride?: PromptForm | 'auto';
  /**
   * Phase 4 — custom label for minimal-labeled form.
   */
  customLabel?: string;
  /**
   * Phase 4 — per-shot platform override. Default: inherit project platform.
   */
  platformOverride?: VideoTargetPlatform;
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
  /**
   * Phase 4 — persisted director defaults for shot-level customization.
   * Once a director sets their usual controls, remember them across sessions.
   * Optional for backward compatibility: old projects without defaults use
   * the factory defaults.
   */
  directorDefaults?: DirectorDefaults;
}

/**
 * Phase 4 — the director's usual shot-level customization settings,
 * persisted so they carry across sessions and new shots.
 */
export interface DirectorDefaults {
  /** Default prompt form override for new shots ('auto' = let AI choose). */
  promptFormOverride?: PromptForm | 'auto';
  /** Default platform override for new shots (absent = inherit project platform). */
  platformOverride?: VideoTargetPlatform;
  /** Product Studio — dialect toggles (platforms to skip). */
  skippedDialects?: VideoTargetPlatform[];
  /** Product Studio — whether extension beats are enabled for chained sequences. */
  extensionBeatsEnabled?: boolean;
}

/**
 * Phase 4 — action-beat decomposer output. A described action beat is broken
 * into a reviewable ~16-cell shot breakdown: wide → shoulder-mount → ECU →
 * hero-pose rhythm, one motion per shot. Surfaced in the chat thread as
 * "Break this into an action sequence," accepted/edited/discarded before
 * anything is actually drafted.
 */
export interface ActionBeatDecomposition {
  /** The original described action beat the director submitted. */
  sourceBeat: string;
  /** The decomposed shot cells. */
  cells: ActionBeatCell[];
}

/**
 * One cell in the action-beat decomposition grid. Each cell describes
 * a single shot in the proposed action sequence.
 */
export interface ActionBeatCell {
  /** 1-based sequence number within this decomposition. */
  cellNumber: number;
  /** Framing type: wide, shoulder-mount, ECU, hero-pose, etc. */
  framing: string;
  /** The single motion/beat for this shot. */
  motion: string;
  /** Duration suggestion in seconds. */
  durationSeconds: number;
  /** Camera move suggestion. */
  cameraMove: string;
  /** Whether this cell uses identity lock (should be ALL in an action sequence). */
  usesIdentityLock: boolean;
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
