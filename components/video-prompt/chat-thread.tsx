'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { DefaultChatTransport } from 'ai';
import type { UIMessage } from 'ai';
import { useChat } from '@ai-sdk/react';
import { Clapperboard, Eye, EyeOff, Film, Sparkles, Square, X } from 'lucide-react';
import type { ProviderConfig } from '@/types';
import type { ActionBeatDecomposition, ChatMessage, DraftedShot, ShotLocationConditions, StoryBibleCharacterImage, ThinkingOrbState, VideoProject, VideoShot } from '@/types/video';
import { decomposeActionBeat } from '@/lib/video/action-decomposer';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse, MessageToolbar } from '@/components/ai-elements/message';
import { saveVideoProject } from '@/lib/video-storage';
import { parseDraftedShot } from '@/lib/video/story-bible';
import { useStoryBible } from '@/lib/video/story-bible-context';
import { blobToDataUrl } from '@/lib/compression';
import { ThinkingOrb } from './thinking-orb';
import { ShotDraftCard } from './shot-draft-card';
import { ChatInput } from './chat-input';
import { ShotSceneSelector, type ShotSceneContextValue } from './shot-scene-selector';
import { cn } from '@/lib/utils';

interface ChatThreadProps {
  project: VideoProject;
  providerConfig: ProviderConfig;
  /** Persisted via saveVideoProject(); parent refreshes the workspace from storage. */
  onProjectUpdate: (project: VideoProject) => void;
}

/** Flattens a UI message's text parts (streaming-safe). */
function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

/** Seeds the chat from the project's persisted history (mount-time only). */
function seedFromHistory(project: VideoProject): UIMessage[] {
  return (project.chatHistory ?? [])
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      id: m.id,
      role: m.role,
      parts: [{ type: 'text' as const, text: m.content }],
    }));
}

/**
 * Phase 4 — the multi-turn shot drafting thread. One streamed assistant turn
 * proposes one shot (8–30s) as a structured draft; the director approves it
 * into the storyboard (advancing the scene beat) or requests a revision. The
 * 20px Thinking Orb mirrors useChat() status: submitted → searching,
 * streaming → working, ready → breathing.
 */
