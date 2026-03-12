const express = require('express');
const router = express.Router();
const { 
  createApplication, 
  getApplications, 
  getApplication, 
  updateApplication, 
  deleteApplication,
  getCandidateApplications,
  getJobApplications
} = require('../controllers/application.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validator.middleware');
const { 
  createApplicationValidation, 
  updateApplicationValidation 
} = require('../validations/application.validation');

// Protected routes
router.post('/', protect, authorize('candidat'), validate(createApplicationValidation), createApplication);
router.get('/', protect, authorize('admin'), getApplications);
router.get('/candidate', protect, authorize('candidat'), getCandidateApplications);
router.get('/job/:jobId', protect, authorize('employeur', 'admin'), getJobApplications);
router.get('/:id', protect, getApplication);
router.put('/:id', protect, authorize('employeur', 'admin'), validate(updateApplicationValidation), updateApplication);
router.delete('/:id', protect, deleteApplication);

module.exports = router;
