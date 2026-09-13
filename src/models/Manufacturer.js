const mongoose = require('mongoose');

const manufacturerSchema = new mongoose.Schema({
  companyName: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
  address: { type: String, default: '' },
  pincode: { type: String, default: '' },
  contactPerson: { type: String, required: true },
  phone: { type: String, required: true },
  whatsapp: { type: String, default: '' },
  email: { type: String, default: '' },
  website: { type: String, default: '' },
  description: { type: String, default: '' },
  establishedYear: { type: Number },
  employeeCount: { type: String, default: '' }, // e.g. "10-50"
  productionCapacity: { type: String, default: '' },
  certifications: [{ type: String }],
  exportMarkets: [{ type: String }],
  paymentTerms: { type: String, default: '' },
  gstNumber: { type: String, default: '' },
  msmeNumber: { type: String, default: '' },
  logo: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  galleryImages: [{ imagePath: String, caption: String, displayOrder: Number }],
  isVerified: { type: Boolean, default: false },
  verificationDate: { type: Date },
  verifiedBy: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  productCount: { type: Number, default: 0 },
  avgRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  metaTitle: { type: String, default: '' },
  metaDescription: { type: String, default: '' }
}, { timestamps: true });

manufacturerSchema.index({ slug: 1 });
manufacturerSchema.index({ city: 1 });
manufacturerSchema.index({ isVerified: 1, isActive: 1 });
manufacturerSchema.index({ isFeatured: 1 });

module.exports = mongoose.model('Manufacturer', manufacturerSchema);
