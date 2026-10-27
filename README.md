# Smriti (स्मृति)
### *"A place for those who live on in you."*

> **Hacktoberfest 2026 — Week 4: Ghost in the Machine**
> An open-source, universal, privacy-first sanctuary of remembrance. Smriti gathers scattered memory fragments of loved ones who have passed — friends, parents, partners, mentors, siblings — and allows the living to revisit their wisdom, hear their voice, and find solace. No corporate cloud. No hallucinated memories. No dark spectacle. Just warmth, honesty, and universal human dignity.

---

## 1. Project Soul & Core Philosophy

When someone we love dies, what remains is scattered: a voice note where they laughed, a recipe scribbled on a napkin, the advice they gave at 2am when we were falling apart.

Commercial AI often treats this with dark voyeurism or clinical extraction: uploading intimate fragments to corporate servers where they become training fodder.

**Smriti refuses that.**

- **Universal human tradition.** In every culture across history — from vigil candles to floating lanterns — remembering someone begins with lighting a gentle flame in the dark. The name *Smriti* is ancient Sanskrit for *Remembrance*, but the sanctuary is universal.
- **Open-weight, privacy-first.** Powered by Google Gemma running locally or on user-controlled infrastructure. Memories never leave user custody.
- **Strictly factual (Zero Hallucination).** Smriti is architecturally prevented from inventing memories. Every response is anchored to uploaded fragments. If it cannot find grounding, it says so with gentle honesty.
- **A single memory is already complete.** One quote, one voicemail, or one photo is enough. The app never measures grief in data volume or displays "profile incomplete" warnings. A single flame lights the room.

---

## 2. The Features & The Flagship Memory Reel

### 🎞️ Flagship Centerpiece — The Memory Reel (स्मृति कथा)
The game-changing heart of Smriti. The Memory Reel weaves a loved one's preserved photographs and heartfelt written stories into a cinematic, Spotify Wrapped-style slideshow that lives permanently upon their altar.

* **Layout A (Cinematic Split):**
  - **Left Half:** High-resolution portrait framed in an archival brass & dark wood bezel with subtle Ken Burns drift (1.0 to 1.04 breathing zoom over 11 seconds), realistic glass reflection, and a corner living candle flame.
  - **Right Half:** Spacetime pinning badge (`🗓️ [When] • 📍 [Where]`), moment title, and the quiet written narrative in large, elegant *Cormorant Garamond* serif prose.
* **Spotify Wrapped-Style Story Bars:** Segmented progress bars at the very top (`▬▬ ▬▬ ▬▬`) indicate story progression, automatically advances to the next moment, clickable to jump, with pause-on-hover and keyboard arrow controls (`←`, `→`, `Esc`, `Space`).
* **Sanctuary Soundtrack Engine:** Plays an uploaded MP3 of "Their Song" or curates procedural acoustic sanctuary melodies (*Peaceful Piano Dusk*, *Twilight Sarod*, *Warm Acoustic Strings*, *Rain & Wind Chimes*), accompanied by a gently rotating vinyl badge and quick mute toggle.
* **Read-Only Reverent Dignity:** Strictly human heartfelt stories with **zero** robotic AI speech readout over the slideshow, preserving the authenticity and emotional purity of each remembered moment.
* **Permanent Altar Placement:** Saved permanently to the profile so family members can revisit the reel anytime they need to feel close.

---

### Feature 1 — The Sanctuary (Living Altar Shelf)
The home screen is a quiet room at dusk. Each remembered person rests as a softly glowing portrait beside a living candle flame on an uncluttered shelf. Shipped with 3 pristine seed profiles (*Arjun Mehta*, *Ananya Bose*, *David Miller*) with immediate Memory Reel playback and a built-in seed utility (`npm run seed`).

### Feature 2 — The Offering & Archival Journal
A tender 3-step memory drop for text, voice, and photographs:
- **Archival Linen Journal Leaf:** Warm serif script with margin rules and dimensional Sanskrit wax seal stamp (`स्मृ`).
- **Sensory Inspiration Quick-Chips:** One-tap chips for Weather (*Monsoon rain*, *Golden hour sunset*, *Winter frost*), Scent (*Cardamom chai*, *Woodsmoke & pine*, *Jasmine*), and Song (*Acoustic guitar*, *Late night radio*, *Slow piano*).
- **Quiet Local Draft Auto-Save:** Automatically preserves in-progress reflections to local browser storage so not a single word is lost to tab closures or interruptions.

