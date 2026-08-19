'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { VideoProject } from '@/types/video';
import { cn } from '@/lib/utils';

interface TokenAutocompleteProps {
  project: VideoProject;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  /** Current controlled input value (from the PromptInput controller). */
  value: string;
  onChange: (next: string) => void;
}

type Trigger = '@' | '#' | '!';

const CAMERA_TOKENS = ['#DollyIn', '#PanRight', '#CraneUp', '#ArcShot', '#StaticFrame'];
const LIGHTING_TOKENS = ['!GoldenHour', '!VolumetricFog', '!NeonReflections', '!HighContrastChiaroscuro'];

interface TokenOption {
  label: string;
  group: string;
}

/**
 * @/#/! anchor token popover bound to the textarea's cursor. A hidden mirror
 * div (same metrics as the textarea) measures the caret so the floating panel
 * lands exactly under the token being typed. Keyboard: ArrowUp / ArrowDown /
 * Enter / Escape. Inserted tokens land at the active cursor position.
 */
export function TokenAutocomplete({ project, textareaRef, value, onChange }: TokenAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [trigger, setTrigger] = useState<Trigger | null>(null);
  const [query, setQuery] = useState('');
  const [triggerStart, setTriggerStart] = useState(0);
  const [highlight, setHighlight] = useState(0);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  const valueRef = useRef(value);
  valueRef.current = value;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const openRef = useRef(open);
  openRef.current = open;
  // Fresh values are assigned after `options` / `insert` are declared below.
  const optionsRef = useRef<TokenOption[]>([]);
  const highlightRef = useRef(highlight);
  highlightRef.current = highlight;
  const insertRef = useRef<(token: string) => void>(() => {});
  const mirrorRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | null>(null);

  const bible = project.storyBible ?? { characters: [], locations: [] };

  const options = useMemo<TokenOption[]>(() => {
    if (!trigger) return [];
    const q = query.toLowerCase();
    const filter = (rows: TokenOption[]) =>
      rows.filter((r) => r.label.toLowerCase().includes(q)).slice(0, 12);
    if (trigger === '@') {
      return filter([
        ...bible.characters.map((c) => ({ label: `@${c.name}`, group: 'Character' })),
        ...bible.locations.map((l) => ({ label: `@${l.name}`, group: 'Location' })),
      ]);
    }
    if (trigger === '#') return filter(CAMERA_TOKENS.map((t) => ({ label: t, group: 'Camera move' })));
    return filter(LIGHTING_TOKENS.map((t) => ({ label: t, group: 'Lighting / atmosphere' })));
  }, [trigger, query, bible.characters, bible.locations]);

  const close = () => {
    setOpen(false);
    setTrigger(null);
    setQuery('');
    setHighlight(0);
  };

  // Recompute the trigger + caret position from the current selection.
  const refresh = () => {
    const el = textareaRef.current;
    if (!el) return;
    const cursor = el.selectionStart ?? valueRef.current.length;
    const before = valueRef.current.slice(0, cursor);
    const match = before.match(/([@#!])([^\s@#!]*)$/);
    if (!match) {
      if (openRef.current) close();
      return;
    }
    const [, rawTrigger, rawQuery] = match;
    const start = cursor - match[0].length;
    const prev = before[start - 1];
    // Only trigger at a word boundary so mid-word @/!/# doesn't open the menu.
    if (prev && !/\s/.test(prev)) {
      if (openRef.current) close();
      return;
    }
    setOpen(true);
    setTrigger(rawTrigger as Trigger);
    setQuery(rawQuery);
    setTriggerStart(start);
    setHighlight(0);
    measureCaret(el, start, cursor);
  };

  // Mirror the text before the caret to find its pixel position. The mirror
  // shares the textarea's padding/width/type so the marker's viewport rect is
  // the caret's rect; the panel floats just below it.
  const measureCaret = (el: HTMLTextAreaElement, start: number, cursor: number) => {
    const mirror = mirrorRef.current;
    if (!mirror) return;
    const textBefore = valueRef.current.slice(0, cursor);
    mirror.textContent = '';
    const textNode = document.createTextNode(textBefore);
    const marker = document.createElement('span');
    marker.textContent = '\u200b';
    mirror.append(textNode, marker);
    mirror.style.width = `${el.clientWidth}px`;
    const markerRect = marker.getBoundingClientRect();
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 20;
    void start;
    setPos({
      left: Math.min(markerRect.left, window.innerWidth - 260),
      top: Math.min(markerRect.top + lineHeight + 6, window.innerHeight - 220),
    });
  };

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    const onInput = () => refresh();
    const onKeyUp = () => refresh();
    const onClick = () => refresh();
    const onKeyDown = (e: KeyboardEvent) => {
      if (!openRef.current) return;
      const count = optionsRef.current.length;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlight((h) => (count === 0 ? 0 : (h + 1) % count));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlight((h) => (count === 0 ? 0 : (h - 1 + count) % count));
      } else if (e.key === 'Enter') {
        // Only consume Enter when there is an option to insert; otherwise let
        // the key fall through so an empty popover never blocks submitting.
        const chosen = optionsRef.current[highlightRef.current];
        if (chosen) {
          e.preventDefault();
          insertRef.current(chosen.label);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        close();
      }
    };
    const onBlur = () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = window.setTimeout(close, 120);
    };

    el.addEventListener('input', onInput);
    el.addEventListener('keyup', onKeyUp);
    el.addEventListener('keydown', onKeyDown);
    el.addEventListener('click', onClick);
    el.addEventListener('blur', onBlur);
    return () => {
      el.removeEventListener('input', onInput);
      el.removeEventListener('keyup', onKeyUp);
      el.removeEventListener('keydown', onKeyDown);
      el.removeEventListener('click', onClick);
      el.removeEventListener('blur', onBlur);
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textareaRef]);

  const insert = (token: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const cursor = el.selectionStart ?? valueRef.current.length;
    const next = valueRef.current.slice(0, triggerStart) + token + valueRef.current.slice(cursor);
    onChangeRef.current(next);
    close();
    requestAnimationFrame(() => {
      el.focus();
      const caret = triggerStart + token.length;
      el.setSelectionRange(caret, caret);
    });
  };

  optionsRef.current = options;
  insertRef.current = insert;

  return (
    <>
      {/* Hidden caret-measurement mirror — always mounted so the first keystroke can measure */}
      <div
        ref={mirrorRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 overflow-hidden whitespace-pre-wrap break-words text-sm leading-relaxed font-mono p-3"
        style={{ visibility: 'hidden', zIndex: -1 }}
      />
      {open && trigger && options.length > 0 && (
      <div
        role="listbox"
        aria-label={`${trigger} token suggestions`}
        onMouseDown={(e) => e.preventDefault()}
        className="fixed z-50 min-w-[220px] max-w-[260px] p-1 rounded-xl bg-surface-card border border-border shadow-lg"
        style={{ left: pos?.left ?? 12, top: pos?.top ?? 12 }}
      >
        <p className="px-2.5 pt-1.5 pb-1 text-[9px] font-bold uppercase tracking-wider text-text-muted">
          {trigger === '@' ? 'Characters & locations' : trigger === '#' ? 'Camera moves' : 'Lighting / atmosphere'}
        </p>
        {options.map((option, i) => (
          <button
            key={option.label}
            type="button"
            role="option"
            aria-selected={i === highlight}
            onMouseEnter={() => setHighlight(i)}
            onMouseDown={(e) => {
              e.preventDefault();
              insert(option.label);
            }}
            className={cn(
              'w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between gap-2 transition-colors',
              i === highlight ? 'bg-brand/10 text-brand font-semibold' : 'text-text-secondary hover:bg-surface-hover'
            )}
          >
            <span className="truncate">{option.label}</span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-text-muted shrink-0">{option.group}</span>
          </button>
        ))}
      </div>
      )}
    </>
  );
}
