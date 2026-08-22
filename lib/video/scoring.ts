// Video Prompt Studio — Phase 7: music/SFX prompt generation.
// Derives a music brief from actual shot pacing (cut frequency drives the
// energy curve, not just a mood word), tempo suggestions at act breaks,
// and a cue sheet mapping stings to transitions. Formatted as a ready-to-paste
// prompt for an external music tool. No audio rendering happens in-app.

import type { VideoProject, VideoShot, StoryTreatment } from '@/types/video';
import {
  type PacingSummary,
  type ShotPacingPoint,
  type ActBreakdown,
  analyzePacing,
  analyzeActBreakdown,
  computeEnergyCurve,
} from './pacing';
import { buildAllVoiceTrackPackages } from './voice-pipeline';
import { getPlatformSpec } from './platforms';

// ── Music brief types ───────────────────────────────────────────────────────

export interface CueSheetEntry {
  /** Cue number (sequential). */
  cueNumber: number;
  /** Shot number this cue is tied to. */
  shotNumber: number;
  /** Timecode start (MM:SS format). */
  timecodeStart: string;
  /** Duration of the cue. */
  duration: number;
  /** Type of cue. */
  cueType:
    | 'ambient-bed'
    | 'sting'
    | 'hit'
    | 'build'
    | 'release'
    | 'transition'
    | 'silence';
  /** Description of what happens musically. */
  description: string;
  /** Energy level 0-1. */
  energy: number;
  /** Suggested BPM range. */
  bpmRange: string;
  /** Whether dialogue is present (duck the music). */
  hasDialogue: boolean;
}

export interface TempoSuggestion {
  /** Act number. */
  actNumber: number;
  /** Act title. */
  actTitle: string;
  /** Suggested BPM for this act. */
  bpm: number;
  /** Musical description of the act's feel. */
  feel: string;
  /** Cut frequency for this act (shots per second). */
  cutFrequency: number;
  /** Time signature suggestion. */
  timeSignature: string;
}

export interface MusicBrief {
  /** The project name. */
  projectName: string;
  /** Total runtime in seconds. */
  totalDuration: number;
  /** Overall energy arc description. */
  energyArc: string;
  /** Suggested overall BPM range. */
  overallBpmRange: string;
  /** Suggested genre/style. */
  genre: string;
  /** Per-act tempo suggestions. */
  tempoSuggestions: TempoSuggestion[];
  /** Full cue sheet. */
  cueSheet: CueSheetEntry[];
  /** Musical mood tags. */
  moodTags: string[];
  /** Key and mode suggestion. */
  keySignature: string;
  /** Instrumentation suggestions. */
  instrumentation: string[];
  /** What to avoid musically. */
  avoidances: string[];
  /** Voice track summary (which shots need audio ducking). */
  voiceTrackNotes: string[];
  /** The prompt text ready to paste into an external music tool. */
  promptText: string;
}

// ── Energy arc analysis ─────────────────────────────────────────────────────

interface EnergySegment {
  label: string;
  start: number;
  end: number;
  avgEnergy: number;
  trend: 'rising' | 'falling' | 'plateau';
}

function describeEnergyArc(energyCurve: number[]): string {
  if (energyCurve.length === 0) return 'No shots to analyze.';
  if (energyCurve.length === 1) return 'Single shot — flat energy.';

  const segments = segmentEnergy(energyCurve);
  if (segments.length === 0) return 'Relatively flat energy throughout.';

  const parts = segments.map(
    (s) =>
      `${s.label}: ${s.trend === 'rising' ? '↗ building' : s.trend === 'falling' ? '↘ easing' : '→ steady'} (energy ${s.avgEnergy.toFixed(2)})`
  );
  return parts.join('; ') + '.';
}

function segmentEnergy(curve: number[]): EnergySegment[] {
  if (curve.length < 2) return [];

  const windowSize = Math.max(2, Math.ceil(curve.length / 4));
  const segments: EnergySegment[] = [];

  for (let i = 0; i < curve.length; i += windowSize) {
    const end = Math.min(i + windowSize, curve.length);
    const window = curve.slice(i, end);
    const avg = window.reduce((s, v) => s + v, 0) / window.length;
    const prevAvg =
      segments.length > 0 ? segments[segments.length - 1].avgEnergy : avg;

    let trend: EnergySegment['trend'] = 'plateau';
    if (avg > prevAvg + 0.08) trend = 'rising';
    else if (avg < prevAvg - 0.08) trend = 'falling';

    segments.push({
      label: `Shots ${i + 1}–${end}`,
      start: i,
      end: end - 1,
      avgEnergy: avg,
      trend,
    });
  }

  return segments;
}

