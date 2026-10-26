const express = require('express');
const Feedback = require('../models/Feedback');

const router = express.Router();

function cleanPayload(body) {
  return {
    courseName: typeof body.courseName === 'string' ? body.courseName.trim() : '',
    courseDuration: typeof body.courseDuration === 'string' ? body.courseDuration.trim() : '',
    comments: typeof body.comments === 'string' ? body.comments.trim() : '',
    rating: Number(body.rating)
  };
}

function validate(payload) {
  if (!payload.courseName || !payload.courseDuration || !payload.comments) {
    return 'Course name, duration, and comments are required.';
  }
  if (!Number.isInteger(payload.rating) || payload.rating < 1 || payload.rating > 5) {
    return 'Rating must be a whole number from 1 to 5.';
  }
  return null;
}

router.get('/', async (_req, res, next) => {
  try {
    const entries = await Feedback.find().sort({ createdAt: -1 }).lean();
    res.json(entries);
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = cleanPayload(req.body);
    const problem = validate(payload);
    if (problem) return res.status(400).json({ message: problem });
    const entry = await Feedback.create(payload);
    res.status(201).json(entry);
  } catch (error) { next(error); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const payload = cleanPayload(req.body);
    const problem = validate(payload);
    if (problem) return res.status(400).json({ message: problem });
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
      return res.status(400).json({ message: 'Invalid feedback ID.' });
    }
    const entry = await Feedback.findByIdAndUpdate(req.params.id, payload, {
      new: true, runValidators: true
    });
    if (!entry) return res.status(404).json({ message: 'Feedback entry not found.' });
    res.json(entry);
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
      return res.status(400).json({ message: 'Invalid feedback ID.' });
    }
    const entry = await Feedback.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Feedback entry not found.' });
    res.json({ message: 'Feedback deleted.' });
  } catch (error) { next(error); }
});

module.exports = router;
