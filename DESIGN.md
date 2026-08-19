---
name: "Fluid Calm"
description: Semantic design system for PromptCrafter AI, a prompt-engineering workbench. Premium, fluid, calm-dark, keyboard-first, measurement-forward.
colors:
  surface-page: "oklch(0.97 0.005 260)"
  surface-card: "oklch(1 0 0)"
  surface-elevated: "oklch(0.98 0.01 260)"
  surface-input: "oklch(1 0 0)"
  surface-hover: "oklch(0.94 0.01 260)"
  surface-muted: "oklch(0.94 0.01 260)"
  surface-code: "oklch(0.98 0.005 260)"
  surface-sunken: "oklch(0.92 0.01 260)"
  border: "oklch(0.88 0.015 260)"
  border-hover: "oklch(0.6 0.15 270)"
  text-primary: "oklch(0.2 0.02 260)"
  text-secondary: "oklch(0.45 0.03 260)"
  text-muted: "oklch(0.6 0.025 260)"
  brand: "oklch(0.5 0.2 270)"
  brand-hover: "oklch(0.46 0.2 270)"
  brand-active: "oklch(0.42 0.19 270)"
  brand-muted: "oklch(0.9 0.04 270)"
  brand-soft: "oklch(0.92 0.05 270 / 0.55)"
  accent: "oklch(0.6 0.15 230)"
  accent-soft: "oklch(0.9 0.05 230 / 0.5)"
  focus-ring: "oklch(0.5 0.2 270 / 0.45)"
  overlay: "oklch(0.14 0.012 260 / 0.55)"
  success: "oklch(0.55 0.17 160)"
  success-muted: "oklch(0.88 0.06 160)"
  warning: "oklch(0.6 0.15 85)"
  warning-muted: "oklch(0.92 0.06 85)"
  danger: "oklch(0.5 0.18 15)"
  danger-muted: "oklch(0.9 0.04 15)"
  shadow-sm: "oklch(0.2 0.03 270 / 0.06)"
  shadow-md: "oklch(0.2 0.03 270 / 0.09)"
  shadow-lg: "oklch(0.2 0.03 270 / 0.14)"
  shadow-glow: "oklch(0.5 0.2 270 / 0.25)"
  caret: "oklch(0.6 0.2 270)"
  dark-surface-page: "oklch(0.17 0.012 260)"
  dark-surface-card: "oklch(0.2 0.014 260)"
  dark-surface-elevated: "oklch(0.24 0.016 260)"
  dark-surface-input: "oklch(0.14 0.01 260)"
  dark-surface-muted: "oklch(0.24 0.014 260)"
  dark-surface-code: "oklch(0.11 0.008 260)"
  dark-border: "oklch(1 0 0 / 0.10)"
  dark-text-primary: "oklch(0.95 0.005 260)"
  dark-text-secondary: "oklch(0.74 0.02 260)"
  dark-text-muted: "oklch(0.6 0.02 260)"
  dark-brand: "oklch(0.6 0.2 270)"
  dark-accent: "oklch(0.7 0.14 230)"
typography:
  display-lg:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(28px, 4vw, 36px)"
    fontWeight: 750
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  display-md:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(22px, 3vw, 28px)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  headline-lg:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  headline-md:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "-0.01em"
  body-md:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
  label-md:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.08em"
  code-md:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.65
  code-sm:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.6
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
  page: "clamp(16px, 3vw, 32px)"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  xxl: "24px"
  full: "9999px"
motion:
  duration-fast: "120ms"
  duration-base: "200ms"
  duration-slow: "320ms"
  duration-expressive: "500ms"
  easing-standard: "cubic-bezier(0.2, 0, 0, 1)"
  easing-decelerate: "cubic-bezier(0, 0, 0.2, 1)"
  easing-accelerate: "cubic-bezier(0.4, 0, 1, 1)"
  easing-spring: "cubic-bezier(0.34, 1.56, 0.64, 1)"
  stream-caret-blink: "1.1s steps(2, start) infinite"
  shimmer-duration: "1.6s"
