---
version: alpha
name: PromptCrafter AI
description: Semantic design system for a prompt-generation application with a premium, readable, dark-light interface.
colors:
  surface-page: "oklch(0.97 0.005 260)"
  surface-card: "oklch(1 0 0)"
  surface-elevated: "oklch(0.98 0.01 260)"
  surface-input: "oklch(1 0 0)"
  surface-hover: "oklch(0.94 0.01 260)"
  surface-muted: "oklch(0.94 0.01 260)"
  surface-code: "oklch(0.98 0.005 260)"
  border: "oklch(0.88 0.015 260)"
  border-hover: "oklch(0.6 0.15 270)"
  text-primary: "oklch(0.2 0.02 260)"
  text-secondary: "oklch(0.45 0.03 260)"
  text-muted: "oklch(0.6 0.025 260)"
  brand: "oklch(0.5 0.2 270)"
  brand-muted: "oklch(0.9 0.04 270)"
  success: "oklch(0.55 0.17 160)"
  success-muted: "oklch(0.88 0.06 160)"
  warning: "oklch(0.6 0.15 85)"
  warning-muted: "oklch(0.92 0.06 85)"
  danger: "oklch(0.5 0.18 15)"
  danger-muted: "oklch(0.9 0.04 15)"
typography:
  headline-lg:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  headline-md:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.35
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
    lineHeight: 1.6
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
  page: "24px"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  full: "9999px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  button-secondary:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.text-primary}"
    borderColor: "{colors.border}"
    rounded: "{rounded.md}"
  input:
    backgroundColor: "{colors.surface-input}"
    textColor: "{colors.text-primary}"
    borderColor: "{colors.border}"
    rounded: "{rounded.md}"
  surface-card:
    backgroundColor: "{colors.surface-card}"
    borderColor: "{colors.border}"
    rounded: "{rounded.lg}"
---

## Overview

PromptCrafter AI is a prompt-design workspace for generating, refining, testing, and versioning AI prompts. The product experience should feel premium, responsive, and highly readable without becoming visually noisy or overly decorative.

The design language balances a calm, editorial interface with high-information tool surfaces. It is built for structured tasks like prompt creation, provider configuration, and output comparison, where users need to understand context quickly and act confidently.

## Colors

The palette is built around neutral surfaces, strong contrast for readability, and a single carefully used brand accent. The system intentionally keeps the brand restrained so it can support highly technical content and large generated outputs without overwhelming the user.

- **Primary accent:** brand blue-violet, used for primary actions, active selection, and reinforcing focus states.
- **Surface palette:** off-white to soft neutral backgrounds for page structure and cards.
- **Text palette:** high-contrast text for titles and content, with muted shades for secondary captions and metadata.
- **Feedback colors:** success, warning, and danger are used only for meaningful states, never as decorative accents.

The token set in frontmatter is the normative value source. The dark theme overrides the same semantic values with deeper surfaces while keeping the same design intent.

## Typography

Typography aims for clarity over ornament. The app uses a clean sans-serif system for most UI elements and a monospace stack for generated prompt content and code-like output. This helps distinguish machine-generated content from app UI while preserving a consistent editorial rhythm.

- **Headlines:** bold and compact to provide hierarchy without taking over the interface.
- **Body text:** comfortable line-height for prompt instructions, metadata, and descriptions.
- **Labels:** small uppercase-style emphasis for filters, badges, and metadata.
- **Code/output:** monospace to improve scanning of generated prompt blocks and technical payloads.

## Layout

The layout follows a layered, dashboard-style composition designed to support a task-heavy workflow. Core content is grouped into panels with clear boundaries, while the layout remains compact enough for multi-part prompt editing and comparison.

In the Generator view, the app uses a responsive 12-column grid: a left column for the prompt form and a right column for live output, refinement controls, and version selection. The right output panel is sticky on larger screens so generated results remain visible while the user scrolls through inputs.

The History and Providers views are centered in a narrower content column, with strong surface hierarchy for filters, tables, and form cards. Mobile navigation collapses into a compact menu, while keyboard-first interactions are supported by the command palette and slash/shortcut focus behavior.

The product leans on a consistent spacing rhythm derived from an 8px-inspired scale, using larger gaps for panel separation and smaller ones for component internal spacing. This helps maintain a calm visual cadence across settings, form input, version history, and output panes.

## Elevation & Depth

Depth is created through tonal separation rather than heavy shadowing. The app uses layered surfaces, subtle borders, and minimal contrast shifts to communicate hierarchy and focus. This avoids visual clutter while still preserving a premium feel.

The most elevated elements are reserved for key panels such as the main generator area, prompt output, provider settings forms, and modal overlays. Secondary surfaces remain flatter to keep the interface readable and efficient.

A subtle atmospheric glow and soft radial lighting are used on the page background to reinforce the premium workspace feel without distracting from the content.

## Shapes

The shape language is intentionally simple and modern. Rounded corners are used to soften form controls and cards without making the interface feel playful or overly rounded. The design system favors subtle softness rather than extreme geometry.

This ensures that the UI remains credible and structured while still feeling polished and approachable.

## Components

The system is composed of a limited but consistent set of surface, form, and action primitives that repeat across the application:

- **Buttons:** primary actions use a filled brand treatment; secondary actions use muted surfaces and borders.
- **Inputs:** text fields and textareas use neutral surfaces with border emphasis and focus rings tied to the brand color.
- **Cards and panels:** content containers use surface tokens rather than hard-coded backgrounds.
- **Status badges:** success, warning, and danger tokens are reserved for state communication, not decoration.
- **Output panes:** code-like and markdown output use neutral code surfaces and readable monospace styling.
- **Navigation:** a sticky top bar with tabbed desktop navigation and a mobile dropdown keeps the main workflow accessible at all widths.
- **Command palette:** a keyboard-driven overlay enables quick actions like generating prompts, opening history, and toggling theme.
- **Modal overlays:** the prompt test sandbox uses a two-pane split layout with prompt preview and live streaming AI output.
- **Provider settings:** custom provider forms include secure local key handling and quick endpoint presets for OpenAI-compatible services.

The pattern in the repo is to keep these components shared and semantic, instead of introducing one-off styles at the component level.

## Do's and Don'ts

- Do keep layout hierarchy obvious by using the semantic surface tokens consistently.
- Do preserve high contrast between text and background in both light and dark mode.
- Do use the brand color sparingly for primary actions and active states.
- Do keep output readable with strong spacing and monospace treatment for generated text.
- Don't introduce raw color values ad hoc across components.
- Don't mix decorative color accents with functional semantic states.
- Don't rely on color alone to communicate meaning; pair it with labels, borders, and focus states.
- Don't create custom tokens without first checking whether the existing semantic layer already covers the need.

## Related project files

- [AGENTS.md](AGENTS.md) for contributor and AI-agent working rules
- [app/globals.css](app/globals.css) for the actual semantic token definitions
- [app/layout.tsx](app/layout.tsx) for theme initialization and page root structure
- [app/page.tsx](app/page.tsx) for the high-level application composition and grid layout
- [components/command-palette.tsx](components/command-palette.tsx) for keyboard-first actions and overlay design
- [components/history-panel.tsx](components/history-panel.tsx) for session search, filters, and version management
- [components/provider-settings.tsx](components/provider-settings.tsx) for secure provider onboarding and configuration
- [components/test-prompt-modal.tsx](components/test-prompt-modal.tsx) for the sandbox modal and live prompt execution UI
- [components](components) for the UI implementation patterns that follow the design system
