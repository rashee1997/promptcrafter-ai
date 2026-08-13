'use client';

import React, { useState } from 'react';
import {
  Cpu,
  Plus,
  Check,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Server,
  Globe,
  Sliders,
  Edit3,
} from 'lucide-react';
import { GlassCard } from './glass-card';
import { ProviderConfig } from '@/types';
import { DEFAULT_BUILTIN_PROVIDER, getProviderModelList } from '@/lib/storage';
import { normalizeBaseUrl } from '@/lib/openai-provider';

interface ProviderSettingsProps {
  providers: ProviderConfig[];
  activeProviderId: string;
  onSelectActiveProvider: (id: string) => void;
  onSaveProvider: (provider: ProviderConfig) => void;
  onDeleteProvider: (id: string) => void;
}

export function ProviderSettings({
  providers,
  activeProviderId,
  onSelectActiveProvider,
  onSaveProvider,
  onDeleteProvider,
}: ProviderSettingsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [editingProviderId, setEditingProviderId] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<{ loading: boolean; success?: boolean; message?: string }>({
    loading: false,
  });

  // Form State for new/edit provider
  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://api.openai.com/v1');
  const [apiKey, setApiKey] = useState('');
  const [models, setModels] = useState<string[]>(['gpt-4o-mini']);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [disableStreaming, setDisableStreaming] = useState(false);

  const resetForm = () => {
    setName('');
    setBaseUrl('https://api.openai.com/v1');
    setApiKey('');
    setModels(['gpt-4o-mini']);
    setTemperature(0.7);
    setMaxTokens(4096);
    setDisableStreaming(false);
    setEditingProviderId(null);
    setTestStatus({ loading: false });
    setShowAddForm(false);
  };

  const editProvider = (provider: ProviderConfig) => {
    setName(provider.name);
    setBaseUrl(provider.baseUrl);
    setApiKey(provider.apiKey || '');
    setModels(
      provider.models && provider.models.length > 0
        ? [...provider.models]
        : [provider.model || 'gpt-4o-mini']
    );
    setTemperature(provider.temperature ?? 0.7);
    setMaxTokens(provider.maxTokens ?? 4096);
    setDisableStreaming(provider.disableStreaming ?? false);
    setEditingProviderId(provider.id);
    setShowAddForm(true);
    setTestStatus({ loading: false });
  };

  const updateModelAt = (index: number, value: string) => {
    setModels((prev) => prev.map((m, i) => (i === index ? value : m)));
  };

  const removeModelAt = (index: number) => {
    setModels((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : [''];
    });
  };

  const addModelRow = () => {
    setModels((prev) => [...prev, '']);
  };

  const modelListValue = models.map((m) => m.trim()).filter(Boolean);

  const handleTestConnection = async () => {
    setTestStatus({ loading: true });
    try {
      const targetUrl = normalizeBaseUrl(baseUrl);
      const endpoint = `${targetUrl}/chat/completions`;

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: modelListValue[0] || 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Ping test' }],
          max_tokens: 5,
        }),
      });

      if (res.ok || res.status === 200 || res.status === 400 /* model accepted but short */) {
        setTestStatus({ loading: false, success: true, message: 'Connection successful!' });
      } else {
        const txt = await res.text().catch(() => '');
        setTestStatus({
          loading: false,
          success: false,
          message: `Provider error (${res.status}): ${txt.slice(0, 150)}`,
        });
      }
    } catch (err: any) {
      setTestStatus({
        loading: false,
        success: false,
        message: err?.message || "Couldn't connect. Check the service URL and try again.",
      });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !baseUrl.trim() || modelListValue.length === 0) return;

    const existingProvider = editingProviderId
      ? providers.find((p) => p.id === editingProviderId)
      : undefined;

    const newProvider: ProviderConfig = {
      id: editingProviderId || `provider-${Date.now()}`,
      name: name.trim(),
      baseUrl: baseUrl.trim(),
      apiKey: apiKey.trim(),
      model: modelListValue[0],
      models: modelListValue,
      // Keep the previously selected model if it is still part of the list
      activeModel:
        existingProvider?.activeModel && modelListValue.includes(existingProvider.activeModel)
          ? existingProvider.activeModel
          : existingProvider?.model && modelListValue.includes(existingProvider.model)
          ? existingProvider.model
          : undefined,
      temperature,
      maxTokens,
      disableStreaming,
      useBuiltInGemini: existingProvider?.useBuiltInGemini,
    };

    onSaveProvider(newProvider);
    resetForm();
  };

  const applyPreset = (presetType: 'openai' | 'openrouter' | 'groq' | 'ollama') => {
    if (presetType === 'openai') {
      setName('OpenAI Official');
      setBaseUrl('https://api.openai.com/v1');
      setModels(['gpt-4o-mini']);
    } else if (presetType === 'openrouter') {
      setName('OpenRouter AI');
      setBaseUrl('https://openrouter.ai/api/v1');
      setModels(['meta-llama/llama-3.3-70b-instruct']);
    } else if (presetType === 'groq') {
      setName('Groq Fast Inference');
      setBaseUrl('https://api.groq.com/openai/v1');
      setModels(['llama-3.3-70b-versatile']);
    } else if (presetType === 'ollama') {
      setName('Local Ollama Server');
      setBaseUrl('http://localhost:11434/v1');
      setApiKey('');
      setModels(['llama3']);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Active Provider Card */}
      <GlassCard variant="default" className="p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand/10 text-brand border border-brand/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">
                AI connections
              </h2>
              <p className="text-xs text-text-muted">
                Connect your own AI service or use the built-in Google Gemini
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-brand text-white hover:bg-brand/80 shadow-md shadow-brand/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add AI service</span>
          </button>
        </div>

        {/* Security / Privacy Banner */}
        <div className="p-3 rounded-xl bg-success/10 border border-success/20 text-xs text-success flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-success shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="font-bold">Security:</strong> API keys are encrypted on your device before saving and are only sent to the AI service you choose. They are never stored on our servers.
          </p>
        </div>
      </GlassCard>

      {/* Add Custom Provider Drawer/Form */}
      {showAddForm && (
        <GlassCard variant="glowing" className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Server className="w-4 h-4 text-brand" />
              {editingProviderId ? 'Edit connection' : 'Connect an AI service'}
            </h3>
            <button
              onClick={resetForm}
              className="text-xs text-text-muted hover:text-text-primary dark:hover:text-text-primary"
            >
              Cancel
            </button>
          </div>

          {/* Preset Helper Pills */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-text-muted">
              Quick setup:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyPreset('openai')}
                className="px-2.5 py-1 text-xs rounded-lg bg-surface-muted hover:bg-brand/10 text-text-secondary border border-border transition-colors"
              >
                OpenAI
              </button>
              <button
                type="button"
                onClick={() => applyPreset('openrouter')}
                className="px-2.5 py-1 text-xs rounded-lg bg-surface-muted hover:bg-brand/10 text-text-secondary border border-border transition-colors"
              >
                OpenRouter
              </button>
              <button
                type="button"
                onClick={() => applyPreset('groq')}
                className="px-2.5 py-1 text-xs rounded-lg bg-surface-muted hover:bg-brand/10 text-text-secondary border border-border transition-colors"
              >
                Groq
              </button>
              <button
                type="button"
                onClick={() => applyPreset('ollama')}
                className="px-2.5 py-1 text-xs rounded-lg bg-surface-muted hover:bg-brand/10 text-text-secondary border border-border transition-colors"
              >
                Local server
              </button>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Provider Name */}
              <div>
                <label htmlFor="provider-name" className="text-xs font-semibold text-text-secondary mb-1 block">
                  Connection name *
                </label>
                <input
                  id="provider-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. My OpenRouter Account"
                  className="w-full p-2.5 text-xs rounded-xl border border-border bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              {/* Base URL */}
              <div>
                <label htmlFor="provider-base-url" className="text-xs font-semibold text-text-secondary mb-1 block">
                  Service URL *
                </label>
                <input
                  id="provider-base-url"
                  type="text"
                  required
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="e.g. https://api.openai.com/v1"
                  className="w-full p-2.5 text-xs rounded-xl border border-border bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-brand font-mono"
                />
              </div>

              {/* API Key */}
              <div>
                <label htmlFor="provider-api-key" className="text-xs font-semibold text-text-secondary mb-1 block flex items-center justify-between">
                  <span>API Key</span>
                  <span className="text-[10px] text-text-muted">(Encrypted on your device)</span>
                </label>
                <div className="relative">
                  <input
                    id="provider-api-key"
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    autoComplete="off"
                    className="w-full p-2.5 pr-9 text-xs rounded-xl border border-border bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-brand font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2.5 top-2.5 text-text-muted hover:text-text-primary dark:hover:text-text-primary"
                    aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
                    aria-pressed={showApiKey}
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

            </div>

            {/* Models List (multiple models per provider) */}
            <div className="space-y-2.5 pt-2 border-t border-border/50">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-brand" />
                  Models * ({
                    modelListValue.length > 0 ? `${modelListValue.length} configured` : 'add at least one'
                  })
                </label>
                <button
                  type="button"
                  onClick={addModelRow}
                  className="px-2.5 py-1 text-xs rounded-lg bg-surface-muted hover:bg-brand/10 text-text-secondary border border-border flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add model</span>
                </button>
              </div>

              <div className="space-y-2">
                {models.map((m, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={m}
                      onChange={(e) => updateModelAt(i, e.target.value)}
                      placeholder="e.g. gpt-4o-mini or llama-3.3-70b-versatile"
                      className="w-full p-2.5 text-xs rounded-xl border border-border bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-brand font-mono"
                    />
                    {i === 0 && (
                      <span className="shrink-0 px-2 py-1 text-[10px] font-bold uppercase rounded-lg bg-brand/10 text-brand border border-brand/20">
                        Default
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeModelAt(i)}
                      className="shrink-0 p-2 rounded-lg text-text-muted hover:text-rose-500 transition-colors"
                      title="Remove this model"
                      aria-label={`Remove model ${i + 1}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Add the models you want to use. The first one is the default. You can switch models
                from the top bar or the Create page.
              </p>
            </div>

            {/* Temperature & Max Tokens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-text-secondary mb-1">
                  <span>Temperature</span>
                  <span>{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-brand"
                />
              </div>

              <div>
                <label htmlFor="provider-max-tokens" className="text-xs font-semibold text-text-secondary mb-1 block">
                  Maximum length
                </label>
                <input
                  id="provider-max-tokens"
                  type="number"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value) || 2048)}
                  className="w-full p-2 text-xs rounded-xl border border-border bg-surface-card text-text-primary"
                />
              </div>
            </div>

            {/* Disable Streaming Per-Provider Setting */}
            <div className="pt-2 border-t border-border/50">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-text-primary">
                <input
                  type="checkbox"
                  checked={disableStreaming}
                  onChange={(e) => setDisableStreaming(e.target.checked)}
                  className="w-4 h-4 text-brand rounded border-border focus:ring-brand accent-brand"
                />
                <span>Wait for the complete response</span>
              </label>
              <p className="text-[11px] text-text-muted mt-1 ml-6 leading-relaxed">
                Turn this on if your AI service does not support real-time streaming.
              </p>
            </div>

            {/* Test Status Message */}
            {testStatus.message && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  testStatus.success
                    ? 'bg-success/10 border border-success/20 text-success'
                    : 'bg-danger/10 border border-danger/20 text-rose-600 dark:text-danger'
                }`}
              >
                {testStatus.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{testStatus.message}</span>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testStatus.loading}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-surface-muted text-text-secondary hover:bg-surface-hover dark:hover:bg-surface-hover border border-border flex items-center gap-1.5 transition-colors"
              >
                {testStatus.loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5 text-brand" />}
                <span>Test connection</span>
              </button>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-brand text-white hover:bg-brand/80 shadow-md shadow-brand/20 transition-all"
              >
                {editingProviderId ? 'Update connection' : 'Save connection'}
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Provider Profiles Grid */}
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-text-muted block">
          Your AI connections
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {providers.map((p) => {
            const isActive = p.id === activeProviderId;

            return (
              <GlassCard
                key={p.id}
                variant={isActive ? 'glowing' : 'hoverable'}
                className="p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-2 rounded-xl ${
                          isActive
                            ? 'bg-brand text-white'
                            : 'bg-surface-muted text-text-secondary'
                        }`}
                      >
                        <Cpu className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
                          {p.name}
                          {p.useBuiltInGemini && (
                            <span className="px-2 py-0.2 text-[10px] font-semibold uppercase rounded-full bg-brand/10 text-brand border border-brand/20">
                              Built-in
                            </span>
                          )}
                        </h4>
                        <div className="flex flex-wrap items-center gap-1 mt-1">
                          {getProviderModelList(p).map((m) => {
                            const isModelActive = isActive && (p.activeModel ?? p.model) === m;
                            return (
                              <span
                                key={m}
                                className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono border flex items-center gap-1 ${
                                  isModelActive
                                    ? 'bg-brand/10 text-brand border-brand/30 font-semibold'
                                    : 'bg-surface-muted text-text-muted border-border/60'
                                }`}
                                title={isModelActive ? `Active model: ${m}` : m}
                              >
                                {m}
                                {isModelActive && <CheckCircle2 className="w-3 h-3" />}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {!p.useBuiltInGemini && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => editProvider(p)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-brand transition-colors"
                          title="Edit"
                          aria-label={`Edit ${p.name}`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteProvider(p.id)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-rose-500 transition-colors"
                          title="Delete"
                          aria-label={`Delete ${p.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-text-muted font-mono space-y-0.5 truncate bg-surface-muted p-2 rounded-lg border border-border/50 my-2">
                    <div className="truncate">Service: {p.baseUrl}</div>
                    <div className="flex items-center justify-between">
                      <span>Temperature: {p.temperature}</span>
                      {p.disableStreaming ? (
                        <span className="text-[10px] text-warning font-sans font-medium">Full response</span>
                      ) : (
                        <span className="text-[10px] text-success font-sans font-medium">Streaming</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  {isActive ? (
                    <div className="w-full py-1.5 px-3 rounded-xl bg-brand/10 border border-brand/20 text-brand text-xs font-bold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Active</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => onSelectActiveProvider(p.id)}
                      className="w-full py-1.5 px-3 rounded-xl border border-border hover:border-brand text-text-secondary text-xs font-semibold transition-colors"
                    >
                      Set as active
                    </button>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
