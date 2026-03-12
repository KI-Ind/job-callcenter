const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre du poste est requis'],
    trim: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'L\'entreprise est requise']
  },
  location: {
    city: {
      type: String,
      required: [true, 'La ville est requise']
    },
    address: String,
    country: {
      type: String,
      default: 'Maroc'
    }
  },
  jobType: {
    type: String,
    enum: ['CDI', 'CDD', 'Freelance', 'Stage', 'Temps partiel'],
    required: [true, 'Le type de contrat est requis']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'La catégorie est requise']
  },
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'MAD'
    },
    isDisplayed: {
      type: Boolean,
      default: true
    }
  },
  description: {
    type: String,
    required: [true, 'La description du poste est requise']
  },
  requirements: {
    type: String,
    required: [true, 'Les exigences du poste sont requises']
  },
  responsibilities: {
    type: String,
    required: [true, 'Les responsabilités du poste sont requises']
  },
  benefits: String,
  skills: [{
    type: String,
    trim: true
  }],
  experience: {
    type: String,
    enum: ['Débutant', '1-2 ans', '3-5 ans', '5-10 ans', '10+ ans'],
    required: [true, 'L\'expérience requise est nécessaire']
  },
  education: {
    type: String,
    enum: ['Bac', 'Bac+2', 'Bac+3/Licence', 'Bac+5/Master', 'Doctorat', 'Autre'],
    required: [true, 'Le niveau d\'éducation requis est nécessaire']
  },
  applicationDeadline: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  applicationsCount: {
    type: Number,
    default: 0
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Virtual for applications
jobSchema.virtual('applications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'job',
  justOne: false
});

// Index for search
jobSchema.index({ title: 'text', description: 'text', 'location.city': 'text' });

module.exports = mongoose.model('Job', jobSchema);
