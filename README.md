<p align="center">
  <img src="assets/logo.svg" alt="PromptCrafter AI" width="268" />
</p>

<p align="center">
  <em>Atmospheric prompt engineering & optimization — generate, refine, version, test, and measure production-ready AI prompts.</em><br>
  <em>Studio‑grade Image, Logo, Video, and Product Shoot prompt pipelines built in.</em>
</p>

<p align="center">
  <img alt="Version" src="https://img.shields.io/badge/version-1.1.0-6366f1?style=for-the-badge" />
  <img alt="Local‑first" src="https://img.shields.io/badge/local--first-IndexedDB-0064a5?style=for-the-badge" />
  <img alt="Encryption" src="https://img.shields.io/badge/encrypted-AES--GCM-16a34a?style=for-the-badge" />
  <img alt="Providers" src="https://img.shields.io/badge/bring--your--own-model-412991?style=for-the-badge" />
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img alt="Vercel AI" src="https://img.shields.io/badge/Vercel_AI_SDK-ai+%40ai--sdk%2Freact-blueviolet?style=for-the-badge" />
  <img alt="Bun" src="https://img.shields.io/badge/Bun-1.3-000000?style=for-the-badge&logo=bun&logoColor=f9f9f9" />
</p>

**PromptCrafter AI** is an AI‑powered prompt engineering and optimization workbench with four studios: Text Prompt, Image & Logo Prompt, Video Prompt, and Product Shoot.

---

