'use client';

import React, { useEffect, useRef } from 'react';
import type { ThinkingOrbState } from '@/types/video';
import { cn } from '@/lib/utils';

export type OrbSize = 20 | 64;

interface ThinkingOrbProps {
  state: ThinkingOrbState;
  size?: OrbSize;
  className?: string;
}

/** Per-state motion: [rings, rotation speed, radial pulse, breathing, drift, dot size]. */
const CONFIG: Record<ThinkingOrbState, [number, number, number, number, number, number]> = {
  working: [2, 1.1, 0.06, 0, 0.4, 1.6], searching: [3, 1.9, 0.16, 0, 1.2, 1.4],
  solving: [2, 0.9, 0.28, 0.03, 0.6, 1.7], connecting: [3, 1.4, 0.05, 0, 0.5, 1.4],
  weaving: [4, 1.25, 0.1, 0.02, 0.9, 1.3], composing: [2, 0.8, 0.22, 0.05, 0.3, 1.8],
  shaping: [3, 0.7, 0.12, 0.06, 0.4, 1.5], breathing: [2, 0.55, 0.05, 0.14, 0.2, 1.6],
  listening: [1, 0.4, 0.03, 0.08, 0.15, 1.6],
};

/** Minimal oklch(L C H) → rgb so the orb follows the theme's brand/accent tokens. */
function oklchToRgb(raw: string): [number, number, number] | null {
  const m = raw.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
  if (!m) return null;
  const L = Math.min(1, Math.max(0, Number(m[1])));
  const C = Number(m[2]);
  const h = (Number(m[3]) * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mm = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const cl = (v: number) => Math.round(Math.min(255, Math.max(0, v * 255)));
  return [cl(4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s), cl(-1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s), cl(-0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s)];
}

/** Brand + accent rgb read from the live document theme (safe fallback). */
function themeColors(): { brand: [number, number, number]; accent: [number, number, number] } {
  const fallback: [number, number, number] = [124, 92, 232];
  if (typeof window === 'undefined') return { brand: fallback, accent: [79, 140, 224] };
  const s = getComputedStyle(document.documentElement);
  return {
    brand: oklchToRgb(s.getPropertyValue('--brand').trim()) ?? fallback,
    accent: oklchToRgb(s.getPropertyValue('--accent').trim()) ?? [79, 140, 224],
  };
}

/**
 * High-DPI 2D canvas orb of animated dotted particles (Jakub Antalík / Alex
 * Brinza-inspired). Motion maps to `state`; the loop pauses offscreen via
 * IntersectionObserver and collapses to a static frame under
 * prefers-reduced-motion. SSR-safe: all drawing happens in an effect.
 */
export function ThinkingOrb({ state, size = 64, className }: ThinkingOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const colors = themeColors();
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    let raf = 0;
    let running = false;
    const draw = (now: number) => {
      const [rings, speed, pulse, breathe, drift, dot] = CONFIG[stateRef.current];
      const t = now / 1000;
      const cx = size / 2;
      const cy = size / 2;
      const baseR = size * 0.32 * (1 + breathe * Math.sin(t * 1.6));
      const count = size >= 64 ? 56 : 20;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      for (let i = 0; i < count; i++) {
        const ring = i % rings;
        const phase = (i / count) * Math.PI * 2 + (i % 7) * 0.35;
        const sign = ring % 2 === 0 ? 1 : -1;
        const angle = phase + t * speed * (0.8 + ((i * 13) % 10) / 10) * sign + drift * Math.sin(t * 0.7 + phase);
        const wobble = 1 + pulse * Math.sin(t * (1.2 + ring * 0.55) + phase * 3);
        const radius = ((baseR * (ring + 1.4)) / (rings + 0.6)) * (0.72 + ((i * 31) % 10) / 22) * wobble;
        const rgb = ring < rings / 2 ? colors.brand : colors.accent;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius, (0.7 + ((i * 7) % 5) / 5) * dot * (size / 64), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${0.78 - ring * 0.12})`;
        ctx.fill();
      }
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * 0.5);
      glow.addColorStop(0, `rgba(${colors.brand[0]}, ${colors.brand[1]}, ${colors.brand[2]}, 0.16)`);
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, baseR * 0.5, 0, Math.PI * 2);
      ctx.fill();
    };

    const tick = (now: number) => {
      if (!running) return;
      draw(now);
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    if (reduced) {
      draw(performance.now());
      return () => stop();
    }

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), { rootMargin: '40px' });
      observer.observe(canvas);
    }
    start();

    return () => {
      stop();
      observer?.disconnect();
    };
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn('block rounded-full', className)}
      style={{ width: size, height: size }}
    />
  );
}
