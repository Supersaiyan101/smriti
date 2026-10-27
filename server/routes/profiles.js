import express from 'express';
import { dbService } from '../db.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// GET all profiles
router.get('/', async (req, res) => {
  try {
    const profiles = await dbService.getProfiles();
    res.json({ success: true, profiles });
  } catch (err) {
    console.error('[Profiles GET Error]', err);
    res.status(500).json({ success: false, error: 'Could not fetch profiles' });
  }
});

// GET single profile
router.get('/:id', async (req, res) => {
  try {
    const profile = await dbService.getProfileById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }
    const memories = await dbService.getMemoriesByProfile(req.params.id);
    res.json({ success: true, profile, memories });
  } catch (err) {
    console.error('[Profile GET ID Error]', err);
    res.status(500).json({ success: false, error: 'Could not fetch profile' });
  }
});

// POST create profile (supports optional multipart photo upload)
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { name, relationship } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }

    let photoUrl = req.body.photoUrl || null;
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    }

    const profile = await dbService.createProfile({
      name: name.trim(),
      relationship: relationship ? relationship.trim() : 'Loved one',
      photoUrl,
    });

    res.status(201).json({ success: true, profile });
  } catch (err) {
    console.error('[Profile POST Error]', err);
    res.status(500).json({ success: false, error: 'Could not create profile' });
  }
});

export default router;
