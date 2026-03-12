const { body } = require('express-validator');

/**
 * Validation rules for creating/updating a company
 */
exports.companyValidation = [
  body('name')
    .notEmpty()
    .withMessage('Le nom de l\'entreprise est requis')
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  
  body('logo')
    .optional()
    .isURL()
    .withMessage('Le logo doit être une URL valide'),
  
  body('website')
    .optional()
    .isURL()
    .withMessage('Le site web doit être une URL valide'),
  
  body('industry')
    .notEmpty()
    .withMessage('Le secteur d\'activité est requis')
    .isLength({ min: 2, max: 100 })
    .withMessage('Le secteur d\'activité doit contenir entre 2 et 100 caractères'),
  
  body('size')
    .notEmpty()
    .withMessage('La taille de l\'entreprise est requise')
    .isIn(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'])
    .withMessage('Taille d\'entreprise invalide'),
  
  body('description')
    .notEmpty()
    .withMessage('La description de l\'entreprise est requise')
    .isLength({ min: 50 })
    .withMessage('La description doit contenir au moins 50 caractères'),
  
  body('location.city')
    .notEmpty()
    .withMessage('La ville est requise')
    .isLength({ min: 2, max: 50 })
    .withMessage('La ville doit contenir entre 2 et 50 caractères'),
  
  body('contactEmail')
    .notEmpty()
    .withMessage('L\'email de contact est requis')
    .isEmail()
    .withMessage('Veuillez fournir un email valide')
    .normalizeEmail(),
  
  body('contactPhone')
    .optional()
    .isString()
    .withMessage('Le téléphone de contact doit être une chaîne de caractères'),
  
  body('socialMedia.linkedin')
    .optional()
    .isURL()
    .withMessage('Le lien LinkedIn doit être une URL valide'),
  
  body('socialMedia.facebook')
    .optional()
    .isURL()
    .withMessage('Le lien Facebook doit être une URL valide'),
  
  body('socialMedia.twitter')
    .optional()
    .isURL()
    .withMessage('Le lien Twitter doit être une URL valide'),
  
  body('socialMedia.instagram')
    .optional()
    .isURL()
    .withMessage('Le lien Instagram doit être une URL valide')
];
