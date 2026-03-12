const { body } = require('express-validator');

/**
 * Validation rules for creating/updating a category
 */
exports.categoryValidation = [
  body('name')
    .notEmpty()
    .withMessage('Le nom de la catégorie est requis')
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  
  body('slug')
    .notEmpty()
    .withMessage('Le slug est requis')
    .isSlug()
    .withMessage('Le slug doit être un format valide')
    .isLength({ min: 2, max: 50 })
    .withMessage('Le slug doit contenir entre 2 et 50 caractères'),
  
  body('description')
    .optional()
    .isString()
    .withMessage('La description doit être une chaîne de caractères'),
  
  body('icon')
    .optional()
    .isString()
    .withMessage('L\'icône doit être une chaîne de caractères')
];
