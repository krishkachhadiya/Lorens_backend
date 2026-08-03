const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  create: { type: Boolean, default: false },
  edit:   { type: Boolean, default: false },
  delete: { type: Boolean, default: false }
}, { _id: false });

const roleSchema = new mongoose.Schema({
  name: {
    type: String, required: [true, 'Role name is required'],
    unique: true, lowercase: true, trim: true
  },
  permissions: {
    products:      { type: permissionSchema, default: () => ({}) },
    categories:    { type: permissionSchema, default: () => ({}) },
    subcategories: { type: permissionSchema, default: () => ({}) },
    cms:           { type: permissionSchema, default: () => ({}) }
  }
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
