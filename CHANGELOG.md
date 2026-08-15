# Changelog

All notable changes to PromptCrafter AI are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-08-13

### Added

- **Prompt Measurement Lab** — close the generate → score → test → compare → ship loop with five integrated capabilities:
  - **Prompt Quality Scorecard (F1)** — every generated, refined, or edited version is scored 0–100 across six rubric dimensions (clarity, structure, output specification, context, error handling, token efficiency), with concrete strengths and one-line actionable fixes. Scored by an LLM judge with an instant local heuristic fallback, cached per version so quality deltas are visible across version history.
  - **Cross-Model A/B Lab (F2)** — run the same prompt against the same test input through multiple providers/models side by side, with a semantic consistency score for the outputs; each selected provider can pick which of its models participates.
  - **Prompt Regression Suite (F3)** — save a set of test inputs per session and run any version against the whole suite for a per-case pass/fail + score table (pass threshold 75), with run history persisted per session. No-code regression testing for prompts.
  - **Placeholder Linter & Variable Fill (F4)** — audits every `[BRACKETED_PLACEHOLDER]` for inconsistent naming, unclosed brackets, and duplicate groups, then fills in sample values for a copy-paste-ready prompt.
  - **Multi-Model Export Adapters (F5)** — export any version formatted for the target conventions: Claude (XML tags), GPT (structured text), Gemini (bold labels), generic Markdown, or JSON payload.
  - **Prompt Health Monitor (F6)** — sessions detect when the underlying model changed since a version was scored and surface a "model changed — re-verify" state in history, so saved prompts can be re-checked against current models.
- **Cost-Per-Quality Ledger** — every version shows estimated cost per 1,000 production completions, one-shot generation cost, score-per-dollar, and "silent cost blowout" flags when cost rises without a score gain; score and cost sparklines chart trends across versions.
- **Adversarial red-team probes** — one-click auto-probes (prompt injection, contradictory instruction, out-of-scope request, role-confusion jailbreak) run through the same execution + judge pipeline as the regression suite.
- **Multiple models per provider** — providers now store a full model list (first entry is the default) with the per-provider active model persisted locally; switch models from the navbar, the generator bar, or the A/B lab. Backward compatible with existing single-model configs.
- **Blog Writer & SEO domain** — a complete content-marketing preset whose generated prompts embed mandatory SEO deliverables, E-E-A-T / helpful-content requirements, anti-AI-writing-pattern guardrails, AI-search (AIO) optimization, and a self-review pass.
- **Optional output character limit** — cap the length of the engineered prompt (default 4,000 characters) so generated prompts stay lean.
- **Collapsible placeholder audit & fill section** in the output pane to keep the view uncluttered.
- **Clear button** to dismiss the generated prompt output with one click.
- **Blog, FAQ, and SEO pages** — blog index with JSON-driven posts, FAQ page, XML sitemap, robots.txt, marketing header/footer, and an OG image.

### Changed

- Refinement requests use the **Gemini v2 API call signature** (`sendMessageStream({ message })`).
- Download/copy actions in the output pane restyled (hover state).

### Fixed

- Restored project typechecking (valid `ignoreDeprecations` value for TypeScript 5.9, excluded stray `isolate/` directory) and the Gemini v2 refinement call.
- `*.tsbuildinfo` artifacts are no longer tracked in version control.

## [1.0.1] - 2026-08-12

### Added

- **Command palette (⌘K)** — quick actions for new prompt, generate, test, copy, history, provider settings, and theme toggle, wired into the prompt form via custom `pc:` events.
- **Sticky always-visible generate bar** with selection summary chips, so generation is one tap away without scrolling.
- **Keyboard actions** — ⌘/Ctrl+Enter generates from anywhere in the form, `/` focuses the topic field, and `kbd` hints surface the shortcuts inline.
- **Collapsible "Prompt Style & Options" section** to declutter the form and reduce cognitive load.
- **Accessibility groundwork** — skip-to-content link, labeled landmark navigation, focus-on-open/restore and full focus traps in dialogs (confirm, test sandbox, palette), `aria-busy` + live regions, real label/input associations, `aria-pressed`/`aria-expanded`/`aria-controls` states, and `aria-labels` on icon buttons.
- **Visible `focus-visible` outline**, reduced-motion overrides, and AA-contrast muted text for readable, keyboard-first use.
- **Design documentation** — `DESIGN.md` now documents the visual system, layout, and navigation as the canonical UI reference.

### Changed

- Standardized on **Bun** as the package manager (`bun install` / `bun run dev|build|lint`).
- History session rows are now real buttons, and the version badge no longer hides at narrow widths.

### Fixed

- Resolved the `Cannot access 'handleSubmit' before initialization` runtime error in the prompt form by deferring the command-palette handler through a ref.

## [1.0.0] - 2026-08-12

### Added

- **AI prompt generation** across 12+ domains (software, marketing, education, writing, data science, and more), with 14 tone presets and 12 prompt frameworks (RTF, CAR, Chain-of-Thought, ReAct, RISEN, Tree-of-Thoughts, Self-Refine, APE, COAST, Socratic Architecture, and others).
- **Built-in Google Gemini provider** (server-side, `GEMINI_API_KEY`) with streaming output and configurable temperature / top-p / max tokens.
- **Custom OpenAI-compatible providers** — OpenAI, Groq, OpenRouter, Ollama, and any self-hosted endpoint — with base-URL normalization and streamed or single-shot responses.
- **Session-based conversational refinement** — iterate on a generated prompt with natural-language instructions, with the full message thread sent as context.
- **Versioned prompt threads** — every generation, refinement, and manual edit is stored as an immutable version with word/character/estimated-token stats, rename support, favorites, and one-click restore.
- **Prompt test sandbox** — run any generated prompt as a system instruction against a sample query to validate behavior before shipping.
- **Local-first storage** — IndexedDB (with localStorage and in-memory fallbacks) so all sessions and prompts stay on-device; custom provider API keys are encrypted with AES-GCM.
- **Session import/export** and automatic migration of legacy history records into the session model.
- **Glassmorphism UI** with light/dark themes, atmospheric glow effects, responsive layout, and streaming markdown rendering with placeholder highlighting.

### Changed

- Rebranded the app from the Google AI Studio template identity to **PromptCrafter AI** (package name, browser metadata, user-agent, and in-app branding).
- Development server now binds to `0.0.0.0` and honors the platform-injected `PORT`; Turbopack is enabled for faster cold starts.

### Fixed

- Correct handling of localhost and full-endpoint URLs in custom OpenAI-compatible provider configuration.
