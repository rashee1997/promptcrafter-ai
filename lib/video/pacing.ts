// Video Prompt Studio — Phase 7: pacing analysis.
// Computes total runtime, average shot length, rhythm graph data,
// and flags runs of identically-lengthed shots for the pacing graph.

import type { VideoShot, StoryTreatment } from '@/types/video';

// ── Shot pacing data point ─────────────────────────────────────────────────

export interface ShotPacingPoint {
  /** 1-based shot number. */
  shotNumber: number;
  /** Duration in seconds. */
  duration: number;
  /** Shot function tag (Establish, Reveal, etc.) or null. */
  shotFunction: string | null;
  /** Scene number, if assigned. */
  sceneNumber: number | null;
  /** Emotion, if assigned. */
  emotion: string | null;
  /** Index in the original sorted shots array. */
  index: number;
}

// ── Rhythm run ──────────────────────────────────────────────────────────────

export interface RhythmRun {
  /** Duration value shared across the run. */
  duration: number;
  /** 0-based start index in the pacing points array. */
  start: number;
  /** 0-based end index (inclusive). */
  end: number;
  /** Number of consecutive shots with the same duration. */
  length: number;
}

// ── Pacing summary ──────────────────────────────────────────────────────────

export interface PacingSummary {
  /** All confirmed shots as pacing data points, ordered by shot number. */
  points: ShotPacingPoint[];
  /** Total runtime in seconds across all confirmed shots. */
  totalDuration: number;
  /** Average shot length in seconds (0 when no shots). */
  averageDuration: number;
  /** Shortest shot duration (0 when no shots). */
  minDuration: number;
  /** Longest shot duration (0 when no shots). */
  maxDuration: number;
  /** Standard deviation of durations. */
  stdDeviation: number;
  /** Runs of ≥2 consecutive shots with the same duration. */
  rhythmRuns: RhythmRun[];
  /** Whether any rhythm run exists (convenience flag for UI). */
  hasRhythmAnomaly: boolean;
  /** Number of confirmed shots. */
  shotCount: number;
}

// ── Act breakdown ───────────────────────────────────────────────────────────

export interface ActBreakdown {
  actNumber: 1 | 2 | 3;
  title: string;
  /** Shots belonging to this act (by index into pacing points). */
  shotIndices: number[];
  /** Total duration of this act in seconds. */
  totalDuration: number;
  /** Average shot length within this act. */
  averageDuration: number;
  /** Cut frequency: shots per second (inverse of average duration). */
  cutFrequency: number;
}

// ── Core analysis ───────────────────────────────────────────────────────────

/**
 * Analyzes the pacing of confirmed shots in a video project.
 * Pure function — no side effects.
 */
export function analyzePacing(shots: VideoShot[]): PacingSummary {
  const confirmed = shots
    .filter((s) => s.confirmed)
    .sort((a, b) => a.shotNumber - b.shotNumber);

  const points: ShotPacingPoint[] = confirmed.map((s, i) => ({
    shotNumber: s.shotNumber,
    duration: s.durationSeconds || 0,
    shotFunction: s.shotFunction ?? null,
    sceneNumber: s.sceneNumber ?? null,
    emotion: s.emotion ?? null,
    index: i,
  }));

  const durations = points.map((p) => p.duration);
  const totalDuration = durations.reduce((sum, d) => sum + d, 0);
  const shotCount = durations.length;
  const averageDuration = shotCount > 0 ? totalDuration / shotCount : 0;
  const minDuration = shotCount > 0 ? Math.min(...durations) : 0;
  const maxDuration = shotCount > 0 ? Math.max(...durations) : 0;

  // Standard deviation
  const variance =
    shotCount > 1
      ? durations.reduce((sum, d) => sum + (d - averageDuration) ** 2, 0) /
        shotCount
      : 0;
  const stdDeviation = Math.sqrt(variance);

  // Detect runs of identical durations
  const rhythmRuns = detectRhythmRuns(durations);

  return {
    points,
    totalDuration,
    averageDuration,
    minDuration,
    maxDuration,
    stdDeviation,
    rhythmRuns,
    hasRhythmAnomaly: rhythmRuns.length > 0,
    shotCount,
  };
}

