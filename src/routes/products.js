const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Manufacturer = require('../models/Manufacturer');
const { protect } = require('../middleware/auth');

// GET /api/products - list with filters, pagination
router.get('/', async (req, res) => {
  try {
    const { category, city, moqMax, search, sort, page = 1, limit = 12, featured } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (featured) query.isFeatured = true;
    if (moqMax) query.moq = { $lte: Number(moqMax) };
    if (search) query.$text = { $search: search };

    let productQuery = Product.find(query)
      .populate('manufacturer', 'companyName slug city isVerified')
      .populate('category', 'name slug');

    if (city) {
      // filter by manufacturer's city after populate - use aggregation for efficiency in production
      productQuery = productQuery.populate({
        path: 'manufacturer',
        match: { city },
        select: 'companyName slug city isVerified'
      });
    }

    const sortMap = {
      'price-low': { priceMin: 1 },
      'price-high': { priceMin: -1 },
      'newest': { createdAt: -1 },
      'popular': { viewCount: -1 }
    };
    productQuery = productQuery.sort(sortMap[sort] || { isFeatured: -1, createdAt: -1 });

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      productQuery.skip(skip).limit(Number(limit)),
      Product.countDocuments(query)
    ]);

    res.json({ success: true, data: products, pagination: { page: Number(page), limit: Number(limit), total } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/:slug - single product detail
router.get('/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('manufacturer')
      .populate('category', 'name slug');

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    product.viewCount += 1;
    await product.save();

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/products - create (admin only)
router.post('/', protect, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    await Manufacturer.findByIdAndUpdate(product.manufacturer, { $inc: { productCount: 1 } });
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/products/:id - update (admin only)
router.put('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/products/:id - remove (admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    await Manufacturer.findByIdAndUpdate(product.manufacturer, { $inc: { productCount: -1 } });
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
