import express from 'express';
import { dbService } from '../db.js';
import { traceSpan } from '../sentry.js';

const router = express.Router();

// GET all letters written to a person
router.get('/:profileId', async (req, res) => {
  try {
    const letters = await dbService.getLettersToThem(req.params.profileId);
    res.json({ success: true, letters });
  } catch (err) {
    console.error('[LettersToThem GET Error]', err);
    res.status(500).json({ success: false, error: 'Could not fetch letters to them' });
  }
});

// POST write and seal a letter to a person
router.post('/', async (req, res) => {
  try {
    const { profileId, title, content } = req.body;

    if (!profileId) {
      return res.status(400).json({ success: false, error: 'Profile ID is required' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'Letter content cannot be empty' });
    }

    return await traceSpan(
      'letter_to_them.create',
      'sanctuary.letter',
      { profileId, contentLength: content.length },
      async () => {
        const letter = await dbService.createLetterToThem({
          profileId,
          title: title ? title.trim() : 'Letter from the Heart',
          content: content.trim(),
        });

        res.status(201).json({ success: true, letter });
      }
    );
  } catch (err) {
    console.error('[LettersToThem POST Error]', err);
    res.status(500).json({ success: false, error: 'Could not preserve letter' });
  }
});

export default router;
