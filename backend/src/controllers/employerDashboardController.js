const User = require('../models/user.model');
const Job = require('../models/job.model');
const Application = require('../models/application.model');
const Interview = require('../models/interview.model');
const Company = require('../models/company.model');
const Notification = require('../models/Notification');
const { errorHandler } = require('../utils/errorHandler');
const { sendApplicationStatusNotification } = require('../utils/notificationService');

/**
 * Get employer dashboard statistics
 * @route GET /api/employeur/dashboard/stats
 * @access Private/Employer
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find company where user is the owner
    const company = await Company.findOne({ owner: userId });
    const companyId = company ? company._id : null;

    // Default values if no company or jobs found
    let activeJobs = 0;
    let draftJobs = 0;
    let applications = 0;
    let interviews = 0;

    if (companyId) {
      // Get count of active jobs
      activeJobs = await Job.countDocuments({ 
        company: companyId, 
        status: 'active' 
      });

      // Get count of draft jobs
      draftJobs = await Job.countDocuments({ 
        company: companyId, 
        status: 'draft' 
      });

      // Get all jobs by this employer
      const jobs = await Job.find({ company: companyId }).select('_id');
      const jobIds = jobs.map(job => job._id);

      if (jobIds.length > 0) {
        // Get count of applications for all jobs
        applications = await Application.countDocuments({
          job: { $in: jobIds }
        });

        // Get count of scheduled interviews
        interviews = await Interview.countDocuments({
          job: { $in: jobIds },
          status: 'scheduled'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        activeJobs,
        draftJobs,
        applications,
        interviews
      }
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Get recent applications
 * @route GET /api/employeur/applications/recent
 * @access Private/Employer
 */
