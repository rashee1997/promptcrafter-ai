<p align="center">
  <img src="assets/logo.svg" alt="PromptCrafter AI" width="268" />
</p>

<p align="center">
  <em>Atmospheric prompt engineering &amp; optimization — generate, refine, version, test, and measure production-ready AI prompts.</em><br>
  <em>Studio-grade Image, Logo, Video, and Product Shoot prompt pipelines built in.</em>
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

**PromptCrafter AI** is an AI-powered prompt engineering and optimization workbench with four studios:

- **Text Prompt Studio** — describe a goal (optionally with attached code, PDFs, or images as context), get a role-aware production prompt, refine it conversationally, version every edit, test it live, and prove it works with quality scoring, cross-model A/B testing, and regression suites.
- **Image & Logo Prompt Studio** — a guided form-to-prompt pipeline for image and brand-identity prompts: pick a curated style recipe or logo archetype (or let AI generate a template), tune camera, lighting, and composition; generate a platform-dialect-ready prompt (DALL-E, Midjourney, Stable Diffusion, Flux, Nano Banana); reverse-engineer prompts from uploaded images; or run the Logo Studio 2.0 brand-identity workbench with strategist autopilot, mockup deck, and favicon simulator.
- **Video Prompt Studio** — a platform-first cinematic pipeline: pick one of seven target AI-video platforms (Veo 3.1, Kling 3.0, Seedance, Higgsfield / Soul ID, Runway, Luma, Pika), bootstrap a locked Story Bible through a 10-stage wizard (Story → Dialogue → Screenplay → Direction → Characters → Locations → Style → VFX), then draft and approve sequential 8–30s shots in a conversational thread — with character voice packages, pacing analysis, and a one-click assembly export.
- **Product Shoot Studio** — turn product reference images + a short brief into cinematic product-video ad prompts with scene recipes, physics FX, multi-dialect output (Runway, Kling, Veo, Luma, Minimax), sequential clip extensions, audio foley, and 3-shot campaign arcs.

> Streaming output · local-first storage (IndexedDB) · AES-GCM on-device key encryption · bring-your-own-model provider support · LLM-judge quality scoring, cross-model A/B testing, and no-code regression suites.

---

## Table of Contents

