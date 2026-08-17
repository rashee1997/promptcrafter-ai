'use client';

import React, { useRef } from 'react';
import { ArrowUp } from 'lucide-react';
import type { VideoProject } from '@/types/video';
import { PromptInput, PromptInputProvider, usePromptInputController } from '@/components/ai-elements/prompt-input';
import { TokenAutocomplete } from './token-autocomplete';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  project: VideoProject;
  /** True while the assistant response is streaming — disables sending. */
  busy?: boolean;
  onSend: (text: string) => void;
}

function ChatInputInner({ project, busy, onSend }: ChatInputProps) {
  const controller = usePromptInputController();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const value = controller.textInput.value;
  const canSend = value.trim().length > 0 && !busy;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // The token autocomplete's native keydown listener runs first; when it
    // handled Enter (token insertion) or Escape, do not also submit the form.
    if (e.defaultPrevented) return;
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (canSend) e.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <div className="relative">
      <PromptInput
        onSubmit={({ text }) => {
          const trimmed = text.trim();
          if (trimmed) onSend(trimmed);
        }}
        className="rounded-2xl"
      >
        <textarea
          ref={textareaRef}
          name="message"
          value={value}
          onChange={(e) => controller.textInput.setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the next shot… @ for cast/locations, # for camera moves, ! for lighting"
          aria-label="Shot drafting message"
          className={cn(
            'w-full resize-none border-0 bg-transparent px-3.5 py-3 text-sm leading-relaxed font-mono text-slate-100',
            'placeholder:text-slate-500 focus:outline-none min-h-[64px] max-h-48 whitespace-pre-wrap break-words'
          )}
        />
        <TokenAutocomplete project={project} textareaRef={textareaRef} value={value} onChange={controller.textInput.setInput} />
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-slate-800/80">
          <span className="text-[10px] text-slate-500 font-medium">
            <span className="text-slate-400">@</span> cast · <span className="text-slate-400">#</span> camera ·{' '}
            <span className="text-slate-400">!</span> lighting
          </span>
          <button
            type="submit"
            disabled={!canSend}
            aria-label="Send message"
            className={cn(
              'inline-flex items-center justify-center w-8 h-8 rounded-lg text-white transition-all',
              'bg-gradient-to-br from-brand to-accent shadow-glow hover:brightness-110 active:scale-[0.985]',
              !canSend && 'opacity-40 cursor-not-allowed shadow-none'
            )}
          >
            <ArrowUp className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </PromptInput>
    </div>
  );
}

/** PromptInputProvider lifts the textarea state so the autocomplete can edit it. */
export function ChatInput(props: ChatInputProps) {
  return (
    <PromptInputProvider>
      <ChatInputInner {...props} />
    </PromptInputProvider>
  );
}
