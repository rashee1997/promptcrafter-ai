---
title: The Prompt Measurement Lab is here: score, compare, and regression-test your prompts
description: PromptCrafter AI now ships a measurement lab — a quality scorecard, cross-model A/B testing, a regression suite, placeholder linting, export adapters, and a health monitor — turning prompt writing from guessing into a measured loop, still fully local-first with your own API keys.
date: 2026-08-13
dateModified: 2026-08-13
tags: release, measurement lab, changelog
---

## Summary

The Prompt Measurement Lab is now part of PromptCrafter AI. Every generated or refined prompt can be scored 0–100 across six quality dimensions, A/B tested across two or more providers, and regression-tested against a saved set of test inputs. A placeholder linter, per-model export adapters, and a health monitor that flags drift complete the loop — all local-first, with your own API keys, and no new infrastructure.

## What shipped

The measurement lab adds six capabilities on top of the existing generate-refine-version-test loop:

**Quality scorecard (F1).** Every generated or refined version can be scored 0–100 across six rubric dimensions: clarity and specificity, structure and organization, output specification, contextual guidance, error handling, and token efficiency. Each dimension includes a note and a concrete one-line fix, and scores are stored per version so you can watch quality change as you iterate. A cost-per-quality ledger also shows the estimated cost per 1,000 completions and flags silent cost blowouts — versions where cost went up but the score did not.

**Cross-model A/B lab (F2).** Run the same prompt and test input through two or more configured providers side by side. Outputs get a consistency score based on semantic similarity, and a diff view highlights where answers diverge.

**Regression suite (F3).** Save a set of test inputs per session and run any version against the suite for a per-case pass/fail and score table. The suite also includes vendor-neutral adversarial probes — prompt injection, contradictory instructions, out-of-scope requests, and role confusion — that run through the same judge pipeline as regular cases.

**Placeholder linter and variable fill (F4).** Every bracketed placeholder is audited deterministically — inconsistent names, repeated placeholders, and unclosed brackets are flagged — and sample values you define render a filled, copy-paste-ready prompt.

**Multi-model export adapters (F5).** Export the active version formatted for Claude (XML tags), GPT (plain structured text), Gemini (concise labeled directives), generic Markdown, or a JSON payload, with your last choice remembered per provider.

**Health monitor (F6).** Because every version records the provider and model it was generated with, the app can detect when a score drifts or the underlying model changed and surface a re-verify state. One click re-runs the suite and produces a drift report.

## Also in this update

Alongside the lab, v1.0.1 shipped a ⌘K command palette, a sticky generate bar, keyboard shortcuts (⌘/Ctrl+Enter to generate, `/` to focus the topic), a collapsible prompt-style section, and an accessibility pass — focus traps, skip-to-content, visible focus outlines, reduced-motion support, and AA-contrast text.

## Notes

- Everything runs with the providers you already configure — scoring, similarity, and testing reuse your existing keys; no new services are required.
- Scores are directional, not absolute: they are most useful for comparing deltas between your own versions rather than as a universal ranking.
- Storage is backward compatible: scorecard, suite, and ledger data are additive fields on the existing session and version model.
