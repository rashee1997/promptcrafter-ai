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
  Dices,
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
    <div className="space-y-2.5">
      {/* Top Action Bar: Randomize & AI Generator */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleSurpriseMe}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-surface-card border border-border/70 hover:border-brand/40 text-text-secondary hover:text-text-primary transition-colors shrink-0"
        >
          <Dices className="w-3.5 h-3.5 text-brand" />
          <span>Director's Pick</span>
        </button>

        <button
          type="button"
          onClick={onOpenAiGenerator}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-gradient-to-r from-brand/15 to-accent/15 hover:from-brand/25 hover:to-accent/25 text-brand border border-brand/35 shadow-sm transition-all shrink-0"
        >
          <Sparkles className="w-3 h-3 text-brand animate-pulse" />
          <span>+ AI Template</span>
        </button>
      </div>

      {/* Category filter pills */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full no-scrollbar scroll-smooth">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilterCategory(cat)}
            className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors whitespace-nowrap shrink-0 ${
              filterCategory === cat
                ? 'bg-brand text-white shadow-xs font-semibold'
                : 'bg-surface-input text-text-muted hover:text-text-primary border border-border/60'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of clean, compact recipe cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[360px] overflow-y-auto pr-0.5 scrollbar-thin">
        {/* Dynamic Image Mode Cards */}
        {!isLogo &&
          filteredImageRecipes.map((recipe) => {
            const isSelected = selectedRecipeId === recipe.id;
            return (
              <button
                key={recipe.id}
                type="button"
                onClick={() => onSelectImageRecipe(isSelected ? null : recipe)}
                className={`
                  relative rounded-lg border p-2.5 text-left transition-all duration-150 flex flex-col justify-between group
                  ${
                    isSelected
                      ? 'border-brand bg-brand/10 ring-1 ring-brand/40 shadow-xs'
                      : 'border-border/80 bg-surface-card/60 hover:border-brand/40 hover:bg-surface-hover'
                  }
                `}
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <RecipeIcon name={recipe.iconName} />
                      <span className="text-xs font-bold text-text-primary truncate">
                        {recipe.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {recipe.isAiGenerated && (
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => handleDeleteCustom(e, recipe.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              handleDeleteCustom(e as any, recipe.id);
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-error text-text-muted transition-opacity cursor-pointer"
                          title="Delete custom recipe"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </span>
                      )}
                      <span className="text-[8px] font-bold tracking-wider uppercase px-1.5 py-0.2 rounded-full bg-surface-muted text-text-secondary border border-border/50">
                        {recipe.goal}
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-text-muted leading-snug line-clamp-1 mb-2">
                    {recipe.summary}
                  </p>
                </div>

                <div className="pt-1.5 border-t border-border/40 flex items-center justify-between text-[9px] text-text-muted font-mono">
                  <span className="flex items-center gap-1">
                    <AspectIcon ratio={recipe.aspectHint} />
                    {recipe.aspectHint}
                  </span>
                  <span className="truncate max-w-[90px]">
                    {recipe.config.style || 'photo'}
                  </span>
                  <span className="text-text-muted/60 truncate max-w-[65px]">
                    {recipe.category}
                  </span>
                </div>
              </button>
            );
          })}

        {/* Dynamic Logo Mode Cards */}
        {isLogo &&
          filteredLogoArchetypes.map((archetype) => {
            const isSelected = selectedRecipeId === archetype.id;
            return (
              <button
                key={archetype.id}
                type="button"
                onClick={() => onSelectLogoArchetype(isSelected ? null : archetype)}
                className={`
                  relative rounded-lg border p-2.5 text-left transition-all duration-150 flex flex-col justify-between group
                  ${
                    isSelected
                      ? 'border-brand bg-brand/10 ring-1 ring-brand/40 shadow-xs'
                      : 'border-border/80 bg-surface-card/60 hover:border-brand/40 hover:bg-surface-hover'
                  }
                `}
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <RecipeIcon name={archetype.iconName} />
                      <span className="text-xs font-bold text-text-primary truncate">
                        {archetype.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {archetype.isAiGenerated && (
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => handleDeleteCustom(e, archetype.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              handleDeleteCustom(e as any, archetype.id);
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-error text-text-muted transition-opacity cursor-pointer"
                          title="Delete custom archetype"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </span>
                      )}
                      <span className="text-[8px] font-bold tracking-wider uppercase px-1.5 py-0.2 rounded-full bg-surface-muted text-text-secondary border border-border/50">
                        {archetype.goal}
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-text-muted leading-snug line-clamp-1 mb-2">
                    {archetype.summary}
                  </p>
                </div>

                <div className="pt-1.5 border-t border-border/40 flex items-center justify-between text-[9px] text-text-muted font-mono">
                  <span className="truncate max-w-[80px]">
                    {archetype.config.logoType}
                  </span>
                  <span className="truncate max-w-[80px]">
                    {archetype.config.palette}
                  </span>
                  <span className="text-text-muted/60 truncate max-w-[65px]">
                    {archetype.category}
                  </span>
                </div>
              </button>
            );
          })}
      </div>
    </div>
  );
}
