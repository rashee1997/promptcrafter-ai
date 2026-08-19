'use client';

import React from 'react';
import { Bookmark, Check, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChipOption } from '@/lib/image-prompts';
import { CustomPresetMode } from '@/types';
import { CustomChipEditor, useCustomChipEntry } from './use-custom-chip-entry';

/** Subtle per-chip accent dots so the preset grids read at a glance. */
export const CHIP_DOTS = [
  'bg-brand',
  'bg-accent',
  'bg-success',
  'bg-warning',
  'bg-danger',
  'bg-[#e0529c]',
];

/** Sentinel for the row's trailing "Custom…" trigger (not a real option id). */
export const CUSTOM_CHIP_ID = '__custom__';

/**
 * Every chip row (single- and multi-select) gets custom value entry + saved
 * presets for free: a trailing "Custom…" trigger reveals an inline editor,
 * and persisted custom values render as bookmarked chips (deletable on hover)
 * alongside the built-in presets. `field` is the StudioFormState key the row
 * writes to; `mode` scopes saved presets to image-only / logo-only / shared.
 */
interface ChipRowProps {
  label: string;
  icon: React.ReactNode;
  options: ChipOption[];
  value: string | undefined;
  onChange: (id: string) => void;
  field: string;
  mode: CustomPresetMode;
}

/** Single-select chip row (label + icon + selectable options). */
export function ChipRow({ label, icon, options, value, onChange, field, mode }: ChipRowProps) {
  const custom = useCustomChipEntry({ field, mode });

  // A restored/saved value that matches no built-in preset id renders as a
  // selected custom chip in place of the "Custom" trigger.
  const showsCustomChip =
    value !== undefined &&
    value !== '' &&
    !options.some((o) => o.id === value) &&
    !custom.saved.some((e) => e.value === value);

  const handleConfirm = () => {
    const v = custom.confirmDraft();
    if (v !== null) onChange(v);
  };

  const handleSave = async () => {
    const v = await custom.saveDraft();
    if (v !== null) onChange(v);
  };

  return (
    <div className="space-y-2">
      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
        {icon}
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-1.5">
        {options.map((opt, i) => {
          const selected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              title={opt.hint}
              aria-pressed={selected}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all',
                selected
                  ? 'bg-brand/15 border-brand text-text-primary ring-1 ring-brand/40 shadow-sm'
                  : 'bg-surface-card/50 border-border text-text-secondary hover:border-brand/40 hover:bg-surface-hover'
              )}
            >
              <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', CHIP_DOTS[i % CHIP_DOTS.length])} />
              {opt.label}
              {selected && <Check className="w-3 h-3 text-brand shrink-0" />}
            </button>
          );
        })}

        {/* Saved custom presets — normal chips with a bookmark marker + hover delete. */}
        {custom.saved.map((entry) => {
          const selected = value === entry.value;
          return (
            <div key={entry.id} className="relative group">
              <button
                type="button"
                onClick={() => onChange(entry.value)}
                title={`Saved: ${entry.label}`}
                aria-pressed={selected}
                className={cn(
                  'flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all',
                  selected
                    ? 'bg-brand/15 border-brand text-text-primary ring-1 ring-brand/40 shadow-sm'
                    : 'bg-surface-card/50 border-border text-text-secondary hover:border-brand/40 hover:bg-surface-hover'
                )}
              >
                <Bookmark className="w-3 h-3 shrink-0 text-warning" />
                <span className="max-w-[160px] truncate">{entry.label}</span>
                {selected && <Check className="w-3 h-3 text-brand shrink-0" />}
              </button>
              <button
                type="button"
                onClick={() => custom.remove(entry.id)}
                title="Delete saved value"
                aria-label={`Delete saved value ${entry.label}`}
                className="absolute -top-1.5 -right-1.5 hidden group-hover:flex items-center justify-center w-4 h-4 rounded-full bg-surface-elevated border border-border text-text-muted hover:text-danger shadow-sm transition-colors"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          );
        })}

        {/* Trailing slot: selected custom value, the inline editor, or the trigger. */}
        {showsCustomChip ? (
          <button
            type="button"
            onClick={() => value !== undefined && onChange(value)}
            title="Custom value"
            aria-pressed
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border bg-brand/15 border-brand text-text-primary ring-1 ring-brand/40 shadow-sm"
          >
            <Plus className="w-3 h-3 text-brand shrink-0" />
            <span className="max-w-[160px] truncate">{value}</span>
            <Check className="w-3 h-3 text-brand shrink-0" />
          </button>
        ) : custom.entering ? (
          <CustomChipEditor
            draft={custom.draft}
            onDraftChange={custom.changeDraft}
            onConfirm={handleConfirm}
            onSave={handleSave}
            onCancel={custom.cancel}
          />
        ) : (
          <button
            type="button"
            onClick={custom.begin}
            aria-label={`Add a custom ${label.toLowerCase()} value`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border border-dashed border-border text-text-muted hover:text-brand hover:border-brand/40 transition-all"
          >
            <Plus className="w-3 h-3 shrink-0" />
            Custom
          </button>
        )}
      </div>
    </div>
  );
}

