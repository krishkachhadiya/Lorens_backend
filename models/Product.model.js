const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
 productCode:      {type: String,required: [true, "Product Code is required"],unique: true,trim: true},
  title:           { type: String, required: [true, 'Title is required'], trim: true },
  slug:            { type: String, required: [true, 'Slug is required'], unique: true },
  description:     { type: String, default: '' },
  metaTitle:       { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  category: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null  
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null
  },
  status:         { type: String, enum: ['active', 'inactive'], default: 'active' },
  images:         [{ type: String }],
  specifications: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
