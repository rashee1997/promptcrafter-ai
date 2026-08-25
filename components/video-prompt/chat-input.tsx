'use client';

import React, { useRef } from 'react';
import { ArrowUp, FileText, X } from 'lucide-react';
import type { FileUIPart } from 'ai';
import type { VideoProject } from '@/types/video';
import { PromptInput, PromptInputProvider, usePromptInputAttachments, usePromptInputController } from '@/components/ai-elements/prompt-input';
import { toast } from '@/components/toast';
import { TokenAutocomplete } from './token-autocomplete';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  project: VideoProject;
  /** True while the assistant response is streaming — disables sending. */
  busy?: boolean;
  /** Attachments (converted to data URLs by PromptInput) ride the message. */
  onSend: (text: string, files?: FileUIPart[]) => void;
}

/** Accepted attachment types: reference images + script PDFs. */
const ACCEPT = 'image/png,image/jpeg,image/webp,application/pdf';
const MAX_FILES = 4;
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB

/**
 * Phase 1 — attachment staging strip above the textarea. Images render as
 * thumbnails, documents as file chips; every row removes on demand. The
 * underlying PromptInput handles drag-and-drop + the file picker, so no
 * dropzone library is needed.
 */
function AttachmentStrip() {
  const { files, remove, openFileDialog } = usePromptInputAttachments();

  if (files.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-3 pt-2.5" aria-label="Attached files">
      {files.map((file) => (
        <span
          key={file.id}
          className="group relative inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-muted/80 py-1 pl-1 pr-7 text-[10px] font-medium text-text-secondary"
        >
          {file.mediaType?.startsWith('image/') ? (
            // Thumbnails show at native size until the send converts to data URLs.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={file.url} alt="" className="h-9 w-9 rounded-md object-cover" />
          ) : (
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-surface-code border border-border">
              <FileText className="h-4 w-4 text-accent" aria-hidden="true" />
            </span>
          )}
          <span className="max-w-28 truncate">{file.filename}</span>
          <button
            type="button"
            onClick={() => remove(file.id)}
            aria-label={`Remove ${file.filename}`}
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-1 text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={openFileDialog}
        className="rounded-lg border border-dashed border-border px-2 py-1.5 text-[10px] font-semibold text-text-muted hover:border-brand/50 hover:text-brand transition-colors"
      >
        + Add
      </button>
    </div>
  );
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
        accept={ACCEPT}
        multiple={true}
        maxFiles={MAX_FILES}
        maxFileSize={MAX_FILE_SIZE}
        onError={(err) => toast.error('Attachment rejected', err.message)}
        onSubmit={({ text, files }) => {
          const trimmed = text.trim();
          if (trimmed) onSend(trimmed, files);
        }}
        className="rounded-2xl"
      >
        <AttachmentStrip />
        <textarea
          ref={textareaRef}
          name="message"
          value={value}
          onChange={(e) => controller.textInput.setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the next shot… @ for cast/locations, # for camera moves, ! for lighting — or drop reference images/PDFs here"
          aria-label="Shot drafting message"
          className={cn(
            'w-full resize-none border-0 bg-transparent px-3.5 py-3 text-sm leading-relaxed font-mono text-text-primary',
            'placeholder:text-text-muted focus:outline-none min-h-[64px] max-h-48 whitespace-pre-wrap break-words'
          )}
        />
        <TokenAutocomplete project={project} textareaRef={textareaRef} value={value} onChange={controller.textInput.setInput} />
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-border">
          <span className="text-[10px] text-text-muted font-medium">
            <span className="text-text-secondary">@</span> cast · <span className="text-text-secondary">#</span> camera ·{' '}
            <span className="text-text-secondary">!</span> lighting · <span className="text-text-secondary">⇪</span> attachments
          </span>
          <button
            type="submit"
            disabled={!canSend}
            aria-label="Send message"
            className={cn(
              'inline-flex items-center justify-center w-8 h-8 rounded-lg text-[var(--brand-foreground)] transition-all',
              'bg-brand hover:bg-brand-hover shadow-glow active:scale-[0.985]',
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
