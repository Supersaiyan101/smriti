import { Mastra } from '@mastra/core';
import { createWorkflow, createStep } from '@mastra/core/workflows';
import { dbService } from '../db.js';
import { retrieveMemoriesTool } from './tools/retrieve.js';
import { densityGateTool } from './tools/densityGate.js';
import { synthesizeGemmaTool } from './tools/synthesize.js';
import { traceSpan } from '../sentry.js';

/**
 * Step 1: Retrieval Step
 * Finds the top-k memory fragments from Atlas Vector Search / cosine index
 */
const retrieveStep = createStep({
  id: 'retrieve-memories',
  execute: async ({ context }) => {
    const { profileId, query } = context;
    const search = await retrieveMemoriesTool({ profileId, query });
    const allMemories = await dbService.getMemoriesByProfile(profileId);
    return {
      chunks: search.chunks,
      topScore: search.topScore,
      totalMemoriesCount: allMemories.length,
    };
  },
});

/**
 * Step 2: Density Gate Step
 * Routes to Conversational vs. Reflection Mode based on memory volume
 */
const densityGateStep = createStep({
  id: 'density-gate',
  execute: async ({ context }) => {
    const { chunks, totalMemoriesCount } = context;
    const gate = await densityGateTool({ chunks, totalMemoriesCount });
    return {
      mode: gate.mode,
      isSparse: gate.isSparse,
      rationale: gate.rationale,
    };
  },
});

/**
 * Step 3: Gemma Synthesis Step
 * Synthesizes grounded response with zero hallucination and citations
 */
const synthesizeStep = createStep({
  id: 'gemma-synthesize',
  execute: async ({ context }) => {
    const { profile, query, chunks, mode } = context;
    const result = await synthesizeGemmaTool({
      personName: profile.name,
      relationship: profile.relationship,
      query,
      chunks,
      mode,
    });
    return result;
  },
});

/**
 * Smriti Mastra Workflow:
 * retrieve -> densityGate -> synthesize
 */
export const remembranceWorkflow = createWorkflow({
  id: 'remembrance-pipeline',
  steps: [retrieveStep, densityGateStep, synthesizeStep],
});

/**
 * Mastra Instance
 */
export const mastra = new Mastra({
  workflows: {
    remembranceWorkflow,
  },
});

/**
 * Primary Runner for the Remembrance Pipeline
 * Fully instrumented with Sentry spans and Mastra tools
 */
export async function runRemembrancePipeline({ profileId, query }) {
  return await traceSpan(
    'mastra.workflow.remembrance',
    'ai.workflow',
    { profileId, queryLength: query?.length || 0 },
    async () => {
      // 1. Fetch Profile
      const profile = await dbService.getProfileById(profileId);
      if (!profile) {
        throw new Error(`Profile ${profileId} not found`);
      }

      // 2. Step 1: Vector Retrieval
      const allMemories = await dbService.getMemoriesByProfile(profileId);
      const search = await retrieveMemoriesTool({ profileId, query });

      // 3. Step 2: Density Gate
      const gate = await densityGateTool({
        chunks: search.chunks,
        totalMemoriesCount: allMemories.length,
      });

      // 4. Step 3: Gemma Synthesis with Citations
      const synthesis = await synthesizeGemmaTool({
        personName: profile.name,
        relationship: profile.relationship,
        query,
        chunks: search.chunks,
        mode: gate.mode,
      });

      return {
        profile: {
          id: profile._id,
          name: profile.name,
          relationship: profile.relationship,
          photoUrl: profile.photoUrl,
        },
        mode: gate.mode,
        isSparse: gate.isSparse,
        message: synthesis.message,
        citations: synthesis.citations,
        sourceChunks: search.chunks.map((c) => ({
          id: c._id,
          sourceLabel: c.sourceLabel,
          type: c.type,
          content: c.content,
          score: c.score,
        })),
        engine: synthesis.engine,
        timestamp: new Date().toISOString(),
      };
    }
  );
}
