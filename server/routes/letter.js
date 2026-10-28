import express from 'express';
import { dbService } from '../db.js';
import { traceSpan } from '../sentry.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const GEMMA_BASE = process.env.GEMMA_API_BASE || 'http://localhost:11434';
const GEMMA_MODEL = process.env.GEMMA_MODEL || 'gemma2:9b';

/**
 * GET /api/letter/:profileId
 * Generates the Keepsake Letter content for a remembered person
 */
router.get('/:profileId', async (req, res) => {
  try {
    const { profileId } = req.params;

    const profile = await dbService.getProfileById(profileId);
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }

    const memories = await dbService.getMemoriesByProfile(profileId);

    return await traceSpan(
      'letter.generate_keepsake',
      'ai.keepsake',
      { profileId, memoriesCount: memories.length },
      async () => {
        // Separate Memory Reel slides/stories from general memories
        const reelStories = memories
          .filter(m => m.isReelSlide || m.type === 'photo' || m.type === 'video')
          .map(m => ({
            title: m.sourceLabel || m.title || 'Cherished Moment',
            story: m.content || '',
            when: m.timePlace?.when || '',
            where: m.timePlace?.where || '',
            mediaUrl: m.mediaUrl || '',
            type: m.type || 'photo',
          }));

        // Find best candidate for featured quote
        let featuredQuote = '';
        if (memories.length > 0) {
          // Look for memories or stories with quotation marks first
          const quoteCandidate = memories.find(m => m.content && m.content.includes('"'));
          if (quoteCandidate) {
            const matches = quoteCandidate.content.match(/"([^"]+)"/);
            featuredQuote = matches ? matches[1] : quoteCandidate.content.replace(/^["']|["']$/g, '');
          } else if (reelStories.length > 0 && reelStories[0].story) {
            // Take the first evocative sentence from the primary moment story
            const firstStory = reelStories[0].story.trim();
            const firstSentence = firstStory.split(/[.?!]/)[0];
            featuredQuote = firstSentence.length > 15 && firstSentence.length < 140
              ? firstSentence
              : firstStory.slice(0, 120);
          } else {
            featuredQuote = memories[0].content.slice(0, 120);
          }
        } else {
          featuredQuote = `Carried forever in the quiet sanctuary of our thoughts.`;
        }

        // Build structured context blocks detailing both photo stories and memory fragments
        const storyContextBlocks = reelStories.map((s, i) => {
          const coords = [s.when, s.where].filter(Boolean).join(' • ');
          return `Moment ${i + 1} ("${s.title}"${coords ? ` - ${coords}` : ''}):\nStory: "${s.story}"`;
        }).join('\n\n');

        const generalContextBlocks = memories
          .filter(m => !m.isReelSlide && m.type !== 'photo' && m.type !== 'video')
          .map((m, i) => `Memory Fragment ${i + 1} (${m.sourceLabel || 'Memory'}):\n"${m.content}"`)
          .join('\n\n');

        const fullContext = [storyContextBlocks, generalContextBlocks].filter(Boolean).join('\n\n');

        let passage = '';
        let closing = `In loving remembrance of ${profile.name}.`;

        // Attempt generation with Google Gemma
        if (memories.length > 0) {
          const prompt = `You are writing a timeless, dignified Keepsake Letter of Remembrance for ${profile.name} (${profile.relationship}).
The letter will be printed and kept as an heirloom by the person who loved them.
CRITICAL RULES:
1. Speak with warmth, dignity, and gentle reverence.
2. Ground every sentence strictly in what was shared in the photo stories and memories below. Weave in the specific moments, places, and heartfelt stories (e.g. when and where they happened, what they did, what they said).
3. Do NOT invent fake biographical events.
4. Write 2 short, heartfelt paragraphs reflecting on the love, warmth, and enduring wisdom they left behind.
5. Keep it calm, poetic, and hopeful.

PRESERVED PHOTO STORIES & MEMORIES:
${fullContext}

WRITE THE REMEMBRANCE PASSAGE:`;

          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 4000);

            const gemmaRes = await fetch(`${GEMMA_BASE}/api/generate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: GEMMA_MODEL,
                prompt,
                stream: false,
                options: { temperature: 0.35 },
              }),
              signal: controller.signal,
            });

            clearTimeout(timeout);

            if (gemmaRes.ok) {
              const data = await gemmaRes.json();
              if (data.response && data.response.trim()) {
                passage = data.response.trim();
              }
            }
          } catch (err) {
            // Proceed to grounded fallback if Ollama/Gemma not running locally
          }
        }

        // Grounded fallback passage extracting directly from Reel stories and memories
        if (!passage) {
          if (reelStories.length > 0) {
            const storyHighlights = reelStories.slice(0, 3).map(s => {
              const coords = [s.when, s.where].filter(Boolean).join(' in ');
              return `the story of "${s.title}"${coords ? ` (${coords})` : ''}, where: "${s.story}"`;
            }).join('; and ');

            passage = `To remember ${profile.name} is to hold onto the gentle marks they left upon our lives. They gave us moments that remain steady even when the world shifts—reminding us of what is essential, kind, and true.\n\nIn the stories preserved across their Memory Reel—${storyHighlights}—these are not mere fragments of the past. They are living embers of love, laughter, and wisdom that continue to guide us in the quiet hours.`;
          } else if (memories.length > 0) {
            const memoryEchoes = memories.slice(0, 3).map(m => `"${m.content}"`).join(' ');
            passage = `To remember ${profile.name} is to hold onto the gentle marks they left upon our lives. They gave us moments that remain steady even when the world shifts—reminding us of what is essential, kind, and true.\n\nIn the words and memories preserved here: ${memoryEchoes}. These are not mere fragments of the past; they are living embers that continue to guide us in the quiet hours.`;
          } else {
            passage = `A flame lit in silence for ${profile.name}. Even in the quietest room, the love and grace they brought into this world continues to shine without end.`;
          }
        }

        const dateStr = new Date().toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        });

        res.json({
          success: true,
          letter: {
            profile: {
              id: profile._id,
              name: profile.name,
              relationship: profile.relationship,
              photoUrl: profile.photoUrl,
            },
            featuredQuote,
            passage,
            closing,
            date: dateStr,
            stories: reelStories,
            memoriesCount: memories.length,
            engine: 'Google Gemma Keepsake Generator',
          },
        });
      }
    );
  } catch (err) {
    console.error('[Letter Route Error]', err);
    res.status(500).json({ success: false, error: err.message || 'Could not generate keepsake letter' });
  }
});

export default router;
