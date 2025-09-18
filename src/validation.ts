/**
 * Validation utilities for address parsing
 */

/**
 * Postal code validation result
 */
export interface PostalValidationResult {
  isValid: boolean;
  type: 'zip' | 'postal' | null;
  formatted?: string;
  message?: string;
}

/**
 * Pattern for US ZIP codes (5 digits, optionally followed by +4)
 */
export const ZIP_CODE_PATTERN = /^(\d{5})(?:[-\s]?(\d{4}))?$/;
const ZIP_CODE_VALIDATION_REGEX = /^\d{5}(?:[-\s]?\d{4})?$/;

/**
 * Pattern for Canadian postal codes (A1A 1A1 format)
 */
const CANADIAN_POSTAL_CODE_PATTERN = /^([A-Za-z]\d[A-Za-z])\s?(\d[A-Za-z]\d)$/;
const CANADIAN_POSTAL_VALIDATION_REGEX = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;

/**
 * Validate if a postal code or ZIP code is in the correct format
 */
export const validatePostalCode = (code: string): PostalValidationResult => {
  if (!code || typeof code !== 'string') {
    return {
      isValid: false,
      type: null,
      message: 'No postal code provided'
    };
  }

  const trimmed = code.trim();
  
  // Check US ZIP code format
  if (ZIP_CODE_VALIDATION_REGEX.test(trimmed)) {
    const match = trimmed.match(ZIP_CODE_PATTERN);
    if (match) {
      const formatted = match[2] ? `${match[1]}-${match[2]}` : match[1];
      return {
        isValid: true,
        type: 'zip',
        formatted,
        message: 'Valid US ZIP code format'
      };
    }
  }
  
  // Check Canadian postal code format
  if (CANADIAN_POSTAL_VALIDATION_REGEX.test(trimmed)) {
    const match = trimmed.toUpperCase().match(CANADIAN_POSTAL_CODE_PATTERN);
    if (match) {
      const formatted = `${match[1]} ${match[2]}`;
      return {
        isValid: true,
        type: 'postal',
        formatted,
        message: 'Valid Canadian postal code format'
      };
    }
  }
  
  return {
    isValid: false,
    type: null,
    message: 'Invalid postal code format. Expected US ZIP (12345 or 12345-6789) or Canadian postal code (A1A 1A1)'
  };
};