interface MultiChipRowProps {
  label: string;
  icon: React.ReactNode;
  options: ChipOption[];
  /** Selected option ids. */
  values: string[];
  onChange: (ids: string[]) => void;
  /** Optional helper text under the row. */
  helper?: string;
  field: string;
  mode: CustomPresetMode;
}

/** Multi-select chip row — same visual language, toggling membership in a list. */
export function MultiChipRow({ label, icon, options, values, onChange, helper, field, mode }: MultiChipRowProps) {
  const custom = useCustomChipEntry({ field, mode });

  const toggle = (id: string) =>
    onChange(values.includes(id) ? values.filter((v) => v !== id) : [...values, id]);

  // Confirmed custom values get added to values[] — any that aren't a preset
  // or saved preset render as selected custom chips so nothing looks unset.
  const customValues = values.filter(
    (v) => v && !options.some((o) => o.id === v) && !custom.saved.some((e) => e.value === v)
  );

  const handleConfirm = () => {
    const v = custom.confirmDraft();
    if (v !== null) toggle(v);
  };

  const handleSave = async () => {
    const v = await custom.saveDraft();
    if (v !== null) toggle(v);
  };

  return (
    <div className="space-y-2">
      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
        {icon}
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-1.5">
        {options.map((opt, i) => {
          const selected = values.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggle(opt.id)}
              title={opt.hint}
              aria-pressed={selected}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all',
                selected
                  ? 'bg-brand/15 border-brand text-text-primary ring-1 ring-brand/40 shadow-sm'
                  : 'bg-surface-card/50 border-border text-text-secondary hover:border-brand/40 hover:bg-surface-hover'
              )}
            >
              <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', CHIP_DOTS[i % CHIP_DOTS.length])} />
              {opt.label}
              {selected && <Check className="w-3 h-3 text-brand shrink-0" />}
            </button>
          );
        })}

        {/* Saved custom presets — normal chips with a bookmark marker + hover delete. */}
        {custom.saved.map((entry) => {
          const selected = values.includes(entry.value);
          return (
            <div key={entry.id} className="relative group">
              <button
                type="button"
                onClick={() => toggle(entry.value)}
                title={`Saved: ${entry.label}`}
                aria-pressed={selected}
                className={cn(
                  'flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all',
                  selected
                    ? 'bg-brand/15 border-brand text-text-primary ring-1 ring-brand/40 shadow-sm'
                    : 'bg-surface-card/50 border-border text-text-secondary hover:border-brand/40 hover:bg-surface-hover'
                )}
              >
                <Bookmark className="w-3 h-3 shrink-0 text-warning" />
                <span className="max-w-[160px] truncate">{entry.label}</span>
                {selected && <Check className="w-3 h-3 text-brand shrink-0" />}
              </button>
              <button
                type="button"
                onClick={() => custom.remove(entry.id)}
                title="Delete saved value"
                aria-label={`Delete saved value ${entry.label}`}
                className="absolute -top-1.5 -right-1.5 hidden group-hover:flex items-center justify-center w-4 h-4 rounded-full bg-surface-elevated border border-border text-text-muted hover:text-danger shadow-sm transition-colors"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          );
        })}

        {customValues.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => toggle(v)}
            title="Custom value"
            aria-pressed
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border bg-brand/15 border-brand text-text-primary ring-1 ring-brand/40 shadow-sm"
          >
            <Plus className="w-3 h-3 text-brand shrink-0" />
            <span className="max-w-[160px] truncate">{v}</span>
            <Check className="w-3 h-3 text-brand shrink-0" />
          </button>
        ))}

        {custom.entering ? (
          <CustomChipEditor
            draft={custom.draft}
            onDraftChange={custom.changeDraft}
            onConfirm={handleConfirm}
            onSave={handleSave}
            onCancel={custom.cancel}
          />
        ) : (
          <button
            type="button"
            onClick={custom.begin}
            aria-label={`Add a custom ${label.toLowerCase()} value`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border border-dashed border-border text-text-muted hover:text-brand hover:border-brand/40 transition-all"
          >
            <Plus className="w-3 h-3 shrink-0" />
            Custom
          </button>
        )}
      </div>
      {helper && <p className="text-[10px] text-text-muted leading-relaxed">{helper}</p>}
    </div>
  );
}
