import express from 'express';
import { runRemembrancePipeline } from '../mastra/agent.js';

const router = express.Router();

/**
 * POST /api/converse
 * Body: { profileId: string, query: string }
 */
router.post('/', async (req, res) => {
  try {
    const { profileId, query } = req.body;

    if (!profileId) {
      return res.status(400).json({ success: false, error: 'Profile ID is required' });
    }

    const cleanQuery = (query && query.trim()) || "What's on your mind today?";

    const result = await runRemembrancePipeline({
      profileId,
      query: cleanQuery,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    console.error('[Converse Route Error]', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Could not process remembrance query',
    });
  }
});

export default router;
