const Application = require('../models/application.model');
const Job = require('../models/job.model');
const User = require('../models/user.model');

// @desc    Create new application
// @route   POST /api/applications
// @access  Private (Candidates only)
exports.createApplication = async (req, res) => {
  try {
    // Add candidate to req.body
    req.body.candidate = req.user.id;

    // Check if job exists
    const job = await Job.findById(req.body.job);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Offre d\'emploi non trouvée'
      });
    }

    // Check if job is active
    if (!job.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cette offre d\'emploi n\'est plus active'
      });
    }

    // Check if user has already applied for this job
    const existingApplication = await Application.findOne({
      job: req.body.job,
      candidate: req.user.id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà postulé à cette offre'
      });
    }

    const application = await Application.create(req.body);

    // Increment applications count for the job
    job.applicationsCount += 1;
    await job.save();

    res.status(201).json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la candidature',
      error: error.message
    });
  }
};

// @desc    Get all applications
// @route   GET /api/applications
// @access  Private (Admin only)
exports.getApplications = async (req, res) => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    let query = Application.find(JSON.parse(queryStr))
      .populate({
        path: 'job',
        select: 'title company',
        populate: {
          path: 'company',
          select: 'name'
        }
      })
      .populate({
        path: 'candidate',
        select: 'firstName lastName email'
      });

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
    const total = await Application.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const applications = await query;

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
      count: applications.length,
      pagination,
      total,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des candidatures',
      error: error.message
    });
  }
};

// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Private
exports.getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({
        path: 'job',
        select: 'title description requirements company',
        populate: {
          path: 'company',
          select: 'name logo'
        }
      })
      .populate({
        path: 'candidate',
        select: 'firstName lastName email phone profileImage'
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Candidature non trouvée'
      });
    }

    // Make sure user is application owner, job poster, or admin
    if (
      application.candidate._id.toString() !== req.user.id &&
      application.job.company.owner !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé à accéder à cette candidature'
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la candidature',
      error: error.message
    });
  }
};

// @desc    Update application
// @route   PUT /api/applications/:id
// @access  Private (Employer or Admin only)
exports.updateApplication = async (req, res) => {
  try {
    let application = await Application.findById(req.params.id)
      .populate({
        path: 'job',
        select: 'postedBy'
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Candidature non trouvée'
      });
    }

    // Make sure user is job poster or admin
    if (
      application.job.postedBy.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé à mettre à jour cette candidature'
      });
    }

    application = await Application.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la candidature',
      error: error.message
    });
  }
};

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Private
exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({
        path: 'job',
        select: 'postedBy applicationsCount'
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Candidature non trouvée'
      });
    }

    // Make sure user is application owner, job poster, or admin
    if (
      application.candidate.toString() !== req.user.id &&
      application.job.postedBy.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé à supprimer cette candidature'
      });
    }

    await application.deleteOne();

    // Decrement applications count for the job
    if (application.job.applicationsCount > 0) {
      application.job.applicationsCount -= 1;
      await application.job.save();
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la candidature',
      error: error.message
    });
  }
};

// @desc    Get applications by candidate
// @route   GET /api/applications/candidate
// @access  Private (Candidates only)
exports.getCandidateApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user.id })
      .populate({
        path: 'job',
        select: 'title company location jobType createdAt',
        populate: {
          path: 'company',
          select: 'name logo'
        }
      })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des candidatures',
      error: error.message
    });
  }
};

// @desc    Get applications by job
// @route   GET /api/applications/job/:jobId
// @access  Private (Employer or Admin only)
exports.getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Offre d\'emploi non trouvée'
      });
    }

    // Make sure user is job poster or admin
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé à accéder aux candidatures de cette offre'
      });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate({
        path: 'candidate',
        select: 'firstName lastName email profileImage'
      })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des candidatures',
      error: error.message
    });
  }
};
