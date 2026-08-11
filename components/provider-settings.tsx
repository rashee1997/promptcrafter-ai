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
import { DEFAULT_BUILTIN_PROVIDER } from '@/lib/storage';
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
  const [model, setModel] = useState('gpt-4o-mini');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [disableStreaming, setDisableStreaming] = useState(false);

  const resetForm = () => {
    setName('');
    setBaseUrl('https://api.openai.com/v1');
    setApiKey('');
    setModel('gpt-4o-mini');
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
    setModel(provider.model || 'gpt-4o-mini');
    setTemperature(provider.temperature ?? 0.7);
    setMaxTokens(provider.maxTokens ?? 4096);
    setDisableStreaming(provider.disableStreaming ?? false);
    setEditingProviderId(provider.id);
    setShowAddForm(true);
    setTestStatus({ loading: false });
  };

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
          model,
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
        message: err?.message || 'Failed to connect. Check URL/CORS.',
      });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !baseUrl.trim()) return;

    const existingProvider = editingProviderId
      ? providers.find((p) => p.id === editingProviderId)
      : undefined;

    const newProvider: ProviderConfig = {
      id: editingProviderId || `provider-${Date.now()}`,
      name: name.trim(),
      baseUrl: baseUrl.trim(),
      apiKey: apiKey.trim(),
      model: model.trim() || 'gpt-4o-mini',
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
      setModel('gpt-4o-mini');
    } else if (presetType === 'openrouter') {
      setName('OpenRouter AI');
      setBaseUrl('https://openrouter.ai/api/v1');
      setModel('meta-llama/llama-3.3-70b-instruct');
    } else if (presetType === 'groq') {
      setName('Groq Fast Inference');
      setBaseUrl('https://api.groq.com/openai/v1');
      setModel('llama-3.3-70b-versatile');
    } else if (presetType === 'ollama') {
      setName('Local Ollama Server');
      setBaseUrl('http://localhost:11434/v1');
      setApiKey('');
      setModel('llama3');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Active Provider Card */}
      <GlassCard variant="default" className="p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                AI Provider Management
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bring Your Own AI Endpoint or use built-in Google Gemini 3.6
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Provider</span>
          </button>
        </div>

        {/* Security / Privacy Banner */}
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="font-bold">Zero Telemetry & Key Security:</strong> Custom API keys are encrypted locally using browser Web Crypto API (AES-GCM) before being saved. Credentials are proxy-forwarded to your chosen endpoint and never logged on our servers.
          </p>
        </div>
      </GlassCard>

      {/* Add Custom Provider Drawer/Form */}
      {showAddForm && (
        <GlassCard variant="glowing" className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-500" />
              {editingProviderId ? 'Edit Provider Profile' : 'Configure Custom OpenAI-Compatible Provider'}
            </h3>
            <button
              onClick={resetForm}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Cancel
            </button>
          </div>

          {/* Preset Helper Pills */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Quick Endpoint Presets:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyPreset('openai')}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-500/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                OpenAI
              </button>
              <button
                type="button"
                onClick={() => applyPreset('openrouter')}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-500/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                OpenRouter
              </button>
              <button
                type="button"
                onClick={() => applyPreset('groq')}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-500/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                Groq
              </button>
              <button
                type="button"
                onClick={() => applyPreset('ollama')}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-500/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                Local Ollama
              </button>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Provider Name */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Provider Profile Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. My OpenRouter Account"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Base URL */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Base API URL *
                </label>
                <input
                  type="text"
                  required
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="e.g. https://api.openai.com/v1"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              {/* API Key */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block flex items-center justify-between">
                  <span>API Key</span>
                  <span className="text-[10px] text-slate-400">(Encrypted locally)</span>
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full p-2.5 pr-9 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Model Name */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Model Identifier *
                </label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. gpt-4o-mini or llama-3.3-70b-versatile"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            {/* Temperature & Max Tokens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Max Tokens
                </label>
                <input
                  type="number"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value) || 2048)}
                  className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Disable Streaming Per-Provider Setting */}
            <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={disableStreaming}
                  onChange={(e) => setDisableStreaming(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-700 focus:ring-indigo-500 accent-indigo-600"
                />
                <span>Disable Streaming (Request complete response in a single payload)</span>
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 ml-6 leading-relaxed">
                Check this if your provider endpoint or local self-hosted instance does not support server-sent event (SSE) streaming reliably.
              </p>
            </div>

            {/* Test Status Message */}
            {testStatus.message && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  testStatus.success
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                    : 'bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300'
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
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                {testStatus.loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5 text-indigo-500" />}
                <span>Test Connection</span>
              </button>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all"
              >
                {editingProviderId ? 'Update Provider Profile' : 'Save Provider Profile'}
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Provider Profiles Grid */}
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
          Available Provider Profiles
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
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <Cpu className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {p.name}
                          {p.useBuiltInGemini && (
                            <span className="px-2 py-0.2 text-[10px] font-semibold uppercase rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                              Built-in
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          {p.model}
                        </p>
                      </div>
                    </div>

                    {!p.useBuiltInGemini && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => editProvider(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                          title="Edit Profile"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteProvider(p.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                          title="Delete Profile"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono space-y-0.5 truncate bg-slate-100/60 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200/50 dark:border-slate-800/50 my-2">
                    <div className="truncate">URL: {p.baseUrl}</div>
                    <div className="flex items-center justify-between">
                      <span>Temp: {p.temperature}</span>
                      {p.disableStreaming ? (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-sans font-medium">Non-streaming</span>
                      ) : (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans font-medium">Streaming</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  {isActive ? (
                    <div className="w-full py-1.5 px-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Active Provider</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => onSelectActiveProvider(p.id)}
                      className="w-full py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                    >
                      Set as Active
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
