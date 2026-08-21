# Changelog

All notable changes to PromptCrafter AI are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Product Shoot Studio Upgrade: Directorial Controls, Multi-Dialect Deck & Local Persistence** — full commercial director prompt engineering workbench for product video generations:
  - **Directorial Art Direction & Cine Optics** (`components/product-shoot/creative-controls.tsx`): interactive chip rows for Cine Optics & Focal Lengths (24mm Wide, 35mm Commercial, 50mm Natural, 85mm Portrait Hero, 100mm True Macro), Motion Intensity Velocity Scale (1–10 levels: Subtle Drift, Balanced Commercial, Dynamic Reveal, Kinetic Hook), Camera Choreography (Orbit 360°, Macro Dolly-In, Hero Crane, Flatlay, FPV, Whip-Pan, Static), Lighting Design (Chiaroscuro, Softbox, Golden Hour, Cyberpunk Neon, Backlit Rim, Editorial), Surface/Pedestal Materials (Carrara Marble, Wet Obsidian, Concrete, Sand, Titanium, Water Basin, Zero-G), Physics & FX (1000fps Splash Crown, Condensation Mist, Powder Burst, Aromatic Steam, Prisms, Botanicals), Motion Pace (120fps Slow-Mo, 24fps Cinematic, Fast Cut, Hyperlapse), and Human/UGC Interaction (Pure Product, Hands Unboxing, Routine Application, Swatching, UGC Creator).
  - **Sequential Clip Extension & Temporal Chaining Engine** (`lib/product-shoot/types.ts`, `components/product-shoot/creative-controls.tsx`, `components/product-shoot/output-panel.tsx`): target clip duration selector (5s Quick Clip, 10s Extended, 15s 2-Clip Chain, 20s 3-Clip Arc) solving AI video model 5s–10s hallucination limits by generating progressive extension beats with explicit last-frame continuity anchors (`[Last-Frame State Anchor] + [Continuous Camera Vector]`) compatible with Runway/Luma "Extend" and Kling Multi-Prompt Storyboard.
  - **Commercial Audio-Visual Sound Design & Foley Layer** (`lib/product-shoot/dialects.ts`, `components/product-shoot/output-panel.tsx`): isolated tactile product foley prompts (for ElevenLabs SFX), ambient soundscape beds, and background music score prompts (for Suno / Udio) with BPM and mood specs.
  - **Strategic Ad Copy & Voiceover Engine**: Single-Minded Proposition (SMP), 10–15s voiceover script for voice AI generation, and 3-stage On-Screen Text (OST) overlays (0–3s Hook, 3–7s Value, 7–10s CTA).
  - **3-Shot Commercial Campaign Storyboard Mode**: optional production mode generating a sequential 10s commercial arc (Shot 1: 3s Hook Reveal → Shot 2: 4s Sensory Demo → Shot 3: 3s Brand CTA Endframe) with per-shot prompts, audio stingers, and caption overlays.
  - **Multi-Platform Dialect Deck** (`components/product-shoot/output-panel.tsx`, `lib/product-shoot/dialects.ts`): dedicated tailored prompt exports for Runway Gen-3/4 (camera syntax), Kling 1.6/3.0 (temporal & human cues), Google Veo 2/3.1 (optical caustics & physics), Luma Ray 2 (splash collisions & texture), Minimax Hailuo (vibrant social ads), Aspect Variants (16:9, 9:16, 1:1, 4:5), Alternative Concepts, and Negative Constraints.
  - **Single & All-Cards Comparison Grid Views**: focus on single tabs or switch to a responsive comparison grid of all platform cards; inline `Copied ✓` feedback with character counts and "Copy All" batch export.
  - **1-Click Directorial Remix Suggestions**: actionable follow-up prompt pills that immediately apply refinements and regenerate.
  - **Curated Commercial Briefs & Category Chips**: quick category chips and one-click example briefs (Serum, Earbuds, Cold Brew, Luxury Fragrance) via studio header.
  - **Persistent Saved History & 1-Click Reuse Loop** (`lib/product-shoot/storage.ts`, `components/product-shoot/saved-gallery.tsx`): local storage persistence with product thumbnails, search, favorites filter, and one-click "Reuse" restoring full briefs, recipes, and art direction back into the studio.
