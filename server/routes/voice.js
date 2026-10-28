import express from 'express';
import dotenv from 'dotenv';
import { traceSpan } from '../sentry.js';

dotenv.config();

const router = express.Router();

// Default calm, warm ElevenLabs voice ID (e.g. Rachel / George / Adam)
// Rachel (21m00Tcm4TlvDq8ikWAM) is an acclaimed warm, empathetic narration voice
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

/**
 * Strips robotic prompt echoes, bracketed citations, and unnatural syntax
 * to produce dignified, human-sounding narrative prose for speech synthesis.
 */
export function cleanSpeechText(raw) {
  if (!raw) return '';
  return raw
    // Strip citation tags like [Source Label] or [Sunday kitchen, 2015]
    .replace(/\[.*?\]/g, '')
    // Strip boilerplate intro phrases from reflection prompts
    .replace(/^Looking back at what.*?left with you:\s*/i, '')
    .replace(/^In the quiet of this flame, here is what you carry.*?:\s*/i, '')
    // Strip repetitive transitional phrases
    .replace(/They also shared:\s*/gi, '')
    // Strip closing boilerplate echoes
    .replace(/These words remain rooted and true\.?/gi, '')
    .replace(/Even when words are few, holding onto this truth.*?\.?/gi, '')
    // Replace multiple line breaks with gentle natural spacing
    .replace(/\n+/g, ' ')
    // Remove harsh quotation marks that cause TTS models to say "quote" or pause awkwardly
    .replace(/["“”'‘’]/g, '')
    // Collapse excess whitespace
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * POST /api/voice
 * Body: { text: string, voiceId?: string }
 * Streams back audio/mpeg from ElevenLabs, or returns fallback signal for Web Speech API
 */
router.post('/', async (req, res) => {
  try {
    const { text, voiceId } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: 'Text is required for voice readout' });
    }

    const cleanText = cleanSpeechText(text);

    return await traceSpan(
      'elevenlabs.text_to_speech',
      'ai.speech',
      { textLength: cleanText.length, voiceId: voiceId || DEFAULT_VOICE_ID },
      async () => {
        // If ElevenLabs API Key is configured, stream from ElevenLabs
        if (ELEVENLABS_API_KEY) {
          const targetVoice = voiceId || DEFAULT_VOICE_ID;
          const elevenUrl = `https://api.elevenlabs.io/v1/text-to-speech/${targetVoice}/stream`;

          const elevenRes = await fetch(elevenUrl, {
            method: 'POST',
            headers: {
              'xi-api-key': ELEVENLABS_API_KEY,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: cleanText,
              model_id: 'eleven_multilingual_v2',
              voice_settings: {
                stability: 0.55,
                similarity_boost: 0.85,
                style: 0.35,
                use_speaker_boost: true,
              },
            }),
          });

          if (!elevenRes.ok) {
            const errText = await elevenRes.text();
            console.warn(`[ElevenLabs Notice] ${elevenRes.status}: ${errText}. Using browser speech fallback.`);
            return res.json({
              success: true,
              fallback: true,
              text: cleanText,
              provider: 'Browser Speech Synthesis (ElevenLabs quota notice)',
            });
          }

          // Stream audio directly to client
          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('Transfer-Encoding', 'chunked');

          const reader = elevenRes.body.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value);
          }
          return res.end();
        }

        // When no ElevenLabs API key is provided, return fallback directive for native speech
        return res.json({
          success: true,
          fallback: true,
          text: cleanText,
          provider: 'Web Speech Synthesis Engine',
          instructions: 'ElevenLabs key not configured; using native client speech synthesis.',
        });
      }
    );
  } catch (err) {
    console.error('[Voice Route Error]', err);
    res.status(500).json({ success: false, error: err.message || 'Speech generation failed' });
  }
});

export default router;
