const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const City = require('../models/City');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Connect to MongoDB using the provided connection string
const MONGO_URI = 'mongodb://jbccdevuser:12345pak@10.8.0.52:27017/jbccdev';
console.log('Connecting to MongoDB...');
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Moroccan cities data
const moroccanCities = [
  { name: 'Casablanca', postalCode: '20000', region: 'Casablanca-Settat' },
  { name: 'Rabat', postalCode: '10000', region: 'Rabat-Salé-Kénitra' },
  { name: 'Marrakech', postalCode: '40000', region: 'Marrakech-Safi' },
  { name: 'Fès', postalCode: '30000', region: 'Fès-Meknès' },
  { name: 'Tanger', postalCode: '90000', region: 'Tanger-Tétouan-Al Hoceima' },
  { name: 'Meknès', postalCode: '50000', region: 'Fès-Meknès' },
  { name: 'Oujda', postalCode: '60000', region: 'Oriental' },
  { name: 'Kénitra', postalCode: '14000', region: 'Rabat-Salé-Kénitra' },
  { name: 'Agadir', postalCode: '80000', region: 'Souss-Massa' },
  { name: 'Tétouan', postalCode: '93000', region: 'Tanger-Tétouan-Al Hoceima' },
  { name: 'Safi', postalCode: '46000', region: 'Marrakech-Safi' },
  { name: 'Mohammedia', postalCode: '28810', region: 'Casablanca-Settat' },
  { name: 'El Jadida', postalCode: '24000', region: 'Casablanca-Settat' },
  { name: 'Khouribga', postalCode: '25000', region: 'Béni Mellal-Khénifra' },
  { name: 'Béni Mellal', postalCode: '23000', region: 'Béni Mellal-Khénifra' },
  { name: 'Nador', postalCode: '62000', region: 'Oriental' },
  { name: 'Taza', postalCode: '35000', region: 'Fès-Meknès' },
  { name: 'Settat', postalCode: '26000', region: 'Casablanca-Settat' },
  { name: 'Berrechid', postalCode: '26100', region: 'Casablanca-Settat' },
  { name: 'Khémisset', postalCode: '15000', region: 'Rabat-Salé-Kénitra' },
  { name: 'Guelmim', postalCode: '81000', region: 'Guelmim-Oued Noun' },
  { name: 'Témara', postalCode: '12000', region: 'Rabat-Salé-Kénitra' },
  { name: 'Taourirt', postalCode: '65800', region: 'Oriental' },
  { name: 'Berkane', postalCode: '63300', region: 'Oriental' },
  { name: 'Larache', postalCode: '92000', region: 'Tanger-Tétouan-Al Hoceima' },
  { name: 'Khénifra', postalCode: '54000', region: 'Béni Mellal-Khénifra' },
  { name: 'Ouarzazate', postalCode: '45000', region: 'Drâa-Tafilalet' },
  { name: 'Essaouira', postalCode: '44000', region: 'Marrakech-Safi' },
  { name: 'Tan-Tan', postalCode: '82000', region: 'Guelmim-Oued Noun' },
  { name: 'Chefchaouen', postalCode: '91000', region: 'Tanger-Tétouan-Al Hoceima' },
  { name: 'Youssoufia', postalCode: '46300', region: 'Marrakech-Safi' },
  { name: 'Laâyoune', postalCode: '70000', region: 'Laâyoune-Sakia El Hamra' },
  { name: 'Tiznit', postalCode: '85000', region: 'Souss-Massa' },
  { name: 'Dakhla', postalCode: '73000', region: 'Dakhla-Oued Ed-Dahab' }
  // Note: This is a starter list. In production, you would import all 1,537 cities
];

const importCities = async () => {
  try {
    // Clear existing cities
    await City.deleteMany({});
    console.log('Existing cities deleted');

    // Insert new cities
    const cities = await City.insertMany(moroccanCities);
    console.log(`${cities.length} cities imported successfully`);

    // Create a JSON file with the imported cities
    fs.writeFileSync(
      path.resolve(__dirname, '../../../frontend/data/importedCities.json'),
      JSON.stringify(cities, null, 2)
    );
    console.log('Cities exported to frontend/data/importedCities.json');

    mongoose.disconnect();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error importing cities:', error);
    process.exit(1);
  }
};

importCities();