export function ChatThread({ project, providerConfig, onProjectUpdate }: ChatThreadProps) {
  const projectRef = useRef(project);
  projectRef.current = project;
  const providerRef = useRef(providerConfig);
  providerRef.current = providerConfig;
  const onProjectUpdateRef = useRef(onProjectUpdate);
  onProjectUpdateRef.current = onProjectUpdate;

  // Phase 4 — action-beat decomposition state.
  const [actionDecomposition, setActionDecomposition] = useState<ActionBeatDecomposition | null>(null);
  const [decompositionInput, setDecompositionInput] = useState('');
  const [showDecompositionInput, setShowDecompositionInput] = useState(false);

  // C1 — Story Bible image context for auto-attaching character references
  const { entries } = useStoryBible();
  /**
   * Resolves the primary (or newest) reference image for each character id.
   * Returns data-URL-equipped entries ready to send as file parts.
   */
  const resolveCharacterImages = useCallback(
    async (characterIds: string[]): Promise<StoryBibleCharacterImage[]> => {
      const resolved: StoryBibleCharacterImage[] = [];
      for (const id of characterIds) {
        const entry =
          entries.find((e) => e.characterId === id && e.isPrimary) ??
          entries.find((e) => e.characterId === id);
        if (!entry) continue;
        // Ensure we have a data URL (IndexedDB entries may only have a Blob)
        if (!entry.imageDataUrl && entry.imageBlob) {
          try {
            const dataUrl = await blobToDataUrl(entry.imageBlob);
            resolved.push({ ...entry, imageDataUrl: dataUrl });
          } catch {
            // Skip — blob couldn't be serialized
          }
        } else if (entry.imageDataUrl) {
          resolved.push(entry);
        }
      }
      return resolved;
    },
    [entries]
  );

  // Phase D — scene context for scoped Story Bible digest
  const shotContextRef = useRef<ShotSceneContextValue | null>(null);

  const [seed] = useState<UIMessage[]>(() => seedFromHistory(project));
  // Phase 4 — per-shot customization overrides sent with each draft request.
  const shotOptionsRef = useRef<{
    promptFormOverride?: import('@/types/video').PromptForm | 'auto';
    customLabel?: string;
    platformOverride?: import('@/types/video').VideoTargetPlatform;
  } | null>(null);

  const [transport] = useState(
    () =>
      new DefaultChatTransport({
        api: '/api/video-chat',
        body: () => {
          const p = projectRef.current;
          const defaults = p.directorDefaults;
          return {
            project: p,
            providerConfig: providerRef.current,
            shotContext: shotContextRef.current ?? undefined,
            // Phase 4 — use explicit per-shot options if set, else fall back to director defaults.
            shotOptions: shotOptionsRef.current ?? (
              defaults ? {
                promptFormOverride: defaults.promptFormOverride,
                platformOverride: defaults.platformOverride,
              } : undefined
            ),
          };
        },
      })
  );

  /** True while an Approve save is in flight — guards the double-click race. */
  const [approving, setApproving] = useState(false);
  /** Set when the director hits Stop so a truncated stream is tagged, never
   *  persisted as a finished draft (A8). */
  const stoppedRef = useRef(false);

  const { messages, status, error, sendMessage, stop, regenerate, clearError } = useChat({
    transport,
    messages: seed,
    onFinish: ({ messages: finished }) => {
      void persistChat(finished);
    },
  });

  const streaming = status === 'submitted' || status === 'streaming';
  const orbState: ThinkingOrbState =
    status === 'submitted' ? 'searching' : status === 'streaming' ? 'working' : 'breathing';

  /**
   * C5 — tracks whether the last request used the text-only pre-pass route.
   * Visible to the director so they know the vision analysis ran.
   */
  const [lastRoutingNote, setLastRoutingNote] = useState<string | null>(null);

  /** Writes the thread into project.chatHistory and hands it up. A stream the
   *  director stopped is tagged so the next turn never treats a cut-off draft
   *  as finished context. */
  const persistChat = async (finished: UIMessage[]) => {
    const wasStopped = stoppedRef.current;
    stoppedRef.current = false;
    const chatHistory: ChatMessage[] = finished
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m, i, arr) => {
        let content = getMessageText(m);
        if (wasStopped && m.role === 'assistant' && i === arr.length - 1 && content.trim()) {
          content = `${content.trimEnd()}\n\n[stopped by director — draft incomplete]`;
        }
        return { id: m.id, role: m.role, content, timestamp: Date.now() };
      });
    const updated: VideoProject = { ...projectRef.current, chatHistory, updatedAt: Date.now() };
    await saveVideoProject(updated);
    onProjectUpdateRef.current(updated);
  };

  /** Approve commits the shot to the storyboard ONLY — it never auto-drafts
   *  the next shot (Issue 2). */
  const handleApprove = async (draft: DraftedShot) => {
    if (streaming || approving) return;
    setApproving(true);
    try {
      const base = projectRef.current;
      const now = Date.now();
      const existing = base.shots.find((s) => s.shotNumber === draft.shotNumber);
      const ctx = shotContextRef.current;
      const shot: VideoShot = {
        id: existing?.id ?? `shot-${now.toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        shotNumber: draft.shotNumber,
        description: draft.description,
        promptText: draft.promptText,
        continuityHandoff: draft.continuityHandoff,
        durationSeconds: draft.durationSeconds,
        dialogue: draft.dialogue,
        negativePrompt: draft.negativePrompt,
        ...(draft.emotion ? { emotion: draft.emotion } : {}),
        ...(draft.shotFunction ? { shotFunction: draft.shotFunction } : {}),
        ...(draft.promptForm ? { promptForm: draft.promptForm } : {}),
        // Phase 4 — persist shot-level customization overrides
        ...(draft.promptFormOverride && draft.promptFormOverride !== 'auto' ? { promptFormOverride: draft.promptFormOverride } : {}),
        ...(draft.customLabel ? { customLabel: draft.customLabel } : {}),
        ...(draft.platformOverride ? { platformOverride: draft.platformOverride } : {}),
        // Phase D1 — persist scene context on the approved shot
        ...(ctx ? { sceneNumber: ctx.sceneNumber } : {}),
        ...(ctx?.locationId ? { locationId: ctx.locationId } : {}),
        ...(ctx?.locationConditions ? { locationConditions: ctx.locationConditions } : {}),
        ...(ctx?.wardrobeLookIds ? { wardrobeLookIds: ctx.wardrobeLookIds } : {}),
        confirmed: true,
        createdAt: existing?.createdAt ?? now,
      };
      const shots = existing
        ? base.shots.map((s) => (s.shotNumber === draft.shotNumber ? shot : s))
        : [...base.shots, shot].sort((a, b) => a.shotNumber - b.shotNumber);
      const updated: VideoProject = {
        ...base,
        shots,
        storyBible: {
          ...base.storyBible,
          continuityLog: [
            ...(base.storyBible.continuityLog ?? []),
            `Shot ${draft.shotNumber} approved — ${draft.description}`,
          ],
        },
        updatedAt: now,
      };
      projectRef.current = updated; // next request's system prompt sees the new storyboard
      await saveVideoProject(updated);
      onProjectUpdateRef.current(updated);
    } finally {
      setApproving(false);
    }
  };

  /** Explicit "Draft Next Shot" — the director asks for shot N+1 when ready;
   *  it never fires as a side effect of Approve. */
  const handleDraftNext = async () => {
    if (streaming || approving) return;
    // D — use scene-scoped character list when a scene is selected
    const ctx = shotContextRef.current;
    const charIds = ctx?.characterIds.length
      ? ctx.characterIds
      : (project.storyBible?.characters?.map((c) => c.id) ?? []);
    const images = await resolveCharacterImages(charIds);
    const charImageFiles = images
      .filter((e) => e.imageDataUrl)
      .map((e) => ({
        type: 'file' as const,
        mediaType: 'image/webp',
        url: e.imageDataUrl!,
        filename: `${e.characterName}-reference.webp`,
      }));
    if (charImageFiles.length > 0) {
      void sendMessage({
        text: 'Draft the next shot, continuing the scene from the last approved shot.',
        files: charImageFiles,
      });
    } else {
      void sendMessage({
        text: 'Draft the next shot, continuing the scene from the last approved shot.',
      });
    }
  };

  /** Stop marks the stream as interrupted so persistence tags it (A8). */
  const handleStop = () => {
    stoppedRef.current = true;
    stop();
  };

  const handleRevise = async (draft: DraftedShot) => {
    if (streaming) return;
    // D — use scene-scoped character list when a scene is selected
    const ctx = shotContextRef.current;
    const charIds = ctx?.characterIds.length
      ? ctx.characterIds
      : (project.storyBible?.characters?.map((c) => c.id) ?? []);
    const images = await resolveCharacterImages(charIds);
    const charImageFiles = images
      .filter((e) => e.imageDataUrl)
      .map((e) => ({
        type: 'file' as const,
        mediaType: 'image/webp',
        url: e.imageDataUrl!,
        filename: `${e.characterName}-reference.webp`,
      }));
    const text = `Revise your last shot draft (Shot ${draft.shotNumber}): "${draft.description}". Improve it while keeping the same subject, setting, and visual style anchors — re-emit the same shot number.`;
    if (charImageFiles.length > 0) {
      void sendMessage({ text, files: charImageFiles });
    } else {
      void sendMessage({ text });
    }
  };

  const starters = useMemo(() => {
    const c = project.storyBible?.characters?.[0]?.name;
    const l = project.storyBible?.locations?.[0]?.name;
    const list: string[] = [];
    if (c) {
      list.push(
        l ? `${c} enters ${l} — establish the scene and draft the opening shot.` : `Establish ${c} in the opening shot from the story bible.`
      );
    } else {
      list.push('Draft the opening shot from the directorial brief.');
    }
    list.push('Summarize the continuity we have locked so far, then propose the next beat.');
    return list;
  }, [project]);

  return (
    <div className="flex flex-col h-[clamp(320px,60vh,720px)] gap-3">
      <Conversation className="h-full min-h-0">
        <ConversationContent>
          {messages.length === 0 && (
            <div className="flex size-full flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="text-muted-foreground">
                <Clapperboard className="w-5 h-5 text-brand" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium text-sm text-text-primary">Draft the first shot</h3>
                <p className="text-muted-foreground text-sm">
                  Direct the camera. Every turn proposes one 8–30s shot you can approve into the storyboard or revise.
                </p>
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                {starters.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void sendMessage({ text: s })}
                    className="px-2.5 py-1.5 rounded-full text-[11px] font-medium bg-surface-muted text-text-secondary border border-border hover:border-brand/50 hover:text-brand transition-colors"
                  >
                    {s.length > 64 ? `${s.slice(0, 64)}…` : s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, i) => {
            if (message.role === 'system') return null;
            const text = getMessageText(message);
            const draft = message.role === 'assistant' ? parseDraftedShot(text) : null;
            const isLast = i === messages.length - 1;
            const live = isLast && message.role === 'assistant' && streaming;
            return (
              <Message key={message.id} from={message.role}>
                <MessageContent>
                  {text && <MessageResponse>{text}</MessageResponse>}
                  {draft && !live && (
                    <ShotDraftCard
                      draft={draft}
                      disabled={streaming || approving}
                      targetPlatform={projectRef.current.targetPlatform}
                      onApprove={(d) => void handleApprove(d)}
                      onRevise={handleRevise}
                    />
                  )}
                  {message.role === 'assistant' && !live && text && !draft && (
                    <div className="rounded-xl border border-warning/30 bg-warning/5 p-3.5 text-[11px] text-warning">
                      <p className="font-bold">No shot draft in this reply</p>
                      <p className="mt-0.5 break-words">
                        This reply didn&apos;t include a shot draft — ask the drafter to try again, or click Retry.
                      </p>
                      <button
                        type="button"
                        onClick={() => void regenerate()}
                        disabled={streaming || approving}
                        className="mt-2 px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface-muted border border-border hover:border-warning/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Retry draft
                      </button>
                    </div>
                  )}
                  {live && (
                    <MessageToolbar>
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-text-muted">
                        <ThinkingOrb state={orbState} size={20} className="shrink-0" />
                        {status === 'submitted' ? 'Connecting to the shot drafter…' : 'Drafting the shot…'}
                      </span>
                      <button
                        type="button"
                        onClick={handleStop}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold bg-surface-muted text-text-secondary border border-border hover:text-danger hover:border-danger/40 transition-colors"
                      >
                        <Square className="w-3 h-3" aria-hidden="true" />
                        Stop
                      </button>
                    </MessageToolbar>
                  )}
                </MessageContent>
              </Message>
            );
          })}

          {error && (
            <div
              role="alert"
              className={cn(
                'flex flex-col gap-2 rounded-xl border border-danger/30 bg-danger/5 p-3.5 text-xs text-danger'
              )}
            >
              <p className="font-bold">Drafting failed</p>
              <p className="break-words">{error.message}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    clearError();
                    void regenerate();
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface-muted border border-border hover:border-danger/40 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Action-beat decomposition panel */}
      {actionDecomposition && (
        <div className="rounded-xl border border-brand/25 bg-brand/5 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-brand/10 text-brand border border-brand/25">
              <Film className="w-3 h-3" aria-hidden="true" />
              Action Sequence Breakdown ({actionDecomposition.cells.length} shots)
            </span>
            <button
              type="button"
              onClick={() => setActionDecomposition(null)}
              className="p-0.5 rounded text-text-muted hover:text-text-secondary transition-colors"
              aria-label="Close breakdown"
            >
              <X className="w-3 h-3" aria-hidden="true" />
            </button>
          </div>
          <p className="text-[10px] text-text-muted leading-relaxed">
            Source beat: {actionDecomposition.sourceBeat}
          </p>
          <div className="grid gap-1.5 max-h-48 overflow-y-auto scrollbar-thin">
            {actionDecomposition.cells.map((cell) => (
              <div key={cell.cellNumber} className="flex items-start gap-2 rounded-lg border border-border bg-surface-card/60 p-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-md text-[9px] font-bold bg-brand/10 text-brand border border-brand/25 shrink-0">
                  {cell.cellNumber}
                </span>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className="text-[9px] font-bold text-text-primary uppercase tracking-wider">{cell.framing}</p>
                  <p className="text-[10px] text-text-secondary leading-relaxed">{cell.motion}</p>
                  <p className="text-[9px] text-text-muted">{cell.cameraMove} · {cell.durationSeconds}s</p>
                </div>
                {cell.usesIdentityLock && (
                  <span className="inline-flex items-center px-1 py-0.5 rounded text-[8px] font-bold bg-success/15 text-success border border-success/30 shrink-0">
                    ID Lock
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                // Send the decomposition to the drafter for sequential drafting
                const breakdown = actionDecomposition.cells
                  .map((c) => `Shot ${c.cellNumber}: ${c.framing} — ${c.motion} (${c.durationSeconds}s, ${c.cameraMove})`)
                  .join('\n');
                void sendMessage({
                  text: `Break this into an action sequence. Here's the decomposition I want you to draft shot by shot:\n\n${breakdown}\n\nDraft Shot 1 first. Every shot MUST carry the full identity-lock block — do not assume identity carries from a prior shot.`,
                });
                setActionDecomposition(null);
              }}
              disabled={streaming || approving}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all',
                'bg-brand hover:bg-brand-hover shadow-glow active:scale-[0.985]',
                (streaming || approving) && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Clapperboard className="w-3.5 h-3.5" aria-hidden="true" />
              Draft from Breakdown
            </button>
            <button
              type="button"
              onClick={() => setActionDecomposition(null)}
              disabled={streaming || approving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors bg-surface-muted text-text-secondary border-border hover:border-danger/40 hover:text-danger"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Phase 4 — action-beat decomposition input */}
      {showDecompositionInput && !actionDecomposition && (
        <div className="rounded-xl border border-brand/25 bg-brand/5 p-3 space-y-2">
          <p className="text-[10px] font-bold text-brand">Describe the action beat to decompose</p>
          <textarea
            value={decompositionInput}
            onChange={(e) => setDecompositionInput(e.target.value)}
            placeholder="e.g. Maya bursts through the door, ducks behind the counter, fires three shots, rolls under the table, and comes up aiming"
            rows={2}
            className="w-full px-2.5 py-1.5 rounded-lg text-[11px] font-mono bg-surface-input border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/70 resize-none"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (decompositionInput.trim()) {
                  const chars = projectRef.current.storyBible?.characters ?? [];
                  setActionDecomposition(decomposeActionBeat(decompositionInput.trim(), chars));
                  setDecompositionInput('');
                  setShowDecompositionInput(false);
                }
              }}
              disabled={!decompositionInput.trim()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-brand hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Film className="w-3.5 h-3.5" aria-hidden="true" />
              Decompose
            </button>
            <button
              type="button"
              onClick={() => { setShowDecompositionInput(false); setDecompositionInput(''); }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-border bg-surface-muted text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Explicit next-shot affordance + action sequence button */}
      <div className="flex items-center justify-between">
        <div>
          {!showDecompositionInput && !actionDecomposition && (
            <button
              type="button"
              onClick={() => setShowDecompositionInput(true)}
              disabled={streaming || approving}
              title="Break an action beat into a reviewable shot-by-shot sequence"
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
                'bg-surface-muted text-text-secondary border-border hover:border-accent/40 hover:text-accent',
                (streaming || approving) && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Film className="w-3.5 h-3.5" aria-hidden="true" />
              Break into Action Sequence
            </button>
          )}
        </div>
        {project.shots.length > 0 && (
          <button
            type="button"
            onClick={handleDraftNext}
            disabled={streaming || approving}
            title="Ask the drafter to propose the next shot, continuing from the last approved one"
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
              'bg-surface-muted text-text-secondary border-border hover:border-brand/40 hover:text-brand',
              (streaming || approving) && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            Draft Next Shot
          </button>
        )}
      </div>

      {/* C5 — visible routing note when text-only pre-pass ran */}
      {lastRoutingNote && (
        <div className="flex items-start gap-1.5 px-1">
          {lastRoutingNote.includes('vision pre-pass') ? (
            <Eye className="w-3 h-3 text-brand mt-0.5 shrink-0" aria-hidden="true" />
          ) : (
            <EyeOff className="w-3 h-3 text-text-muted mt-0.5 shrink-0" aria-hidden="true" />
          )}
          <span className="text-[9px] text-text-muted leading-relaxed">
            {lastRoutingNote}
          </span>
        </div>
      )}

      {/* Phase D3 — scene/location/character selector strip */}
      {project.screenplay && project.screenplay.length > 0 && (
        <ShotSceneSelector
          project={project}
          onContextChange={(ctx) => { shotContextRef.current = ctx; }}
        />
      )}

      <ChatInput
        project={project}
        busy={streaming}
        onSend={async (text, files) => {
          // D — use scene-scoped character list when a scene is selected
          const ctx = shotContextRef.current;
          const charIds = ctx?.characterIds.length
            ? ctx.characterIds
            : (project.storyBible?.characters?.map((c) => c.id) ?? []);
          const charImages = await resolveCharacterImages(charIds);
          const charImageFiles = charImages
            .filter((e) => e.imageDataUrl)
            .map((e) => ({
              type: 'file' as const,
              mediaType: 'image/webp',
              url: e.imageDataUrl!,
              filename: `${e.characterName}-reference.webp`,
            }));
          // Merge: character images first, then director's manual attachments
          const allFiles = [...charImageFiles, ...(files ?? [])];
          const hasFiles = allFiles.length > 0;
          void sendMessage(hasFiles ? { text, files: allFiles } : { text });
          // C5 — set routing note after send (server determines the route)
          if (charImages.length > 0) {
            const modelId =
              providerConfig.activeModel?.trim() ||
              providerConfig.model?.trim() ||
              providerConfig.models?.[0]?.trim() || '';
            const isTextOnly = !/(gemini|gpt-4o|gpt-4\.1|gpt-5|claude-3|claude-4|o3|o4)/i.test(modelId);
            if (isTextOnly) {
              setLastRoutingNote(
                `${charImages.length} character reference${charImages.length === 1 ? '' : 's'} attached — vision pre-pass ran before drafting (text-only model: ${modelId || 'unknown'}).`
              );
            } else {
              setLastRoutingNote(
                `${charImages.length} character reference${charImages.length === 1 ? '' : 's'} attached and sent to the drafting model.`
              );
            }
          } else {
            setLastRoutingNote(null);
          }
        }}
      />
    </div>
  );
}
