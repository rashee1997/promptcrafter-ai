'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Settings,
  Cpu,
  Brain,
  Upload,
  Database,
  Target,
  Palette,
  Sun,
  Moon,
  Plus,
  Trash2,
  Check,
  X,
  Download,
  Upload as UploadIcon,
  AlertTriangle,
  Clapperboard,
  Info,
  Eye,
  EyeOff,
} from 'lucide-react';
import { GlassCard } from './glass-card';
import { ConfirmModal } from './confirm-modal';
import { ProviderSettings } from './provider-settings';
import { ProviderConfig, AppSettings, DEFAULT_APP_SETTINGS, Session } from '@/types';
import { DOMAIN_PRESETS, FRAMEWORK_OPTIONS, TONE_OPTIONS } from '@/lib/domains';
import { getAppSettings, setAppSettings, getSessions, clearAllSessions } from '@/lib/storage';
import { getModelCapability } from '@/lib/model-capabilities';
import { toast } from './toast';

type SettingsTab = 'providers' | 'capabilities' | 'uploads' | 'data' | 'defaults' | 'appearance';

const TABS: { id: SettingsTab; label: string; Icon: React.ElementType }[] = [
  { id: 'providers', label: 'AI Providers', Icon: Cpu },
  { id: 'capabilities', label: 'Model Capabilities', Icon: Brain },
  { id: 'uploads', label: 'File & Upload', Icon: Upload },
  { id: 'data', label: 'Data & Privacy', Icon: Database },
  { id: 'defaults', label: 'Defaults', Icon: Target },
  { id: 'appearance', label: 'Appearance', Icon: Palette },
];

