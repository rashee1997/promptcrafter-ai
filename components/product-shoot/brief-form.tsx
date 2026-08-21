'use client';

import React from 'react';
import type { ProductBrief } from '@/lib/product-shoot/types';

interface BriefFormProps {
  brief: ProductBrief;
  onChange: (brief: ProductBrief) => void;
}

export function BriefForm({ brief, onChange }: BriefFormProps) {
  const update = (field: keyof ProductBrief, value: string) => {
    onChange({ ...brief, [field]: value });
  };

  return (
    <div className="space-y-4">
      <label className="block text-xs font-semibold tracking-wider uppercase text-text-secondary">
        Product Basics
      </label>

      {/* Product name — required */}
      <div className="space-y-1.5">
        <label htmlFor="ps-name" className="block text-xs text-text-muted">
          Product Name <span className="text-danger">*</span>
        </label>
        <input
          id="ps-name"
          type="text"
          value={brief.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="e.g. Velvet Glow Moisturiser"
          className="w-full rounded-lg bg-surface-input border border-border px-3 py-2.5
            text-sm text-text-primary placeholder:text-text-muted
            focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/60
            transition-colors"
        />
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <label htmlFor="ps-category" className="block text-xs text-text-muted">
          Category
        </label>
        <input
          id="ps-category"
          type="text"
          value={brief.category}
          onChange={(e) => update('category', e.target.value)}
          placeholder="e.g. skincare, coffee, electronics"
          className="w-full rounded-lg bg-surface-input border border-border px-3 py-2.5
            text-sm text-text-primary placeholder:text-text-muted
            focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/60
            transition-colors"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label htmlFor="ps-desc" className="block text-xs text-text-muted">
          What does it do?
        </label>
        <input
          id="ps-desc"
          type="text"
          value={brief.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="e.g. Hydrating face cream with hyaluronic acid"
          className="w-full rounded-lg bg-surface-input border border-border px-3 py-2.5
            text-sm text-text-primary placeholder:text-text-muted
            focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/60
            transition-colors"
        />
      </div>

      {/* Key selling point */}
      <div className="space-y-1.5">
        <label htmlFor="ps-selling" className="block text-xs text-text-muted">
          Key Selling Point
        </label>
        <input
          id="ps-selling"
          type="text"
          value={brief.sellingPoint}
          onChange={(e) => update('sellingPoint', e.target.value)}
          placeholder="e.g. 72-hour hydration in one application"
          className="w-full rounded-lg bg-surface-input border border-border px-3 py-2.5
            text-sm text-text-primary placeholder:text-text-muted
            focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/60
            transition-colors"
        />
      </div>
    </div>
  );
}
