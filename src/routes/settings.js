const express = require('express');
const router = express.Router();
const SiteSetting = require('../models/SiteSetting');
const { protect } = require('../middleware/auth');

// GET /api/settings - public settings (site name, contact info, etc.)
router.get('/', async (req, res) => {
  try {
    const settings = await SiteSetting.find();
    const settingsObj = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
    res.json({ success: true, data: settingsObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/settings/:key - update a setting (admin only)
router.put('/:key', protect, async (req, res) => {
  try {
    const setting = await SiteSetting.findOneAndUpdate(
      { key: req.params.key },
      { value: req.body.value, group: req.body.group || 'general' },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: setting });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
