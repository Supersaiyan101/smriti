# Smriti (स्मृति) — Developer & Architecture Guide

Welcome to the internal engineering and architectural guide for **Smriti**, an open-source, privacy-first sanctuary of remembrance. This document details the software architecture, memory pipeline, media handling, acoustic engine, testing strategies, and deployment paths.

---

## 1. System Architecture Overview

Smriti is structured as a monorepo containing two main workspaces:
* **`client/`**: Modern React 18 single-page application built with Vite, vanilla CSS custom properties (design system), HTML5 Web Audio API, and responsive canvas/SVG animations.
* **`server/`**: Node.js/Express service providing REST endpoints, deterministic RAG synthesis via Google Gemma, Mastra agent workflows, local vector/cosine similarity calculation, Sentry distributed tracing, and local persistent JSON / MongoDB Atlas storage.

```
                           ┌──────────────────────────────────────────────┐
                           │          Smriti Client (React + Vite)        │
                           │  - Living Altar Shelf (Sanctuary)            │
                           │  - Flagship Memory Reel (Spotify Wrapped UI) │
                           │  - Heirloom Lightbox (Full Res Inspection)   │
                           │  - Pure Acoustic Web Audio Engine (432Hz)    │
                           │  - Deckled Parchment Keepsake Letter Export  │
                           └──────────────────────┬───────────────────────┘
                                                  │ HTTP / REST
                                                  ▼
                           ┌──────────────────────────────────────────────┐
                           │          Smriti Server (Express + Mastra)    │
                           │  - Storage Adapter (sanctuary_db.json / Mongo│
                           │  - Grounding Engine (Google Gemma + Local RAG│
                           │  - Observability (Sentry Span Tracing)       │
                           │  - Media Uploads (/uploads directory)        │
                           └──────────────────────┬───────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
┌─────────────────────────────────┐                             ┌─────────────────────────────────┐
│     Google Gemma (Local/API)    │                             │       ElevenLabs / Web Speech   │
│ - Zero-hallucination reflection │                             │ - Preserved speech playback     │
│ - Strict citation grounding     │                             │ - Audio ducking coordination    │
└─────────────────────────────────┘                             └─────────────────────────────────┘
```

---

## 2. Flagship Centerpiece: The Memory Reel Architecture

The **Memory Reel** is the flagship centerpiece of Smriti, transforming scattered photographs and quiet stories into a cinematic, permanent celebration of a loved one's life.

### 2.1 Layout A (Cinematic Split)
* **Left Bezel (Visual Anchor):**
  - High-resolution photograph framed inside an archival brass and dark wood bezel.
  - **Adaptive Contain Framing:** Uses `object-fit: contain` with an ambient blurred background aura (`filter: blur(28px) brightness(0.35) saturate(1.2)`). This guarantees **zero cropping** regardless of whether the uploaded image is vertical smartphone portrait (9:16, 3:4), square (1:1), or panoramic (16:9).
  - **Subtle Ken Burns Drift:** CSS breathing drift animation (`scale(1.0) -> scale(1.04)`) across 11 seconds with realistic glass reflection.
  - **Living Flame Ornament:** Solitary animated candle flame in the bezel corner.
* **Right Narrative Panel:**
  - Spacetime pinning pill (`🗓️ [When] • 📍 [Where]`).
  - Slide title.
  - Read-only heartfelt story rendered in high-legibility *Cormorant Garamond* serif prose.
  - **Read-Only Reverence:** Strictly human heartfelt stories with **zero** robotic AI speech readout over the slideshow, preserving the authenticity and emotional purity of each remembered moment.

### 2.2 Spotify Wrapped-Style Story Bars
* Segmented progress bars at the top of the viewport (`▬▬ ▬▬ ▬▬`) indicating story progression.
* Auto-advances every 11 seconds; clickable to jump to any slide immediately.
* **Preloading Engine:** Employs `new Image()` prefetching on adjacent slides to ensure instantaneous, flicker-free transitions.
* **Keyboard Navigation:** Full support for `Space` (pause/play), `←` / `→` (previous/next slide), and `Esc` (exit reel).

