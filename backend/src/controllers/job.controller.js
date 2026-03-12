const Job = require('../models/job.model');
const Company = require('../models/company.model');
const User = require('../models/user.model');
const Notification = require('../models/Notification');
const { sendNewJobNotification } = require('../utils/notificationService');

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private (Employers and Admins only)
exports.createJob = async (req, res) => {
  try {
    // Add user to req.body
    req.body.postedBy = req.user.id;

    // Check if company exists and belongs to user
    const company = await Company.findById(req.body.company);
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
        message: 'Non autorisé à créer une offre pour cette entreprise'
      });
    }

    const job = await Job.create(req.body);

    // Send notifications to candidates who might be interested in this job
    try {
      // Find candidates with matching preferences or skills
      // For simplicity, we're notifying candidates who have enabled job recommendations
      const interestedCandidates = await User.find({
        role: 'candidat',
        'notificationSettings.jobRecommendations': true
      }).select('_id');

      // Get company name for the notification
      const companyData = await Company.findById(job.company).select('name');
      const companyName = companyData ? companyData.name : 'Une entreprise';
      
      // Format location
      const location = typeof job.location === 'object' ? job.location.city : job.location;
      
      // Send notifications to interested candidates using the unified notification service
      const notificationPromises = interestedCandidates.map(candidate => 
        sendNewJobNotification({
          userId: candidate._id,
          jobTitle: job.title,
          jobId: job._id,
          companyName: companyName,
          location: location
        })
      );
      
      // Execute all notification promises
      if (notificationPromises.length > 0) {
        await Promise.allSettled(notificationPromises);
        console.log(`Sent job notifications to ${notificationPromises.length} candidates`);
      }
    } catch (notificationError) {
      // Don't fail the job creation if notifications fail
      console.error('Error sending job notifications:', notificationError);
    }

    res.status(201).json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'offre',
      error: error.message
    });
  }
};

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res) => {
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
    let query = Job.find(JSON.parse(queryStr))
      .populate({
        path: 'company',
        select: 'name logo location'
      })
      .populate('category', 'name');

    // Search functionality
    if (req.query.search) {
      query = query.find({
        $or: [
          { title: { $regex: req.query.search, $options: 'i' } },
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
    const total = await Job.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const jobs = await query;

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
      count: jobs.length,
      pagination,
      total,
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des offres',
      error: error.message
    });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate({
        path: 'company',
        select: 'name logo location description website industry size'
      })
      .populate('category', 'name');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Offre non trouvée'
      });
    }

    // Increment views
    job.views += 1;
    await job.save();

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'offre',
      error: error.message
    });
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private
exports.updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Offre non trouvée'
      });
    }

    // Make sure user is job owner or admin
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé à mettre à jour cette offre'
      });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'offre',
      error: error.message
    });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Offre non trouvée'
      });
    }

    // Make sure user is job owner or admin
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé à supprimer cette offre'
      });
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'offre',
      error: error.message
    });
  }
};

// @desc    Get jobs by employer
// @route   GET /api/jobs/employer
// @access  Private
exports.getEmployerJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id })
      .populate({
        path: 'company',
        select: 'name logo'
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
      message: 'Erreur lors de la récupération des offres',
      error: error.message
    });
  }
};

// @desc    Get featured jobs
// @route   GET /api/jobs/featured
// @access  Public
exports.getFeaturedJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ isFeatured: true, isActive: true })
      .populate({
        path: 'company',
        select: 'name logo location'
      })
      .populate('category', 'name')
      .limit(6);

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des offres en vedette',
      error: error.message
    });
  }
};

// @desc    Search jobs
// @route   GET /api/jobs/search
// @access  Public
exports.searchJobs = async (req, res) => {
  try {
    // Copy req.query
    const { q, location, type, category, experience, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = { isActive: true };
    
    // Add search criteria
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (location) {
      query['location.city'] = { $regex: location, $options: 'i' };
    }
    
    if (type) {
      query.jobType = type;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (experience) {
      query.experienceLevel = experience;
    }
    
    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIndex = (pageNum - 1) * limitNum;
    
    // Execute query
    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate({
        path: 'company',
        select: 'name logo location'
      })
      .populate('category', 'name')
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limitNum);
    
    res.status(200).json({
      success: true,
      data: {
        jobs,
        totalPages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche des offres',
      error: error.message
    });
  }
};
