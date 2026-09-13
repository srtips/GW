const express = require('express');
const router = express.Router();
const Deal = require('../models/Deal');
const { protect } = require('../middleware/auth');

async function generateDealNumber() {
  const year = new Date().getFullYear();
  const count = await Deal.countDocuments({
    createdAt: { $gte: new Date(`${year}-01-01`), $lt: new Date(`${year + 1}-01-01`) }
  });
  return `GWD-${year}-${String(count + 1).padStart(4, '0')}`;
}

// All deal routes are admin-only
router.use(protect);

// GET /api/deals - list all deals with summary stats
router.get('/', async (req, res) => {
  try {
    const { status, dealType, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (dealType) query.dealType = dealType;

    const skip = (Number(page) - 1) * Number(limit);
    const [deals, total, stats] = await Promise.all([
      Deal.find(query).populate('manufacturer', 'companyName').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Deal.countDocuments(query),
      Deal.aggregate([
        { $group: { _id: null, totalValue: { $sum: '$totalValue' }, totalCommission: { $sum: '$commissionAmount' } } }
      ])
    ]);

    res.json({
      success: true,
      data: deals,
      pagination: { page: Number(page), limit: Number(limit), total },
      summary: stats[0] || { totalValue: 0, totalCommission: 0 }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/deals - log a new deal
router.post('/', async (req, res) => {
  try {
    const dealNumber = await generateDealNumber();
    const deal = await Deal.create({ ...req.body, dealNumber });
    res.status(201).json({ success: true, data: deal });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/deals/:id - update deal status/details
router.put('/:id', async (req, res) => {
  try {
    const deal = await Deal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!deal) return res.status(404).json({ success: false, message: 'Deal not found' });
    res.json({ success: true, data: deal });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