## Table of Contents
- [Why PromptCrafter?](#why-promptcrafter)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Documentation](#documentation)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Privacy & Security](#privacy--security)
- [Scripts](#scripts)
- [Tech Stack](#tech-stack)
- [Known Limitations](#known-limitations)
- [License](#license)

---

## Why PromptCrafter?

Writing great prompts is iterative. PromptCrafter turns that iteration into a structured, *measured* workflow:

1. **Generate** a structured, role‑aware prompt from a short description.
2. **Refine** it conversationally — "make it more concise", "add edge‑case handling" — with the full thread as context.
3. **Version** every change so nothing is ever lost and you can diff, rename, favorite, and roll back.
4. **Test** the final prompt as a system instruction against a sample query, with streaming output, before you use it anywhere.
5. **Measure** — score every version 0‑100 across six quality dimensions, A/B test the same prompt across models, and regression‑test it against a saved suite of inputs so you can *prove* an edit made things better (and catch when it made things worse).
6. **Export** — the Image/Logo studio formats prompts for specific image‑generation platforms; the Video studio formats shots into copy‑ready prompts for Veo 3.1, Higgsfield, Kling, and Seedance.

No accounts, no cloud database, no vendor lock‑in. Your work lives in your browser; your model, your choice.

---

## Quick Start

**Prerequisite:** [Bun](https://bun.sh) ≥ 1.3 (the repo pins `bun@1.3.14`).

```bash
# 1. Install dependencies
bun install

# 2. Configure environment (see below)
cp .env.example .env.local   # then add your GEMINI_API_KEY

# 3. Start the dev server (binds 0.0.0.0, respects PORT)
bun run dev
```

Open the printed URL (default `http://localhost:3000`), pick a domain, describe your goal, and hit **Generate**.

---

## Configuration

### Environment Variables
| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes (for built‑in Gemini) | Google AI Studio / Gemini API key – read **server‑side only**. |
| `APP_URL` | No (for deployments) | Public URL of the app – used for sitemap, OG tags, etc. |

Copy `.env.example` to `.env.local` and fill in the key:

```bash
cp .env.example .env.local
# edit .env.local and set GEMINI_API_KEY=YOUR_KEY
```

---

## Documentation

Feature‑specific documentation lives in the `/docs` folder and is rendered as static pages:
- **[Text Prompt Studio](/docs/text-prompt-studio)** – overview, usage, and advanced tips.
- **[Image & Logo Prompt Studio](/docs/image-logo-studio)** – pipelines, style recipes, and brand workbench.
- **[Video Prompt Studio](/docs/video-prompt-studio)** – story‑bible wizard, shot drafting, and export.
- **[Product Shoot Studio](/docs/product-shoot-studio)** – product‑ad prompt generation.
- **[Measurement & Quality](/docs/measurement-and-quality)** – scoring, A/B testing, regression suite, and cost ledger.
- **[Providers](/docs/providers)** – bring‑your‑own‑model configuration.
- **[Architecture](/docs/architecture)** – project structure and data flow.

Also available:
- **[DESIGN.md](DESIGN.md)** — the canonical visual system: colors, typography, layout, components, and UI rules.
- **[CHANGELOG.md](CHANGELOG.md)** — full version history.
- **[RELEASE_NOTES.md](RELEASE_NOTES.md)** — human‑facing release notes.
- **[RESEARCH.md](RESEARCH.md)** — competitive research and the rationale behind the measurement‑lab features (F1–F6).
- **[`/blog`](app/blog)** — Markdown blog posts with frontmatter (`content/blog/*.md`) covering the measurement loop, comparisons, and releases; `/faq` covers common questions. Both are wired for SEO with `robots.ts`, `sitemap.ts`, OG images, and JSON‑LD, plus an LLM‑friendly index at [`public/llms.txt`](public/llms.txt).

---

## Keyboard Shortcuts
| Shortcut | Action |
|---|---|
| `⌘K` / `Ctrl+K` | Open command palette |
| `⌘/Ctrl+Enter` | Generate / submit refinement |
| `/` | Focus the topic field |
| `Esc` | Close dialogs / palette |
| `Tab` / `Arrow Keys` | Navigate dialect chips in the Video storyboard |

---

## Privacy & Security
- **No accounts, no backend database.** All data lives locally in IndexedDB (with localStorage fallback). 
- **Server‑side Gemini key.** The key is read from `process.env.GEMINI_API_KEY` in API routes only – never sent to the client. 
- **On‑device key encryption.** Custom provider API keys are encrypted with AES‑GCM using a PBKDF2‑derived key before being stored locally. 
- **Provider calls are made directly to the configured endpoint** and consume that provider’s quota; PromptCrafter does not forward requests elsewhere. 
- **Measurement runs locally** and only contacts the providers you have configured.

---

## Scripts

| Command | Description |
|---|---|
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
|---|---|
| Framework | Next.js 15 (App Router) with Turbopack |
| UI | React 19, Tailwind CSS 4, Motion (Framer Motion v12), Lucide icons |
| AI Elements | Vercel AI Elements — `conversation`, `message`, `reasoning`, `tool`, `prompt-input`, `shimmer`, `suggestion`, `code-block` |
| AI Conversations | Vercel AI SDK (`ai` v7 + `@ai-sdk/react` v4) — `useChat`, `useCompletion`, `DefaultChatTransport` |
| Markdown | react-markdown + remark-gfm, Mermaid diagrams, Streamdown (CJK, code, math, math plugins), custom placeholder highlighting |
| UI Primitives | shadcn/ui + Radix UI (`dialog`, `dropdown-menu`, `scroll-area`, `select`, `tooltip`, `separator`, `collapsible`, `hover-card`, `cmdk`) |
| AI | `@google/genai` (Gemini) + `openai` SDK (any OpenAI‑compatible endpoint) |
| Measurement | LLM‑judge scoring with heuristic fallback, deterministic similarity (n‑gram + Jaccard), local pricing/ledger math, dependency‑free SVG sparklines |
| Video Dialects | Deterministic prompt translation adapters for Veo 3.1, Higgsfield / Soul ID, Kling 3.0, and Seedance — plus a 7‑platform knowledge base (adds Runway, Luma, Pika) gating bootstrap and drafting |
| Product Shoot | Streamed multi‑dialect prompt packages for Runway, Kling, Veo, Luma, and Minimax with deterministic output parsing |
| Storage | IndexedDB with localStorage / in‑memory fallbacks, Web Crypto (AES‑GCM) |
| Language | TypeScript (strict) |
| Package manager | Bun |

---

## Known Limitations

- Sessions are tied to the **browser they were created in** – no cross‑device sync yet.
- Custom provider keys are stored client‑side (encrypted) and are sent to your chosen provider at request time.
- Quality scores and cost estimates are **local approximations** – LLM‑judge or heuristic scores, and published list prices – not guarantees of production behavior.
- AI review, A/B tests, and regression runs execute real completions against your configured providers and consume their API quota like any other call.
- Video Prompt Studio dialect adapters are **deterministic re‑formatters** – they translate the stored prompt; they do not generate new content or know the visual grammar of each video model.
- Video Prompt Studio shot drafting uses the same provider as the text studio; bootstrap and chat both consume API quota.
- Image/Logo studio platform dialects are a single best‑effort formatting – they do not cover every provider's parameter syntax or aspect‑ratio constraints.
- Product Shoot Studio reference images are **session‑only** – they are compressed client‑side and are not persisted; saved shoots keep prompt text and metadata (thumbnails are dropped first if storage quota is exceeded).
- The character voice pipeline **prepares** lip‑sync‑ready audio specs – it does not call ElevenLabs/Fish Audio or render audio itself.
- The Reading Progress bar is a simple character‑offset‑based progress bar, not a semantic content‑aware progress indicator.

---

## License

Private project. See [`AGENTS.md`](AGENTS.md) for contributor and AI‑agent working rules.