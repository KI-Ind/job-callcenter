const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const Category = require('../models/category.model');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobcallcenter', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
  dbName: process.env.DB_NAME || 'jobcallcenter'
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Read categories from JSON file
const categories = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../data/categories.json'), 'utf-8')
);

// Function to import categories
const importCategories = async () => {
  try {
    // Clear existing categories
    await Category.deleteMany({});
    console.log('Existing categories deleted');

    // Import new categories
    const result = await Category.insertMany(categories);
    console.log(`${result.length} categories imported successfully`);
    
    // Log the imported categories
    console.log('Imported categories:');
    result.forEach(cat => {
      console.log(`- ${cat.name} (${cat._id})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error importing categories:', error);
    process.exit(1);
  }
};

// Run the import
importCategories();
