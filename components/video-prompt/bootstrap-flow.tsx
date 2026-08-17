'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Clapperboard } from 'lucide-react';
import type { ProviderConfig } from '@/types';
import type { ThinkingOrbState, VideoCharacter, VideoLocation, VideoProject } from '@/types/video';
import { runVideoBootstrap, suggestVideoLocations } from '@/lib/ai-client';
import { getSavedProviders } from '@/lib/storage';
import { saveVideoProject } from '@/lib/video-storage';
import type { BootstrapContext, EffectsCandidate, ScriptTreatment, StyleCandidate, VideoBootstrapResponse, VideoBootstrapStage } from '@/lib/video/bootstrap/types';
import { cn } from '@/lib/utils';
import { ThinkingOrb } from './thinking-orb';
import { BootstrapProgress } from './bootstrap-progress';
import { BootstrapModelSelector, type StageModelRef } from './bootstrap-model-selector';
import { BootstrapScriptStep } from './bootstrap-script-step';
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

const STAGE_META: { id: VideoBootstrapStage; label: string; state: ThinkingOrbState; hint: string }[] = [
  { id: 1, label: 'Script', state: 'composing', hint: 'Treatment — logline, act beats, tone' },
  { id: 2, label: 'Characters', state: 'shaping', hint: 'Cast with fixed appearance & wardrobe' },
  { id: 3, label: 'Locations', state: 'searching', hint: 'Scouted environments, fixed descriptions' },
  { id: 4, label: 'Visual style', state: 'weaving', hint: 'One look — locks grade & stock' },
  { id: 5, label: 'VFX direction', state: 'solving', hint: 'One treatment — locks effects & pacing' },
];

const BUSY_LABELS: Record<VideoBootstrapStage, string> = {
  1: 'Composing the script treatment…',
  2: 'Shaping the cast from the treatment…',
  3: 'Scouting shootable locations…',
  4: 'Weaving visual style options…',
  5: 'Solving the VFX direction…',
};

/**
 * Phase 3 — 5-stage AI-orchestrated project bootstrap. A single intent is
 * drafted, reviewed, and confirmed stage-by-stage; the Thinking Orb animates
 * each generation pass. Confirming Stage 5 compiles the full StoryBible, flips
 * the project to `active` (locking Visual Style + VFX direction), persists it
 * to IndexedDB, and hands the updated project back to the workspace.
 */
