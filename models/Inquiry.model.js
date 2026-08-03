const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  name:    { type: String, required: [true, 'Name is required'] },
  email:   { type: String, required: [true, 'Email is required'] },
  phone:   { type: String, default: '' },
  subject: { type: String, default: '' },
  message: { type: String, required: [true, 'Message is required'] },
  status:  { type: String, enum: ['new', 'read', 'replied'], default: 'new' }
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', inquirySchema);
