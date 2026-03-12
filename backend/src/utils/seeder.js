const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Load models
const User = require('../models/user.model');
const Category = require('../models/category.model');
const Company = require('../models/company.model');
const Job = require('../models/job.model');
const Application = require('../models/application.model');
const Newsletter = require('../models/newsletter.model');

// Connect to DB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: process.env.DB_NAME
});

// Read JSON files
const users = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/users.json'), 'utf-8')
);

const categories = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/categories.json'), 'utf-8')
);

// Import data into DB
const importData = async () => {
  try {
    // Hash passwords
    const hashedUsers = await Promise.all(
      users.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        return user;
      })
    );

    await User.create(hashedUsers);
    await Category.create(categories);
    
    console.log('Data Imported...');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Delete data from DB
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Category.deleteMany();
    await Company.deleteMany();
    await Job.deleteMany();
    await Application.deleteMany();
    await Newsletter.deleteMany();
    
    console.log('Data Destroyed...');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Command line args
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please provide proper command: -i (import) or -d (delete)');
  process.exit();
}
