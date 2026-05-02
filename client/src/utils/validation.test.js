import { describe, it, expect } from 'vitest';
import { validateClient, validatePayment, validateSponsor } from '../utils/validation';

describe('validateClient', () => {
  it('should validate a valid client', () => {
    const data = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      monthlyFee: 5000
    };
    
    const result = validateClient(data);
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
  });

  it('should invalidate client with missing name', () => {
    const data = {
      name: '',
      email: 'john@example.com',
      monthlyFee: 5000
    };
    
    const result = validateClient(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBe('Name is required');
  });

  it('should invalidate client with invalid email', () => {
    const data = {
      name: 'John Doe',
      email: 'invalid-email',
      monthlyFee: 5000
    };
    
    const result = validateClient(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBe('Invalid email format');
  });

  it('should invalidate client with negative monthly fee', () => {
    const data = {
      name: 'John Doe',
      email: 'john@example.com',
      monthlyFee: -100
    };
    
    const result = validateClient(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.monthlyFee).toBe('Monthly fee cannot be negative');
  });

  it('should invalidate client with negative medical fee', () => {
    const data = {
      name: 'John Doe',
      medicalFee: -50
    };
    
    const result = validateClient(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.medicalFee).toBe('Medical fee cannot be negative');
  });
});

describe('validatePayment', () => {
  it('should validate a valid payment', () => {
    const data = {
      amount: 100.50,
      date: '2026-04-30',
      paymentMethod: 'cash'
    };
    
    const result = validatePayment(data);
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
  });

  it('should invalidate payment with amount <= 0', () => {
    const data = {
      amount: 0,
      date: '2026-04-30',
      paymentMethod: 'cash'
    };
    
    const result = validatePayment(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.amount).toBe('Amount must be greater than 0');
  });

  it('should invalidate payment with missing date', () => {
    const data = {
      amount: 100,
      date: '',
      paymentMethod: 'cash'
    };
    
    const result = validatePayment(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.date).toBe('Date is required');
  });

  it('should invalidate payment with invalid date', () => {
    const data = {
      amount: 100,
      date: 'invalid-date',
      paymentMethod: 'cash'
    };
    
    const result = validatePayment(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.date).toBe('Invalid date');
  });

  it('should invalidate payment with invalid payment method', () => {
    const data = {
      amount: 100,
      date: '2026-04-30',
      paymentMethod: 'credit'
    };
    
    const result = validatePayment(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.paymentMethod).toBe('Payment method must be cash, card, or bank transfer');
  });
});

describe('validateSponsor', () => {
  it('should validate a valid sponsor', () => {
    const data = {
      name: 'Acme Corp',
      email: 'contact@acme.com',
      monthlyAmount: 500
    };
    
    const result = validateSponsor(data);
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
  });

  it('should invalidate sponsor with missing name', () => {
    const data = {
      name: '',
      email: 'contact@acme.com',
      monthlyAmount: 500
    };
    
    const result = validateSponsor(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBe('Name is required');
  });

  it('should invalidate sponsor with invalid email', () => {
    const data = {
      name: 'Acme Corp',
      email: 'invalid-email',
      monthlyAmount: 500
    };
    
    const result = validateSponsor(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBe('Invalid email format');
  });

  it('should invalidate sponsor with monthlyAmount <= 0', () => {
    const data = {
      name: 'Acme Corp',
      email: 'contact@acme.com',
      monthlyAmount: 0
    };
    
    const result = validateSponsor(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.monthlyAmount).toBe('Monthly amount must be greater than 0');
  });

  it('should validate sponsor with optional email omitted', () => {
    const data = {
      name: 'Acme Corp',
      monthlyAmount: 500
    };
    
    const result = validateSponsor(data);
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
  });
});