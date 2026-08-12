# PromptCrafter AI — Release Notes

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
