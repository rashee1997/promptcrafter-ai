---
title: "Text Prompt Studio"
description: "Overview, key features, and usage guide for the Text Prompt Studio."
---
# Text Prompt Studio

**Key Features**
- 9 built‑in domain presets with domain‑aware system‑prompt fragments (Software & Technology, Product Management, Marketing & Growth, Blog & Content, Creative Writing, Research & Academia, Operations & Compliance, Legal & Business, Custom).
- 14 tone presets — professional, creative, adversarial, socratic, executive, narrative, and more.
- 12 prompt frameworks: RTF, CAR, Chain‑of‑Thought, Few‑Shot, Meta System Prompt, ReAct, RISEN, Tree‑of‑Thoughts, Self‑Refine, APE, COAST, Socratic Architecture.
- Configurable output format (Markdown, JSON, bullet points, XML, structured text), constraints, and examples.
- Optional character limit (default 8,000 characters) to keep prompts lean.
- Dynamic hybrid example prompts – static chips that can be upgraded by AI‑refreshed suggestions.
- Custom chip values and save‑for‑later persistence in IndexedDB.
- File, project, PDF & image attachments – code files, XML project context, PDFs, images; unsupported formats are auto‑routed through the built‑in Gemini extractor.
- Dedicated Settings page with tabs for AI Providers, Model Capabilities, File & Upload preferences, Data & Privacy, Defaults, and Appearance.

**Usage Guide**
1. **Generator** – pick a domain, enter a goal, choose tone & framework, optionally set a character limit, then click **Generate**. The engineered prompt streams into the output pane with live stats.
2. **Score** – open the **Quality** badge to see a 0‑100 score across six dimensions, or run **AI Review** for an LLM‑judge evaluation. Scores are cached per version.
3. **Refine** – give an instruction such as "make it more concise"; a new version is created with the full conversation context.
4. **Versions** – switch, rename, diff, favorite, or restore any saved version. Manual edits also become separate versions.
5. **Test** – click **Test** to run the active prompt as a system instruction against a sample query. With multiple providers configured, **Compare models** runs the same prompt across them side‑by‑side with a consistency score.
6. **Consistency checks** – add sample test inputs, then run **every version × every case** for a pass/fail matrix (75 %+ pass threshold). The built‑in adversarial probes (`lib/probes.ts`) provide injection, contradiction, out‑of‑scope, and jailbreak inputs.
7. **Custom fields & export** – fill `[BRACKETED_PLACEHOLDER]` for a copy‑paste‑ready prompt; export any version as Claude, GPT, Gemini, Markdown, or JSON.
8. **History** – search, filter, import/export sessions, re‑verify saved prompts with the AI judge, or clear all data.
