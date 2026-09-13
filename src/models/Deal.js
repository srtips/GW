const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  dealNumber: { type: String, required: true, unique: true },
  inquiry: { type: mongoose.Schema.Types.ObjectId, ref: 'Inquiry' },
  manufacturer: { type: mongoose.Schema.Types.ObjectId, ref: 'Manufacturer' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  dealType: { type: String, enum: ['commission', 'trading', 'inventory'], required: true },
  quantity: { type: Number },
  unitPrice: { type: Number },
  totalValue: { type: Number },
  commissionPercent: { type: Number },
  commissionAmount: { type: Number },
  ourBuyingPrice: { type: Number },
  ourSellingPrice: { type: Number },
  profit: { type: Number },
  advanceFromBuyer: { type: Number },
  advanceToSeller: { type: Number },
  status: {
    type: String,
    enum: ['quote_sent', 'negotiating', 'confirmed', 'advance_received', 'order_placed', 'in_production', 'shipped', 'delivered', 'commission_pending', 'commission_received', 'completed', 'cancelled', 'disputed'],
    default: 'quote_sent'
  },
  buyer: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' }
  },
  shippingAddress: { type: String, default: '' },
  trackingNumber: { type: String, default: '' },
  deliveryDate: { type: Date },
  paymentStatus: { type: String, enum: ['pending', 'partial', 'received', 'overdue'], default: 'pending' },
  paymentDate: { type: Date },
  internalNotes: { type: String, default: '' }
}, { timestamps: true });

dealSchema.index({ dealNumber: 1 });
dealSchema.index({ status: 1 });
dealSchema.index({ dealType: 1 });
dealSchema.index({ paymentStatus: 1 });
dealSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Deal', dealSchema);
