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
import type { SceneGoal, SceneRecipe, ProductBrief } from '@/lib/product-shoot/types';
import { suggestProductShootRecipe } from '@/lib/ai-client';

interface SceneRecipePickerProps {
  selectedRecipeId: string | null;
  /** `recipe` is set only when the selection is an ephemeral AI-generated recipe (not in SCENE_RECIPES). */
  onSelectRecipe: (id: string, recipe?: SceneRecipe) => void;
  brief: ProductBrief;
  referenceImages: { mimeType: string; data: string }[];
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
  brief,
  referenceImages,
}: SceneRecipePickerProps) {
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [busy, setBusy] = useState<boolean>(false);
  const [suggestion, setSuggestion] = useState<{ recipeId: string; rationale: string } | null>(null);

  const categories = ['All', 'Commercial', 'Social Ad', 'Sensory / FX', 'Luxury', 'Lifestyle'];

  const filteredRecipes = filterCategory === 'All'
    ? SCENE_RECIPES
    : SCENE_RECIPES.filter((r) => r.category === filterCategory);

  const handleSuggestRecipe = async () => {
    setBusy(true);
    try {
      const res = await suggestProductShootRecipe({ brief, referenceImages });
      if (res.recipe) {
        setSuggestion({ recipeId: res.recipe.recipeId, rationale: res.recipe.rationale });
        onSelectRecipe(res.recipe.recipeId, res.recipe.generatedRecipe);
      } else {
        setSuggestion(null);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleSelectRecipe = (id: string) => {
    onSelectRecipe(id);
    setSuggestion(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <label className="block text-xs font-semibold tracking-wider uppercase text-text-secondary">
          Commercial Scene Recipe
        </label>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            disabled={!brief.name.trim() || busy}
            title={!brief.name.trim() ? 'Add a product name first' : undefined}
            onClick={handleSuggestRecipe}
            className={`px-2.5 py-1 rounded-md border border-border bg-surface-card text-xs font-semibold transition-colors hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 ${
              busy ? 'animate-pulse' : ''
            }`}
          >
            <Sparkles className="w-3 h-3" />
            Suggest a recipe
          </button>

          {/* Category filters */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full no-scrollbar scroll-smooth">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                  filterCategory === cat
                    ? 'bg-brand text-[var(--brand-foreground)] shadow-[0_2px_8px_var(--shadow-glow)] font-semibold'
                    : 'bg-surface-input text-text-muted hover:text-text-primary border border-border/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {suggestion && (
        <p className="text-[11px] text-text-secondary">
          {suggestion.rationale}
        </p>
      )}

      <div className="grid grid-cols-1 @sm:grid-cols-2 @xl:grid-cols-3 gap-2.5">
        {/* Surprise Me card */}
        <motion.button
          type="button"
          onClick={() => handleSelectRecipe(SURPRISE_RECIPE_ID)}
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
                  Director&apos;s Choice
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
              onClick={() => handleSelectRecipe(recipe.id)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02, duration: 0.18 }}
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
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <RecipeIcon name={recipe.iconName} />
                    <span className="text-xs font-bold text-text-primary truncate">
                      {recipe.label}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full border ${goalMeta.bg} ${goalMeta.text} ${goalMeta.border} shrink-0 max-w-[60%] truncate`}
                  >
                    {goalMeta.label}
                  </span>
                </div>

                <p className="text-[11px] text-text-muted leading-relaxed line-clamp-2">
                  {recipe.summary}
                </p>
              </div>

              {/* Meta row */}
              <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between gap-1.5 text-[10px] text-text-muted font-mono min-w-0">
                <span className="flex items-center gap-1 shrink-0">
                  <Clock className="w-3 h-3 text-text-muted" />
                  ~{recipe.durationHint}s
                </span>
                <span className="flex items-center gap-1 shrink-0">
                  <AspectIcon ratio={recipe.aspectHint} />
                  {recipe.aspectHint}
                </span>
                <span className="text-[10px] text-text-muted/80 truncate min-w-0 flex-1 text-right" title={recipe.category}>
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
