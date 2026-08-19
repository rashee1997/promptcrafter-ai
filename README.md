<p align="center">
  <img src="assets/logo.svg" alt="PromptCrafter AI" width="268" />
</p>

<p align="center">
  <em>Atmospheric prompt engineering &amp; optimization — generate, refine, version, test, and measure production-ready AI prompts.</em><br>
  <em>Studio-grade Image, Logo, and Video prompt pipelines built in.</em>
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
  <img alt="Vercel AI" src="https://img.shields.io/badge/Vercel_AI_SDK-ai+%40ai--sdk%2Freact-blueviolet?style=for-the-badge" />
  <img alt="AI Elements" src="https://img.shields.io/badge/AI_Elements-conversation+streamdown-000000?style=for-the-badge" />
  <img alt="Bun" src="https://img.shields.io/badge/Bun-1.3-000000?style=for-the-badge&logo=bun&logoColor=f9f9f9" />
  <img alt="Gemini" src="https://img.shields.io/badge/Gemini-API-886FBF?style=for-the-badge&logo=googlegemini&logoColor=white" />
  <img alt="OpenAI" src="https://img.shields.io/badge/OpenAI-compatible-412991?style=for-the-badge&logo=openai&logoColor=white" />
</p>

**PromptCrafter AI** is an AI-powered prompt engineering and optimization workbench with three studios:

- **Text Prompt Studio** — describe a goal, get a role-aware production prompt, refine it conversationally, version every edit, test it live, and prove it works with quality scoring, cross-model A/B testing, and regression suites.
- **Image & Logo Prompt Studio** — a guided form-to-prompt pipeline for image and brand-identity prompts: choose a style, camera, lighting, and composition; generate a platform-dialect-ready prompt (DALL-E, Midjourney, Stable Diffusion, Flux, Nano Banana); or switch to Logo mode for brand-identity briefs.
- **Video Prompt Studio** — a 5-phase cinematic pipeline: a Directorial Brief bootstraps a locked Story Bible (script, characters, locations, visual style, VFX direction), then a conversational thread drafts and approves sequential 8–30s shots that get exported in four AI-video-model dialects (Veo 3.1, Higgsfield / Soul ID, Kling 3.0, Seedance 2.0).

> Streaming output · local-first storage (IndexedDB) · AES-GCM on-device key encryption · bring-your-own-model provider support · LLM-judge quality scoring, cross-model A/B testing, and no-code regression suites.

---

## Table of Contents

