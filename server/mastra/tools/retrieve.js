import { searchMemories } from '../../vectorSearch.js';
import { traceSpan } from '../../sentry.js';

/**
 * Mastra Tool: Retrieve Memories from Vector Search
 */
export async function retrieveMemoriesTool({ profileId, query }) {
  return await traceSpan(
    'mastra.tool.retrieve',
    'ai.retrieval',
    { profileId, queryLength: query.length },
    async () => {
      const searchResult = await searchMemories({
        profileId,
        query,
        limit: 5,
        minSimilarity: 0.10,
      });

      return {
        chunks: searchResult.chunks,
        count: searchResult.count,
        topScore: searchResult.topScore,
        engine: searchResult.engine,
      };
    }
  );
}
