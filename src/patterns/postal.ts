// Regular expressions for postal code patterns

// Pattern for US ZIP codes (5 digits, optionally followed by +4)
// Allows flexible spacing and dashes between 5 and 4 digit parts
const ZIP_CODE_PATTERN = /^(\d{5})(?:[-\s]*(\d{4}))?$/;

// ZIP code pattern for use in other regex patterns (without anchors)
// Allows flexible spacing and dashes between 5 and 4 digit parts
const ZIP_CODE_REGEX_PATTERN = String.raw`(\d{5}(?:[-\s]*\d{4})?)`;

// Pattern for Canadian postal codes (A1A 1A1 format)
// Allows flexible spacing and dashes between first 3 and last 3 characters
// Uses case-insensitive flag for cleaner pattern
const CANADIAN_POSTAL_CODE_PATTERN = /^([A-Z]\d[A-Z])[-\s]*(\d[A-Z]\d)$/i;

// Pattern for Canadian postal codes (more liberal matching)
// Matches formats like: A1A 1A1, A1A1A1, A1A-1A1, a1a 1a1, etc.
// Moved from address.ts to consolidate all postal patterns
const CANADIAN_POSTAL_LIBERAL_PATTERN = /([A-Z]\d[A-Z][-\s]*\d[A-Z]\d)/i;

export { 
  ZIP_CODE_PATTERN,
  ZIP_CODE_REGEX_PATTERN,
  CANADIAN_POSTAL_CODE_PATTERN,
  CANADIAN_POSTAL_LIBERAL_PATTERN
};
