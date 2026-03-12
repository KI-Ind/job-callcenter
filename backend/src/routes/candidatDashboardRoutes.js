const express = require('express');
const router = express.Router();

const {
  getDashboardStats,
  getProfileCompletion,
  getProfile,
  updateProfile,
  updateProfessionalInfo,
  updateLanguages,
  getUpcomingInterviews,
  getRecommendedJobs,
  getSavedJobs,
  saveJob,
  unsaveJob,
  getApplications,
  submitApplication,
  getNotificationSettings,
  updateNotificationSettings,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} = require('../controllers/candidatDashboardController');

const { protect, authorize } = require('../middlewares/auth');

// All routes in this router are protected and require candidate role
router.use(protect);
router.use(authorize('candidat'));

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/profile/completion', getProfileCompletion);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/profile/professional', updateProfessionalInfo);
router.put('/profile/languages', updateLanguages);

// Interview routes
router.get('/interviews/upcoming', getUpcomingInterviews);

// Job routes
router.get('/jobs/recommended', getRecommendedJobs);
router.get('/jobs/saved', getSavedJobs);
router.post('/jobs/saved/:id', saveJob);
router.delete('/jobs/saved/:id', unsaveJob);

// Application routes
router.get('/applications', getApplications);
router.post('/applications', submitApplication);

// Notification settings routes
router.get('/settings/notifications', getNotificationSettings);
router.put('/settings/notifications', updateNotificationSettings);

// Notification routes
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationAsRead);
router.put('/notifications/read-all', markAllNotificationsAsRead);
router.delete('/notifications/:id', deleteNotification);

module.exports = router;
