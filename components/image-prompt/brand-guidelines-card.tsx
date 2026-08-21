'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  Info,
  Layers,
  Palette,
  ShieldAlert,
  ShieldCheck,
  Type,
  XCircle,
} from 'lucide-react';
import { BrandGuidelinesSpec, generateBrandGuidelinesSpec } from '@/lib/logo-guidelines';
import { useInlineCopy } from '@/lib/use-inline-copy';
import { ImagePromptInput } from '@/types';

interface BrandGuidelinesCardProps {
  input: ImagePromptInput;
}

export function BrandGuidelinesCard({ input }: BrandGuidelinesCardProps) {
  const spec: BrandGuidelinesSpec = React.useMemo(
    () => generateBrandGuidelinesSpec(input),
    [input]
  );
  const { copiedKey, copy } = useInlineCopy();
  const [activeContrastBg, setActiveContrastBg] = useState<'white' | 'dark'>('white');

  return (
    <div className="rounded-xl border border-brand/30 bg-surface-card/90 shadow-md p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand/10 text-brand">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-text-primary flex items-center gap-2">
              <span>Brand Identity Spec Sheet & Guidelines</span>
              <span className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.2 rounded-full bg-brand/10 text-brand border border-brand/25">
                Brand Standards
              </span>
            </h4>
            <p className="text-[11px] text-text-muted">
              Official color metrics, WCAG contrast audits, font pairings, and exclusion zone rules.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Color System & WCAG Contrast Matrix */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-secondary">
            <Palette className="w-3.5 h-3.5 text-brand" />
            Color System & Contrast Auditor
          </span>
          <div className="flex items-center gap-1 text-[10px]">
            <span className="text-text-muted">Check against:</span>
            <button
              type="button"
              onClick={() => setActiveContrastBg('white')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                activeContrastBg === 'white'
                  ? 'bg-brand text-white'
                  : 'bg-surface-muted text-text-secondary hover:text-text-primary'
              }`}
            >
              Light (#FFF)
            </button>
            <button
              type="button"
              onClick={() => setActiveContrastBg('dark')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                activeContrastBg === 'dark'
                  ? 'bg-brand text-white'
                  : 'bg-surface-muted text-text-secondary hover:text-text-primary'
              }`}
            >
              Dark (#111)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {spec.colors.map((c, i) => {
            const contrast = activeContrastBg === 'white' ? c.contrastOnWhite : c.contrastOnDark;
            const wcag = activeContrastBg === 'white' ? c.wcagWhitePass : c.wcagDarkPass;
            const isPass = wcag !== 'FAIL';

            return (
              <div
                key={i}
                className="rounded-lg border border-border/80 bg-surface-input/50 p-2.5 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-md border border-black/20 shadow-xs shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-xs font-bold text-text-primary truncate">
                        {c.name}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                        wcag === 'AAA'
                          ? 'bg-success/10 text-success border-success/30'
                          : wcag === 'AA'
                          ? 'bg-accent/10 text-accent border-accent/30'
                          : 'bg-error/10 text-error border-error/30'
                      }`}
                    >
                      {wcag === 'FAIL' ? 'FAIL' : `WCAG ${wcag}`}
                    </span>
                  </div>

                  <div className="space-y-0.5 text-[10px] font-mono text-text-muted">
                    <div className="flex items-center justify-between">
                      <span>HEX:</span>
                      <button
                        type="button"
                        onClick={() => copy(c.hex, `hex-${i}`)}
                        className="text-text-primary font-semibold hover:text-brand flex items-center gap-1"
                      >
                        <span>{c.hex}</span>
                        {copiedKey === `hex-${i}` ? (
                          <Check className="w-2.5 h-2.5 text-success" />
                        ) : (
                          <Copy className="w-2.5 h-2.5 opacity-50" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>RGB:</span>
                      <span>{c.rgb}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>CMYK:</span>
                      <span>{c.cmyk}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-1.5 border-t border-border/40 flex items-center justify-between text-[10px]">
                  <span className="text-text-muted">Contrast:</span>
                  <span className={`font-mono font-bold ${isPass ? 'text-success' : 'text-error'}`}>
                    {contrast}:1
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Typography Pairing System */}
      <div className="space-y-2 pt-1 border-t border-border/50">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-secondary">
            <Type className="w-3.5 h-3.5 text-brand" />
            Curated Font Pairing System
          </span>
          <a
            href={spec.typography.googleFontsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] font-semibold text-brand hover:underline"
          >
            <span>View on Google Fonts</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Primary Font */}
          <div className="rounded-lg border border-border/80 bg-surface-input/50 p-2.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-brand">
                Primary Brand Logotype
              </span>
              <span className="text-[9px] text-text-muted">{spec.typography.primaryCategory}</span>
            </div>
            <p className="text-sm font-bold text-text-primary">{spec.typography.primaryFont}</p>
            <p className="text-[10px] text-text-muted">Weights: {spec.typography.primaryWeights}</p>
          </div>

          {/* Secondary Font */}
          <div className="rounded-lg border border-border/80 bg-surface-input/50 p-2.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-accent">
                Supporting Body / UI Type
              </span>
              <span className="text-[9px] text-text-muted">{spec.typography.secondaryCategory}</span>
            </div>
            <p className="text-sm font-bold text-text-primary">{spec.typography.secondaryFont}</p>
            <p className="text-[10px] text-text-muted">Weights: {spec.typography.secondaryWeights}</p>
          </div>
        </div>

        <p className="text-[11px] text-text-muted leading-relaxed bg-surface-muted/40 p-2 rounded-lg border border-border/40 font-mono text-[10px]">
          <span className="font-bold text-text-secondary">Hierarchy Rule: </span>
          {spec.typography.usageHierarchy}
        </p>
      </div>

      {/* 3. Clear Space & Minimum Scale */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-border/50">
        {/* Clear Space */}
        <div className="rounded-lg border border-border/80 bg-surface-input/50 p-2.5 space-y-1">
          <span className="text-[10px] font-bold uppercase text-text-secondary block">
            Clear Space & Exclusion Zone
          </span>
          <p className="text-xs font-mono font-bold text-brand">{spec.clearSpaceRule.formula}</p>
          <p className="text-[10px] text-text-muted leading-snug">
            {spec.clearSpaceRule.unitDescription}
          </p>
        </div>

        {/* Minimum Scale */}
        <div className="rounded-lg border border-border/80 bg-surface-input/50 p-2.5 space-y-1">
          <span className="text-[10px] font-bold uppercase text-text-secondary block">
            Minimum Scale Limits
          </span>
          <div className="text-[10px] font-mono space-y-0.5 text-text-muted">
            <div className="flex justify-between">
              <span>Favicon:</span>
              <span className="text-text-primary font-semibold">{spec.minimumScale.digitalFavicon}</span>
            </div>
            <div className="flex justify-between">
              <span>Navbar:</span>
              <span className="text-text-primary font-semibold">{spec.minimumScale.digitalNavbar}</span>
            </div>
            <div className="flex justify-between">
              <span>Print:</span>
              <span className="text-text-primary font-semibold">{spec.minimumScale.printSmall}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Brand Dos & Don'ts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-border/50">
        {/* Dos */}
        <div className="rounded-lg border border-success/25 bg-success/5 p-2.5 space-y-1.5">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-success">
            <CheckCircle2 className="w-3 h-3" />
            <span>Brand Standards (Dos)</span>
          </div>
          <ul className="space-y-1 text-[10px] text-text-secondary leading-snug">
            {spec.dosAndDonts.dos.map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-success shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Don'ts */}
        <div className="rounded-lg border border-error/25 bg-error/5 p-2.5 space-y-1.5">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-error">
            <XCircle className="w-3 h-3" />
            <span>Violations to Avoid (Don'ts)</span>
          </div>
          <ul className="space-y-1 text-[10px] text-text-secondary leading-snug">
            {spec.dosAndDonts.donts.map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-error shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
