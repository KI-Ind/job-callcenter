const Category = require('../models/category.model');
const Job = require('../models/job.model');

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (Admin only)
exports.createCategory = async (req, res) => {
  try {
    const { name, slug, description, icon, types } = req.body;
    
    // Validate required fields
    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Le nom et le slug sont requis'
      });
    }
    
    // Create category with types
    const category = await Category.create({
      name,
      slug,
      description: description || '',
      icon: icon || 'briefcase',
      types: Array.isArray(types) ? types : []
    });

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la catégorie',
      error: error.message
    });
  }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort('name');

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des catégories',
      error: error.message
    });
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la catégorie',
      error: error.message
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin only)
exports.updateCategory = async (req, res) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }
    
    const { name, slug, description, icon, types } = req.body;
    
    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name;
    if (slug) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (icon) updateData.icon = icon;
    if (types) updateData.types = Array.isArray(types) ? types : [];

    category = await Category.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la catégorie',
      error: error.message
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin only)
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    // Check if category has jobs
    const jobs = await Job.find({ category: req.params.id });
    if (jobs.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cette catégorie a des offres d\'emploi actives. Veuillez d\'abord supprimer ou réaffecter ces offres.'
      });
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la catégorie',
      error: error.message
    });
  }
};

// @desc    Get category jobs
// @route   GET /api/categories/:id/jobs
// @access  Public
exports.getCategoryJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ 
      category: req.params.id,
      isActive: true 
    })
      .populate({
        path: 'company',
        select: 'name logo location'
      })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des offres de la catégorie',
      error: error.message
    });
  }
};

// @desc    Get categories with job counts
// @route   GET /api/categories/with-counts
// @access  Public
exports.getCategoriesWithCounts = async (req, res) => {
  try {
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: 'category',
          as: 'jobs'
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          slug: 1,
          icon: 1,
          description: 1,
          jobCount: { $size: '$jobs' }
        }
      },
      { $sort: { jobCount: -1 } }
    ]);

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des catégories avec compteurs',
      error: error.message
    });
  }
};
