# PromptCrafter — Image Prompt Studio UX Research

> Web research conducted August 2026. Scope: UI/UX patterns for AI prompt tools and
> image-generation platforms — output presentation, copy behavior, galleries/history.
> This research drove the studio's card-based output redesign and the gallery upgrade.

---

## 1. Executive summary

The most useful published UX research for AI prompt tools is the **"Prompt Augmentation"**
pattern set (UX Tigers, 2025), which describes how interfaces lower the *articulation
barrier* — the gap between what users want and what they can express in a prompt box.
Six patterns: **Style Galleries, Prompt Rewrite, Targeted Prompt Rewrite, Related Prompts,
Prompt Builders, and Parametrization**. Image platforms adopted these first because visual
taste is the hardest thing to articulate in words.

The studio already had the building blocks (chip presets = style galleries + prompt builder;
the form = parametrization). What the research says we were missing:

1. **Related Prompts / follow-up suggestions** — Perplexity reports engagement *doubled*
   after adding suggested follow-up prompts. A prompt studio should offer one-click remixes
   after generation, not just a static result.
2. **Feedback near the action** — copy buttons must confirm inline ("Copied ✓" on the button
   itself), not just fire a distant toast. Recognition-beats-recall, and proximity of
   feedback to the action is a core usability heuristic.
3. **Recognition over recall in galleries** — saved prompts are useless if the user must
   remember what "A lone lighthouse keeper…" contained. History needs searchable previews
   (content visible at a glance) and a **gallery → edit loop** (open a saved generation,
   tweak, regenerate) — the pattern Midjourney and Leonardo center their UX around.
4. **Progressive disclosure for multi-output tools** — when one generation produces several
   dialects (Midjourney, DALL·E, SD/Flux, Ideogram, Gemini), showing them all stacked is
   clutter; tabs collapse to one card, but an "all cards" escape hatch preserves comparison.

## 2. What changed in the studio (and why)

| UX research finding | Studio change |
|---|---|
| Progressive disclosure / decluttered multi-output | Output is now a **tabbed deck of cards** — one card per platform prompt (master, Midjourney, DALL·E, SD/Flux, Ideogram, Gemini, negative) — each card with its **own copy button** and char count |
| Escaping tabs without losing comparison | **Single / All-cards view toggle** (persisted per user): tabs for focus, grid of every card for comparison |
| Feedback near the action | Every copy button flips to a green **"Copied ✓"** state inline (shared `useInlineCopy` hook; the pattern DESIGN.md already uses for F5 export and history) |
| One-tap grab of the whole set | **"Copy all prompts"** button emits the complete document with `## SECTION` headers |
| Related Prompts pattern (2× engagement) | **Remix suggestions** after generation — one click applies a tweak ("More cinematic lighting", "Warmer color grade", "Add bold in-image text") and regenerates |
| Recognition over recall / gallery → edit loop | Saved briefs became a **searchable history**: every card shows age, style, ratio, platforms, and an **expandable preview** with per-section copy; **Reuse** restores the exact form input back into the studio |
| Persisting the right data | Saved briefs now store the **full parsed sections** + the **exact form input**, so previews and one-click reuse work; older saved briefs still render (backward compatible) |

## 3. Sources

- UX Tigers — "Prompt Augmentation: UX Design Patterns for Better AI Prompting" (Mar 2025) — uxtigers.com/post/prompt-augmentation
- Ideogram / Leonardo / Midjourney product UX (gallery-first workflows) — ideogram.ai, leonardo.ai, midjourney.com
- Nielsen Norman Group usability heuristics (recognition rather than recall; feedback) — nngroup.com/ten-usability-heuristics
- DESIGN.md (this repo) — canonical visual system: card/well tokens, chip language, inline "copied" check states, motion map
