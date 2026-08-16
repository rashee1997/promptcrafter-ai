# PromptCrafter — Image Generation Prompt Research

> Web research conducted August 2026. Scope: Google's official Nano Banana (Gemini image
> model) prompting guides, plus current general image-prompt structure guidance.
> Sources are cited inline and listed at the bottom. This research directly informed the
> Image Prompt Studio upgrade shipped alongside it.

---

## 1. Executive summary

Image prompting has shifted from keyword tag-soups to **creative-direction**: the best
prompts in 2026 read like a film director's brief, not a comma-separated feature list.
Google's own guidance for its Nano Banana image models is explicit: *"stop using tag soups
(e.g., dog, park, 4k, realistic) and start acting like a Creative Director."* The single
highest-leverage moves, repeated across every credible guide:

1. **Be a director, not a keyword stacker** — describe subject, action, location, framing,
   lighting, and mood in natural language; a strong verb opens the prompt.
2. **Order matters** — lead with the subject and the most important visual elements; put
   technical details (ratio, resolution) last.
3. **Lighting is the biggest quality driver** — one deliberate light source, direction,
   and quality beats any number of quality buzzwords.
4. **Positive framing beats negative prompts** — say what you want ("an empty street"),
   not what you don't ("no cars"); only Stable Diffusion-class models want a negative line.
5. **Concrete nouns and materiality** — "a navy blue tweed coat" not "a nice jacket".
6. **Camera/lens + film-stock vocabulary** control the visual DNA of the shot.
7. **Prompting is model-specific now** — Midjourney wants short high-signal phrases with
   parameters; DALL·E/Gemini want conversational paragraphs; SD/Flux wants weighted tokens;
   Ideogram and Gemini are the text-in-image specialists.

## 2. The Nano Banana prompting guide (Google, official)

Sources: Google Cloud Blog "Ultimate prompting guide for Nano Banana" (Mar 2026), Google AI
dev.to "Nano-Banana Pro: Prompting Guide & Strategies" (Nov 2025), Google Blog "7 tips to
get the most out of Nano Banana Pro" (Nov 2025).

### Golden rules

- **Nano Banana is a "thinking" model.** It reasons about intent, physics, and composition —
  so natural-language creative briefs outperform keyword lists.
- **Edit, don't re-roll.** If an image is 80% right, ask for the specific change
  conversationally instead of regenerating.
- **Provide context (the "why" / "for whom").** "An image of a sandwich for a Brazilian
  high-end gourmet cookbook" makes the model infer plating, shallow DOF, and lighting.

### The official text-to-image formula

> **[Subject] + [Action] + [Location/context] + [Composition] + [Style]**

Example (from the guide): *"A striking fashion model wearing a tailored brown dress…
[Subject] Posing with a confident, statuesque stance [Action]. A seamless, deep cherry red
studio backdrop [Location/context]. Medium-full shot, center-framed [Composition]. Fashion
magazine style editorial, shot on medium-format analog film, pronounced grain [Style]."*

### Creative Director controls (studio-quality vocabulary)

| Control | Guidance |
|---|---|
| **Lighting design** | "three-point softbox setup", "chiaroscuro lighting with harsh, high contrast", "golden hour backlighting creating long shadows" |
| **Camera, lens, focus** | Dictate the camera for the visual DNA: GoPro (immersive action), Fujifilm (color science), disposable camera (nostalgic flash). Force perspective with "low-angle shot, shallow depth of field (f/1.8)", "wide-angle lens", "macro lens" |
| **Color grading / film stock** | "as if on 1980s color film, slightly grainy", "cinematic color grading with muted teal tones" |
| **Materiality & texture** | "navy blue tweed", "ornate elven plate armor, etched with silver leaf patterns", "minimalist ceramic coffee mug" |

### Text rendering

- Put the exact wording **in quotes** ("FRESH ROAST") and describe the typography
  ("bold, white, sans-serif font", "Century Gothic").
- Specify layout ("headline at the top") and keep backgrounds uncluttered.
- Text-first hack: for complex text, generate the copy concepts first, then ask for the image.

### Tech specs that change prompting

- **Aspect ratios:** 1:1, 3:2, 2:3, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9 (Nano Banana 2 adds 1:4, 4:1, 1:8, 8:1).
- **Resolutions:** native 1K, 2K, 4K — explicitly request "2K/4K" for detail.
- **Web-search grounding:** for real-time data / current events, ask the model to ground the
  image in current information before rendering.
- **Positive framing:** no negative-prompt syntax — phrase exclusions as "without X".
- **Strong verb opener** for every prompt.

## 3. General image prompt structure (2026 guides)

