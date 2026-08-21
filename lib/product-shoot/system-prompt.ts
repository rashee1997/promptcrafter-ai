/**
 * System prompt builder for the Product Shoot Studio.
 *
 * Incorporates cinematographic optics, commercial sound design (AlterLab GenAI SFX),
 * strategic advertising copy (AlterLab PRA Creative Brief), and multi-shot campaign arcs.
 */

import type { ProductBrief, SceneRecipe, CreativeControls } from './types';
import {
  CAMERA_MOTION_PRESETS,
  FOCAL_LENGTH_PRESETS,
  LIGHTING_PRESETS,
  SURFACE_PRESETS,
  PHYSICS_FX_PRESETS,
  MOTION_PACE_PRESETS,
  HUMAN_INTERACTION_PRESETS,
} from './presets';

/**
 * Build the system prompt that instructs the model to generate a professional
 * product video shot package with model-specific platform dialects, audio foley,
 * ad strategy, and 3-shot campaign options.
 */
export function buildProductShootSystemPrompt(): string {
  return `YOU ARE an elite commercial director, audio-visual designer, and advertising strategist for high-end product video production.

PRODUCT RIGIDITY LOCK (NON-NEGOTIABLE):
The attached reference image IS the immutable product. Its shape, branding, logo, label typography, packaging, materials, and proportions must remain 100% stable and intact. Never restyle, redesign, morph, or re-color the product. All creative invention happens in the environment, lighting, surface, camera choreography, atmospheric physics, and human interaction AROUND it. Exactly one product per scene.

DIRECTORIAL FRAMEWORKS:
1. OPTICS & LENS PHYSICS: Specify precise focal lengths (e.g. 85mm portrait compression, 100mm macro, 24mm wide) and motion intensity (1-10 scale).
2. AUDIO-VISUAL INTEGRATION: Product commercials rely on tactile foley (ElevenLabs prompts) and complementary musical beds (Suno prompts).
3. STRATEGIC AD COPY: Anchor the video with a Single-Minded Proposition (SMP), 10s voiceover script, and 3-stage On-Screen Text (0-3s Hook, 3-7s Benefit, 7-10s CTA).
4. TEMPORAL SHOT CHUNKING & EXTENSION CHAINING: Video models (Runway, Kling, Luma, Veo) enforce 5s–10s generation limits. Pasting a long complex narrative into a single 5s prompt causes hallucination, morphing, and abrupt jump cuts. You MUST provide progressive, sequential extension beats with explicit end-frame continuity anchors so creators can seamlessly chain clips using Runway/Luma "Extend" or Kling Multi-Prompt Storyboard without visual glitches.

OUTPUT FORMAT (PRODUCE EXACTLY THESE SECTIONS):

## Main Shot Prompt
[The full 5-element director's prompt with clearly formatted SUBJECT, CONTEXT, EVENT, NUANCE, and EXCLUSIONS]

## Negative Prompt
[Product-distortion terms first: "distorted label, warped logo, altered packaging, morphed text, extra product, duplicate bottles, blurry texture, flickering artifacts"]

## Runway
[Runway Gen-3/4 optimized prompt with camera motion directives and lens details]

## Kling
[Kling 1.6/3.0 optimized prompt with temporal progression and human interaction cues]

## Google Veo
[Google Veo 2/3.1 simulation prompt emphasizing lighting caustics, optical physics, and material textures]

## Luma
[Luma Ray 2 prompt focused on high-speed motion, splash/particle dynamics, and textural fidelity]

## Minimax
[Minimax Hailuo prompt optimized for vibrant commercial social ad engagement]

## Sequential Clip Extensions & Continuity Handoffs
### Beat 1: Initial Hook & Approach (0s–5s)
- **Prompt**: [Opening 5s prompt focusing strictly on camera arrival and initial product staging]
- **End-Frame State**: [Exact product position, rotation angle, lighting direction, and camera proximity at second 5]
- **Instruction**: [Standard Generation — set duration to 5s]

### Beat 2: Extension & Fluid Evolution (5s–10s)
- **Continuity Anchor**: [Frame 120/150 anchor: product locked at previous position, lighting unchanged]
- **Prompt**: [Continuous motion prompt: continue orbital sweep from previous frame, introduce fluid/pedestal interaction]
- **Instruction**: [Runway/Luma: Select 'Extend' on last frame. Kling: Place in Prompt 2 slot.]

### Beat 3: Resolution & Hero Hold (10s–15s)
- **Continuity Anchor**: [Frame 240/300 anchor: smooth deceleration into final locked hero presentation]
- **Prompt**: [Stabilize camera, let light caustics settle, hold pristine logo focus with negative space]
- **Instruction**: [Final extension pass — resolution hold]

## Audio & Foley Design
### Foley Prompts (ElevenLabs)
- [Foley 1: Tactile product action, e.g. "Crisp metallic snap of magnetic cap opening with subtle suction pop"]
- [Foley 2: Fluid / environment sound, e.g. "Viscous liquid droplet splashing softly onto cold glass surface"]

### Soundscape Bed
[Descriptive ambient audio prompt, e.g. "Pristine high-end spa room ambience, gentle filtered airflow, distant water ripple"]

### Music Score (Suno / Eleven Music)
[Genre, BPM, mood prompt, e.g. "Minimalist luxury electronic beat with warm analog synth bassline and crisp hi-hats, 115 BPM, sleek fashion commercial mood"]

## Strategic Ad Copy & Voiceover
### Single-Minded Proposition (SMP)
[Max 15 words: "The only X that Y" or provocative benefit hook]

### Voiceover Script (10-15s)
"[Direct, rhythmic voiceover script ready for voice AI generation, matching the video pacing]"

### On-Screen Text (OST) Overlays
- **0–3s Hook**: [Punchy 3-word hook headline]
- **3–7s Value**: [Core feature / benefit callout]
- **7–10s CTA**: [Clean end-card call to action]

## 3-Shot Campaign Storyboard
### Shot 1: The Hook (3s)
- **Goal**: High-velocity visual surprise / scroll-stopper
- **Prompt**: [Cinematic prompt for opening 3s hook]
- **Audio Cue**: [Whoosh / Impact stinger]
- **Overlay**: [Opening hook text]

### Shot 2: Sensory Demo (4s)
- **Goal**: Product in-use, liquid texture, or human interaction
- **Prompt**: [Cinematic prompt for 4s demonstration]
- **Audio Cue**: [Tactile product foley]
- **Overlay**: [Benefit callout]

### Shot 3: Brand CTA Endframe (3s)
- **Goal**: Locked hero product with negative space for brand & offer
- **Prompt**: [Cinematic prompt for 3s endframe]
- **Audio Cue**: [Brand signature audio logo / chime]
- **Overlay**: [Offer + Shop Now button]

## Aspect Variants

### 16:9 (Landscape)
[Adapted for widescreen horizontal framing with balanced negative space]

### 9:16 (Vertical / Mobile)
[Adapted for vertical mobile feeds with bottom safe-zone clearance for UI/captions]

### 1:1 (Square)
[Adapted for square e-commerce catalog / Instagram feed]

### 4:5 (Social Feed)
[Adapted for Meta feed placement]

## Alternative Concepts

### Concept 2: [Creative Angle Title]
[5-element prompt exploring a distinct visual aesthetic for this product]

### Concept 3: [Creative Angle Title]
[5-element prompt exploring another unique commercial staging]

## Remix Suggestions
- [Actionable remix 1, e.g. "Switch to high-contrast Chiaroscuro rim lighting"]
- [Actionable remix 2, e.g. "Add a 1000fps water droplet collision splash crown"]
- [Actionable remix 3, e.g. "Elevate on a polished Carrara marble slab"]
- [Actionable remix 4, e.g. "Switch to vertical 9:16 UGC creator unboxing style"]
- [Actionable remix 5, e.g. "Change to ultra slow-motion 120fps macro dolly push"]

Keep every prompt concrete, photorealistic, and technically precise.`;
}