- [Why PromptCrafter?](#why-promptcrafter)
- [Key Features](#key-features)
  - [Text Prompt Studio](#-text-prompt-studio)
  - [Image & Logo Prompt Studio](#-image--logo-prompt-studio)
  - [Video Prompt Studio](#-video-prompt-studio)
  - [Product Shoot Studio](#-product-shoot-studio)
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
- **Optional output character limit** — cap the engineered prompt at a target length (default 8,000 characters) to keep prompts lean.
- **Dynamic hybrid example prompts** — static chips that quietly upgrade to AI-refreshed topic suggestions matched to the current domain and settings.
- **Custom chip values and save-for-later** — any setting (tone, framework, format) can take a user-defined value, which persists in IndexedDB for future visits.
- **File, project, PDF & image attachments** — attach code files or a whole project folder (formatted as XML codebase context), PDFs, and images to ground the engineered prompt in your real project structure, schemas, and signatures. Attachments that the active model can't read are **auto-routed** through the built-in Gemini extractor (configurable: always / ask / never).
- **Dedicated Settings page** — six tabs: AI Providers, Model Capabilities (per-model vision/PDF overrides), File & Upload preferences, Data & Privacy (import/export/clear), Defaults (domain/tone/framework), and Appearance.

### 🎨 Image & Logo Prompt Studio

- **Dual-mode form**: Image mode for AI-generated imagery (DALL-E, Midjourney, Stable Diffusion, Flux, Nano Banana dialects); Logo mode for brand-identity briefs (mark type, palette, industry, wordmark lockup, hidden meaning).
- **Curated style recipes & logo archetypes** — one-click presets across categories (Editorial & Fashion, Cinematic & Film, 3D & CGI, Fine Art & Graphic, Sci-Fi & Cyberpunk, Architecture & Spaces for images; Tech & SaaS, Modern & Swiss, Luxury & Heritage, Creative & Modern, Artisan & Craft for logos), each pre-configuring style, camera, lighting, palette, and negative prompt — plus a "Surprise me" pick and an **AI-Assisted Template Generator** that builds a custom recipe from a plain-text description.
- **Image-to-prompt reverse engineering** — upload an image and get back an engineered prompt describing it; an **edit-prompt** flow revises an existing image prompt from feedback.
- **Logo Studio 2.0 brand workbench** — Smart Brand Autopilot strategist (name + description → full brand direction), brand guidelines card, logo mockup deck, and a favicon-size legibility simulator.
- **Tiered settings layout**: Essentials always visible → collapsed Refine accordion (platform dialects + brand sub-card) → Art Direction (custom lighting, camera, composition, color grade, reference images).
- **AI-suggested negative prompts** — one-click generates a brief-specific exclusion list keyed to the chosen style, lighting, palette, and usage context; appended with `,` instead of overwriting manual input.
- **Copy all prompts** — all platform dialects copied as one clipboard payload, with inline "Copied ✓" feedback.
- **Save to gallery** — persist generated briefs locally for comparison across sessions.
- **Custom chip values and save-for-later** — every chip-based setting (style, lighting, mood, composition, camera, color grade, resolution, aspect ratio, platform dialects, logo-specific rows) gains a "Custom…" trigger that accepts any value outside the preset list.

### 🎬 Video Prompt Studio

A platform-first cinematic prompt pipeline that turns a short directorial brief into a storyboard of copy-ready video-shot prompts — all stored locally, no accounts required.

**Production Hub**
- Project dashboard with grid/list view, search, status filters (Draft / Active), and quick-delete with confirmation.
- New-project modal with directorial brief textarea and an optional AI **story treatment** confirmed before creation.
- Project cards show shot count, character count, and relative update time.

**Story Bible Bootstrap — 10-stage wizard**
Platform → Story → Dialogue → Screenplay → Direction → Characters → Locations → Style → VFX → Activate:

| Stage | Output |
|---|---|
| 0. Platform | Pick one of seven target platforms (Veo 3.1, Kling 3.0, Seedance, Higgsfield / Soul ID, Runway, Luma, Pika) — a platform knowledge base (`lib/video/platforms/`) gates constraints, dialogue syntax, and native-audio capability |
| 1. Story | Story treatment with selectable **narrative structure frameworks** (three-act, hero's journey, etc.) |
| 2. Dialogue | Script dialogue draft in a vivid writing register |
| 3. Screenplay | Screenplay scenes with beats |
| 4. Direction | Direction plan (shot functions, coverage) |
| 5. Characters | Cast with appearance, wardrobe, voice tone — plus AI-generated **character reference-image prompts** and image analysis |
| 6. Locations | Set descriptions + AI location scouting suggestions |
| 7. Visual Style | Curated visual-style library with camera-vocabulary gating (locked on activation) |
| 8. VFX Direction | VFX cues, particle density, pacing (locked on activation) |

- Each stage has its own UI with inline AI generation, undo, and a progress stepper; a per-stage **model selector** lets you route each stage to a different provider/model (persisted locally).

**Shot Drafting Chat**
- Multi-turn conversational thread (Vercel AI `useChat`) where the director guides shot proposals turn-by-turn; scene-scoped drafting pulls in only the location and characters relevant to the current scene.
- Each assistant turn emits a structured JSON draft (`DraftedShot`): shot number, description, universal prompt, continuity handoff, and duration (8–30 s) — with an **AI-chosen prompt form per shot** (dynamic prompt architecture) and an **action-beat decomposer** for complex motion.
- **Approve** promotes the draft into a confirmed `VideoShot` on the storyboard; **Request Revision** re-drafts the same shot number with the director's feedback and full conversation context.
- Shot-level customization: per-shot director defaults, dialogue cards, and character reference images driving visual consistency.
- **Active Project Sidebar** (2-tier lock rules): Style + VFX cards render read-only once activated; cast and locations remain editable.

**Character Voice & Performance**
- Structured `CharacterVoice` assets per cast member; for platforms **without** native dialogue audio, the external voice pipeline (`lib/video/voice-pipeline.ts`) produces lip-sync-ready voice-track packages (per-line audio specs for ElevenLabs, Fish Audio, etc.). Native-audio platforms (Veo 3.1, Kling 3.0, Seedance) lean on built-in dialogue audio.

**Timeline Assembly & Post-Production Prep**
- **Storyboard timeline** — vertical chain with connector lines, Up/Down reorder, destructive-confirm deletion (mid-chain deletions warn the continuity handoff breaks; the chain renumbers and the rebuild is logged via `rebuildShotContinuity()`).
- **Pacing analysis** (`lib/video/pacing.ts`) — total runtime, average shot length, rhythm graph, and flags for monotone runs of identically-lengthed shots.
- **Music/SFX brief** derived from the pacing analysis.
- **Assembly export** — one copy/download-ready package bundling ordered shots with prompts, durations, scene/function tags, voice-track references, and the music brief for handoff to downstream editing tools.

**Dialect Export**
- Deterministic dialect adapters (`lib/video/dialects/`) re-express stored shot prompts for Veo 3.1 / Flow, Higgsfield / Soul ID, Kling 3.0, and Seedance — plus a Universal verbatim fallback — with accessible tablist chips and live preview on every shot card. No API calls; formatting happens at copy time.

### 📦 Product Shoot Studio

An isolated sub-tab of the Video studio for **cinematic product-video ad prompts** — upload product reference images, fill a short brief, and get a full multi-platform prompt package:

- **Product brief + reference images** — name, category (Skincare, Beverage, Tech, Luxury, Fashion, Home), one-line description, key selling point, audience, and up to several client-side-compressed reference images (PNG/WebP alpha channels preserved for cutouts; images stay session-only).
- **Scene recipes** — curated one-click scene concepts plus a "Surprise me" pick.
- **Creative art-direction controls** — camera motion (360 orbit, macro dolly-in, hero low-angle crane, FPV glide…), lighting (luxury chiaroscuro, golden hour, cyberpunk neon…), surface materials (Carrara marble, wet obsidian, brushed titanium…), physics FX (water splash crown, powder explosion, zero-gravity float…), motion pace, human interaction, focal length, aspect ratio, and target duration — with AlterLab-style cine optics and quick negative-constraint chips (`+ no human faces or hands`, `+ pure product only`, …).
- **Multi-dialect output deck** — parsed platform prompt cards for Runway, Kling, Veo, Luma, and Minimax, plus a remix loop for iterating on any concept.
- **Sequential clip extensions & temporal chaining** — extension beats that chain past single-clip duration limits for 10s+ videos.
- **Audio foley, ad strategy & 3-shot campaign arcs** — audio design packages, ad-strategy notes, and a hook → feature → CTA campaign storyboard.
- **Local persistence** — saved shoots with favorites and a gallery, with automatic `QuotaExceededError` fallback that strips raw thumbnails but never loses prompt text.

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

1. **Create a project** — open the Video tab, click **New Project**, write a Directorial Brief (tone, visual style, camera direction, audience — a few sentences to a page), and optionally confirm an AI story treatment before creation.
2. **Pick a target platform** — Stage 0 of the wizard selects one of seven AI-video platforms (Veo 3.1, Kling 3.0, Seedance, Higgsfield, Runway, Luma, Pika); its spec gates shot constraints and dialogue handling downstream.
3. **Bootstrap the Story Bible** — the wizard drafts Story → Dialogue → Screenplay → Direction → Characters → Locations → Visual Style → VFX. Review each stage; edit inline; click **Activate Production** to lock Visual Style + VFX.
4. **Draft shots in the chat thread** — the assistant proposes one sequential 8–30s shot per turn, scoped to the current scene's location and cast. **Approve** it into the storyboard or **Request Revision**. Each draft includes the universal prompt and a continuity handoff for the next shot.
5. **Reorder & edit the storyboard** — use the Up/Down chevrons to move shots; the chain renumbers and the continuity chain rebuild is logged automatically. Mid-chain deletions warn that the handoff breaks before confirming.
6. **Export in your target dialect** — switch between the dialect tabs on any shot card (Veo 3.1, Higgsfield, Kling 3.0, Seedance, or Universal verbatim). The preview updates instantly; the Copy button gives you the formatted prompt ready to paste into the model's UI.
7. **Assemble the package** — review the pacing graph and music brief, then copy or download the full assembly document (shots + voice-track references + music/SFX brief) for post-production handoff.

### Product Shoot Studio

1. **Open the sub-tab** — Video tab → **Product Shoot**.
2. **Upload product images & fill the brief** — product name, category, description, key selling point; images are compressed client-side and stay session-only.
3. **Pick a scene recipe & tune art direction** — camera motion, lighting, surface, physics FX, pace, aspect ratio, target duration, and quick negative-constraint chips.
4. **Generate** — the studio streams a multi-platform prompt package (Runway, Kling, Veo, Luma, Minimax) with optional clip-extension beats, audio foley, ad strategy, and a 3-shot campaign arc.
5. **Remix or save** — iterate on any concept with the remix loop, or save the shoot to the local gallery.

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
    image-prompt-redo/route.ts    # POST — regenerate a dialect section of an image prompt
    image-to-prompt/route.ts      # POST — reverse-engineer a prompt from an uploaded image
    image-edit-prompt/route.ts    # POST — revise an existing image prompt from feedback
    image-style-template/route.ts # POST — AI-assisted style recipe / logo archetype generation
    brand-strategist/route.ts     # POST — Logo Studio 2.0 Smart Brand Autopilot strategist
    suggest-examples/route.ts     # POST — AI-refreshed example-topic suggestions (hybrid prompts)
    suggest-negative-prompt/route.ts # POST — AI-suggested negative prompt for Image/Logo
    suggest-video-location/route.ts  # POST — AI-suggested location for Video Prompt Studio
    video-bootstrap/route.ts      # POST — single-stage Video Prompt Studio bootstrap (story → VFX)
    video-chat/route.ts           # POST — Video shot-drafting chat (Vercel AI streamText)
    video-character-image-prompt/route.ts # POST — character reference-image prompt generation
    product-shoot/route.ts        # POST — Product Shoot Studio prompt package generation
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
    bootstrap-flow.tsx            # 10-stage wizard orchestrator for Story Bible creation
    bootstrap-platform-step.tsx   # Stage 0: target platform picker (7 platforms)
    bootstrap-story-step.tsx      # Stage 1: story treatment + narrative framework picker
    bootstrap-dialogue-step.tsx   # Stage 2: script dialogue draft
    bootstrap-screenplay-step.tsx # Stage 3: screenplay scenes
    bootstrap-direction-step.tsx  # Stage 4: direction plan
    bootstrap-characters-step.tsx # Stage 5: character / cast generation + reference-image prompts
    bootstrap-scenes-step.tsx     # Stage 6: location / set generation
    bootstrap-style-step.tsx      # Stage 7: visual style (curated library, locked on activation)
    bootstrap-effects-step.tsx    # Stage 8: VFX direction generation (locked on activation)
    bootstrap-model-selector.tsx  # Per-stage AI model selector for the bootstrap pipeline
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
    shot-dialogue-card.tsx        # Per-shot dialogue lines with voice cues
    dialect-tabs.tsx              # Dialect selector chip group (role="tablist", arrow-key nav)
    shot-card.tsx                 # Confirmed shot card (dialect tabs, live preview, copy)
    shot-list.tsx                 # Storyboard timeline (reorder, delete w/ confirm, empty state)
    sequence-timeline.tsx         # Phase 7 horizontal sequence timeline
    pacing-graph.tsx              # Phase 7 shot-rhythm pacing graph
    music-brief-panel.tsx         # Phase 7 music/SFX brief derived from pacing
    assembly-export.tsx           # Phase 7 assembly package (copy/download for handoff)
    character-reference-panel.tsx # Character reference-image prompts + analysis
    character-bible-card.tsx      # Bible card with read/edit toggle
    studio/                       # Phase 8 unified studio shell (tabs, cards, overview)
  product-shoot/
    product-shoot-studio.tsx      # Product Shoot Studio orchestrator (sub-tab of Video)
    brief-form.tsx                # Product brief form (name, category, selling point, …)
    product-upload-panel.tsx      # Reference image upload + client-side compression
    scene-recipe-picker.tsx       # Curated scene recipes + surprise pick
    creative-controls.tsx         # Camera/lighting/surface/FX/pace/duration controls
    output-panel.tsx              # Multi-dialect prompt deck (Runway/Kling/Veo/Luma/Minimax)
    saved-gallery.tsx             # Locally-saved shoot gallery with favorites
    studio-header.tsx             # Header with active-model + load-example dropdowns
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
  image-style-recipes.ts          # Curated image scene recipes by category
  logo-archetypes.ts              # Curated logo brand archetypes by category
  logo-guidelines.ts / logo-mockups.ts  # Logo Studio 2.0 brand guidelines + mockup deck data
  image-prompt-kits.ts / image-prompt-quality.ts  # Image prompt kits + quality scoring
  model-capabilities.ts           # Per-model vision/PDF capability detection + overrides
  file-upload-utils.ts            # Code/project attachment formatting (XML codebase context)
  compression.ts                  # Client-side image compression (alpha-preserving)
  content.ts / seo.ts / site.ts   # Static blog content layer, SEO copy + structured data, site URL
lib/product-shoot/
  types.ts                        # Data contracts: brief, creative controls, dialects, campaign
  presets.ts                      # Camera/lighting/surface/FX/pace/duration preset tables
  scene-recipes.ts                # Curated scene recipes + surprise pick
  system-prompt.ts                # Product shoot system prompt + user message builders
  dialects.ts                     # Platform metas + output parsing (Runway/Kling/Veo/Luma/Minimax)
  storage.ts                      # Saved-shoot persistence with quota-exceeded fallback
lib/video/
  story-bible.ts                  # Story Bible digests, continuity anchors, handoffs, shot parsing, rebuild
  system-prompt.ts                # Shot-drafting system prompt builder
  model-dialects.ts               # Video dialect registry + pure formatShotForDialect() router
  voice-pipeline.ts               # Phase 5 external voice pipeline (lip-sync-ready packages)
  pacing.ts                       # Phase 7 pacing analysis (runtime, rhythm runs)
  scoring.ts                      # Phase 7 music/SFX brief builder
  action-decomposer.ts            # Action-beat decomposer for complex shot motion
  styles/                         # Curated visual style library with camera vocabulary
  platforms/                      # Platform knowledge base: veo, kling, seedance, higgsfield, runway, luma, pika
  bootstrap/
    types.ts                      # Request/response contracts for bootstrap stages
    shared.ts                     # Shared bootstrap helpers (model resolution, prompt builder)
    story.ts / dialogue.ts / screenplay.ts / direction.ts / characters.ts / scenes.ts / style.ts / effects.ts  # Per-stage logic
    structure-frameworks.ts       # Narrative structure frameworks (three-act, hero's journey, …)
    character-image-prompt.ts / analyze-character-image.ts  # Character reference-image tooling
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

**Data flow — Video Prompt Studio:** Directorial brief → platform pick (`lib/video/platforms/` spec gates constraints) → `app/api/video-bootstrap` (one call per bootstrap stage via Gemini or OpenAI-compatible, per-stage model override) → Story Bible stored in `VideoProject.storyBible` → `app/api/video-chat` (Vercel AI `streamText`) → chat thread drafts `DraftedShot` JSON → approved `VideoShot` objects land on the storyboard → `formatShotForDialect()`, the voice pipeline, pacing analysis, and the assembly export all run at view/copy time — purely deterministic, no server call.

**Data flow — Product Shoot Studio:** Product images (compressed client-side) + brief + creative controls → `app/api/product-shoot` (single streamed call) → `parseProductShootOutput()` splits the response into per-platform dialect cards, extension beats, audio foley, ad strategy, and campaign shots → `lib/product-shoot/storage.ts` persists saved shoots locally.

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
| Video Dialects | Deterministic prompt translation adapters for Veo 3.1, Higgsfield / Soul ID, Kling 3.0, and Seedance — plus a 7-platform knowledge base (adds Runway, Luma, Pika) gating bootstrap and drafting |
| Product Shoot | Streamed multi-dialect prompt packages for Runway, Kling, Veo, Luma, and Minimax with deterministic output parsing |
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
- Product Shoot Studio reference images are **session-only** — they are compressed client-side and are not persisted; saved shoots keep prompt text and metadata (thumbnails are dropped first if storage quota is exceeded).
- The character voice pipeline **prepares** lip-sync-ready audio specs — it does not call ElevenLabs/Fish Audio or render audio itself.
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
