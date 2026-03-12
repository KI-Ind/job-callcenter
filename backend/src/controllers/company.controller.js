const Company = require('../models/company.model');
const Job = require('../models/job.model');

// @desc    Create new company
// @route   POST /api/companies
// @access  Private (Employers and Admins only)
exports.createCompany = async (req, res) => {
  try {
    // Add user to req.body
    req.body.owner = req.user.id;

    // Check if user already has a company
    const existingCompany = await Company.findOne({ owner: req.user.id });

    // If user is not an admin, they can only have one company
    if (existingCompany && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà créé une entreprise'
      });
    }

    const company = await Company.create(req.body);

    res.status(201).json({
      success: true,
      data: company
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'entreprise',
      error: error.message
    });
  }
};

// @desc    Get all companies
// @route   GET /api/companies
// @access  Public
exports.getCompanies = async (req, res) => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    let query = Company.find(JSON.parse(queryStr));

    // Search functionality
    if (req.query.search) {
      query = query.find({
        $or: [
          { name: { $regex: req.query.search, $options: 'i' } },
          { industry: { $regex: req.query.search, $options: 'i' } },
          { description: { $regex: req.query.search, $options: 'i' } },
          { 'location.city': { $regex: req.query.search, $options: 'i' } }
        ]
      });
    }

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Company.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const companies = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: companies.length,
      pagination,
      total,
      data: companies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des entreprises',
      error: error.message
    });
  }
};

// @desc    Get single company
// @route   GET /api/companies/:id
// @access  Public
exports.getCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Entreprise non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'entreprise',
      error: error.message
    });
  }
};

// @desc    Update company
// @route   PUT /api/companies/:id
// @access  Private
exports.updateCompany = async (req, res) => {
  try {
    let company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Entreprise non trouvée'
      });
    }

    // Make sure user is company owner or admin
    if (company.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé à mettre à jour cette entreprise'
      });
    }

    company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'entreprise',
      error: error.message
    });
  }
};

// @desc    Delete company
// @route   DELETE /api/companies/:id
// @access  Private
exports.deleteCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Entreprise non trouvée'
      });
    }

    // Make sure user is company owner or admin
    if (company.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé à supprimer cette entreprise'
      });
    }

    // Check if company has jobs
    const jobs = await Job.find({ company: req.params.id });
    if (jobs.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cette entreprise a des offres d\'emploi actives. Veuillez d\'abord supprimer ces offres.'
      });
    }

    await company.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'entreprise',
      error: error.message
    });
  }
};

// @desc    Get company by owner
// @route   GET /api/companies/owner
// @access  Private
exports.getCompanyByOwner = async (req, res) => {
  try {
    const company = await Company.findOne({ owner: req.user.id });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Aucune entreprise trouvée pour cet utilisateur'
      });
    }

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'entreprise',
      error: error.message
    });
  }
};

// @desc    Get company jobs
// @route   GET /api/companies/:id/jobs
// @access  Public
exports.getCompanyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ 
      company: req.params.id,
      isActive: true 
    })
      .populate('category', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des offres de l\'entreprise',
      error: error.message
    });
  }
};