### Feature 3 — The Remembrance (Adaptive Grounding & Slow Ink)
Clicking a portrait brings full focus to their hearth:
- **Google Gemma Grounding:** Synthesizes deeply comforted, second-person reflections anchored **strictly** to uploaded fragments with zero hallucinations.
- **Slow Ink Emergence:** Gentle, typewriter-paced writing reveal with a glowing ink quill cursor.
- **Citation Artifact Unfolding:** Clicking any bracketed citation (`[Chai stall memory, 2018]`) unfolds the original preserved artifact modal with its exact spacetime coordinates and sensory anchors.
- **Reflection vs. Conversational Modes:** Dynamically adapts based on memory density (sparse solitary flame vs. dense conversation).

### Feature 4 — The Vigil ("Sit with Them")
A dedicated meditation sanctuary for wordless presence:
- **Mindful 4-7-8 Breathing Guide:** Expanding and contracting golden ring guiding inhale, hold, and release.
- **Tap-to-Tend 432Hz Chime:** Soft Web Audio chime tuned to 432Hz that replenishes embers.

### Feature 5 — The Voice & Ambient Soundscapes
- **Studio Audio Ducking:** Ambient rain/tanpura automatically ducks (-65%) whenever voice recordings or ElevenLabs readouts play.
- **Analog Warmth Filter:** Web Audio low-pass filter (6800Hz) that softens digital harshness into vintage vinyl warmth.

### Feature 6 — The Keepsake Letter (Heirloom Export)
One-click generation of a single printable, frame-worthy archival letter featuring deckled paper borders, their featured quote, a Gemma-penned reflection, and a dimensional Sanskrit wax seal stamp.

---

---

## 3. What Smriti Deliberately Does NOT Do
- ❌ No user accounts, sign-up, or passwords
- ❌ No social sharing, public feeds, or external vanity links
- ❌ No chat history sidebars or clutter
- ❌ No fake personality tuning or "resurrection" roleplay
- ❌ No spooky, horror, or dark aesthetics
- ❌ No hallucinated memories — ever

---

## 4. Design Language (Quiet & Universal)

**One word: Quiet.**

| Element | Decision |
|---|---|
| **Atmosphere** | A quiet room at dusk. Universal, warm, reverent. |
| **Background** | Near-black `#0D0A08` — deep sanctuary warmth |
| **Primary Accent** | Warm candlelight amber `#E8A847` for flames and glow |
| **Text Color** | Soft cream `#F5EDD6` — gentle on the eyes |
| **Heading Font** | *Cormorant Garamond* (warm, serif, timeless) |
| **Body Font** | *Inter* or *DM Sans* (clean, legible) |
| **Living Element** | A solitary, gentle flame beside the portrait |
| **Layout** | One focal element per screen. Zero clutter. |

---

## 5. Tech Stack & Partner Architecture

| Layer | Technology | Partner Category |
|---|---|---|
| **Core Brain** | Google Gemma (Ollama local / API) | Best Use of Gemma ($200) |
| **Voice Output** | ElevenLabs TTS API | Best Use of ElevenLabs ($100) |
| **Storage & Retrieval** | MongoDB Atlas + Atlas Vector Search | Best Use of MongoDB Atlas ($100) |
| **Agent Orchestration** | Mastra (TypeScript) | Best Use of Mastra ($100) |
| **Hosting** | Render | Best Use of Render ($200) |
| **Observability** | Sentry Agent Tracing | Best Use of Sentry ($100) |
| **Domain** | `.tech` domain (e.g. `smriti.tech`) | Best Use of a .tech Domain ($100) |
| **Frontend** | React + Vite | — |
| **Backend** | Node.js / Express or Hono | — |

**Total Prize Exposure: $900 across 7 partner categories.**

### Data Flow
```
User uploads [audio / text / photo]
         │
         ▼
Transcription (Whisper / Web Speech) + chunking
         │
         ▼
MongoDB Atlas Vector Search (embeddings stored)
         │
User query / prompt
         │
         ▼
Mastra Agent Pipeline:
   ├─ [Atlas Vector Search] → retrieve top-k memory chunks
   ├─ [Density Gate] → determine Conversational vs. Reflection Mode
   ├─ [Guardrail] → verify assertions against retrieved chunks
   ├─ [Gemma] → synthesize grounded response + inline citations
   └─ [ElevenLabs] → stream audio readout
         │
         ▼
UI renders: text reflection + audio player + source citations
```

