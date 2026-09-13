const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  manufacturer: { type: mongoose.Schema.Types.ObjectId, ref: 'Manufacturer', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  shortDescription: { type: String, default: '' },
  description: { type: String, default: '' },
  specifications: [{ label: String, value: String }],
  material: { type: String, default: '' },
  priceMin: { type: Number },
  priceMax: { type: Number },
  priceUnit: { type: String, default: 'per piece' },
  currency: { type: String, default: 'INR' },
  moq: { type: Number, required: true },
  moqUnit: { type: String, default: 'pieces' },
  qtyOptions: {
    option1: { type: Number, default: 100 },
    option2: { type: Number, default: 200 },
    option3: { type: Number, default: 500 }
  },
  allowsBulk: { type: Boolean, default: true },
  deliveryTime: { type: String, default: '' },
  packagingDetails: { type: String, default: '' },
  hsCode: { type: String, default: '' },
  images: [{ imagePath: String, altText: String, isPrimary: Boolean, displayOrder: Number }],
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  viewCount: { type: Number, default: 0 },
  inquiryCount: { type: Number, default: 0 },
  metaTitle: { type: String, default: '' },
  metaDescription: { type: String, default: '' }
}, { timestamps: true });

productSchema.index({ slug: 1 });
productSchema.index({ manufacturer: 1 });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1, isFeatured: 1 });
productSchema.index({ name: 'text', shortDescription: 'text' });

module.exports = mongoose.model('Product', productSchema);
