# PromptCrafter AI — Release Notes

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
