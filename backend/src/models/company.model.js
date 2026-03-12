const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom de l\'entreprise est requis'],
    trim: true
  },
  logo: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    trim: true
  },
  industry: {
    type: String,
    required: [true, 'Le secteur d\'activité est requis'],
    trim: true
  },
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001+', ''],
    default: ''
  },
  foundingYear: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear(),
    default: null
  },
  description: {
    type: String,
    default: ''
  },
  address: {
    street: {
      type: String,
      default: ''
    },
    city: {
      type: String,
      default: ''
    },
    postalCode: {
      type: String,
      default: ''
    },
    country: {
      type: String,
      default: 'Morocco'
    }
  },
  contactEmail: {
    type: String,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez fournir un email valide'],
    default: ''
  },
  contactPhone: {
    type: String,
    trim: true
  },
  socialMedia: {
    linkedin: String,
    facebook: String,
    twitter: String,
    instagram: String
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  slug: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  adminRoles: {
    isAdmin: {
      type: Boolean,
      default: false
    },
    isPrimaryContact: {
      type: Boolean,
      default: true
    },
    isProfileVerified: {
      type: Boolean,
      default: false
    }
  },
  contactPerson: {
    jobTitle: {
      type: String,
      trim: true,
      default: ''
    },
    department: {
      type: String,
      trim: true,
      default: ''
    }
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
companySchema.virtual('jobs', {
  ref: 'Job',
  localField: '_id',
  foreignField: 'company',
  justOne: false
});

// Index for search
companySchema.index({ name: 'text', description: 'text', industry: 'text', 'location.city': 'text' });

module.exports = mongoose.model('Company', companySchema);
