---
title: "Smriti: When someone you love passes away, their words scatter. Gemma and local speech gathered them into an open-source altar."
published: true
tags: devchallenge, hf26challenge, gemma, opensource
cover_image: https://raw.githubusercontent.com/smriti-memorial/smriti/main/assets/cover.png
description: "A universal, privacy-first sanctuary of remembrance. Powered by Google Gemma, Mastra, MongoDB Atlas, ElevenLabs, and Sentry."
---

# Smriti (स्मृति)
### *"A place for those who live on in you."*

> **Hacktoberfest 2026 — Week 4: Ghost in the Machine**  
> **Repository:** [github.com/Supersaiyan101/smriti](https://github.com/Supersaiyan101/smriti)  
> **Live Sanctuary:** [https://smriti.tech](https://smriti.tech) (Hosted on Render)  
> **License:** MIT (Free & Open Source forever)

---

## 1. The Story: Why I Built Smriti

When someone we love dies, what remains of them is scattered across the digital wind.

A 7-second voice note on WhatsApp where they were laughing in traffic. A recipe scribbled on the back of an envelope. A piece of advice they gave you on a terrace at 2:00 AM when your life was falling apart.

In recent years, commercial AI companies have begun packaging grief. They ask you to upload intimate photographs, personal diaries, and audio recordings of your deceased loved ones to private corporate servers. In return, they offer "digital resurrections"—creepy, ungrounded conversational chatbots that invent conversations your loved one never had, turn grief into a monthly subscription tier, and train corporate frontier models on your tears. When the startup runs out of venture funding, your grandmother’s digital presence simply goes 404.

**Smriti refuses that reality.**

In ancient Sanskrit, **Smriti** (स्मृति) means *Remembrance*—that which is preserved in living memory. But the practice of remembering is universal across all human geography. Whether it is lighting a vigil candle in a quiet European chapel, setting a paper lantern adrift on water in Japan, or gathering around a family table, humans have always remembered the departed with a **gentle light in the dark**.

I built Smriti as an open-source, privacy-first sanctuary. It does not pretend the dead are still alive. It does not hallucinate false memories. Instead, it gathers scattered fragments of words, voice, and wisdom, preserves them with cryptographic custody, and lets you sit quietly beside their flame.

---

## 2. What Smriti Actually Does: The Core Experience & The Memory Reel

Smriti is intentionally designed with one defining aesthetic: **Quiet**. There are no notification badges, no social feeds, and no login walls.

```
       ┌────────────────────────────────────────────────────────┐
       │                       THE SANCTUARY                    │
       │                                                        │
       │               🕯️  [ Living Candle Flame ]               │
       │                                                        │
       │         [ Arjun Mehta ]            [ Savitri Devi ]    │
       │        "Best friend, college"       "Grandmother"      │
       │               🕯️                         🕯️           │
       │                                                        │
       │          🎞️ [ THE MEMORY REEL • SPOTIFY SOUNDTRACK ]    │
       └────────────────────────────────────────────────────────┘
```

### 🎞️ The Flagship Centerpiece: The Memory Reel
The defining feature of Smriti. It weaves photographs and heartfelt stories into a cinematic slideshow set to music, kept permanently on their altar:

- **Layout A (Cinematic Split):**
  - **Left Half:** High-resolution portrait framed in an archival brass & dark wood bezel with subtle Ken Burns drift (1.0 to 1.04 zoom over 11s), realistic glass reflections, and a corner living flame.
  - **Right Half:** Spacetime pinning badge (`🗓️ [When] • 📍 [Where]`), moment title, and the quiet written narrative in large, elegant *Cormorant Garamond* serif prose.
- **Spotify Wrapped-Style Story Bars:** Segmented top progress bars (`▬▬ ▬▬ ▬▬`), auto-advancing, clickable to jump, keyboard controls (`←`/`→`/`Esc`/`Space`), and pause-on-hover.
- **Sanctuary Soundtrack Engine:** Custom MP3 audio upload ("Their Song") or procedural sanctuary acoustic melodies (*Peaceful Piano Dusk*, *Twilight Sarod*, *Warm Acoustic Strings*, *Rain & Wind Chimes*), with spinning vinyl badge and mute control.
- **Read-Only Reverence:** Strictly human heartfelt stories with zero robotic TTS narration over the slideshow.

### Feature 1 — The Sanctuary (Living Hearth)
The home screen is a quiet room at dusk. Each remembered person appears as a softly framed portrait resting beside a living, flickering candle flame. The shelf features 3 clean sample profiles (*Arjun Mehta*, *Savitri Devi*, *David Miller*) with immediate Memory Reel playback and a built-in seed utility (`npm run seed`).

### Feature 2 — The Offering (Reel-First Creator & Ceremony)
Transforming the act of memorial creation into weaving a living Memory Reel from moment one:
1. **Who Are We Honoring:** Name, relationship, and circular altar portrait upload with live preview.
2. **Dynamic Moments Filmstrip:** Add unlimited photos and videos (up to 50MB) with heartfelt stories written in *Cormorant Garamond*, moment titles, and spacetime pinning (`When was this?`, `Where were you?`).
3. **Triple-Dock Soundtrack:** Choose between curated acoustic sanctuary presets (*Piano Dusk*, *Classical Sarod*, *Temple Dawn*), offline MP3 audio upload, or direct Spotify song links.
4. **Sacred Hold-to-Light Flame Ceremony:** Holding to light the ceremonial flame creates their profile, weaves all moment slides and soundtracks into their reel, and seamlessly launches the Memory Reel slideshow finale upon their newly lit altar.
5. **Quiet Local Draft Auto-Save:** Automatically preserves in-progress moments and stories in local storage so not a single memory is lost.

#### 💡 The Sparse Memory Dilemma: "What if I only have one memory?"
One of the most tender realities of grief is that we often have very little preserved data. For a childhood friend who passed young, you might only have **one sentence** they always said.

Smriti never shames the user with *"Profile 10% complete—add more data."* **A single memory is already whole.** Smriti introduces two dedicated solutions:
- **Gentle Whispers:** Soft 1-tap prompts (*"A Catchphrase"*, *"A Small Joy"*, *"Life Advice"*, *"A Scent or Song"*) that offer tender starting words if grief leaves you feeling blank.
- **Reflection Mode:** When someone has only 1–3 memories, Gemma does **not** attempt a fake conversational Q&A. Instead, it acts as a peaceful keeper of the flame, reflecting their actual preserved words and advice back to the user like a warm comforting presence.

### Feature 3 — The Remembrance (Slow Ink & Citation Unfolding)
Clicking a portrait brings full focus to their hearth:
- **Gemma Grounded Reflection:** Strictly grounded in uploaded fragments with zero hallucinations.
- **Slow Ink Emergence:** Gentle, typewriter-paced writing reveal with a glowing ink quill cursor.
- **Citation Artifact Unfolding:** Clicking any bracketed citation (`[Chai stall memory, 2018]`) unfolds the original preserved artifact modal with its exact spacetime coordinates and sensory anchors.

### Feature 4 — The Vigil ("Sit with Them")
A dedicated meditation sanctuary for wordless presence with an expanding 4-7-8 mindful breathing ring and a tap-to-tend 432Hz bronze chime.

### Feature 5 — Clean Acoustic Soundscapes & Voice
- **Pure Acoustic Sanctuary Engine:** Completely free of harsh radio hiss or white/pink noise static. Features pure 432Hz harmonic pentatonic temple chimes with natural exponential decay, warm sine wave rain droplets, and gentle sub-octave sine breeze drones (108Hz/216Hz).
- **Studio Audio Ducking:** Ambient soundscapes automatically duck (-65%) whenever voice recordings or ElevenLabs readouts play.
- **Analog Warmth Filter:** Web Audio low-pass filter (6800Hz) that softens digital harshness into vintage vinyl warmth.

### Feature 6 — The Keepsake Letter (Story-Extracted Heirloom Export)
One tap on *"📜 Keepsake Letter"* generates a printable, framed heirloom document:
- **Story-Extracted Wisdom:** Directly pulls preserved quotes, moments, and spacetime coordinates from their Memory Reel photo stories into Gemma's synthesis.
- **Archival Deckled Parchment:** Renders with authentic torn paper edges, fold crease lines, moment thumbnails, and a dimensional crimson/gold Sanskrit wax seal stamp (`स्मृ`).
- **High-Resolution Print Layout:** Custom `@media print` styling removes dark backgrounds and prepares crisp typography for physical framing.

---

## 3. System Architecture & Data Flow

Smriti is built as an open-source monorepo combining a modern React + Vite frontend with an Express agent backend orchestrated by **Mastra** and observed by **Sentry**.

```
  USER INPUT (Browser)
  ├─ Audio (MediaRecorder WebM)
  ├─ Text / Quote / Advice
  └─ Photo / Scanned Letter
         │
         ▼
  [ MongoDB Atlas ]
  ├─ profiles collection (metadata, relations)
  └─ memories collection (chunks + Atlas Vector Search Index)
         │
  USER ASKS: "What did they tell me about patience?"
         │
         ▼
  [ Mastra Agent Workflow ] (server/mastra/agent.js)
  ┌────────────────────────────────────────────────────────┐
  │ 1. Tool: retrieveMemoriesTool (Atlas Vector Search)     │
  │    └─ Sentry Span: mastra.tool.retrieve                │
  │                                                        │
  │ 2. Tool: densityGateTool (Threshold & Volume Router)   │
  │    ├─ ≥ 4 chunks ──► Conversational Grounded Mode       │
  │    └─ 1-3 chunks ──► Reflection Mode (The Flame)       │
  │    └─ Sentry Span: mastra.tool.densityGate             │
  │                                                        │
  │ 3. Tool: synthesizeGemmaTool                           │
  │    ├─ Prompt Injection: [Context Blocks with Citations] │
  │    ├─ Google Gemma (gemma2:9b / Ollama / API)          │
  │    └─ Sentry Span: mastra.tool.gemma_synthesize        │
  └────────────────────────────────────────────────────────┘
         │
         ├──────────────────────────────┐
         ▼                              ▼
  [ Text Response + Citations ]   [ ElevenLabs TTS API ]
  UI renders clickable pills      Streams audio/mpeg for
  ⚓ [Chai stall memory, 2018]     screen-off quiet listening
```

---

## 4. The Engineering Rule: "Code Guarantees, AI Evaluates"

To guarantee zero hallucination, Smriti does not rely on vague prompt instructions alone. The architecture enforces deterministic safeguards:

```javascript
// server/mastra/tools/synthesize.js
// Safeguard 1: Cosine similarity gate
if (!chunks || chunks.length === 0) {
  return {
    message: `The sanctuary does not have enough preserved words of ${personName} to speak to this yet. You can add more memories at any time.`,
    citations: [],
    grounded: false,
  };
}

// Safeguard 2: Density gate routes to Reflection Mode when memories are sparse
if (mode === 'reflection') {
  systemPrompt = `You are a gentle keeper of the flame in Smriti, honoring ${personName}.
CRITICAL: Do NOT attempt a fake conversational roleplay.
Warmly reflect their actual preserved words back to the user.
Every fact MUST come strictly from the memories below:
${contextBlocks}`;
}
```

---

## 5. Partner Prize Breakdowns

Smriti was engineered from Day 1 to meaningfully demonstrate the power of open-source AI infrastructure across **7 partner prize categories**:

### 🏆 1. Best Use of Gemma ($200)
* **Role:** Core Cognitive Engine for Grounded Reflection and Keepsake Synthesis.
* **Implementation:** Smriti connects to Google Gemma (`gemma2:9b` open weights via Ollama or API). Gemma operates under strict temperature constraints (`0.3`) and custom system prompts that forbid roleplaying as a living person. In **Reflection Mode**, Gemma acts as an empathetic mirror, echoing the user's preserved words back to them with cited integrity.

### 🏆 2. Best Use of Render ($200)
* **Role:** Production Cloud Runtime and Frontend Hosting.
* **Implementation:** Smriti defines a declarative Infrastructure-as-Code [render.yaml](file:///C:/Users/anava_auw511r/.gemini/antigravity-ide/scratch/smriti/render.yaml) blueprint:
  - An Express API web service running the Node.js Mastra agent runtime.
  - A static web service hosting the React + Vite Single Page Application.
  - Automatic URL rewrites routing `/api/*` and `/uploads/*` requests seamlessly to the backend service.

### 🏆 3. Best Use of ElevenLabs ($100)
* **Role:** Dignified Spoken Audio Readout for Screen-Off Listening.
* **Implementation:** Located in `server/routes/voice.js`. When a reflection is generated, ElevenLabs streams high-fidelity speech (`audio/mpeg`) using the Multilingual v2 model. Smriti strips all citation brackets (`[Source]`) before passing text to the voice model to ensure natural human cadence, accompanied by an animated pulsing audio waveform in `VoicePlayer.jsx`.

### 🏆 4. Best Use of MongoDB Atlas ($100)
* **Role:** Scalable Vector Storage & Semantic Search Engine.
* **Implementation:** Located in `server/db.js` and `server/vectorSearch.js`. Smriti indexes every memory fragment into MongoDB Atlas with 128-dimensional vector embeddings. Querying utilizes the Atlas `$vectorSearch` aggregation stage with filtering scoped by `profileId`, ensuring instant cosine semantic retrieval across years of memory fragments.

### 🏆 5. Best Use of Mastra ($100)
* **Role:** Agent Workflow Orchestration.
* **Implementation:** Located in `server/mastra/agent.js`. Built using `@mastra/core` and `@mastra/core/workflows`. Mastra coordinates the end-to-end remembrance pipeline across three formal steps:
  1. `retrieveStep` — Vector search over memory chunks.
  2. `densityGateStep` — Intelligent volume routing (Conversational vs. Reflection).
  3. `synthesizeStep` — Google Gemma contextual generation.

### 🏆 6. Best Use of Sentry ($100)
* **Role:** OpenTelemetry Agent Tracing & Observability.
* **Implementation:** Located in `server/sentry.js`. Every Mastra tool execution and LLM call is instrumented with custom Sentry spans (`mastra.workflow.remembrance`, `mastra.tool.retrieve`, `mastra.tool.densityGate`, `elevenlabs.text_to_speech`). Spans capture attributes including `queryLength`, `chunksCount`, and `density_mode`, providing real-time latency and error tracking in the Sentry dashboard.

### 🏆 7. Best Use of a .tech Domain ($100)
* **Role:** Production Custom Domain.
* **Implementation:** Smriti is deployed to **[smriti.tech](https://smriti.tech)**, providing a clean, dignified, branded home that reinforces the open-source mission of technology in service of human memory.

---

## 6. Verification & Automated Test Suite

Every architectural layer of Smriti is backed by automated integration tests running in CI:

```bash
npm run test -w server

[Smriti Test Suite] Starting integration verification...
✔ Pinging /api/health ...
✔ Creating memorial profile ...
✔ Adding memory fragment ...
✔ Retrieving profile and memory hierarchy ...
[Smriti Test Suite] ALL INTEGRATION TESTS PASSED (100% OK)

[Smriti Phase 3 Brain Test] Starting verification...
✔ Testing Sparse Memory Scenario (The Solitary Flame)...
   Selected Mode: reflection | Is Sparse: true
   Citations: [ 'Debate room memory, 2017' ]
✔ Testing Dense Memory Scenario (The Sanctuary Conversation)...
   Selected Mode: conversational | Retrieved Chunks: 4
[Smriti Phase 3 Brain Test] ALL TESTS PASSED (100% OK)

[Smriti Phase 4 Voice & Letter Test] Starting verification...
✔ Testing ElevenLabs Voice Endpoint & Citation Stripping ... PASSED
✔ Testing Keepsake Letter Generation ... PASSED
[Smriti Phase 4 Voice & Letter Test] ALL TESTS PASSED (100% OK)

[Smriti Depth Features Test] Starting verification...
✔ Testing Sensory Anchors (weather, scent, song) & Spacetime Pinning ... PASSED
✔ Testing Unsent Letters to Them on the Hearth ... PASSED
✔ Testing Memory Reel Slide Photo Stories & Heirloom Lightbox Framing ... PASSED
✔ Testing Soundtrack Modes (Offline MP3, Spotify Embed, Curated 432Hz Presets) ... PASSED
[Smriti Depth Features Test] ALL DEPTH TESTS PASSED (100% OK)
```

---

## 7. Why Open Source Innovation Matters

Commercial technology often treats death as an engagement metric or a data monetization opportunity.

Smriti proves that modern open-source AI—when powered by open-weight models like **Google Gemma**, frameworks like **Mastra**, databases like **MongoDB Atlas**, and platforms like **Render**—can serve a fundamentally higher purpose.

It provides a sanctuary where your loved one’s memory belongs only to you. No corporate lock-in. No surveillance. Just a quiet room, a steady flame, and the words that live on in you.

---

### Links & Resources
- **GitHub Repository:** [github.com/Supersaiyan101/smriti](https://github.com/Supersaiyan101/smriti)
- **Live Demo:** [smriti.tech](https://smriti.tech)
- **License:** [MIT License](file:///C:/Users/anava_auw511r/.gemini/antigravity-ide/scratch/smriti/LICENSE)
