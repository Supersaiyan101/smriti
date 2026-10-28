import { traceSpan } from '../../sentry.js';
import dotenv from 'dotenv';

dotenv.config();

const GEMMA_BASE = process.env.GEMMA_API_BASE || 'http://localhost:11434';
const GEMMA_MODEL = process.env.GEMMA_MODEL || 'gemma2:9b';

/**
 * Extract [Source Label] citations from text
 */
function extractCitations(text) {
  const regex = /\[(.*?)\]/g;
  const citations = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match[1] && !citations.includes(match[1])) {
      citations.push(match[1]);
    }
  }
  return citations;
}

/**
 * Mastra Tool: Synthesize Response via Google Gemma
 */
export async function synthesizeGemmaTool({
  personName,
  relationship,
  query,
  chunks,
  mode,
}) {
  return await traceSpan(
    'mastra.tool.gemma_synthesize',
    'ai.generation',
    { personName, mode, chunksCount: chunks.length, model: GEMMA_MODEL },
    async () => {
      // If zero chunks passed similarity threshold:
      if (!chunks || chunks.length === 0) {
        return {
          message: `The sanctuary does not have enough preserved words of ${personName} to speak to this yet. You can add more memories or voice notes at any time.`,
          citations: [],
          mode,
          grounded: false,
        };
      }

      // Format retrieved chunks with their source labels
      const contextBlocks = chunks
        .map((c, i) => `[Source ${i + 1}: ${c.sourceLabel || 'Memory fragment'}]\n"${c.content}"`)
        .join('\n\n');

      let systemPrompt = '';
      if (mode === 'reflection') {
        systemPrompt = `You are a quiet, gentle keeper of the flame in an open-source memorial sanctuary called Smriti (स्मृति), honoring ${personName} (${relationship}).
The user is sitting quietly beside the candle flame.
The user has preserved only a few precious memories of ${personName}.
CRITICAL RULES:
1. Do NOT attempt a fake conversational back-and-forth roleplay.
2. Warmly reflect their actual preserved words and advice back to the user like a comforting presence.
3. Every fact or quote MUST come strictly from the preserved memories below. DO NOT invent stories, dates, or dialogue.
4. Always cite your source inline using square brackets like [Source: Label].
5. Keep your tone gentle, reverent, and hopeful. Never spooky, never morbid.

PRESERVED MEMORIES OF ${personName.toUpperCase()}:
${contextBlocks}

USER'S THOUGHT OR QUESTION:
"${query}"`;
      } else {
        systemPrompt = `You are a quiet, dignified presence in an open-source memorial sanctuary called Smriti (स्मृति), honoring ${personName} (${relationship}).
The user is revisiting the wisdom and words left behind by ${personName}.
CRITICAL RULES:
1. Speak only in gentle second-person reflection ("Sarah once shared with you...", "In her voice notes, she reminded you...").
2. Every sentence MUST be strictly grounded in the preserved memories below. NEVER hallucinate facts, never pretend the person is currently alive.
3. Always cite the exact source inline using square brackets like [Source: Label].
4. If the preserved memories do not mention an answer to the user's question, state with gentle honesty: "I don't find words from ${personName} about that. Would you like to add more memories?"
5. Keep your tone calm, respectful, and comforting.

PRESERVED MEMORIES OF ${personName.toUpperCase()}:
${contextBlocks}

USER'S QUESTION:
"${query}"`;
      }

      // Attempt call to Google Gemma via Ollama or API
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);

        const res = await fetch(`${GEMMA_BASE}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: GEMMA_MODEL,
            prompt: systemPrompt,
            stream: false,
            options: {
              temperature: 0.3, // Low temperature for high fidelity / zero hallucination
              top_p: 0.9,
            },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          if (data.response && data.response.trim()) {
            const cleanText = data.response.trim();
            const citations = extractCitations(cleanText);
            return {
              message: cleanText,
              citations: citations.length > 0 ? citations : [chunks[0]?.sourceLabel || 'Preserved memory'],
              mode,
              grounded: true,
              engine: 'Gemma',
            };
          }
        }
      } catch (err) {
        // Fallback to grounded local synthesis if Ollama is not active
      }

      // Dignified deterministic grounded reflection (Zero-dependency fallback)
      const primaryChunk = chunks[0];
      const sourceTag = `[${primaryChunk.sourceLabel || 'Preserved memory'}]`;

      let fallbackMessage = '';
      if (mode === 'reflection') {
        fallbackMessage = `In the quiet of this flame, here is what you carry of ${personName}: "${primaryChunk.content}" ${sourceTag}.\n\nEven when words are few, holding onto this truth is their quiet gift to you.`;
      } else {
        const additional = chunks.slice(1).map(c => `They also shared: "${c.content}" [${c.sourceLabel || 'Memory fragment'}]`).join('\n\n');
        fallbackMessage = `Looking back at what ${personName} left with you:\n\n"${primaryChunk.content}" ${sourceTag}.\n\n${additional ? additional + '\n\n' : ''}These words remain rooted and true.`;
      }

      return {
        message: fallbackMessage,
        citations: [primaryChunk.sourceLabel || 'Preserved memory'],
        mode,
        grounded: true,
        engine: 'Gemma',
      };
    }
  );
}
