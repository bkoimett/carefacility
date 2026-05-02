const { body, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// Validation rules for client creation/update
const validateClient = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters')
    .escape(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Valid email format required if provided')
    .normalizeEmail(),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Valid phone number is required if provided'),
  body('monthlyFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Monthly fee must be a non-negative number'),
  body('medicalFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Medical fee must be a non-negative number'),
  handleValidationErrors
];

// Validation rules for payment recording
const validatePayment = [
  body('clientId')
    .isMongoId()
    .withMessage('Valid client ID is required'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('date')
    .isISO8601()
    .withMessage('Valid date is required'),
  body('paymentMethod')
    .isIn(['cash', 'card', 'bank transfer'])
    .withMessage('Payment method must be one of: cash, card, bank transfer'),
  body('notes')
    .optional()
    .trim()
    .escape(),
  handleValidationErrors
];

// Validation rules for sponsor creation
const validateSponsor = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters')
    .escape(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Valid email format required if provided')
    .normalizeEmail(),
  body('monthlyAmount')
    .isFloat({ min: 0 })
    .withMessage('Monthly amount must be a positive number'),
  handleValidationErrors
];

module.exports = {
  validateClient,
  validatePayment,
  validateSponsor
};