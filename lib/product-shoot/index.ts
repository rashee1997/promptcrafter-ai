/**
 * Product Shoot Studio — barrel export.
 *
 * This module is completely isolated from the Video Prompt Studio.
 * Deleting the entire `lib/product-shoot/` folder plus the corresponding
 * `components/product-shoot/` folder and two lines in `app/page.tsx`
 * removes the feature with zero impact on anything else.
 */

export type {
  ProductImage,
  ProductBrief,
  SceneRecipe,
  SceneGoal,
  ProductShootGenerationRequest,
  ProductShootOutput,
  ShotConcept,
} from './types';

export { SCENE_RECIPES, getRecipeById, SURPRISE_RECIPE_ID } from './scene-recipes';
export {
  buildProductShootSystemPrompt,
  buildProductShootUserMessage,
} from './system-prompt';