---

## 6. Instructions for AI Agents & Developers

### Tone
- Dignified, universal, peaceful, hopeful.
- Gemma responses must read like a gentle letter, never a customer support bot or spooky ghost.

### Architectural Rules
1. **Never call Gemma without context.** No retrieved chunks = no free hallucinated generation.
2. **Support sparse data with grace.** Never throw an error if a user has only 1 memory. Engage Reflection Mode.
3. **No UI clutter.** The emotional experience and feel are paramount over complex widgetry.
4. **Wrap every agent step in Sentry spans** (`retrieve`, `guard`, `gemma_synthesize`, `elevenlabs_speak`).

---

## 7. Build Phases (Locked — 5 Phases)

> **For AI Agents:** Each phase lists exact files to create, acceptance criteria, and dependencies. Complete each phase fully before moving to the next. The project root is `smriti/`.

---

### Phase 1 — Foundation & The Sanctuary (Skeleton)
**Goal:** Scaffold the full project, install all dependencies, establish the design system, and render the Sanctuary home screen with a static portrait card + animated candle flame. Backend server boots and responds to health check.

**Deliverables:**
| File / Directory | Purpose |
|---|---|
| `package.json` | Monorepo root with workspaces: `client/`, `server/` |
| `client/` | Vite + React app |
| `client/index.html` | Entry HTML with Google Fonts (Cormorant Garamond, Inter) |
| `client/src/main.jsx` | React entry point |
| `client/src/App.jsx` | Root component with React Router (routes: `/`, `/offer`, `/remember/:id`, `/letter/:id`) |
| `client/src/index.css` | Full design system: CSS custom properties, reset, typography, animations |
| `client/src/components/CandleFlame.jsx` | Animated SVG/CSS candle flame component |
| `client/src/components/PortraitCard.jsx` | Single portrait card (photo, name, relationship, flame) |
| `client/src/pages/Sanctuary.jsx` | Home page: renders portrait grid + "+" button. Uses hardcoded mock data for now. |
| `client/vite.config.js` | Vite config with proxy to backend |
| `server/` | Express/Hono backend |
| `server/index.js` | Server entry: boots on port 3001, `/api/health` returns `{ status: "ok" }` |
| `server/package.json` | Backend dependencies |

**Acceptance Criteria:**
- [ ] `npm install` succeeds from root
- [ ] `npm run dev` starts both client (port 5173) and server (port 3001)
- [ ] Browser shows The Sanctuary: dark ambient background, 2 mock portrait cards with glowing candle flames, cream text, Cormorant Garamond headings
- [ ] Clicking `+` navigates to `/offer` (blank page is fine for now)
- [ ] `/api/health` returns JSON `{ status: "ok" }`

---

### Phase 2 — The Offering & MongoDB Storage
**Goal:** Build the 3-step memory upload form, connect MongoDB Atlas, store profiles and memory fragments, and render real data on the Sanctuary.

**Deliverables:**
| File / Directory | Purpose |
|---|---|
| `client/src/pages/Offering.jsx` | 3-step form: name/relationship → memory fragments (text/audio/photo) → "Light their flame" |
| `client/src/components/GentleWhispers.jsx` | Optional soft prompts for users who feel blank |
| `client/src/components/MemoryInput.jsx` | Text area + audio recorder + photo upload |
| `server/db.js` | MongoDB Atlas connection (using `mongodb` driver) |
| `server/routes/profiles.js` | `POST /api/profiles` (create), `GET /api/profiles` (list all) |
| `server/routes/memories.js` | `POST /api/memories` (upload fragments), `GET /api/memories/:profileId` |
| `server/middleware/upload.js` | Multer config for audio/photo uploads |

**Acceptance Criteria:**
- [ ] User can fill the 3-step form and submit
- [ ] Profile + memory fragments persist in MongoDB Atlas
- [ ] Sanctuary home screen renders real profiles from the database
- [ ] Audio recording works in-browser via MediaRecorder API
- [ ] Photo upload shows preview before submission

---

