import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SlidersHorizontal, X, Sparkles, Image as ImageIcon, Shapes } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ASPECT_RATIOS, PURPOSE_OPTIONS } from '@/lib/image-prompts';
import { StudioFormHandlers, StudioFormState } from './studio-types';
import { toast } from '../toast';

interface SettingsPopoverProps {
  state: StudioFormState;
  handlers: StudioFormHandlers;
  isLogo: boolean;
}

export function SettingsPopover({ state, handlers, isLogo }: SettingsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all shadow-xs',
          isOpen
            ? 'bg-brand/20 border-brand text-text-primary ring-2 ring-brand/40'
            : 'bg-surface-card border-border text-text-secondary hover:border-brand/40 hover:text-text-primary hover:bg-surface-hover'
        )}
        title="Configure prompt settings"
        aria-expanded={isOpen}
      >
        <SlidersHorizontal className="w-4 h-4 text-brand" />
        <span>Settings</span>
        {(state.purpose || state.aspectRatio || state.outputFormat) && (
          <span className="w-2 h-2 rounded-full bg-brand" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for closing */}
            <div
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="absolute left-0 bottom-full mb-2 z-50 w-80 sm:w-96 rounded-2xl border border-border/80 bg-surface-card/95 shadow-2xl max-h-[80vh] flex flex-col"
            >
              {/* Pinned header — close button never moves */}
              <div className="flex items-center justify-between border-b border-border px-4 py-3 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-brand/10 text-brand">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                    Prompt Settings & Routing
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable content area */}
              <div className="overflow-y-auto px-4 py-3 space-y-4 flex-1 min-h-0 scrollbar-thin">
              {/* Purpose Routing */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand" />
                  {isLogo ? 'Logo Purpose / Architecture' : 'Intended Purpose / Routing'}
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {PURPOSE_OPTIONS.map((opt) => {
                    const selected = state.purpose === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          if (selected) {
                            handlers.setPurpose(undefined);
                          } else {
                            handlers.setPurpose(opt.id);
                          }
                        }}
                        aria-pressed={selected}
                        className={cn(
                          'flex items-center justify-between p-2 rounded-xl text-left text-xs border transition-all',
                          selected
                            ? 'bg-brand/15 border-brand text-text-primary ring-1 ring-brand/40 font-semibold'
                            : 'bg-surface-card/50 border-border text-text-secondary hover:border-brand/40 hover:bg-surface-hover'
                        )}
                      >
                        <span className="truncate">{opt.label}</span>
                        {selected && <span className="text-[10px] text-brand font-bold">Selected</span>}
                      </button>
                    );
                  })}
                </div>
                {state.purpose && (() => {
                  const activeOpt = PURPOSE_OPTIONS.find((o) => o.id === state.purpose);
                  if (!activeOpt) return null;
                  const logoPreset = activeOpt.suggestPlatforms.some((p) => ['recraft', 'ideogram'].includes(p));
                  return (
                    <>
                      <p className="text-[10px] text-brand font-medium leading-relaxed bg-brand/5 p-2 rounded-lg border border-brand/20">
                        {activeOpt.reason}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          handlers.setPlatforms(activeOpt.suggestPlatforms);
                          if (logoPreset && state.mode !== 'logo') {
                            handlers.setMode('logo');
                          } else if (!logoPreset && state.mode === 'logo') {
                            handlers.setMode('image');
                          }
                          handlers.setPurpose(undefined);
                          toast.success('Preset applied', `${activeOpt.label} — platforms and mode updated.`);
                        }}
                        className="w-full py-1.5 rounded-lg text-[11px] font-bold bg-brand text-[var(--brand-foreground)] hover:bg-brand-hover transition-colors shadow-sm"
                      >
                        Apply {activeOpt.label} preset
                      </button>
                    </>
                  );
                })()}
              </div>

              {/* Aspect Ratio / Geometry */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-brand" />
                  Aspect Ratio / Output Scale
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {ASPECT_RATIOS.map((ar) => {
                    const selected = state.aspectRatio === ar.id;
                    return (
                      <button
                        key={ar.id}
                        type="button"
                        onClick={() => handlers.setAspectRatio(ar.id)}
                        className={cn(
                          'px-2 py-1.5 rounded-lg text-center text-xs font-medium border transition-all',
                          selected
                            ? 'bg-brand/15 border-brand text-text-primary ring-1 ring-brand/40 font-bold'
                            : 'bg-surface-card/50 border-border text-text-secondary hover:border-brand/40 hover:bg-surface-hover'
                        )}
                        title={ar.hint}
                      >
                        {ar.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Output Format */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                  <Shapes className="w-3.5 h-3.5 text-brand" />
                  Output Format
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['prose', 'json', 'both'] as const).map((fmt) => {
                    const selected = state.outputFormat === fmt;
                    return (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => handlers.setOutputFormat(fmt)}
                        className={cn(
                          'px-2 py-1.5 rounded-lg text-center text-xs font-medium border transition-all uppercase',
                          selected
                            ? 'bg-brand/15 border-brand text-text-primary ring-1 ring-brand/40 font-bold'
                            : 'bg-surface-card/50 border-border text-text-secondary hover:border-brand/40 hover:bg-surface-hover'
                        )}
                      >
                        {fmt}
                      </button>
                    );
                  })}
                </div>
              </div>
              </div>{/* end scrollable content */}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
