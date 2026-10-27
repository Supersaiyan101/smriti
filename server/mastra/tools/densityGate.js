import { traceSpan } from '../../sentry.js';

/**
 * Mastra Tool: Density Gate
 * 
 * Determines whether to engage:
 * - "conversational" mode (dense memories, rich narrative recall)
 * - "reflection" mode (sparse memories: 1-3 fragments, gentle flame reflection)
 */
export async function densityGateTool({ chunks, totalMemoriesCount }) {
  return await traceSpan(
    'mastra.tool.densityGate',
    'ai.routing',
    { retrievedChunks: chunks.length, totalMemoriesCount },
    async () => {
      // If total memories are 1, 2, or 3, or if only 1 chunk was retrieved:
      // Engages Reflection Mode. Never force a fake conversation when data is sparse.
      const isSparse = totalMemoriesCount <= 3 || chunks.length <= 1;

      const mode = isSparse ? 'reflection' : 'conversational';

      const rationale = isSparse
        ? 'Sparse memory count detected (1-3 fragments). Engaging Reflection Mode to honor exact words without hallucination.'
        : 'Dense memory collection detected. Engaging Conversational Grounded Mode.';

      return {
        mode,
        isSparse,
        rationale,
      };
    }
  );
}
