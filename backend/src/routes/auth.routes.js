const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  forgotPassword, 
  resetPassword, 
  updateDetails, 
  updatePassword,
  googleAuth,
  facebookAuth,
  linkedinAuth
} = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const { verifyOAuthToken } = require('../middlewares/oauth.middleware');
const validate = require('../middlewares/validator.middleware');
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updateDetailsValidation,
  updatePasswordValidation
} = require('../validations/auth.validation');

// Public routes
router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);
router.post('/forgotpassword', validate(forgotPasswordValidation), forgotPassword);
router.put('/resetpassword/:resettoken', validate(resetPasswordValidation), resetPassword);

// Social login routes
router.post('/google', verifyOAuthToken, googleAuth);
router.post('/facebook', verifyOAuthToken, facebookAuth);
router.post('/linkedin', verifyOAuthToken, linkedinAuth);

// Protected routes
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, validate(updateDetailsValidation), updateDetails);
router.put('/updatepassword', protect, validate(updatePasswordValidation), updatePassword);

module.exports = router;
