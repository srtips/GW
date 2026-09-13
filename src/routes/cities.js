const express = require('express');
const router = express.Router();
const City = require('../models/City');
const { protect } = require('../middleware/auth');

// GET /api/cities - list all active cities
router.get('/', async (req, res) => {
  try {
    const cities = await City.find({ isActive: true }).sort({ manufacturerCount: -1 });
    res.json({ success: true, data: cities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/cities/:slug
router.get('/:slug', async (req, res) => {
  try {
    const city = await City.findOne({ slug: req.params.slug, isActive: true });
    if (!city) return res.status(404).json({ success: false, message: 'City not found' });
    res.json({ success: true, data: city });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/cities (admin only)
router.post('/', protect, async (req, res) => {
  try {
    const city = await City.create(req.body);
    res.status(201).json({ success: true, data: city });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/cities/:id (admin only)
router.put('/:id', protect, async (req, res) => {
  try {
    const city = await City.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!city) return res.status(404).json({ success: false, message: 'City not found' });
    res.json({ success: true, data: city });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
