<p align="center">
  <img src="assets/logo.svg" alt="PromptCrafter AI" width="268" />
</p>

<p align="center">
  <em>Atmospheric prompt engineering &amp; optimization — generate, refine, version, test, and measure production-ready AI prompts.</em>
</p>

<p align="center">
  <img alt="Version" src="https://img.shields.io/badge/version-1.1.0-6366f1?style=for-the-badge" />
  <img alt="Local-first" src="https://img.shields.io/badge/local--first-IndexedDB-0064a5?style=for-the-badge" />
  <img alt="Encryption" src="https://img.shields.io/badge/encrypted-AES--GCM-16a34a?style=for-the-badge" />
  <img alt="Providers" src="https://img.shields.io/badge/bring--your--own-model-412991?style=for-the-badge" />
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img alt="Bun" src="https://img.shields.io/badge/Bun-1.3-000000?style=for-the-badge&logo=bun&logoColor=f9f9f9" />
  <img alt="Gemini" src="https://img.shields.io/badge/Gemini-API-886FBF?style=for-the-badge&logo=googlegemini&logoColor=white" />
  <img alt="OpenAI" src="https://img.shields.io/badge/OpenAI-compatible-412991?style=for-the-badge&logo=openai&logoColor=white" />
</p>

**PromptCrafter AI** is an AI-powered prompt engineering and optimization workbench. Describe what you want — it engineers a production-ready AI prompt for you, lets you refine it conversationally, versions every change, tests it live against any model, and **proves it works** with quality scoring, cross-model comparisons, and regression suites before you ship it anywhere.

> Streaming output · local-first storage (IndexedDB) · AES-GCM on-device key encryption · bring-your-own-model provider support · LLM-judge quality scoring, cross-model A/B testing, and no-code regression suites.

---

## Table of Contents

