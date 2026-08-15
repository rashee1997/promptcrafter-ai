/**
 * Generates public/og-image.png (1200×630) for Open Graph / Twitter cards.
 *
 * Uses Next's built-in ImageResponse (Satori) so no image tooling or font
 * files are needed. Run with: bun run generate:og
 *
 * The generated PNG is committed; this script exists so the asset can be
 * regenerated when the branding or tagline changes.
 */
import { ImageResponse } from 'next/og';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import React from 'react';

const BG = '#171821'; // dark surface-page token
const CARD = '#23233a'; // dark surface-elevated token
const TEXT = '#f2f2f6';
const MUTED = '#9c9cb4';
const BRAND = '#8a7cf2'; // brand token in dark mode
const BORDER = 'rgba(255, 255, 255, 0.1)';

const LOOP_STEPS = ['Generate', 'Score', 'Test', 'Compare', 'Export', 'Re-verify'];

const el = React.createElement;

const node = el(
  'div',
  {
    style: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: BG,
      color: TEXT,
      padding: 72,
    },
  },
  // Brand row
  el(
    'div',
    { style: { display: 'flex', alignItems: 'center', gap: 14 } },
    el('div', { style: { width: 18, height: 18, borderRadius: 6, background: BRAND } }),
    el(
      'div',
      { style: { fontSize: 28, fontWeight: 700, letterSpacing: '-0.01em' } },
      'PromptCrafter AI'
    )
  ),
  // Headline
  el(
    'div',
    {
      style: {
        marginTop: 52,
        display: 'flex',
        flexDirection: 'column',
        fontSize: 64,
        fontWeight: 800,
        letterSpacing: '-0.02em',
        lineHeight: 1.08,
      },
    },
    'Engineer prompts.',
    el('div', {}, 'Prove they work.')
  ),
  el(
    'div',
    { style: { marginTop: 22, fontSize: 26, color: MUTED, lineHeight: 1.45 } },
    'Generate, score, test, and version AI prompts — locally in your browser.'
  ),
  // Measurement loop chips
  el(
    'div',
    {
      style: {
        marginTop: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexWrap: 'wrap',
      },
    },
    LOOP_STEPS.map((step, i) => [
      el(
        'div',
        {
          key: step,
          style: {
            padding: '10px 18px',
            borderRadius: 999,
            background: CARD,
            border: `1px solid ${BORDER}`,
            fontSize: 20,
          },
        },
        step
      ),
      i < LOOP_STEPS.length - 1
        ? el(
            'div',
            { key: `${step}-arrow`, style: { color: BRAND, fontSize: 20, fontWeight: 700 } },
            '→'
          )
        : null,
    ]).flat()
  )
);

const image = new ImageResponse(node, { width: 1200, height: 630 });
const buf = Buffer.from(await image.arrayBuffer());

mkdirSync(path.join(process.cwd(), 'public'), { recursive: true });
const outPath = path.join(process.cwd(), 'public', 'og-image.png');
writeFileSync(outPath, buf);

// Verify the output is a real PNG with the expected dimensions (IHDR).
const png = readFileSync(outPath);
const width = png.readUInt32BE(16);
const height = png.readUInt32BE(20);
if (png.subarray(1, 4).toString('ascii') !== 'PNG' || width !== 1200 || height !== 630) {
  throw new Error(`Unexpected image output: ${width}x${height}`);
}
console.log(`Wrote public/og-image.png (${width}x${height}, ${buf.length} bytes)`);
