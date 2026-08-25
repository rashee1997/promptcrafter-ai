---
name: "Clean Minimal"
description: Semantic design system for PromptCrafter AI, focused on a modern, standard, fluid, responsive, and uncluttered interface. High legibility, flat surfaces, ample whitespace, and minimal visual noise.
colors:
  surface-page: "oklch(0.99 0.0 0)"
  surface-card: "oklch(1.0 0.0 0)"
  surface-elevated: "oklch(1.0 0.0 0)"
  surface-input: "oklch(0.98 0.0 0)"
  surface-hover: "oklch(0.97 0.0 0)"
  surface-muted: "oklch(0.96 0.0 0)"
  surface-code: "oklch(0.97 0.0 0)"
  surface-sunken: "oklch(0.96 0.0 0)"
  border: "oklch(0.90 0.0 0)"
  border-hover: "oklch(0.80 0.0 0)"
  text-primary: "oklch(0.15 0.0 0)"
  text-secondary: "oklch(0.40 0.0 0)"
  text-muted: "oklch(0.55 0.0 0)"
  brand: "oklch(0.0 0.0 0)" # Vercel-like black for primary CTA in light mode
  brand-hover: "oklch(0.2 0.0 0)"
  brand-active: "oklch(0.3 0.0 0)"
  brand-muted: "oklch(0.95 0.0 0)"
  brand-soft: "oklch(0.95 0.0 0)"
  accent: "oklch(0.5 0.15 260)" # Blue accent for active states/links
  accent-soft: "oklch(0.9 0.05 260)"
  focus-ring: "oklch(0.5 0.15 260 / 0.5)"
  overlay: "oklch(0.0 0.0 0 / 0.4)"
  success: "oklch(0.60 0.15 150)"
  success-muted: "oklch(0.95 0.05 150)"
  warning: "oklch(0.70 0.15 70)"
  warning-muted: "oklch(0.98 0.05 70)"
  danger: "oklch(0.60 0.20 25)"
  danger-muted: "oklch(0.97 0.05 25)"
  shadow-sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)"
  shadow-md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
  shadow-lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)"
  shadow-glow: "none"
  caret: "oklch(0.0 0.0 0)"
  dark-surface-page: "oklch(0.12 0.0 0)"
  dark-surface-card: "oklch(0.15 0.0 0)"
  dark-surface-elevated: "oklch(0.18 0.0 0)"
  dark-surface-input: "oklch(0.10 0.0 0)"
  dark-surface-muted: "oklch(0.18 0.0 0)"
  dark-surface-code: "oklch(0.10 0.0 0)"
  dark-border: "oklch(0.25 0.0 0)"
  dark-border-hover: "oklch(0.35 0.0 0)"
  dark-text-primary: "oklch(0.95 0.0 0)"
  dark-text-secondary: "oklch(0.70 0.0 0)"
  dark-text-muted: "oklch(0.55 0.0 0)"
  dark-brand: "oklch(1.0 0.0 0)" # White for primary CTA in dark mode
  dark-brand-hover: "oklch(0.9 0.0 0)"
  dark-accent: "oklch(0.65 0.15 260)"
typography:
  display-lg:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(28px, 4vw, 36px)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  display-md:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(22px, 3vw, 28px)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  headline-lg:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  headline-md:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  body-md:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
  label-md:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0"
  code-md:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.6
  code-sm:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.6
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
  page: "clamp(16px, 4vw, 40px)"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  xxl: "16px"
  full: "9999px"
motion:
  duration-fast: "100ms"
  duration-base: "150ms"
  duration-slow: "200ms"
  duration-expressive: "300ms"
  easing-standard: "ease-in-out"
  easing-decelerate: "ease-out"
  easing-accelerate: "ease-in"
  stream-caret-blink: "1s steps(2, start) infinite"
  shimmer-duration: "1.5s"
