# Logo-Specific AI-Assisted Features — Implementation Plan

**Status:** Draft — awaiting approval
**Branch:** new feature branch off `main` (do not stack on `feat/ai-assisted-style-generation` — that PR is image/logo-shared `AiConfigAssist` work already merged/in review; this is logo-only, separate surface)

## Problem

1. **Starter-idea mixing risk.** The "New ideas" button (`components/image-prompt/prompt-form.tsx`, `useDynamicExamples` hook) and "Try an example brief" button already route through a `module: 'image'|'logo'|'text'` param and keep separate static fallback pools (`EXAMPLE_TOPICS` vs `LOGO_EXAMPLE_TOPICS`) and separate cache keys — so at the *data* layer they're already isolated. The actual gap: `app/api/suggest-examples/route.ts`'s `SUGGEST_SYSTEM_PROMPT` is one generic instruction shared across all three modules, disambiguated only by a `Module: logo` line in the user message. Nothing in the instruction tells the model logos are vector brand marks (not photography scenes) — so a logo request can drift into image-photography vocabulary ("golden hour", "35mm lens", "cinematic lighting") since the model has no explicit logo-design grounding. Must harden this so logo starter ideas are structurally incapable of reading like image-studio topics.

2. **Missing logo-specific AI assistance.** PromptCrafter already has strong *deterministic* logo infrastructure — `lib/logo-archetypes.ts` (curated brand archetypes), `lib/logo-guidelines.ts` (WCAG contrast + font-pairing spec sheet), `lib/logo-mockups.ts` (mockup prompt templates), `lib/logo-prompts.ts`'s `checkLogoCliches` (static keyword-based cliché scanner) — but only two AI-assisted layers, both shared or narrow: `AiConfigAssist` (shared with image, refine/art-direction option chips) and `runBrandStrategist` (Smart Brand Autopilot — fills brief fields from a brand name). Competitor research (Looka, Brandmark, Design.com) shows two features are now table-stakes and absent here: **AI design-principles critique** (Brandmark's signature differentiator — balance/contrast/scalability feedback) and **AI-reasoned lockup/variation sets** (icon-only, wordmark-only, stacked, horizontal — universal across all three competitors, and PromptCrafter already has the underlying `lockup` field but no assisted reasoning over it).

## Scope

**In scope:**
- Harden `suggest-examples` route with a logo-specific system-prompt branch (no shared photography vocabulary).
- New: **AI Logo Critique** — scores a logo brief/concept against the 7 design principles already referenced in `lib/logo-prompts.ts` comments (simplicity, memorability, versatility, appropriateness, distinctiveness, timelessness, intentional color ≤3), returns actionable feedback. Runs pre-generation (on the brief) since PromptCrafter has no image-vision pipeline for post-generation critique of the rendered PNG.
- New: **AI Lockup/Variation Set Suggestor** — given the approved brief, proposes a coherent set of 3-4 lockup variants (e.g. icon-only for favicon, horizontal lockup for header, stacked for social avatar) with brief-specific reasoning, replacing single-lockup guesswork.

