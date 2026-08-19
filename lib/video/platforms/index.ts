// Video Prompt Studio — Phase 3 platform knowledge base.
// Barrel export: one place to import any platform spec.

export { veo } from './veo';
export { kling } from './kling';
export { seedance } from './seedance';
export { higgsfield } from './higgsfield';
export { runway } from './runway';
export { luma } from './luma';
export { pika } from './pika';

import type { PlatformSpec, VideoTargetPlatform } from '@/types/video';
import { veo } from './veo';
import { kling } from './kling';
import { seedance } from './seedance';
import { higgsfield } from './higgsfield';
import { runway } from './runway';
import { luma } from './luma';
import { pika } from './pika';

/**
 * Registry — every supported platform, keyed by id. The drafting AI and the
 * Phase 2 picker UI both look up specs from here so there is a single source
 * of truth for constraints, dialogue syntax, and usage instructions.
 */
export const PLATFORM_SPECS: Record<VideoTargetPlatform, PlatformSpec> = {
  veo,
  kling,
  seedance,
  higgsfield,
  runway,
  luma,
  pika,
};

/**
 * Looks up a platform spec by id. Returns undefined if the id is not in the
 * registry (backward-compatible with old projects that have no platform set).
 */
export function getPlatformSpec(id: VideoTargetPlatform | null | undefined): PlatformSpec | undefined {
  if (!id) return undefined;
  return PLATFORM_SPECS[id];
}