exports.getRecentApplications = async (req, res) => {
  try {
    const companyId = req.user.company;
    const limit = parseInt(req.query.limit) || 5;

    // Get all jobs by this employer
    const jobs = await Job.find({ company: companyId }).select('_id title');
    const jobIds = jobs.map(job => job._id);
    
    // Create a map of job IDs to job titles for quick lookup
    const jobTitlesMap = jobs.reduce((map, job) => {
      map[job._id.toString()] = job.title;
      return map;
    }, {});

    // Get recent applications for all jobs
    const applications = await Application.find({
      job: { $in: jobIds }
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('candidate', 'firstName lastName')
    .lean();

    const formattedApplications = applications.map(app => ({
      id: app._id,
      jobId: app.job,
      jobTitle: jobTitlesMap[app.job.toString()] || 'Poste inconnu',
      candidatId: app.candidate._id,
      candidatName: `${app.candidate.firstName} ${app.candidate.lastName}`,
      appliedAt: app.createdAt,
      status: app.status,
      resumeUrl: app.resumeUrl
    }));

    res.status(200).json({
      success: true,
      data: formattedApplications
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Get upcoming interviews
 * @route GET /api/employeur/interviews/upcoming
 * @access Private/Employer
 */
exports.getUpcomingInterviews = async (req, res) => {
  try {
    const companyId = req.user.company;
    const limit = parseInt(req.query.limit) || 5;

    // Get all jobs by this employer
    const jobs = await Job.find({ company: companyId }).select('_id title');
    const jobIds = jobs.map(job => job._id);
    
    // Create a map of job IDs to job titles for quick lookup
    const jobTitlesMap = jobs.reduce((map, job) => {
      map[job._id.toString()] = job.title;
      return map;
    }, {});

    // Get upcoming interviews for all jobs
    const interviews = await Interview.find({
      job: { $in: jobIds },
      interviewDate: { $gte: new Date() },
      status: 'scheduled'
    })
    .sort({ interviewDate: 1 })
    .limit(limit)
    .populate('candidate', 'firstName lastName')
    .lean();

    const formattedInterviews = interviews.map(interview => ({
      id: interview._id,
      jobId: interview.job,
      jobTitle: jobTitlesMap[interview.job.toString()] || 'Poste inconnu',
      candidatId: interview.candidate._id,
      candidatName: `${interview.candidate.firstName} ${interview.candidate.lastName}`,
      interviewDate: interview.interviewDate,
      interviewType: interview.interviewType,
      interviewLink: interview.interviewLink,
      status: interview.status,
      notes: interview.notes
    }));

    res.status(200).json({
      success: true,
      data: formattedInterviews
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Get company profile
 * @route GET /api/employeur/company
 * @access Private/Employer
 */
exports.getCompanyProfile = async (req, res) => {
  try {
    // Get company ID from user object
    const userId = req.user.id;
    
    // Find company where user is the owner
    const company = await Company.findOne({ owner: userId }).lean();

    if (!company) {
      // If no company exists, create a default one for this user
      const newCompany = await Company.create({
        name: req.user.firstName ? `${req.user.firstName}'s Company` : 'New Company',
        industry: 'Call Center',
        owner: userId
      });
      
      // Update user with company reference
      await User.findByIdAndUpdate(userId, { company: newCompany._id });
      
      return res.status(200).json({
        success: true,
        data: {
          id: newCompany._id,
          name: newCompany.name,
          logo: newCompany.logo || '',
          industry: newCompany.industry,
          size: newCompany.size || '',
          foundingYear: newCompany.foundingYear || null,
          website: newCompany.website || '',
          description: newCompany.description || '',
          address: newCompany.address || {
            street: '',
            city: '',
            postalCode: '',
            country: 'Morocco'
          },
          contactEmail: newCompany.contactEmail || '',
          contactPhone: newCompany.contactPhone || '',
          socialMedia: newCompany.socialMedia || {
            linkedin: '',
            facebook: '',
            twitter: ''
          },
          isVerified: newCompany.isVerified || false,
          isFeatured: newCompany.isFeatured || false,
          verification: newCompany.verification || {
            email: false,
            phone: false,
            address: false,
            identity: false
          },
          adminRoles: newCompany.adminRoles || {
            isAdmin: false,
            isPrimaryContact: true,
            isProfileVerified: false
          },
          slug: newCompany.slug || '',
          contactPerson: newCompany.contactPerson || {
            jobTitle: '',
            department: ''
          },
          createdAt: newCompany.createdAt,
          updatedAt: newCompany.updatedAt
        }
      });
    }

    // Return existing company
    res.status(200).json({
      success: true,
      data: {
        id: company._id,
        name: company.name,
        logo: company.logo || '',
        industry: company.industry,
        size: company.size || '',
        foundingYear: company.foundingYear || null,
        website: company.website || '',
        description: company.description || '',
        address: company.address || {
          street: '',
          city: '',
          postalCode: '',
          country: 'Morocco'
        },
        contactEmail: company.contactEmail || '',
        contactPhone: company.contactPhone || '',
        socialMedia: company.socialMedia || {
          linkedin: '',
          facebook: '',
          twitter: ''
        },
        isVerified: company.isVerified || false,
        isFeatured: company.isFeatured || false,
        verification: company.verification || {
          email: false,
          phone: false,
          address: false,
          identity: false
        },
        adminRoles: company.adminRoles || {
          isAdmin: false,
          isPrimaryContact: true,
          isProfileVerified: false
        },
        slug: company.slug || '',
        contactPerson: company.contactPerson || {
          jobTitle: '',
          department: ''
        },
        createdAt: company.createdAt,
        updatedAt: company.updatedAt
      }
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Update company profile
 * @route PUT /api/employeur/company
 * @access Private/Employer
 */
exports.updateCompanyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Updating company profile for user:', userId);
    
    const { 
      name, 
      industry, 
      size, 
      foundingYear,
      website, 
      description, 
      address,
      contactEmail,
      contactPhone,
      socialMedia,
      logo,
      isVerified,
      isFeatured,
      adminRoles,
      slug,
      contactPerson
    } = req.body;

    // Find company where user is the owner
    let company = await Company.findOne({ owner: userId });

    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }

    // Create update object with only the fields that are provided
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (industry !== undefined) updateData.industry = industry;
    if (size !== undefined) updateData.size = size;
    if (foundingYear !== undefined) updateData.foundingYear = foundingYear;
    if (website !== undefined) updateData.website = website;
    if (description !== undefined) updateData.description = description;
    if (address !== undefined) updateData.address = address;
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
    if (socialMedia !== undefined) updateData.socialMedia = socialMedia;
    if (logo !== undefined) updateData.logo = logo;
    
    // Handle boolean fields - allow employers to update these fields
    // Force convert to boolean to ensure proper type
    if (isVerified !== undefined) {
      updateData.isVerified = Boolean(isVerified);
      console.log('Setting isVerified to:', updateData.isVerified);
    }
    
    if (isFeatured !== undefined) {
      updateData.isFeatured = Boolean(isFeatured);
      console.log('Setting isFeatured to:', updateData.isFeatured);
    }
    
    // Handle admin roles
    if (adminRoles !== undefined) {
      // Get existing admin roles to preserve values that shouldn't be changed
      const existingAdminRoles = company.adminRoles || {
        isAdmin: false,
        isPrimaryContact: true,
        isProfileVerified: false
      };
      
      // Create a new object with explicit boolean conversions
      updateData.adminRoles = {
        ...existingAdminRoles,
        // Allow updating these fields with explicit boolean conversion
        isAdmin: adminRoles.isAdmin !== undefined ? Boolean(adminRoles.isAdmin) : existingAdminRoles.isAdmin,
        isPrimaryContact: adminRoles.isPrimaryContact !== undefined ? Boolean(adminRoles.isPrimaryContact) : existingAdminRoles.isPrimaryContact,
        isProfileVerified: adminRoles.isProfileVerified !== undefined ? Boolean(adminRoles.isProfileVerified) : existingAdminRoles.isProfileVerified
      };
      
      console.log('Setting adminRoles to:', updateData.adminRoles);
    }
    
    // Handle slug and contactPerson
    if (slug !== undefined) updateData.slug = slug;
    if (contactPerson !== undefined) updateData.contactPerson = contactPerson;
    
    console.log('Final update data:', JSON.stringify(updateData, null, 2));
    
    // Update the company with the new data
    company = await Company.findOneAndUpdate(
      { owner: userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    console.log('Updated company:', JSON.stringify({
      isVerified: company.isVerified,
      isFeatured: company.isFeatured,
      adminRoles: company.adminRoles
    }, null, 2));

    res.status(200).json({
      success: true,
      data: {
        id: company._id,
        name: company.name,
        logo: company.logo || '',
        industry: company.industry,
        size: company.size || '',
        website: company.website || '',
        description: company.description || '',
        address: company.address || {
          street: '',
          city: '',
          postalCode: '',
          country: 'Morocco'
        },
        contactEmail: company.contactEmail || '',
        contactPhone: company.contactPhone || '',
        socialMedia: company.socialMedia || {
          linkedin: '',
          facebook: '',
          twitter: ''
        },
        isVerified: company.isVerified || false,
        isFeatured: company.isFeatured || false,
        adminRoles: company.adminRoles || {
          isAdmin: false,
          isPrimaryContact: true,
          isProfileVerified: false
        },
        slug: company.slug || '',
        contactPerson: company.contactPerson || {
          jobTitle: '',
          department: ''
        },
        createdAt: company.createdAt,
        updatedAt: company.updatedAt
      }
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Get all jobs by employer
 * @route GET /api/employeur/jobs
 * @access Private/Employer
 */
exports.getEmployerJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const statusFilter = req.query.status;
    
    // Build filter object - query by postedBy instead of company
    const filter = { postedBy: userId };
    
    if (statusFilter && statusFilter !== 'all') {
      filter.status = statusFilter;
    }
    
    console.log('Fetching jobs with filter:', filter);
    
    // Sort options
    const sortOption = req.query.sort || '-createdAt';
    
    // Get jobs with pagination
    const jobs = await Job.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();
    
    console.log(`Found ${jobs.length} jobs`);
    
    // Get total count for pagination
    const total = await Job.countDocuments(filter);
    
    // Get application counts for each job
    const jobIds = jobs.map(job => job._id);
    const applicationCounts = jobIds.length > 0 ? await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: '$job', count: { $sum: 1 } } }
    ]) : [];
    
    // Create a map of job IDs to application counts
    const applicationCountsMap = applicationCounts.reduce((map, item) => {
      map[item._id.toString()] = item.count;
      return map;
    }, {});
    
    // Format jobs with application counts
    const formattedJobs = jobs.map(job => ({
      id: job._id,
      title: job.title,
      status: job.status || 'active',
      location: job.location,
      jobType: job.jobType,
      salary: job.salary,
      applicationsCount: applicationCountsMap[job._id.toString()] || 0,
      createdAt: job.createdAt,
      expiresAt: job.expiresAt
    }));
    
    res.status(200).json({
      success: true,
      data: formattedJobs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error in getEmployerJobs:', error);
    errorHandler(error, req, res);
  }
};

/**
 * Get all applications for the employer's jobs
 * @route GET /api/employeur/applications
 * @access Private/Employer
 */
exports.getAllApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const statusFilter = req.query.status;
    const jobFilter = req.query.jobId;
    
    // First, get all jobs by this employer
    const jobs = await Job.find({ postedBy: userId }).select('_id title');
    const jobIds = jobs.map(job => job._id);
    
    // Create a map of job IDs to job titles for quick lookup
    const jobTitlesMap = jobs.reduce((map, job) => {
      map[job._id.toString()] = job.title;
      return map;
    }, {});
    
    // Build filter object
    const filter = { job: { $in: jobIds } };
    
    if (statusFilter && statusFilter !== 'all') {
      filter.status = statusFilter;
    }
    
    if (jobFilter) {
      filter.job = jobFilter;
    }
    
    // Sort options
    const sortOption = req.query.sort || '-createdAt';
    
    // Get applications with pagination
    const applications = await Application.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate('candidate', 'firstName lastName email')
      .populate('job', 'title')
      .lean();
    
    // Get total count for pagination
    const total = await Application.countDocuments(filter);
    
    // Format applications
    const formattedApplications = applications.map(app => ({
      id: app._id,
      jobId: app.job._id,
      jobTitle: app.job.title || jobTitlesMap[app.job.toString()] || 'Poste inconnu',
      candidateId: app.candidate._id,
      candidateName: `${app.candidate.firstName} ${app.candidate.lastName}`,
      candidateEmail: app.candidate.email,
      status: app.status,
      coverLetter: app.coverLetter,
      resume: app.resume,
      appliedAt: app.createdAt,
      lastUpdated: app.updatedAt,
      expectedSalary: app.expectedSalary,
      availableStartDate: app.availableStartDate
    }));
    
    res.status(200).json({
      success: true,
      data: formattedApplications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error in getAllApplications:', error);
    errorHandler(error, req, res);
  }
};

/**
 * Get application details
 * @route GET /api/employeur/applications/:id
 * @access Private/Employer
 */
exports.getApplicationDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const applicationId = req.params.id;
    
    // First, get all jobs by this employer
    const jobs = await Job.find({ postedBy: userId }).select('_id');
    const jobIds = jobs.map(job => job._id);
    
    // Find the application and ensure it belongs to one of the employer's jobs
    const application = await Application.findOne({
      _id: applicationId,
      job: { $in: jobIds }
    })
    .populate('candidate', 'firstName lastName email phone')
    .populate({
      path: 'job',
      select: 'title location salary jobType description requirements',
      populate: {
        path: 'company',
        select: 'name logo'
      }
    })
    .lean();
    
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Candidature non trouvée ou vous n\'avez pas les droits pour y accéder'
      });
    }
    
    // Format application details
    const formattedApplication = {
      id: application._id,
      job: {
        id: application.job._id,
        title: application.job.title,
        location: application.job.location,
        salary: application.job.salary,
        jobType: application.job.jobType,
        description: application.job.description,
        requirements: application.job.requirements,
        company: application.job.company ? {
          name: application.job.company.name,
          logo: application.job.company.logo
        } : null
      },
      candidate: {
        id: application.candidate._id,
        name: `${application.candidate.firstName} ${application.candidate.lastName}`,
        email: application.candidate.email,
        phone: application.candidate.phone
      },
      status: application.status,
      coverLetter: application.coverLetter,
      resume: application.resume,
      appliedAt: application.createdAt,
      lastUpdated: application.updatedAt,
      expectedSalary: application.expectedSalary,
      availableStartDate: application.availableStartDate,
      additionalInfo: application.additionalInfo,
      employerNotes: application.employerNotes || '',
      interviewDate: application.interviewDate
    };
    
    res.status(200).json({
      success: true,
      data: formattedApplication
    });
  } catch (error) {
    console.error('Error in getApplicationDetails:', error);
    errorHandler(error, req, res);
  }
};

/**
 * Update application status
 * @route PUT /api/employeur/applications/:id/status
 * @access Private/Employer
 */
exports.updateApplicationStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const applicationId = req.params.id;
    const { status, employerNotes, interviewDate } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Le statut est requis'
      });
    }
    
    // Validate status
    const validStatuses = ['En attente', 'Examinée', 'Entretien', 'Acceptée', 'Rejetée'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Statut invalide'
      });
    }
    
    // First, get all jobs by this employer
    const jobs = await Job.find({ postedBy: userId }).select('_id title');
    const jobIds = jobs.map(job => job._id);
    
    // Find the application and ensure it belongs to one of the employer's jobs
    const application = await Application.findOne({
      _id: applicationId,
      job: { $in: jobIds }
    }).populate('job', 'title').populate('candidate', '_id');
    
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Candidature non trouvée ou vous n\'avez pas les droits pour y accéder'
      });
    }
    
    // Save the previous status to check if it changed
    const previousStatus = application.status;
    
    // Update the application
    const updateData = { status };
    
    if (employerNotes !== undefined) {
      updateData.employerNotes = employerNotes;
    }
    
    if (interviewDate !== undefined) {
      updateData.interviewDate = interviewDate;
    }
    
    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    // Send notification for the candidate if status has changed
    if (previousStatus !== status) {
      try {
        // Get company name for the notification
        const jobData = await Job.findById(application.job._id)
          .populate('company', 'name')
          .lean();
        
        const companyName = jobData.company ? jobData.company.name : 'L\'employeur';
        
        // Send notification using the unified notification service
        await sendApplicationStatusNotification({
          userId: application.candidate._id,
          jobTitle: application.job.title,
          jobId: application.job._id,
          applicationId: applicationId,
          companyName: companyName,
          status: status
        });
        
        console.log(`Notification sent to candidate ${application.candidate._id} about application status change to ${status}`);
      } catch (notificationError) {
        // Don't fail the status update if notification fails
        console.error('Error sending application status notification:', notificationError);
      }
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: updatedApplication._id,
        status: updatedApplication.status,
        employerNotes: updatedApplication.employerNotes,
        interviewDate: updatedApplication.interviewDate,
        updatedAt: updatedApplication.updatedAt
      }
    });
  } catch (error) {
    console.error('Error in updateApplicationStatus:', error);
    errorHandler(error, req, res);
  }
};
