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

  // Fee structure validation
  const validFeeStructures = ['monthly', 'daily', 'hourly'];
  if (!data.feeStructure || !validFeeStructures.includes(data.feeStructure)) {
    errors.feeStructure = 'Fee structure must be monthly, daily, or hourly';
  }

  // Rate validation
  if (!data.rate || parseFloat(data.rate) <= 0) {
    errors.rate = 'Rate must be greater than 0';
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