'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, RotateCcw } from 'lucide-react';
import type { ProviderConfig } from '@/types';
import type { VideoBootstrapStage } from '@/lib/video/bootstrap/types';
import { getProviderActiveModel, getSavedProviders } from '@/lib/storage';
import { cn } from '@/lib/utils';

/**
 * A persisted per-stage override — just a pointer into the encrypted provider
 * store ({ providerId, model }), never a full ProviderConfig. API keys stay
 * in lib/storage's AES-GCM vault; bootstrap-flow resolves the live provider
 * from getSavedProviders() at request time.
 */
export interface StageModelRef {
  providerId: string;
  model: string;
}

interface BootstrapModelSelectorProps {
  stage: VideoBootstrapStage;
  /** Settings-global provider — used whenever no per-stage override is set. */
  defaultProvider: ProviderConfig;
  value: StageModelRef | null;
  onChange: (ref: StageModelRef | null) => void;
}

interface ModelEntry {
  provider: ProviderConfig;
  model: string;
}
/**
 * Task 4.5 — per-stage model override for the bootstrap wizard. The dropdown
 * is populated ONLY from saved ProviderConfigs (getSavedProviders() +
 * getProviderActiveModel()) — never a hardcoded list. The chosen provider
 * rides the stage request's `provider` field and resolves via
 * resolveVideoModel(); clearing the override restores the Settings model.
 */
export function BootstrapModelSelector({ stage, defaultProvider, value, onChange }: BootstrapModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<ModelEntry[]>([]);
  const [highlight, setHighlight] = useState(0);
  const entriesRef = useRef(entries);
  entriesRef.current = entries;
  const load = async () => {
    const providers = await getSavedProviders();
    const resolved: ModelEntry[] = [];
    for (const p of providers) {
      const active = await getProviderActiveModel(p);
      const models = Array.isArray(p.models) && p.models.length > 0 ? p.models : [active];
      for (const model of models) resolved.push({ provider: p, model });
    }
    setEntries(resolved);
  };
  useEffect(() => {
    void load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    void load();
    setHighlight(0);
    const onKey = (e: KeyboardEvent) => {
      const count = entriesRef.current.length + 1; // +1 Settings-default row
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlight((h) => (h + 1) % count);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlight((h) => (h - 1 + count) % count);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlight === 0) onChange(null);
        else {
          const entry = entriesRef.current[highlight - 1];
          if (entry) onChange({ providerId: entry.provider.id, model: entry.model });
        }
        setOpen(false);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, highlight, onChange]);

  const effectiveModel = value?.model || defaultProvider.model || defaultProvider.activeModel || 'Model';
  const isSelected = (entry: ModelEntry) =>
    value
      ? entry.provider.id === value.providerId && entry.model === value.model
      : entry.provider.id === defaultProvider.id && entry.model === effectiveModel;

  const rows = [
    { key: 'default', label: 'Settings default', sub: defaultProvider.name + ' — ' + effectiveModel, entry: null as ModelEntry | null },
    ...entries.map((entry) => ({ key: entry.provider.id + ':' + entry.model, label: entry.provider.name, sub: entry.model, entry })),
  ];

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Model for stage ${stage}`}
        title={value ? `Stage ${stage} override — ${effectiveModel}` : `Stage ${stage} uses the Settings model`}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono border transition-colors',
          value ? 'bg-brand/10 text-brand border-brand/30' : 'bg-surface-muted text-text-secondary border-border hover:border-brand/50'
        )}
      >
        <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted">Model:</span>
        <span className="max-w-[130px] truncate">{effectiveModel}</span>
        <ChevronDown className={cn('w-3 h-3 text-text-muted transition-transform', open && 'rotate-180')} aria-hidden="true" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            role="menu"
            className="absolute right-0 top-full mt-1.5 z-20 w-64 max-h-72 overflow-y-auto p-1 rounded-xl bg-surface-card border border-border shadow-lg scrollbar-thin"
          >
            {rows.map((row, i) => {
              const active = row.entry ? isSelected(row.entry) : !value;
              return (
                <button
                  key={row.key}
                  type="button"
                  role="menuitem"
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => {
                    if (row.entry) onChange({ providerId: row.entry.provider.id, model: row.entry.model });
                    else onChange(null);
                    setOpen(false);
                  }}
                  className={cn(
                    'w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between gap-2 transition-colors',
                    i === highlight ? 'bg-brand/10 text-brand' : 'text-text-secondary hover:bg-surface-hover'
                  )}
                >
                  <span className="min-w-0">
                    <span className={cn('block text-[11px] truncate', i === 0 && 'font-semibold')}>
                      {i === 0 && <RotateCcw className="w-3 h-3 inline-block mr-1 -mt-0.5" aria-hidden="true" />}
                      {row.label}
                    </span>
                    <span className="block text-[10px] font-mono text-text-muted truncate">{row.sub}</span>
                  </span>
                  {active && <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
