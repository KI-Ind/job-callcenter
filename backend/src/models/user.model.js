const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define subdocument schemas
const educationSchema = new mongoose.Schema({
  degree: String,
  institution: String,
  startYear: String,
  endYear: String,
  description: String
}, { _id: false });

const experienceSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  startDate: String,
  endDate: String,
  description: String,
  current: Boolean
}, { _id: false });

const languageSchema = new mongoose.Schema({
  name: String,
  level: String
}, { _id: false });

const certificationSchema = new mongoose.Schema({
  name: String,
  issuer: String,
  date: String,
  expiryDate: String,
  description: String
}, { _id: false });

const resumeSchema = new mongoose.Schema({
  filename: String,
  url: String,
  uploadDate: String,
  fileSize: Number
}, { _id: false });

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Prénom est requis'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Nom est requis'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez fournir un email valide']
  },
  password: {
    type: String,
    required: [true, 'Mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
    select: false
  },
  role: {
    type: String,
    enum: ['candidat', 'employeur', 'admin'],
    default: 'candidat'
  },
  profileImage: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    trim: true
  },
  title: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    postalCode: String,
    country: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  socialProfiles: {
    github: String,
    facebook: String,
    linkedin: String
  },
  socialAuth: {
    googleId: String,
    facebookId: String,
    linkedinId: String,
    provider: String
  },
  // Candidate profile specific fields
  professionalSummary: String,
  summary: String, // For backward compatibility
  experiences: [experienceSchema],
  education: [educationSchema],
  certifications: [certificationSchema],
  skills: [String],
  languages: [languageSchema],
  resumes: [resumeSchema],
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

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  // Skip password hashing if the user is registered via social login and has no password
  // or if the password hasn't been modified
  if (!this.password || !this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  // If user has no password (social login), password can't match
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
