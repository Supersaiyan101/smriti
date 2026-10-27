import dotenv from 'dotenv';

dotenv.config();

const OLLAMA_BASE = process.env.GEMMA_API_BASE || 'http://localhost:11434';
const EMBED_MODEL = process.env.EMBEDDING_MODEL || 'all-minilm';

/**
 * Deterministic local feature vector (128 dimensions)
 * Used as a zero-dependency fallback when Ollama or external embedding API is unreachable.
 */
function localFeatureEmbedding(text) {
  const dim = 128;
  const vec = new Array(dim).fill(0);
  const normalized = text.toLowerCase().trim();
  const words = normalized.split(/\s+/);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    for (let j = 0; j < word.length; j++) {
      const charCode = word.charCodeAt(j);
      const idx = (charCode * 31 + j * 17 + i) % dim;
      vec[idx] += 1;
    }
  }

  // Normalize vector to unit length (L2 norm)
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0)) || 1;
  return vec.map(v => Number((v / norm).toFixed(6)));
}

/**
 * Generate vector embedding for a piece of text.
 * Attempts Ollama/API first, falls back gracefully to deterministic local vector.
 * 
 * @param {string} text - Memory chunk or query
 * @returns {Promise<number[]>} Dense float array
 */
export async function getEmbedding(text) {
  if (!text || typeof text !== 'string') {
    return new Array(128).fill(0);
  }

  // Attempt Ollama embeddings if configured
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);

    const res = await fetch(`${OLLAMA_BASE}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: EMBED_MODEL,
        prompt: text,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.embedding)) {
        return data.embedding;
      }
    }
  } catch (err) {
    // Expected when Ollama is not running locally; proceed to zero-config fallback
  }

  return localFeatureEmbedding(text);
}

/**
 * Compute cosine similarity between two unit-normalized vectors
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) return 0;
  return dot / denom;
}