components:
  glass-card-standard:
    backgroundColor: "{colors.surface-card}"
    borderColor: "{colors.border}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
    backdropBlur: "20px"
  glass-card-elevated:
    backgroundColor: "{colors.surface-elevated}"
    borderColor: "{colors.border}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xl}"
    backdropBlur: "40px"
  well:
    backgroundColor: "{colors.surface-code}"
    borderColor: "{colors.border}"
    rounded: "{rounded.lg}"
  button-primary:
    backgroundColor: "{colors.brand}"
    hoverBackgroundColor: "{colors.brand-hover}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "12px 16px"
    shadow: "0 8px 24px {colors.shadow-glow}"
    activeScale: "0.985"
  button-secondary:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.text-primary}"
    borderColor: "{colors.border}"
    rounded: "{rounded.md}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.md}"
  input:
    backgroundColor: "{colors.surface-input}"
    textColor: "{colors.text-primary}"
    borderColor: "{colors.border}"
    focusRingColor: "{colors.focus-ring}"
    rounded: "{rounded.md}"
  surface-card:
    backgroundColor: "{colors.surface-card}"
    borderColor: "{colors.border}"
    rounded: "{rounded.lg}"
  chip:
    backgroundColor: "{colors.surface-muted}"
    borderColor: "{colors.border}"
    rounded: "{rounded.sm}"
    fontSize: "{typography.body-sm.fontSize}"
  divider:
    color: "{colors.border}"
    thickness: "1px"
---

## Brand & Style

The system is **Fluid Calm** — the design language for PromptCrafter AI, a personal prompt-development workbench: generate → score → test → refine → compare versions → ship. The UI is an *editor's tool* (like Linear, Raycast, or a well-built code editor) rather than a marketing site: dense but calm, fast to operate, and visually premium.

Three words define the brand:

- **Fluid** — motion that feels alive but never distracting; streaming output that grows without jumping; layouts that respond without reflow.
- **Calm** — a quiet dark-first palette with one brand accent used deliberately; surfaces that separate by tone, not by heavy shadow.
- **Measured** — every screen is built around the measurement loop: scores, diffs, version deltas, and test results are first-class surfaces, not afterthoughts.

The aesthetic is **dark glass**. Layered frosted surfaces float over a deep "ink" canvas (near-black neutral with a barely-there blue tint) warmed by three soft brand-tinted glow orbs. Interface elements act as crystalline lenses — translucent, hairline-edged, softly blurred — focusing attention on the prompt content and its measurements. The emotional register is calm and premium, and the interface never pulses when idle: pulse means "something is happening now", reserved for live generation and tests.

Brand principles:

1. **One accent, used with intent.** Brand blue-violet is for primary actions, active selection, and focus. Everything else earns its color from meaning (success = passes, warning = drift, danger = failures). No decorative rainbows.
2. **Tone, not shadow.** Hierarchy comes from layered surface tones and hairline borders. Shadows are reserved for floating surfaces (menus, modals, sticky bars).
3. **The loop is always visible.** Score, version delta, test status, and diff affordance are visible on the output pane without clicking an accordion. Measurement is ambient, not hidden.
4. **Fluid motion with purpose.** Every animation communicates state. Never animate faster than the user can read, never longer than 500ms, never at all under `prefers-reduced-motion`.
5. **Keyboard-first, mouse-optional.** Every action reachable via ⌘K or a shortcut; every list navigable by arrows; every modal trap-correct.
6. **Private by default, visibly so.** The "saved locally / encrypted" signal stays present but quiet and calm — a status dot + label, not a pulsing badge.

The 2026 UI/UX research and competitive analysis that drive these decisions live in [RESEARCH.md](RESEARCH.md).

---

## Colors

The token set in frontmatter (`colors`) is the normative value source. Both themes remap the same semantic tokens; the light theme is for daylight, **dark is the signature experience** and is perfected first. Dark values are carried under `dark-*` keys.

### Palette philosophy

