# Smriti (स्मृति)
### *"A place for those who live on in you."*

[![Hacktoberfest 2026](https://img.shields.io/badge/Hacktoberfest%202026-Week%204%3A%20Ghost%20in%20the%20Machine-FF8AE2?style=for-the-badge&logo=hacktoberfest&logoColor=white)](https://hacktoberfest.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg?style=for-the-badge)](LICENSE)
[![Google Gemma](https://img.shields.io/badge/AI-Google%20Gemma-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/gemma)
[![Mastra](https://img.shields.io/badge/Orchestration-Mastra-8B5CF6?style=for-the-badge)](https://mastra.ai/)
[![Sentry](https://img.shields.io/badge/Observability-Sentry-362D59?style=for-the-badge&logo=sentry&logoColor=white)](https://sentry.io/)

> **Hacktoberfest 2026 — Week 4: Ghost in the Machine**  
> **Repository:** [github.com/Supersaiyan101/smriti](https://github.com/Supersaiyan101/smriti)  
> **Production Sanctuary:** [https://smriti.tech](https://smriti.tech) (Hosted on Render)  
> **License:** MIT (Free & Open Source Forever)

---

## 1. Project Soul & Core Philosophy

When someone we love dies, what remains of them is scattered: a voice note where they were laughing in traffic, a recipe scribbled on an envelope, the quiet advice they gave you on a terrace at 2:00 AM when your life was falling apart.

In recent years, commercial AI has begun packaging grief. Startups invite users to upload intimate diaries, home videos, and voicemails to closed corporate servers, returning "digital resurrections"—creepy conversational chatbots that pretend the dead are still alive, hallucinate conversations that never happened, and turn grief into a recurring monthly subscription tier. When the venture capital runs out, your grandmother's digital presence goes 404.

**Smriti refuses that reality.**

In ancient Sanskrit, **Smriti** (स्मृति) means *Remembrance*—that which lives on in active memory. But the ritual of remembrance is universal across all human geography. Whether lighting a candle in a quiet European chapel, releasing a paper lantern onto water in Japan, or gathering around a family table in Varanasi, humanity has always remembered the departed with a **gentle light in the dark**.

Smriti is an open-source, privacy-first sanctuary. It does not attempt to "resurrect" anyone. It does not generate fake digital ghosts. Instead, it gathers scattered photographs, stories, voicemails, and quotes into a sovereign digital altar where you can sit quietly beside their memory.

* **Universal Reverence:** Anchored by a solitary, living candle flame beside their portrait.
* **Strictly Factual (Zero Hallucination):** Architecturally prohibited from inventing memories. Every reflection is grounded exclusively in verified fragments you provided.
* **Acoustic Peace:** Pure 432Hz harmonic acoustic soundscapes with zero annoying radio hiss, tape static, or artificial noise.
* **A Single Memory is Already Whole:** If you only have one photo or one phrase they always said, Smriti honors it completely without ever displaying *"Profile 10% complete—add more data."*

---

## 2. The Flagship Centerpiece: The Memory Reel

The game-changing heart of Smriti. The **Memory Reel** weaves a loved one's preserved photographs, video clips, and heartfelt written stories into a cinematic, Spotify Wrapped-style slideshow that lives permanently upon their altar.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  ▬▬ ▬▬ ▬▬ ▬▬ ▬▬ ▬▬ ▬▬ ▬▬ [Spotify Wrapped Story Progress Bars]       [✕ Close] [Mute]  │
├──────────────────────────────────────────┬─────────────────────────────────────────────┤
│                                          │                                             │
│       [ Archival Brass Bezel ]           │   🗓️ Monsoon 2018  •  📍 Old Delhi Station   │
│                                          │                                             │
│       Adaptive Contain Framing           │   The Midnight Chai at Old Delhi Station    │
│       + Ambient Blurred Aura             │                                             │
│       (Zero Image Clipping)              │   "Whenever it rained, Arjun would order    │
│                                          │    cutting chai and say 'Everything works   │
│       Subtle Ken Burns Drift             │    out in the end, bhai.' He carried a      │
│       [🕯️ Living Corner Flame]           │    dog-eared copy of Shantaram..."          │
│                                          │                                             │
│     🔍 [Click Photo to Inspect]          │   🎵 Peaceful Piano Dusk [Rotating Vinyl]   │
└──────────────────────────────────────────┴─────────────────────────────────────────────┘
```

### Key Architectural Pillars of the Memory Reel:
1. **Layout A (Cinematic Split):**
   * **Left Bezel:** Photograph framed in an archival brass & dark wood bezel with subtle Ken Burns breathing drift (`1.0` to `1.04` zoom over 11 seconds), realistic glass candlelight reflections, and a corner living candle flame.
   * **Adaptive Contain Framing:** Built with `object-fit: contain` paired with an ambient blurred background mirror (`filter: blur(28px) brightness(0.35) saturate(1.2)`). This guarantees **zero image cropping**—vertical smartphone portraits (3:4, 9:16), square photos (1:1), and wide shots (16:9) remain 100% visible without cutting off heads or bodies.
   * **Right Narrative Panel:** Spacetime coordinates (`🗓️ [When] • 📍 [Where]`), moment title, and the quiet written narrative rendered in elegant *Cormorant Garamond* serif prose.
2. **Spotify Wrapped-Style Story Bars:**
   * Segmented progress bars at the very top (`▬▬ ▬▬ ▬▬`) indicating story progression.
   * Smooth 11-second auto-advancement; click any bar to jump immediately to that memory.
   * **Instant Preloading:** Employs `new Image()` prefetching on adjacent slides to ensure zero flicker or popping between memories.
   * **Full Keyboard Navigation:** `Space` (pause/play), `←` / `→` (previous/next slide), and `Esc` (exit reel).
3. **Triple-Dock Sanctuary Soundtrack:**
   * **Offline Audio Upload:** Upload an MP3/WAV file of "Their Song" directly to their altar.
   * **Spotify Direct Embed:** Paste any Spotify track URL for native web streaming.
   * **Curated Procedural Presets:** Choose from built-in acoustic compositions (*Peaceful Piano Dusk*, *Twilight Sarod*, *Warm Acoustic Strings*, *Rain & Wind Chimes*).
   * Features a softly spinning vinyl record badge and a one-click mute/pause toggle.
4. **Read-Only Reverent Dignity:**
   * Strictly human heartfelt stories with **zero** robotic AI speech readout over the slideshow, preserving the authenticity and emotional purity of each remembered moment.
5. **Interactive Heirloom Lightbox:**
   * Clicking any photograph during the slideshow pauses the reel and opens the image in a full-screen, high-definition inspection modal with ambient backdrop aura, spacetime metadata, and the complete narrative.

---

## 3. Comprehensive Sanctuary Features

### 🕯️ Feature 1 — The Sanctuary (Living Altar Shelf)
The home screen is a quiet room at dusk. Each remembered person rests as a softly glowing portrait beside a living candle flame on an uncluttered shelf. Shipped with 3 pristine seed profiles (*Arjun Mehta*, *Rekha Sharma*, *David Miller*) with immediate Memory Reel playback and a built-in seed utility (`npm run seed`).

### 🌸 Feature 2 — The Offering (Reel-First Creator & Ceremony)
Transforms memorial creation into crafting a living Memory Reel from moment one:
* **Who Are We Honoring:** Name, relationship, and circular altar portrait upload with live inspection and a dedicated *"Change Photo"* control.
* **Dynamic Moments Builder:** Add unlimited photos and videos (up to 50MB) with heartfelt stories written in *Cormorant Garamond*, moment titles, and generalized spacetime pinning (`When? e.g. During Diwali, childhood, college days...`).
* **Interactive Media Controls:** Preview dropzone features hover zoom indicators, full-screen inspect buttons, and quick media replacement.
* **Sacred Hold-to-Light Flame Ceremony:** Holding the ceremonial button for 1.8 seconds ignites their flame, persists all moments and soundtracks, and launches their Memory Reel slideshow finale.
* **Quiet Local Draft Auto-Save:** Automatically saves in-progress drafts in browser storage so no memory is lost to an accidental tab refresh.

### 📜 Feature 3 — A Place to Remember (Adaptive Grounding & Slow Ink)
Selecting a loved one's portrait opens their personal altar:
* **Google Gemma Grounding:** Synthesizes deeply comforting reflections anchored **strictly** to uploaded fragments with zero hallucinations. Minimal, reverent attribution labeled simply as **Gemma**.
* **Slow Ink Emergence:** Gentle, typewriter-paced writing reveal with a glowing ink quill cursor.
* **Citation Artifact Unfolding:** Clicking any bracketed citation (`[Chai stall memory, 2018]`) unfolds the original preserved artifact modal with its exact spacetime coordinates and sensory anchors.
* **"A Place to Remember" Header:** Replaces robotic AI mode labels with dignified, human presence tracking (`A Place to Remember • 3 memories preserved`).

### 🕊️ Feature 4 — Sit with Them (Silent Meditation Hearth)
A dedicated sanctuary for wordless presence:
* **Mindful 4-7-8 Breathing Guide:** An expanding and contracting golden halo guiding inhale (4s), hold (7s), and exhale (8s).
* **Tap-to-Tend 432Hz Chime:** Soft Web Audio chime tuned to 432Hz that gently flares the hearth embers.
* **Clean Experience:** Free of artificial AI jargon or robotic labels.

### 🎵 Feature 5 — Pure Acoustic Sanctuary Engine
* **Zero Annoying Hiss / Radio Static:** Replaces harsh white/pink noise filters with mathematically harmonic frequencies.
* **Procedural Pentatonic Chimes:** Synthesizes 432Hz fundamental frequencies (`[432, 486, 576, 648, 729]` Hz) with natural exponential gain decay.
* **Warm Rain Droplets:** Filtered sine droplets (1800Hz - 2400Hz) with 45ms burst decay.
* **Sub-Octave Breeze:** Dual sine oscillators tuned to 108Hz and 216Hz for a warm, grounding presence.
* **Analog Warmth Filter:** Web Audio `BiquadFilterNode` configured as a low-pass filter at 6800Hz, softening digital edges into vintage vinyl warmth.
* **Studio Audio Ducking:** Automatically ducks ambient soundscapes by 65% whenever voice recordings or ElevenLabs readouts play.

### ✉️ Feature 6 — The Keepsake Letter (Story-Extracted Heirloom Export)
One-click generation of a printable, frame-worthy archival letter:
* **Story-Extracted Wisdom:** Directly pulls preserved quotes, moments, and spacetime coordinates from their Memory Reel photo stories into Gemma's synthesis.
* **Archival Deckled Parchment:** Renders with authentic torn paper edges, fold crease lines, moment thumbnails, and a dimensional crimson/gold Sanskrit wax seal stamp (`स्मृ`).
* **High-Resolution Print Layout:** Custom `@media print` styling removes dark backgrounds and prepares crisp typography for physical framing.

---

## 4. Hacktoberfest 2026: Partner Technology Architecture

Smriti was engineered from the ground up for **Hacktoberfest 2026 — Week 4: Ghost in the Machine**, integrating 7 sponsored partner technologies across the stack:

| Partner Category | Technology Used | Architectural Role & Implementation | Prize Exposure |
|---|---|---|---|
| **Best Use of Gemma** | **Google Gemma** (Ollama / Cloud API) | Powers the zero-hallucination reflection engine (`server/mastra/tools/synthesize.js`). Synthesizes wisdom and comfort strictly anchored to retrieved memory chunks at temperature `0.3`. | **$200** |
| **Best Use of Mastra** | **Mastra Framework** (TypeScript/JS) | Orchestrates the deterministic agent workflow (`server/mastra/agent.js`) across three distinct tools: `retrieveStep` (vector search), `densityGateStep` (sparse vs. conversational routing), and `synthesizeStep` (grounded reflection). | **$100** |
| **Best Use of MongoDB Atlas** | **MongoDB Atlas + Vector Search** | Cryptographic cloud memory storage with Atlas Vector Search for semantic chunk retrieval, backed by an offline local JSON fallback (`server/data/sanctuary_db.json`). | **$100** |
| **Best Use of ElevenLabs** | **ElevenLabs Voice API** | High-fidelity, respectful voice synthesis engine for preserved wisdom notes, paired with automated citation tag stripping and studio audio ducking (`server/routes/voice.js`). | **$100** |
| **Best Use of Sentry** | **Sentry Distributed Tracing** | Full OpenTelemetry tracing across all agent tools (`mastra.tool.retrieve`, `mastra.tool.densityGate`, `gemma.synthesize`, `elevenlabs.speech`) with sanitized privacy parameters (`server/sentry.js`). | **$100** |
| **Best Use of Render** | **Render Cloud Platform** | Zero-downtime full-stack deployment using an Infrastructure-as-Code Blueprint (`render.yaml`) orchestrating client and server services. | **$200** |
| **Best Use of a .tech Domain** | **.tech Domain Registry** | Custom sovereign domain deployed at **[smriti.tech](https://smriti.tech)** for an authentic, dignified web presence. | **$100** |

**Total Sponsor Prize Exposure: $900 across 7 partner categories.**

---

## 5. Architectural Data Flow

```
                      [User Memory Offering]
                     (Photos, Stories, Audio)
                                │
                                ▼
         Multer Media Ingestion (/uploads) & Local Draft
                                │
                                ▼
         Vector Embedding Pipeline (Cosine Similarity)
                                │
                                ▼
    Storage Engine: Local JSON (sanctuary_db.json) / Mongo Atlas
                                │
                                ▼
               User Enters Altar or Plays Reel
                                │
            ┌───────────────────┴───────────────────┐
            ▼                                       ▼
  [The Memory Reel]                       [A Place to Remember]
  - Ken Burns Framing                     - Mastra Agent Pipeline:
  - Contain Aura (No Crop)                  1. Retrieve top-k chunks
  - Spotify Wrapped Bars                    2. Density Gate (Sparse/Dense)
  - 432Hz Sanctuary Audio                   3. Gemma Grounded Synthesis
  - Clickable Lightbox                      4. Slow Ink Quill Reveal
            │                                       │
            ▼                                       ▼
  Permanent Altar Placement              Frame-Ready Keepsake Letter
```

---

## 6. What Smriti Deliberately Does NOT Do

* ❌ **No user accounts, tracking cookies, or passwords**
* ❌ **No social sharing, public feeds, or vanity likes**
* ❌ **No chat history sidebars or productivity clutter**
* ❌ **No fake personality mimicry or creepy "resurrection" bots**
* ❌ **No corporate training on private grief fragments**
* ❌ **No hallucinated memories — ever**

---

## 7. Getting Started

### 7.1 Prerequisites
* Node.js v18+ (tested on Node v20 and v24)
* npm v9+

### 7.2 Installation & Local Setup
```bash
# Clone the repository
git clone https://github.com/Supersaiyan101/smriti.git
cd smriti

# Install dependencies across monorepo workspaces
npm install

# Start both Vite client (port 5173) and Express server (port 3001)
npm run dev
```

Visit **[http://localhost:5173](http://localhost:5173)** to open the sanctuary.

### 7.3 Database Seed Script
To restore the 3 pristine seed profiles (*Arjun Mehta*, *Rekha Sharma*, *David Miller*) with Memory Reels and stories:
```bash
npm run seed
```

### 7.4 Verification Test Suite
Smriti includes 4 automated verification suites covering 100% of core flows:
```bash
npm run test -w server
```
* **Suite 1:** Core REST API and profile lifecycle integration test.
* **Suite 2:** Phase 3 Gemma Brain solitary flame vs. dense conversational RAG test.
* **Suite 3:** Phase 4 ElevenLabs speech engine and Keepsake Letter generation test.
* **Suite 4:** Depth Features test covering sensory anchors, unsent letters, Memory Reel slides, and soundtrack synchronization.

### 7.5 Production Build
```bash
npm run build -w client
```

---

## 8. Design Language Tokens

| Token | Value | Purpose |
|---|---|---|
| `--bg-sanctuary` | `#0D0A08` | Deep dusk near-black backdrop |
| `--surface-card` | `rgba(23, 17, 13, 0.75)` | Smoked dark glass container surface |
| `--flame` | `#E8A847` | Warm candlelight amber accent |
| `--flame-bright` | `#F5C564` | Glowing flame tip highlight |
| `--text-primary` | `#F5EDD6` | Soft cream parchment foreground |
| `--text-muted` | `#9E8C78` | Reverent sepia secondary text |
| `--font-heading` | `'Cormorant Garamond', Georgia, serif` | Timeless literary serif typography |
| `--font-body` | `'Inter', system-ui, sans-serif` | Clean, legible sans-serif |

---

## 9. Submission Details & License

* **Project Title:** *Smriti: When someone you love passes away, their words scatter. Gemma and local speech gathered them into an open-source altar.*
* **Event:** Hacktoberfest 2026 — Week 4: Ghost in the Machine
* **Developer Guide:** See [`DEV.md`](DEV.md) for full architecture and engineering specifications.
* **Submission Draft:** See [`DEVPOST.md`](DEVPOST.md) for the Devpost/DEV.to story submission.
* **License:** [MIT License](LICENSE) — Free, universal, and open source forever.
