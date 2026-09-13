const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  state: { type: String, default: 'Gujarat' },
  description: { type: String, default: '' },
  famousFor: { type: String, default: '' },
  manufacturerCount: { type: Number, default: 0 },
  image: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  metaTitle: { type: String, default: '' },
  metaDescription: { type: String, default: '' }
}, { timestamps: true });

citySchema.index({ slug: 1 });
citySchema.index({ isActive: 1 });

module.exports = mongoose.model('City', citySchema);