// ── BPM calculation ─────────────────────────────────────────────────────────

function bpmFromCutFrequency(cutFrequency: number): number {
  // Cut frequency = shots/second. Higher → faster BPM.
  // 0.05 shots/sec (20s avg) → ~60 BPM
  // 0.125 shots/sec (8s avg) → ~90 BPM
  // 0.2 shots/sec (5s avg) → ~120 BPM
  // 0.5 shots/sec (2s avg) → ~160 BPM
  const bpm = 40 + cutFrequency * 500;
  return Math.round(Math.min(180, Math.max(50, bpm)));
}

function timeSignatureFromBpm(bpm: number): string {
  if (bpm >= 130) return '4/4 (driving)';
  if (bpm >= 100) return '4/4';
  if (bpm >= 80) return '3/4 or 6/8 (flowing)';
  return '4/4 (spacious)';
}

// ── Cue sheet generation ────────────────────────────────────────────────────

function generateCueSheet(
  points: ShotPacingPoint[],
  energyCurve: number[],
  charactersWithDialogue: Set<string>,
): CueSheetEntry[] {
  const cues: CueSheetEntry[] = [];
  let timecode = 0;
  let cueNumber = 1;

  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const energy = energyCurve[i] ?? 0.5;
    const prevEnergy = i > 0 ? (energyCurve[i - 1] ?? 0.5) : 0.5;
    const hasDialogue = charactersWithDialogue.size > 0 && energy < 0.5;

    const minutes = Math.floor(timecode / 60);
    const seconds = Math.floor(timecode % 60);
    const timecodeStart = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    let cueType: CueSheetEntry['cueType'] = 'ambient-bed';
    let description = '';

    // Determine cue type based on shot function and energy change
    if (point.shotFunction === 'Impact') {
      cueType = 'hit';
      description = `Sharp musical hit on impact — dramatic accent`;
    } else if (point.shotFunction === 'Shift') {
      cueType = 'sting';
      description = `Transition sting — tonal shift marking the turn`;
    } else if (energy > prevEnergy + 0.15) {
      cueType = 'build';
      description = `Rising tension — energy climbing toward next moment`;
    } else if (energy < prevEnergy - 0.15) {
      cueType = 'release';
      description = `Emotional release — energy ebbing`;
    } else if (point.shotFunction === 'Exit') {
      cueType = 'release';
      description = `Fading tail — resolution and closure`;
    } else if (point.shotFunction === 'Establish') {
      cueType = 'ambient-bed';
      description = `Establishing ambient bed — sets the world`;
    } else if (point.shotFunction === 'Detail') {
      cueType = 'ambient-bed';
      description = `Quiet underscore — detail and texture`;
    } else if (point.shotFunction === 'Reveal') {
      cueType = 'sting';
      description = `Reveal sting — dramatic unveiling`;
    } else if (point.duration >= 20) {
      cueType = 'ambient-bed';
      description = `Extended ambient bed — slow, immersive`;
    } else if (point.duration <= 8) {
      cueType = 'hit';
      description = `Quick hit — fast cut accent`;
    } else {
      cueType = 'ambient-bed';
      description = `Continuing ambient bed`;
    }

    // BPM suggestion based on energy
    const bpmLow = Math.round(60 + energy * 80);
    const bpmHigh = bpmLow + 15;

    cues.push({
      cueNumber,
      shotNumber: point.shotNumber,
      timecodeStart,
      duration: point.duration,
      cueType,
      description,
      energy: Math.round(energy * 100) / 100,
      bpmRange: `${bpmLow}–${bpmHigh}`,
      hasDialogue,
    });

    timecode += point.duration;
    cueNumber++;
  }

  return cues;
}

// ── Music prompt generation ─────────────────────────────────────────────────