**Out of scope (explicitly, do not implement):**
- AR/voice-controlled design (research trend, not implementable in a static Next.js API — no runtime for it here).
- Competitor-logo web search/analysis (would need image search API PromptCrafter doesn't have; faking it with static heuristics would be dishonest "competitor analysis").
- Post-generation vision critique of the rendered logo PNG (no vision-capable model wired into any existing route; would be a much larger change — flag as a future phase, not this one).
- Full brand-kit template generation (300+ templates like Looka) — `logo-mockups.ts` already covers the mockup-prompt use case at PromptCrafter's actual scale; do not rebuild Looka's template library.

## Approach

### Phase 1 — Harden starter-idea separation (bug-risk close, ~30 min)

**1.1** `app/api/suggest-examples/route.ts` — split `SUGGEST_SYSTEM_PROMPT` into a shared preamble + per-module closing constraint:
```ts
const SUGGEST_SYSTEM_PROMPT_BASE = `You are an example-topic curator for PromptCrafter's prompt studio. Given the module and the user's current settings, suggest N short, concrete, varied example prompts (subjects/topics) that a user could click to fill the main input. Each must be a single line, 6-18 words, no numbering, no quotes, no markdown. They must make sense with the settings already chosen. If no settings are selected yet, return generically strong examples for the module/domain like a curated static list would. Respond with ONLY the examples, one per line, no commentary.`;

const MODULE_CONSTRAINTS: Record<'text' | 'image' | 'logo', string> = {
  text: '',
  image: ' Examples describe photographic/illustrated scenes: subject + action + setting (e.g. lighting, camera angle, mood) — never brand-identity or logo language.',
  logo: ' Examples are brand-mark concepts for a VECTOR LOGO, never a photographed scene: name the business/brand type + a distinctive visual concept (e.g. "Wordmark for an artisan bakery using a rising-steam ligature", "Geometric monogram for a fintech app, navy and gold"). NEVER use photography vocabulary (lighting, camera, lens, golden hour, cinematic) — logos are flat vector marks, not photographs.',
};
```
Build the system prompt per-request: `SUGGEST_SYSTEM_PROMPT_BASE + MODULE_CONSTRAINTS[mode]`.

**1.2** Verify no regression: existing `buildContextDigest` already branches on `body.module === 'logo'` for `input.logoStyle` vs `input.style` — untouched.

**1.3** Manual verification: hit `/api/suggest-examples` with `module: 'logo'`, confirm zero photography terms in response (grep for `lighting|camera|lens|golden hour|cinematic` in returned examples — should be empty).

### Phase 2 — AI Logo Critique (~2-3 hrs)

**2.1** New type in `types/index.ts` (additive, follows `ImageConfigAssistResponse` pattern):
```ts
export interface LogoCritiqueRequest {
  input: ImagePromptInput; // reuse existing brief shape, logo fields only
}

export interface LogoPrincipleScore {
  principle: 'simplicity' | 'memorability' | 'versatility' | 'appropriateness' | 'distinctiveness' | 'timelessness' | 'colorDiscipline';
  score: number; // 0-100
  feedback: string; // 1-2 sentence actionable note
}

export interface LogoCritiqueResponse {
  overallScore: number; // 0-100, mean of principle scores
  principles: LogoPrincipleScore[];
  topRecommendation: string; // single highest-leverage fix
}
```

**2.2** New route `app/api/logo-critique/route.ts` — mirror `app/api/image-config-assist/route.ts` structure exactly (same `ASSIST_PROVIDER`-style builtin-Gemini-lite provider, `withTimeout`, try/catch-never-500 pattern). System prompt grounds the model in the 7 principles (reuse the doc comment already in `lib/logo-prompts.ts` lines 17-24 as the principle definitions verbatim — single source of truth, don't redefine elsewhere). Parse response defensively (same `parseFieldsResponse`-style guard: unknown/malformed JSON → `null`, client shows nothing rather than garbage).

**2.3** `lib/ai-client.ts` — add `getLogoCritique(request): Promise<LogoCritiqueResponse | null>`, same shape as `getImageConfigAssist` (try/catch, `res.ok` guard, never throws to caller).

**2.4** New component `components/image-prompt/logo-critique-panel.tsx` — button "Critique this brief" (reuses `Sparkles` icon + brand-gradient button styling from `ai-config-assist.tsx`'s idle-state button verbatim), renders a compact score row per principle (reuse `ProgressBar`/color-threshold pattern already established in `app/page.tsx` for prompt quality: green ≥80, yellow 50-79, red <50 — do not invent a new color scheme) plus the single `topRecommendation` in a callout. Wire into `art-direction.tsx` or `prompt-form.tsx` logo branch only — gate with `isLogo` the same way `checkLogoCliches` is already gated.

**2.5** Verification: live curl against the new route with a real logo brief containing an obvious cliché (e.g. subject mentioning "globe" or "chat bubble" — should score low on `distinctiveness` and `appropriateness`); confirm scores are internally consistent (not all 100 regardless of input) and `topRecommendation` is non-generic.

### Phase 3 — AI Lockup/Variation Set Suggestor (~2-3 hrs)

**3.1** New types in `types/index.ts`:
```ts
export interface LogoVariationRequest {
  input: ImagePromptInput;
}

export interface LogoVariationSuggestion {
  lockupType: string; // matches existing LOGO_LOCKUP_PRESETS ids where possible
  useCase: string; // e.g. "Favicon / app icon", "Email signature", "Social avatar"
  reasoning: string; // why this lockup suits this specific brief
}

export interface LogoVariationResponse {
  variations: LogoVariationSuggestion[] | null; // null = model/parse failure, client shows nothing
}
```

**3.2** New route `app/api/logo-variations/route.ts` — same builtin-Gemini-lite pattern as Phase 2. Prompt: given the brief (brand name, industry, mark type, concept), propose 3-4 lockup variants from the existing `LOGO_LOCKUP_PRESETS` domain (pass the preset id list into the prompt so the model picks from real, renderable options — do not let it invent lockup types the UI can't act on) with a one-line reasoning each and the real-world use case it solves.

**3.3** `lib/ai-client.ts` — add `getLogoVariations(request): Promise<LogoVariationResponse>`.

**3.4** UI: extend the existing lockup field row in `art-direction.tsx` (logo branch) with a "Suggest variation set" trigger next to it (reuse the `RefreshCw`/re-roll button visual pattern from `AssistFieldRow` in `ai-config-assist.tsx`, but this is a distinct action — generates a *set*, not a re-roll of one field). Clicking a suggested variation applies its `lockupType` via the existing `handlers.setLockup`-equivalent setter (confirm exact setter name in `studio-types.ts` `StudioFormHandlers` before wiring — do not invent a new one if one already exists).

**3.5** Verification: live curl confirms returned `lockupType` values are always members of `LOGO_LOCKUP_PRESETS` ids (hard assertion in the route's parser — reject/drop any suggestion whose `lockupType` isn't in the known preset list, same defensive pattern as `parseFieldsResponse`'s field-key filtering).

## Critical Files & Anchors

| File | Change |
|---|---|
| `app/api/suggest-examples/route.ts` | Split system prompt, add `MODULE_CONSTRAINTS` |
| `types/index.ts` | Add `LogoCritiqueRequest/Response`, `LogoVariationRequest/Response` (additive only) |
| `app/api/logo-critique/route.ts` | New file, mirrors `image-config-assist/route.ts` structure |
| `app/api/logo-variations/route.ts` | New file, same pattern |
| `lib/ai-client.ts` | Add `getLogoCritique`, `getLogoVariations` |
| `components/image-prompt/logo-critique-panel.tsx` | New component |
| `components/image-prompt/art-direction.tsx` | Wire critique panel + variation suggestor into logo branch |
| `lib/logo-prompts.ts` | Read-only: source of truth for the 7 design principles' definitions (lines 17-24) and `LOGO_LOCKUP_PRESETS` ids — reused, not duplicated |

## Non-negotiable constraints (carried from AGENTS.md + prior session decisions)

- Every new AI route follows the existing "never a 500, always fall back gracefully" pattern (`image-config-assist`/`suggest-examples` precedent) — a critique/variation failure must never block the logo workflow.
- Builtin-Gemini-lite provider only for these assist calls (never the user's configured generation provider) — matches `ASSIST_PROVIDER`/`SUGGEST_PROVIDER` precedent exactly.
- No new types file — everything additive in `types/index.ts`.
- Reuse existing color-threshold/badge/button visual patterns (`ai-config-assist.tsx`, `prompt-output.tsx`, `app/page.tsx`'s ProgressBar) — no new design language introduced.
- Logo variation suggestions are constrained to real `LOGO_LOCKUP_PRESETS` ids — never let the model hallucinate an unrenderable lockup type.

## Verification Plan

1. `bun tsc --noEmit` after each phase — zero new errors.
2. `bun run build` after all phases — compiles clean.
3. Phase 1: curl `/api/suggest-examples` with `module: 'logo'`, grep response for photography vocabulary — must be empty.
4. Phase 2: curl `/api/logo-critique` with a cliché-heavy brief — confirm low scores on relevant principles, non-generic `topRecommendation`.
5. Phase 3: curl `/api/logo-variations` — confirm every `lockupType` is a real `LOGO_LOCKUP_PRESETS` id.
6. Browser smoke test (headless `browser` tool, same approach as prior AI-config-assist verification): open Logo studio, trigger critique panel and variation suggestor, confirm DOM renders scores/badges/reasoning with no console errors.
7. Confirm zero changes bleed into the image-mode branches of any shared component (`art-direction.tsx`, `prompt-form.tsx`) — logo-only gating via `isLogo`, same as existing `checkLogoCliches` precedent.

## Open Questions for Approval

1. Phase 2 critique runs pre-generation on the brief text only (no vision model available). Confirm this is acceptable scope, vs. deferring to a future phase once a vision-capable model is wired in for post-generation PNG critique.
2. Phase 3's variation UI placement — inline next to the existing lockup `ChipRow` in `art-direction.tsx`, or as a separate expandable panel like `AiConfigAssist`. Recommend inline (smaller feature, doesn't need its own section).
3. Should Phase 1's system-prompt hardening also apply a `text` module constraint string, or leave it empty (as drafted) since the reported bug is specifically image/logo mixing? Recommend leaving `text: ''` — no evidence of a text-module mixing issue.
