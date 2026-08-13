'use client';

import React from 'react';

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
 * Minimal dependency-free SVG sparkline — used for ambient version trends
 * (quality and cost) without pulling in a charting library.
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
}: SparklineProps) {
  // Hook must run unconditionally (rules-of-hooks); the id is only used in the SVG below.
  const id = React.useId().replace(/:/g, '');

  if (values.length === 0) {
    return <div className="h-[24px] text-[10px] text-text-muted flex items-center">—</div>;
  }

  const points = toPoints(values, width, height);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel}
      className="overflow-visible"
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
            points={`0,${height} ${points} ${width},${height}`}
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
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {values.length === 1 && (
        <circle cx={width / 2} cy={height / 2} r={2.5} fill={stroke} />
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
          <circle
            cx={width}
            cy={3}
            r={2.5}
            fill={stroke}
          />
        </>
      )}
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.25} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0.9} />
        </linearGradient>
      </defs>
    </svg>
  );
}