### 2.3 Sanctuary Soundtrack Engine
* **Offline MP3 Upload:** Users can upload a personal audio file ("Their Song").
* **Spotify Direct Embed:** Seamlessly embeds Spotify web playback using track IDs extracted from standard Spotify URLs.
* **Procedural Ambient Melodies:** Built-in calm compositions (*Peaceful Piano Dusk*, *Twilight Sarod*, *Warm Acoustic Strings*, *Rain & Wind Chimes*).
* Includes a gently rotating vinyl badge and a global mute/pause toggle.

---

## 3. Heirloom Lightbox Component

Located at [`client/src/components/HeirloomLightbox.jsx`](file:///C:/Users/anava_auw511r/.gemini/antigravity-ide/scratch/smriti/client/src/components/HeirloomLightbox.jsx):
* Provides a full-screen, high-definition inspection modal for:
  - Altar Display Pictures (DP) across `/remember/:id`, `/letter/:id`, and `/offer`.
  - Memory Reel slides during slideshow playback.
  - Preserved memory fragment photos on the altar.
  - Citation artifacts unfolded during reflection.
* **Visual Polish:**
  - Dynamic ambient aura backdrop mirroring the inspected image.
  - Golden filigree corner candle flame emblem.
  - Spacetime coordinates and full story narrative overlay.
  - Keyboard accessibility (`Escape` key listener) and body scroll locking.

---

## 4. Acoustic Peace Engine (Web Audio API)

Located at [`client/src/components/AmbientSoundscape.jsx`](file:///C:/Users/anava_auw511r/.gemini/antigravity-ide/scratch/smriti/client/src/components/AmbientSoundscape.jsx):
* **Zero Annoying Hiss / Radio Static:** Replaces harsh white/pink noise filters with mathematically harmonic frequencies.
* **Procedural Pentatonic Chimes:** Synthesizes 432Hz fundamental frequencies (`[432, 486, 576, 648, 729]` Hz) with natural exponential gain decay.
* **Warm Rain Droplets:** Filtered sine droplets (1800Hz - 2400Hz) with 45ms burst decay.
* **Sub-Octave Breeze:** Dual sine oscillators tuned to 108Hz and 216Hz for a warm, grounding presence.
* **Analog Warmth Filter:** Web Audio `BiquadFilterNode` configured as a low-pass filter at 6800Hz with a Q factor of 0.8, removing digital harshness.
* **Studio Audio Ducking:** Automatically drops ambient audio volume by 65% whenever voice narration or memorial recordings are active.

---

## 5. Storage & Grounded AI Synthesis

### 5.1 Storage Adapter Strategy
* **Default Mode (Local Persistent Storage):** Reads and writes synchronously to [`server/data/sanctuary_db.json`](file:///C:/Users/anava_auw511r/.gemini/antigravity-ide/scratch/smriti/server/data/sanctuary_db.json). Zero setup required; runs completely offline.
* **Enterprise / Production Mode:** When `MONGODB_URI` is provided, automatically uses MongoDB Atlas with Atlas Vector Search for high-dimensional semantic chunk retrieval.

### 5.2 Deterministic Grounding Pipeline
* Handled by Mastra agent workflows in [`server/mastra/`](file:///C:/Users/anava_auw511r/.gemini/antigravity-ide/scratch/smriti/server/mastra/):
  1. **`retrieveStep`**: Gathers top-$k$ memory chunks using cosine similarity.
  2. **`densityGateStep`**: Dynamically determines whether the profile has sparse fragments (1-3 memories $\rightarrow$ **Reflection Mode**) or dense memories ($\ge 4$ fragments $\rightarrow$ **Conversational Mode**).
  3. **`synthesizeStep`**: Calls Google Gemma with low temperature ($0.3$) and strict citation constraints. If no grounding exists, gently acknowledges the lack of context rather than inventing false memories.
  4. **Attribution:** Clean minimal attribution badge labeled simply as `Gemma`.

---

## 6. Directory Structure

```
smriti/
├── client/                          # React + Vite frontend workspace
│   ├── public/                      # Static assets & audio presets
│   ├── src/
│   │   ├── components/
│   │   │   ├── AmbientSoundscape.jsx # 432Hz procedural sound generator
│   │   │   ├── CandleFlame.jsx       # SVG/CSS candlelight flame animation
│   │   │   ├── HeirloomLightbox.jsx  # Full-screen photo/DP inspection modal
│   │   │   ├── HoldToLightFlame.jsx  # Sacred hold-to-ignite ceremony button
│   │   │   ├── MemoryReel.jsx        # Flagship Spotify Wrapped slideshow
│   │   │   ├── MemoryReelEditor.jsx  # Curator modal for slides & audio
│   │   │   ├── PortraitCard.jsx      # Altar shelf thumbnail with glass reflection
│   │   │   ├── TheVigil.jsx          # Silent 4-7-8 breathing meditation
│   │   │   └── VoicePlayer.jsx       # Reverent speech audio player
│   │   ├── pages/
│   │   │   ├── KeepsakeLetter.jsx    # Deckled archival parchment export
│   │   │   ├── Offering.jsx          # Reel-first creation & draft ceremony
│   │   │   ├── Remembrance.jsx       # Memorial hearth & grounded reflection
│   │   │   └── Sanctuary.jsx         # Living shelf home view
│   │   ├── App.jsx                  # Route definitions
│   │   ├── main.jsx                 # Client entry point
│   │   └── index.css                # Global design system & typography tokens
│   └── vite.config.js               # Dev server & proxy settings
│
├── server/                          # Express + Mastra backend workspace
│   ├── data/
│   │   └── sanctuary_db.json        # Local persistent sanctuary database
│   ├── mastra/
│   │   ├── agent.js                 # Mastra agent definition
│   │   └── tools/
│   │       ├── densityGate.js       # Dynamic routing between reflection & conversation
│   │       ├── retrieve.js          # Memory chunk retrieval tool
│   │       └── synthesize.js        # Gemma zero-hallucination synthesis tool
│   ├── routes/
│   │   ├── converse.js              # RAG reflection endpoints
│   │   ├── letter.js                # Archival letter generation
│   │   ├── memories.js              # Preserved fragments & sensory anchors
│   │   ├── profiles.js              # Profile management
│   │   ├── reel.js                  # Memory Reel slides & soundtrack endpoints
│   │   └── voice.js                 # Speech synthesis endpoint
│   ├── test/
│   │   ├── integration.test.mjs     # Core API lifecycle verification
│   │   ├── phase3_brain.test.mjs    # Sparse vs dense grounding verification
│   │   ├── phase4_voice_letter.test.mjs # Keepsake letter & voice verification
│   │   └── depth_features.test.mjs  # Memory Reel, sensory anchors & letter tests
│   ├── index.js                     # Server entry point (port 3001)
│   ├── sentry.js                    # Distributed span tracing
│   └── seed.js                      # Pristine seed profiles generator
│
├── DEVPOST.md                       # Hacktoberfest 2026 Week 4 submission draft
├── DEV.md                           # Developer & Architecture Guide (this file)
├── README.md                        # Project introduction & overview
├── package.json                     # Monorepo workspaces definition
└── render.yaml                      # Cloud deployment blueprint
```

---

## 7. Development & Verification Commands

### 7.1 Running Locally
```bash
# Install all dependencies across monorepo
npm install

# Start both Vite dev client (5173) and Express server (3001)
npm run dev

# Reset seed database to 3 pristine profiles
npm run seed
```

### 7.2 Building for Production
```bash
# Build the client distribution bundle
npm run build -w client
```

### 7.3 Running the Automated Test Matrix
Smriti features 4 comprehensive test suites:
```bash
npm run test -w server
```
Expected output:
* `✔ integration.test.mjs`: Tests `/api/health`, profile creation, memory addition, and hierarchy retrieval.
* `✔ phase3_brain.test.mjs`: Verifies solitary flame sparse mode vs. dense conversation mode with verified citation tag extraction.
* `✔ phase4_voice_letter.test.mjs`: Verifies ElevenLabs voice endpoint, citation cleaning, and archival keepsake letter generation.
* `✔ depth_features.test.mjs`: Verifies sensory anchors (weather, scent, song), spacetime coordinates, unsent letters, Memory Reel slides, and soundtrack synchronization.

---

## 8. License & Attribution

* **License:** [MIT License](LICENSE)
* **Design Ethics:** Built for universal human remembrance. Free of dark patterns, subscriptions, advertisement trackers, and synthetic hallucination.
