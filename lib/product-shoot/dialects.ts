/**
 * Dialect parsing and platform adaptation for Product Shoot Studio.
 *
 * Translates generated commercial prompts into model-specific dialects
 * (Runway Gen-3/4, Kling, Google Veo, Luma Ray 2, Minimax Hailuo),
 * parses streaming output into structured cards, and generates remix suggestions.
 */

import type { ProductShootSections, VideoPlatformDialect } from './types';

/** Platform metadata and formatting tips. */
export interface PlatformMeta {
  id: VideoPlatformDialect;
  name: string;
  badge: string;
  description: string;
  bestFor: string;
}

export const PLATFORM_METAS: Record<VideoPlatformDialect, PlatformMeta> = {
  master: {
    id: 'master',
    name: 'Master Prompt',
    badge: 'Standard 5-Part',
    description: 'Comprehensive director brief with Subject, Context, Event, Nuance & Exclusions.',
    bestFor: 'Universal base, script breakdown, reference prompt',
  },
  runway: {
    id: 'runway',
    name: 'Runway Gen-3 / Gen-4',
    badge: 'Camera Motion Syntax',
    description: 'Optimized with Runway camera motion syntax, lens specifications, and smooth velocity.',
    bestFor: 'Dynamic camera sweeps, macro tracking, cinematic lighting',
  },
  kling: {
    id: 'kling',
    name: 'Kling 1.6 / 3.0',
    badge: 'Temporal & Human Motion',
    description: 'Chronological timeline cues and natural human-object interaction.',
    bestFor: 'Human hand interactions, pouring, unboxing, UGC demos',
  },
  veo: {
    id: 'veo',
    name: 'Google Veo 2 / 3.1',
    badge: 'Physical World Simulation',
    description: 'Granular optical details, natural light dispersion, and material physics.',
    bestFor: 'Fluid dynamics, crystalline caustics, architectural lighting',
  },
  luma: {
    id: 'luma',
    name: 'Luma Ray 2',
    badge: 'High-Impact Physics',
    description: 'High-speed physical collisions, liquid dynamics, and textural macro fidelity.',
    bestFor: 'Water splash crowns, mist condensation, kinetic explosions',
  },
  minimax: {
    id: 'minimax',
    name: 'Minimax Hailuo',
    badge: 'Punchy Social Motion',
    description: 'Concise high-energy directives tuned for aesthetic commercial consistency.',
    bestFor: 'Fast-paced social media ads, viral hooks, vibrant lighting',
  },
};

/**
 * Robustly parse the AI generation stream into structured sections.
 */
