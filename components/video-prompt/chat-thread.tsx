'use client';

import React, { useMemo, useRef, useState } from 'react';
import { DefaultChatTransport } from 'ai';
import type { UIMessage } from 'ai';
import { useChat } from '@ai-sdk/react';
import { Clapperboard, Square } from 'lucide-react';
import type { ProviderConfig } from '@/types';
import type { ChatMessage, DraftedShot, ThinkingOrbState, VideoProject, VideoShot } from '@/types/video';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse, MessageToolbar } from '@/components/ai-elements/message';
import { saveVideoProject } from '@/lib/video-storage';
import { parseDraftedShot } from '@/lib/video/story-bible';
import { ThinkingOrb } from './thinking-orb';
import { ShotDraftCard } from './shot-draft-card';
import { ChatInput } from './chat-input';
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

  const [seed] = useState<UIMessage[]>(() => seedFromHistory(project));
  const [transport] = useState(
    () =>
      new DefaultChatTransport({
        api: '/api/video-chat',
        body: () => ({
          project: projectRef.current,
          providerConfig: providerRef.current,
        }),
      })
  );

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

  /** Writes the thread into project.chatHistory and hands it up. */
  const persistChat = async (finished: UIMessage[]) => {
    const chatHistory: ChatMessage[] = finished
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({
        id: m.id,
        role: m.role,
        content: getMessageText(m),
        timestamp: Date.now(),
      }));
    const updated: VideoProject = { ...projectRef.current, chatHistory, updatedAt: Date.now() };
    await saveVideoProject(updated);
    onProjectUpdateRef.current(updated);
  };

  const handleApprove = async (draft: DraftedShot) => {
    if (streaming) return;
    const base = projectRef.current;
    const now = Date.now();
    const existing = base.shots.find((s) => s.shotNumber === draft.shotNumber);
    const shot: VideoShot = {
      id: existing?.id ?? `shot-${now.toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      shotNumber: draft.shotNumber,
      description: draft.description,
      promptText: draft.promptText,
      continuityHandoff: draft.continuityHandoff,
      durationSeconds: draft.durationSeconds,
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
    // Advance the scene beat: the drafter immediately proposes the next shot.
    await sendMessage({
      text: `Shot ${draft.shotNumber} was approved and added to the storyboard. Draft the next shot.`,
    });
  };

  const handleRevise = (draft: DraftedShot) => {
    if (streaming) return;
    void sendMessage({
      text: `Revise your last shot draft (Shot ${draft.shotNumber}): "${draft.description}". Improve it while keeping the same subject, setting, and visual style anchors — re-emit the same shot number.`,
    });
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
    <div className="flex flex-col h-[62vh] min-h-[440px] gap-3">
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
                      disabled={streaming}
                      onApprove={(d) => void handleApprove(d)}
                      onRevise={handleRevise}
                    />
                  )}
                  {live && (
                    <MessageToolbar>
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-text-muted">
                        <ThinkingOrb state={orbState} size={20} className="shrink-0" />
                        {status === 'submitted' ? 'Connecting to the shot drafter…' : 'Drafting the shot…'}
                      </span>
                      <button
                        type="button"
                        onClick={stop}
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

      <ChatInput
        project={project}
        busy={streaming}
        onSend={(text, files) => {
          const attachments = files && files.length > 0 ? files : undefined;
          void sendMessage(attachments ? { text, files: attachments } : { text });
        }}
      />
    </div>
  );
}
