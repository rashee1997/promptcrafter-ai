'use client';

import React, { useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface SparklineProps {
  values: number[];
  stroke: string;
  /** Optional secondary series drawn beneath the primary (e.g. cost vs score). */
  secondary?: number[];
  secondaryStroke?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  ariaLabel?: string;
  /** Units/label shown in the hover tooltip (e.g. "score" or "$ / 1k runs"). */
  unitLabel?: string;
}

function toPoints(values: number[], width: number, height: number, pad = 3): string {
  if (values.length === 0) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = values.length === 1 ? 0 : width / (values.length - 1);
  return values
    .map((v, i) => {
      const x = i * stepX;
      const y = pad + (1 - (v - min) / range) * (height - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

/**
 * Minimal dependency-free SVG sparkline (DESIGN.md §9.15) — used for ambient
 * version trends (quality and cost) without pulling in a charting library.
 *
 * Motion: the primary line draws itself in on mount (600ms pathLength tween),
 * the latest-value dot pops in, and hovering reveals a value tooltip at the
 * nearest point. All of it is skipped under `prefers-reduced-motion`.
 */
export function Sparkline({
  values,
  stroke,
  secondary,
  secondaryStroke = 'oklch(0.6 0.15 85)',
  width = 120,
  height = 28,
  fill = false,
  ariaLabel = 'sparkline',
  unitLabel,
}: SparklineProps) {
  // Hooks must run unconditionally (rules-of-hooks); the id is only used in the SVG below.
  const id = React.useId().replace(/:/g, '');
  const prefersReduced = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const points = useMemo(() => toPoints(values, width, height), [values, width, height]);
  const min = values.length > 0 ? Math.min(...values) : 0;
  const max = values.length > 0 ? Math.max(...values) : 0;

  if (values.length === 0) {
    return <div className="h-[24px] text-[10px] text-text-muted flex items-center">—</div>;
  }

  const stepX = values.length === 1 ? 0 : width / (values.length - 1);

  const handleMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const fraction = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const index = Math.round(fraction * (values.length - 1));
    setHoverIndex(index);
  };

  const hoverValue = hoverIndex !== null ? values[hoverIndex] : null;
  const hoverX = hoverIndex !== null && values.length > 1 ? hoverIndex * stepX : width / 2;
  // Y coordinate of the hovered point (same math as toPoints, minus the pad).
  const hoverY =
    hoverIndex !== null && values.length > 1
      ? 3 + (1 - (values[hoverIndex] - min) / (max - min || 1)) * (height - 6)
      : height / 2;

  const drawTransition = { duration: 0.6, ease: [0.2, 0, 0, 1] as const };

  return (
    <div className="relative inline-block">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={ariaLabel}
        className="overflow-visible"
        onPointerMove={handleMove}
        onPointerLeave={() => setHoverIndex(null)}
      >
        {secondary && secondary.length > 0 && (
          <>
            <polyline
              points={toPoints(secondary, width, height)}
              fill="none"
              stroke={secondaryStroke}
              strokeWidth={1.5}
              strokeOpacity={0.6}
              strokeDasharray="3 3"
            />
            <polygon
              points={`0,${height} ${toPoints(secondary, width, height)} ${width},${height}`}
              fill={secondaryStroke}
              fillOpacity={0.08}
              stroke="none"
            />
          </>
        )}
        {fill && values.length > 1 && (
          <polygon
            points={`0,${height} ${points} ${width},${height}`}
            fill={stroke}
            fillOpacity={0.12}
            stroke="none"
          />
        )}
        <motion.polyline
          points={points}
          fill="none"
          stroke={stroke}
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={prefersReduced ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={drawTransition}
        />
        {values.length === 1 && (
          <motion.circle
            cx={width / 2}
            cy={height / 2}
            r={2.5}
            fill={stroke}
            initial={prefersReduced ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        )}
        {values.length > 1 && (
          <>
            <circle
              cx={(width / (values.length - 1)) * 0}
              cy={height - 3}
              r={2}
              fill={stroke}
              fillOpacity={0.4}
            />
            <motion.circle
              cx={width}
              cy={3}
              r={2.5}
              fill={stroke}
              initial={prefersReduced ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </>
        )}
        {/* Hover guide + nearest-point marker */}
        {hoverIndex !== null && values.length > 1 && (
          <g>
            <line
              x1={hoverX}
              y1={0}
              x2={hoverX}
              y2={height}
              stroke={stroke}
              strokeOpacity={0.3}
              strokeWidth={1}
            />
            <circle cx={hoverX} cy={hoverY} r={3} fill={stroke} stroke="var(--surface-card)" strokeWidth={1.5} />
          </g>
        )}
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.25} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0.9} />
          </linearGradient>
        </defs>
      </svg>

      {/* Hover tooltip (DESIGN §9.14 pattern — CSS only, no timers) */}
      {hoverValue !== null && (
        <div
          className="pointer-events-none absolute -top-6 -translate-x-1/2 z-10 whitespace-nowrap rounded-lg border border-border bg-surface-elevated px-2 py-0.5 text-[10px] font-bold text-text-primary shadow-lg"
          style={{ left: hoverX }}
          role="tooltip"
        >
          {hoverValue}
          {unitLabel ? <span className="font-medium text-text-muted"> {unitLabel}</span> : null}
        </div>
      )}
    </div>
  );
}