- **Neutral surfaces** — light: warm-white to soft blue-grey. Dark: layered "ink" neutrals with a barely-there blue tint. Dark surface ladder: `page (deepest) → card → elevated → input → code`. Cards are **lighter** than the page in dark mode; `surface-code` is the darkest token so prompt text reads as a "well".
- **Brand** — blue-violet (`oklch(0.5 0.2 270)` light / `oklch(0.6 0.2 270)` dark). Hover/active steps defined so buttons and links never need hardcoded variants.
- **Accent (aurora cyan)** — used **only** with the brand to form the signature primary-CTA gradient (`brand → accent`) and the streaming glow. Never used for status.
- **Feedback** — success/warning/danger strictly for state: score thresholds (≥75 pass, 50–74 warn, <50 fail), drift alerts, destructive actions.

### Dark surface ladder

| Token | Purpose |
|---|---|
| `surface-page` | page backdrop, deepest |
| `surface-card` | panels, cards (one step lighter than page) |
| `surface-elevated` | menus, popovers, sticky bars (lightest) |
| `surface-input` | form fields (darker than card so fields read as inset) |
| `surface-muted` | chip/inset wells |
| `surface-code` | prompt/output wells (darkest) |
| `border` | `oklch(1 0 0 / 0.10)` — hairline, calm |

### Signature CTA gradient

The primary create/test action uses a restrained two-stop gradient `brand → accent`:

```
background: linear-gradient(135deg, var(--brand), var(--accent));
box-shadow: 0 8px 24px var(--shadow-glow);
```

On hover, both stops brighten; on active, scale to 0.985 and deepen the shadow. Under reduced motion, no scale.

### Light theme

Same semantic tokens; warm-white page and pure-white cards, with `surface-sunken` for wells the code surface sits on. All text meets AA contrast (4.5:1 body, 3:1 large).

---

## Typography

**Inter** for all chrome, the **monospace stack** for prompt content and payloads. Inter's neutral, geometric clarity balances the organic blur of the glass surfaces; mono marks anything that is *content*.

- **Display** — only the intro block, empty states, and marketing pages. Tight tracking, 750 weight, fluid `clamp()`.
- **Headlines** — bold, compact. Headline-lg is the largest size inside panels.
- **Body** — 14px base, 1.6 line-height. Secondary/muted steps for metadata.
- **Labels** — 11px, 600, +0.08em tracking for section labels, badges, table headers.
- **Code** — prompts, output, URLs, model ids, stats. Slightly taller line-height (1.65) so mono blocks breathe.

Rules:

- Numbers/stat blocks use `font-variant-numeric: tabular-nums` so score deltas and token counts don't jitter.
- Prompt content renders mono everywhere it is *content* (output pane, edit mode, sandbox prompt preview) and Inter everywhere it is *chrome*.
- On frosted glass, small labels may carry a subtle text-shadow (`0 2px 4px rgba(0,0,0,0.15)`) so they stay legible over the background glow.
- The word-count/char-count analytics are quiet mono chips, never competing with the score.

---

## Layout & Spacing

An **8px base grid** (`spacing` tokens) governs all dimensions. Elements group into "glass containers" that float inside the safe areas of the viewport, with generous outer margins so the atmospheric background stays visible.

### App shell (`app/page.tsx`)

```
┌────────────────────────────────────────────────────────────┐
│ Navbar (sticky, blur, 64px)                                │
├────────────────────────────────────────────────────────────┤
│ Intro / empty-state band (fluid display type)              │
│                                                            │
│  Create view:   [ Form pane    │ Output pane  ]  ← 12-col  │
│                 [ (4/12→6/12)  │ (6/12→8/12)  ]   grid     │
│  History view:  [ centered max-w-4xl column       ]        │
│  Settings view: [ centered max-w-4xl column       ]        │
│                                                            │
│ Footer (quiet mono status line)                            │
└────────────────────────────────────────────────────────────┘
```