- **Video Prompt Studio — Phase 1: Foundation** — new data contracts (`VideoProject`, `VideoShot`, `VideoCharacter`, `VideoLocation`, `VideoStyle`, `VideoEffects`, `StoryBible`, `DraftedShot`, `ChatMessage`) in `types/video.ts`; IndexedDB + localStorage persistence layer (`lib/video-storage.ts`); Vercel AI client integration for Gemini and OpenAI-compatible providers (`lib/video-ai.ts`); AI model selector with local override storage and a Gemini default (`components/video-prompt/bootstrap-model-selector.tsx`).
- **Video Prompt Studio — Phase 2: Production Hub** — project dashboard with grid/list view, search, status filters, and quick-delete (`components/video-prompt/project-dashboard.tsx`); project cards show shot count, character count, and relative update time (`project-card.tsx`); new-project modal (`new-project-modal.tsx`); compact studio header with project switcher dropdown (`studio-header.tsx`).
- **Video Prompt Studio — Phase 3: AI Bootstrap Pipeline** — 5-stage wizard (`components/video-prompt/bootstrap-flow.tsx`) that bootstraps the Story Bible from the directorial brief: Script → Characters → Locations → Visual Style (locked on activation) → VFX Direction (locked on activation); each stage has its own dedicated step component, inline AI generation, undo, and a visual progress stepper.
- **Video Prompt Studio — Phase 4: Shot Drafting Chat** — multi-turn conversational thread (`chat-thread.tsx`) using Vercel AI `useChat` + `DefaultChatTransport`; each assistant turn emits a structured `DraftedShot` JSON block with the full 6-part universal prompt (`SUBJECT · ACTION · CAMERA · LIGHTING · ENVIRONMENT · LENS`), continuity handoff, and 8–30s duration; **Approve** promotes the draft into a confirmed `VideoShot` on the storyboard (advancing the scene beat); **Request Revision** re-drafts the same shot number with the full conversation as context; Thinking Orb mirrors Vercel AI status; **Active Project Sidebar** (2-tier lock rules) with style/VFX locked on activation, editable cast and locations panels, and AI-powered location scouting.
- **Video Prompt Studio — Phase 5: Dialect Export & Storyboard Timeline** — deterministic dialect adapters for four AI-video-target models: Veo 3.1 / Flow (structural ingredient tags + motion vectors + duration flag), Higgsfield / Soul ID (narrative prose + `[SoulID: …]` weight tokens), Kling 3.0 (director notes + character physics + multi-shot voice binding + lip-sync cue), and Seedance 2.0 (prompt + `[Ref: shot-N_frame]` placeholder + audio markers) (`lib/video/dialects/`); dialect registry + `formatShotForDialect()` pure router (`lib/video/model-dialects.ts`); arrow-key-accessible dialect chip group (`dialect-tabs.tsx`); storyboard card with live dialect preview and copy-to-clipboard with inline `Copied ✓` feedback (`shot-card.tsx`); sequenced timeline with connector lines, chevron reorder, destructive delete with `ConfirmModal` (mid-chain deletions warn that the handoff breaks), empty state directing back to chat, and `scrollbar-thin` scrolling (`shot-list.tsx`); `rebuildShotContinuity()` helper in `lib/video/story-bible.ts` (renumbers 1..N, preserves promptText/continuityHandoff verbatim, appends a `continuityLog` entry); ShotList wired under the chat column in `project-workspace.tsx`; live shot-count chip in the workspace header.
- **Image Prompt Studio — deep web research** — Image mode generates prompts with deep web research using the configured Gemini or OpenAI-compatible provider; platform dialect cards (DALL-E, Midjourney, Stable Diffusion, Flux, Nano Banana) with copy-all and save-to-gallery.
- **Image Prompt Studio — Logo mode** — brand-identity briefs for logo design with industry presets, mark type, concept, palette, shape language, typography, lockup style, hidden meaning, and usage context; logo-style and logo-concept AI-refreshed examples.
- **AI Elements library** — reusable AI conversation & streaming components (`components/ai-elements/`): Conversation (scroll container + scroll-to-bottom), Message (user / assistant with avatar + toolbar), Reasoning (collapsible thinking-chain), Tool (animated tool-call card), Prompt Input (multi-part composer with actions menu + keyboard shortcuts + streaming-safe textarea), Shimmer (skeleton placeholder), Suggestion (chip card), Code Block (syntax-highlighted code with copy + language selector).
- **Vercel AI SDK integration** — `ai` v7 + `@ai-sdk/react` v4 for chat (`useChat`, `DefaultChatTransport`) and bootstrap streaming; `@ai-sdk/google` for Gemini model resolution; `@ai-sdk/openai-compatible` for any OpenAI-compatible provider.
- **Streamdown** — real-time markdown + code-block + Mermaid streaming renderer with CJK support (`@streamdown/cjk`), code highlighting (`@streamdown/code`), math (`@streamdown/math`), and mermaid (`@streamdown/mermaid`) plugins.
- **Custom chip values + save-for-later in the Image/Logo studios** — every chip-based setting (visual/logo style, lighting, mood, composition, camera, color grade, resolution, aspect ratio, platform dialects, and all logo-only rows: industry, mark type, concept, palette, shape language, typography, lockup, hidden meaning, usage, boldness) gains a trailing "Custom…" trigger that reveals an inline text input, so any value outside the preset list can be typed and used exactly like a preset. Confirmed values render as selected chips (including restored sessions and saved briefs), and an explicit bookmark click persists a value as a bookmarked, deletable chip on that same row for future visits — stored per field and per mode (image / logo / shared) in IndexedDB with a LocalStorage fallback.
- **Custom values for the text studio too** — the Structure (prompt framework) and Tone of voice rows in the text prompt studio get the same "Custom…" entry and save-for-later behavior, with presets stored under a `text` scope so they stay separate from the Image/Logo studios. Custom framework and tone strings flow through generation unchanged.
- **Dynamic hybrid example prompts** — the static example-topic chips in the text, Image, and Logo studios now act as an instant fallback layer that quietly upgrades to AI-refreshed suggestions matched to the current module/domain and whatever settings are already picked (style, lighting, industry, mark type, palette, tone, framework…). Powered by a low-latency Gemini Flash-Lite assist call (`gemini-2.5-flash-lite` with a `gemini-3.x-flash-lite` fallback) that never blocks the primary Generate action, debounced to selection-only changes, cached per option combo, with a manual refresh button.
- **AI-suggested negative prompts** — the Image and Logo studio "Things to avoid" fields gain a one-click Suggest button that generates a brief-specific exclusion list (photorealistic vs. flat-vector vs. lettermark exclusions, keyed to the chosen style, lighting, camera, palette, mark type, usage, typography…) and appends it with `, ` instead of overwriting manual input; failures hide quietly with no error surfaced.
- **Settings-column 3-tier rework** — the Image/Logo prompt form now tiers its settings: Essentials (mode, subject + example chips, style grid, aspect ratio) always visible → a collapsed-by-default "Refine" accordion (platform dialects plus a logo-only "Brand" sub-card grouping industry, wordmark, mark type, concept, and palette) → the existing Art Direction accordion. Logo mode drops from a dozen always-visible controls to four essentials plus two clearly labeled optional panels; open/closed state persists across mode switches.
- **AI-suggested video locations** — ad-hoc location scouting in the Video Studio sidebar that generates set descriptions tailored to the directorial brief.

### Changed

- **Solid brand colour for all primary CTAs** — flattened the `bg-gradient-to-br from-brand to-accent` gradient on every primary button and brand icon tile to a single solid `bg-brand` fill; hover state uses `hover:bg-brand-hover` for proper per-theme darken/lighten. The gradient over the glassy card surface was not clear; the single solid colour reads cleanly in all contexts.

### Fixed

- **Dialect tab and preview IDs are now unique per shot card** — `aria-controls`, `id`, and `aria-labelledby` on the dialect tab chips and preview panel now include the shot's unique suffix (`shot-N`), so HTML validation passes when multiple shots render simultaneously in the storyboard.

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
