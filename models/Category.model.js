const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Title is required'], trim: true },
  slug:  { type: String, required: [true, 'Slug is required'], unique: true },
  metaTitle:       { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