/**
 * Detects runs of ≥2 consecutive shots with the same duration.
 */
function detectRhythmRuns(durations: number[]): RhythmRun[] {
  const runs: RhythmRun[] = [];
  if (durations.length < 2) return runs;

  let runStart = 0;
  for (let i = 1; i <= durations.length; i++) {
    const isSame = i < durations.length && durations[i] === durations[i - 1];
    if (!isSame) {
      const runLength = i - runStart;
      if (runLength >= 2) {
        runs.push({
          duration: durations[runStart],
          start: runStart,
          end: i - 1,
          length: runLength,
        });
      }
      runStart = i;
    }
  }
  return runs;
}

// ── Act breakdown from Story Treatment ──────────────────────────────────────

/**
 * Breaks down shot pacing by act structure from the Story Treatment.
 * When no story treatment is available, returns a single act covering all shots.
 */
export function analyzeActBreakdown(
  points: ShotPacingPoint[],
  storyTreatment?: StoryTreatment | null,
): ActBreakdown[] {
  if (!storyTreatment?.acts?.length || points.length === 0) {
    const totalDuration = points.reduce((sum, p) => sum + p.duration, 0);
    return [
      {
        actNumber: 1,
        title: 'Full sequence',
        shotIndices: points.map((_, i) => i),
        totalDuration,
        averageDuration: points.length > 0 ? totalDuration / points.length : 0,
        cutFrequency: totalDuration > 0 ? points.length / totalDuration : 0,
      },
    ];
  }

  const acts = storyTreatment.acts;
  const totalBeats = acts.reduce((sum, a) => sum + a.beats.length, 0);
  const pointsPerBeat = points.length / Math.max(totalBeats, 1);

  const breakdowns: ActBreakdown[] = [];
  let pointCursor = 0;

  for (const act of acts) {
    const beatsInAct = act.beats.length;
    const shotsInAct = Math.round(beatsInAct * pointsPerBeat);
    const startIdx = pointCursor;
    const endIdx = Math.min(startIdx + shotsInAct, points.length);
    const actPoints = points.slice(startIdx, endIdx);
    const totalDuration = actPoints.reduce((sum, p) => sum + p.duration, 0);

    breakdowns.push({
      actNumber: act.act,
      title: act.title || `Act ${act.act}`,
      shotIndices: actPoints.map((_, i) => startIdx + i),
      totalDuration,
      averageDuration:
        actPoints.length > 0 ? totalDuration / actPoints.length : 0,
      cutFrequency:
        totalDuration > 0 ? actPoints.length / totalDuration : 0,
    });

    pointCursor = endIdx;
  }

  return breakdowns;
}

// ── Energy curve ────────────────────────────────────────────────────────────

/**
 * Computes an energy curve for the sequence based on shot pacing.
 * Energy is derived from cut frequency (shorter shots = higher energy)
 * and shot function dramatic weight.
 */
export function computeEnergyCurve(points: ShotPacingPoint[]): number[] {
  if (points.length === 0) return [];

  const maxDuration = Math.max(...points.map((p) => p.duration), 1);

  // Dramatic function weight map — Impact and Power shots are high energy,
  // Detail and Exit shots are low energy.
  const FUNCTION_WEIGHT: Record<string, number> = {
    Establish: 0.3,
    Reveal: 0.5,
    Power: 0.9,
    Pressure: 0.8,
    Detail: 0.2,
    Reaction: 0.5,
    Shift: 0.7,
    Impact: 1.0,
    Aftermath: 0.4,
    Exit: 0.2,
  };

  return points.map((p) => {
    // Duration energy: shorter = higher energy (inverted)
    const durationEnergy = 1 - p.duration / maxDuration;
    // Function weight
    const functionWeight = p.shotFunction
      ? FUNCTION_WEIGHT[p.shotFunction] ?? 0.5
      : 0.5;
    // Blend: 60% duration, 40% dramatic function
    return durationEnergy * 0.6 + functionWeight * 0.4;
  });
}
