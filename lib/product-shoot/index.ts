/**
 * Product Shoot Studio — barrel export.
 *
 * Provides a clean API for all types, presets, storage helpers,
 * platform dialects, and system prompt builders.
 */

export type {
  ProductImage,
  ProductBrief,
  SceneRecipe,
  SceneGoal,
  ProductShootGenerationRequest,
  ProductShootOutput,
  ProductShootSections,
  ShotConcept,
  CreativeControls,
  CameraMotion,
  LightingStyle,
  SurfaceMaterial,
  PhysicsFX,
  MotionPace,
  HumanInteraction,
  VideoAspectRatio,
  VideoPlatformDialect,
  PlatformPrompt,
  SavedProductShoot,
  GenerationMode,
  TargetDuration,
  ExtensionBeat,
  ChainedExtensionPackage,
  AudioDesignPackage,
  AdStrategyPackage,
  CampaignShot,
  ThreeShotCampaign,
} from './types';

export {
  SCENE_RECIPES,
  getRecipeById,
  SURPRISE_RECIPE_ID,
} from './scene-recipes';

export {
  PRODUCT_CATEGORIES,
  CAMERA_MOTION_PRESETS,
  FOCAL_LENGTH_PRESETS,
  MOTION_INTENSITY_PRESETS,
  TARGET_DURATION_PRESETS,
  LIGHTING_PRESETS,
  SURFACE_PRESETS,
  PHYSICS_FX_PRESETS,
  MOTION_PACE_PRESETS,
  HUMAN_INTERACTION_PRESETS,
  ASPECT_RATIOS,
  EXAMPLE_PRODUCT_BRIEFS,
  DEFAULT_CREATIVE_CONTROLS,
} from './presets';

export type {
  OptionPreset,
  MotionIntensityPreset,
  DurationPreset,
  ExampleProductBrief,
} from './presets';

export {
  getSavedProductShoots,
  saveProductShoot,
  deleteSavedProductShoot,
  toggleFavoriteProductShoot,
  clearAllSavedProductShoots,
} from './storage';

export {
  PLATFORM_METAS,
  parseProductShootOutput,
} from './dialects';

export type { PlatformMeta } from './dialects';

export {
  buildProductShootSystemPrompt,
  buildProductShootUserMessage,
} from './system-prompt';

