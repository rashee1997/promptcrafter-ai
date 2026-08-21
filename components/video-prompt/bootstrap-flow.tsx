'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Clapperboard, Sparkles } from 'lucide-react';
import type { ProviderConfig } from '@/types';
import { getVisualStyle, type VisualStyle } from '@/lib/video/styles';
import type {
  DirectionPlan,
  ScreenplayScene,
  ScriptDialogueDraft,
  StoryTreatment,
  ThinkingOrbState,
  VideoCharacter,
  VideoLocation,
  VideoProject,
  VideoTargetPlatform,
} from '@/types/video';
import { regenerateCharacterImagePrompt, runVideoBootstrap, suggestVideoLocations } from '@/lib/ai-client';
import { getSavedProviders } from '@/lib/storage';
import { saveVideoProject } from '@/lib/video-storage';
import type {
  APIBootstrapStage,
  BootstrapContext,
  EffectsCandidate,
  ScriptTreatment,
  StyleCandidate,
  VideoBootstrapResponse,
  VideoBootstrapStage,
} from '@/lib/video/bootstrap/types';
import { cn } from '@/lib/utils';
import { ThinkingOrb } from './thinking-orb';
import { BootstrapProgress } from './bootstrap-progress';
import { BootstrapModelSelector, type StageModelRef } from './bootstrap-model-selector';
import { BootstrapPlatformStep } from './bootstrap-platform-step';
import { BootstrapStoryStep } from './bootstrap-story-step';
import { BootstrapDialogueStep } from './bootstrap-dialogue-step';
import { BootstrapScreenplayStep } from './bootstrap-screenplay-step';
import { BootstrapDirectionStep } from './bootstrap-direction-step';
import { BootstrapCharactersStep } from './bootstrap-characters-step';
import { BootstrapScenesStep } from './bootstrap-scenes-step';
import { BootstrapStyleStep } from './bootstrap-style-step';
import { BootstrapEffectsStep } from './bootstrap-effects-step';

interface BootstrapFlowProps {
  intent: string;
  customInstructions?: string;
  provider: ProviderConfig;
  project: VideoProject;
  onComplete: (project: VideoProject) => void;
}

const STAGE_OVERRIDE_KEY = 'promptcrafter_video_stage_models';

/**
 * Phase B — 10-step progress rail: Platform → Story → Dialogue → Screenplay →
 * Direction → Characters → Locations → Style → VFX → Activate.
 * Platform is Stage 0 (UI-only). Stages 1–9 are AI generation stages.
 */
const STAGE_META: { id: VideoBootstrapStage; label: string; state: ThinkingOrbState; hint: string }[] = [
  { id: 0, label: 'Platform', state: 'breathing', hint: 'Pick one target platform before any shot is drafted' },
  { id: 1, label: 'Story', state: 'composing', hint: 'Prose treatment — logline, premise, acts, emotional arc' },
  { id: 2, label: 'Dialogue', state: 'composing', hint: 'Script — spoken lines and action, no camera language' },
  { id: 3, label: 'Screenplay', state: 'shaping', hint: 'Formatted scenes with sluglines and shot estimates' },
  { id: 4, label: 'Direction', state: 'weaving', hint: 'Camera, lens, lighting, sound — the shooting plan' },
  { id: 5, label: 'Characters', state: 'shaping', hint: 'Cast with fixed appearance & wardrobe' },
  { id: 6, label: 'Locations', state: 'searching', hint: 'Scouted environments, fixed descriptions' },
  { id: 7, label: 'Visual style', state: 'weaving', hint: 'Pick a style from the library, optionally tailor with AI' },
  { id: 8, label: 'VFX direction', state: 'solving', hint: 'One treatment — locks effects & pacing' },
  { id: 9, label: 'Activate', state: 'breathing', hint: 'Lock style & VFX, start production' },
];

/** Maps internal step (0–9) to the API stage number (1–8). */ 
function stepToApiStage(step: VideoBootstrapStage): APIBootstrapStage | null {
  if (step === 0 || step === 9) return null;
  // Steps 1–4 → API stages 1–4 (story pipeline)
  // Steps 5–8 → API stages 5–8 (legacy pipeline)
  return step as APIBootstrapStage;
}