### Phase 3 — The Brain (Gemma + Mastra + Vector Search)
**Goal:** Build the full AI pipeline: embed memories → store vectors → retrieve → density gate → Gemma synthesis with citations → Reflection Mode for sparse data. Orchestrated by Mastra. Traced by Sentry.

**Deliverables:**
| File / Directory | Purpose |
|---|---|
| `server/embeddings.js` | Generate embeddings for memory chunks (Gemma embeddings or sentence-transformers) |
| `server/vectorSearch.js` | Atlas Vector Search: index creation, query top-k similar chunks |
| `server/mastra/agent.ts` | Mastra workflow: `retrieve → densityGate → guard → synthesize` |
| `server/mastra/tools/retrieve.ts` | Tool: query Atlas Vector Search for relevant memory chunks |
| `server/mastra/tools/densityGate.ts` | Tool: count chunks, decide Conversational vs. Reflection Mode |
| `server/mastra/tools/synthesize.ts` | Tool: call Gemma with retrieved context + system prompt, return cited response |
| `server/routes/converse.js` | `POST /api/converse` — accepts query + profileId, returns grounded response |
| `server/sentry.js` | Sentry SDK init + custom spans for each pipeline step |
| `client/src/pages/Remembrance.jsx` | Full remembrance screen: portrait focus, query input, response display with citations |

**Acceptance Criteria:**
- [ ] Uploading a memory auto-generates and stores its vector embedding
- [ ] User query retrieves relevant chunks via cosine similarity
- [ ] Density gate correctly routes: ≥4 chunks → Conversational, 1-3 → Reflection Mode
- [ ] Gemma response includes inline citations `[Source Label]`
- [ ] If no chunks pass similarity threshold, user sees gentle "Add more memories" prompt
- [ ] Sentry dashboard shows spans for each pipeline step

---

### Phase 4 — The Voice & The Keepsake Letter
**Goal:** Integrate ElevenLabs TTS for audio readout of responses. Build the printable Memory Letter export.

**Deliverables:**
| File / Directory | Purpose |
|---|---|
| `server/routes/voice.js` | `POST /api/voice` — accepts text, returns ElevenLabs audio stream |
| `client/src/components/VoicePlayer.jsx` | Soft play button, audio waveform, pulsing animation while loading |
| `client/src/pages/KeepsakeLetter.jsx` | Printable letter layout: photo, quote, Gemma-written passage |
| `client/src/components/PrintLayout.css` | Print-specific styles (`@media print`) for clean output |
| `server/routes/letter.js` | `POST /api/letter` — generates the keepsake letter content via Gemma |

**Acceptance Criteria:**
- [ ] Every remembrance response has a play button that streams audio
- [ ] Audio plays smoothly with a gentle pulsing animation
- [ ] Memory Letter renders a beautiful, printable single-page keepsake
- [ ] `Ctrl+P` / browser print produces a clean, frame-worthy page
- [ ] ElevenLabs API errors are handled gracefully (silent fallback, no crash)

---

### Phase 5 — Polish, Deploy & Submit
**Goal:** Deploy to Render, register `.tech` domain, final UI polish, write the DEV.to submission post.

**Deliverables:**
| File / Directory | Purpose |
|---|---|
| `render.yaml` | Render Blueprint: web service (client) + API service (server) |
| `.env.example` | Template for all required env vars |
| `DEVPOST.md` | Full DEV.to submission post draft following the winning structure |
| Final UI polish | Transitions, loading states, error states, responsive design, favicon |
| `LICENSE` | MIT license file |

**Acceptance Criteria:**
- [ ] App is live on Render at a public URL
- [ ] `.tech` domain points to the Render deployment
- [ ] All 7 partner integrations are functional and demonstrable
- [ ] DEV.to post is complete with demo GIF, architecture diagram, and partner breakdowns
- [ ] Lighthouse score ≥ 90 on performance
- [ ] README badges: license, deploy status, tech stack

---

## 8. Submission Metadata

- **Title (locked):** *"Smriti: When someone you love passes away, their words scatter. Gemma and local speech gathered them into an open-source altar."*
- **Tags:** `#devchallenge` `#hf26challenge` `#gemma` `#opensource`
- **DEV Post Sections:** The Story → What I Built → The Sanctuary (Demo) → Architecture → Why Open Innovation Matters → My First User → Partner Breakdowns
- **License:** MIT
