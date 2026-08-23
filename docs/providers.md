---
title: "Providers"
description: "Configure AI providers and models."
---
# Providers

**Built‑in Google Gemini**
Works out of the box once `GEMINI_API_KEY` is set in `.env.local`. The key is read server‑side only and never reaches the client.

**Custom OpenAI‑compatible providers**
Add providers in the **Providers** panel (Settings → Providers). You can configure:
- **name** – arbitrary identifier (e.g., "OpenAI", "Groq", "Local Ollama").
- **base URL** – the provider’s `/v1` endpoint (e.g., `https://api.openai.com/v1`).
- **API key** – stored encrypted with AES‑GCM on‑device.
- **model list** – array of model names; the first entry is the default. Switch models from the navbar, generator bar, or A/B lab.
- **sampling parameters** – temperature, top‑p, max tokens, etc.

**Multiple models per provider**
Each provider stores a full list of models. The active model persists locally and can be changed from various UI locations (navbar, provider settings, or directly in a prompt’s model selector).

**Key handling & security**
Custom provider API keys are encrypted client‑side with AES‑GCM (PBKDF2‑derived key). Keys are never stored in plaintext and are only sent to the configured endpoint during a request.
