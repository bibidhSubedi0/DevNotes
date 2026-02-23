/**
 * Client-side validation utilities for DevNotes
 * Now with proper XSS sanitization
 */

import { sanitizeLabel, sanitizeDescription } from './sanitize';

// Validation rules
export const VALIDATION_RULES = {
  NODE_LABEL: {
    minLength: 1,
    maxLength: 200,  // Increased from 50 to allow longer names
    errorMessages: {
      empty: 'Name cannot be empty',
      tooLong: 'Name must be 200 characters or less',
    }
  },
  FUNCTION_NAME: {
    minLength: 1,
    maxLength: 200,
    errorMessages: {
      empty: 'Function name cannot be empty',
      tooLong: 'Function name must be 200 characters or less',
    }
  },
  DESCRIPTION: {
    minLength: 0,
    maxLength: 50000,  // Increased for long descriptions
    errorMessages: {
      tooLong: 'Description must be 50,000 characters or less'
    }
  },
  CUSTOM_FILE_TYPE: {
    minLength: 1,
    maxLength: 30,
    errorMessages: {
      empty: 'File type cannot be empty',
      tooLong: 'File type must be 30 characters or less',
    }
  }
};

/**
 * Validate node label (Project, Component, File names)
 * Now includes XSS sanitization
 */
export const validateNodeLabel = (label) => {
  const sanitized = sanitizeLabel(label);
  const rules = VALIDATION_RULES.NODE_LABEL;

  if (sanitized.length === 0) {
    return { valid: false, error: rules.errorMessages.empty };
  }

  if (sanitized.length > rules.maxLength) {
    return { valid: false, error: rules.errorMessages.tooLong };
  }

  return { valid: true, value: sanitized };
};

/**
 * Validate function name
 * Now includes XSS sanitization
 */
export const validateFunctionName = (name) => {
  const sanitized = sanitizeLabel(name);
  const rules = VALIDATION_RULES.FUNCTION_NAME;

  if (sanitized.length === 0) {
    return { valid: false, error: rules.errorMessages.empty };
  }

  if (sanitized.length > rules.maxLength) {
    return { valid: false, error: rules.errorMessages.tooLong };
  }

  return { valid: true, value: sanitized };
};

/**
 * Validate description text
 * Now includes XSS sanitization
 */
export const validateDescription = (description) => {
  const sanitized = sanitizeDescription(description);
  const rules = VALIDATION_RULES.DESCRIPTION;

  if (sanitized.length > rules.maxLength) {
    return { valid: false, error: rules.errorMessages.tooLong };
  }

  return { valid: true, value: sanitized };
};

/**
 * Validate custom file type
 * Now includes XSS sanitization
 */
export const validateCustomFileType = (type) => {
  const sanitized = sanitizeLabel(type);
  const rules = VALIDATION_RULES.CUSTOM_FILE_TYPE;

  if (sanitized.length === 0) {
    return { valid: false, error: rules.errorMessages.empty };
  }

  if (sanitized.length > rules.maxLength) {
    return { valid: false, error: rules.errorMessages.tooLong };
  }

  return { valid: true, value: sanitized };
};

/**
 * Check for duplicate names in the same scope
 */
export const validateUniqueName = (name, existingNames) => {
  const normalized = name.trim().toLowerCase();
  
  if (existingNames.some(existing => existing.toLowerCase() === normalized)) {
    return { valid: false, error: 'A node with this name already exists' };
  }

  return { valid: true };
};

/**
 * @deprecated Use sanitizeLabel or sanitizeDescription from sanitize.js instead
 */
export const sanitizeInput = (input) => {
  console.warn('sanitizeInput is deprecated, use sanitizeLabel/sanitizeDescription from sanitize.js');
  return sanitizeLabel(input);
};