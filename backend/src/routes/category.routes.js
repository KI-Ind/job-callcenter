const express = require('express');
const router = express.Router();
const { 
  createCategory, 
  getCategories, 
  getCategory, 
  updateCategory, 
  deleteCategory,
  getCategoryJobs,
  getCategoriesWithCounts
} = require('../controllers/category.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validator.middleware');
const { categoryValidation } = require('../validations/category.validation');

// Public routes
router.get('/', getCategories);
router.get('/with-counts', getCategoriesWithCounts);
router.get('/:id', getCategory);
router.get('/:id/jobs', getCategoryJobs);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin'), validate(categoryValidation), createCategory);
router.put('/:id', protect, authorize('admin'), validate(categoryValidation), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

module.exports = router;
