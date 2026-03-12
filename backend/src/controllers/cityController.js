const City = require('../models/City');

/**
 * Get all cities
 * @route GET /api/cities
 * @access Public
 */
exports.getCities = async (req, res) => {
  try {
    const cities = await City.find({ isActive: true }).sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: cities.length,
      data: cities
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des villes',
      error: error.message
    });
  }
};

/**
 * Get city by postal code
 * @route GET /api/cities/:postalCode
 * @access Public
 */
exports.getCityByPostalCode = async (req, res) => {
  try {
    const city = await City.findOne({ 
      postalCode: req.params.postalCode,
      isActive: true 
    });
    
    if (!city) {
      return res.status(404).json({
        success: false,
        message: 'Ville non trouvée avec ce code postal'
      });
    }
    
    res.status(200).json({
      success: true,
      data: city
    });
  } catch (error) {
    console.error('Error fetching city by postal code:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la ville',
      error: error.message
    });
  }
};

/**
 * Create a new city (Admin only)
 * @route POST /api/cities
 * @access Private/Admin
 */
exports.createCity = async (req, res) => {
  try {
    const { name, postalCode, region } = req.body;
    
    // Check if city with this postal code already exists
    const existingCity = await City.findOne({ postalCode });
    if (existingCity) {
      return res.status(400).json({
        success: false,
        message: 'Une ville avec ce code postal existe déjà'
      });
    }
    
    const city = await City.create({
      name,
      postalCode,
      region,
      isActive: true
    });
    
    res.status(201).json({
      success: true,
      data: city
    });
  } catch (error) {
    console.error('Error creating city:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la ville',
      error: error.message
    });
  }
};

/**
 * Bulk import cities (Admin only)
 * @route POST /api/cities/bulk
 * @access Private/Admin
 */
exports.bulkImportCities = async (req, res) => {
  try {
    const { cities } = req.body;
    
    if (!Array.isArray(cities) || cities.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucune ville à importer'
      });
    }
    
    // Process each city
    const result = await City.insertMany(
      cities.map(city => ({
        name: city.name,
        postalCode: city.postalCode,
        region: city.region || '',
        isActive: true
      })),
      { ordered: false } // Continue processing even if some documents fail
    );
    
    res.status(201).json({
      success: true,
      count: result.length,
      message: `${result.length} villes importées avec succès`
    });
  } catch (error) {
    console.error('Error bulk importing cities:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'importation des villes',
      error: error.message
    });
  }
};