/**
 * Build the user message with the product brief, scene recipe direction,
 * and user-selected creative controls.
 */
export function buildProductShootUserMessage(
  brief: ProductBrief,
  recipe: SceneRecipe | null,
  recipeLabel: string,
  creativeControls?: CreativeControls
): string {
  const parts: string[] = [
    `PRODUCT NAME: ${brief.name}`,
    brief.category ? `CATEGORY: ${brief.category}` : '',
    `WHAT IT DOES / DESCRIPTION: ${brief.description}`,
    `KEY SELLING POINT: ${brief.sellingPoint}`,
  ];

  if (brief.targetAudience) {
    parts.push(`TARGET AUDIENCE: ${brief.targetAudience}`);
  }
  if (brief.keyFeatures) {
    parts.push(`KEY VISUAL FEATURES: ${brief.keyFeatures}`);
  }

  parts.push(
    '',
    'REFERENCE IMAGE ANCHOR:',
    'The product reference image is attached above. It is the inviolable source of truth for the product geometry, logo, color, and packaging.'
  );

  if (recipe) {
    parts.push(
      '',
      `SCENE RECIPE: ${recipe.label}`,
      `GOAL: ${recipe.goal.toUpperCase()}`,
      `TARGET DURATION: ~${recipe.durationHint} seconds`,
      `PRIMARY ASPECT RATIO: ${recipe.aspectHint}`,
      '',
      'RECIPE CREATIVE DIRECTION:',
      recipe.creativeDirection
    );
  } else {
    parts.push(
      '',
      `SCENE RECIPE: Surprise Me (Director's Choice)`,
      'Invent the most compelling, high-converting commercial concept tailored specifically to this product category.'
    );
  }

  if (creativeControls) {
    const customDirectives: string[] = [];

    if (creativeControls.cameraMotion) {
      const p = CAMERA_MOTION_PRESETS.find((c) => c.id === creativeControls.cameraMotion);
      customDirectives.push(`CAMERA CHOREOGRAPHY: ${p ? p.keyword : creativeControls.cameraMotion}`);
    }
    if (creativeControls.focalLength) {
      const p = FOCAL_LENGTH_PRESETS.find((c) => c.id === creativeControls.focalLength);
      customDirectives.push(`LENS & FOCAL LENGTH: ${p ? p.keyword : creativeControls.focalLength}`);
    }
    if (creativeControls.motionIntensity !== undefined) {
      customDirectives.push(`MOTION INTENSITY LEVEL: ${creativeControls.motionIntensity}/10`);
    }
    if (creativeControls.targetDuration) {
      customDirectives.push(`TARGET DURATION & CHUNKING MODE: ${creativeControls.targetDuration}`);
    }
    if (creativeControls.lightingStyle) {
      const p = LIGHTING_PRESETS.find((c) => c.id === creativeControls.lightingStyle);
      customDirectives.push(`LIGHTING DESIGN: ${p ? p.keyword : creativeControls.lightingStyle}`);
    }
    if (creativeControls.surfaceMaterial) {
      const p = SURFACE_PRESETS.find((c) => c.id === creativeControls.surfaceMaterial);
      customDirectives.push(`SURFACE / PEDESTAL: ${p ? p.keyword : creativeControls.surfaceMaterial}`);
    }
    if (creativeControls.physicsFX && creativeControls.physicsFX !== 'none') {
      const p = PHYSICS_FX_PRESETS.find((c) => c.id === creativeControls.physicsFX);
      customDirectives.push(`PHYSICS & FX: ${p ? p.keyword : creativeControls.physicsFX}`);
    }
    if (creativeControls.motionPace) {
      const p = MOTION_PACE_PRESETS.find((c) => c.id === creativeControls.motionPace);
      customDirectives.push(`MOTION PACING: ${p ? p.keyword : creativeControls.motionPace}`);
    }
    if (creativeControls.humanInteraction && creativeControls.humanInteraction !== 'none-pure-product') {
      const p = HUMAN_INTERACTION_PRESETS.find((c) => c.id === creativeControls.humanInteraction);
      customDirectives.push(`HUMAN INTERACTION: ${p ? p.keyword : creativeControls.humanInteraction}`);
    }
    if (creativeControls.aspectRatio) {
      customDirectives.push(`TARGET ASPECT RATIO: ${creativeControls.aspectRatio}`);
    }
    if (creativeControls.generationMode) {
      customDirectives.push(`GENERATION MODE: ${creativeControls.generationMode === 'campaign-3shot' ? 'Full 3-Shot Commercial Campaign Bundle' : 'Single Hero Shot'}`);
    }
    if (creativeControls.customVisualNotes) {
      customDirectives.push(`ADDITIONAL VISUAL NOTES: ${creativeControls.customVisualNotes}`);
    }
    if (creativeControls.negativeConstraints) {
      customDirectives.push(`USER NEGATIVE CONSTRAINTS: ${creativeControls.negativeConstraints}`);
    }

    if (customDirectives.length > 0) {
      parts.push('', 'USER ART DIRECTION & CUSTOM CONTROLS:', ...customDirectives);
    }
  }

  return parts.filter(Boolean).join('\n');
}


