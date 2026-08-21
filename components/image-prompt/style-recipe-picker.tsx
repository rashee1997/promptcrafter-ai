'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Crown,
  Zap,
  Droplets,
  Flame,
  Snowflake,
  Smile,
  CheckCircle2,
  Clapperboard,
  Palette,
  Square,
  Cpu,
  Shapes,
  LayoutGrid,
  Eye,
  PenTool,
  Plus,
  Trash2,
  Monitor,
  Smartphone,
  Layers,
} from 'lucide-react';
import {
  IMAGE_SCENE_RECIPES,
  IMAGE_RECIPE_CATEGORIES,
  SURPRISE_IMAGE_RECIPE_ID,
  getCustomImageRecipes,
  deleteCustomImageRecipe,
} from '@/lib/image-style-recipes';
import {
  LOGO_BRAND_ARCHETYPES,
  LOGO_ARCHETYPE_CATEGORIES,
  SURPRISE_LOGO_ARCHETYPE_ID,
  getCustomLogoArchetypes,
  deleteCustomLogoArchetype,
} from '@/lib/logo-archetypes';
import type { ImageStyleRecipe, LogoArchetypeRecipe } from '@/types';

interface StyleRecipePickerProps {
  mode: 'image' | 'logo';
  selectedRecipeId: string | null;
  onSelectImageRecipe: (recipe: ImageStyleRecipe | null) => void;
  onSelectLogoArchetype: (archetype: LogoArchetypeRecipe | null) => void;
  onOpenAiGenerator: () => void;
}

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
    case 'Palette':
      return <Palette className="w-3.5 h-3.5 text-brand" />;
    case 'Cpu':
      return <Cpu className="w-3.5 h-3.5 text-accent" />;
    case 'Shapes':
      return <Shapes className="w-3.5 h-3.5 text-brand" />;
    case 'LayoutGrid':
      return <LayoutGrid className="w-3.5 h-3.5 text-text-primary" />;
    case 'Eye':
      return <Eye className="w-3.5 h-3.5 text-success" />;
    case 'PenTool':
      return <PenTool className="w-3.5 h-3.5 text-warning" />;
    case 'Square':
      return <Square className="w-3.5 h-3.5 text-text-muted" />;
    default:
      return <Clapperboard className="w-3.5 h-3.5 text-text-muted" />;
  }
}

function AspectIcon({ ratio }: { ratio?: string }) {
  if (ratio === '16:9' || ratio === '21:9') return <Monitor className="w-3 h-3" />;
  if (ratio === '9:16' || ratio === '4:5' || ratio === '3:4') return <Smartphone className="w-3 h-3" />;
  return <Square className="w-3 h-3" />;
}

