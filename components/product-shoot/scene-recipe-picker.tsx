'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Clock,
  Smartphone,
  Monitor,
  Square,
  Crown,
  Zap,
  Droplets,
  Flame,
  Snowflake,
  Smile,
  CheckCircle2,
  Clapperboard,
} from 'lucide-react';
import { SCENE_RECIPES, SURPRISE_RECIPE_ID } from '@/lib/product-shoot/scene-recipes';
import type { SceneGoal, SceneRecipe } from '@/lib/product-shoot/types';

interface SceneRecipePickerProps {
  selectedRecipeId: string | null;
  onSelectRecipe: (id: string) => void;
}

const GOAL_CONFIG: Record<SceneGoal, { label: string; bg: string; text: string; border: string }> = {
  hero: {
    label: 'Hero',
    bg: 'bg-brand/10',
    text: 'text-brand',
    border: 'border-brand/30',
  },
  hook: {
    label: 'Viral Hook',
    bg: 'bg-accent/10',
    text: 'text-accent',
    border: 'border-accent/30',
  },
  lifestyle: {
    label: 'Lifestyle',
    bg: 'bg-success/10',
    text: 'text-success',
    border: 'border-success/30',
  },
  demo: {
    label: 'Sensory Demo',
    bg: 'bg-warning/10',
    text: 'text-warning',
    border: 'border-warning/30',
  },
  cta: {
    label: 'Conversion CTA',
    bg: 'bg-brand/10',
    text: 'text-brand',
    border: 'border-brand/30',
  },
  ugc: {
    label: 'UGC Style',
    bg: 'bg-accent/10',
    text: 'text-accent',
    border: 'border-accent/30',
  },
};

function RecipeIcon({ name }: { name?: string }) {
  switch (name) {
    case 'Crown':
      return <Crown className="w-3.5 h-3.5 text-brand" />;
    case 'Zap':
      return <Zap className="w-3.5 h-3.5 text-accent" />;
    case 'Droplets':
      return <Droplets className="w-3.5 h-3.5 text-accent" />;
    case 'Sparkles':
      return <Sparkles className="w-3.5 h-3.5 text-brand" />;
    case 'Flame':
      return <Flame className="w-3.5 h-3.5 text-warning" />;
    case 'Snowflake':
      return <Snowflake className="w-3.5 h-3.5 text-accent" />;
    case 'Smile':
      return <Smile className="w-3.5 h-3.5 text-success" />;
    case 'Smartphone':
      return <Smartphone className="w-3.5 h-3.5 text-accent" />;
    case 'CheckCircle2':
      return <CheckCircle2 className="w-3.5 h-3.5 text-success" />;
    default:
      return <Clapperboard className="w-3.5 h-3.5 text-text-muted" />;
  }
}

function AspectIcon({ ratio }: { ratio: string }) {
  if (ratio === '16:9') return <Monitor className="w-3 h-3" />;
  if (ratio === '9:16') return <Smartphone className="w-3 h-3" />;
  return <Square className="w-3 h-3" />;
}

export function SceneRecipePicker({
  selectedRecipeId,
  onSelectRecipe,
}: SceneRecipePickerProps) {
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const categories = ['All', 'Commercial', 'Social Ad', 'Sensory / FX', 'Luxury', 'Lifestyle'];

  const filteredRecipes = filterCategory === 'All'
    ? SCENE_RECIPES
    : SCENE_RECIPES.filter((r) => r.category === filterCategory);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <label className="block text-xs font-semibold tracking-wider uppercase text-text-secondary">
          Commercial Scene Recipe
        </label>

        {/* Category filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategory(cat)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors whitespace-nowrap ${
                filterCategory === cat
                  ? 'bg-brand text-white'
                  : 'bg-surface-input text-text-muted hover:text-text-primary border border-border/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {/* Surprise Me card */}
        <motion.button
          type="button"
          onClick={() => onSelectRecipe(SURPRISE_RECIPE_ID)}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          className={`
            relative rounded-xl border p-3.5 text-left transition-all duration-200 flex flex-col justify-between
            ${
              selectedRecipeId === SURPRISE_RECIPE_ID
                ? 'border-brand bg-gradient-to-br from-brand/15 to-accent/10 ring-2 ring-brand/30 shadow-[0_4px_16px_var(--shadow-glow)]'
                : 'border-border bg-surface-card hover:border-brand/40 hover:bg-surface-muted/30'
            }
          `}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand" />
                <span className="text-xs font-bold text-text-primary">
                  Director's Choice
                </span>
              </div>
              <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/25">
                AI Surprise
              </span>
            </div>
            <p className="text-[11px] text-text-muted leading-relaxed">
              AI director selects the optimal commercial hook, camera pace, and atmosphere for your specific product category.
            </p>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[10px] text-text-muted font-mono">
            <span>Adaptive Duration</span>
            <span>·</span>
            <span>Multi-Aspect</span>
          </div>
        </motion.button>

        {/* Filtered Recipe cards */}
        {filteredRecipes.map((recipe, i) => {
          const isSelected = selectedRecipeId === recipe.id;
          const goalMeta = GOAL_CONFIG[recipe.goal] || GOAL_CONFIG.hero;

          return (
            <motion.button
              key={recipe.id}
              type="button"
              onClick={() => onSelectRecipe(recipe.id)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 20, duration: 0.18 }}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              className={`
                relative rounded-xl border p-3.5 text-left transition-all duration-200 flex flex-col justify-between
                ${
                  isSelected
                    ? 'border-brand bg-brand/10 ring-2 ring-brand/30 shadow-[0_4px_16px_var(--shadow-glow)]'
                    : 'border-border bg-surface-card hover:border-brand/40 hover:bg-surface-muted/30'
                }
              `}
            >
              <div>
                {/* Header: Title + Goal badge */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <RecipeIcon name={recipe.iconName} />
                    <span className="text-xs font-bold text-text-primary">
                      {recipe.label}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full border ${goalMeta.bg} ${goalMeta.text} ${goalMeta.border} shrink-0`}
                  >
                    {goalMeta.label}
                  </span>
                </div>

                <p className="text-[11px] text-text-muted leading-relaxed line-clamp-2">
                  {recipe.summary}
                </p>
              </div>

              {/* Meta row */}
              <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-text-muted font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-text-muted" />
                  ~{recipe.durationHint}s
                </span>
                <span className="flex items-center gap-1">
                  <AspectIcon ratio={recipe.aspectHint} />
                  {recipe.aspectHint}
                </span>
                <span className="text-[10px] text-text-muted/80 truncate max-w-[80px]">
                  {recipe.category}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