const BUSY_LABELS: Record<VideoBootstrapStage, string> = {
  0: 'Saving platform choice…',
  1: 'Writing the story treatment…',
  2: 'Drafting dialogue and action…',
  3: 'Formatting the screenplay…',
  4: 'Planning the direction…',
  5: 'Shaping the cast from the screenplay…',
  6: 'Scouting shootable locations…',
  7: 'Tailoring visual style to your project…',
  8: 'Solving the VFX direction…',
  9: 'Activating production…',
};

const GENERATE_HINTS: Record<VideoBootstrapStage, string> = {
  0: 'Pick a platform — every shot is written for that platform from this point on.',
  1: 'Draft a prose story treatment: logline, premise, acts, emotional arc, and ending image.',
  2: 'Write spoken lines and action descriptions from the treatment — no camera language.',
  3: 'Format scenes with sluglines, scene numbers, and estimated shot counts.',
  4: 'Design the camera, lens, lighting, sound, and colour plan for every scene.',
  5: 'Extract the cast from the screenplay, with fixed appearance and wardrobe.',
  6: 'Scout shootable locations with fixed environment descriptions.',
  7: 'Pick a visual style from the curated library. Optionally ask the AI to tailor it to your project.',
  8: 'Pitch VFX direction options grounded in the locked visual style.',
  9: 'Review everything and activate the production.',
};

