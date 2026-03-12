const express = require('express');
const router = express.Router();
const { 
  createCompany, 
  getCompanies, 
  getCompany, 
  updateCompany, 
  deleteCompany, 
  getCompanyByOwner,
  getCompanyJobs
} = require('../controllers/company.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validator.middleware');
const { companyValidation } = require('../validations/company.validation');

// Public routes
router.get('/', getCompanies);
router.get('/:id', getCompany);
router.get('/:id/jobs', getCompanyJobs);

// Protected routes
router.post('/', protect, authorize('employeur', 'admin'), validate(companyValidation), createCompany);
router.put('/:id', protect, authorize('employeur', 'admin'), validate(companyValidation), updateCompany);
router.delete('/:id', protect, authorize('employeur', 'admin'), deleteCompany);
router.get('/owner/me', protect, authorize('employeur', 'admin'), getCompanyByOwner);

module.exports = router;