export function parseProductShootOutput(raw: string): ProductShootSections {
  if (!raw || raw.trim().length === 0) {
    return {
      mainPrompt: '',
      negativePrompt: '',
      aspectVariants: [],
      alternativeConcepts: [],
      remixSuggestions: [],
    };
  }

  // 1. Extract Main Prompt
  const mainPrompt = extractSection(raw, 'Main Shot Prompt', ['Negative Prompt', 'Runway', 'Kling', 'Veo', 'Luma', 'Minimax', 'Aspect Variants']);

  // 2. Extract Negative Prompt
  const negativePrompt = extractSection(raw, 'Negative Prompt', ['Runway', 'Kling', 'Veo', 'Luma', 'Minimax', 'Aspect Variants', 'Alternative Concepts']);

  // 3. Extract Model Dialects
  const runwayPrompt = extractSection(raw, 'Runway', ['Kling', 'Veo', 'Luma', 'Minimax', 'Aspect Variants', 'Alternative Concepts', 'Negative Prompt']);
  const klingPrompt = extractSection(raw, 'Kling', ['Veo', 'Luma', 'Minimax', 'Aspect Variants', 'Alternative Concepts', 'Negative Prompt']);
  const veoPrompt = extractSection(raw, 'Google Veo', ['Luma', 'Minimax', 'Aspect Variants', 'Alternative Concepts', 'Negative Prompt'])
    || extractSection(raw, 'Veo', ['Luma', 'Minimax', 'Aspect Variants', 'Alternative Concepts', 'Negative Prompt']);
  const lumaPrompt = extractSection(raw, 'Luma', ['Minimax', 'Aspect Variants', 'Alternative Concepts', 'Negative Prompt']);
  const minimaxPrompt = extractSection(raw, 'Minimax', ['Aspect Variants', 'Alternative Concepts', 'Negative Prompt', 'Remix'])
    || extractSection(raw, 'Hailuo', ['Aspect Variants', 'Alternative Concepts', 'Negative Prompt', 'Remix']);

  // 4. Extract Aspect Variants
  const aspectVariants: { ratio: string; prompt: string }[] = [];
  const ratios = ['16:9', '9:16', '1:1', '4:5'];
  for (const ratio of ratios) {
    const nextRatios = ratios.filter((r) => r !== ratio);
    const stopLabels = [...nextRatios.map((r) => `${r}`), 'Alternative Concepts', 'Remix'];
    const p = extractSection(raw, ratio, stopLabels);
    if (p && p.length > 10) {
      aspectVariants.push({ ratio, prompt: p });
    }
  }

  // 5. Extract Alternative Concepts
  const alternativeConcepts: { title: string; prompt: string }[] = [];
  const conceptMatches = raw.matchAll(
    /###\s*Concept\s*\d*:\s*([^\n\r]+)[\n\r]+([\s\S]*?)(?=###\s*Concept\s*\d*:|##\s|$)/gi
  );
  for (const match of conceptMatches) {
    const title = match[1].replace(/^[#\s*]+/, '').trim();
    const prompt = match[2].trim();
    if (title && prompt) {
      alternativeConcepts.push({ title, prompt });
    }
  }

  // 7. Extract Audio & Foley Design (ElevenLabs / Suno)
  let audioDesign = undefined;
  const audioRaw = extractSection(raw, 'Audio & Foley Design', ['Strategic Ad Copy', '3-Shot Campaign', 'Aspect Variants', 'Alternative Concepts']);
  if (audioRaw) {
    const foleyPrompts: string[] = [];
    const foleyMatches = audioRaw.matchAll(/-\s*(?:\[Foley\s*\d*:\s*)?([^\n\r]+)/gi);
    for (const m of foleyMatches) {
      const line = m[1].replace(/\]$/, '').trim();
      if (line && line.length > 5) foleyPrompts.push(line);
    }

    const soundscapeBed = extractSection(audioRaw, 'Soundscape Bed', ['Music Score', '###', '##']) || 'Ambient luxury room atmosphere, subtle air circulation, gentle acoustic depth';
    const musicScore = extractSection(audioRaw, 'Music Score', ['###', '##']) || 'Warm minimalist ambient electronic beat, 115 BPM, sleek modern commercial vibe';

    audioDesign = {
      foleyPrompts: foleyPrompts.length > 0 ? foleyPrompts : [
        'Crisp tactile snap of product cap opening with subtle vacuum release sound',
        'Viscous liquid droplet landing smoothly onto glass surface in slow motion'
      ],
      soundscapeBed,
      musicScore,
    };
  }

  // 8. Extract Strategic Ad Copy & Voiceover
  let adStrategy = undefined;
  const adRaw = extractSection(raw, 'Strategic Ad Copy & Voiceover', ['3-Shot Campaign', 'Audio & Foley', 'Aspect Variants', 'Alternative Concepts']);
  if (adRaw) {
    const smp = extractSection(adRaw, 'Single-Minded Proposition (SMP)', ['###', '##']) || extractSection(adRaw, 'Single-Minded Proposition', ['###', '##']);
    const voiceoverScript = extractSection(adRaw, 'Voiceover Script', ['###', '##']);
    const hookCaption = extractSection(adRaw, '0–3s Hook', ['3–7s', '7–10s', '###']) || extractSection(adRaw, 'Hook', ['Value', 'CTA', '###']);
    const valueCaption = extractSection(adRaw, '3–7s Value', ['7–10s', '###']) || extractSection(adRaw, 'Value', ['CTA', '###']);
    const ctaCaption = extractSection(adRaw, '7–10s CTA', ['###', '##']) || extractSection(adRaw, 'CTA', ['###', '##']);

    adStrategy = {
      smp: smp.replace(/^["']|["']$/g, '').trim() || 'The only product engineered for uncompromising daily perfection.',
      voiceoverScript: voiceoverScript.replace(/^["']|["']$/g, '').trim(),
      onScreenCaptions: {
        hook: hookCaption.replace(/^[*:\-\s]+/, '').trim() || 'Experience the difference.',
        benefit: valueCaption.replace(/^[*:\-\s]+/, '').trim() || 'Engineered with pure active ingredients.',
        cta: ctaCaption.replace(/^[*:\-\s]+/, '').trim() || 'Available Now · Shop Online',
      },
    };
  }

  // 9. Extract 3-Shot Campaign Storyboard
  let threeShotCampaign = undefined;
  const campaignRaw = extractSection(raw, '3-Shot Campaign Storyboard', ['Aspect Variants', 'Alternative Concepts', 'Remix Suggestions']);
  if (campaignRaw) {
    const shot1Raw = extractSection(campaignRaw, 'Shot 1: The Hook', ['Shot 2:', '###', '##']);
    const shot2Raw = extractSection(campaignRaw, 'Shot 2: Sensory Demo', ['Shot 3:', '###', '##']);
    const shot3Raw = extractSection(campaignRaw, 'Shot 3: Brand CTA Endframe', ['###', '##']);

    if (shot1Raw || shot2Raw || shot3Raw) {
      threeShotCampaign = {
        shot1Hook: {
          shotNumber: 1,
          title: 'The Hook',
          goal: 'Visual Surprise & Attention Stop',
          durationSeconds: 3,
          prompt: extractSection(shot1Raw, 'Prompt:', ['Audio Cue:', 'Overlay:', '###']) || shot1Raw.slice(0, 200),
          foleyCue: extractSection(shot1Raw, 'Audio Cue:', ['Overlay:', '###']) || 'Dynamic whoosh stinger on impact',
          onScreenText: extractSection(shot1Raw, 'Overlay:', ['###', '##']) || 'Look closer.',
        },
        shot2SensoryDemo: {
          shotNumber: 2,
          title: 'Sensory Demo',
          goal: 'Product in Action & Texture Reveal',
          durationSeconds: 4,
          prompt: extractSection(shot2Raw, 'Prompt:', ['Audio Cue:', 'Overlay:', '###']) || shot2Raw.slice(0, 200),
          foleyCue: extractSection(shot2Raw, 'Audio Cue:', ['Overlay:', '###']) || 'Crisp tactile product dispensing sound',
          onScreenText: extractSection(shot2Raw, 'Overlay:', ['###', '##']) || 'Instant transformation.',
        },
        shot3BrandCta: {
          shotNumber: 3,
          title: 'Brand CTA Endframe',
          goal: 'Brand Memorability & Conversion',
          durationSeconds: 3,
          prompt: extractSection(shot3Raw, 'Prompt:', ['Audio Cue:', 'Overlay:', '###']) || shot3Raw.slice(0, 200),
          foleyCue: extractSection(shot3Raw, 'Audio Cue:', ['Overlay:', '###']) || 'Brand signature audio chime',
          onScreenText: extractSection(shot3Raw, 'Overlay:', ['###', '##']) || 'Shop Now · Free Shipping',
        },
      };
    }
  }

  // 10. Extract Sequential Clip Extensions & Continuity Handoffs
  let chainedExtensions = undefined;
  const extensionRaw = extractSection(raw, 'Sequential Clip Extensions', ['Audio & Foley', 'Strategic Ad Copy', '3-Shot Campaign', 'Aspect Variants', 'Alternative Concepts']);
  if (extensionRaw) {
    const beats = [];
    const beat1Raw = extractSection(extensionRaw, 'Beat 1', ['Beat 2', '###', '##']);
    const beat2Raw = extractSection(extensionRaw, 'Beat 2', ['Beat 3', '###', '##']);
    const beat3Raw = extractSection(extensionRaw, 'Beat 3', ['Beat 4', '###', '##']);

    if (beat1Raw) {
      beats.push({
        beatNumber: 1,
        timecodeRange: '0s–5s',
        beatTitle: 'Initial Hook & Approach',
        continuityAnchor: 'Frame 0 Anchor: Reference Image Product Position',
        extensionPrompt: extractSection(beat1Raw, 'Prompt:', ['End-Frame State:', 'Instruction:', '###']) || beat1Raw.slice(0, 250),
        modelInstruction: extractSection(beat1Raw, 'Instruction:', ['###', '##']) || 'Standard Initial Generation (Duration: 5s)',
      });
    }

    if (beat2Raw) {
      beats.push({
        beatNumber: 2,
        timecodeRange: '5s–10s',
        beatTitle: 'Extension & Fluid Evolution',
        continuityAnchor: extractSection(beat2Raw, 'Continuity Anchor:', ['Prompt:', '###']) || 'Lock product position & lighting from second 5',
        extensionPrompt: extractSection(beat2Raw, 'Prompt:', ['Instruction:', '###']) || beat2Raw.slice(0, 250),
        modelInstruction: extractSection(beat2Raw, 'Instruction:', ['###', '##']) || 'Runway / Luma: Select Extend from last frame. Kling: Prompt 2.',
      });
    }

    if (beat3Raw) {
      beats.push({
        beatNumber: 3,
        timecodeRange: '10s–15s',
        beatTitle: 'Resolution & Hero Hold',
        continuityAnchor: extractSection(beat3Raw, 'Continuity Anchor:', ['Prompt:', '###']) || 'Smooth deceleration into final locked frame',
        extensionPrompt: extractSection(beat3Raw, 'Prompt:', ['Instruction:', '###']) || beat3Raw.slice(0, 250),
        modelInstruction: extractSection(beat3Raw, 'Instruction:', ['###', '##']) || 'Final extension pass with stabilized framing.',
      });
    }

    if (beats.length > 0) {
      chainedExtensions = {
        totalDurationSeconds: beats.length * 5,
        beats,
      };
    }
  }

  // 11. Extract Remix Suggestions
  const remixSuggestions: string[] = [];
  const remixRaw = extractSection(raw, 'Remix Suggestions', ['## ']);
  if (remixRaw) {
    const lines = remixRaw.split('\n');
    for (const line of lines) {
      const cleaned = line.replace(/^[-*•\d.)\s]+/, '').trim();
      if (cleaned && cleaned.length > 5 && cleaned.length < 120) {
        remixSuggestions.push(cleaned);
      }
    }
  }

  if (remixSuggestions.length === 0 && mainPrompt) {
    remixSuggestions.push(
      'Switch to dramatic chiaroscuro rim lighting with deep shadows',
      'Add high-speed fluid splash crown around product base',
      'Convert to vertical 9:16 UGC creator unboxing style',
      'Elevate product on polished Carrara marble plinth',
      'Change to ultra slow-motion 120fps macro lens sweep'
    );
  }

  return {
    mainPrompt: mainPrompt || raw.slice(0, 500),
    negativePrompt: negativePrompt || 'distorted label, morphed text, extra products, warped packaging, blurry details, duplicate bottle',
    runwayPrompt: runwayPrompt || undefined,
    klingPrompt: klingPrompt || undefined,
    veoPrompt: veoPrompt || undefined,
    lumaPrompt: lumaPrompt || undefined,
    minimaxPrompt: minimaxPrompt || undefined,
    aspectVariants,
    alternativeConcepts,
    remixSuggestions,
    audioDesign,
    adStrategy,
    threeShotCampaign,
    chainedExtensions,
  };
}

/** Helper to extract a subsection between markdown headers. */
function extractSection(text: string, headerName: string, stopHeaders: string[]): string {
  const headerRegex = new RegExp(
    `(?:##+\\s*|#+\\s*|\\*\\*\\s*)?${escapeRegExp(headerName)}[^\\n\\r]*[\\n\\r]+`,
    'i'
  );
  const match = headerRegex.exec(text);
  if (!match) return '';

  const startIndex = match.index + match[0].length;
  const subText = text.slice(startIndex);

  // Build stop pattern from stopHeaders
  const stopPatterns = stopHeaders.map((h) => escapeRegExp(h)).join('|');
  const stopRegex = new RegExp(
    `(?:[\\n\\r]+(?:##+|#+|\\*\\*|###+)\\s*(?:${stopPatterns}))`,
    'i'
  );

  const stopMatch = stopRegex.exec(subText);
  const result = stopMatch ? subText.slice(0, stopMatch.index) : subText;

  return result.trim();
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