- [Why PromptCrafter?](#why-promptcrafter)
- [Key Features](#key-features)
  - [Text Prompt Studio](#-text-prompt-studio)
  - [Image & Logo Prompt Studio](#-image--logo-prompt-studio)
  - [Video Prompt Studio](#-video-prompt-studio)
  - [Measurement & Quality](#-measurement--quality)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
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
6. **Export** — the Image/Logo studio formats prompts for specific image-generation platforms; the Video studio formats shots into copy-ready prompts for Veo 3.1, Higgsfield, Kling, and Seedance.

No accounts, no cloud database, no vendor lock-in. Your work lives in your browser; your model, your choice.

---

## Key Features

### 🧠 Text Prompt Studio

- **9 built-in domain presets** with domain-aware system-prompt fragments: Software & Technology, Product Management, Marketing & Growth, Blog & Content (SEO), Creative Writing, Research & Academia, Operations & Compliance, Legal & Business, and Custom.
- **14 tone presets** — professional, creative, adversarial, socratic, executive, narrative, and more.
- **12 prompt frameworks**: RTF, CAR, Chain-of-Thought, Few-Shot, Meta System Prompt, ReAct, RISEN, Tree-of-Thoughts, Self-Refine, APE, COAST, and Socratic Architecture.
- Configurable output format (Markdown, JSON, bullet points, XML, structured text), constraints, and examples.
- **Optional output character limit** — cap the engineered prompt at a target length (default 4,000 characters) to keep prompts lean.
- **Dynamic hybrid example prompts** — static chips that quietly upgrade to AI-refreshed topic suggestions matched to the current domain and settings.
- **Custom chip values and save-for-later** — any setting (tone, framework, format) can take a user-defined value, which persists in IndexedDB for future visits.

### 🎨 Image & Logo Prompt Studio

- **Dual-mode form**: Image mode for AI-generated imagery (DALL-E, Midjourney, Stable Diffusion, Flux, Nano Banana dialects); Logo mode for brand-identity briefs (mark type, palette, industry, wordmark lockup, hidden meaning).
- **Tiered settings layout**: Essentials always visible → collapsed Refine accordion (platform dialects + brand sub-card) → Art Direction (custom lighting, camera, composition, color grade, reference images).
- **AI-suggested negative prompts** — one-click generates a brief-specific exclusion list keyed to the chosen style, lighting, palette, and usage context; appended with `,` instead of overwriting manual input.
- **Copy all prompts** — all platform dialects copied as one clipboard payload, with inline "Copied ✓" feedback.
- **Save to gallery** — persist generated briefs locally for comparison across sessions.
- **Custom chip values and save-for-later** — every chip-based setting (style, lighting, mood, composition, camera, color grade, resolution, aspect ratio, platform dialects, logo-specific rows) gains a "Custom…" trigger that accepts any value outside the preset list.

### 🎬 Video Prompt Studio

A 5-phase cinematic prompt pipeline that turns a short directorial brief into a storyboard of copy-ready video-shot prompts — all stored locally, no accounts required.

**Phase 1 — Foundation**
- Data contracts for `VideoProject`, `VideoShot`, `VideoCharacter`, `VideoLocation`, `VideoStyle`, `VideoEffects`, `StoryBible`, `DraftedShot`, and `ChatMessage`.
- IndexedDB + localStorage persistence (`lib/video-storage.ts`) and the Vercel AI client integration (`lib/video-ai.ts`, `@ai-sdk/google`).

**Phase 2 — Production Hub**
- Project dashboard with grid/list view, search, status filters (Draft / Active), and quick-delete with confirmation.
- New-project modal with directorial brief textarea and instant creation.
- Project cards show shot count, character count, and relative update time.

**Phase 3 — AI Bootstrap Pipeline**
A 5-stage wizard that bootstraps the Story Bible from the directorial brief:

| Stage | Output |
|---|---|
| 1. Script | Scene structure, story beats, dialogue hints |
| 2. Characters | Cast list with appearance, wardrobe, voice tone |
| 3. Locations | Set descriptions, set-dressing details |
| 4. Visual Style | Look & mood, color grade, film stock, aspect ratio (locked on activation) |
| 5. VFX Direction | VFX cues, particle density, pacing (locked on activation) |

- Each stage has its own UI with inline AI generation, undo, and a progress stepper.
- The AI-powered model selector lets the user pick which provider/model drives the bootstrap (defaults to Gemini, overridden per-session, stored locally).

**Phase 4 — Shot Drafting Chat**
- Multi-turn conversational thread where the director guides shot proposals turn-by-turn.
- Each assistant turn emits a structured JSON draft (`DraftedShot`): shot number, description, 6-part universal prompt (`SUBJECT · ACTION · CAMERA · LIGHTING · ENVIRONMENT · LENS`), continuity handoff, and duration (8–30 s).
- **Approve** promotes the draft into a confirmed `VideoShot` on the storyboard; the drafter immediately proposes the next shot.
- **Request Revision** re-drafts the same shot number with the director's feedback; the full conversation is sent as context.
- A 20px Thinking Orb mirrors the Vercel AI status (searching / working / breathing).
- Continuity handoffs keep subject + camera state coherent across the storyboard.
- **Active Project Sidebar** (2-tier lock rules): Style + VFX cards render read-only once activated; cast and locations remain editable.

**Phase 5 — Dialect Export & Storyboard Timeline**
Closes the creative loop: Brief → Story Bible → Chat-Drafted Shots → Dialect-Ready Export. No new API calls — the dialect layer is deterministic formatting of already-stored promptText.

- **Four dialect adapters** — pure functions that re-express the stored 6-part universal prompt into target AI-video-model formats:
  | Adapter | Target | Format |
  |---|---|---|
  | `veo.ts` | Veo 3.1 / Flow | Structural ingredient tags `[Subject: …] [Camera: …] [Style: …]`, explicit motion vectors `[Motion: …]`, audio beat cue, `[Duration: Ns]` |
  | `higgsfield.ts` | Higgsfield / Soul ID | Narrative prose, `[Camera: …]` tags inline, `[SoulID: <name>]` weight tokens per character |
  | `kling.ts` | Kling 3.0 | Director-note camera framing, character-physics cue, multi-shot voice binding + lip-sync cue line (when `voiceTone` is present in the bible) |
  | `seedance.ts` | Seedance 2.0 | Prompt + `(Camera: …)` spatial-offset block, `[Ref: shot-N_frame]` reference-frame placeholder, audio marker line |

- **Universal fallback** — the stored 6-part prompt verbatim; the default tab and copy target.
- **Dialect registry** (`lib/video/model-dialects.ts`) — `VIDEO_DIALECTS` list + `formatShotForDialect(shot, dialectId, { characters? })` router.
- **Dialect selector chip group** (`components/video-prompt/dialect-tabs.tsx`) — role="tablist" chips with arrow-key / Home / End navigation; brand-tinted active state with check icon.
- **Storyboard card** (`components/video-prompt/shot-card.tsx`) — Shot N chip + duration, description, dialect tabs, live mono preview updating instantly on tab switch, gradient primary copy button (inline-copy "Copied ✓" feedback), continuity handoff caption.
- **Timeline** (`components/video-prompt/shot-list.tsx`) — vertical chain with connector lines, Up / Down chevron reorder, trash icon with destructive `ConfirmModal` (mid-chain deletions warn the handoff between N−1 and N+1 breaks; the chain renumbers and the rebuild is logged), and an empty-state card directing the user back to the chat thread.
- **Continuity chain rebuild** (`rebuildShotContinuity()` in `lib/video/story-bible.ts`) — renumbers shots 1..N in the desired sequence; prompt texts and continuity handoffs stay verbatim; returns a `continuityLog` entry describing the action.
- **Workspace wiring** — the timeline flows under the chat column; the workspace header shows a live shot-count chip.

### 📊 Measurement & Quality

Close the generate → score → test → compare → ship loop — all computed against your own providers:

- **Prompt Quality Scorecard (F1)** — every version can be scored 0–100 across six rubric dimensions (clarity, structure, output specification, context, error handling, token efficiency), with concrete strengths and one-line actionable fixes. Scored by an **LLM judge** (strict-JSON rubric via `/api/evaluate`) with an instant local heuristic fallback; scores are cached per version so quality deltas are visible across the version strip.
- **Cross-Model A/B Lab (F2)** — run the same prompt against the same test input through multiple providers/models side by side, with a **consistency score** (deterministic n-gram cosine + word-Jaccard similarity — no external embedding service). Each provider picks which of its models participates.
- **Prompt Regression Suite (F3)** — save a set of test inputs per session, then run any version against the whole suite for a per-case **pass/fail + score table** (pass threshold 75), with run history persisted per session. No-code regression testing for prompts — "v3 fixed the edge case but broke case 2."
- **Placeholder Linter & Variable Fill (F4)** — audits every `[BRACKETED_PLACEHOLDER]` for inconsistent naming, unclosed brackets, and duplicate groups, then fills in sample values for a copy-paste-ready prompt.
- **Multi-Model Export Adapters (F5)** — export any version formatted for the target conventions: Claude (XML tags), GPT (structured text), Gemini (bold labels), generic Markdown, or JSON payload.
- **Prompt Health Monitor (F6)** — re-verify saved prompts from History with the AI judge; flags score drift (Δ ≥ 8 points) and surfaces a "re-verify" state so saved prompts don't rot silently when models change.
- **Adversarial red-team probes** — a built-in library of auto-generated attacks (`lib/probes.ts`): prompt injection, contradictory instruction, out-of-scope request, and role-confusion jailbreak. Their inputs are designed to be merged into a session's regression suite so they run through the same execute + judge pipeline as every other case.
- **Cost-Per-Quality Ledger** — built-in on-device cost math for every version: estimated cost per 1,000 production completions, one-shot generation cost, score-per-dollar, and "silent cost blowout" flags (cost went up, score didn't), computed from a local published-price table (`lib/model-pricing.ts`); score/cost series and a dependency-free SVG sparkline (`components/sparkline.tsx`) are ready for charting version trends.

### 🔌 Bring Your Own Model

- **Built-in Google Gemini** (server-side, `GEMINI_API_KEY`) with configurable temperature / top-p / max tokens.
- **Any OpenAI-compatible provider**: OpenAI, Groq, OpenRouter, Ollama, or a self-hosted endpoint.
- Base-URL normalization handles accidental full-endpoint pastes; streaming or single-shot responses.
- **Multiple models per provider** — store a full model list per provider (first entry is the default) and switch the active model from the navbar, the generator bar, or the A/B lab; selections persist locally and older single-model configs stay fully readable.

### 🔌 AI Elements

A reusable conversation & streaming component library (`components/ai-elements/`) providing:

- **Conversation** — scroll container with sticky scroll-to-bottom button.
- **Message** — user / assistant message with avatar, live-region accessible content, and optional toolbar.
- **Reasoning** — collapsible thinking-chain renderer (streaming-safe, expand-on-complete).
- **Tool** — animated tool-call card with execution state (running → complete).
- **Prompt Input** — a multi-part prompt composer with actions menu, keyboard shortcuts, and a streaming-safe textarea.
- **Streamdown** — real-time markdown + code-block + Mermaid streaming renderer (CJK, code, math, mermaid plugins).

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

### Text Studio

1. **Generator** — pick a domain (including **Blog & Content** for SEO-optimized article prompts), enter a topic/audience/notes, choose tone + framework and an optional output character limit, and click **Generate**. The engineered prompt streams into the output pane with live stats.
2. **Score** — open the **Quality** badge to see the scorecard (overall + six dimensions with notes and one-line fixes), or hit **Run AI Review** for an LLM-judge score. Scores are cached per version, so the version strip and History show quality deltas as you iterate.
3. **Refine** — type an instruction like *"make it more concise and target non-technical users"*. A new version is created; the full conversation is sent as context.
4. **Versions** — use the version selector to switch, rename, diff, favorite, or restore any saved version. Manual edits are saved as their own versions too.
5. **Test** — click **Test** to run the active prompt as a system instruction against a sample query in the sandbox modal; with 2+ providers configured, **Compare models** runs the same prompt + input across them side by side with a consistency score.
6. **Consistency checks** — add sample test inputs once per session, then run **every version × every case** for a pass/fail matrix (75+ passes). The built-in adversarial probes (`lib/probes.ts`) supply injection, contradiction, out-of-scope, and jailbreak inputs you can add to the suite.
7. **Custom fields & export** — fill `[BRACKETED_PLACEHOLDERS]` for a copy-paste-ready prompt (inconsistent or unclosed fields are flagged), and export any version as Claude, GPT, Gemini, Markdown, or JSON.
8. **History** — search and filter past sessions, open any session's thread, import/export sessions, **re-verify** a saved prompt's health with the AI judge, or clear all.

### Image & Logo Studio

1. **Choose mode** — toggle between Image (AI art prompts) and Logo (brand identity briefs).
2. **Pick a style** — select from the Essentials grid (visual style, logo style, aspect ratio), then open Refine for platform dialects and Brand sub-settings.
3. **Describe your subject** — type freely, or pick an AI-refreshed example chip matched to the current module/domain/settings.
4. **Art Direction** — customise lighting, camera, composition, mood, and color grade; negative prompt line with one-click AI suggestion.
5. **Generate** — the prompt streams in with platform-specific dialect cards (DALL-E 3, Midjourney, Stable Diffusion, Flux, Nano Banana) and a copy-all action.
6. **Save to gallery** — persist the brief locally, then revisit or copy later.

### Video Prompt Studio

1. **Create a project** — open the Video tab, click **New Project**, and write a Directorial Brief (tone, visual style, camera direction, audience — a few sentences to a page).
2. **Bootstrap the Story Bible** — the 5-stage wizard drafts the Script, Characters, Locations, Visual Style, and VFX Direction from the brief. Review each stage; edit inline; click **Activate Production** to lock Visual Style + VFX.
3. **Draft shots in the chat thread** — the assistant proposes one sequential 8–30s shot per turn. **Approve** it into the storyboard or **Request Revision**. Each draft includes the full 6-part universal prompt (`SUBJECT · ACTION · CAMERA · LIGHTING · ENVIRONMENT · LENS`) and a continuity handoff for the next shot.
4. **Reorder & edit the storyboard** — use the Up/Down chevrons to move shots; the chain renumbers and the continuity chain rebuild is logged automatically. Mid-chain deletions warn that the handoff breaks before confirming.
5. **Export in your target dialect** — switch between the dialect tabs on any shot card (Veo 3.1, Higgsfield, Kling 3.0, Seedance 2.0, or Universal verbatim). The preview updates instantly; the Copy button gives you the formatted prompt ready to paste into the model's UI.

---

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `⌘K` / `Ctrl+K` | Open command palette |
| `⌘/Ctrl+Enter` | Generate prompt / submit refinement (from anywhere in the form) |
| `/` | Focus the topic field |
| `Esc` | Close dialogs / palette |
| `Tab` / `Arrow Keys` | Move between dialect chips in the Video storyboard |

---

## Privacy & Security

- **No accounts, no backend database.** Sessions, versions, test suites, project configs, and provider configs live in the browser (IndexedDB, with localStorage and in-memory fallbacks for restricted environments).
- **Server-side Gemini key.** The built-in provider's key is read from `process.env.GEMINI_API_KEY` in API routes only — it is never sent to the client.
- **On-device key encryption.** Custom provider API keys are encrypted with AES-GCM using a key derived via PBKDF2 (100k iterations) and a per-device salt, so keys aren't stored in plaintext.
- **API keys are sent to the provider you configure at request time** — they are never transmitted anywhere else.
- **Measurement is local and on-demand.** Quality scoring, A/B tests, and regression runs execute real completions against *your* configured providers — they never leave your machine except to the provider you chose, and they consume that provider's quota like any other call.
- **Video Prompt Studio is purely client-side.** Dialect formatting is deterministic — no AI calls, no schema migrations, no external requests; the stored 6-part prompt is translated at copy time.

---

## Project Structure

```
app/
  page.tsx                        # Main app: state, generation flow, views, modals
  layout.tsx                      # Root layout, theme init, metadata + JSON-LD structured data
  globals.css                     # Semantic design tokens (light/dark), Tailwind, scrollbar-thin
  blog/                           # Blog index + static post pages (content/blog/*.md)
  faq/page.tsx                    # FAQ page with FAQPage JSON-LD
  robots.ts / sitemap.ts          # robots.txt + sitemap.xml (incl. AI-crawler allow rules)
  api/
    generate/route.ts             # POST — stream a new engineered prompt
    refine/route.ts               # POST — stream a refined prompt with thread context
    test-prompt/route.ts          # POST — run a prompt as a system instruction (streamed)
    evaluate/route.ts             # POST — F1 LLM-judge prompt quality (heuristic fallback)
    evaluate-output/route.ts      # POST — F3/probes: execute a prompt on a case + judge output
    ab-test/route.ts              # POST — F2 parallel completions across providers + consistency score
    image-prompt/route.ts         # POST — Image/Logo prompt generation (streamed)
    suggest-examples/route.ts     # POST — AI-refreshed example-topic suggestions (hybrid prompts)
    suggest-negative-prompt/route.ts # POST — AI-suggested negative prompt for Image/Logo
    suggest-video-location/route.ts  # POST — AI-suggested location for Video Prompt Studio
    video-bootstrap/route.ts      # POST — single-stage Video Prompt Studio bootstrap (script → VFX)
    video-chat/route.ts           # POST — Video shot-drafting chat (Vercel AI streamText)
components/
  ai-elements/                    # Reusable AI conversation & streaming components
    conversation.tsx              # Scroll container + scroll-to-bottom button
    message.tsx                   # User / assistant message with avatar + toolbar
    reasoning.tsx                 # Collapsible thinking-chain renderer (streaming-safe)
    tool.tsx                      # Animated tool-call card with execution state
    prompt-input*.tsx             # Multi-part prompt composer (textarea, actions, menus, utilities)
    code-block*.tsx               # Syntax-highlighted code with copy, language selector
    suggestion.tsx                # AI suggestion chip card
    shimmer.tsx                   # Streaming skeleton / placeholder
  image-prompt/
    action-bar.tsx                # Sticky submit bar with selection summary chips + model picker
    art-direction.tsx             # Lighting, camera, composition, mood, color-grade form section
    brief-viewer.tsx              # Dialect card tabs (per platform) + copy-all / save actions
    output-panel.tsx              # Generated prompt display + dialect tabs
    saved-gallery.tsx             # Locally-saved prompt gallery for Image/Logo
    studio-header.tsx             # Header with mode toggle (Image / Logo) and project actions
    studio-types.ts               # Shared form state interface for the Image/Logo studio
  video-prompt/
    bootstrap-flow.tsx            # 5-stage wizard orchestrator for Story Bible creation
    bootstrap-script-step.tsx     # Stage 1: script / scene structure generation
    bootstrap-characters-step.tsx # Stage 2: character / cast generation
    bootstrap-scenes-step.tsx     # Stage 3: location / set generation
    bootstrap-style-step.tsx      # Stage 4: visual style generation (locked on activation)
    bootstrap-effects-step.tsx    # Stage 5: VFX direction generation (locked on activation)
    bootstrap-model-selector.tsx  # AI model selector for the bootstrap pipeline
    bootstrap-progress.tsx        # Visual stage progress stepper
    project-dashboard.tsx         # Portfolio: grid/list view, search, status filters
    project-card.tsx              # Individual project card (metrics, status badge, delete)
    project-workspace.tsx         # Active project workspace: sidebar + chat + storyboard timeline
    studio-header.tsx             # Top bar with project switcher + New Project button
    sidebar.tsx                   # Active-project sidebar (lock rules, metrics, panels)
    sidebar-style-panel.tsx       # Locked visual style + VFX display
    sidebar-characters-panel.tsx  # Editable cast list
    sidebar-locations-panel.tsx   # Editable location list + AI location scouting
    new-project-modal.tsx         # New project creation modal
    chat-thread.tsx               # Multi-turn shot-drafting thread (Vercel AI useChat)
    chat-input.tsx                # Chat input with @-mention token autocomplete
    thinking-orb.tsx              # Animated orb mirroring Vercel AI status
    token-autocomplete.tsx        # @-mention autocomplete for characters/locations
    character-form.tsx            # Inline character add/edit form
    location-form.tsx             # Inline location add/edit form
    shot-draft-card.tsx           # Unconfirmed draft card (Approve / Request Revision)
    dialect-tabs.tsx              # Dialect selector chip group (role="tablist", arrow-key nav)
    shot-card.tsx                 # Confirmed shot card (dialect tabs, live preview, copy)
    shot-list.tsx                 # Storyboard timeline (reorder, delete w/ confirm, empty state)
  command-palette.tsx             # ⌘K command palette
  confirm-modal.tsx               # Reusable destructive confirm modal
  domain-selector.tsx             # Domain preset chip grid with AI example topics
  glass-card.tsx                  # Glassmorphism card with glow variants
  markdown-renderer.tsx           # Markdown output with placeholder highlighting
  navbar.tsx                      # Top navigation bar (mode tabs, brand, provider)
  provider-settings.tsx           # Provider configuration panel (add/edit/delete providers)
  prompt-form.tsx                 # Text prompt generator form (topic, tone, framework, etc.)
  prompt-output.tsx               # Text prompt output pane (versions, score, test, export)
  history-panel.tsx               # Version history + re-verify + import/export
  reading-progress.tsx            # Reading progress bar
  site-header.tsx / site-footer.tsx  # Marketing site header (auth) + footer
  sparkline.tsx                   # Dependency-free SVG sparkline for score/cost trends
  test-prompt-modal.tsx           # Prompt test sandbox (streaming output)
  toast.tsx / tooltip.tsx         # Toast notifications + accessible tooltips
  ui/                             # shadcn/ui primitives
    badge.tsx                     # Badge component
    button.tsx                    # Button component
    collapsible.tsx               # Collapsible section
    command.tsx                   # Command dialog (cmdk)
    dialog.tsx                    # Modal dialog
    dropdown-menu.tsx             # Dropdown menu
    hover-card.tsx                # Hover card popover
    input.tsx / input-group.tsx   # Form input + group
    scroll-area.tsx               # Scrollable area (Radix)
    select.tsx                    # Select dropdown (Radix)
    separator.tsx                 # Horizontal/vertical separator
    spinner.tsx                   # Loading spinner
    textarea.tsx                  # Multi-line textarea
    tooltip.tsx                   # Tooltip (Radix)
hooks/
  use-mobile.ts                   # Responsive breakpoint hook
  use-dynamic-examples.ts         # AI-refreshed example topics (hybrid static → AI)
lib/
  domains.ts                      # Domain presets, tones, frameworks, prompt builders
  ai-client.ts                    # Streaming + non-streaming fetch wrappers for the API routes
  openai-provider.ts              # OpenAI-compatible client, URL normalization, error mapping
  server-completion.ts            # Shared non-streaming completions (Gemini / OpenAI-compatible)
  model-fallback.ts               # Automatic model fallback on Gemini errors
  storage.ts                      # IndexedDB + localStorage + in-memory persistence & migrations
  video-storage.ts                # Video Prompt Studio project persistence (IndexedDB + fallback)
  video-ai.ts                     # Video Prompt Studio model resolution (Vercel AI LanguageModel)
  crypto.ts                       # AES-GCM / PBKDF2 encryption for stored API keys
  prompt-stats.ts                 # Word/char/token stats, version naming
  diff.ts                         # Word-level diff for version comparison
  use-focus-trap.ts               # WCAG dialog focus management
  use-scroll-lock.ts              # Prevent background scrolling while a modal is open
  use-inline-copy.ts              # Clipboard feedback hook ("Copied ✓" near the action)
  prompt-quality.ts               # F1 — quality rubric, judge prompt, heuristic scorer
  ledger.ts                       # Cost-per-quality ledger rows, score attribution, series
  model-pricing.ts                # Local published-price table for on-device cost estimates
  similarity.ts                   # F2 — n-gram cosine + Jaccard consistency scoring
  placeholder.ts                  # F4 — placeholder lint + variable fill
  export.ts                       # F5 — per-model export adapters (Claude/GPT/Gemini/Markdown/JSON)
  probes.ts                       # Adversarial red-team probe definitions
  image-prompts.ts                # Image mode presets: styles, lighting, moods, compositions
  logo-prompts.ts                 # Logo mode presets: industries, mark types, palettes, styles
  content.ts / seo.ts / site.ts   # Static blog content layer, SEO copy + structured data, site URL
lib/video/
  story-bible.ts                  # Story Bible digests, continuity anchors, handoffs, shot parsing, rebuild
  system-prompt.ts                # Phase 4 shot-drafting system prompt builder
  model-dialects.ts               # Video dialect registry + pure formatShotForDialect() router
  bootstrap/
    types.ts                      # Request/response contracts for bootstrap stages
    shared.ts                     # Shared bootstrap helpers (model resolution, prompt builder)
    script.ts / characters.ts / scenes.ts / style.ts / effects.ts  # Per-stage logic
  dialects/
    shared.ts                     # parseUniversalPrompt() + findPromptCharacters() + asSentence()
    veo.ts                        # Veo 3.1 / Flow — structural ingredient tags + motion vectors
    higgsfield.ts                 # Higgsfield / Soul ID — narrative prose + SoulID weight tokens
    kling.ts                      # Kling 3.0 — director notes + character physics + voice binding
    seedance.ts                   # Seedance 2.0 — prompt + reference frame + audio markers
types/
  index.ts                        # Shared contracts: Session, PromptVersion, ProviderConfig, …
  video.ts                        # Video Prompt Studio contracts: VideoProject, VideoShot, StoryBible, …
content/blog/*.md                 # Blog posts (frontmatter + markdown, parsed at build time)
public/                           # llms.txt, og-image.png
scripts/generate-og.mjs           # Regenerates the Open Graph image (bun run generate:og)
DESIGN.md                         # Canonical visual system & UI direction
CHANGELOG.md                      # Keep-a-Changelog history
RELEASE_NOTES.md                  # Human-facing release notes
RESEARCH.md                       # Competitive research & feature rationale
```

**Data flow — Text Studio:** UI → `lib/ai-client.ts` (streaming/non-streaming fetches) → `app/api/*` routes → provider SDK (Gemini or OpenAI-compatible) → streamed text back to the UI → `lib/storage.ts` (IndexedDB). Scoring (F1), case evaluation (F3/probes), and A/B runs (F2) use shared non-streaming completions via `lib/server-completion.ts`; the cost ledger and placeholder/export transforms are computed entirely on-device.

**Data flow — Video Prompt Studio:** Directorial brief → `app/api/video-bootstrap` (one call per bootstrap stage via Gemini or OpenAI-compatible) → Story Bible stored in `VideoProject.storyBible` → `app/api/video-chat` (Vercel AI `streamText` with `@ai-sdk/google`) → chat thread drafts `DraftedShot` JSON → approved `VideoShot` objects land on the storyboard → `formatShotForDialect()` produces copy-ready prompts at view/copy time — purely deterministic, no server call.

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
| UI | React 19, Tailwind CSS 4, Motion (Framer Motion v12), Lucide icons |
| AI Elements | Vercel AI Elements — `conversation`, `message`, `reasoning`, `tool`, `prompt-input`, `shimmer`, `suggestion`, `code-block` |
| AI Conversations | Vercel AI SDK (`ai` v7 + `@ai-sdk/react` v4) — `useChat`, `useCompletion`, `DefaultChatTransport` |
| Markdown | react-markdown + remark-gfm, Mermaid diagrams, Streamdown (CJK, code, math, math plugins), custom placeholder highlighting |
| UI Primitives | shadcn/ui + Radix UI (`dialog`, `dropdown-menu`, `scroll-area`, `select`, `tooltip`, `separator`, `collapsible`, `hover-card`, `cmdk`) |
| AI | `@google/genai` (Gemini) + `openai` SDK (any OpenAI-compatible endpoint) |
| Measurement | LLM-judge scoring with heuristic fallback, deterministic similarity (n-gram + Jaccard), local pricing/ledger math, dependency-free SVG sparklines |
| Video Dialects | Deterministic prompt translation adapters for Veo 3.1, Higgsfield / Soul ID, Kling 3.0, and Seedance 2.0 |
| Storage | IndexedDB with localStorage / in-memory fallbacks, Web Crypto (AES-GCM) |
| Language | TypeScript (strict) |
| Package manager | Bun |

---

## Known Limitations

- Sessions are tied to the **browser they were created in** — no cross-device sync yet.
- Custom provider keys are stored client-side (encrypted) and are sent to your chosen provider at request time.
- Quality scores and cost estimates are **local approximations** — LLM-judge or heuristic scores, and published list prices — not guarantees of production behavior.
- AI review, A/B tests, and regression runs execute real completions against your configured providers and consume their API quota like any other call.
- Video Prompt Studio dialect adapters are **deterministic re-formatters** — they translate the stored prompt; they do not generate new content or know the visual grammar of each video model.
- Video Prompt Studio shot drafting uses the same provider as the text studio; bootstrap and chat both consume API quota.
- Image/Logo studio platform dialects are a single best-effort formatting — they do not cover every provider's parameter syntax or aspect-ratio constraints.
- The Reading Progress bar is a simple character-offset-based progress bar, not a semantic content-aware progress indicator.

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
