// Video Prompt Studio — Phase 5 external voice pipeline.
// Generates audio per dialogue line via the character's CharacterVoice and
// produces a lip-sync-ready package (audio file + instructions for the
// director's downstream sync tool). PromptCrafter prepares the asset — it
// does not render video, consistent with the app's scope everywhere else.
//
// This pipeline is only invoked for platforms where nativeDialogueAudio is
// false. Native-audio platforms (Veo 3.1, Kling 3.0, Seedance 2.5) lean on
// their own built-in dialogue audio — no external voice track is needed.

import type {
  CharacterVoice,
  DialogueLine,
  PlatformSpec,
  VideoCharacter,
  VideoShot,
} from '@/types/video';

// ── Voice resolution ───────────────────────────────────────────────────────

/**
 * Resolves the CharacterVoice for a dialogue line's speaker.
 * Falls back to the character's plain voiceTone string wrapped in a
 * platform-native VoiceNote when no structured voice asset is attached.
 */
export function resolveCharacterVoice(
  speakerName: string,
  characters: VideoCharacter[],
): CharacterVoice | null {
  const char = characters.find(
    (c) => c.name.trim().toLowerCase() === speakerName.trim().toLowerCase(),
  );
  if (!char) return null;
  if (char.voice) return char.voice;
  if (char.voiceTone?.trim()) {
    return {
      id: `fallback-${char.id}`,
      provider: 'platform-native',
      toneNotes: char.voiceTone.trim(),
    };
  }
  return null;
}

// ── Per-line audio spec ────────────────────────────────────────────────────

/**
 * A single audio-generation instruction for one dialogue line.
 * The director's downstream tool (ElevenLabs, Fish Audio, etc.) receives
 * this spec and produces the audio file. PromptCrafter does not call the
 * voice API directly — it prepares the asset spec.
 */
export interface VoiceLineSpec {
  /** Unique identifier for this audio line (used to reference it in sync). */
  lineId: string;
  /** Exact Story Bible speaker name. */
  speakerName: string;
  /** Character voice resolution used for this line. */
  voice: CharacterVoice | null;
  /** The spoken line text. */
  text: string;
  /** Delivery direction (performance instruction for the voice actor / TTS). */
  delivery: string;
  /** Approximate target duration in milliseconds (derived from clip length). */
  targetDurationMs: number;
}

/**
 * A lip-sync-ready package for a single shot: all audio line specs plus
 * sync instructions for the downstream director tool.
 */
export interface VoiceTrackPackage {
  /** Shot id this voice track belongs to. */
  shotId: string;
  /** Shot number in the storyboard sequence. */
  shotNumber: number;
  /** The target platform — determines sync convention. */
  platformId: string;
  /** True when the platform generates its own audio (no package needed). */
  nativeAudio: boolean;
  /** Per-line audio generation specs (empty when nativeAudio is true). */
  lines: VoiceLineSpec[];
  /**
   * Sync instructions for the downstream tool. When nativeAudio is true,
   * this is a passthrough note explaining that the platform handles it.
   */
  syncInstructions: string;
}

// ── Pipeline entry point ───────────────────────────────────────────────────

/**
 * Builds a voice-track package for a shot. When the target platform has
 * native dialogue audio, returns a lightweight passthrough with no line
 * specs. When the platform lacks native audio, produces a full package
 * of per-line VoiceLineSpec entries the director can send to a voice
 * service (ElevenLabs, Fish Audio, etc.) for generation.
 */
export function buildVoiceTrackPackage(
  shot: VideoShot,
  characters: VideoCharacter[],
  platformSpec: PlatformSpec | undefined,
): VoiceTrackPackage {
  const nativeAudio = platformSpec?.nativeDialogueAudio ?? false;

  if (nativeAudio || !shot.dialogue?.length) {
    return {
      shotId: shot.id,
      shotNumber: shot.shotNumber,
      platformId: platformSpec?.id ?? 'unknown',
      nativeAudio: true,
      lines: [],
      syncInstructions: platformSpec
        ? `${platformSpec.label} generates dialogue audio inline. No external voice track is needed — the platform's built-in audio engine handles lip-sync and voice assignment.`
        : 'No platform spec available. Dialogue audio routing is unknown.',
    };
  }

  // Approximate ms per line: divide clip duration evenly, capped at ~3 words/sec.
  const dialogueCount = shot.dialogue!.length;
  const clipMs = (shot.durationSeconds || 12) * 1000;
  const msPerLine = Math.floor(clipMs / dialogueCount);

  const lines: VoiceLineSpec[] = shot.dialogue!.map((d, idx) => {
    const voice = resolveCharacterVoice(d.speaker, characters);
    const wordCount = d.line.trim().split(/\s+/).length;
    const approxDurationMs = Math.min(msPerLine, Math.ceil(wordCount * 350));

    return {
      lineId: `${shot.id}-line-${idx}`,
      speakerName: d.speaker,
      voice,
      text: d.line,
      delivery: d.tone || voice?.toneNotes || 'natural, conversational',
      targetDurationMs: approxDurationMs,
    };
  });

  const voiceNames = [...new Set(lines.map((l) => l.speakerName))].join(', ');
  const uniqueVoices = [...new Set(lines.filter((l) => l.voice?.id).map((l) => l.voice!.id))];

  return {
    shotId: shot.id,
    shotNumber: shot.shotNumber,
    platformId: platformSpec?.id ?? 'unknown',
    nativeAudio: false,
    lines,
    syncInstructions: [
      `Voice track for Shot ${shot.shotNumber} (${platformSpec?.label ?? 'unknown platform'}).`,
      `Speakers: ${voiceNames}.`,
      uniqueVoices.length > 0
        ? `${uniqueVoices.length} distinct voice profile${uniqueVoices.length === 1 ? '' : 's'} attached — two characters with different voices are audibly distinguishable.`
        : 'No structured voice profiles attached — voices derived from tone notes.',
      'Generate each line as a separate audio clip, then use the targetDurationMs to place it on the timeline.',
      'Lip-sync the generated audio to the character\'s mouth movement in the video output.',
    ].join(' '),
  };
}

// ── Bulk package builder ───────────────────────────────────────────────────

/**
 * Builds voice-track packages for all dialogue-bearing shots in a project.
 * Useful for the "export all voice tracks" action or the batch voice-panel.
 */
export function buildAllVoiceTrackPackages(
  shots: VideoShot[],
  characters: VideoCharacter[],
  platformSpec: PlatformSpec | undefined,
): VoiceTrackPackage[] {
  return shots
    .filter((s) => s.dialogue && s.dialogue.length > 0)
    .map((shot) => buildVoiceTrackPackage(shot, characters, platformSpec));
}
