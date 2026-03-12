const { body } = require('express-validator');

/**
 * Validation rules for newsletter subscription
 */
exports.subscribeValidation = [
  body('email')
    .notEmpty()
    .withMessage('L\'email est requis')
    .isEmail()
    .withMessage('Veuillez fournir un email valide')
    .normalizeEmail()
];

/**
 * Validation rules for newsletter unsubscription
 */
exports.unsubscribeValidation = [
  body('email')
    .notEmpty()
    .withMessage('L\'email est requis')
    .isEmail()
    .withMessage('Veuillez fournir un email valide')
    .normalizeEmail()
];