interface SettingsPageProps {
  providers: ProviderConfig[];
  activeProviderId: string;
  onSelectActiveProvider: (id: string) => void;
  onSaveProvider: (provider: ProviderConfig) => void;
  onDeleteProvider: (id: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onImportSessions?: (sessions: Session[]) => void;
}

export function SettingsPage({
  providers,
  activeProviderId,
  onSelectActiveProvider,
  onSaveProvider,
  onDeleteProvider,
  darkMode,
  setDarkMode,
  onImportSessions,
}: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('providers');
  const [settings, setSettings] = useState<AppSettings>({ ...DEFAULT_APP_SETTINGS });
  const [storageUsed, setStorageUsed] = useState<number | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [newExclusion, setNewExclusion] = useState('');
  const [newModelName, setNewModelName] = useState('');
  const importRef = useRef<HTMLInputElement>(null);

  // Load settings on mount
  useEffect(() => {
    getAppSettings().then(setSettings);
  }, []);

  // Estimate storage usage
  useEffect(() => {
    if (activeTab === 'data' && typeof navigator !== 'undefined' && navigator.storage?.estimate) {
      navigator.storage.estimate().then((est) => {
        setStorageUsed(est.usage ?? null);
      });
    }
  }, [activeTab]);

  const updateSettings = useCallback(async (partial: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      setAppSettings(next);
      return next;
    });
  }, []);

  // ── Export sessions ──
  const handleExportSessions = useCallback(async () => {
    const sessions = await getSessions();
    const blob = new Blob([JSON.stringify(sessions, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PromptCrafter-Sessions-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // ── Import sessions ──
  const handleImportFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && onImportSessions) {
          onImportSessions(parsed);
          toast.success('Sessions imported', `Imported ${parsed.length} session(s).`);
        }
      } catch {
        toast.error("Couldn't read that file", 'Choose a valid PromptCrafter export file.');
      }
    };
    reader.readAsText(file);
    if (importRef.current) importRef.current.value = '';
  }, [onImportSessions]);

  // ── Clear all data ──
  const handleClearAll = useCallback(async () => {
    await clearAllSessions();
    setShowClearConfirm(false);
    toast.success('All sessions cleared', 'Your saved prompts have been removed.');
  }, []);

  // ── Model capability helpers ──
  const getAllModels = useCallback((): { providerId: string; providerName: string; model: string }[] => {
    const result: { providerId: string; providerName: string; model: string }[] = [];
    for (const p of providers) {
      const models = p.models && p.models.length > 0 ? p.models : [p.model];
      for (const m of models) {
        result.push({ providerId: p.id, providerName: p.name, model: m });
      }
    }
    return result;
  }, [providers]);

  const getOverride = useCallback((providerId: string, model: string) => {
    return settings.modelCapabilityOverrides.find(
      (o) => (o.providerId === providerId || o.providerId === '*') && o.model === model
    );
  }, [settings.modelCapabilityOverrides]);

  const getEffectiveCapability = useCallback((providerId: string, model: string) => {
    const override = getOverride(providerId, model);
    if (override) {
      return { supportsVision: override.supportsVision, supportsPdf: override.supportsPdf, known: true, overridden: true };
    }
    const base = getModelCapability(model);
    return { ...base, overridden: false };
  }, [getOverride]);

  const addCapabilityOverride = useCallback((providerId: string, model: string) => {
    const existing = getOverride(providerId, model);
    if (existing) return;
    updateSettings({
      modelCapabilityOverrides: [
        ...settings.modelCapabilityOverrides,
        { model, providerId, supportsVision: false, supportsPdf: false },
      ],
    });
  }, [settings.modelCapabilityOverrides, getOverride, updateSettings]);

  const toggleOverrideCapability = useCallback((providerId: string, model: string, field: 'supportsVision' | 'supportsPdf') => {
    const existing = getOverride(providerId, model);
    if (existing) {
      updateSettings({
        modelCapabilityOverrides: settings.modelCapabilityOverrides.map((o) =>
          o.model === model && (o.providerId === providerId || o.providerId === '*')
            ? { ...o, [field]: !o[field] }
            : o
        ),
      });
    }
  }, [settings.modelCapabilityOverrides, getOverride, updateSettings]);

  const removeOverride = useCallback((providerId: string, model: string) => {
    updateSettings({
      modelCapabilityOverrides: settings.modelCapabilityOverrides.filter(
        (o) => !(o.model === model && (o.providerId === providerId || o.providerId === '*'))
      ),
    });
  }, [settings.modelCapabilityOverrides, updateSettings]);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <GlassCard variant="default" className="p-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-brand/10 text-brand border border-brand/20">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary">Settings</h2>
            <p className="text-xs text-text-muted">
              Configure providers, defaults, uploads, and preferences
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Tab Bar */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin" role="tablist" aria-label="Settings sections">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-brand/10 text-brand border border-brand/30 shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-transparent'
              }`}
            >
              <tab.Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div role="tabpanel">
        {/* ═══════════════════════ 1. AI Providers ═══════════════════════ */}
        {activeTab === 'providers' && (
          <ProviderSettings
            providers={providers}
            activeProviderId={activeProviderId}
            onSelectActiveProvider={onSelectActiveProvider}
            onSaveProvider={onSaveProvider}
            onDeleteProvider={onDeleteProvider}
          />
        )}

        {/* ═══════════════════════ 2. Model Capabilities ═══════════════════════ */}
        {activeTab === 'capabilities' && (
          <GlassCard variant="default" className="p-5 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-brand/10 text-brand border border-brand/20">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">Model Capabilities</h3>
                <p className="text-xs text-text-muted">
                  Override auto-detected vision &amp; PDF support per model
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-success/10 border border-success/20 text-xs text-success flex items-start gap-2.5">
              <Info className="w-4 h-4 text-success shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Self-hosted or custom models may support images/PDFs but aren&apos;t recognized by the
                auto-detection table. Override here to route attachments directly instead of
                auto-extracting them.
              </p>
            </div>

            <div className="space-y-2">
              {getAllModels().length === 0 ? (
                <p className="text-xs text-text-muted py-6 text-center">
                  No models configured. Add a provider in the AI Providers tab first.
                </p>
              ) : (
                getAllModels().map(({ providerId, providerName, model }) => {
                  const cap = getEffectiveCapability(providerId, model);
                  const override = getOverride(providerId, model);
                  return (
                    <div
                      key={`${providerId}:${model}`}
                      className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-colors ${
                        cap.overridden
                          ? 'bg-brand/5 border-brand/20'
                          : 'bg-surface-card border-border'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-text-primary truncate">{model}</span>
                          {cap.overridden && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-brand/10 text-brand border border-brand/20">
                              Override
                            </span>
                          )}
                          {!cap.known && !cap.overridden && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-warning/10 text-warning border border-warning/20">
                              Unrecognized
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-text-muted">{providerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (cap.overridden) {
                              toggleOverrideCapability(providerId, model, 'supportsVision');
                            } else {
                              addCapabilityOverride(providerId, model);
                              updateSettings({
                                modelCapabilityOverrides: [
                                  ...settings.modelCapabilityOverrides,
                                  { model, providerId, supportsVision: true, supportsPdf: false },
                                ],
                              });
                            }
                          }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-colors ${
                            cap.supportsVision
                              ? 'bg-success/10 text-success border-success/30'
                              : 'bg-surface-muted text-text-muted border-border'
                          }`}
                          title={cap.supportsVision ? 'Vision: supported' : 'Vision: not supported'}
                        >
                          {cap.supportsVision ? '👁 Vision' : '👁✗ No Vision'}
                        </button>
                        <button
                          onClick={() => {
                            if (cap.overridden) {
                              toggleOverrideCapability(providerId, model, 'supportsPdf');
                            } else {
                              addCapabilityOverride(providerId, model);
                              updateSettings({
                                modelCapabilityOverrides: [
                                  ...settings.modelCapabilityOverrides,
                                  { model, providerId, supportsVision: false, supportsPdf: true },
                                ],
                              });
                            }
                          }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-colors ${
                            cap.supportsPdf
                              ? 'bg-success/10 text-success border-success/30'
                              : 'bg-surface-muted text-text-muted border-border'
                          }`}
                          title={cap.supportsPdf ? 'PDF: supported' : 'PDF: not supported'}
                        >
                          {cap.supportsPdf ? '📄 PDF' : '📄✗ No PDF'}
                        </button>
                        {cap.overridden && (
                          <button
                            onClick={() => removeOverride(providerId, model)}
                            className="p-1 rounded-lg text-text-muted hover:text-danger transition-colors"
                            title="Remove override"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </GlassCard>
        )}

        {/* ═══════════════════════ 3. File & Upload ═══════════════════════ */}
        {activeTab === 'uploads' && (
          <GlassCard variant="default" className="p-5 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-brand/10 text-brand border border-brand/20">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">File &amp; Upload Preferences</h3>
                <p className="text-xs text-text-muted">
                  Control project upload behavior and auto-routing
                </p>
              </div>
            </div>

            {/* Extra exclusions */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-primary">
                Additional exclusion patterns
              </label>
              <p className="text-[11px] text-text-muted">
                Glob patterns or directory names to always skip during project uploads, beyond the
                built-in defaults (node_modules, dist, build, .venv, target, etc.)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {settings.uploadExclusions.map((excl) => (
                  <span
                    key={excl}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-muted border border-border text-[11px] font-mono text-text-primary"
                  >
                    {excl}
                    <button
                      onClick={() =>
                        updateSettings({
                          uploadExclusions: settings.uploadExclusions.filter((e) => e !== excl),
                        })
                      }
                      className="text-text-muted hover:text-danger transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newExclusion}
                  onChange={(e) => setNewExclusion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newExclusion.trim()) {
                      updateSettings({
                        uploadExclusions: [...settings.uploadExclusions, newExclusion.trim()],
                      });
                      setNewExclusion('');
                    }
                  }}
                  placeholder="e.g. .pytest_cache, __snapshots__"
                  className="flex-1 px-3 py-2 rounded-xl text-xs border border-border bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
                />
                <button
                  onClick={() => {
                    if (newExclusion.trim()) {
                      updateSettings({
                        uploadExclusions: [...settings.uploadExclusions, newExclusion.trim()],
                      });
                      setNewExclusion('');
                    }
                  }}
                  disabled={!newExclusion.trim()}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-brand text-[var(--brand-foreground)] hover:bg-brand/80 disabled:opacity-40 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Size & count caps */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-primary">Max files</label>
                <input
                  type="number"
                  min={10}
                  max={5000}
                  value={settings.uploadMaxFiles}
                  onChange={(e) => updateSettings({ uploadMaxFiles: Number(e.target.value) || 500 })}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-border bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-primary">Max combined size (MB)</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={settings.uploadMaxSizeMB}
                  onChange={(e) => updateSettings({ uploadMaxSizeMB: Number(e.target.value) || 5 })}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-border bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>

            {/* Auto-routing */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-primary">
                Attachment auto-routing
              </label>
              <p className="text-[11px] text-text-muted">
                When the active model can&apos;t read PDFs or images directly, the app can route them
                through the built-in Gemini extractor.
              </p>
              <div className="flex gap-2">
                {(
                  [
                    { value: 'always', label: 'Always auto-route', desc: 'Silently extract and show a toast' },
                    { value: 'ask', label: 'Ask first', desc: 'Show a confirmation before extracting' },
                    { value: 'never', label: 'Never', desc: 'Warn that the file can\'t be read' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateSettings({ autoRoutingPreference: opt.value })}
                    className={`flex-1 p-3 rounded-xl text-xs text-center border transition-all ${
                      settings.autoRoutingPreference === opt.value
                        ? 'bg-brand/10 text-brand border-brand/30 shadow-sm'
                        : 'bg-surface-card text-text-secondary border-border hover:border-brand/40'
                    }`}
                  >
                    <div className="font-semibold">{opt.label}</div>
                    <div className="text-[10px] text-text-muted mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>
        )}

        {/* ═══════════════════════ 4. Data & Privacy ═══════════════════════ */}
        {activeTab === 'data' && (
          <GlassCard variant="default" className="p-5 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-brand/10 text-brand border border-brand/20">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">Data &amp; Privacy</h3>
                <p className="text-xs text-text-muted">
                  Storage usage, export/import, and data management
                </p>
              </div>
            </div>

            {/* Security banner */}
            <div className="p-3 rounded-xl bg-success/10 border border-success/20 text-xs text-success flex items-start gap-2.5">
              <Info className="w-4 h-4 text-success shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                All data stays in your browser. Nothing is sent to any server. Session data is stored
                in IndexedDB with LocalStorage fallbacks. API keys are encrypted with AES-GCM.
              </p>
            </div>

            {/* Storage usage */}
            <div className="p-4 rounded-xl bg-surface-card border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-text-primary">Storage usage</span>
                {storageUsed !== null && (
                  <span className="text-xs font-mono text-text-secondary">{formatBytes(storageUsed)}</span>
                )}
              </div>
              {storageUsed !== null && (
                <div className="w-full h-2 rounded-full bg-surface-sunken overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand transition-all duration-500"
                    style={{ width: `${Math.min((storageUsed / (5 * 1024 * 1024)) * 100, 100)}%` }}
                  />
                </div>
              )}
              <p className="text-[10px] text-text-muted mt-1.5">
                {storageUsed !== null
                  ? `${formatBytes(storageUsed)} used of ~5 MB (browser limit varies)`
                  : 'Loading storage estimate…'}
              </p>
            </div>

            {/* Export / Import */}
            <div className="flex gap-3">
              <button
                onClick={handleExportSessions}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold bg-surface-card border border-border hover:border-brand/40 text-text-secondary transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-brand" />
                Export all sessions
              </button>
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold bg-surface-card border border-border hover:border-brand/40 text-text-secondary cursor-pointer transition-colors">
                <UploadIcon className="w-3.5 h-3.5 text-brand" />
                Import sessions
                <input
                  ref={importRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>

            {/* Clear all */}
            <div className="p-4 rounded-xl bg-danger/5 border border-danger/20">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-danger">Danger zone</h4>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Permanently delete all saved sessions and versions. This cannot be undone.
                  </p>
                </div>
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-danger/10 border border-danger/20 text-danger hover:bg-danger/20 flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear all
                </button>
              </div>
            </div>
          </GlassCard>
        )}

        {/* ═══════════════════════ 5. Defaults ═══════════════════════ */}
        {activeTab === 'defaults' && (
          <GlassCard variant="default" className="p-5 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-brand/10 text-brand border border-brand/20">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">Session Defaults</h3>
                <p className="text-xs text-text-muted">
                  Pre-fill new sessions with your preferred settings
                </p>
              </div>
            </div>

            {/* Default domain */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-primary">Default domain</label>
              <select
                value={settings.defaultDomainId}
                onChange={(e) => updateSettings({ defaultDomainId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs border border-border bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="">No default (show selector)</option>
                {DOMAIN_PRESETS.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Default framework */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-primary">Default framework</label>
              <select
                value={settings.defaultFramework}
                onChange={(e) => updateSettings({ defaultFramework: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs border border-border bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="">No default</option>
                {FRAMEWORK_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            {/* Default tone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-primary">Default tone</label>
              <select
                value={settings.defaultTone}
                onChange={(e) => updateSettings({ defaultTone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs border border-border bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="">No default</option>
                {TONE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Default output format */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-primary">Default output format</label>
              <select
                value={settings.defaultOutputFormat}
                onChange={(e) => updateSettings({ defaultOutputFormat: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs border border-border bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="">No default (uses markdown)</option>
                <option value="markdown">Markdown</option>
                <option value="json">JSON</option>
                <option value="bullet-points">Bullet Points</option>
                <option value="xml">XML</option>
                <option value="structured-text">Structured Text</option>
              </select>
            </div>

            {/* Default character limit */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-primary">
                Default character limit
              </label>
              <p className="text-[11px] text-text-muted">
                When set, new sessions pre-fill with this limit. 0 = no limit (let the model decide).
              </p>
              <input
                type="number"
                min={0}
                max={50000}
                step={500}
                value={settings.defaultCharLimit}
                onChange={(e) => updateSettings({ defaultCharLimit: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl text-xs border border-border bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="0 = no limit"
              />
            </div>

            {/* ═══════════════════════ Video Director Defaults ═══════════════════════ */}
            <hr className="border-border" />
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-brand/10 text-brand border border-brand/20">
                <Clapperboard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">Video Director Defaults</h3>
                <p className="text-xs text-text-muted">
                  Default shot-level customization for new video projects
                </p>
              </div>
            </div>

            {/* Default prompt form override */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-primary">Default prompt form</label>
              <select
                value={settings.videoPromptFormOverride ?? 'auto'}
                onChange={(e) => updateSettings({ videoPromptFormOverride: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs border border-border bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="auto">Let AI choose</option>
                <option value="flowing-prose">Flowing prose</option>
                <option value="minimal-labeled">Minimal labeled</option>
                <option value="time-coded">Time-coded</option>
                <option value="reference-directive">Reference directive</option>
              </select>
              <p className="text-[11px] text-text-muted">
                Applied to new shots unless overridden per-shot in the storyboard.
              </p>
            </div>

            {/* Default platform override */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-primary">Default platform override</label>
              <select
                value={settings.videoPlatformOverride ?? ''}
                onChange={(e) => updateSettings({ videoPlatformOverride: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs border border-border bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="">Inherit project platform</option>
                <option value="veo">Veo</option>
                <option value="kling">Kling</option>
                <option value="seedance">Seedance</option>
                <option value="higgsfield">Higgsfield</option>
                <option value="runway">Runway</option>
                <option value="luma">Luma</option>
                <option value="pika">Pika</option>
              </select>
            </div>

            {/* Dialect toggles */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-primary">Dialect toggles (skip if unneeded)</label>
              <p className="text-[11px] text-text-muted">
                Toggle off platforms you don&apos;t use to shrink the API payload for Product Studio.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {([
                  { value: 'veo', label: 'Veo' },
                  { value: 'kling', label: 'Kling' },
                  { value: 'seedance', label: 'Seedance' },
                  { value: 'higgsfield', label: 'Higgsfield' },
                  { value: 'runway', label: 'Runway' },
                  { value: 'luma', label: 'Luma' },
                  { value: 'pika', label: 'Pika' },
                ] as const).map((p) => {
                  const skipped = (settings.videoSkippedDialects ?? []).includes(p.value);
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => {
                        const current = settings.videoSkippedDialects ?? [];
                        const next = skipped
                          ? current.filter((d) => d !== p.value)
                          : [...current, p.value];
                        updateSettings({ videoSkippedDialects: next.length > 0 ? next : undefined });
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                        skipped
                          ? 'bg-surface-muted text-text-muted border-border line-through'
                          : 'bg-brand/10 text-brand border-brand/30'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Extension beats toggle */}
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-surface-card">
              <div>
                <label className="text-xs font-semibold text-text-primary">Extension beats</label>
                <p className="text-[11px] text-text-muted mt-0.5">
                  When on, new shots default to being part of a longer chained sequence.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.videoExtensionBeatsEnabled ?? false}
                onClick={() => updateSettings({ videoExtensionBeatsEnabled: !(settings.videoExtensionBeatsEnabled ?? false) })}
                className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                  (settings.videoExtensionBeatsEnabled ?? false)
                    ? 'bg-brand'
                    : 'bg-surface-muted border-border'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                    (settings.videoExtensionBeatsEnabled ?? false) ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </GlassCard>
        )}

        {/* ═══════════════════════ 6. Appearance ═══════════════════════ */}
        {activeTab === 'appearance' && (
          <GlassCard variant="default" className="p-5 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-brand/10 text-brand border border-brand/20">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">Appearance</h3>
                <p className="text-xs text-text-muted">
                  Theme and visual preferences
                </p>
              </div>
            </div>

            {/* Theme toggle */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-primary">Theme</label>
              <p className="text-[11px] text-text-muted">
                Synced with the navbar toggle. Changes apply instantly.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDarkMode(true)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-xl text-xs font-semibold border transition-all ${
                    darkMode
                      ? 'bg-brand/10 text-brand border-brand/30 shadow-sm'
                      : 'bg-surface-card text-text-secondary border-border hover:border-brand/40'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  Dark
                </button>
                <button
                  onClick={() => setDarkMode(false)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-xl text-xs font-semibold border transition-all ${
                    !darkMode
                      ? 'bg-brand/10 text-brand border-brand/30 shadow-sm'
                      : 'bg-surface-card text-text-secondary border-border hover:border-brand/40'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  Light
                </button>
              </div>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Clear All Confirm Modal */}
      <ConfirmModal
        isOpen={showClearConfirm}
        title="Clear all saved prompts?"
        message="This will permanently delete every saved session, version, and test result. This action cannot be undone."
        confirmLabel="Clear everything"
        cancelLabel="Keep my data"
        variant="danger"
        onConfirm={handleClearAll}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
}
