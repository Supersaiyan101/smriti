import { connectDB, isAtlas, dbService } from './db.js';
import { getEmbedding, cosineSimilarity } from './embeddings.js';

/**
 * Atlas Vector Search + Cosine Similarity Hybrid Engine
 * 
 * Target: MongoDB Atlas Vector Search ($vectorSearch stage)
 * Fallback: Pure in-memory cosine ranking over profile memory documents
 * 
 * @param {Object} options
 * @param {string} options.profileId - Profile ID to scope search
 * @param {string} options.query - User's question, thought, or prompt
 * @param {number} [options.limit=5] - Maximum chunks to return
 * @param {number} [options.minSimilarity=0.10] - Cosine similarity floor
 */
export async function searchMemories({
  profileId,
  query,
  limit = 5,
  minSimilarity = 0.10,
}) {
  const queryEmbedding = await getEmbedding(query);
  const pid = profileId.toString();

  // 1. Attempt MongoDB Atlas $vectorSearch if Atlas is active
  if (isAtlas()) {
    try {
      const db = await connectDB();
      const pipeline = [
        {
          $vectorSearch: {
            index: 'vector_index',
            path: 'embedding',
            queryVector: queryEmbedding,
            numCandidates: 20,
            limit: limit,
            filter: { profileId: { $eq: pid } },
          },
        },
        {
          $project: {
            _id: 1,
            profileId: 1,
            type: 1,
            content: 1,
            sourceLabel: 1,
            createdAt: 1,
            score: { $meta: 'vectorSearchScore' },
          },
        },
      ];

      const cursor = db.collection('memories').aggregate(pipeline);
      const results = await cursor.toArray();

      if (results && results.length > 0) {
        return {
          chunks: results.map((r) => ({ ...r, _id: r._id.toString() })),
          count: results.length,
          topScore: results[0]?.score || 1.0,
          engine: 'MongoDB Atlas Vector Search ($vectorSearch)',
        };
      }
    } catch (err) {
      // If Atlas vector index is not yet built, proceed to in-memory cosine fallback
      console.warn('[VectorSearch] Atlas $vectorSearch pipeline notice:', err.message);
    }
  }

  // 2. Resilient In-Memory Cosine Similarity
  const allMemories = await dbService.getMemoriesByProfile(pid);

  if (!allMemories || allMemories.length === 0) {
    return {
      chunks: [],
      count: 0,
      topScore: 0,
      engine: 'In-Memory Cosine (No Memories)',
    };
  }

  // Rank every memory by similarity to query embedding
  const scored = allMemories.map((mem) => {
    let score = 0.5; // baseline if no embedding
    if (Array.isArray(mem.embedding) && mem.embedding.length > 0) {
      score = cosineSimilarity(queryEmbedding, mem.embedding);
    }
    return {
      ...mem,
      score: Number(score.toFixed(4)),
    };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // Filter by threshold
  const filtered = scored.filter((m) => m.score >= minSimilarity).slice(0, limit);

  return {
    chunks: filtered,
    count: filtered.length,
    topScore: filtered[0]?.score || (scored[0]?.score ?? 0),
    engine: 'Resilient Vector Cosine Similarity',
  };
}
