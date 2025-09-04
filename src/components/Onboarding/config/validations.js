/**
 * Onboarding Validation Configuration
 * Centralized validation logic for all onboarding steps
 * Each validator returns either null (valid) or error message/object (invalid)
 */

/**
 * Validates business needs selection (Step 1)
 * @param {string} value - Selected business need option
 * @returns {string|null} Error message or null if valid
 */
export const validateBusinessNeeds = (value) => {
  // Check for null, undefined, or empty string
  if (value === null || value === undefined || value === '' || (typeof value === 'string' && value.trim() === '')) {
    return 'Please select what kind of help your business needs';
  }
  return null;
};

/**
 * Validates previous bookkeeper selection (Step 2)
 * @param {string} value - 'yes' or 'no'
 * @returns {string|null} Error message or null if valid
 */
export const validatePreviousBookkeeper = (value) => {
  // Check for null, undefined, or empty string
  if (value === null || value === undefined || value === '' || (typeof value === 'string' && value.trim() === '')) {
    return 'Please indicate if you had a previous bookkeeper';
  }
  if (value !== 'yes' && value !== 'no') {
    return 'Please select either Yes or No';
  }
  return null;
};

/**
 * Validates business details form (Step 3)
 * @param {Object} details - Business details object
 * @returns {Object|null} Object with field-specific errors or null if all valid
 */
export const validateBusinessDetails = (details) => {
  const errors = {};
  
  // Business Name validation
  if (!details.businessName || details.businessName.trim() === '') {
    errors.businessName = 'Business Name is required';
  } else if (details.businessName.trim().length < 2) {
    errors.businessName = 'Business Name must be at least 2 characters';
  } else if (details.businessName.trim().length > 100) {
    errors.businessName = 'Business Name must be less than 100 characters';
  }
  
  // Business Type validation
  if (!details.businessType || details.businessType === '') {
    errors.businessType = 'Business Type is required';
  }
  
  // Year Started validation
  if (!details.yearStarted || details.yearStarted.trim() === '') {
    errors.yearStarted = 'Year Started is required';
  } else {
    const yearValue = details.yearStarted.trim();
    const yearNum = parseInt(yearValue, 10);
    const currentYear = new Date().getFullYear();
    
    if (!/^\d{4}$/.test(yearValue)) {
      errors.yearStarted = 'Year must be exactly 4 digits';
    } else if (yearNum < 1800) {
      errors.yearStarted = 'Year must be 1800 or later';
    } else if (yearNum > currentYear) {
      errors.yearStarted = `Year cannot be later than ${currentYear}`;
    }
  }
  
  // Employee Count validation
  if (!details.employeeCount || details.employeeCount === '') {
    errors.employeeCount = 'Number of Employees is required';
  }
  
  // Monthly Revenue validation
  if (!details.monthlyRevenue || details.monthlyRevenue === '') {
    errors.monthlyRevenue = 'Monthly Revenue Range is required';
  }
  
  // Return errors object if there are any errors, otherwise null
  return Object.keys(errors).length > 0 ? errors : null;
};

/**
 * Validates industry selection (Step 4)
 * @param {string} value - Selected industry
 * @returns {string|null} Error message or null if valid
 */
export const validateIndustry = (value) => {
  // Check for null, undefined, or empty string
  if (value === null || value === undefined || value === '' || (typeof value === 'string' && value.trim() === '')) {
    return 'Please select your industry';
  }
  
  // Validate against known industry options
  const validIndustries = [
    'ecommerce',
    'professional_services',
    'social_media',
    'real_estate',
    'agency',
    'saas',
    '3pl',
    'retail',
    'ai_ventures',
    'others'
  ];
  
  if (!validIndustries.includes(value)) {
    return 'Please select a valid industry from the list';
  }
  
  return null;
};

/**
 * Main validation function that routes to appropriate validator
 * @param {string} validationType - Name of validation function to use
 * @param {*} value - Value to validate
 * @returns {*} Validation result from specific validator
 */
export const validate = (validationType, value) => {
  const validators = {
    validateBusinessNeeds,
    validatePreviousBookkeeper,
    validateBusinessDetails,
    validateIndustry
  };
  
  const validator = validators[validationType];
  if (!validator) {
    console.error(`Validator ${validationType} not found`);
    return null;
  }
  
  return validator(value);
};

/**
 * Validates all steps data at once (useful for final submission)
 * @param {Object} data - Complete onboarding data object
 * @returns {Object} Object with validation results for each step
 */
export const validateAllSteps = (data) => {
  return {
    businessNeeds: validateBusinessNeeds(data.businessNeeds),
    previousBookkeeper: validatePreviousBookkeeper(data.previousBookkeeper),
    businessDetails: validateBusinessDetails(data.businessDetails),
    industry: validateIndustry(data.industry)
  };
};

/**
 * Checks if all steps are valid
 * @param {Object} data - Complete onboarding data object
 * @returns {boolean} True if all steps are valid
 */
export const isAllDataValid = (data) => {
  const validationResults = validateAllSteps(data);
  
  // Check if any validation returned errors
  for (const key in validationResults) {
    if (validationResults[key] !== null) {
      return false;
    }
  }
  
  return true;
};

/**
 * Gets a user-friendly error message from validation errors
 * @param {*} errors - Validation errors (string or object)
 * @returns {string} Formatted error message
 */
export const formatValidationError = (errors) => {
  if (typeof errors === 'string') {
    return errors;
  }
  
  if (typeof errors === 'object' && errors !== null) {
    const errorMessages = Object.values(errors);
    if (errorMessages.length === 1) {
      return errorMessages[0];
    }
    return 'Please fix the following issues:\n' + errorMessages.map(msg => `• ${msg}`).join('\n');
  }
  
  return 'Please complete all required fields';
};

// Export all validators as a named object for easy access
export const validations = {
  validateBusinessNeeds,
  validatePreviousBookkeeper,
  validateBusinessDetails,
  validateIndustry
};

export default validations;