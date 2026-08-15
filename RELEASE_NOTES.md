# PromptCrafter AI — Release Notes

## v1.1.0 — 2026-08-13

This is the biggest release since launch: PromptCrafter stops at "good-looking prompt" and now **proves** it. Every version gets a quality score, a cost estimate, regression tests, cross-model comparisons, and adversarial red-team checks — all running locally against your own providers.

### What's new in v1.1.0

- **Prompt Quality Scorecard** — every generated/refined/edited version is scored 0–100 across six dimensions (clarity, structure, output spec, context, error handling, token efficiency) with strengths and one-line fixes. LLM-judge scoring with an instant local fallback; scores are stored per version so you can watch quality improve (or regress) as you iterate.
- **Cross-Model A/B Lab** — run the same prompt + test input through several providers/models side by side and get a consistency score. Each provider can pick which of its models joins the comparison.
- **Prompt Regression Suite** — save test inputs per session, then run any version against the whole suite for a per-case pass/fail table with scores. Catch silent regressions before you ship: "v3 fixed the edge case but broke case 2."
- **Prompt Health Monitor** — when a model changes after a version was scored, the session flags it and offers one-click re-verification, so saved prompts don't rot silently.
- **Cost-Per-Quality Ledger** — per-version estimated cost per 1,000 completions, score-per-dollar, and "silent cost blowout" flags (cost went up, score didn't), with score/cost sparklines across versions.
- **Adversarial red-team probes** — one-click prompt injection, contradiction, out-of-scope, and jailbreak attacks run through the same judge pipeline as the regression suite.
- **Placeholder linter & variable fill** — audits `[BRACKETED_PLACEHOLDERS]` for inconsistent names and unclosed brackets, then fills them for a copy-paste-ready prompt.
- **Multi-model export adapters** — export any version as Claude (XML tags), GPT, Gemini, generic Markdown, or a JSON payload.
- **Multiple models per provider** — store as many models as you want per provider, mark the default, and switch the active model from the navbar, the generator bar, or the A/B lab. Selections persist locally; existing configs keep working unchanged.
- **Blog Writer & SEO domain** — a full content-marketing preset that bakes in SEO deliverables, E-E-A-T, anti-AI-writing-pattern guardrails, and AI-search optimization.
- **Output character limit** — cap engineered prompts at a target length (4,000 chars default) to keep them lean and cost-efficient.
- **Clear button** — dismiss the generated output with one click.
- **Blog, FAQ, and SEO pages** — blog with posts, FAQ, XML sitemap, robots.txt, and an OG image for better discoverability.

### Fixed

- Restored the build/typecheck (TypeScript 5.9 config) and the Gemini v2 refinement call.
- Download button hover styling; `*.tsbuildinfo` artifacts removed from the repo.

### Setup

Unchanged from v1.0.1: add your **Gemini API key** (`GEMINI_API_KEY`) via the API keys / secrets panel, or configure custom OpenAI-compatible providers in **Providers**. Everything — including your model lists and per-provider model selection — is stored locally in your browser.

## v1.0.1 — 2026-08-12

This release focuses on usability, accessibility, and keyboard-first workflows. The prompt form is far less cluttered, the Generate action is always in reach, and the whole app is navigable without a mouse.

### What's new in v1.0.1

- **⌘K Command palette** — jump to new prompt, generate, test, copy, history, provider settings, or theme from anywhere with a single keystroke.
- **Sticky Generate bar** — generation controls stay pinned with a summary of your current selections; no more scrolling to the bottom of a long form.
- **Keyboard shortcuts** — press ⌘/Ctrl+Enter to generate from anywhere in the form, or `/` to jump straight to the topic field. Shortcut hints are shown inline.
- **Decluttered form** — "Prompt Style & Options" now lives in a collapsible section, so the main view shows only what you need to start.
- **Accessibility pass** — focus traps in dialogs, skip-to-content link, visible focus outlines, reduced-motion support, AA-contrast text, labeled landmarks, and proper ARIA states throughout.
- **Built and run on Bun** — the project now standardizes on Bun for installs, dev, build, and lint.

### Fixed

- Fixed a startup crash (`Cannot access 'handleSubmit' before initialization`) in the prompt form.

### Setup

Unchanged from v1.0.0: add your **Gemini API key** (`GEMINI_API_KEY`) via the API keys / secrets panel, or configure a custom OpenAI-compatible provider in **Providers**. Everything else runs locally in your browser.

## v1.0.0 — 2026-08-12

**PromptCrafter AI** is a prompt engineering and optimization workbench: describe what you want, and it engineers a production-ready AI prompt for you — then lets you refine it conversationally, version every change, and test it live before you use it anywhere.

### What's in this release

- **Generate** — pick a domain, tone, and framework (RTF, Chain-of-Thought, ReAct, Tree-of-Thoughts, Self-Refine, and more); PromptCrafter assembles a structured, role-aware prompt with constraints, examples, and output formatting.
- **Refine** — keep chatting: "make it more concise", "add edge-case handling", "target non-technical users". Each instruction produces a new version, and the full conversation is used as context.
- **Version** — every change is stored as an immutable version with stats (words, chars, estimated tokens). Rename versions, favorite sessions, diff and roll back at any time.
- **Test** — run any generated prompt as a system instruction against a sample query in the built-in sandbox, with streaming output.
- **Bring your own model** — built-in Google Gemini (server-side) or any OpenAI-compatible provider: OpenAI, Groq, OpenRouter, Ollama, or a local endpoint.
- **Private by default** — everything is stored locally in your browser (IndexedDB); custom provider keys are AES-GCM encrypted on-device.

### Setup

1. Add your **Gemini API key** (`GEMINI_API_KEY`) via the API keys / secrets panel for the built-in provider — or configure a custom provider (base URL + key) in **Providers**.
2. No database, no accounts: your sessions live in your browser.

### Known limitations

- Sessions are tied to the browser they were created in (no cross-device sync yet).
- Custom provider keys are stored client-side (encrypted) and are sent to your chosen provider at request time.