components:
  card-standard:
    backgroundColor: "{colors.surface-card}"
    borderColor: "{colors.border}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
    shadow: "{colors.shadow-sm}"
  card-elevated:
    backgroundColor: "{colors.surface-elevated}"
    borderColor: "{colors.border}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xl}"
    shadow: "{colors.shadow-lg}"
  well:
    backgroundColor: "{colors.surface-code}"
    borderColor: "{colors.border}"
    rounded: "{rounded.md}"
  button-primary:
    backgroundColor: "{colors.brand}"
    hoverBackgroundColor: "{colors.brand-hover}"
    textColor: "{colors.surface-page}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    shadow: "none"
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
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.text-primary}"
    borderColor: "{colors.border}"
    focusRingColor: "{colors.focus-ring}"
    rounded: "{rounded.md}"
  chip:
    backgroundColor: "{colors.surface-muted}"
    borderColor: "{colors.border}"
    rounded: "{rounded.full}"
    fontSize: "{typography.body-sm.fontSize}"
  divider:
    color: "{colors.border}"
    thickness: "1px"
---

## Brand & Style

The system is **Clean Minimal** — a modern, standard, fluid, responsive, and uncluttered interface. It removes visual noise, heavy shadows, intense blurs, and gradients, in favor of a crisp, flat aesthetic optimized for readability and fast interactions (inspired by Vercel, Linear, and Shadcn).

Three words define the brand:

- **Uncluttered** — High use of whitespace. Elements are spaced generously. Borders are subtle. No unnecessary embellishments.
- **Responsive** — Fluid layouts that scale down gracefully without breaking or overlapping. Components adapt naturally to their container size.
- **Standard** — Familiar, accessible patterns. Buttons look like buttons. Inputs have clear boundaries. Predictable hover and focus states.

The aesthetic is **flat and crisp**. Surfaces are separated by subtle 1px borders and very light shadows rather than deep drop shadows and blurs.

Brand principles:

1. **Monochrome primary, distinct accent.** Primary actions (like 'Create' or 'Save') use high-contrast monochrome (Black in light mode, White in dark mode). A distinct accent color (blue) is used for active states, links, and focus rings.
2. **Structure via borders, not just backgrounds.** Use 1px borders (`border` token) to define cards and sections, keeping backgrounds mostly unified.
3. **Data is the hero.** The UI should fade into the background. The user's prompt text and the AI output are the most important elements on the screen.
4. **Snappy motion.** Animations are short (150ms-200ms) and serve a functional purpose (like expanding a section). No slow, drifting decorative animations.
5. **Less is more.** Remove unnecessary icons, glowing effects, and heavy gradients.

---

## Colors

The design is built on a clean greyscale foundation with semantic colors used strictly for status.

- **Neutral surfaces** — Light mode is crisp white and very light gray. Dark mode is deep, solid gray (no blue/purple tints).
- **Brand** — Black (light mode) / White (dark mode) for the strongest emphasis.
- **Accent** — A clear blue for links, active selections, and focus rings.
- **Feedback** — Green for success, Yellow/Orange for warning, Red for danger.

---

## Typography

**Inter** for all UI text, **monospace** for all prompt/code content.

- Weights are slightly lighter than before (600 for headlines instead of 700/750).
- Letter spacing is more natural.
- Line heights are optimized for dense reading (1.6 for body).

---

## Layout & Spacing

- **Less dense.** We use slightly larger paddings and gaps to reduce visual clutter.
- **Fluid containers.** Use max-widths and auto margins to center content gracefully.
- Remove complex sticky layouts if they overlap and clutter the screen on smaller devices.

---

## Elevation & Depth

- **Level 1 (Base):** Page background (`surface-page`).
- **Level 2 (Standard card):** Card background (`surface-card`), 1px border, very subtle shadow.
- **Level 3 (Elevated / modals):** Modals use a slightly larger shadow (`shadow-lg`). No background blurs.

---

## Shapes

- Radii are smaller and more "engineered".
- Buttons and inputs: `rounded-md` (6px).
- Cards: `rounded-lg` (8px).
- Modals: `rounded-xl` (12px).
- Chips: `rounded-full` for a distinct pill shape.

---

## Motion

- Fast, snappy, standard eases.
- Removed all "drifting glow orbs" and slow pulsing effects.
- Transitions on hover/focus are standard 150ms.

---

## Interaction & States

- **Focus:** Sharp 2px solid ring, offset 2px.
- **Hover:** Backgrounds darken slightly (`surface-hover`); borders become slightly more visible.
- **Active:** Buttons slightly depress or change background, no extreme scaling.
- **Disabled:** 50% opacity, `cursor-not-allowed`.
