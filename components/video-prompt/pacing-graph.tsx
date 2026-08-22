'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Activity, AlertTriangle, BarChart3, TrendingUp } from 'lucide-react';
import type { VideoProject } from '@/types/video';
import {
  type PacingSummary,
  type ShotPacingPoint,
  type RhythmRun,
  type ActBreakdown,
  analyzePacing,
  analyzeActBreakdown,
  computeEnergyCurve,
} from '@/lib/video/pacing';
import { cn } from '@/lib/utils';

interface PacingGraphProps {
  project: VideoProject;
}

const BAR_HEIGHT = 48;
const BAR_GAP = 2;
const MIN_BAR_WIDTH = 18;

/**
 * Phase 7 — pacing analysis panel with a rhythm graph (duration bars + energy
 * curve overlay), flagged rhythm runs, per-act breakdown, and summary stats.
 */
export function PacingGraph({ project }: PacingGraphProps) {
  const pacing = useMemo(
    () => analyzePacing(project.shots),
    [project.shots],
  );
  const energyCurve = useMemo(
    () => computeEnergyCurve(pacing.points),
    [pacing.points],
  );
  const actBreakdown = useMemo(
    () => analyzeActBreakdown(pacing.points, project.storyTreatment),
    [pacing.points, project.storyTreatment],
  );

  if (pacing.shotCount === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-border bg-surface-card/70 backdrop-blur-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
          <Activity className="w-3.5 h-3.5 text-brand" aria-hidden="true" />
          Pacing Analysis
        </div>
      </div>

      {/* Summary stats row */}
      <div className="flex flex-wrap gap-2">
        <StatChip
          icon={<BarChart3 className="w-3 h-3 text-brand" />}
          label="Total"
          value={`${Math.floor(pacing.totalDuration / 60)}m ${pacing.totalDuration % 60}s`}
        />
        <StatChip
          icon={<TrendingUp className="w-3 h-3 text-accent" />}
          label="Avg shot"
          value={`${pacing.averageDuration.toFixed(1)}s`}
        />
        <StatChip
          icon={<Activity className="w-3 h-3 text-success" />}
          label="Range"
          value={`${pacing.minDuration}s – ${pacing.maxDuration}s`}
        />
        <StatChip
          icon={<BarChart3 className="w-3 h-3 text-text-muted" />}
          label="Std dev"
          value={`${pacing.stdDeviation.toFixed(1)}s`}
        />
      </div>

      {/* Rhythm anomaly warning */}
      {pacing.hasRhythmAnomaly && (
        <RhythmAnomalyWarning runs={pacing.rhythmRuns} />
      )}

      {/* Duration bar chart + energy curve */}
      <DurationChart
        points={pacing.points}
        energyCurve={energyCurve}
        actBreakdown={actBreakdown}
      />

      {/* Per-act breakdown */}
      {actBreakdown.length > 1 && (
        <ActBreakdownPanel breakdown={actBreakdown} />
      )}
    </div>
  );
}

// ── Stat chip ───────────────────────────────────────────────────────────────

function StatChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-semibold bg-surface-muted text-text-secondary border border-border tabular-nums">
      {icon}
      <span className="text-text-muted">{label}:</span>
      {value}
    </span>
  );
}

// ── Rhythm anomaly warning ──────────────────────────────────────────────────

