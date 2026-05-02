/**
 * Validation utilities for client, payment, and sponsor data
 * Mirrors backend validation rules to prevent unnecessary API calls
 */

/**
 * Validate client data
 * @param {Object} data - Client data to validate
 * @returns {{isValid: boolean, errors: Object}} Validation result
 */
export const validateClient = (data) => {
  const errors = {};

  // Name validation
  if (!data.name || data.name.trim() === '') {
    errors.name = 'Name is required';
  }

  // Email validation (optional but must be valid if provided)
  if (data.email && data.email.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      errors.email = 'Invalid email format';
    }
  }

  // Phone validation (optional but must be valid if provided)
  if (data.phone && data.phone.trim() !== '') {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(data.phone.trim())) {
      errors.phone = 'Invalid phone number';
    }
  }

  // Monthly fee validation (optional, but must be >= 0 if provided)
  if (data.monthlyFee !== undefined && data.monthlyFee !== '' && parseFloat(data.monthlyFee) < 0) {
    errors.monthlyFee = 'Monthly fee cannot be negative';
  }

  // Medical fee validation (optional, but must be >= 0 if provided)
  if (data.medicalFee !== undefined && data.medicalFee !== '' && parseFloat(data.medicalFee) < 0) {
    errors.medicalFee = 'Medical fee cannot be negative';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate payment data
 * @param {Object} data - Payment data to validate
 * @returns {{isValid: boolean, errors: Object}} Validation result
 */
export const validatePayment = (data) => {
  const errors = {};

  // Amount validation
  if (!data.amount || parseFloat(data.amount) <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }

  // Date validation
  if (!data.date) {
    errors.date = 'Date is required';
  } else {
    const date = new Date(data.date);
    if (isNaN(date.getTime())) {
      errors.date = 'Invalid date';
    }
  }

  // Payment method validation
  const validPaymentMethods = ['cash', 'card', 'bank transfer'];
  if (!data.paymentMethod || !validPaymentMethods.includes(data.paymentMethod)) {
    errors.paymentMethod = 'Payment method must be cash, card, or bank transfer';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate sponsor data
 * @param {Object} data - Sponsor data to validate
 * @returns {{isValid: boolean, errors: Object}} Validation result
 */
export const validateSponsor = (data) => {
  const errors = {};

  // Name validation
  if (!data.name || data.name.trim() === '') {
    errors.name = 'Name is required';
  }

  // Email validation (optional but must be valid if provided)
  if (data.email && data.email.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      errors.email = 'Invalid email format';
    }
  }

  // Monthly amount validation
  if (!data.monthlyAmount || parseFloat(data.monthlyAmount) <= 0) {
    errors.monthlyAmount = 'Monthly amount must be greater than 0';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};