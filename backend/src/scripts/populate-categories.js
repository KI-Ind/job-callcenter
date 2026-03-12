/**
 * Script to populate the database with the updated category structure
 * This script will add the new categories with their types to the database
 * 
 * Usage: node populate-categories.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Define Category Schema (simplified version matching the database schema)
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  label: {
    type: String,
    required: true,
    trim: true
  },
  types: {
    type: [String],
    default: []
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Create Category model
const Category = mongoose.model('Category', categorySchema);

// Define the updated categories with their types
const updatedCategories = [
  {
    name: 'call-center',
    label: 'Call Center',
    types: ['Outbound', 'Inbound', 'Back Office', 'Telemarketing', 'Appointment Setting'],
    description: 'Postes dans les centres d\'appels pour la gestion des appels entrants et sortants'
  },
  {
    name: 'support-multicanal',
    label: 'Support Multicanal',
    types: ['Live Chat', 'Email Handling', 'Social Media', 'Claims'],
    description: 'Postes de support client à travers différents canaux de communication'
  },
  {
    name: 'support-technique',
    label: 'Support Technique',
    types: ['Hotline', 'Level 1', 'Level 2', 'Diagnostics'],
    description: 'Postes d\'assistance technique et résolution de problèmes'
  },
  {
    name: 'back-office',
    label: 'Back Office',
    types: ['Data Entry', 'File Processing', 'Verification'],
    description: 'Postes administratifs et de traitement des données'
  },
  {
    name: 'teletravail-freelance',
    label: 'Télétravail & Freelance',
    types: ['Remote Work', 'Hybrid', 'Freelance', 'Part-time'],
    description: 'Opportunités de travail à distance ou en freelance'
  },
  {
    name: 'gestion-equipe',
    label: 'Gestion d\'Équipe',
    types: ['Team Leader', 'Supervisor', 'Floor Manager', 'Quality Manager'],
    description: 'Postes de management et supervision d\'équipe'
  },
  {
    name: 'formation-qualite',
    label: 'Formation & Qualité',
    types: ['Trainer', 'Coach', 'Quality Analyst', 'Facilitator'],
    description: 'Postes liés à la formation et au contrôle qualité'
  },
  {
    name: 'recrutement-rh',
    label: 'Recrutement & RH',
    types: ['Recruiter', 'HR Assistant', 'Admin & Payroll'],
    description: 'Postes dans les ressources humaines et le recrutement'
  },
  {
    name: 'stages-apprentissages',
    label: 'Stages & Apprentissages',
    types: ['Intern – Operations', 'Intern – HR', 'Apprentice'],
    description: 'Opportunités pour les stagiaires et apprentis'
  }
];

// Function to populate categories
const populateCategories = async () => {
  try {
    // Connect to the database
    await connectDB();
    
    console.log('Clearing existing categories...');
    await Category.deleteMany({});
    
    console.log('Adding updated categories...');
    const createdCategories = await Category.insertMany(updatedCategories);
    
    console.log(`Successfully added ${createdCategories.length} categories with their types`);
    console.log('Categories added:');
    createdCategories.forEach(cat => {
      console.log(`- ${cat.label} (${cat.types.length} types)`);
    });
    
    console.log('Database population completed successfully');
    process.exit(0);
  } catch (error) {
    console.error(`Error populating categories: ${error.message}`);
    process.exit(1);
  }
};

// Run the population script
populateCategories();
