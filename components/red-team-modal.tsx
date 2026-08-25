'use client';

import React, { useState } from 'react';
import { RedTeamAuditResponse } from '@/app/api/red-team-audit/route';
import { ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Sparkles, X } from 'lucide-react';
import { runRedTeamAudit } from '@/lib/ai-client';
import { ProviderConfig } from '@/types';
import { toast } from '@/components/toast';

interface RedTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
  provider: ProviderConfig;
  onApplyDefenses: (defenseInstructions: string) => void;
}

export function RedTeamModal({ isOpen, onClose, prompt, provider, onApplyDefenses }: RedTeamModalProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [auditResult, setAuditResult] = useState<RedTeamAuditResponse | null>(null);

  if (!isOpen) return null;

  const handleRunAudit = async () => {
    setIsRunning(true);
    try {
      const res = await runRedTeamAudit(prompt, provider);
      setAuditResult(res);
      if (res.score >= 80) {
        toast.success(`High Resistance Score: ${res.score}%`, 'Prompt held strong against attacks.');
      } else {
        toast.error(`Vulnerabilities Detected (${res.score}%)`, 'Suggested guardrails available.');
      }
    } catch (err: any) {
      toast.error('Audit failed', err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleApply = () => {
    if (!auditResult || auditResult.suggestedDefenses.length === 0) return;
    const defenseBlock = auditResult.suggestedDefenses.join('\n');
    onApplyDefenses(`Reinforce prompt against adversarial vulnerabilities:\n${defenseBlock}`);
    toast.success('Applying guardrails...');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-surface-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-surface-muted/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-danger/10 text-danger border border-danger/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">Adversarial Red-Team & Security Audit</h3>
              <p className="text-[11px] text-text-muted">Probe system prompts for injection, leakage, and breakout vulnerabilities</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-text-muted hover:text-text-primary">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {!auditResult && !isRunning && (
            <div className="text-center py-8 space-y-4">
              <ShieldAlert className="w-12 h-12 text-warning mx-auto opacity-70" />
              <div className="max-w-md mx-auto space-y-1">
                <p className="font-bold text-sm text-text-primary">Ready to run security probes</p>
                <p className="text-text-muted text-[11px] leading-relaxed">
                  We will test your prompt against 5 adversarial vectors: direct instruction override, XML delimiter confusion, roleplay breakout, prompt leakage, and exfiltration links.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRunAudit}
                className="px-4 py-2 rounded-xl bg-danger text-white font-bold hover:bg-danger/90 transition-colors shadow-glow"
              >
                Start Red-Team Audit
              </button>
            </div>
          )}

          {isRunning && (
            <div className="text-center py-12 space-y-3">
              <div className="w-8 h-8 border-2 border-danger border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="font-bold text-text-primary">Executing adversarial probes...</p>
              <p className="text-text-muted text-[11px]">Evaluating model resilience and instruction containment</p>
            </div>
          )}

          {auditResult && (
            <div className="space-y-4">
              {/* Scorecard banner */}
              <div className="flex items-center justify-between p-4 rounded-xl border bg-surface-muted/60 border-border">
                <div className="flex items-center gap-3">
                  {auditResult.score >= 80 ? (
                    <ShieldCheck className="w-8 h-8 text-success" />
                  ) : (
                    <ShieldAlert className="w-8 h-8 text-warning" />
                  )}
                  <div>
                    <span className="text-base font-bold text-text-primary">
                      {auditResult.score}% Resistance Score
                    </span>
                    <p className="text-[11px] text-text-muted">
                      Passed {auditResult.passedCount} of {auditResult.totalProbes} adversarial attack probes
                    </p>
                  </div>
                </div>
                {auditResult.suggestedDefenses.length > 0 && (
                  <button
                    type="button"
                    onClick={handleApply}
                    className="px-3 py-1.5 rounded-lg bg-brand text-[var(--brand-foreground)] font-bold flex items-center gap-1.5 shadow-sm hover:bg-brand-hover"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Apply Suggested Defenses</span>
                  </button>
                )}
              </div>

              {/* Individual Probe Results */}
              <div className="space-y-2.5">
                <span className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">
                  Probe Audit Breakdown
                </span>
                {auditResult.results.map((r) => (
                  <div
                    key={r.probeId}
                    className={`p-3 rounded-xl border space-y-2 ${
                      r.passed ? 'border-success/30 bg-success/5' : 'border-danger/30 bg-danger/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {r.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-success" />
                        ) : (
                          <XCircle className="w-4 h-4 text-danger" />
                        )}
                        <span className="font-bold text-text-primary">{r.name}</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        r.passed ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                      }`}>
                        {r.passed ? 'RESISTED' : 'VULNERABLE'}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted">{r.description}</p>
                    {!r.passed && r.vulnerabilityExplanation && (
                      <div className="p-2 rounded bg-surface-card/70 border border-danger/20 text-[11px] space-y-1">
                        <span className="font-semibold text-danger block">Vulnerability Diagnosis:</span>
                        <p className="text-text-muted">{r.vulnerabilityExplanation}</p>
                        <span className="font-semibold text-brand block mt-1">Recommended Guardrail:</span>
                        <p className="text-text-primary font-mono text-[10px]">{r.recommendedDefense}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {auditResult && (
          <div className="p-4 border-t border-border bg-surface-muted/30 flex items-center justify-between">
            <button
              type="button"
              onClick={handleRunAudit}
              disabled={isRunning}
              className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-surface-hover"
            >
              Re-run Audit
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-surface-code border border-border text-xs font-semibold"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