export function BootstrapFlow({ intent, customInstructions, provider, project, onComplete }: BootstrapFlowProps) {
  const [step, setStep] = useState<VideoBootstrapStage>(0);
  const [confirmed, setConfirmed] = useState<VideoBootstrapStage[]>([]);
  const [busy, setBusy] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Phase 2 — platform selection (Stage 0)
  const [targetPlatform, setTargetPlatform] = useState<VideoTargetPlatform | null>(
    project.targetPlatform ?? null
  );
  const [targetPlatformSubModel, setTargetPlatformSubModel] = useState<string | null>(
    project.targetPlatformSubModel ?? null
  );
  // Phase B — story pipeline states
  const [storyTreatment, setStoryTreatment] = useState<StoryTreatment | null>(null);
  const [scriptDialogue, setScriptDialogue] = useState<ScriptDialogueDraft | null>(null);
  const [screenplay, setScreenplay] = useState<ScreenplayScene[] | null>(null);
  const [directionPlan, setDirectionPlan] = useState<DirectionPlan | null>(null);
  // Legacy states
  const [script, setScript] = useState<ScriptTreatment | null>(null);
  const [characters, setCharacters] = useState<VideoCharacter[]>([]);
  const [locations, setLocations] = useState<VideoLocation[]>([]);
  const [styleOptions, setStyleOptions] = useState<StyleCandidate[]>([]);
  const [effectsOptions, setEffectsOptions] = useState<EffectsCandidate[]>([]);
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
  const [selectedEffectsId, setSelectedEffectsId] = useState<string | null>(null);
  // Phase E4 — raw library entry id the director picked (before AI tailoring)
  const [selectedStyleLibraryId, setSelectedStyleLibraryId] = useState<string | null>(null);
  const [styleTailored, setStyleTailored] = useState(false);
  // Per-stage model overrides
  const [stageOverrides, setStageOverrides] = useState<Partial<Record<VideoBootstrapStage, StageModelRef>>>({});
  const [overrideFallbacks, setOverrideFallbacks] = useState<Partial<Record<VideoBootstrapStage, boolean>>>({});
  const busyRef = useRef(false);
  const seededRef = useRef(false);

  const stageProvider = async (stage: VideoBootstrapStage): Promise<ProviderConfig> => {
    const ref = stageOverrides[stage];
    if (!ref) return provider;
    try {
      const saved = await getSavedProviders();
      const found = saved.find((p) => p.id === ref.providerId);
      if (!found) {
        setOverrideFallbacks((prev) => ({ ...prev, [stage]: true }));
        return provider;
      }
      return { ...found, model: ref.model, activeModel: ref.model };
    } catch {
      setOverrideFallbacks((prev) => ({ ...prev, [stage]: true }));
      return provider;
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STAGE_OVERRIDE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<Record<VideoBootstrapStage, unknown>>;
      const normalized: Partial<Record<VideoBootstrapStage, StageModelRef>> = {};
      for (const key of Object.keys(parsed) as unknown as VideoBootstrapStage[]) {
        const v = parsed[key] as StageModelRef & { id?: string };
        if (v && typeof v === 'object' && typeof v.model === 'string' && typeof v.providerId === 'string') {
          normalized[key] = { providerId: v.providerId, model: v.model };
        } else if (v && typeof v === 'object' && typeof v.id === 'string' && typeof v.model === 'string') {
          normalized[key] = { providerId: v.id, model: v.model };
        }
      }
      setStageOverrides(normalized);
    } catch { /* corrupt override payload */ }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STAGE_OVERRIDE_KEY, JSON.stringify(stageOverrides));
    } catch { /* storage unavailable */ }
  }, [stageOverrides]);

  const selectedStyle = styleOptions.find((o) => o.id === selectedStyleId) ?? null;
  const selectedEffects = effectsOptions.find((o) => o.id === selectedEffectsId) ?? null;
  const maxReachable = Math.min(9, Math.max(0, ...confirmed) + 1);

  function buildContext(stage: VideoBootstrapStage): BootstrapContext {
    return {
      customInstructions,
      script: script ?? null,
      storyTreatment: storyTreatment ?? null,
      scriptDialogue: scriptDialogue ?? null,
      screenplay: screenplay ?? null,
      directionPlan: directionPlan ?? null,
      characters: stage > 5 ? characters : null,
      locations: stage >= 6 ? locations : null,
      style: stage > 7 ? selectedStyle : null,
      effects: stage > 8 ? selectedEffects : null,
    };
  }

  function applyStageData(res: VideoBootstrapResponse) {
    switch (res.stage) {
      case 1: setStoryTreatment(res.data); break;
      case 2: setScriptDialogue(res.data); break;
      case 3: setScreenplay(res.data); break;
      case 4: setDirectionPlan(res.data); break;
      case 5: setCharacters(res.data.characters); break;
      case 6: setLocations(res.data.locations); break;
      case 7: {
        setStyleOptions(res.data.options);
        const ids = new Set(res.data.options.map((o) => o.id));
        setSelectedStyleId((prev) => (prev && ids.has(prev) ? prev : res.data.options[0]?.id ?? null));
        setStyleTailored(true);
        break;
      }
      case 8: {
        setEffectsOptions(res.data.options);
        const ids = new Set(res.data.options.map((o) => o.id));
        setSelectedEffectsId((prev) => (prev && ids.has(prev) ? prev : res.data.options[0]?.id ?? null));
        break;
      }
    }
  }

  async function runStage(stage: VideoBootstrapStage, revisionPrompt?: string) {
    if (stage === 0 || stage === 9) return;
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError(null);
    try {
      if (stage === 1 && project.draftScriptOverview) {
        await saveVideoProject({ ...project, draftScriptOverview: null, updatedAt: Date.now() }).catch(() => {});
      }
      const apiStage = stepToApiStage(stage);
      if (!apiStage) return;
      const res = await runVideoBootstrap({
        stage: apiStage,
        intent,
        customInstructions,
        previousContext: buildContext(stage),
        revisionPrompt,
        provider: await stageProvider(stage),
        ...(stage === 7 && selectedStyleLibraryId ? { styleLibraryId: selectedStyleLibraryId } : {}),
      });
      applyStageData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed. Please try again.');
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  async function finalize() {
    setFinalizing(true);
    try {
      const updated: VideoProject = {
        ...project,
        status: 'active',
        ...(targetPlatform ? { targetPlatform, targetPlatformSubModel } : {}),
        draftScriptOverview: null,
        // Phase B — persist pipeline outputs
        ...(storyTreatment ? { storyTreatment } : {}),
        ...(scriptDialogue ? { scriptDialogue } : {}),
        ...(screenplay ? { screenplay } : {}),
        ...(directionPlan ? { directionPlan } : {}),
        storyBible: {
          characters,
          locations,
          ...(selectedStyle
            ? {
                style: {
                  lookAndMood: selectedStyle.lookAndMood,
                  colorGrade: selectedStyle.colorGrade,
                  filmStock: selectedStyle.filmStock,
                  aspectRatio: selectedStyle.aspectRatio,
                  ...(selectedStyle.styleId ? { styleId: selectedStyle.styleId } : {}),
                  ...(selectedStyle.cameraVocabulary ? { cameraVocabulary: selectedStyle.cameraVocabulary } : {}),
                },
              }
            : {}),
          ...(selectedEffects
            ? { effects: { vfxDirection: selectedEffects.vfxDirection, particleDensity: selectedEffects.particleDensity, pacing: selectedEffects.pacing } }
            : {}),
          continuityLog: [
            `Project activated via AI bootstrap — story bible compiled from intent "${intent}".`,
            ...(targetPlatform ? [`Target platform locked: ${targetPlatform}${targetPlatformSubModel ? ` (${targetPlatformSubModel})` : ''}.`] : []),
            ...(selectedStyle ? [`Visual style locked: ${selectedStyle.name}.`] : []),
            ...(selectedEffects ? [`VFX direction locked: ${selectedEffects.name}.`] : []),
          ],
        },
        updatedAt: Date.now(),
      };
      await saveVideoProject(updated);
      onComplete(updated);
    } finally {
      setFinalizing(false);
    }
  }

  function stageHasData(stage: VideoBootstrapStage): boolean {
    switch (stage) {
      case 0: return targetPlatform !== null;
      case 1: return storyTreatment !== null;
      case 2: return scriptDialogue !== null;
      case 3: return screenplay !== null;
      case 4: return directionPlan !== null;
      case 5: return characters.length > 0;
      case 6: return locations.length > 0;
      case 7: return !!selectedStyleLibraryId; // Phase E — has data once a library entry is picked
      case 8: return effectsOptions.length > 0;
      case 9: return true; // activation step always has data
      default: return false;
    }
  }

  function confirmStage() {
    if (busy || finalizing) return;
    setConfirmed((prev) => [...new Set([...prev, step])]);
    if (step === 0 && targetPlatform) {
      const updated: VideoProject = { ...project, targetPlatform, targetPlatformSubModel, updatedAt: Date.now() };
      saveVideoProject(updated).catch(() => {});
    }
    if (step < 9) {
      setStep((step + 1) as VideoBootstrapStage);
    } else {
      void finalize();
    }
  }

  function goTo(stage: VideoBootstrapStage) {
    if (busy || finalizing || stage > maxReachable || stage === step) return;
    setStep(stage);
    setError(null);
  }

  const handleRegenerateImagePrompt = async (character: VideoCharacter): Promise<string> => {
    return regenerateCharacterImagePrompt({
      provider: await stageProvider(5),
      character,
      styleContext: storyTreatment?.theme,
    });
  };

  const handleRegenerateCharacter = async (character: VideoCharacter): Promise<VideoCharacter | null> => {
    try {
      const res = await runVideoBootstrap({
        stage: 5,
        intent,
        customInstructions,
        previousContext: { script: script ?? null, storyTreatment: storyTreatment ?? null, characters: [character] },
        revisionPrompt: `Regenerate ONLY the character "${character.name}" — keep the same identity, role, and continuity; improve the draft.`,
        provider: await stageProvider(5),
      });
      if (res.stage === 5 && res.data.characters.length > 0) {
        return { ...res.data.characters[0], id: character.id };
      }
      return null;
    } catch {
      return null;
    }
  };

  async function handleSuggestLocation(hint: string) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      const suggestions = await suggestVideoLocations({
        intent: hint || intent, script: script ?? null, style: selectedStyle, existingLocations: locations, provider: await stageProvider(6),
      });
      if (suggestions.length > 0) setLocations((prev) => [...prev, ...suggestions]);
      else setError('No locations suggested — try a more specific hint.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Location scouting failed.');
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  // Phase B + Part 3 — seed the wizard from persisted project state.
  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    const hasPlatform = !!project.targetPlatform;
    const hasStory = !!project.storyTreatment;
    const hasDialogue = !!project.scriptDialogue;
    const hasScreenplay = !!project.screenplay;
    const hasDirection = !!project.directionPlan;
    const hasChars = (project.storyBible?.characters?.length ?? 0) > 0;
    const hasLocs = (project.storyBible?.locations?.length ?? 0) > 0;
    const hasStyle = !!project.storyBible?.style;
    const hasEffects = !!project.storyBible?.effects;
    const legacyScript = project.draftScriptOverview;

    // Migration: seed storyTreatment from legacy draftScriptOverview
    if (!hasStory && legacyScript && hasPlatform) {
      setStoryTreatment({
        logline: legacyScript.logline,
        premise: legacyScript.overview,
        emotionalArc: legacyScript.actBeats.join(' → '),
        theme: legacyScript.tone,
        acts: legacyScript.actBeats.map((beat, i) => ({
          act: (i + 1) as 1 | 2 | 3,
          title: ['Setup', 'Confrontation', 'Resolution'][i] ?? 'Act',
          beats: [beat],
        })),
        endingImage: '',
      });
    }

    // Determine the highest confirmed stage
    const confirmedStages: VideoBootstrapStage[] = [];
    if (hasPlatform) confirmedStages.push(0);
    if (hasStory) confirmedStages.push(1);
    if (hasDialogue) confirmedStages.push(2);
    if (hasScreenplay) confirmedStages.push(3);
    if (hasDirection) confirmedStages.push(4);
    if (hasChars) confirmedStages.push(5);
    if (hasLocs) confirmedStages.push(6);
    if (hasStyle) confirmedStages.push(7);
    if (hasEffects) confirmedStages.push(8);

    // Seed state from persisted project
    if (legacyScript && !hasStory) setScript(legacyScript);
    if (hasStory) setStoryTreatment(project.storyTreatment!);
    if (hasDialogue) setScriptDialogue(project.scriptDialogue!);
    if (hasScreenplay) setScreenplay(project.screenplay!);
    if (hasDirection) setDirectionPlan(project.directionPlan!);
    if (hasChars) setCharacters(project.storyBible.characters);
    if (hasLocs) setLocations(project.storyBible.locations);
    if (hasStyle) {
      const s = project.storyBible.style!;
      const id = `seeded-${Date.now()}`;
      setStyleOptions([{ id, name: s.styleId ?? 'Locked style', ...s }]);
      setSelectedStyleId(id);
      if (s.styleId) setSelectedStyleLibraryId(s.styleId);
      setStyleTailored(true);
    }
    if (hasEffects) {
      const e = project.storyBible.effects!;
      const id = `seeded-${Date.now()}`;
      setEffectsOptions([{ id, name: 'Locked VFX', ...e }]);
      setSelectedEffectsId(id);
    }

    if (confirmedStages.length > 0) {
      setConfirmed(confirmedStages);
      // Open at the first unconfirmed stage, or stage 9 (activate) if all done
      const nextStage = ([0,1,2,3,4,5,6,7,8,9] as VideoBootstrapStage[]).find(
        (s) => !confirmedStages.includes(s)
      ) ?? 9;
      setStep(nextStage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const meta = STAGE_META[step];
  const working = busy || finalizing;
  const busyLabel = finalizing ? 'Activating production — locking style & VFX…' : BUSY_LABELS[step];

  return (
    <div className="space-y-5">
      <BootstrapProgress
        meta={STAGE_META}
        step={step}
        confirmed={confirmed}
        maxReachable={maxReachable}
        disabled={working}
        onGoTo={goTo}
        stageOverrides={stageOverrides}
      />

      {/* Stage header */}
      {step === 0 ? (
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface-card/70 backdrop-blur-xl p-4">
          <div className="p-2.5 rounded-xl bg-brand/10 border border-brand/25 shrink-0">
            <Sparkles className="w-5 h-5 text-brand" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Stage 1 of 10 · {meta.hint}
            </p>
            <h3 className="mt-0.5 text-base font-bold text-text-primary truncate">
              {stageHasData(0) ? 'Platform confirmed — pick a different one or continue' : 'Pick your target platform'}
            </h3>
            <p className="mt-0.5 text-xs text-text-secondary leading-relaxed">
              Nothing runs until you pick a platform and confirm. Every shot from then on is written for that platform&apos;s constraints.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface-card/70 backdrop-blur-xl p-4">
          <ThinkingOrb state={meta.state} size={64} className="shrink-0" />
          <BootstrapModelSelector
            stage={step}
            defaultProvider={provider}
            value={stageOverrides[step] ?? null}
            onChange={(p) => {
              setOverrideFallbacks((prev) => ({ ...prev, [step]: false }));
              setStageOverrides((prev) => {
                const next = { ...prev };
                if (p) next[step] = p;
                else delete next[step];
                return next;
              });
            }}
          />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Stage {step + 1} of 10 · {meta.hint}
            </p>
            {overrideFallbacks[step] && (
              <p role="status" className="mt-1.5 inline-flex items-center gap-1 rounded-lg border border-warning/30 bg-warning/5 px-2 py-1 text-[10px] font-semibold text-warning">
                <Clapperboard className="w-3 h-3" aria-hidden="true" />
                Saved override provider is no longer available — using the Settings default for this stage.
              </p>
            )}
            <h3 className="mt-0.5 text-base font-bold text-text-primary truncate">
              {working ? busyLabel : stageHasData(step) ? `Review the ${meta.label.toLowerCase()} draft` : `Draft the ${meta.label.toLowerCase()}`}
            </h3>
            <p className="mt-0.5 text-xs text-text-secondary leading-relaxed">
              {working
                ? 'The studio is drafting this stage from everything you confirmed so far.'
                : stageHasData(step)
                  ? 'Adjust anything below, then confirm to lock this stage and continue.'
                  : 'Nothing runs until you click Generate — confirm only locks in what you review.'}
            </p>
          </div>
        </div>
      )}

      {/* Body */}
      {working ? (
        <div className="rounded-2xl border border-border bg-surface-card/50 p-6 space-y-3" aria-live="polite">
          <div className="h-3 w-2/3 rounded-full bg-surface-muted animate-pulse" />
          <div className="h-3 w-1/2 rounded-full bg-surface-muted animate-pulse" />
          <div className="h-24 rounded-xl bg-surface-muted/60 animate-pulse" />
        </div>
      ) : (
        <>
          {error && (
            <div role="alert" className="rounded-xl border border-danger/30 bg-danger/5 p-3.5 text-xs text-danger">
              <p className="font-bold">Generation failed</p>
              <p className="mt-0.5 break-words">{error}</p>
              <button type="button" onClick={() => void runStage(step)} className="mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-muted border border-border hover:border-danger/40 transition-colors">
                Retry stage
              </button>
            </div>
          )}

          {!stageHasData(step) && step !== 0 && step !== 7 && step !== 9 && (
            <div className="rounded-2xl border border-border bg-surface-card/50 p-8 flex flex-col items-center gap-3 text-center">
              <div className="p-2.5 rounded-xl bg-brand/10 border border-brand/25">
                <Sparkles className="w-5 h-5 text-brand" aria-hidden="true" />
              </div>
              <div className="space-y-1 max-w-md">
                <p className="text-sm font-bold text-text-primary">Draft the {meta.label.toLowerCase()}</p>
                <p className="text-xs text-text-secondary leading-relaxed">{GENERATE_HINTS[step]}</p>
              </div>
              <button type="button" onClick={() => void runStage(step)} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl text-white bg-brand hover:bg-brand-hover shadow-glow active:scale-[0.985] transition-all">
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                Generate {meta.label}
              </button>
            </div>
          )}

          {/* Step 0 — Platform picker */}
          {step === 0 && (
            <div className="rounded-2xl border border-border bg-surface-card/50 p-6">
              <BootstrapPlatformStep
                selectedPlatform={targetPlatform}
                subModel={targetPlatformSubModel}
                onChangePlatform={setTargetPlatform}
                onChangeSubModel={setTargetPlatformSubModel}
                onConfirm={confirmStage}
              />
            </div>
          )}

          {/* Steps 1–9 — AI-generated steps */}
          {step === 1 && storyTreatment && (
            <BootstrapStoryStep data={storyTreatment} busy={busy} onRevise={(p) => void runStage(1, p)} onConfirm={confirmStage} />
          )}
          {step === 2 && scriptDialogue && (
            <BootstrapDialogueStep data={scriptDialogue} busy={busy} onRevise={(p) => void runStage(2, p)} onConfirm={confirmStage} />
          )}
          {step === 3 && screenplay && (
            <BootstrapScreenplayStep data={screenplay} busy={busy} onRevise={(p) => void runStage(3, p)} onConfirm={confirmStage} />
          )}
          {step === 4 && directionPlan && (
            <BootstrapDirectionStep data={directionPlan} busy={busy} onRevise={(p) => void runStage(4, p)} onConfirm={confirmStage} />
          )}
          {step === 5 && characters.length > 0 && (
            <BootstrapCharactersStep
              data={characters}
              busy={busy}
              projectId={project.id}
              onChange={setCharacters}
              onConfirm={confirmStage}
              onRegenerateImagePrompt={handleRegenerateImagePrompt}
              onRegenerateCharacter={handleRegenerateCharacter}
            />
          )}
          {step === 6 && locations.length > 0 && (
            <BootstrapScenesStep data={locations} busy={busy} onChange={setLocations} onSuggest={handleSuggestLocation} onConfirm={confirmStage} />
          )}
          {step === 7 && (
            <BootstrapStyleStep
              selectedId={selectedStyleId}
              tailoredStyle={selectedStyle ?? null}
              libraryStyleId={selectedStyleLibraryId}
              tailored={styleTailored}
              busy={busy}
              onSelectLibrary={(id) => {
                setSelectedStyleLibraryId(id);
                setStyleTailored(false);
                setStyleOptions([]);
                setSelectedStyleId(null);
              }}
              onTailor={(note) => {
                if (!selectedStyleLibraryId) return;
                void runStage(7, note);
              }}
              onUseDefaults={() => {
                if (!selectedStyleLibraryId) return;
                const lib = getVisualStyle(selectedStyleLibraryId);
                if (!lib) return;
                const entry: StyleCandidate = {
                  id: `lib-${lib.id}`,
                  name: lib.label,
                  lookAndMood: `${lib.label} — ${lib.promptTokens.slice(0, 3).join(', ')}`,
                  colorGrade: lib.promptTokens.includes('rich matte colors with tactile surfaces')
                    ? 'rich matte colors, tactile surfaces'
                    : lib.promptTokens.includes('vibrant pastel palette')
                      ? 'vibrant pastel palette'
                      : lib.promptTokens.includes('bright cheerful palette')
                        ? 'bright cheerful palette'
                        : 'matched to style',
                  filmStock: lib.cameraVocabulary === 'cinematic'
                    ? lib.promptTokens.find((t) => t.includes('35mm') || t.includes('film grain')) ?? 'digital'
                    : lib.label,
                  aspectRatio: '16:9',
                  styleId: lib.id,
                  cameraVocabulary: lib.cameraVocabulary,
                };
                setStyleOptions([entry]);
                setSelectedStyleId(entry.id);
                setStyleTailored(true);
              }}
              onConfirm={confirmStage}
              hasDownstreamWork={confirmed.includes(8)}
            />
          )}
          {step === 8 && effectsOptions.length > 0 && (
            <BootstrapEffectsStep
              data={effectsOptions}
              selectedId={selectedEffectsId}
              busy={busy}
              onSelect={setSelectedEffectsId}
              onRegenerate={(note) => void runStage(8, note)}
              onConfirm={confirmStage}
              hasDownstreamWork={false}
            />
          )}
          {step === 9 && (
            <div className="rounded-2xl border border-border bg-surface-card/50 p-6 flex flex-col items-center gap-4 text-center">
              <div className="p-2.5 rounded-xl bg-success/10 border border-success/25">
                <Sparkles className="w-5 h-5 text-success" aria-hidden="true" />
              </div>
              <div className="space-y-1 max-w-md">
                <p className="text-sm font-bold text-text-primary">Ready to activate</p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Story, dialogue, screenplay, direction, cast, locations, style, and VFX are all locked.
                  Click below to activate the production.
                </p>
              </div>
              <button type="button" onClick={confirmStage} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl text-white bg-brand hover:bg-brand-hover shadow-glow active:scale-[0.985] transition-all">
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                Activate production
              </button>
            </div>
          )}
        </>
      )}

      <p className="flex items-center gap-1.5 text-[10px] text-text-muted">
        <Clapperboard className="w-3 h-3 text-brand" aria-hidden="true" />
        Confirming the final stage activates the production and locks Visual Style &amp; VFX direction.
      </p>
    </div>
  );
}
