const User = require('../models/user.model');
const Job = require('../models/job.model');
const Company = require('../models/company.model');
const Application = require('../models/application.model');
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const emailService = require('../utils/emailService');
const notificationService = require('../utils/notificationService');
const mongoose = require('mongoose');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
exports.getDashboardStats = async (req, res) => {
  try {
    // User statistics
    const totalCandidates = await User.countDocuments({ role: 'candidat' });
    const totalEmployers = await User.countDocuments({ role: 'employeur' });
    
    // Job statistics
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ isActive: true });
    
    // Application statistics
    const totalApplications = await Application.countDocuments();
    
    // Recent activity
    const recentUsers = await User.find()
      .sort('-createdAt')
      .limit(5)
      .select('firstName lastName email role createdAt');
      
    const recentJobs = await Job.find()
      .sort('-createdAt')
      .limit(5)
      .populate('company', 'name')
      .select('title company location.city jobType createdAt');

    res.status(200).json({
      success: true,
      data: {
        users: {
          totalCandidates,
          totalEmployers,
          total: totalCandidates + totalEmployers
        },
        jobs: {
          total: totalJobs,
          active: activeJobs
        },
        applications: {
          total: totalApplications
        },
        recentActivity: {
          users: recentUsers,
          jobs: recentJobs
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques du tableau de bord',
      error: error.message
    });
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private (Admin only)
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Toggle isActive status
    user.isActive = !user.isActive;
    await user.save();
    
    // Send notification to user
    const notificationTitle = user.isActive 
      ? 'Votre compte a été activé' 
      : 'Votre compte a été désactivé';
    
    const notificationContent = user.isActive
      ? 'Votre compte a été activé par un administrateur. Vous pouvez maintenant vous connecter et utiliser toutes les fonctionnalités.'
      : 'Votre compte a été désactivé par un administrateur. Veuillez contacter le support pour plus d\'informations.';
    
    // Create in-app notification
    await notificationService.createNotification({
      user: user._id,
      title: notificationTitle,
      content: notificationContent,
      type: 'system'
    });
    
    // Send email notification
    await emailService.sendEmail({
      email: user.email,
      subject: notificationTitle,
      message: notificationContent
    });
    
    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      },
      message: `Le statut de l'utilisateur a été ${user.isActive ? 'activé' : 'désactivé'}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du statut de l\'utilisateur',
      error: error.message
    });
  }
};

// @desc    Reset user password and send temporary password
// @route   POST /api/admin/users/:id/reset-password
// @access  Private (Admin only)
exports.resetUserPassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Generate temporary password
    const tempPassword = crypto.randomBytes(5).toString('hex');
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(tempPassword, salt);
    
    // Set password reset flag to force user to change password on next login
    user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    
    await user.save();
    
    // Send notification to user
    const notificationTitle = 'Votre mot de passe a été réinitialisé';
    const notificationContent = `Votre mot de passe a été réinitialisé par un administrateur. Votre mot de passe temporaire est: ${tempPassword}. Veuillez le changer dès que possible.`;
    
    // Create in-app notification
    await notificationService.createNotification({
      user: user._id,
      title: notificationTitle,
      content: 'Votre mot de passe a été réinitialisé par un administrateur. Veuillez consulter votre email pour le mot de passe temporaire.',
      type: 'system'
    });
    
    // Send email notification
    await emailService.sendEmail({
      email: user.email,
      subject: notificationTitle,
      message: notificationContent
    });
    
    res.status(200).json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès et envoyé à l\'utilisateur'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la réinitialisation du mot de passe',
      error: error.message
    });
  }
};

// @desc    Send notification to user
// @route   POST /api/admin/users/:id/send-notification
// @access  Private (Admin only)
exports.sendUserNotification = async (req, res) => {
  try {
    const { title, content, sendEmail } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Le titre et le contenu de la notification sont requis'
      });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Create in-app notification
    const notification = await notificationService.createNotification({
      user: user._id,
      title,
      content,
      type: 'system'
    });
    
    // Send email notification if requested
    if (sendEmail) {
      await emailService.sendEmail({
        email: user.email,
        subject: title,
        message: content
      });
    }
    
    res.status(200).json({
      success: true,
      data: notification,
      message: 'Notification envoyée avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi de la notification',
      error: error.message
    });
  }
};

// @desc    Toggle job active status
// @route   PUT /api/admin/jobs/:id/toggle-status
// @access  Private (Admin only)
exports.toggleJobStatus = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Offre d\'emploi non trouvée'
      });
    }
    
    // Toggle isActive status
    job.isActive = !job.isActive;
    await job.save();
    
    // Notify employer
    const notificationTitle = job.isActive 
      ? 'Votre offre d\'emploi a été activée' 
      : 'Votre offre d\'emploi a été désactivée';
    
    const notificationContent = job.isActive
      ? `Votre offre d'emploi "${job.title}" a été activée par un administrateur.`
      : `Votre offre d'emploi "${job.title}" a été désactivée par un administrateur. Veuillez contacter le support pour plus d'informations.`;
    
    // Create in-app notification for the employer
    await notificationService.createNotification({
      user: job.postedBy,
      title: notificationTitle,
      content: notificationContent,
      type: 'job',
      link: `/employeur/jobs/${job._id}`
    });
    
    // Get employer email
    const employer = await User.findById(job.postedBy);
    if (employer) {
      // Send email notification
      await emailService.sendEmail({
        email: employer.email,
        subject: notificationTitle,
        message: notificationContent
      });
    }
    
    res.status(200).json({
      success: true,
      data: job,
      message: `L'offre d'emploi a été ${job.isActive ? 'activée' : 'désactivée'}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du statut de l\'offre d\'emploi',
      error: error.message
    });
  }
};

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un email et un mot de passe'
      });
    }

    // Check if user exists and is an admin
    const admin = await User.findOne({ 
      email, 
      role: 'admin' 
    }).select('+password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    // Check if password matches
    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe invalide'
      });
    }

    // Check if admin account is active
    if (admin.isActive === false) {
      return res.status(401).json({
        success: false,
        message: 'Votre compte est désactivé. Veuillez contacter le support.'
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET || 'jobcallcenter-admin-secret',
      {
        expiresIn: process.env.JWT_ADMIN_EXPIRES_IN || '1d'
      }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: error.message
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
      error: error.message
    });
  }
};

// @desc    Get all applications
// @route   GET /api/admin/applications
// @access  Private (Admin only)
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('job', 'title company')
      .populate('candidate', 'firstName lastName email')
      .populate({
        path: 'job',
        populate: {
          path: 'company',
          select: 'name'
        }
      })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    console.error('Error fetching all applications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des candidatures',
      error: error.message
    });
  }
};

// @desc    Update application status
// @route   PUT /api/admin/applications/:id/status
// @access  Private (Admin only)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un statut'
      });
    }
    
    // Validate status
    const validStatuses = ['pending', 'interview', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide. Les statuts valides sont: pending, interview, accepted, rejected'
      });
    }
    
    const application = await Application.findById(req.params.id)
      .populate('job', 'title')
      .populate('candidate', 'email firstName lastName');
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Candidature non trouvée'
      });
    }
    
    // Update status
    application.status = status;
    await application.save();
    
    // Send notification to candidate
    const statusMessages = {
      pending: 'en attente de traitement',
      interview: 'sélectionnée pour un entretien',
      accepted: 'acceptée',
      rejected: 'refusée'
    };
    
    const notificationTitle = `Mise à jour de votre candidature - ${application.job.title}`;
    const notificationContent = `Votre candidature pour le poste "${application.job.title}" a été ${statusMessages[status]}.`;
    
    // Create in-app notification
    await notificationService.createNotification({
      user: application.candidate._id,
      title: notificationTitle,
      content: notificationContent,
      type: 'application',
      link: `/candidat/applications/${application._id}`
    });
    
    // Send email notification
    await emailService.sendEmail({
      email: application.candidate.email,
      subject: notificationTitle,
      message: notificationContent
    });
    
    res.status(200).json({
      success: true,
      data: application,
      message: `Le statut de la candidature a été mis à jour avec succès`
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut de la candidature',
      error: error.message
    });
  }
};