- **Atmosphere:** three soft radial glow orbs (brand-tinted, opacity 15–25%, large blur) drifting very slowly (30–45s) in dark mode only. Never more than two visible on small screens; never competing with content.
- **Intro band:** collapses to a one-line eyebrow + headline on small screens; hidden entirely once a session is active.
- **Sticky output:** the output pane stays `lg:sticky lg:top-[88px]` so streaming stays visible while scrolling the form.
- **Footer:** quiet mono status ("SAVED LOCALLY IN YOUR BROWSER" + ©). The dot is static success; pulse is reserved for live generation states.

### Generator two-pane balance

Desktop: form 6/12, output 6/12 with a **resizable splitter** — a drag handle between panes (`role="separator"`, pointer-drag, `cursor-col-resize`), persisted in `localStorage` under `pc:split`, clamped 24–76%, min 340px each. On `< lg`: single column, form first, output below, handle hidden.

### Density & rhythm

- Panels: 20–24px padding (`p-5 sm:p-6`); between-panel gaps `xl` (24px); internal groups `md–lg`.
- The output pane is the densest surface in the app — it's the work surface.

### Breakpoints

| Breakpoint | Behavior |
|---|---|
| `< 640` | Single column; nav collapses to bottom-anchored tab bar; chips wrap; version strip scrolls horizontally |
| `640–1023` | Two-column form grids; domain cards 4-up |
| `≥ 1024` | Split generator view; sticky output; model switcher visible in nav |
| `≥ 1280` | Full shell; privacy label visible |

`hooks/use-mobile.ts` (768px) is the client-side companion for components that must react to breakpoints imperatively (mobile tab bar, resizable splitter).

---

## Elevation & Depth

Depth is achieved not through darkness but through the **physics of light and refraction** — the glass stack:

- **Level 1 (Base):** deep ink canvas with the three drifting glow orbs.
- **Level 2 (Standard card):** `backdrop-filter: blur(20px)`, surface at `surface-card`, hairline border.
- **Level 3 (Elevated / menus / modals):** `backdrop-filter: blur(40px)`, lightest surface tone, higher shadow.

Rules:

- **Edge definition:** every glass surface carries a 1px hairline border (`border` token; white at ~10% in dark). Elevated surfaces may add a 1px top "shine" highlight (lighter border on top/left) to simulate a light source.
- **Shadows:** only for floating surfaces — sticky bars, dropdowns, palettes, modals, toasts — plus the primary CTA glow. Soft and spread (`shadow-sm/md/lg`, `shadow-glow`); dark-mode shadows read as black at 25–35% alpha with a brand tint for the glow. Never heavier than needed; tone carries hierarchy first.
- **Tonal steps:** hover darkens one step (`surface-hover`); borders tint toward `border-hover`/brand.

---

## Shapes

The shape language is soft-modern and engineered — tighter than everywhere-round to feel precise, not bubbly:

| Element | Radius |
|---|---|
| Inputs, chips, buttons | `rounded.md` — 12px |
| Cards, panels, wells | `rounded.lg` — 16px |
| Hero, empty states, elevated glass | `rounded.xl` — 20px |
| Pills, badges, avatars | `rounded.full` |

Icons are line-based with rounded caps (2px stroke) to match container border weights.

---

## Motion (the fluid layer)

All motion goes through Motion (`motion/react`). Frontmatter `motion` tokens are normative.

### Duration & easing map

| Purpose | Duration | Easing |
|---|---|---|
| Hover/focus/color/border transitions | `duration-fast` (120ms) | `standard` |
| Buttons, chips, small state changes | `duration-base` (200ms) | `standard` |
| Accordions, panels, palette open | `duration-slow` (320ms) | `decelerate` |
| Modal enter/exit, page/tab cross-fades | `duration-expressive` (500ms) | `decelerate` (in) / `accelerate` (out) |
| Modal scale pop, toasts | 300–400ms | `spring` (scale only, `y` uses decelerate) |

### Signature streaming experience

When generation or a test run streams:

1. **Stable container.** The output well reserves min-height; content appends in place. Nothing below the well moves.
2. **Live caret.** A 2px brand block caret (`--caret`) blinks at the end of the streamed text; removed on completion.
3. **Generating chip.** A quiet chip with a slow shimmer sweep over the container edge + spinning refresh icon — no pulsing brand orbs.
4. **Auto-scroll contract.** Follow the stream only while the user is within 60px of the bottom; pause on manual scroll-up; resume on return to bottom; reset per stream (`userScrolled` flag + rAF-flushed DOM writes).
5. **Completion moment.** Caret out; word/char/token chips and version badge fade in (200ms); a quality score, when available, slides into the score rail.

### Layout choreography

- **Tab switches** (Create ↔ History ↔ Settings): 180ms cross-fade + 8px rise; content container only.
- **Grid entrances:** 40ms-per-panel stagger, fade + 8px rise, once per mount.
- **Accordions:** `height: auto` tween (220–320ms) + chevron rotation.
- **Version strip:** 120ms output fade-out/in on version switch.
- **Score rail:** slides up 140ms after version content settles.

### Micro-interactions

- Buttons: `active:scale-[0.985]` on primary only; hover brightness shift on all.
- Cards: lift -2px + border tint on hover; 1px top highlight for the glowing variant.
- Icons: 120ms color transition; chevrons rotate-180 tweened.
- Toasts: spring-scale in from top-right, 4s auto-dismiss, 200ms fade+slide exit.

### Reduced motion

`prefers-reduced-motion: reduce` additionally disables the caret blink, shimmer, orb drift, spring/scale entrances (0ms fades), and draw animations; auto-scroll keeps working but without the smooth glide.

---

## Interaction & States

- **Focus-visible:** 2px ring, `focus-ring` token, offset 2px — on all interactive elements, including selects and checkboxes.
- **Hover:** surfaces darken one step (`surface-hover`); borders tint toward brand.
- **Active/pressed:** primary scale 0.985; secondary darkens.
- **Disabled:** 40–50% opacity, no shadow, `cursor-not-allowed`, label stays legible.
- **Selected:** brand-tinted surface (`brand/10–15`) + brand border + ring; never color alone — paired with a check icon or ring.
- **Errors:** field border + 1px danger ring + helper text; `role="alert"` on the message.

All async work (generate, refine, score, test, suite run, re-verify) follows one pattern:

1. **Initiating** — button swaps to spinner + action label ("Creating…", "Reviewing…").
2. **Running** — progress chip in the surface header + live caret where content streams.
3. **Done** — success chip/toast + result surfaces fade in.
4. **Failed** — inline `role="alert"` error banner in the relevant surface (never a raw `alert()`), danger token, retry affordance where sensible.

Shared rules across components: selection = brand tint + ring + check; chips = `chip` token; color transitions 120ms; disabled states at 40% opacity.

---

## Components

### Glass surfaces

#### `components/glass-card.tsx` — the surface primitive

Motion `div` with variants (default / hoverable / glowing / subtle / **well** / accent) and `backdrop-blur-2xl`. The **well** variant is `bg-surface-code` + hairline border + no shadow for output/code surfaces; **glowing** pulls the brand wash to `brand-muted/40` with a 1px top highlight so it reads as lit, not hazy. Entrances happen once per mount via a `stagger` prop (40ms index delay, total ≤ 320ms); hoverable lifts -2px + border tint. Tokens: `surface-card/80`, `surface-elevated`, `brand-muted`, `border`, `shadow-sm/md`, `rounded-xl`.

#### Output / code wells

The prompt well is the darkest surface (`surface-code`), same radius as its card, reserved min-height, mono content — the "well" the prompt text sits in.

### Navigation

#### `components/navbar.tsx` — app navigation

