/**
 * Client-side validation utilities for DevNotes
 */

// Validation rules
export const VALIDATION_RULES = {
  NODE_LABEL: {
    minLength: 1,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\s_\-\.()]+$/,
    errorMessages: {
      empty: 'Name cannot be empty',
      tooLong: 'Name must be 50 characters or less',
      invalidChars: 'Only letters, numbers, spaces, and _-.() allowed'
    }
  },
  FUNCTION_NAME: {
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z_$][a-zA-Z0-9_$]*\s*\(.*\)?\s*$/,
    errorMessages: {
      empty: 'Function name cannot be empty',
      tooLong: 'Function name must be 100 characters or less',
      invalidFormat: 'Must be valid function syntax (e.g., myFunc())'
    }
  },
  DESCRIPTION: {
    minLength: 0,
    maxLength: 500,
    errorMessages: {
      tooLong: 'Description must be 500 characters or less'
    }
  },
  CUSTOM_FILE_TYPE: {
    minLength: 1,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9\s_\-\.+#]+$/,
    errorMessages: {
      empty: 'File type cannot be empty',
      tooLong: 'File type must be 30 characters or less',
      invalidChars: 'Only letters, numbers, and _-.+# allowed'
    }
  }
};

/**
 * Validate node label (Project, Component, File names)
 */
export const validateNodeLabel = (label) => {
  const trimmed = label.trim();
  const rules = VALIDATION_RULES.NODE_LABEL;

  if (trimmed.length === 0) {
    return { valid: false, error: rules.errorMessages.empty };
  }

  if (trimmed.length > rules.maxLength) {
    return { valid: false, error: rules.errorMessages.tooLong };
  }

  if (!rules.pattern.test(trimmed)) {
    return { valid: false, error: rules.errorMessages.invalidChars };
  }

  return { valid: true, value: trimmed };
};

/**
 * Validate function name
 */
export const validateFunctionName = (name) => {
  const trimmed = name.trim();
  const rules = VALIDATION_RULES.FUNCTION_NAME;

  if (trimmed.length === 0) {
    return { valid: false, error: rules.errorMessages.empty };
  }

  if (trimmed.length > rules.maxLength) {
    return { valid: false, error: rules.errorMessages.tooLong };
  }

  // Allow flexible function syntax
  const basicPattern = /^[a-zA-Z_$]/;
  if (!basicPattern.test(trimmed)) {
    return { valid: false, error: rules.errorMessages.invalidFormat };
  }

  return { valid: true, value: trimmed };
};

/**
 * Validate description text
 */
export const validateDescription = (description) => {
  const trimmed = description.trim();
  const rules = VALIDATION_RULES.DESCRIPTION;

  if (trimmed.length > rules.maxLength) {
    return { valid: false, error: rules.errorMessages.tooLong };
  }

  return { valid: true, value: trimmed };
};

/**
 * Validate custom file type
 */
export const validateCustomFileType = (type) => {
  const trimmed = type.trim();
  const rules = VALIDATION_RULES.CUSTOM_FILE_TYPE;

  if (trimmed.length === 0) {
    return { valid: false, error: rules.errorMessages.empty };
  }

  if (trimmed.length > rules.maxLength) {
    return { valid: false, error: rules.errorMessages.tooLong };
  }

  if (!rules.pattern.test(trimmed)) {
    return { valid: false, error: rules.errorMessages.invalidChars };
  }

  return { valid: true, value: trimmed };
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
 * Sanitize input to prevent XSS (basic)
 */
export const sanitizeInput = (input) => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
};
