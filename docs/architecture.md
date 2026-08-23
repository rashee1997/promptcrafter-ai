---
title: "Architecture"
description: "Project structure and data flow for PromptCrafter AI."
---
# Architecture

The project uses **Next.js 15** App Router with Turbopack for fast builds. The top‑level layout (`app/layout.tsx`) provides global theme init, metadata, and a minimal CSS reset.

**Directory layout**
```
app/
  page.tsx                 # Main app entry, state, generation flow, views, modals
  layout.tsx               # Root layout, theme init, metadata + JSON‑LD
  globals.css              # Tailwind + design tokens (light/dark), scrollbar‑thin
  blog/                    # Blog index + static post pages (content/blog/*.md)
  faq/page.tsx            # FAQ page with JSON‑LD
  robots.ts / sitemap.ts   # robots.txt + sitemap.xml (incl. AI‑crawler allow rules)
  api/
    generate/route.ts      # POST — stream a new engineered prompt
    refine/route.ts        # POST — stream a refined prompt with thread context
    test-prompt/route.ts   # POST — run a prompt as a system instruction (streamed)
    evaluate/route.ts      # POST — F1 LLM‑judge prompt quality (heuristic fallback)
    evaluate-output/route.ts # POST — F3/probes: execute a prompt on a case + judge output
    ab-test/route.ts       # POST — F2 parallel completions across providers + consistency score
    image-prompt/route.ts  # POST — Image/Logo prompt generation (streamed)
    image-prompt-redo/route.ts # POST — regenerate a dialect section of an image prompt
    image-to-prompt/route.ts # POST — reverse‑engineer a prompt from an uploaded image
    image-edit-prompt/route.ts # POST — revise an existing image prompt from feedback
    image-style-template/route.ts # POST — AI‑assisted style recipe / logo archetype generation
    brand‑strategist/route.ts # POST — Logo Studio 2.0 Smart Brand Autopilot strategist
    suggest-examples/route.ts # POST — AI‑refreshed example‑topic suggestions (hybrid prompts)
    suggest‑negative‑prompt/route.ts # POST — AI‑suggested negative prompt for Image/Logo
    suggest‑video‑location/route.ts # POST — AI‑suggested location for Video Prompt Studio
    video‑bootstrap/route.ts # POST — single‑stage Video Prompt Studio bootstrap (story → VFX)
    video‑chat/route.ts    # POST — Video shot‑drafting chat (Vercel AI streamText)
    video‑character‑image‑prompt/route.ts # POST — character reference‑image prompt generation
    product‑shoot/route.ts # POST — Product Shoot Studio prompt package generation
```

**Data flow highlights**
- **Text Prompt Studio**: UI → `lib/ai-client.ts` → API routes → provider SDK (Gemini or OpenAI‑compatible) → streamed text back to the UI → `lib/storage.ts` (IndexedDB). Scoring (F1), case evaluation (F3/probes), and A/B runs (F2) use shared non‑streaming completions via `lib/server-completion.ts`; the cost ledger and placeholder/export transforms are computed entirely on‑device.
- **Video Prompt Studio** follows a similar pattern but adds a deterministic bootstrapping wizard (`app/api/video-bootstrap`) and a shot‑drafting chat (`app/api/video-chat`). The resulting `VideoShot` objects are stored locally and exported on demand — no extra network calls.
- **Product Shoot Studio** invokes a single streamed API call (`app/api/product‑shoot`) and parses per‑platform dialect cards client‑side.

All cross‑cutting features (measurement, providers, AI Elements UI components, keyboard shortcuts) share the same storage layer (`lib/storage.ts`) and reusable UI primitives from `components/ui/`.
