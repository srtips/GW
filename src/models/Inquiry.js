const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  inquiryNumber: { type: String, required: true, unique: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productNameText: { type: String, default: '' },
  manufacturer: { type: mongoose.Schema.Types.ObjectId, ref: 'Manufacturer' },
  quantity: { type: Number },
  quantityType: { type: String, enum: ['100', '200', '500', 'bulk'], default: 'bulk' },
  customQuantity: { type: Number },
  specifications: { type: String, default: '' },
  expectedDelivery: { type: String, default: '' },
  buyer: {
    name: { type: String, required: true },
    business: { type: String, default: '' },
    phone: { type: String, required: true },
    whatsapp: { type: String, default: '' },
    email: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: 'India' },
    type: { type: String, enum: ['wholesaler', 'bulk_buyer', 'exporter', 'international', 'other'], default: 'wholesaler' }
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'verified', 'sent_to_mfr', 'quote_received', 'quote_sent', 'negotiating', 'closed_won', 'closed_lost', 'cancelled'],
    default: 'new'
  },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  assignedTo: { type: String, default: '' },
  internalNotes: { type: String, default: '' },
  source: { type: String, enum: ['website', 'whatsapp', 'phone', 'referral', 'social', 'other'], default: 'website' },
  ipAddress: { type: String, default: '' }
}, { timestamps: true });

inquirySchema.index({ inquiryNumber: 1 });
inquirySchema.index({ status: 1 });
inquirySchema.index({ priority: 1 });
inquirySchema.index({ createdAt: -1 });
inquirySchema.index({ assignedTo: 1 });

module.exports = mongoose.model('Inquiry', inquirySchema);
