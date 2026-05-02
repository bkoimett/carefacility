const { body, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      })),
      message: `Validation error: ${errors.array()[0].msg}`
    });
  }
  next();
};

// Validation rules for client creation/update
const validateClient = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('dateOfAdmission')
    .notEmpty()
    .withMessage('Admission date is required')
    .isISO8601()
    .withMessage('Valid date required'),
  body('agreedDurationMonths')
    .isInt({ min: 1, max: 120 })
    .withMessage('Duration must be between 1 and 120 months'),
  body('monthlyFee')
    .isFloat({ min: 0 })
    .withMessage('Monthly fee is required'),
  body('medicalFee')
    .isFloat({ min: 0 })
    .withMessage('Medical fee is required'),
  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Valid email format required if provided'),
  body('status')
    .optional()
    .isIn(['active', 'discharged', 'absconded']),
  body('sponsor')
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage('Valid sponsor ID required'),
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
    .withMessage('Name is required'),
  handleValidationErrors
];

module.exports = {
  validateClient,
  validatePayment,
  validateSponsor
};