function generatePromptText(brief: MusicBrief): string {
  const lines: string[] = [];

  lines.push(`# Music Brief: ${brief.projectName}`);
  lines.push(`Duration: ${Math.floor(brief.totalDuration / 60)}m ${brief.totalDuration % 60}s`);
  lines.push(`Genre: ${brief.genre}`);
  lines.push(`Overall BPM range: ${brief.overallBpmRange}`);
  lines.push(`Key: ${brief.keySignature}`);
  lines.push(`Energy arc: ${brief.energyArc}`);
  lines.push('');

  if (brief.moodTags.length > 0) {
    lines.push(`Mood: ${brief.moodTags.join(', ')}`);
    lines.push('');
  }

  lines.push('## Instrumentation');
  brief.instrumentation.forEach((inst) => lines.push(`- ${inst}`));
  lines.push('');

  if (brief.avoidances.length > 0) {
    lines.push('## Avoid');
    brief.avoidances.forEach((a) => lines.push(`- ${a}`));
    lines.push('');
  }

  lines.push('## Act Tempo Map');
  for (const tempo of brief.tempoSuggestions) {
    lines.push(
      `Act ${tempo.actNumber} (${tempo.actTitle}): ${tempo.bpm} BPM, ${tempo.timeSignature} — ${tempo.feel}`
    );
  }
  lines.push('');

  lines.push('## Cue Sheet');
  for (const cue of brief.cueSheet) {
    lines.push(
      `[${cue.timecodeStart}] Shot ${cue.shotNumber} (${cue.duration}s) — ${cue.cueType}: ${cue.description} ${cue.hasDialogue ? '[duking under dialogue]' : ''}`
    );
  }

  if (brief.voiceTrackNotes.length > 0) {
    lines.push('');
    lines.push('## Voice Track Notes');
    brief.voiceTrackNotes.forEach((n) => lines.push(`- ${n}`));
  }

  return lines.join('\n');
}

// ── Genre/key/instrumentation derivation ────────────────────────────────────

function deriveGenre(
  avgDuration: number,
  energyCurve: number[],
  styleLook?: string,
): string {
  const avgEnergy =
    energyCurve.length > 0
      ? energyCurve.reduce((s, v) => s + v, 0) / energyCurve.length
      : 0.5;

  if (avgDuration <= 8 && avgEnergy > 0.7) return 'Electronic / Synthwave';
  if (avgDuration <= 8) return 'Indie Rock / Alt-Pop';
  if (avgDuration >= 18 && avgEnergy < 0.4) return 'Ambient / Drone';
  if (avgDuration >= 15 && avgEnergy < 0.5) return 'Cinematic Orchestral';
  if (avgEnergy > 0.7) return 'Cinematic Hybrid (orchestral + electronic)';

  const style = (styleLook ?? '').toLowerCase();
  if (style.includes('sci-fi') || style.includes('cyber') || style.includes('neon'))
    return 'Sci-Fi Ambient / Synthwave';
  if (style.includes('period') || style.includes('vintage') || style.includes('retro'))
    return 'Period-appropriate Orchestral';
  if (style.includes('noir') || style.includes('dark'))
    return 'Dark Jazz / Film Noir Score';
  if (style.includes('horror') || style.includes('tense'))
    return 'Horror / Tension Strings';

  return 'Cinematic Orchestral';
}

function deriveMoodTags(
  energyCurve: number[],
  points: ShotPacingPoint[],
): string[] {
  const tags: string[] = [];
  const avgEnergy =
    energyCurve.length > 0
      ? energyCurve.reduce((s, v) => s + v, 0) / energyCurve.length
      : 0.5;

  if (avgEnergy > 0.7) tags.push('intense', 'driving');
  else if (avgEnergy > 0.5) tags.push('focused', 'purposeful');
  else tags.push('contemplative', 'atmospheric');

  // Check for emotion keywords in shots
  const emotions = points
    .map((p) => (p.emotion ?? '').toLowerCase())
    .filter(Boolean);
  if (emotions.some((e) => /dread|fear|tense|anxi/.test(e))) tags.push('tense');
  if (emotions.some((e) => /joy|hope|warm|love/.test(e))) tags.push('hopeful');
  if (emotions.some((e) => /anger|rage|fury/.test(e))) tags.push('aggressive');
  if (emotions.some((e) => /sad|grief|loss|melancholy/.test(e)))
    tags.push('melancholic');

  return [...new Set(tags)];
}

function deriveInstrumentation(avgDuration: number, avgEnergy: number): string[] {
  const inst: string[] = [];

  if (avgDuration <= 10) {
    inst.push('Synth pads', 'Percussive elements', 'Pulse bass');
  } else if (avgDuration >= 18) {
    inst.push('String section', 'Solo piano', 'Atmospheric pads');
  } else {
    inst.push('String section', 'Synth textures', 'Percussive elements');
  }

  if (avgEnergy > 0.7) {
    inst.push('Taiko / cinematic drums', 'Brass stabs');
  }

  return inst;
}

function deriveKeySignature(avgEnergy: number): string {
  if (avgEnergy > 0.75) return 'D minor (energetic, cinematic)';
  if (avgEnergy > 0.55) return 'A minor (focused, versatile)';
  if (avgEnergy > 0.35) return 'C major / A minor (balanced)';
  return 'E♭ minor (deep, contemplative)';
}