Sticky 64px bar, blur + `bg-surface-card/80`. Static gradient brand mark (pulse is live-state language — the logo doesn't pulse); wordmark keeps the brand→text gradient. Desktop pill tabs on a `surface-sunken` rail with a **floating indicator**: an animated 200ms sliding pill (LayoutGroup shared layout) behind the active tab. Active tab = `bg-surface-card` + brand text + hairline border, `aria-current` set. Provider pill has a **static green dot** that pulses only while a generation/test runs. Model switcher dropdown truncates long names, shows a Check on the active item, closes on `Escape`. Mobile: a **bottom tab bar** (`fixed bottom-0`, 64px, blur, safe-area padding) — thumb-first, always visible. Tokens: `surface-card/80`, `surface-sunken`, `border`, `brand`, `success`, `text-secondary/muted`.

#### `components/command-palette.tsx` — ⌘K quick actions

Modal with search input, filtered action list, arrow navigation, focus trap, footer kbd hints. Actions grouped (Create / Edit / Navigate / Appearance) with tiny group labels; flat when searching. Recents (last 3, persisted in localStorage). Fuzzy matching with matched-substring highlighting in brand. Spring-scale entrance (300ms), 40ms stagger on list items, 120ms exit. `role="combobox"` + listbox + `aria-activedescendant`; `Escape` closes; body scroll-lock while open. Empty state suggests "Try 'create prompt' or 'open history'". Tokens: `surface-card`, `surface-muted`, `border`, `brand/10`, `focus-ring`, `shadow-lg`.

#### `components/site-header.tsx` & `components/site-footer.tsx` — marketing shell

Sticky header sharing the gradient sparkle mark with Navbar; "Open the app" gets the signature gradient CTA. Mono footer with "Private & local · No account needed". Both server-rendered, class-only. Tokens: `surface-page/85`, `brand`, `border`, `accent`.

### The form

#### `components/prompt-form.tsx` — the input form

Topic textarea (⌘⏎, `/` hints, char counter), DomainSelector embed, custom-domain field, "Style & options" accordion, sticky bottom action bar. The **topic field is the hero input** — larger, `surface-input` inset look, focus ring via token, ⌘⏎ hint as a `<kbd>` chip. Progressive disclosure: the three most important choices (Framework · Tone · Format) are always-visible chips that open the accordion to the right section. Framework cards & tone pills: selected = `brand/15` bg + brand border + ring + check; subtle `scale-[1.02]` hover. Accordions animate height (220ms) + chevron rotation with `aria-expanded`/`aria-controls`. Sticky action bar: blur, `shadow-lg`; summary chips collapse to a single "N options" chip on mobile; CTA is the signature gradient with `active:scale` and ⌘⏎ hint; generation state swaps to "Creating…" + spinner. Tokens: `surface-input`, `surface-muted`, `border`, `brand/15`, `focus-ring`, `accent`, `text-muted`.

#### `components/domain-selector.tsx` — use-case cards

2×2 (mobile) / 4-col grid of icon cards with description + check on selected; "Try an example" chips bar below. Icon tile fills brand on selected; hover raises icon to brand; 120ms transitions (`duration-base`). Example chips are `chip`-token styled with a sparkle icon, animating in with a 30ms stagger on domain change. `role="radiogroup"` with `aria-pressed` and arrow-key navigation. Tokens: `surface-card/50`, `surface-hover`, `brand`, `border`, `warning`, `chip`.

### The work surface

#### `components/prompt-output.tsx` — the heart of the product

- **Header bar:** icon tile, "Your prompt" title, version chip (vN: name), provider line, and a **score rail** — `Quality 87` always visible with a delta chip (▲/▼ vs previous version, green/red). No pulsing while idle.
- **Analytics strip:** word/char/token merged into one quiet mono line + a cost-estimate chip (from the ledger) when available; fades in at stream end.
- **Version strip — a timeline:** v1 leftmost, latest on the right; active = filled brand chip with score badge; hover reveals quick actions (copy, diff). Clicking opens the **version picker popover** ("All versions") with per-version score bars plus a `GitCompare` action per row whose deep-link lands in History's split diff — the diff-first interaction. Scrollable on mobile.
- **Output well:** the stable streaming container — reserved height, live caret, rAF-flushed appends, auto-scroll contract, `aria-live="polite"` + `aria-busy` while streaming; edit mode swaps with a 120ms fade.
- **Scorecard (F1):** slide-down panel with 200ms tween; six dimension bars animate 0→score on open; "Run AI Review" secondary-styled; score source badge ("AI Review" / "Quick Check").
- **Quick-action toolbar:** primary (Copy = gradient CTA), secondary (Test, Edit, Favorite), and a "More" overflow menu (Export, Download MD/JSON, Clear).
- **F4 Placeholder fill:** warning-tinted audit banner, collapsible issues list, 2-col inputs, "Copy with values" = primary.
- **F5 Export:** target chips + preview with a "copied" check state; active target uses brand.
- **F3 Consistency checks:** results matrix with cells colored by pass/fail (success/danger), sticky version column, pass-rate chip per run ("4/5 pass"), animated row expansion.
- **Refine composer:** docked input whose placeholder shows the previous refinement as a hint chip ("Last change: make it more concise").
- **Empty state:** display type + inline SVG sparkle, `rounded-2xl`, centered.
- **A11y:** version strip is a button group with arrow-key nav; score rail announces via live region.
- **Tokens:** `surface-code`, `brand/15`, `success`, `warning`, `danger`, `border`, `shadow-md`, `caret`, `accent`.

#### `components/markdown-renderer.tsx` — rendered prompt content

react-markdown + GFM, mermaid, code blocks with copy buttons, placeholder chip highlighting. **Streaming stability is critical:** during streaming, render raw text incrementally (mono, whitespace-preserved) and only switch to full markdown **when the stream completes** — this eliminates layout jitter. Code blocks get a header bar + copy with `rounded-lg`; tables get hairline borders + sticky headers inside the well; mermaid centers with `max-width: 100%` and a warning-tinted fallback. Tokens: `surface-code`, `surface-muted`, `border`, `brand`, `warning/20`, `success`.

### Testing & history

#### `components/test-prompt-modal.tsx` — sandbox + A/B lab

Full-screen modal, two panes: prompt preview (mono `well`, scrollable) + sample input (min-h 140px, "Use example" quick-fill) + run (signature gradient) on the left; streaming output / comparison grid on the right. A/B lab: provider chips + per-provider model selects, "Compare models (N)" secondary-brand styled, 3-col with ≥3 providers (cap 4). Right pane follows the streaming contract (stable container, live caret, auto-scroll, markdown-after-complete; grid cells append in place). Consistency badge is tone-colored with an explanatory tooltip; A/B result cards have provider color dots + mono model captions, failure cells get danger tint + retry. Spring-scale entrance; body scroll-lock; focus trap + Escape + focus restore. Tokens: `surface-code`, `surface-card`, `brand`, `success/warning/danger`, `accent`, `border`, `shadow-lg`, `caret`.

#### `components/history-panel.tsx` — saved sessions & diff

Header with counts as a mono chip; export/import icon+label buttons; clear-all with confirm modal. Filters: search + domain + favorites in one row (star-filled chip toggle). Session cards expand with a height tween and show a **health dot** on the header (✓ healthy / ⚠ drifted / ✗ broken, from F6 state). Version list: mini quality bar when scored, source icon color by type (initial=brand, refine=accent, manual=warning), hover-reveal copy/test/delete, inline rename. **Diff mode is the flagship:** side-by-side panes (original | newer) with word-level highlights (success = added, danger = removed) *plus* a unified view toggle; auto-selects first vs latest; "Copy diff" and "Open newer in workspace" actions. F6 re-verify renders drift as a warning chip ("82 → 71, drifted") and stable as success, with the "Model changed — recheck" hint in the same row. Diff cells carry text labels, not color alone. Tokens: `surface-card`, `surface-muted`, `brand`, `success/warning/danger`, `border`, `chip`, `shadow-sm`.

#### `components/sparkline.tsx` — ambient charts

Dependency-free SVG sparkline with optional secondary series + gradient, used for score/cost series. The polyline draws itself via a `pathLength` tween (600ms on mount) and the latest-value dot pops in — both skipped under reduced motion. Hover shows a vertical guide + nearest-point marker with a unit-aware value tooltip. Wired into History as the session score-trend block once a session has ≥2 scored versions. `aria-label` + `role="img"`. Tokens: `brand`, `accent`, `warning`, `success` strokes; gradient defs from the same tokens.

#### `components/reading-progress.tsx` — blog reading progress

Fixed top-edge bar (rAF-throttled scroll, `role="progressbar"`) with the brand→accent gradient; the only client island on blog posts.

### Settings & feedback

#### `components/provider-settings.tsx` — AI connections

Header card + quiet info security banner (shield icon, two-line copy); "Add AI service" CTA = gradient primary. Two-column form: preset pills as branded chips with a check on the last-applied; mono model rows with Default badge; temperature slider styled with the brand accent and value in a mono chip. Test connection shows a spinner and reports into a consistent `role="status"` region. Provider cards: glowing active treatment, mono model chips, connection status line ("Service · Streaming/Full response") plus the URL in mono; edit/delete icon buttons with hover tints. Form card slides in (200ms); grid staggers 40ms. Tokens: `brand`, `success/10`, `border`, `surface-muted`, `chip`, `accent`.

#### `components/confirm-modal.tsx` — destructive confirmations

Solid modal with scrim fade (200ms) separate from the card spring-scale (320ms); body scroll-lock; variant-aware icon (danger = alert triangle, warning = alert, info = info); confirm button uses variant token colors; focus trap + `Escape` + focus restore.

#### `components/toast.tsx` — toast host

Top-right stack, 4s auto-dismiss, manual dismiss, `role="status"` / `role="alert"` for errors; spring-scale in (300ms) / fade out (200ms); z-60 above modals; success/error/info variants mapped to semantic tokens. Replaces all raw `alert()` calls (History import errors, version delete errors, provider save errors) and celebrates completions ("Prompt saved", "Version scored 87").

#### `components/tooltip.tsx` — tooltips

Replaces `title` attributes on icon-only buttons: 120ms fade+rise, dark elevated surface, mono or 11px text, `role="tooltip"` via a lightweight wrapper; `title` kept as a fallback.

#### `components/expandable.tsx` — accordion/disclosure

Height `auto` tween (220–320ms) with chevron rotation and `aria-expanded`/`aria-controls`; the shared primitive behind every collapsible section (Style & options, Advanced, F4, F5, F3, FAQ).

#### Loading skeletons

Shimmer block (`shimmer-duration` 1.6s, brand-tinted at 8% opacity) reserving height (no layout shift) for: initial History load, sandbox A/B run, scorecard dimensions while the AI judge runs.

### Static pages

#### `app/blog/*` and `app/faq/*`

Blog index: article cards with hover lift + brand border tint, date + tag chips, server-rendered. Blog post: tuned `.prose` tokens, styled code blocks, reading-progress bar. FAQ: cards as `<details>` accordions with animated height; FAQPage JSON-LD untouched. Tokens: `surface-page`, `surface-card`, `border`, `brand`, `prose` variables.

---

## Accessibility

- **Contrast:** all text ≥ AA (4.5:1 body, 3:1 large); semantic tints always paired with text labels.
- **Focus:** visible 2px ring via `focus-ring` token on all interactive elements; focus order follows the visual layout.
- **Keyboard:** ⌘K palette, `/` topic jump, ⌘⏎ submit, arrows in lists/menus/palette, `Escape` closes overlays; version strip + diff selectors keyboard-reachable.
- **Screen readers:** `aria-live="polite"` on streaming output and status regions; `aria-busy` during generation/test; landmarks present (nav, main, footer); skip link.
- **Motion:** reduced-motion disables caret, shimmer, orb drift, spring scales, and draw animations; state still communicated via color + text.
- **Dialogs:** focus trap + restore, body scroll-lock, correct roles/labels.
- **Forms:** labels bound to controls; error messages in `role="alert"`.