export function StyleRecipePicker({
  mode,
  selectedRecipeId,
  onSelectImageRecipe,
  onSelectLogoArchetype,
  onOpenAiGenerator,
}: StyleRecipePickerProps) {
  const isLogo = mode === 'logo';
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [customVersion, setCustomVersion] = useState(0);

  const categories = isLogo ? LOGO_ARCHETYPE_CATEGORIES : IMAGE_RECIPE_CATEGORIES;

  // Combine static and user-saved custom AI recipes
  const allImageRecipes = React.useMemo(() => {
    const custom = getCustomImageRecipes();
    return [...custom, ...IMAGE_SCENE_RECIPES];
  }, [customVersion]);

  const allLogoArchetypes = React.useMemo(() => {
    const custom = getCustomLogoArchetypes();
    return [...custom, ...LOGO_BRAND_ARCHETYPES];
  }, [customVersion]);

  const filteredImageRecipes = filterCategory === 'All'
    ? allImageRecipes
    : allImageRecipes.filter((r) => r.category === filterCategory);

  const filteredLogoArchetypes = filterCategory === 'All'
    ? allLogoArchetypes
    : allLogoArchetypes.filter((r) => r.category === filterCategory);

  const handleSurpriseMe = () => {
    if (isLogo) {
      const pool = allLogoArchetypes;
      const random = pool[Math.floor(Math.random() * pool.length)];
      onSelectLogoArchetype(random);
    } else {
      const pool = allImageRecipes;
      const random = pool[Math.floor(Math.random() * pool.length)];
      onSelectImageRecipe(random);
    }
  };

  const handleDeleteCustom = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (isLogo) {
      deleteCustomLogoArchetype(id);
    } else {
      deleteCustomImageRecipe(id);
    }
    setCustomVersion((v) => v + 1);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <label className="block text-xs font-semibold tracking-wider uppercase text-text-secondary">
            {isLogo ? 'Brand Identity Archetype' : 'Visual Scene Recipe'}
          </label>
          <span className="text-[10px] text-text-muted">
            (Predefined Directorial Configs)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* AI Generator Trigger */}
          <button
            type="button"
            onClick={onOpenAiGenerator}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-brand/20 to-accent/20 hover:from-brand/30 hover:to-accent/30 text-brand border border-brand/40 shadow-[0_2px_8px_var(--shadow-glow)] transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand animate-pulse" />
            <span>AI Template Architect</span>
          </button>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full no-scrollbar scroll-smooth">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilterCategory(cat)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors whitespace-nowrap shrink-0 ${
              filterCategory === cat
                ? 'bg-brand text-white shadow-[0_2px_8px_var(--shadow-glow)] font-semibold'
                : 'bg-surface-input text-text-muted hover:text-text-primary border border-border/60'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of recipes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
        {/* Surprise Me / Director's Choice card */}
        <motion.button
          type="button"
          onClick={handleSurpriseMe}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          className={`
            relative rounded-xl border p-3 text-left transition-all duration-200 flex flex-col justify-between
            ${
              selectedRecipeId === (isLogo ? SURPRISE_LOGO_ARCHETYPE_ID : SURPRISE_IMAGE_RECIPE_ID)
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
                  Director's Pick
                </span>
              </div>
              <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/25">
                Randomize
              </span>
            </div>
            <p className="text-[11px] text-text-muted leading-relaxed">
              {isLogo
                ? 'Selects a cohesive brand archetype (mark structure, geometry, and palette) tailored for modern vectors.'
                : 'Selects a balanced photographic or artistic recipe with matching optics, lighting, and film science.'}
            </p>
          </div>
          <div className="mt-2.5 pt-1.5 border-t border-border/40 flex items-center justify-between text-[10px] text-text-muted font-mono">
            <span>Adaptive Style</span>
            <span>·</span>
            <span>Multi-Dialect</span>
          </div>
        </motion.button>

        {/* Dynamic Image Mode Cards */}
        {!isLogo &&
          filteredImageRecipes.map((recipe, i) => {
            const isSelected = selectedRecipeId === recipe.id;
            return (
              <motion.button
                key={recipe.id}
                type="button"
                onClick={() => onSelectImageRecipe(isSelected ? null : recipe)}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.015, duration: 0.15 }}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                className={`
                  relative rounded-xl border p-3 text-left transition-all duration-200 flex flex-col justify-between group
                  ${
                    isSelected
                      ? 'border-brand bg-brand/10 ring-2 ring-brand/30 shadow-[0_4px_16px_var(--shadow-glow)]'
                      : 'border-border bg-surface-card hover:border-brand/40 hover:bg-surface-muted/30'
                  }
                `}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 truncate">
                      <RecipeIcon name={recipe.iconName} />
                      <span className="text-xs font-bold text-text-primary truncate">
                        {recipe.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {recipe.isAiGenerated && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCustom(e, recipe.id)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-error text-text-muted transition-opacity"
                          title="Delete custom recipe"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                      <span className="text-[9px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-surface-muted text-text-secondary border border-border/60">
                        {recipe.goal}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-text-muted leading-relaxed line-clamp-2">
                    {recipe.summary}
                  </p>
                </div>

                <div className="mt-2.5 pt-1.5 border-t border-border/40 flex items-center justify-between text-[10px] text-text-muted font-mono">
                  <span className="flex items-center gap-1">
                    <AspectIcon ratio={recipe.aspectHint} />
                    {recipe.aspectHint}
                  </span>
                  <span className="truncate max-w-[120px] text-[10px]">
                    {recipe.config.style || 'photo'} · {recipe.config.camera || '35mm'}
                  </span>
                  <span className="text-text-muted/70 truncate max-w-[70px]">
                    {recipe.category}
                  </span>
                </div>
              </motion.button>
            );
          })}

        {/* Dynamic Logo Mode Cards */}
        {isLogo &&
          filteredLogoArchetypes.map((archetype, i) => {
            const isSelected = selectedRecipeId === archetype.id;
            return (
              <motion.button
                key={archetype.id}
                type="button"
                onClick={() => onSelectLogoArchetype(isSelected ? null : archetype)}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.015, duration: 0.15 }}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                className={`
                  relative rounded-xl border p-3 text-left transition-all duration-200 flex flex-col justify-between group
                  ${
                    isSelected
                      ? 'border-brand bg-brand/10 ring-2 ring-brand/30 shadow-[0_4px_16px_var(--shadow-glow)]'
                      : 'border-border bg-surface-card hover:border-brand/40 hover:bg-surface-muted/30'
                  }
                `}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 truncate">
                      <RecipeIcon name={archetype.iconName} />
                      <span className="text-xs font-bold text-text-primary truncate">
                        {archetype.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {archetype.isAiGenerated && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCustom(e, archetype.id)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-error text-text-muted transition-opacity"
                          title="Delete custom archetype"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                      <span className="text-[9px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-surface-muted text-text-secondary border border-border/60">
                        {archetype.goal}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-text-muted leading-relaxed line-clamp-2">
                    {archetype.summary}
                  </p>
                </div>

                <div className="mt-2.5 pt-1.5 border-t border-border/40 flex items-center justify-between text-[10px] text-text-muted font-mono">
                  <span className="truncate max-w-[100px]">
                    {archetype.config.logoType}
                  </span>
                  <span className="truncate max-w-[120px] text-[10px]">
                    {archetype.config.palette}
                  </span>
                  <span className="text-text-muted/70 truncate max-w-[70px]">
                    {archetype.category}
                  </span>
                </div>
              </motion.button>
            );
          })}
      </div>
    </div>
  );
}