- [Why PromptCrafter?](#why-promptcrafter)
- [Key Features](#key-features)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
  - [Environment Variables](#environment-variables)
  - [AI Providers](#ai-providers)
- [Usage Guide](#usage-guide)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Privacy & Security](#privacy--security)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [Tech Stack](#tech-stack)
- [Known Limitations](#known-limitations)
- [Documentation](#documentation)

---

## Why PromptCrafter?

Writing great prompts is iterative. PromptCrafter turns that iteration into a structured, *measured* workflow:

1. **Generate** a structured, role-aware prompt from a short description.
2. **Refine** it conversationally — "make it more concise", "add edge-case handling" — with the full thread as context.
3. **Version** every change so nothing is ever lost and you can diff, rename, favorite, and roll back.
4. **Test** the final prompt as a system instruction against a sample query, with streaming output, before you use it anywhere.
5. **Measure** — score every version 0–100 across six quality dimensions, A/B test the same prompt across models, and regression-test it against a saved suite of inputs so you can *prove* an edit made things better (and catch when it made things worse).

No accounts, no cloud database, no vendor lock-in. Your work lives in your browser; your model, your choice.

---

## Key Features

### 🧠 Prompt Generation
- **9 built-in domain presets** with domain-aware system-prompt fragments: Software & Technology, Product Management, Marketing & Growth, Blog & Content (SEO), Creative Writing, Research & Academia, Operations & Compliance, Legal & Business, and Custom.
- **14 tone presets** — professional, creative, adversarial, socratic, executive, narrative, and more.
- **12 prompt frameworks**: RTF, CAR, Chain-of-Thought, Few-Shot, Meta System Prompt, ReAct, RISEN, Tree-of-Thoughts, Self-Refine, APE, COAST, and Socratic Architecture.
- Configurable output format (Markdown, JSON, bullet points, XML, structured text), constraints, and examples.
- **Optional output character limit** — cap the engineered prompt at a target length (default 4,000 characters) to keep prompts lean.

### 💬 Conversational Refinement
- Iterate on any generated prompt with natural-language instructions.
- The **full message thread** is sent as context, so refinements build on each other.
- Every refinement produces a new immutable version — never overwrites your work.

### 📚 Versioned Prompt Threads
- Every generation, refinement, and manual edit is stored as an immutable version.
- Per-version stats: word count, character count, estimated tokens — plus an optional cached **quality score**.
- Rename versions, favorite sessions, diff between versions, and restore with one click.
- **Clear button** — dismiss the current prompt output with one click (saved sessions stay in History).

### 🧪 Prompt Test Sandbox
- Run any generated prompt as a **system instruction** against a sample query.
- Watch the model's live streaming response before committing to the prompt.

### 📊 Prompt Measurement Lab
Close the generate → score → test → compare → ship loop — all computed against your own providers:

- **Prompt Quality Scorecard (F1)** — every version can be scored 0–100 across six rubric dimensions (clarity, structure, output specification, context, error handling, token efficiency), with concrete strengths and one-line actionable fixes. Scored by an **LLM judge** (strict-JSON rubric via `/api/evaluate`) with an instant local heuristic fallback; scores are cached per version so quality deltas are visible across the version strip.
- **Cross-Model A/B Lab (F2)** — run the same prompt against the same test input through multiple providers/models side by side, with a **consistency score** (deterministic n-gram cosine + word-Jaccard similarity — no external embedding service). Each provider picks which of its models participates.
- **Prompt Regression Suite (F3)** — save a set of test inputs per session, then run any version against the whole suite for a per-case **pass/fail + score table** (pass threshold 75), with run history persisted per session. No-code regression testing for prompts — "v3 fixed the edge case but broke case 2."
- **Placeholder Linter & Variable Fill (F4)** — audits every `[BRACKETED_PLACEHOLDER]` for inconsistent naming, unclosed brackets, and duplicate groups, then fills in sample values for a copy-paste-ready prompt.
- **Multi-Model Export Adapters (F5)** — export any version formatted for the target conventions: Claude (XML tags), GPT (structured text), Gemini (bold labels), generic Markdown, or a JSON payload.
- **Prompt Health Monitor (F6)** — re-verify saved prompts from History with the AI judge; flags score drift (Δ ≥ 8 points) and surfaces a "re-verify" state so saved prompts don't rot silently when models change.
- **Adversarial red-team probes** — a built-in library of auto-generated attacks (`lib/probes.ts`): prompt injection, contradictory instruction, out-of-scope request, and role-confusion jailbreak. Their inputs are designed to be merged into a session's regression suite so they run through the same execute + judge pipeline as every other case.
- **Cost-Per-Quality Ledger** — built-in on-device cost math for every version: estimated cost per 1,000 production completions, one-shot generation cost, score-per-dollar, and "silent cost blowout" flags (cost went up, score didn't), computed from a local published-price table (`lib/model-pricing.ts`); score/cost series and a dependency-free SVG sparkline (`components/sparkline.tsx`) are ready for charting version trends.

### 🔌 Bring Your Own Model
- **Built-in Google Gemini** (server-side, `GEMINI_API_KEY`) with configurable temperature / top-p / max tokens.
- **Any OpenAI-compatible provider**: OpenAI, Groq, OpenRouter, Ollama, or a self-hosted endpoint.
- Base-URL normalization handles accidental full-endpoint pastes; streaming or single-shot responses.
- **Multiple models per provider** — store a full model list per provider (first entry is the default) and switch the active model from the navbar, the generator bar, or the A/B lab; selections persist locally and older single-model configs stay fully readable.

### ⌨️ Keyboard-First UX
- **⌘K command palette** — new prompt, generate, test, copy, history, provider settings, theme — from anywhere.
- **Sticky Generate bar** with selection summary chips — generation is always one tap away.
- `⌘/Ctrl+Enter` to generate, `/` to jump to the topic field.

### 🔒 Private by Default
- Everything stored **locally in your browser** via IndexedDB (with localStorage and in-memory fallbacks).
- Custom provider API keys are encrypted **on-device with AES-GCM** (PBKDF2-derived key, per-device salt).
- Session import/export and automatic migration of legacy history records.

### ♿ Accessibility
- Full focus traps and focus management in dialogs, skip-to-content link, labeled landmarks, `aria-busy` + live regions, visible `focus-visible` outlines, reduced-motion support, and AA-contrast text.

---

## Quick Start

**Prerequisite:** [Bun](https://bun.sh) ≥ 1.3 (the repo pins `bun@1.3.14` via `packageManager`).

```bash
# 1. Install dependencies
bun install

# 2. Configure environment (see below)
cp .env.example .env.local   # then add your GEMINI_API_KEY

# 3. Start the dev server (binds 0.0.0.0, honors the platform-injected PORT)
bun run dev
```

Open the printed URL (default `http://localhost:3000`), pick a domain, describe your goal, and hit **Generate**.

---

## Configuration

### Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | For the built-in Gemini provider | Google AI Studio / Gemini API key, read **server-side** only — never shipped to the client. |
| `APP_URL` | For deployments | The public URL where the app is hosted (metadata base, sitemap, robots, canonical/OG URLs). |

Copy `.env.example` to `.env.local` and fill in your key:

```bash
cp .env.example .env.local
```

> **Never commit real keys.** `.env.local` is git-ignored.

### AI Providers

- **Google Gemini (default)** — works out of the box once `GEMINI_API_KEY` is set. The key is used by the API routes on the server; the browser never sees it.
- **Custom OpenAI-compatible providers** — configure in **Providers** in the app: name, base URL, model list, API key, and sampling parameters. Presets/quick fills for OpenAI, Groq, OpenRouter, and Ollama are provided, and any self-hosted `/v1` endpoint works. Keys are encrypted (AES-GCM) before being written to local storage.
- **Multiple models** — each provider stores a full model list (first entry = default); the active model is persisted locally and switchable from the navbar, generator bar, or A/B lab.

---

## Usage Guide

1. **Generator** — pick a domain (including **Blog & Content** for SEO-optimized article prompts), enter a topic/audience/notes, choose tone + framework and an optional output character limit, and click **Generate**. The engineered prompt streams into the output pane with live stats.
2. **Score** — open the **Quality** badge to see the scorecard (overall + six dimensions with notes and one-line fixes), or hit **Run AI Review** for an LLM-judge score. Scores are cached per version, so the version strip and History show quality deltas as you iterate.
3. **Refine** — type an instruction like *"make it more concise and target non-technical users"*. A new version is created; the full conversation is sent as context.
4. **Versions** — use the version selector to switch, rename, diff, favorite, or restore any saved version. Manual edits are saved as their own versions too.
5. **Test** — click **Test** to run the active prompt as a system instruction against a sample query in the sandbox modal; with 2+ providers configured, **Compare models** runs the same prompt + input across them side by side with a consistency score.
6. **Consistency checks** — add sample test inputs once per session, then run **every version × every case** for a pass/fail matrix (75+ passes). The built-in adversarial probes (`lib/probes.ts`) supply injection, contradiction, out-of-scope, and jailbreak inputs you can add to the suite.
7. **Custom fields & export** — fill `[BRACKETED_PLACEHOLDERS]` for a copy-paste-ready prompt (inconsistent or unclosed fields are flagged), and export any version as Claude, GPT, Gemini, Markdown, or JSON.
8. **History** — search and filter past sessions, open any session's thread, import/export sessions, **re-verify** a saved prompt's health with the AI judge, or clear all.

---

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `⌘K` / `Ctrl+K` | Open command palette |
| `⌘/Ctrl+Enter` | Generate prompt / submit refinement (from anywhere in the form) |
| `/` | Focus the topic field |
| `Esc` | Close dialogs / palette |

---

## Privacy & Security

- **No accounts, no backend database.** Sessions, versions, test suites, and provider configs live in the browser (IndexedDB, with localStorage and in-memory fallbacks for restricted environments).
- **Server-side Gemini key.** The built-in provider's key is read from `process.env.GEMINI_API_KEY` in API routes only — it is never sent to the client.
- **On-device key encryption.** Custom provider API keys are encrypted with AES-GCM using a key derived via PBKDF2 (100k iterations) and a per-device salt, so keys aren't stored in plaintext.
- **API keys are sent to the provider you configure at request time** — they are never transmitted anywhere else.
- **Measurement is local and on-demand.** Quality scoring, A/B tests, and regression runs execute real completions against *your* configured providers — they never leave your machine except to the provider you chose, and they consume that provider's quota like any other call.

---

## Project Structure

```
app/
  page.tsx                 # Main app: state, generation flow, views, modals
  layout.tsx               # Root layout, theme init, metadata + JSON-LD structured data
  globals.css              # Semantic design tokens (light/dark), Tailwind
  blog/                    # Blog index + static post pages (content/blog/*.md)
  faq/page.tsx             # FAQ page with FAQPage JSON-LD
  robots.ts / sitemap.ts   # robots.txt + sitemap.xml (incl. AI-crawler allow rules)
  api/
    generate/route.ts      # POST — stream a new engineered prompt
    refine/route.ts        # POST — stream a refined prompt with thread context
    test-prompt/route.ts   # POST — run a prompt as a system instruction (streamed)
    evaluate/route.ts      # POST — F1 LLM-judge prompt quality (heuristic fallback)
    evaluate-output/route.ts # POST — F3/probes: execute a prompt on a case + judge output
    ab-test/route.ts       # POST — F2 parallel completions across providers + consistency score
components/                # Form, output, history, provider settings, palette, modals,
                           # sparkline (score/cost trends), marketing site header/footer
lib/
  domains.ts               # Domain presets, tones, frameworks, prompt builders
  ai-client.ts             # Streaming + non-streaming fetch wrappers for the API routes
  openai-provider.ts       # OpenAI-compatible client, URL normalization, error mapping
  server-completion.ts     # Shared non-streaming completions (Gemini / OpenAI-compatible)
  storage.ts               # IndexedDB + localStorage + in-memory persistence & migrations
  crypto.ts                # AES-GCM / PBKDF2 encryption for stored API keys
  prompt-stats.ts          # Word/char/token stats, version naming
  diff.ts                  # Word-level diff for version comparison
  use-focus-trap.ts        # WCAG dialog focus management
  prompt-quality.ts        # F1 — quality rubric, judge prompt, heuristic scorer
  ledger.ts                # Cost-per-quality ledger rows, score attribution, series
  model-pricing.ts         # Local published-price table for on-device cost estimates
  similarity.ts            # F2 — n-gram cosine + Jaccard consistency scoring
  placeholder.ts           # F4 — placeholder lint + variable fill
  export.ts                # F5 — per-model export adapters (Claude/GPT/Gemini/Markdown/JSON)
  probes.ts                # Adversarial red-team probe definitions
  content.ts / seo.ts / site.ts  # Static blog content layer, SEO copy + structured data, site URL
types/index.ts             # Shared contracts: Session, PromptVersion, ProviderConfig, …
hooks/use-mobile.ts        # Responsive breakpoint hook
content/blog/*.md          # Blog posts (frontmatter + markdown, parsed at build time)
public/                    # llms.txt, og-image.png
scripts/generate-og.mjs    # Regenerates the Open Graph image (bun run generate:og)
DESIGN.md                  # Canonical visual system & UI direction
CHANGELOG.md               # Keep-a-Changelog history
RELEASE_NOTES.md           # Human-facing release notes
RESEARCH.md                # Competitive research & feature rationale
```

**Data flow:** UI → `lib/ai-client.ts` (streaming/non-streaming fetches) → `app/api/*` routes → provider SDK (Gemini or OpenAI-compatible) → streamed text back to the UI → `lib/storage.ts` (IndexedDB). Scoring (F1), case evaluation (F3/probes), and A/B runs (F2) use shared non-streaming completions via `lib/server-completion.ts`; the cost ledger and placeholder/export transforms are computed entirely on-device.

---

## Scripts

| Command | Description |
| --- | --- |
| `bun install` | Install dependencies |
| `bun run dev` | Start dev server (Turbopack, binds `0.0.0.0`, honors `PORT`) |
| `bun run build` | Production build |
| `bun run start` | Serve the production build |
| `bun run lint` | ESLint over the codebase |
| `bun run clean` | Clear the Next.js build cache |
| `bun run generate:og` | Regenerate `public/og-image.png` (1200×630) via Next's ImageResponse |

The repository does not currently define a formal test suite; validate changes with `bun run lint` and a manual app check.

---

## Tech Stack

| Layer | Tech |
| --- | --- |
| Framework | Next.js 15 (App Router) with Turbopack |
| UI | React 19, Tailwind CSS 4, Motion, Lucide icons |
| Markdown | react-markdown + remark-gfm, Mermaid diagrams, custom placeholder highlighting |
| AI | `@google/genai` (Gemini) + `openai` SDK (any OpenAI-compatible endpoint) |
| Measurement | LLM-judge scoring with heuristic fallback, deterministic similarity (n-gram + Jaccard), local pricing/ledger math, dependency-free SVG sparklines |
| Storage | IndexedDB with localStorage / in-memory fallbacks, Web Crypto (AES-GCM) |
| Language | TypeScript (strict) |
| Package manager | Bun |

---

## Known Limitations

- Sessions are tied to the **browser they were created in** — no cross-device sync yet.
- Custom provider keys are stored client-side (encrypted) and are sent to your chosen provider at request time.
- Quality scores and cost estimates are **local approximations** — LLM-judge or heuristic scores, and published list prices — not guarantees of production behavior.
- AI review, A/B tests, and regression runs execute real completions against your configured providers and consume their API quota like any other call.

---

## Documentation

- **[DESIGN.md](DESIGN.md)** — the canonical visual system: colors, typography, layout, components, and UI rules.
- **[CHANGELOG.md](CHANGELOG.md)** — full version history.
- **[RELEASE_NOTES.md](RELEASE_NOTES.md)** — human-facing release notes.
- **[RESEARCH.md](RESEARCH.md)** — competitive research and the rationale behind the measurement-lab features (F1–F6).
- **[`/blog`](app/blog)** — Markdown blog posts with frontmatter (`content/blog/*.md`, parsed at build time via `lib/content.ts`) covering the measurement loop, comparisons, and releases; `/faq` covers common questions. Both are wired for SEO with `robots.ts`, `sitemap.ts`, OG images, and JSON-LD (SoftwareApplication, FAQPage, Article), plus an LLM-friendly index at [`public/llms.txt`](public/llms.txt).

---

## License

Private project. See [AGENTS.md](AGENTS.md) for contributor and AI-agent working rules.
