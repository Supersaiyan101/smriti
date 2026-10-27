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
        // Find best candidate for featured quote
        let featuredQuote = '';
        if (memories.length > 0) {
          // Look for memories with quotation marks or short impactful phrases
          const quoteCandidate = memories.find(m => m.content.includes('"')) || memories[0];
          featuredQuote = quoteCandidate.content.replace(/^["']|["']$/g, '');
        } else {
          featuredQuote = `Carried forever in the quiet sanctuary of our thoughts.`;
        }

        const contextBlocks = memories
          .map((m, i) => `Fragment ${i + 1} (${m.sourceLabel || 'Memory'}):\n"${m.content}"`)
          .join('\n\n');

        let passage = '';
        let closing = `In loving remembrance of ${profile.name}.`;

        // Attempt generation with Google Gemma
        if (memories.length > 0) {
          const prompt = `You are writing a timeless, dignified Keepsake Letter of Remembrance for ${profile.name} (${profile.relationship}).
The letter will be printed and kept as an heirloom by the person who loved them.
CRITICAL RULES:
1. Speak with warmth, dignity, and gentle reverence.
2. Ground every sentence strictly in what was shared in the memories below. Do NOT invent fake biographical events.
3. Write 2 short, heartfelt paragraphs reflecting on the love, warmth, and enduring wisdom they left behind.
4. Keep it calm, poetic, and hopeful.

PRESERVED MEMORIES:
${contextBlocks}

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
            // Proceed to grounded fallback if Ollama not running
          }
        }

        // Grounded fallback passage
        if (!passage) {
          if (memories.length > 0) {
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
