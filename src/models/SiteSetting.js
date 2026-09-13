const mongoose = require('mongoose');

const siteSettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, default: '' },
  group: { type: String, default: 'general' }
}, { timestamps: true });

module.exports = mongoose.model('SiteSetting', siteSettingSchema);
