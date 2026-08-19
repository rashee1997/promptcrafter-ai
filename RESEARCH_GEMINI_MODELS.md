# PromptCrafter — Gemini API Model Research

> Web research conducted August 2026. Source: Google's official Gemini API
> model catalog (ai.google.dev/gemini-api/docs/models). This research drove the
> built-in Gemini provider's expanded model selector: latest stable models,
> frontier previews, and a proven fallback tier, all selectable from the UI.

## 1. Model availability (August 2026)

Google groups Gemini API models into **stable**, **preview**, **latest**, and
**experimental** release tracks. Stable models are production-safe; preview
models may carry tighter rate limits and get deprecated with ~2 weeks notice;
the `latest` alias hot-swaps with each release.

### Stable — current generation (Gemini 3.x)

| Model | Endpoint | Notes |
|---|---|---|
| Gemini 3.7 Flash | `gemini-3.7-flash` | Newest, most capable Flash — complex coding, agentic workflows |
| Gemini 3.6 Flash | `gemini-3.6-flash` | Previous-gen Flash — speed + multimodal, our default |
| Gemini 3.5 Flash | `gemini-3.5-flash` | Legacy Flash — baseline speed for routine work |
| Gemini 3.5 Flash-Lite | `gemini-3.5-flash-lite` | Fastest cost-effective 3.x model |
| Gemini 3.1 Flash-Lite | `gemini-3.1-flash-lite` | Frontier-class performance at low cost |

### Frontier previews

| Model | Endpoint | Notes |
|---|---|---|
| Gemini 3.1 Pro | `gemini-3.1-pro-preview` | Advanced reasoning, agentic + "vibe coding" |
| Gemini 3 Flash | `gemini-3-flash-preview` | Frontier-class performance at Flash cost |

### Fallback tier — proven 2.5 family (stable)

| Model | Endpoint | Notes |
|---|---|---|
| Gemini 2.5 Pro | `gemini-2.5-pro` | Deep reasoning — most advanced of the 2.5 family |
| Gemini 2.5 Flash | `gemini-2.5-flash` | Best price-performance for high-volume tasks |
| Gemini 2.5 Flash-Lite | `gemini-2.5-flash-lite` | Fastest, most budget-friendly multimodal model |

### Excluded / deprecated

- **Shut down:** `gemini-2.0-flash`, `gemini-2.0-flash-lite`,
  `gemini-3.1-flash-lite-preview`, `gemini-3-pro-preview` — removed from the
  selector to avoid dead endpoints.
- **Image-only models** (Nano Banana 2 `gemini-3.1-flash-image`, Nano Banana
  Pro `gemini-3-pro-image`, etc.) — the built-in provider generates **text**
  prompts (system prompts, refinements, image *prompt* briefs), so image
  endpoints are intentionally not offered as chat models.
- **Specialized models** (TTS, Live, Embedding, Robotics, Deep Research,
  Veo) — out of scope for a text-generation workbench.

## 2. What changed in the app

| Research finding | App change |
|---|---|
| The built-in provider exposed a single model (`gemini-3.6-flash`) | New `GEMINI_MODEL_LIST` in `lib/storage.ts` — 10 curated models across the three tiers above, wired into the built-in provider's `models` |
| Users could not pick a different Gemini model | The existing model selector (navbar switcher, generator/studio action bars, provider settings, A/B lab) now lists every model; selection persists per provider |
| Default must stay reliable | `GEMINI_DEFAULT_MODEL = 'gemini-3.6-flash'` stays the default; `activeModel` pins it so the dropdown order never silently changes what fresh users get |
| Fallback models should be reachable when the newest model rate-limits or fails | The 2.5 family (Pro / Flash / Flash-Lite) is included as a proven fallback tier, one click away in the selector |
| Hardcoded `'gemini-3.6-flash'` fallbacks across API routes | All server fallbacks (`/api/generate`, `/api/refine`, `/api/test-prompt`, `/api/image-prompt`, `server-completion.ts`) now import `GEMINI_DEFAULT_MODEL` — one source of truth |
| Cost ledger treated every Gemini model the same | `lib/model-pricing.ts` gained per-family estimates (2.5 Pro / Flash / Flash-Lite, 3.x Flash, 3.1 Pro, 3.x Lite) so cost-per-quality numbers stay meaningful |

## 3. Sources

- Google AI for Developers — "Models | Gemini API" — ai.google.dev/gemini-api/docs/models (accessed Aug 2026)
- Google AI for Developers — "Gemini API release notes / changelog" — ai.google.dev/gemini-api/docs/changelog
