<p align="center">
  <img src="assets/logo.svg" alt="PromptCrafter AI" width="268" />
</p>

<p align="center">
  <em>Atmospheric prompt engineering &amp; optimization — generate, refine, version, and test production-ready AI prompts.</em>
</p>

<p align="center">
  <img alt="Version" src="https://img.shields.io/badge/version-1.0.1-6366f1?style=for-the-badge" />
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

**PromptCrafter AI** is an AI-powered prompt engineering and optimization workbench. Describe what you want — it engineers a production-ready AI prompt for you, lets you refine it conversationally, versions every change, and tests it live against any model before you ship it anywhere.

> Streaming output · local-first storage (IndexedDB) · AES-GCM on-device key encryption · bring-your-own-model provider support.

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

Writing great prompts is iterative. PromptCrafter turns that iteration into a structured workflow:

1. **Generate** a structured, role-aware prompt from a short description.
2. **Refine** it conversationally — "make it more concise", "add edge-case handling" — with the full thread as context.
3. **Version** every change so nothing is ever lost and you can diff, rename, favorite, and roll back.
4. **Test** the final prompt as a system instruction against a sample query, with streaming output, before you use it anywhere.

No accounts, no cloud database, no vendor lock-in. Your work lives in your browser; your model, your choice.

---

## Key Features

### 🧠 Prompt Generation
- **12+ domains** with domain-aware system-prompt fragments: software, marketing, education, writing, data science, and more.
- **14 tone presets** — professional, creative, adversarial, socratic, executive, narrative, and more.
- **12 prompt frameworks**: RTF, CAR, Chain-of-Thought, Few-Shot, Meta System Prompt, ReAct, RISEN, Tree-of-Thoughts, Self-Refine, APE, COAST, and Socratic Architecture.
- Configurable output format (Markdown, JSON, bullet points, XML, structured text), constraints, and examples.

### 💬 Conversational Refinement
- Iterate on any generated prompt with natural-language instructions.
- The **full message thread** is sent as context, so refinements build on each other.
- Every refinement produces a new immutable version — never overwrites your work.

### 📚 Versioned Prompt Threads
- Every generation, refinement, and manual edit is stored as an immutable version.
- Per-version stats: word count, character count, estimated tokens.
- Rename versions, favorite sessions, diff between versions, and restore with one click.

### 🧪 Prompt Test Sandbox
- Run any generated prompt as a **system instruction** against a sample query.
- Watch the model's live streaming response before committing to the prompt.

### 🔌 Bring Your Own Model
- **Built-in Google Gemini** (server-side, `GEMINI_API_KEY`) with configurable temperature / top-p / max tokens.
- **Any OpenAI-compatible provider**: OpenAI, Groq, OpenRouter, Ollama, or a self-hosted endpoint.
- Base-URL normalization handles accidental full-endpoint pastes; streaming or single-shot responses.

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
| `APP_URL` | For deployments | The public URL where the app is hosted (self-referential links, callbacks). |

Copy `.env.example` to `.env.local` and fill in your key:

```bash
cp .env.example .env.local
```

> **Never commit real keys.** `.env.local` is git-ignored.

### AI Providers

- **Google Gemini (default)** — works out of the box once `GEMINI_API_KEY` is set. The key is used by the API routes on the server; the browser never sees it.
- **Custom OpenAI-compatible providers** — configure in **Providers** in the app: name, base URL, model, API key, and sampling parameters. Presets/quick fills for OpenAI, Groq, OpenRouter, and Ollama are provided, and any self-hosted `/v1` endpoint works. Keys are encrypted (AES-GCM) before being written to local storage.

---

## Usage Guide

1. **Generator** — pick a domain, enter a topic/audience/notes, choose tone + framework, and click **Generate**. The engineered prompt streams into the output pane with live stats.
2. **Refine** — type an instruction like *"make it more concise and target non-technical users"*. A new version is created; the full conversation is sent as context.
3. **Versions** — use the version selector to switch, rename, diff, favorite, or restore any saved version. Manual edits are saved as their own versions too.
4. **Test** — click **Test** to run the active prompt as a system instruction against a sample query in the sandbox modal.
5. **History** — search and filter past sessions, open any session's thread, import/export sessions, or clear all.

