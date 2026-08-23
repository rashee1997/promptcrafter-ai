---
title: "Measurement & Quality"
description: "Prompt scoring, A/B testing, regression suites, and cost ledger."
---
# Measurement & Quality

**Prompt Quality Scorecard (F1)**
- Every version can be scored 0‑100 across six rubric dimensions (clarity, structure, output specification, context, error handling, token efficiency). The score is produced by an LLM judge (strict‑JSON rubric via `/api/evaluate`) with a deterministic heuristic fallback. Scores are cached per version, so the version strip and History show quality deltas as you iterate.

**Cross‑Model A/B Lab (F2)**
- Run the same prompt against multiple providers/models side‑by‑side. A consistency score (n‑gram cosine + word‑Jaccard similarity) quantifies output similarity without external embedding services.

**Prompt Regression Suite (F3)**
- Save a set of test inputs per session, then run any version against the whole suite for a pass/fail + score table (75 %+ pass threshold). The built‑in adversarial probes (`lib/probes.ts`) add injection, contradiction, out‑of‑scope, and jailbreak cases.

**Placeholder Linter & Variable Fill (F4)**
- Audits every `[BRACKETED_PLACEHOLDER]` for inconsistent naming, unclosed brackets, and duplicate groups, then fills in sample values for a copy‑paste‑ready prompt.

**Multi‑Model Export Adapters (F5)**
- Export any version formatted for target conventions: Claude (XML tags), GPT (structured text), Gemini (bold labels), generic Markdown, or JSON payload.

**Prompt Health Monitor (F6)**
- Re‑verify saved prompts with the AI judge; flags score drift (Δ ≥ 8 points) and surfaces a "re‑verify" state so prompts don’t silently rot when models change.

**Adversarial Red‑Team Probes**
- `lib/probes.ts` – auto‑generated attacks: prompt injection, contradictory instruction, out‑of‑scope request, role‑confusion jailbreak.

**Cost‑Per‑Quality Ledger**
- `lib/ledger.ts` – computes estimated cost per 1,000 completions and per‑prompt cost, then derives a score‑per‑dollar metric. Sparkline component (`components/sparkline.tse`) visualises cost and quality trends.
