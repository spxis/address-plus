// Geographic and postal code patterns for location parsing

// US ZIP code patterns
const ZIP_CODE_PATTERN = /^(\d{5})(?:[-\s]*(\d{4}))?$/;

// US ZIP code pattern for string interpolation
const ZIP_CODE_REGEX_PATTERN = String.raw`(\d{5}(?:[-\s]*\d{4})?)`;

// Canadian postal code patterns
const CANADIAN_POSTAL_CODE_PATTERN = /^([A-Z]\d[A-Z])[-\s]*(\d[A-Z]\d)$/i;

// Liberal Canadian postal code pattern for broader matching
const CANADIAN_POSTAL_LIBERAL_PATTERN = /([A-Z]\d[A-Z][-\s]*\d[A-Z]\d)/i;

// City name extraction patterns
const CITY_PATTERNS = {
  BASIC_CITY: /\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)$/,
  MULTI_WORD_CITY: /\s+([A-Za-z]+(?: [A-Za-z]+)*?)(?:\s+[A-Z]{2,3})?\s*$/,
  SINGLE_WORD_CITY: /\s+([A-Za-z]+)$/,
  TWO_WORD_CITY: /\s+([A-Za-z]+\s+[A-Za-z]+)$/,
} as const;

export {
  CANADIAN_POSTAL_CODE_PATTERN,
  CANADIAN_POSTAL_LIBERAL_PATTERN,
  CITY_PATTERNS,
  ZIP_CODE_PATTERN,
  ZIP_CODE_REGEX_PATTERN,
};
