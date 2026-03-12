const express = require('express');
const router = express.Router();
const { 
  createJob, 
  getJobs, 
  getJob, 
  updateJob, 
  deleteJob, 
  getEmployerJobs,
  getFeaturedJobs,
  searchJobs
} = require('../controllers/job.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validator.middleware');
const { jobValidation } = require('../validations/job.validation');

// Public routes
router.get('/', getJobs);
router.get('/search', searchJobs);
router.get('/featured', getFeaturedJobs);
router.get('/:id', getJob);

// Protected routes
router.post('/', protect, authorize('employeur', 'admin'), validate(jobValidation), createJob);
router.put('/:id', protect, authorize('employeur', 'admin'), validate(jobValidation), updateJob);
router.delete('/:id', protect, authorize('employeur', 'admin'), deleteJob);
router.get('/employer/me', protect, authorize('employeur', 'admin'), getEmployerJobs);

module.exports = router;
