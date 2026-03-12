const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'L\'offre d\'emploi est requise']
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Le candidat est requis']
  },
  resume: {
    type: String,
    required: [true, 'Le CV est requis']
  },
  coverLetter: {
    type: String
  },
  status: {
    type: String,
    enum: ['En attente', 'Examinée', 'Entretien', 'Acceptée', 'Rejetée'],
    default: 'En attente'
  },
  notes: {
    type: String
  },
  employerFeedback: {
    type: String
  },
  interviewDate: {
    type: Date
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
  timestamps: true
});

// Compound index to prevent duplicate applications
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
