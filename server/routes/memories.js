import express from 'express';
import { dbService } from '../db.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// GET memory reel slides for a profile (must be defined before /:profileId)
router.get('/reel/:profileId', async (req, res) => {
  try {
    const data = await dbService.getReelByProfile(req.params.profileId);
    res.json({ success: true, slides: data.slides, soundtrack: data.soundtrack });
  } catch (err) {
    console.error('[Memory Reel GET Error]', err);
    res.status(500).json({ success: false, error: 'Could not fetch memory reel' });
  }
});

// POST upload or configure a soundtrack for the Memory Reel
router.post('/reel/soundtrack', upload.single('soundtrack'), async (req, res) => {
  try {
    const { profileId, title, presetType, spotifyUrl } = req.body;
    if (!profileId) {
      return res.status(400).json({ success: false, error: 'Profile ID is required' });
    }

    let audioUrl = null;
    if (req.file) {
      audioUrl = `/uploads/${req.file.filename}`;
    }

    let spotifyTrackId = null;
    if (spotifyUrl) {
      const match = spotifyUrl.match(/track\/([a-zA-Z0-9]+)/);
      if (match) spotifyTrackId = match[1];
    }

    const soundtrack = {
      title: title || (spotifyUrl ? 'Spotify Track' : presetType ? `Sanctuary: ${presetType}` : 'Their Favorite Song'),
      url: audioUrl || req.body.url || null,
      spotifyUrl: spotifyUrl || null,
      spotifyTrackId: spotifyTrackId || null,
      presetType: presetType || (audioUrl ? 'upload' : spotifyUrl ? 'spotify' : 'ambient'),
      updatedAt: new Date().toISOString(),
    };

    await dbService.setReelSoundtrack(profileId, soundtrack);
    res.json({ success: true, soundtrack });
  } catch (err) {
    console.error('[Memory Reel Soundtrack POST Error]', err);
    res.status(500).json({ success: false, error: 'Could not save reel soundtrack' });
  }
});

// POST add a dedicated slide to the Memory Reel (photo/video + heartfelt story + time/place)
router.post('/reel', upload.single('media'), async (req, res) => {
  try {
    const { profileId, story, content, title, sourceLabel, order, type } = req.body;

    if (!profileId) {
      return res.status(400).json({ success: false, error: 'Profile ID is required' });
    }

    let mediaUrl = req.body.mediaUrl || null;
    if (req.file) {
      mediaUrl = `/uploads/${req.file.filename}`;
    }

    if (!mediaUrl) {
      return res.status(400).json({ success: false, error: 'A photograph or video is required for the Memory Reel' });
    }

    const mediaType = type || (req.file ? (req.file.mimetype.startsWith('video') ? 'video' : 'photo') : 'photo');

    let timePlace = null;
    if (req.body.timePlace) {
      try {
        timePlace = typeof req.body.timePlace === 'string' ? JSON.parse(req.body.timePlace) : req.body.timePlace;
      } catch (e) {
        timePlace = null;
      }
    }

    const slideContent = story || content || 'A cherished moment in the Memory Reel.';
    const slideLabel = title || sourceLabel || 'Memory Reel Moment';

    const memory = await dbService.addMemory({
      profileId,
      type: mediaType,
      content: slideContent,
      mediaUrl,
      sourceLabel: slideLabel,
      timePlace,
      isReelSlide: true,
      order: parseInt(order, 10) || 0,
    });

    res.status(201).json({ success: true, slide: memory });
  } catch (err) {
    console.error('[Memory Reel POST Error]', err);
    res.status(500).json({ success: false, error: 'Could not save memory reel slide' });
  }
});

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
    const { profileId, type, content, sourceLabel, isReelSlide, order } = req.body;

    if (!profileId) {
      return res.status(400).json({ success: false, error: 'Profile ID is required' });
    }

    let mediaUrl = null;
    if (req.file) {
      mediaUrl = `/uploads/${req.file.filename}`;
    }

    const memoryType = type || (req.file ? (req.file.mimetype.startsWith('audio') ? 'voice' : 'photo') : 'text');
    const memoryContent = content || (req.file ? `[Attached ${memoryType} fragment]` : '');

    let sensory = null;
    if (req.body.sensory) {
      try {
        sensory = typeof req.body.sensory === 'string' ? JSON.parse(req.body.sensory) : req.body.sensory;
      } catch (e) {
        sensory = null;
      }
    }

    let timePlace = null;
    if (req.body.timePlace) {
      try {
        timePlace = typeof req.body.timePlace === 'string' ? JSON.parse(req.body.timePlace) : req.body.timePlace;
      } catch (e) {
        timePlace = null;
      }
    }

    const memory = await dbService.addMemory({
      profileId,
      type: memoryType,
      content: memoryContent,
      mediaUrl,
      sourceLabel: sourceLabel || undefined,
      sensory,
      timePlace,
      isReelSlide: !!isReelSlide,
      order: parseInt(order, 10) || 0,
    });

    res.status(201).json({ success: true, memory });
  } catch (err) {
    console.error('[Memory POST Error]', err);
    res.status(500).json({ success: false, error: 'Could not save memory fragment' });
  }
});

// PUT update a memory fragment
router.put('/:id', async (req, res) => {
  try {
    const { content, sourceLabel, timePlace, order } = req.body;
    const updates = {};
    if (content !== undefined) updates.content = content;
    if (sourceLabel !== undefined) updates.sourceLabel = sourceLabel;
    if (timePlace !== undefined) updates.timePlace = timePlace;
    if (order !== undefined) updates.order = order;

    const updated = await dbService.updateMemory(req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Memory not found' });
    }

    res.json({ success: true, memory: updated });
  } catch (err) {
    console.error('[Memory PUT Error]', err);
    res.status(500).json({ success: false, error: 'Could not update memory' });
  }
});

// DELETE quietly remove a memory fragment from the altar
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await dbService.deleteMemory(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Memory not found' });
    }

    res.json({ success: true, message: 'Memory quietly removed' });
  } catch (err) {
    console.error('[Memory DELETE Error]', err);
    res.status(500).json({ success: false, error: 'Could not delete memory' });
  }
});

export default router;