function RhythmAnomalyWarning({ runs }: { runs: RhythmRun[] }) {
  return (
    <div className="rounded-xl border border-warning/30 bg-warning/5 p-2.5">
      <div className="flex items-start gap-2">
        <AlertTriangle
          className="w-3.5 h-3.5 text-warning mt-0.5 shrink-0"
          aria-hidden="true"
        />
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-warning">
            Rhythm pattern detected
          </p>
          {runs.map((run, i) => (
            <p key={i} className="text-[10px] text-text-secondary leading-relaxed">
              Shots {run.start + 1}–{run.end + 1}: {run.length} consecutive
              shots at {run.duration}s each.
              {run.length >= 3
                ? ' Consider varying durations to avoid visual monotony.'
                : ''}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Duration chart ──────────────────────────────────────────────────────────

function DurationChart({
  points,
  energyCurve,
  actBreakdown,
}: {
  points: ShotPacingPoint[];
  energyCurve: number[];
  actBreakdown: ActBreakdown[];
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Hooks must run unconditionally — derive values here
  const maxDuration = points.length > 0 ? Math.max(...points.map((p) => p.duration), 1) : 1;
  const barWidth = points.length > 0 ? Math.max(MIN_BAR_WIDTH, 100 / points.length) : MIN_BAR_WIDTH;

  // Energy curve Y positions
  const energyHeight = 30;
  const energyY = BAR_HEIGHT + 8;

  // Total SVG width
  const totalWidth = points.length * (barWidth + BAR_GAP);

  // Act boundaries
  const actBoundaries = useMemo(() => {
    const boundaries: { index: number; label: string }[] = [];
    for (const act of actBreakdown) {
      if (act.shotIndices.length > 0) {
        boundaries.push({
          index: act.shotIndices[0],
          label: `Act ${act.actNumber}`,
        });
      }
    }
    return boundaries;
  }, [actBreakdown]);

  // Build energy path
  const energyPath = useMemo(() => {
    if (energyCurve.length < 2 || points.length === 0) return '';
    const stepX = totalWidth / (energyCurve.length - 1);
    return energyCurve
      .map((e, i) => {
        const x = i * stepX;
        const y = energyY + energyHeight - e * energyHeight;
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [energyCurve, totalWidth, energyY, energyHeight, points.length]);

  const handleMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const fraction = Math.min(
      1,
      Math.max(0, (e.clientX - rect.left) / rect.width),
    );
    const index = Math.round(fraction * (points.length - 1));
    setHoverIndex(index);
  };

  const hoverPoint = hoverIndex !== null ? points[hoverIndex] : null;

  if (points.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <div className="overflow-x-auto scrollbar-thin">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${totalWidth} ${BAR_HEIGHT + energyHeight + 16}`}
          className="w-full min-w-[300px]"
          style={{ height: BAR_HEIGHT + energyHeight + 20 }}
          role="img"
          aria-label={`Pacing rhythm graph showing ${points.length} shots`}
          onPointerMove={handleMove}
          onPointerLeave={() => setHoverIndex(null)}
        >
          {/* Duration bars */}
          {points.map((point, i) => {
            const barH = (point.duration / maxDuration) * BAR_HEIGHT;
            const x = i * (barWidth + BAR_GAP);
            const y = BAR_HEIGHT - barH;
            const isHovered = hoverIndex === i;
            const isInRun = energyCurve.length > 0 && i > 0 && point.duration === points[i - 1]?.duration;

            return (
              <g key={point.shotNumber}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  rx={2}
                  className={cn(
                    'transition-colors',
                    isHovered
                      ? 'fill-brand'
                      : isInRun
                        ? 'fill-warning/60'
                        : 'fill-brand/50',
                  )}
                  stroke={isHovered ? 'var(--brand)' : isInRun ? 'var(--warning)' : 'transparent'}
                  strokeWidth={isHovered ? 1.5 : 1}
                />
                {/* Shot number label */}
                {barWidth >= 20 && (
                  <text
                    x={x + barWidth / 2}
                    y={BAR_HEIGHT + 9}
                    textAnchor="middle"
                    className="fill-text-muted"
                    fontSize="7"
                    fontWeight="600"
                  >
                    {point.shotNumber}
                  </text>
                )}
              </g>
            );
          })}

          {/* Energy curve overlay */}
          {energyPath && (
            <path
              d={energyPath}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={1.5}
              strokeDasharray="3 2"
              opacity={0.7}
            />
          )}

          {/* Act boundaries */}
          {actBoundaries.map((boundary) => {
            if (boundary.index === 0) return null;
            const x = boundary.index * (barWidth + BAR_GAP) - BAR_GAP / 2;
            return (
              <g key={boundary.label}>
                <line
                  x1={x}
                  y1={0}
                  x2={x}
                  y2={BAR_HEIGHT + energyHeight + 4}
                  stroke="var(--text-muted)"
                  strokeWidth={0.5}
                  strokeDasharray="2 2"
                  opacity={0.5}
                />
                <text
                  x={x + 3}
                  y={BAR_HEIGHT + energyHeight + 14}
                  className="fill-text-muted"
                  fontSize="7"
                  fontWeight="700"
                >
                  {boundary.label}
                </text>
              </g>
            );
          })}

          {/* Hover guide */}
          {hoverIndex !== null && (
            <line
              x1={hoverIndex * (barWidth + BAR_GAP) + barWidth / 2}
              y1={0}
              x2={hoverIndex * (barWidth + BAR_GAP) + barWidth / 2}
              y2={BAR_HEIGHT + energyHeight}
              stroke="var(--brand)"
              strokeWidth={0.75}
              opacity={0.4}
            />
          )}
        </svg>
      </div>

      {/* Hover tooltip */}
      {hoverPoint && (
        <div className="flex items-center gap-2 text-[10px] text-text-secondary px-1">
          <span className="font-bold text-brand">
            Shot {hoverPoint.shotNumber}
          </span>
          <span className="tabular-nums">{hoverPoint.duration}s</span>
          {hoverPoint.shotFunction && (
            <span className="text-accent font-semibold">{hoverPoint.shotFunction}</span>
          )}
          {hoverPoint.emotion && (
            <span className="text-text-muted italic">{hoverPoint.emotion}</span>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-3 text-[9px] text-text-muted px-1">
        <span className="inline-flex items-center gap-1">
          <span className="w-3 h-2 rounded-sm bg-brand/50" aria-hidden="true" />
          Duration
        </span>
        <span className="inline-flex items-center gap-1">
          <span
            className="w-3 h-0.5 border-t border-dashed border-accent"
            aria-hidden="true"
          />
          Energy
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-3 h-2 rounded-sm bg-warning/60" aria-hidden="true" />
          Same-length run
        </span>
      </div>
    </div>
  );
}

// ── Act breakdown panel ─────────────────────────────────────────────────────

function ActBreakdownPanel({
  breakdown,
}: {
  breakdown: ActBreakdown[];
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-surface-muted/50 p-2.5 space-y-1.5">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
        <TrendingUp className="w-3 h-3 text-brand" aria-hidden="true" />
        Act Breakdown
      </div>
      <div className="grid grid-cols-3 gap-2">
        {breakdown.map((act) => (
          <div
            key={act.actNumber}
            className="rounded-lg border border-border/50 bg-surface-card/60 p-2 space-y-1"
          >
            <p className="text-[9px] font-bold text-text-primary">
              Act {act.actNumber}: {act.title}
            </p>
            <p className="text-[9px] text-text-secondary tabular-nums">
              {act.shotIndices.length} shots ·{' '}
              {Math.floor(act.totalDuration / 60)}m {act.totalDuration % 60}s
            </p>
            <p className="text-[9px] text-text-muted tabular-nums">
              Avg {act.averageDuration.toFixed(1)}s ·{' '}
              {(act.cutFrequency * 60).toFixed(1)} cuts/min
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
