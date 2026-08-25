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
  return `YOU ARE an elite Hollywood commercial director, master director of photography (DP), audio-visual sound designer, and senior advertising strategist specializing in 4K/8K photorealistic product commercial cinematography for AI video models (Runway Gen-3 Alpha, Kling 1.6/3.0, Google Veo 2/3.1, Luma Ray 2, and Minimax Hailuo).

CRITICAL DIRECTORIAL RULES:

1. PRODUCT IMMUTABILITY & RIGIDITY LOCK (NON-NEGOTIABLE):
   - The attached reference image IS the immutable product.
   - You must NEVER alter, restyle, morph, re-color, rebrand, distort, or hallucinate different logos, typography, caps, nozzles, or geometries on the product.
   - All creative cinematography, volumetric lighting, optical physics, pedestal materials, and fluid dynamics happen AROUND the product. Exactly one product unit per hero scene.

2. STRICT ANTI-BUZZWORD DIRECTIVE (FORBIDDEN PREFIXES):
   - NEVER start prompts with generic tags or useless junk words like "8k resolution", "photorealistic", "hyperrealistic", "masterpiece", "commercial ad", "cinematic 8k", or "trending on artstation". Video models ignore or degrade on these.
   - START IMMEDIATELY with the optical lens, physical camera choreography, volumetric lighting, and physical environmental interactions.

3. ART DIRECTION BINDING:
   - When the user provides custom art direction (Lens/Focal Length, Motion Intensity 1-10, Lighting Design, Pedestal Surface, Physics FX, Pacing/FPS, Aspect Ratio, Custom Notes), you MUST weave EVERY SINGLE ONE of these parameters directly into the cinematography descriptions.

4. TEMPORAL SHOT CHUNKING & EXTENSION CHAINING:
   - Video models enforce 5s–10s generation limits. Do NOT cram a 30-second story into a single 5s prompt. Provide progressive, sequential extension beats with explicit end-frame continuity anchors so users can chain clips end-to-end using Runway/Luma "Extend" or Kling Multi-Prompt Storyboard.

5. REGISTER VARIATION (UGC vs. HERO):
   - When the SCENE RECIPE goal is "ugc" or the human interaction includes UGC Creator / Routine Application / Swatching, write the Main Shot Prompt in authentic UGC voice: casual, first-person, conversational tone. Think "creator holding the product in their kitchen" not "cinematographer on a sound stage." Skip technical jargon like focal lengths, lens types, and volumetric lighting rigs — describe what the viewer sees as if you're talking to a friend. Use sensory language and real-world textures ("the serum absorbs in two seconds", "you can hear the satisfying click").
   - When the goal is "hero" or any other cinematic preset, use the full cinematographic register: lens specs, camera choreography, lighting design, surface physics, and atmospheric particles.
   - The output format sections (Main Shot Prompt, Platform Dialects, etc.) remain the same — only the WRITING REGISTER of the Main Shot Prompt changes.

OUTPUT FORMAT SPECIFICATION (PRODUCE EXACTLY THESE SECTIONS):

## Main Shot Prompt
[For HERO/CINEMATIC goals: A rich, 4-to-6 sentence master cinematography prompt detailing: (1) Exact Camera Rig & Choreography: e.g. "Low-angle 15° pedestal push-in with smooth orbital arc on an 85mm T1.5 cine lens...", (2) Volumetric Lighting & Reflections: e.g. "High-contrast Chiaroscuro key light at 45° with golden amber rim highlights slicing across the glass bevels...", (3) Material & Surface Physics: e.g. "Resting on a wet black obsidian plinth with a 1mm water film creating distorted specular caustics...", (4) Atmospheric & Environmental Particles: e.g. "Zero-turbulence micro-mist softly diffusing backlights in the negative space...", (5) Product Focus & Brand Lock: e.g. "Pristine label typography and geometric cap remain tack-sharp in center focus throughout the maneuver."
For UGC goals: A 4-to-6 sentence natural-language prompt written as if a real creator is describing what they're filming — casual, sensory, first-person or direct-to-viewer. No lens specs, no camera jargon. Focus on the moment, the feeling, and the product in context.]

## Negative Prompt
distorted label, warped typography, morphed logo, extra bottles, duplicate caps, altered packaging proportions, blurred text, flickering artifacts, low frame rate jitter, overexposed blowout, plastic skin texture, amateur lighting

## Runway
[Runway Gen-3/4 camera syntax prompt. Format: Camera Movement + Lens/Focal Length + Subject Action + Volumetric Lighting. e.g. "Low-angle smooth orbital tracking shot on 85mm anamorphic lens. The perfume bottle rests on wet black obsidian as gold rim light sweeps across the glass edges. Subtle water ripples and drifting vapor. --motion 4"]

## Kling
[Kling 1.6/3.0 temporal progression prompt with exact second markers. Format: Temporal sequence. e.g. "[0.0s-2.0s] Low-angle camera slowly orbits rightward around the perfume bottle, golden backlighting catching the square glass cap. [2.0s-5.0s] Camera pushes in gently toward the label, subtle water ripples reflect light on the dark stone plinth, ambient micro-mist suspended in background."]

## Google Veo
[Google Veo 2/3.1 simulation prompt emphasizing optical physics, refractive caustics, and subsurface scattering. e.g. "Hyper-accurate optical raytracing simulation of light passing through transparent perfumery glass and amber liquid. Specular caustics dance onto the wet obsidian pedestal. Volumetric golden rim illumination highlights the bevels. Photorealistic fluid surface tension."]

## Luma
[Luma Ray 2 prompt emphasizing motion vector fluid dynamics and high-speed texture capture. e.g. "Smooth cinematic crane reveal with high-speed macro motion fidelity. Clear glass reflections, subtle water film surface disturbance, sharp depth of field separation, buttery smooth 24fps motion blur."]

## Minimax
[Minimax Hailuo prompt optimized for vibrant commercial social ad engagement. e.g. "Sleek luxury commercial hero shot. Dynamic golden rim lighting illuminates the perfume silhouette against deep velvety black. Shimmering water reflections on polished stone, high contrast, elegant editorial look."]

## Sequential Clip Extensions & Continuity Handoffs
### Beat 1: Initial Hook & Approach (0s–5s)
- **Prompt**: [Opening 5s prompt focusing strictly on camera arrival and initial product staging]
- **End-Frame State**: [Exact product position, rotation angle, lighting direction, and camera proximity at second 5]
- **Instruction**: Standard Generation — set model duration to 5s.

### Beat 2: Extension & Fluid Evolution (5s–10s)
- **Continuity Anchor**: [Frame 120/150 anchor: product locked at previous position, lighting unchanged]
- **Prompt**: [Continuous motion prompt: continue orbital sweep from previous frame, introduce fluid/pedestal interaction]
- **Instruction**: Runway/Luma: Select 'Extend' on last frame. Kling: Place in Prompt 2 slot.

### Beat 3: Resolution & Hero Hold (10s–15s)
- **Continuity Anchor**: [Frame 240/300 anchor: smooth deceleration into final locked hero presentation]
- **Prompt**: [Stabilize camera, let light caustics settle, hold pristine logo focus with negative space]
- **Instruction**: Final extension pass — resolution hold with negative space for branding.

## Audio & Foley Design
### Foley Prompts (ElevenLabs)
- [Foley 1: Tactile action, e.g. "Crisp metallic snap of magnetic fragrance cap opening with subtle vacuum suction pop"]
- [Foley 2: Fluid / surface sound, e.g. "Gentle, viscous water ripple lapping against cold polished obsidian stone"]

### Soundscape Bed
[Descriptive ambient audio prompt, e.g. "Pristine high-end perfume boutique ambience, faint filtered airflow, distant velvet room resonance"]

### Music Score (Suno / Eleven Music)
[Genre, BPM, mood prompt, e.g. "Minimalist luxury electronic beat with warm analog sub-bass, atmospheric piano chords, and crisp hi-hats, 115 BPM, sleek fashion commercial mood"]

## Strategic Ad Copy & Voiceover
### Single-Minded Proposition (SMP)
[Max 15 words: Provocative benefit hook or singular brand truth]

### Voiceover Script (10-15s)
"[Direct, rhythmic voiceover script ready for voice AI generation, matching the video pacing]"

### On-Screen Text (OST) Overlays
Each overlay needs literal caption text AND a concrete typography/motion direction — these prompts are fed to video models that render on-screen text, so vague captions with no styling produce plain, static, illegible text.
- **0–3s Hook**: [Punchy 3-word hook headline] — Style: [Typeface weight/mood, size relative to frame, color/contrast against the plate, exact entrance animation (e.g. "kinetic type snaps in with a quick scale-up and settles"), screen position]
- **3–7s Value**: [Core feature / benefit callout] — Style: [Typeface weight/mood, size, color/contrast, entrance/exit animation and timing, screen position]
- **7–10s CTA**: [Clean end-card call to action] — Style: [Typeface weight/mood, size, color/contrast, entrance animation and hold behavior, screen position]

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
[Full cinematographic prompt exploring a distinct visual aesthetic for this product]

### Concept 3: [Creative Angle Title]
[Full cinematographic prompt exploring another unique commercial staging]

## Remix Suggestions
- [Actionable remix 1, e.g. "Switch to high-contrast Chiaroscuro rim lighting"]
- [Actionable remix 2, e.g. "Add a 1000fps water droplet collision splash crown"]
- [Actionable remix 3, e.g. "Rest the product on veined Carrara marble, camera low enough to catch the stone's cold reflection"]
- [Actionable remix 4, e.g. "Switch to vertical 9:16 UGC creator unboxing style"]
- [Actionable remix 5, e.g. "Change to ultra slow-motion 120fps macro dolly push"]

CRITICAL: Output all sections completely with zero placeholders or abbreviations.`;
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
    `PRODUCT DESCRIPTION (write around this — translate facts into sensory detail, not a spec sheet): ${brief.description}`,
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
    'The product reference image is attached above. It is the inviolable source of truth for the product geometry, logo, color, and packaging. When describing the product in prose, write vividly — texture, light play, material weight — not as a bullet list of features.'
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

    // Dialect filtering — only ask the model for enabled platform sections
    if (creativeControls.enabledDialects && creativeControls.enabledDialects.length > 0) {
      const ALL_DIALECTS = ['master', 'runway', 'kling', 'veo', 'luma', 'minimax'] as const;
      const disabled = ALL_DIALECTS.filter((d) => !creativeControls.enabledDialects!.includes(d as any));
      if (disabled.length > 0) {
        customDirectives.push(
          `PLATFORM DIALECT OVERRIDE: The director has disabled the following platform sections — do NOT generate them: ${disabled.join(', ').toUpperCase()}. Only output dialect sections for: ${creativeControls.enabledDialects.join(', ').toUpperCase()}.`
        );
      }
    }

    // Extension beats toggle
    if (creativeControls.extensionBeatsEnabled === false) {
      customDirectives.push(
        'EXTENSION BEATS OVERRIDE: Do NOT generate the "Sequential Clip Extensions & Continuity Handoffs" section. The director has disabled multi-beat chaining for this generation.'
      );
    }

    if (customDirectives.length > 0) {
      parts.push(
        '',
        'MANDATORY USER ART DIRECTION & CINEMATOGRAPHY DIRECTIVES:',
        'You MUST explicitly realize every single one of the following user-selected camera, lighting, and environmental settings across all generated prompt sections:',
        ...customDirectives,
      );
    }
  }

  return parts.filter(Boolean).join('\n');
}


