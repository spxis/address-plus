/**
 * Validation utilities for address parsing
 */

/**
 * Postal code validation result
 */
 interface PostalValidationResult {
  isValid: boolean;
  type: 'zip' | 'postal' | null;
  formatted?: string;
  message?: string;
}

/**
 * Pattern for US ZIP codes (5 digits, optionally followed by +4)
 * Allows flexible spacing and dashes between 5 and 4 digit parts
 */
const ZIP_CODE_PATTERN = /^(\d{5})(?:[-\s]*(\d{4}))?$/;

/**
 * ZIP code pattern for use in other regex patterns (without anchors)
 * Allows flexible spacing and dashes between 5 and 4 digit parts
 */
const ZIP_CODE_REGEX_PATTERN = String.raw`(\d{5}(?:[-\s]*\d{4})?)`;

/**
 * Pattern for Canadian postal codes (A1A 1A1 format)
 * Allows flexible spacing and dashes between first 3 and last 3 characters
 * Uses case-insensitive flag for cleaner pattern
 */
const CANADIAN_POSTAL_CODE_PATTERN = /^([A-Z]\d[A-Z])[-\s]*(\d[A-Z]\d)$/i;

/**
 * Pattern for Canadian postal codes (more liberal matching)
 * Matches formats like: A1A 1A1, A1A1A1, A1A-1A1, a1a 1a1, etc.
 * Moved from address.ts to consolidate all postal patterns
 */
const CANADIAN_POSTAL_LIBERAL_PATTERN = /([A-Z]\d[A-Z][-\s]*\d[A-Z]\d)/i;

/**
 * Validate if a postal code or ZIP code is in the correct format
 */
 const validatePostalCode = (code: string): PostalValidationResult => {
  if (!code || typeof code !== 'string') {
    return {
      isValid: false,
      type: null,
      message: 'No postal code provided'
    };
  }

  const trimmed = code.trim();
  
  // Check US ZIP code format
  if (ZIP_CODE_PATTERN.test(trimmed)) {
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
  if (CANADIAN_POSTAL_CODE_PATTERN.test(trimmed)) {
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

// Exports at end of file as per AGENTS.md guidelines
export { 
  validatePostalCode, 
  ZIP_CODE_PATTERN, 
  ZIP_CODE_REGEX_PATTERN,
  CANADIAN_POSTAL_CODE_PATTERN,
  CANADIAN_POSTAL_LIBERAL_PATTERN 
};
export type { PostalValidationResult };