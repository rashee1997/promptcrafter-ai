'use client';

import React, { useState } from 'react';
import { ChevronDown, Sparkles, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { ProductBrief } from '@/lib/product-shoot/types';
import { PRODUCT_CATEGORIES } from '@/lib/product-shoot/presets';

interface BriefFormProps {
  brief: ProductBrief;
  onChange: (brief: ProductBrief) => void;
}

export function BriefForm({ brief, onChange }: BriefFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const update = (field: keyof ProductBrief, value: string) => {
    onChange({ ...brief, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold tracking-wider uppercase text-text-secondary">
          Product Brief & Context
        </label>
        <span className="text-[11px] text-text-muted">
          Ground truth for commercial script
        </span>
      </div>

      {/* Product name — required */}
      <div className="space-y-1.5">
        <label htmlFor="ps-name" className="block text-xs font-medium text-text-secondary">
          Product Name <span className="text-danger">*</span>
        </label>
        <input
          id="ps-name"
          type="text"
          value={brief.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="e.g. Velvet Glow Hyaluronic Dew Drops"
          className="w-full rounded-lg bg-surface-input border border-border px-3 py-2.5
            text-sm text-text-primary placeholder:text-text-muted
            focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/60
            transition-colors font-medium"
        />
      </div>

      {/* Category Quick Chips + Input */}
      <div className="space-y-2">
        <label htmlFor="ps-category" className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
          <Tag className="w-3 h-3 text-brand" />
          Product Category
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PRODUCT_CATEGORIES.map((cat) => {
            const isSelected = brief.category.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                type="button"
                onClick={() => update('category', isSelected ? '' : cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-150 border ${
                  isSelected
                    ? 'bg-brand/15 text-brand border-brand/50 font-semibold'
                    : 'bg-surface-input border-border text-text-secondary hover:text-text-primary hover:border-brand/30'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
        <input
          id="ps-category"
          type="text"
          value={brief.category}
          onChange={(e) => update('category', e.target.value)}
          placeholder="Or type custom category..."
          className="w-full rounded-lg bg-surface-input border border-border px-3 py-2
            text-xs text-text-primary placeholder:text-text-muted
            focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/60
            transition-colors"
        />
      </div>

      {/* Description / What it does */}
      <div className="space-y-1.5">
        <label htmlFor="ps-desc" className="block text-xs font-medium text-text-secondary">
          What does it do? (Core Function)
        </label>
        <input
          id="ps-desc"
          type="text"
          value={brief.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="e.g. Ultra-hydrating facial serum with 15% Vitamin C for luminous skin"
          className="w-full rounded-lg bg-surface-input border border-border px-3 py-2
            text-xs text-text-primary placeholder:text-text-muted
            focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/60
            transition-colors"
        />
      </div>

      {/* Key selling point / Benefit */}
      <div className="space-y-1.5">
        <label htmlFor="ps-selling" className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
          <Sparkles className="w-3 h-3 text-accent" />
          Key Selling Point & Hero Benefit
        </label>
        <input
          id="ps-selling"
          type="text"
          value={brief.sellingPoint}
          onChange={(e) => update('sellingPoint', e.target.value)}
          placeholder="e.g. 72-hour glass-skin hydration barrier in a single dropper application"
          className="w-full rounded-lg bg-surface-input border border-border px-3 py-2
            text-xs text-text-primary placeholder:text-text-muted
            focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/60
            transition-colors"
        />
      </div>

      {/* Advanced Toggle */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-xs font-medium text-brand hover:text-brand-hover transition-colors"
        >
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              showAdvanced ? 'rotate-180' : ''
            }`}
          />
          <span>{showAdvanced ? 'Hide additional brief details' : 'Add audience & visual details'}</span>
        </button>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 pt-3"
            >
              <div className="space-y-1.5">
                <label htmlFor="ps-audience" className="block text-xs font-medium text-text-muted">
                  Target Audience / Customer Persona
                </label>
                <input
                  id="ps-audience"
                  type="text"
                  value={brief.targetAudience || ''}
                  onChange={(e) => update('targetAudience', e.target.value)}
                  placeholder="e.g. Luxury skincare enthusiasts, Gen-Z creators, premium tech professionals"
                  className="w-full rounded-lg bg-surface-input border border-border px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="ps-features" className="block text-xs font-medium text-text-muted">
                  Key Visual Details (Materials, Caps, Labels to Highlight)
                </label>
                <input
                  id="ps-features"
                  type="text"
                  value={brief.keyFeatures || ''}
                  onChange={(e) => update('keyFeatures', e.target.value)}
                  placeholder="e.g. Frosted amber glass bottle, gold embossed typography, dropper nozzle"
                  className="w-full rounded-lg bg-surface-input border border-border px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 transition-colors"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
