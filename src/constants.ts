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

/**
 * Common street names that should not be captured as part of city names
 */
const COMMON_STREET_NAMES_PATTERN = /^(broadway|main|first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|market|church|park|oak|elm|pine|maple|cedar|washington|lincoln|madison|jefferson|jackson|franklin|harrison|central|mill|spring|hill|river|lake|green|north|south|east|west)$/i;

/**
 * General Delivery patterns
 */
const GENERAL_DELIVERY_PATTERNS = {
  /** Standard General Delivery pattern */
  STANDARD: /^general\s+delivery$/i,
  /** General Delivery with city extraction */
  WITH_CITY: /^\s*general\s+delivery\s+([^,]+?)\s+([A-Za-z]{2})\b/i
} as const;

/**
 * ZIP code validation patterns
 */
const ZIP_VALIDATION_PATTERNS = {
  /** Potential ZIP pattern for strict mode validation */
  POTENTIAL_ZIP: /\b([A-Z0-9]{3,9}(?:[-\s][A-Z0-9]{1,4})?)\s*$/i
} as const;

/**
 * Facility delimiter patterns for inline address parsing
 */
const FACILITY_DELIMITER_PATTERNS = {
  /** Parenthetical address format: "Facility Name (address)" */
  PARENTHETICAL: /^(.*?)\s*\(([^)]+)\)\s*$/,
  /** Delimiter-separated format: "Facility Name: address" or "Facility Name | address" */
  DELIMITED: /^(.*?)\s*([:;|\u2013\u2014\-])\s*(.+)$/,
  /** Trailing Island format: "Facility  Liberty Island" */
  TRAILING_ISLAND: /^(.*?)(\s+)(\b.+\s+(?:Island|Isl\.?|Is\.?)\b.*)$/i
} as const;

/**
 * Island type variations for special facility handling
 */
const ISLAND_TYPE_PATTERN = /^(island|is\.?|isl\.?|isle\.?|ils\.?)$/i;

/**
 * Connector words to ignore when checking Title Case in facility names
 */
const CONNECTOR_WORDS = new Set([
  'of','the','and','at','on','in','for','to','from','by','with','without',
  'de','la','le','les','du','des','l\'',"d'","o'","y'"
]);

export { 
  COUNTRIES, 
  CITY_PATTERNS, 
  VALIDATION_PATTERNS,
  COMMON_STREET_NAMES_PATTERN,
  GENERAL_DELIVERY_PATTERNS,
  ZIP_VALIDATION_PATTERNS,
  FACILITY_DELIMITER_PATTERNS,
  ISLAND_TYPE_PATTERN,
  CONNECTOR_WORDS
};
export type { CountryCode };