function deriveAvoidances(avgDuration: number, avgEnergy: number): string[] {
  const avoid: string[] = ['Cheesy synth presets', 'Generic stock music feel'];

  if (avgDuration >= 15) {
    avoid.push('Aggressive percussion that breaks the contemplative pace');
  }
  if (avgDuration <= 8) {
    avoid.push('Overly long pads that drag the tempo down');
  }
  if (avgEnergy > 0.6) {
    avoid.push('Static, unchanging loops');
  }

  return avoid;
}

// ── Main brief builder ──────────────────────────────────────────────────────

/**
 * Builds a complete music brief for a video project based on shot pacing,
 * act structure, and dialogue presence. No audio rendering — this produces
 * a text prompt the director can paste into an external music tool.
 */
export function buildMusicBrief(project: VideoProject): MusicBrief {
  const pacing = analyzePacing(project.shots);
  const energyCurve = computeEnergyCurve(pacing.points);
  const actBreakdown = analyzeActBreakdown(
    pacing.points,
    project.storyTreatment,
  );

  // Identify shots with dialogue for voice track notes
  const shotsWithDialogue = project.shots.filter(
    (s) => s.confirmed && s.dialogue && s.dialogue.length > 0,
  );
  const charactersWithDialogue = new Set(
    shotsWithDialogue.flatMap((s) => (s.dialogue ?? []).map((d) => d.speaker)),
  );

  // Voice track packages
  const platformSpec = project.targetPlatform
    ? getPlatformSpec(project.targetPlatform)
    : undefined;
  const voicePackages = buildAllVoiceTrackPackages(
    project.shots,
    project.storyBible?.characters ?? [],
    platformSpec,
  );
  const voiceTrackNotes = voicePackages
    .filter((vp) => !vp.nativeAudio && vp.lines.length > 0)
    .map(
      (vp) =>
        `Shot ${vp.shotNumber}: ${vp.lines.length} voice line(s) — duck music under dialogue`,
    );

  // Derive musical properties
  const genre = deriveGenre(
    pacing.averageDuration,
    energyCurve,
    project.storyBible?.style?.lookAndMood,
  );
  const moodTags = deriveMoodTags(energyCurve, pacing.points);
  const instrumentation = deriveInstrumentation(
    pacing.averageDuration,
    energyCurve.reduce((s, v) => s + v, 0) / Math.max(energyCurve.length, 1),
  );
  const keySignature = deriveKeySignature(
    energyCurve.reduce((s, v) => s + v, 0) / Math.max(energyCurve.length, 1),
  );
  const avoidances = deriveAvoidances(
    pacing.averageDuration,
    energyCurve.reduce((s, v) => s + v, 0) / Math.max(energyCurve.length, 1),
  );

  // Tempo suggestions per act
  const tempoSuggestions: TempoSuggestion[] = actBreakdown.map((act) => ({
    actNumber: act.actNumber,
    actTitle: act.title,
    bpm: bpmFromCutFrequency(act.cutFrequency),
    feel:
      act.cutFrequency > 0.12
        ? 'Fast-paced, driving'
        : act.cutFrequency > 0.07
          ? 'Moderate, flowing'
          : 'Slow, spacious',
    cutFrequency: Math.round(act.cutFrequency * 1000) / 1000,
    timeSignature: timeSignatureFromBpm(bpmFromCutFrequency(act.cutFrequency)),
  }));

  // Overall BPM range
  const overallBpm = bpmFromCutFrequency(
    pacing.totalDuration > 0 ? pacing.shotCount / pacing.totalDuration : 0.1,
  );
  const overallBpmRange = `${Math.max(50, overallBpm - 10)}–${Math.min(180, overallBpm + 15)}`;

  // Cue sheet
  const cueSheet = generateCueSheet(
    pacing.points,
    energyCurve,
    charactersWithDialogue,
  );

  // Energy arc description
  const energyArc = describeEnergyArc(energyCurve);

  const brief: MusicBrief = {
    projectName: project.name,
    totalDuration: pacing.totalDuration,
    energyArc,
    overallBpmRange,
    genre,
    tempoSuggestions,
    cueSheet,
    moodTags,
    keySignature,
    instrumentation,
    avoidances,
    voiceTrackNotes,
    promptText: '', // Generated below
  };

  // Generate the ready-to-paste prompt text
  brief.promptText = generatePromptText(brief);

  return brief;
}
