const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const {
  getDashboardStats,
  getRecentApplications,
  getUpcomingInterviews,
  getCompanyProfile,
  updateCompanyProfile,
  getEmployerJobs,
  getAllApplications,
  getApplicationDetails,
  updateApplicationStatus
} = require('../controllers/employerDashboardController');

// All routes in this file are protected and require employer role
router.use(protect);
router.use(authorize('employeur'));

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/applications/recent', getRecentApplications);
router.get('/applications', getAllApplications);
router.get('/applications/:id', getApplicationDetails);
router.put('/applications/:id/status', updateApplicationStatus);
router.get('/interviews/upcoming', getUpcomingInterviews);
router.get('/company', getCompanyProfile);
router.put('/company', updateCompanyProfile);
router.get('/jobs', getEmployerJobs);

module.exports = router;