Sources: BudgetPixel "Structure Guide for AI Image Prompts" (Apr 2026), LetsEnhance "How to
write AI image prompts like a pro" (Jan 2026).

The convergent anatomy:

> **Subject + Details + Style + Composition + Lighting + Quality + Extras**

Pro tips that recur across guides:

- **Clarity beats complexity.** 1–2 consistent styles; never stack conflicting directions
  ("photorealistic anime oil painting" fails).
- **Important elements first** — a subject buried after "8K, cinematic lighting, masterpiece"
  gets diluted.
- **Environment is part of the subject** — "a knight" is unfinished; "a knight standing in a
  snowy battlefield at dawn" is a picture.
- **Quality buzzwords don't stack** ("Ultra HD, 8K, highly detailed, masterpiece" all at once
  dilutes rather than boosts).
- **Platform dialects differ** (2026 state):
  - **Midjourney v7:** short high-signal phrases + `--ar`, `--style raw`, `--stylize`, `--no`; reference images via `--oref`.
  - **ChatGPT / DALL·E, Gemini:** paragraph briefs + conversational follow-ups; strong text-in-image.
  - **SD 3.5 / Flux:** structured weighted keywords `(term:1.2)`, negative prompts, samplers.
  - **Ideogram:** best typography; give it explicit text + layout.
- **Camera and lighting keywords are the highest-impact modifiers** (Vidzy cheat-sheet analysis).

## 4. What changed in the Image Prompt Studio

| Research finding | Studio change |
|---|---|
| Nano Banana is a distinct, high-value dialect | New **Gemini / Nano Banana** platform (on by default) with a full natural-language dialect guide: formula, strong verb, ratio + resolution in words, positive framing, text-in-quotes, creative-director vocabulary, web-search grounding note |
| Camera/lens controls the visual DNA | New **Camera & lens** slot (35mm, 85mm, wide-angle 16mm, macro, fisheye, anamorphic, telephoto, tilt-shift, drone, GoPro, medium format, disposable) |
| Color grading / film stock sets the tone | New **Color grade & film stock** slot (Kodak Portra, Cinestill 800T, teal & orange, film noir, monochrome, muted, vibrant, pastel, 1980s film, sepia, infrared) |
| Nano Banana supports native 1K/2K/4K | New **Output resolution** slot (1K / 2K / 4K) — requested explicitly in the Gemini dialect, mapped to restrained quality tags for SD/Flux |
| Text-in-image needs quotes + typography | New **Text inside the image** field, consumed by every dialect (best on Gemini and Ideogram) |
| Lighting is the top quality driver | Lighting pool expanded 8 → 16 (rim, backlight, candlelight, volumetric, bioluminescent, split, hard sun, blue hour) |
| Composition/framing vocabulary | Composition pool expanded 8 → 16 (Dutch angle, extreme close-up, over-the-shoulder, POV, symmetry, leading lines, frame-in-frame, negative space) |
| One consistent visual direction | New rule: never stack conflicting styles |
| Positive framing | New rule: exclusions are rephrased as "without X"; only SD/Flux keeps a negative-prompt line |
| Materiality & concrete nouns | New rule with explicit examples ("navy blue tweed", "etched silver leaf") |
| Order matters | New rule: subject first, technical last |
| Nano Banana aspect-ratio range | Ratio options expanded with 2:3, 3:4, 4:5, 5:4, 21:9 |
| Style variety | Style pool expanded 12 → 18 (product photo, film noir, vaporwave, ukiyo-e, papercraft, concept art) |
| Mood vocabulary | Mood pool expanded 8 → 13 (whimsical, nostalgic, tense, cozy, awe) |

## 5. Sources

- Google Cloud Blog — "The ultimate Nano Banana prompting guide" — cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana (Mar 2026)
- Google AI (dev.to) — "Nano-Banana Pro: Prompting Guide & Strategies" — dev.to/googleai/nano-banana-pro-prompting-guide-strategies-1h9n (Nov 2025)
- Google Blog — "7 tips to get the most out of Nano Banana Pro" — blog.google/products-and-platforms/products/gemini/prompting-tips-nano-banana-pro/ (Nov 2025)
- BudgetPixel — "Structure Guide for AI Image Prompts" — budgetpixel.com/blog/structure-guide-for-ai-image-prompts (Apr 2026)
- LetsEnhance — "How to write AI image prompts like a pro [2026]" — letsenhance.io/blog/article/ai-text-prompt-guide/ (Jan 2026)
- Vidzy — "AI Prompt Cheat Sheet: 200+ Keywords by Category" — getvidzy.com/ai-prompt-keywords-cheat-sheet/ (Mar 2026)
