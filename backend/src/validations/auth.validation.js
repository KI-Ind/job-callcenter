const { body } = require('express-validator');

/**
 * Validation rules for user registration
 */
exports.registerValidation = [
  body('firstName')
    .notEmpty()
    .withMessage('Le prénom est requis')
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères'),
  
  body('lastName')
    .notEmpty()
    .withMessage('Le nom est requis')
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  
  body('email')
    .notEmpty()
    .withMessage('L\'email est requis')
    .isEmail()
    .withMessage('Veuillez fournir un email valide')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  
  body('role')
    .optional()
    .isIn(['candidat', 'employeur', 'admin'])
    .withMessage('Le rôle doit être candidat, employeur ou admin')
];

/**
 * Validation rules for user login
 */
exports.loginValidation = [
  body('email')
    .notEmpty()
    .withMessage('L\'email est requis')
    .isEmail()
    .withMessage('Veuillez fournir un email valide')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis')
];

/**
 * Validation rules for forgot password
 */
exports.forgotPasswordValidation = [
  body('email')
    .notEmpty()
    .withMessage('L\'email est requis')
    .isEmail()
    .withMessage('Veuillez fournir un email valide')
    .normalizeEmail()
];

/**
 * Validation rules for reset password
 */
exports.resetPasswordValidation = [
  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères')
];

/**
 * Validation rules for update user details
 */
exports.updateDetailsValidation = [
  body('firstName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères'),
  
  body('lastName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Veuillez fournir un email valide')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .isString()
    .withMessage('Le téléphone doit être une chaîne de caractères')
];

/**
 * Validation rules for update password
 */
exports.updatePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Le mot de passe actuel est requis'),
  
  body('newPassword')
    .notEmpty()
    .withMessage('Le nouveau mot de passe est requis')
    .isLength({ min: 6 })
    .withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères')
];
