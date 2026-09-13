const express = require('express');
const router = express.Router();
const Manufacturer = require('../models/Manufacturer');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// GET /api/manufacturers - list all verified manufacturers
router.get('/', async (req, res) => {
  try {
    const { city, featured, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };
    if (city) query.city = city;
    if (featured) query.isFeatured = true;

    const skip = (Number(page) - 1) * Number(limit);
    const [manufacturers, total] = await Promise.all([
      Manufacturer.find(query).populate('city', 'name slug').skip(skip).limit(Number(limit)).sort({ isFeatured: -1, createdAt: -1 }),
      Manufacturer.countDocuments(query)
    ]);

    res.json({ success: true, data: manufacturers, pagination: { page: Number(page), limit: Number(limit), total } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/manufacturers/:slug - single profile + their products
router.get('/:slug', async (req, res) => {
  try {
    const manufacturer = await Manufacturer.findOne({ slug: req.params.slug, isActive: true }).populate('city', 'name slug');
    if (!manufacturer) return res.status(404).json({ success: false, message: 'Manufacturer not found' });

    const products = await Product.find({ manufacturer: manufacturer._id, isActive: true }).populate('category', 'name slug');

    res.json({ success: true, data: { manufacturer, products } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/manufacturers - create (admin only, after factory visit)
router.post('/', protect, async (req, res) => {
  try {
    const manufacturer = await Manufacturer.create(req.body);
    res.status(201).json({ success: true, data: manufacturer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/manufacturers/:id - update / verify (admin only)
router.put('/:id', protect, async (req, res) => {
  try {
    const manufacturer = await Manufacturer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!manufacturer) return res.status(404).json({ success: false, message: 'Manufacturer not found' });
    res.json({ success: true, data: manufacturer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/manufacturers/:id (admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const manufacturer = await Manufacturer.findByIdAndDelete(req.params.id);
    if (!manufacturer) return res.status(404).json({ success: false, message: 'Manufacturer not found' });
    res.json({ success: true, message: 'Manufacturer deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
