const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    location: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    state: { type: String, default: 'Uttar Pradesh' },
    address: { type: String, trim: true },

    area: { type: Number, required: true },
    areaUnit: {
      type: String,
      enum: ['sqft', 'bigha', 'biswa', 'dhur', 'gaj', 'acre', 'sqm'],
      default: 'sqft',
    },

    price: { type: Number, required: true },
    pricePerUnit: { type: Number },
    negotiable: { type: Boolean, default: false },

    landType: {
      type: String,
      enum: ['Residential', 'Commercial', 'Agricultural', 'Industrial', 'Mixed Use'],
      required: true,
    },

    roadFacing: { type: Boolean, default: false },
    roadWidth: { type: Number }, // in feet

    nearbyLandmarks: [{ type: String }],

    images: [{ type: String }], // file paths or URLs

    status: {
      type: String,
      enum: ['Pending', 'Available', 'Sold', 'Rejected'],
      default: 'Pending',
    },

    isFeatured: { type: Boolean, default: false },

    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },

    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-calculate pricePerUnit before saving
listingSchema.pre('save', function (next) {
  if (this.price && this.area) {
    this.pricePerUnit = Math.round(this.price / this.area);
  }
  next();
});

// Text index for search
listingSchema.index({ title: 'text', description: 'text', location: 'text', district: 'text' });

module.exports = mongoose.model('Listing', listingSchema);