export function BootstrapFlow({ intent, customInstructions, provider, project, onComplete }: BootstrapFlowProps) {
  const [step, setStep] = useState<VideoBootstrapStage>(1);
  const [confirmed, setConfirmed] = useState<VideoBootstrapStage[]>([]);
  const [busy, setBusy] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [script, setScript] = useState<ScriptTreatment | null>(null);
  const [characters, setCharacters] = useState<VideoCharacter[]>([]);
  const [locations, setLocations] = useState<VideoLocation[]>([]);
  const [styleOptions, setStyleOptions] = useState<StyleCandidate[]>([]);
  const [effectsOptions, setEffectsOptions] = useState<EffectsCandidate[]>([]);
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
  const [selectedEffectsId, setSelectedEffectsId] = useState<string | null>(null);
  // Task 4.5 — per-stage model overrides ({ [stage]: StageModelRef }). A ref
  // is just { providerId, model } — never a full ProviderConfig, so API keys
  // stay in the encrypted provider store. An unset stage falls back to the
  // Settings-global provider, never mutating it.
  const [stageOverrides, setStageOverrides] = useState<Partial<Record<VideoBootstrapStage, StageModelRef>>>({});
  const startedRef = useRef(false);
  const busyRef = useRef(false);

  /**
   * Resolves the provider for a stage: the per-stage override pointer, looked
   * up live in the saved (decrypted) provider store so the current key/model
   * list is always used; otherwise the Settings-global provider.
   */
  const stageProvider = async (stage: VideoBootstrapStage): Promise<ProviderConfig> => {
    const ref = stageOverrides[stage];
    if (!ref) return provider;
    try {
      const saved = await getSavedProviders();
      const found = saved.find((p) => p.id === ref.providerId);
      if (!found) return provider;
      return { ...found, model: ref.model, activeModel: ref.model };
    } catch {
      return provider;
    }
  };

  // Load persisted overrides once on mount; persist every change (backward
  // compatible: missing/empty = Settings default).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STAGE_OVERRIDE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<Record<VideoBootstrapStage, unknown>>;
      const normalized: Partial<Record<VideoBootstrapStage, StageModelRef>> = {};
      for (const key of Object.keys(parsed) as unknown as VideoBootstrapStage[]) {
        const v = parsed[key] as StageModelRef & { id?: string };
        // Normalize legacy full-ProviderConfig payloads (dev builds) to refs.
        if (v && typeof v === 'object' && typeof v.model === 'string' && typeof v.providerId === 'string') {
          normalized[key] = { providerId: v.providerId, model: v.model };
        } else if (v && typeof v === 'object' && typeof v.id === 'string' && typeof v.model === 'string') {
          normalized[key] = { providerId: v.id, model: v.model };
        }
      }
      setStageOverrides(normalized);
    } catch {
      // Corrupt override payload — keep the Settings default.
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STAGE_OVERRIDE_KEY, JSON.stringify(stageOverrides));
    } catch {
      // Storage unavailable — overrides just don't persist.
    }
  }, [stageOverrides]);

  const selectedStyle = styleOptions.find((o) => o.id === selectedStyleId) ?? null;
  const selectedEffects = effectsOptions.find((o) => o.id === selectedEffectsId) ?? null;
  const maxReachable = Math.min(5, Math.max(0, ...confirmed) + 1);

  function buildContext(stage: VideoBootstrapStage): BootstrapContext {
    return {
      customInstructions,
      script: script ?? null,
      characters: stage > 2 ? characters : null,
      locations: stage >= 3 ? locations : null,
      style: stage > 4 ? selectedStyle : null,
      effects: stage > 5 ? selectedEffects : null,
    };
  }

  function applyStageData(res: VideoBootstrapResponse) {
    switch (res.stage) {
      case 1: setScript(res.data); break;
      case 2: setCharacters(res.data.characters); break;
      case 3: setLocations(res.data.locations); break;
      case 4: {
        setStyleOptions(res.data.options);
        const ids = new Set(res.data.options.map((o) => o.id));
        setSelectedStyleId((prev) => (prev && ids.has(prev) ? prev : res.data.options[0]?.id ?? null));
        break;
      }
      case 5: {
        setEffectsOptions(res.data.options);
        const ids = new Set(res.data.options.map((o) => o.id));
        setSelectedEffectsId((prev) => (prev && ids.has(prev) ? prev : res.data.options[0]?.id ?? null));
        break;
      }
    }
  }

  async function runStage(stage: VideoBootstrapStage, revisionPrompt?: string) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError(null);
    try {
      const res = await runVideoBootstrap({
        stage, intent, customInstructions, previousContext: buildContext(stage), revisionPrompt, provider: await stageProvider(stage),
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
        storyBible: {
          characters,
          locations,
          ...(selectedStyle
            ? { style: { lookAndMood: selectedStyle.lookAndMood, colorGrade: selectedStyle.colorGrade, filmStock: selectedStyle.filmStock, aspectRatio: selectedStyle.aspectRatio } }
            : {}),
          ...(selectedEffects
            ? { effects: { vfxDirection: selectedEffects.vfxDirection, particleDensity: selectedEffects.particleDensity, pacing: selectedEffects.pacing } }
            : {}),
          continuityLog: [
            `Project activated via AI bootstrap — story bible compiled from intent "${intent}".`,
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

  function confirmStage() {
    if (busy || finalizing) return;
    setConfirmed((prev) => [...new Set([...prev, step])]);
    if (step < 5) {
      const next = (step + 1) as VideoBootstrapStage;
      setStep(next);
      void runStage(next);
    } else {
      void finalize();
    }
  }

  function goTo(stage: VideoBootstrapStage) {
    if (busy || finalizing || stage > maxReachable || stage === step) return;
    setStep(stage);
    setError(null);
    const hasData =
      stage === 1 ? !!script
      : stage === 2 ? characters.length > 0
      : stage === 3 ? locations.length > 0
      : stage === 4 ? styleOptions.length > 0
      : effectsOptions.length > 0;
    if (!hasData) void runStage(stage);
  }

  async function handleSuggestLocation(hint: string) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      // Ad-hoc "AI scout" calls reuse the Stage 3 override so scouting latency
      // and quality match the director's choice for that stage.
      const suggestions = await suggestVideoLocations({
        intent: hint || intent, script, style: selectedStyle, existingLocations: locations, provider: await stageProvider(3),
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

  // Kick off Stage 1 once on mount (guarded against StrictMode double-effects).
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void runStage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const meta = STAGE_META[step - 1];
  const working = busy || finalizing;
  const busyLabel = finalizing ? 'Activating production — locking style & VFX…' : BUSY_LABELS[step];

  return (
    <div className="space-y-5">
      {/* 5-step progress bar (extracted to keep this file under the ceiling) */}
      <BootstrapProgress
        meta={STAGE_META}
        step={step}
        confirmed={confirmed}
        maxReachable={maxReachable}
        disabled={working}
        onGoTo={goTo}
      />

      {/* Stage header — Thinking Orb animates during generation; the per-stage
          model selector (Task 4.5) sits beside it and overrides Settings */}
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface-card/70 backdrop-blur-xl p-4">
        <ThinkingOrb state={meta.state} size={64} className="shrink-0" />
        <BootstrapModelSelector
          stage={step}
          defaultProvider={provider}
          value={stageOverrides[step] ?? null}
          onChange={(p) =>
            setStageOverrides((prev) => {
              const next = { ...prev };
              if (p) next[step] = p;
              else delete next[step];
              return next;
            })
          }
        />
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Stage {step} of 5 · {meta.hint}
          </p>
          <h3 className="mt-0.5 text-base font-bold text-text-primary truncate">
            {working ? busyLabel : `Review the ${meta.label.toLowerCase()} draft`}
          </h3>
          <p className="mt-0.5 text-xs text-text-secondary leading-relaxed">
            {working
              ? 'The studio is drafting this stage from everything you confirmed so far.'
              : 'Adjust anything below, then confirm to lock this stage and continue.'}
          </p>
        </div>
      </div>

      {/* Body — skeleton while generating, step review otherwise */}
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
              <button
                type="button"
                onClick={() => void runStage(step)}
                className="mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-muted border border-border hover:border-danger/40 transition-colors"
              >
                Retry stage
              </button>
            </div>
          )}

          {step === 1 && script && (
            <BootstrapScriptStep data={script} busy={busy} onRevise={(p) => void runStage(1, p)} onConfirm={confirmStage} />
          )}
          {step === 2 && characters.length > 0 && (
            <BootstrapCharactersStep
              data={characters}
              busy={busy}
              projectId={project.id}
              onChange={setCharacters}
              onConfirm={confirmStage}
            />
          )}
          {step === 3 && locations.length > 0 && (
            <BootstrapScenesStep data={locations} busy={busy} onChange={setLocations} onSuggest={handleSuggestLocation} onConfirm={confirmStage} />
          )}
          {step === 4 && styleOptions.length > 0 && (
            <BootstrapStyleStep data={styleOptions} selectedId={selectedStyleId} busy={busy} onSelect={setSelectedStyleId} onRegenerate={() => void runStage(4)} onConfirm={confirmStage} />
          )}
          {step === 5 && effectsOptions.length > 0 && (
            <BootstrapEffectsStep data={effectsOptions} selectedId={selectedEffectsId} busy={busy} onSelect={setSelectedEffectsId} onRegenerate={() => void runStage(5)} onConfirm={confirmStage} />
          )}
        </>
      )}

      <p className="flex items-center gap-1.5 text-[10px] text-text-muted">
        <Clapperboard className="w-3 h-3 text-brand" aria-hidden="true" />
        Confirming Stage 5 activates the production and locks the Visual Style &amp; VFX direction.
      </p>
    </div>
  );
}
