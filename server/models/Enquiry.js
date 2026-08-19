const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    message: { type: String, default: '' },
    contactPreference: {
      type: String,
      enum: ['Phone', 'WhatsApp', 'Email'],
      default: 'Phone',
    },
    status: {
      type: String,
      enum: ['New', 'Responded', 'Closed'],
      default: 'New',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Enquiry', enquirySchema);
