/**
 * Common constants used throughout the address parser
 */

/**
 * Country codes used in address parsing
 */
const COUNTRIES = {
  CANADA: 'CA',
  UNITED_STATES: 'US'
} as const;

/**
 * Type for country codes
 */
type CountryCode = typeof COUNTRIES[keyof typeof COUNTRIES];

/**
 * Regex patterns for address validation
 */
const VALIDATION_PATTERNS = {
  /** Check for letters in input */
  HAS_LETTERS: /[a-zA-Z]/,
  /** Check for alphanumeric characters */
  ALPHANUMERIC: /[a-zA-Z0-9]/g,
  /** Check for digits */
  HAS_DIGITS: /\d/,
  /** Check for house number at start (including complex alphanumeric like N95W18855) */
  HOUSE_NUMBER_START: /^(\d+|\w\d+\w\d+)\b/,
  /** Check for number at start (including complex alphanumeric patterns) */
  STARTS_WITH_NUMBER: /^\s*(\d|\w\d+\w\d+)/,
  /** Split by whitespace */
  WHITESPACE_SPLIT: /\s+/,
  /** Check for title case words */
  TITLE_CASE: /^[A-Z]/,
  /** Check for numeric only */
  NUMERIC_ONLY: /^\d+$/,
  /** Remove non-word characters */
  NON_WORD: /[^\w]/g,
  /** Escape regex special characters */
  REGEX_ESCAPE: /[.*+?^${}()|[\]\\]/g,
  /** Replace multiple spaces with single space */
  NORMALIZE_SPACES: /\s+/g,
  /** PO Box normalization pattern */
  PO_BOX_NORMALIZE: /^p\.o\.\s*box$/i
} as const;

/**
 * City name extraction patterns
 */
const CITY_PATTERNS = {
  BASIC_CITY: /\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)$/,
  MULTI_WORD_CITY: /\s+([A-Za-z]+(?: [A-Za-z]+)*?)(?:\s+[A-Z]{2,3})?\s*$/,
  SINGLE_WORD_CITY: /\s+([A-Za-z]+)$/,
  TWO_WORD_CITY: /\s+([A-Za-z]+\s+[A-Za-z]+)$/
} as const;

export { COUNTRIES, CITY_PATTERNS, VALIDATION_PATTERNS };
export type { CountryCode };