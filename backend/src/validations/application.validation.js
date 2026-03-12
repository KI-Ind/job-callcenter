const { body } = require('express-validator');

/**
 * Validation rules for creating an application
 */
exports.createApplicationValidation = [
  body('job')
    .notEmpty()
    .withMessage('L\'offre d\'emploi est requise')
    .isMongoId()
    .withMessage('ID d\'offre d\'emploi invalide'),
  
  body('resume')
    .notEmpty()
    .withMessage('Le CV est requis')
    .isURL()
    .withMessage('Le CV doit être une URL valide'),
  
  body('coverLetter')
    .optional()
    .isString()
    .withMessage('La lettre de motivation doit être une chaîne de caractères')
];

/**
 * Validation rules for updating an application
 */
exports.updateApplicationValidation = [
  body('status')
    .optional()
    .isIn(['En attente', 'Examinée', 'Entretien', 'Acceptée', 'Rejetée'])
    .withMessage('Statut invalide'),
  
  body('notes')
    .optional()
    .isString()
    .withMessage('Les notes doivent être une chaîne de caractères'),
  
  body('employerFeedback')
    .optional()
    .isString()
    .withMessage('Le feedback de l\'employeur doit être une chaîne de caractères'),
  
  body('interviewDate')
    .optional()
    .isISO8601()
    .withMessage('La date d\'entretien doit être une date valide')
];
