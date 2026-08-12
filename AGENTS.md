# PromptCrafter AI Agent Guide

You are a careful, pragmatic coding agent. Keep changes small, follow existing patterns, and avoid broader refactors unless the user explicitly asks for them.

## Project snapshot

- Next.js 15 app using the App Router.
- Main UI flow lives in `app/page.tsx` and the reusable UI in `components/`.
- The visual system and UI direction are documented in `DESIGN.md`; follow it as the canonical source for styling, layout, sizing, and component behavior.
- Domain-specific prompt generation logic and provider integrations live in `lib/`.
- Persistent session/provider state is handled in `lib/storage.ts` using IndexedDB with LocalStorage fallbacks.
- Shared TypeScript contracts live in `types/index.ts`.
- AI requests are streamed through `lib/ai-client.ts` and API routes under `app/api/*`.

## Default working rules

- Prefer the smallest possible edit that matches the surrounding code style.
- Keep naming and structure aligned with neighboring files.
- Use TypeScript types from `types/index.ts` instead of introducing ad hoc shapes.
- Prefer existing utility patterns and imports over new abstractions.
- Use the `@/` alias for internal imports.
- Preserve backward compatibility for persisted session/provider data when changing storage schemas.
- Do not hardcode secrets or provider credentials. Use environment variables and existing config patterns.
- If a change affects user data or migration logic, verify the storage fallback behavior in `lib/storage.ts`.

## Local commands

This project is managed with **Bun** (the repo ships a `bun.lock`). Use the repo scripts from `package.json` via `bun run`:

```bash
bun install
bun run dev
bun run build
bun run lint
```

This repository does not currently define a formal test suite. Validate changes with lint and a manual app check when behavior is user-facing.

## Architecture notes

### App flow

- `app/page.tsx` owns the main state for active provider, sessions, generation flow, and modal interactions.
- `components/` contains form, output, history, provider settings, and modal UI.
- `lib/ai-client.ts` wraps streaming fetches to the API endpoints.
- `app/api/*/route.ts` handle generation, refinement, and test execution requests.

### Storage and persistence

- `lib/storage.ts` is the source of truth for persisted sessions and provider configs.
- The app uses IndexedDB when available and falls back to LocalStorage.
- Migration behavior is intentionally handled in this file; do not bypass it.

### Prompt generation and domain presets

- `lib/domains.ts` defines prompt domains and presets.
- `lib/prompt-stats.ts` calculates prompt statistics.
- `types/index.ts` defines the session and provider contracts used across the app.

## Editing guidance

- Match the nearest existing component or utility before editing.
- Use `DESIGN.md` as the source of truth for UI, spacing, typography, color, and component patterns before changing visuals or layout.
- Keep state updates and async flows consistent with the current patterns in `app/page.tsx`.
- For UI behavior, prefer local state patterns already used by the app instead of adding new architecture.
- When adding new provider settings, keep the built-in Gemini default working and ensure the new config remains compatible with the UI and storage model.
- Avoid broad cleanup or rename refactors unless explicitly requested.

## Verification before completion

- Run `bun run lint` after changing TypeScript or UI code.
- Run `bun run build` for user-facing behavior or route changes.
- If the change touches storage, verify the app still loads and sessions/providers remain readable after a reload.

## If you are unsure

- Read the nearest related file before changing behavior.
- Prefer a targeted fix over a broad rewrite.
- Ask for confirmation before making a behavioral change that could affect user data or app flow.
