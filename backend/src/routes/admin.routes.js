const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const {
  getDashboardStats,
  toggleUserStatus,
  resetUserPassword,
  sendUserNotification,
  toggleJobStatus,
  adminLogin,
  getAllUsers,
  getAllApplications,
  updateApplicationStatus
} = require('../controllers/admin.controller');

// Public routes
router.post('/login', adminLogin);

// Protected routes (Admin only)
router.get('/dashboard', protect, authorize('admin'), getDashboardStats);

// User management routes
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id/toggle-status', protect, authorize('admin'), toggleUserStatus);
router.post('/users/:id/reset-password', protect, authorize('admin'), resetUserPassword);
router.post('/users/:id/send-notification', protect, authorize('admin'), sendUserNotification);

// Application management routes
router.get('/applications', protect, authorize('admin'), getAllApplications);
router.put('/applications/:id/status', protect, authorize('admin'), updateApplicationStatus);

// Job management routes
router.put('/jobs/:id/toggle-status', protect, authorize('admin'), toggleJobStatus);

module.exports = router;
