const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  getUser, 
  updateUser, 
  deleteUser,
  getUserProfile,
  updateUserProfile,
  getUserStats,
  getSavedJobs,
  saveJob,
  unsaveJob
} = require('../controllers/user.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// Protected routes for all authenticated users
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// Protected routes (Admin only)
router.get('/', protect, authorize('admin'), getUsers);
router.get('/stats', protect, authorize('admin'), getUserStats);
router.get('/:id', protect, authorize('admin'), getUser);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
