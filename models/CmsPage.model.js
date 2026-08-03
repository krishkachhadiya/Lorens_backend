const mongoose = require('mongoose');

const cmsPageSchema = new mongoose.Schema({
  title:           { type: String, required: [true, 'Title is required'] },
  slug:            { type: String, required: [true, 'Slug is required'], unique: true },
  metaTitle:       { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  content:         { type: String, default: '' },
  status:          { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('CmsPage', cmsPageSchema);
