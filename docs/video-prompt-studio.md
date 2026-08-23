---
title: "Video Prompt Studio"
description: "Overview, key features, and usage guide for the Video Prompt Studio."
---
# Video Prompt Studio

**Key Features**
- Platform‑first cinematic pipeline – pick one of seven AI‑video platforms (Veo 3.1, Kling 3.0, Seedance, Higgsfield / Soul ID, Runway, Luma, Pika).
- Production Hub – project dashboard with grid/list view, search, status filters, quick‑delete.
- Story Bible Bootstrap – 10‑stage wizard (Platform → Story → Dialogue → Screenplay → Direction → Characters → Locations → Visual Style → VFX).
  - **Stage table**
    | Stage | Output |
    |---|---|
    | 0. Platform | Target platform constraints |
    | 1. Story | Story treatment (narrative structure) |
    | 2. Dialogue | Script dialogue draft |
    | 3. Screenplay | Screenplay scenes with beats |
    | 4. Direction | Direction plan (shot functions, coverage) |
    | 5. Characters | Cast with appearance, wardrobe, voice tone + reference‑image prompts |
    | 6. Locations | Set descriptions + AI scouting suggestions |
    | 7. Visual Style | Curated visual‑style library (locked on activation) |
    | 8. VFX | VFX cues, particle density, pacing (locked on activation) |
- Shot Drafting Chat – multi‑turn conversational thread where the director iterates on shots; each assistant turn emits a structured JSON `DraftedShot` with description, universal prompt, continuity handoff, and duration (8‑30 s).
- Character Voice & Performance – Generates lip‑sync‑ready voice packages for platforms without native audio; native‑audio platforms use built‑in dialogue.
- Timeline Assembly & Post‑Production Prep – storyboard timeline with reorder, pacing analysis (runtime, average shot length, rhythm graph), music/SFX brief, and a one‑click assembly export (ordered prompts, voice tracks, music brief).
- Dialect Export – deterministic adapters re‑express stored shot prompts for each platform (Veo 3.1 / Flow, Higgsfield / Soul ID, Kling 3.0, Seedance) plus a universal verbatim fallback. No API calls; formatting happens at copy time.

**Usage Guide**
1. **Create a project** – click **New Project**, write a directorial brief, optionally confirm an AI story treatment.
2. **Pick a target platform** – Stage 0 of the wizard selects one of the seven platforms; constraints are enforced downstream.
3. **Bootstrap the Story Bible** – progress through the 10‑stage wizard, reviewing and editing each stage; activate Visual Style + VFX to lock them.
4. **Draft shots in the chat** – the assistant proposes one shot per turn; **Approve** promotes it to the storyboard, **Request Revision** re‑drafts with full context.
5. **Reorder & edit storyboard** – use Up/Down chevrons; the chain renumbers and continuity is logged.
6. **Export** – switch dialect tabs on any shot card, copy the formatted prompt, or download the full assembly package (shots + voice‑track references + music brief).
