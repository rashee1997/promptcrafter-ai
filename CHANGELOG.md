# Changelog

All notable changes to PromptCrafter AI are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
