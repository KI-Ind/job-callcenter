const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  postalCode: {
    type: String,
    required: true,
    trim: true
  },
  region: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create index for faster searches
citySchema.index({ name: 1 });
citySchema.index({ postalCode: 1 });

const City = mongoose.model('City', citySchema);

module.exports = City;
