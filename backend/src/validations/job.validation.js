const { body } = require('express-validator');

/**
 * Validation rules for creating/updating a job
 */
exports.jobValidation = [
  body('title')
    .notEmpty()
    .withMessage('Le titre du poste est requis')
    .isLength({ min: 3, max: 100 })
    .withMessage('Le titre doit contenir entre 3 et 100 caractères'),
  
  body('company')
    .notEmpty()
    .withMessage('L\'entreprise est requise')
    .isMongoId()
    .withMessage('ID d\'entreprise invalide'),
  
  body('location.city')
    .notEmpty()
    .withMessage('La ville est requise')
    .isLength({ min: 2, max: 50 })
    .withMessage('La ville doit contenir entre 2 et 50 caractères'),
  
  body('jobType')
    .notEmpty()
    .withMessage('Le type de contrat est requis')
    .isIn([
      'CDI', 'CDD', 'Freelance', 'Stage', 'Temps partiel',
      'Intérim', 'Alternance / Apprentissage', 'Freelance / Indépendant', 'Autre'
    ])
    .withMessage('Type de contrat invalide'),
  
  body('category')
    .notEmpty()
    .withMessage('La catégorie est requise')
    .isMongoId()
    .withMessage('ID de catégorie invalide'),
  
  body('salary.min')
    .optional()
    .isNumeric()
    .withMessage('Le salaire minimum doit être un nombre'),
  
  body('salary.max')
    .optional()
    .isNumeric()
    .withMessage('Le salaire maximum doit être un nombre')
    .custom((value, { req }) => {
      if (req.body.salary && req.body.salary.min && value < req.body.salary.min) {
        throw new Error('Le salaire maximum doit être supérieur au salaire minimum');
      }
      return true;
    }),
  
  body('description')
    .notEmpty()
    .withMessage('La description du poste est requise')
    .isLength({ min: 50 })
    .withMessage('La description doit contenir au moins 50 caractères'),
  
  body('requirements')
    .notEmpty()
    .withMessage('Les exigences du poste sont requises')
    .isLength({ min: 50 })
    .withMessage('Les exigences doivent contenir au moins 50 caractères'),
  
  body('responsibilities')
    .notEmpty()
    .withMessage('Les responsabilités du poste sont requises')
    .isLength({ min: 50 })
    .withMessage('Les responsabilités doivent contenir au moins 50 caractères'),
  
  body('skills')
    .optional()
    .isArray()
    .withMessage('Les compétences doivent être un tableau'),
  
  body('skills.*')
    .optional()
    .isString()
    .withMessage('Chaque compétence doit être une chaîne de caractères'),
  
  body('experience')
    .notEmpty()
    .withMessage('L\'expérience requise est nécessaire')
    .isIn(['Débutant', '1-2 ans', '3-5 ans', '5-10 ans', '10+ ans'])
    .withMessage('Expérience invalide'),
  
  body('education')
    .notEmpty()
    .withMessage('Le niveau d\'éducation requis est nécessaire')
    .isIn(['Bac', 'Bac+2', 'Bac+3/Licence', 'Bac+5/Master', 'Doctorat', 'Autre'])
    .withMessage('Niveau d\'éducation invalide'),
  
  body('applicationDeadline')
    .optional()
    .isISO8601()
    .withMessage('La date limite de candidature doit être une date valide')
    .custom(value => {
      if (new Date(value) < new Date()) {
        throw new Error('La date limite de candidature doit être dans le futur');
      }
      return true;
    }),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive doit être un booléen'),
  
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured doit être un booléen')
];
