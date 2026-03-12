const express = require('express');
const router = express.Router();
const { 
  subscribe, 
  unsubscribe, 
  getSubscribers 
} = require('../controllers/newsletter.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validator.middleware');
const { 
  subscribeValidation, 
  unsubscribeValidation 
} = require('../validations/newsletter.validation');

// Public routes
router.post('/subscribe', validate(subscribeValidation), subscribe);
router.post('/unsubscribe', validate(unsubscribeValidation), unsubscribe);

// Protected routes (Admin only)
router.get('/subscribers', protect, authorize('admin'), getSubscribers);

module.exports = router;
