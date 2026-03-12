const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom de la catégorie est requis'],
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String
  },
  icon: {
    type: String,
    default: 'briefcase'
  },
  types: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for jobs
categorySchema.virtual('jobs', {
  ref: 'Job',
  localField: '_id',
  foreignField: 'category',
  justOne: false,
  count: true
});

module.exports = mongoose.model('Category', categorySchema);
