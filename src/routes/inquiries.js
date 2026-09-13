const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// Generate a human-friendly inquiry number like GW-2026-0001
async function generateInquiryNumber() {
  const year = new Date().getFullYear();
  const count = await Inquiry.countDocuments({
    createdAt: { $gte: new Date(`${year}-01-01`), $lt: new Date(`${year + 1}-01-01`) }
  });
  const nextNum = String(count + 1).padStart(4, '0');
  return `GW-${year}-${nextNum}`;
}

// POST /api/inquiries - buyer submits inquiry (PUBLIC - this is the "Get Quote" form)
router.post('/', async (req, res) => {
  try {
    const inquiryNumber = await generateInquiryNumber();
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const inquiry = await Inquiry.create({
      ...req.body,
      inquiryNumber,
      ipAddress,
      source: req.body.source || 'website'
    });

    // Bump inquiry count on the product if one was referenced
    if (inquiry.product) {
      await Product.findByIdAndUpdate(inquiry.product, { $inc: { inquiryCount: 1 } });
    }

    // NOTE: This is where WhatsApp/email notification to admin gets triggered
    // once notification credentials are connected (see notifications.js)

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully',
      data: { inquiryNumber: inquiry.inquiryNumber, id: inquiry._id }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/inquiries - list all (admin only)
router.get('/', protect, async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const skip = (Number(page) - 1) * Number(limit);
    const [inquiries, total] = await Promise.all([
      Inquiry.find(query)
        .populate('product', 'name slug')
        .populate('manufacturer', 'companyName slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Inquiry.countDocuments(query)
    ]);

    res.json({ success: true, data: inquiries, pagination: { page: Number(page), limit: Number(limit), total } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/inquiries/:id (admin only)
router.get('/:id', protect, async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id).populate('product').populate('manufacturer');
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found' });
    res.json({ success: true, data: inquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/inquiries/:id - update status, assign, add notes (admin only)
router.put('/:id', protect, async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found' });
    res.json({ success: true, data: inquiry });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
