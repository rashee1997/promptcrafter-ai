---
title: PromptCrafter AI vs Promptfoo
description: OpenAI announced plans to acquire Promptfoo, the open-source prompt evaluation and red-teaming platform, on March 9, 2026, and Promptfoo said it will remain open source. This post compares what Promptfoo does, what PromptCrafter AI does, and who each tool is for.
date: 2026-08-13
dateModified: 2026-08-13
tags: comparison, promptfoo, openai
---

## Summary

OpenAI announced plans to acquire Promptfoo, the open-source prompt evaluation and red-teaming platform, on March 9, 2026; Promptfoo said it will remain open source. Promptfoo is developer-grade infrastructure: YAML configs, datasets, CLI and CI integration. PromptCrafter AI is a browser-based workbench where the same evaluation ideas — scoring, A/B comparison, regression testing — run in a UI with your own API keys, no YAML and no account.

## The acquisition

On March 9, 2026, OpenAI announced plans to acquire Promptfoo, and Promptfoo announced it was joining OpenAI while remaining open source. Promptfoo is best known as an open-source evaluation platform for LLM applications: you define test cases and assertions in YAML, run a prompt through one or more models, and get pass/fail results and regression checks, often wired into CI.

The acquisition matters to teams that evaluate against multiple vendors. Promptfoo has said it will stay open source, but its roadmap now sits inside a company that also sells models and evaluation products. Teams that want a provider-neutral evaluation tool — one with no incentive to prefer a particular vendor — have reason to keep options open.

## What Promptfoo does

- CLI- and YAML-first evaluation: test cases, assertions, and datasets defined in configuration files.
- Red-teaming and security testing for LLM applications, including prompt injection.
- CI integration for teams that gate deploys on evaluation results.
- Designed for engineering teams: it expects a codebase, a config format, and typically a team to maintain it.

## What PromptCrafter AI does

- Runs entirely in the browser, with no YAML and no CLI: describe a task, get a structured prompt, then iterate.
- Scores every version 0–100 across six quality dimensions, each with a note and a one-line fix.
- Runs the same prompt and test input across two or more providers side by side, with a consistency score and a diff view.
- Regression-tests versions against saved test inputs, and re-verifies when scores or models drift.
- Local-first: sessions live in IndexedDB, and custom provider keys are encrypted on-device with AES-GCM.

## Who each tool is for

Promptfoo is for engineering teams that already manage evaluation in code and CI. PromptCrafter AI is for individuals — project managers, marketers, writers, researchers, and solo developers — who want to measure and compare prompts in a UI with their own keys, without standing up an evaluation pipeline.

## Bottom line

Promptfoo is a powerful piece of developer infrastructure, and if you are an engineering team with an existing YAML evaluation setup, it may remain the right tool. If you want the same ideas — score it, test it across models, catch regressions — without the infrastructure, that is the gap PromptCrafter AI fills. We are not a replacement for teams that need CI-grade evaluation suites; we are the version that works for everyone else.
