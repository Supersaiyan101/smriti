import express from 'express';
import { dbService } from '../db.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// GET memories for a profile
router.get('/:profileId', async (req, res) => {
  try {
    const memories = await dbService.getMemoriesByProfile(req.params.profileId);
    res.json({ success: true, memories });
  } catch (err) {
    console.error('[Memories GET Error]', err);
    res.status(500).json({ success: false, error: 'Could not fetch memories' });
  }
});

// POST add memory fragment (text, audio file, or photo)
router.post('/', upload.single('media'), async (req, res) => {
  try {
    const { profileId, type, content, sourceLabel } = req.body;

    if (!profileId) {
      return res.status(400).json({ success: false, error: 'Profile ID is required' });
    }

    let mediaUrl = null;
    if (req.file) {
      mediaUrl = `/uploads/${req.file.filename}`;
    }

    const memoryType = type || (req.file ? (req.file.mimetype.startsWith('audio') ? 'voice' : 'photo') : 'text');
    const memoryContent = content || (req.file ? `[Attached ${memoryType} fragment]` : '');

    const memory = await dbService.addMemory({
      profileId,
      type: memoryType,
      content: memoryContent,
      mediaUrl,
      sourceLabel: sourceLabel || undefined,
    });

    res.status(201).json({ success: true, memory });
  } catch (err) {
    console.error('[Memory POST Error]', err);
    res.status(500).json({ success: false, error: 'Could not save memory fragment' });
  }
});

export default router;
