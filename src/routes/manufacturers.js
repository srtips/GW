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

// POST /api/manufacturers/apply - PUBLIC self-registration by a manufacturer.
// Creates an inactive, pending record — invisible to buyers until an admin approves it.
router.post('/apply', async (req, res) => {
  try {
    const { company, contact, phone, email, cityName, category, years, products } = req.body;

    if (!company || !contact || !phone || !cityName) {
      return res.status(400).json({ success: false, message: 'Company, contact person, phone, and city are required.' });
    }

    const City = require('../models/City');
    const matchedCity = await City.findOne({ name: new RegExp(`^${cityName.trim()}$`, 'i') });

    const slugBase = company.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let slug = slugBase;
    let suffix = 1;
    while (await Manufacturer.findOne({ slug })) {
      slug = `${slugBase}-${suffix++}`;
    }

    const descriptionParts = [];
    if (category) descriptionParts.push(`Category: ${category}.`);
    if (products) descriptionParts.push(`Main products: ${products}.`);
    if (years) descriptionParts.push(`Years in business: ${years}.`);

    const manufacturer = await Manufacturer.create({
      companyName: company,
      slug,
      city: matchedCity ? matchedCity._id : undefined,
      pendingCityName: matchedCity ? '' : cityName,
      contactPerson: contact,
      phone,
      email,
      establishedYear: years ? new Date().getFullYear() - Number(years) : undefined,
      description: descriptionParts.join(' '),
      isVerified: false,
      isActive: false,
      applicationStatus: 'pending'
    });

    res.status(201).json({ success: true, message: 'Application received', data: { id: manufacturer._id } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/manufacturers/admin/all - admin only, sees every application regardless of status
router.get('/admin/all', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.applicationStatus = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [manufacturers, total] = await Promise.all([
      Manufacturer.find(query).populate('city', 'name slug').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Manufacturer.countDocuments(query)
    ]);

    res.json({ success: true, data: manufacturers, pagination: { page: Number(page), limit: Number(limit), total } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/manufacturers/:id/review - admin only, approve or reject a pending application
router.put('/:id/review', protect, async (req, res) => {
  try {
    const { decision } = req.body; // 'approve' | 'reject'
    if (!['approve', 'reject'].includes(decision)) {
      return res.status(400).json({ success: false, message: 'decision must be approve or reject' });
    }
    const update = decision === 'approve'
      ? { applicationStatus: 'approved', isActive: true, isVerified: true, verificationDate: new Date() }
      : { applicationStatus: 'rejected', isActive: false };

    const manufacturer = await Manufacturer.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!manufacturer) return res.status(404).json({ success: false, message: 'Manufacturer not found' });
    res.json({ success: true, data: manufacturer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
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
