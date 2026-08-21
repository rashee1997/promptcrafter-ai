'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Clock, RectangleHorizontal, Smartphone, Monitor, Square } from 'lucide-react';
import { SCENE_RECIPES, SURPRISE_RECIPE_ID } from '@/lib/product-shoot/scene-recipes';
import type { SceneGoal } from '@/lib/product-shoot/types';

interface SceneRecipePickerProps {
  selectedRecipeId: string | null;
  onSelectRecipe: (id: string) => void;
}

const GOAL_COLORS: Record<SceneGoal, string> = {
  hero: 'brand',
  hook: 'accent',
  lifestyle: 'success',
  demo: 'warning',
  cta: 'brand',
  ugc: 'accent',
};

function AspectIcon({ ratio }: { ratio: string }) {
  if (ratio === '16:9') return <Monitor className="w-3 h-3" />;
  if (ratio === '9:16') return <Smartphone className="w-3 h-3" />;
  return <Square className="w-3 h-3" />;
}

export function SceneRecipePicker({
  selectedRecipeId,
  onSelectRecipe,
}: SceneRecipePickerProps) {
  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold tracking-wider uppercase text-text-secondary">
        Scene Recipe
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {/* Surprise Me card */}
        <motion.button
          type="button"
          onClick={() => onSelectRecipe(SURPRISE_RECIPE_ID)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            relative rounded-xl border p-3 text-left transition-all duration-200
            ${
              selectedRecipeId === SURPRISE_RECIPE_ID
                ? 'border-brand bg-brand/10 ring-2 ring-brand/30'
                : 'border-border bg-surface-card hover:border-brand/40 hover:bg-surface-muted/30'
            }
          `}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-brand" />
            <span className="text-sm font-semibold text-text-primary">
              Surprise Me
            </span>
          </div>
          <p className="text-[11px] text-text-muted leading-snug">
            AI picks the most compelling concept for this product category
          </p>
        </motion.button>

        {/* Recipe cards */}
        {SCENE_RECIPES.map((recipe, i) => (
          <motion.button
            key={recipe.id}
            type="button"
            onClick={() => onSelectRecipe(recipe.id)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 30, duration: 0.18 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              relative rounded-xl border p-3 text-left transition-all duration-200
              ${
                selectedRecipeId === recipe.id
                  ? 'border-brand bg-brand/10 ring-2 ring-brand/30'
                  : 'border-border bg-surface-card hover:border-brand/40 hover:bg-surface-muted/30'
              }
            `}
          >
            {/* Goal badge */}
            <span
              className={`absolute top-2 right-2 text-[9px] font-semibold tracking-wider uppercase
                px-1.5 py-0.5 rounded-full bg-${GOAL_COLORS[recipe.goal]}/10 text-${GOAL_COLORS[recipe.goal]}`}
            >
              {recipe.goal}
            </span>

            <div className="mb-1.5">
              <span className="text-sm font-semibold text-text-primary pr-12">
                {recipe.label}
              </span>
            </div>

            <p className="text-[11px] text-text-muted leading-snug mb-2">
              {recipe.summary}
            </p>

            {/* Meta row */}
            <div className="flex items-center gap-2 text-[10px] text-text-muted">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {recipe.durationHint}s
              </span>
              <span className="flex items-center gap-1">
                <AspectIcon ratio={recipe.aspectHint} />
                {recipe.aspectHint}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