---

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `⌘K` / `Ctrl+K` | Open command palette |
| `⌘/Ctrl+Enter` | Generate prompt (from anywhere in the form) |
| `/` | Focus the topic field |
| `Esc` | Close dialogs / palette |

---

## Privacy & Security

- **No accounts, no backend database.** Sessions, versions, and provider configs live in the browser (IndexedDB, with localStorage and in-memory fallbacks for restricted environments).
- **Server-side Gemini key.** The built-in provider's key is read from `process.env.GEMINI_API_KEY` in API routes only — it is never sent to the client.
- **On-device key encryption.** Custom provider API keys are encrypted with AES-GCM using a key derived via PBKDF2 (100k iterations) and a per-device salt, so keys aren't stored in plaintext.
- **API keys are sent to the provider you configure at request time** — they are never transmitted anywhere else.

---

## Project Structure

```
app/
  page.tsx                 # Main app: state, generation flow, views, modals
  layout.tsx               # Root layout, theme init, skip-to-content link
  globals.css              # Semantic design tokens (light/dark), Tailwind
  api/
    generate/route.ts      # POST — stream a new engineered prompt
    refine/route.ts        # POST — stream a refined prompt with thread context
    test-prompt/route.ts   # POST — run a prompt as a system instruction
components/                # Form, output, history, provider settings, palette, modals
lib/
  domains.ts               # Domain presets, tones, frameworks, prompt builders
  ai-client.ts             # Streaming fetch wrappers for the API routes
  openai-provider.ts       # OpenAI-compatible client, URL normalization, error mapping
  storage.ts               # IndexedDB + localStorage + in-memory persistence & migrations
  crypto.ts                # AES-GCM / PBKDF2 encryption for stored API keys
  prompt-stats.ts          # Word/char/token stats, version naming
  diff.ts                  # Word-level diff for version comparison
  use-focus-trap.ts        # WCAG dialog focus management
types/index.ts             # Shared contracts: Session, PromptVersion, ProviderConfig, …
hooks/use-mobile.ts        # Responsive breakpoint hook
DESIGN.md                  # Canonical visual system & UI direction
CHANGELOG.md               # Keep-a-Changelog history
RELEASE_NOTES.md           # Human-facing release notes
```

**Data flow:** UI → `lib/ai-client.ts` (streaming fetch) → `app/api/*` routes → provider SDK (Gemini or OpenAI-compatible) → streamed text back to the UI → `lib/storage.ts` (IndexedDB).

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

The repository does not currently define a formal test suite; validate changes with `bun run lint` and a manual app check.

---

## Tech Stack

| Layer | Tech |
| --- | --- |
| Framework | Next.js 15 (App Router) with Turbopack |
| UI | React 19, Tailwind CSS 4, Motion, Lucide icons |
| Markdown | react-markdown + remark-gfm, custom placeholder highlighting |
| AI | `@google/genai` (Gemini) + `openai` SDK (any OpenAI-compatible endpoint) |
| Storage | IndexedDB with localStorage / in-memory fallbacks, Web Crypto (AES-GCM) |
| Language | TypeScript (strict) |
| Package manager | Bun |

---

## Known Limitations

- Sessions are tied to the **browser they were created in** — no cross-device sync yet.
- Custom provider keys are stored client-side (encrypted) and are sent to your chosen provider at request time.

---

## Documentation

- **[DESIGN.md](DESIGN.md)** — the canonical visual system: colors, typography, layout, components, and UI rules.
- **[CHANGELOG.md](CHANGELOG.md)** — full version history.
- **[RELEASE_NOTES.md](RELEASE_NOTES.md)** — human-facing release notes.

---

## License

Private project. See [AGENTS.md](AGENTS.md) for contributor and AI-agent working rules.
