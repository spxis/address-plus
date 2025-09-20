// Core validation and formatting patterns used throughout address parsing

// Basic validation patterns for text analysis
const VALIDATION_PATTERNS = {
  HAS_LETTERS: /[a-zA-Z]/,
  ALPHANUMERIC: /[a-zA-Z0-9]/g,
  HAS_DIGITS: /\d/,
  HOUSE_NUMBER_START: /^(\d+|\w\d+\w\d+)\b/,
  STARTS_WITH_NUMBER: /^\s*(\d|\w\d+\w\d+)/,
  WHITESPACE_SPLIT: /\s+/,
  TITLE_CASE: /^[A-Z]/,
  NUMERIC_ONLY: /^\d+$/,
  NON_WORD: /[^\w]/g,
  REGEX_ESCAPE: /[.*+?^${}()|[\]\\]/g,
  NORMALIZE_SPACES: /\s+/g,
  PO_BOX_NORMALIZE: /^p\.o\.\s*box$/i,
} as const;

// General delivery address patterns
const GENERAL_DELIVERY_PATTERNS = {
  STANDARD: /^general\s+delivery$/i,
  WITH_CITY: /^\s*general\s+delivery\s+([^,]+?)\s+([A-Za-z]{2})\b/i,
} as const;

// ZIP code validation patterns
const ZIP_VALIDATION_PATTERNS = {
  POTENTIAL_ZIP: /\b([A-Z0-9]{3,9}(?:[-\s][A-Z0-9]{1,4})?)\s*$/i,
} as const;

// Facility delimiter patterns for inline address parsing
const FACILITY_DELIMITER_PATTERNS = {
  PARENTHETICAL: /^(.*?)\s*\(([^)]+)\)\s*$/,
  DELIMITED: /^(.*?)\s*([:;|\u2013\u2014\-])\s*(.+)$/,
  TRAILING_ISLAND: /^(.*?)(\s+)(\b.+\s+(?:Island|Isl\.?|Is\.?)\b.*)$/i,
} as const;

// Island type variations for special facility handling
const ISLAND_TYPE_PATTERN = /^(island|is\.?|isl\.?|isle\.?|ils\.?)$/i;

// Connector words to ignore when checking Title Case in facility names
const CONNECTOR_WORDS = new Set([
  "of",
  "the",
  "and",
  "at",
  "on",
  "in",
  "for",
  "to",
  "from",
  "by",
  "with",
  "without",
  "de",
  "la",
  "le",
  "les",
  "du",
  "des",
  "l'",
  "d'",
  "o'",
  "y'",
]);

// Common street names that should not be captured as part of city names
const COMMON_STREET_NAMES_PATTERN = new RegExp(
  "^(" +
    "broadway|main|first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|" +
    "market|church|park|oak|elm|pine|maple|cedar|" +
    "washington|lincoln|madison|jefferson|jackson|franklin|harrison|" +
    "central|mill|spring|hill|river|lake|green|" +
    "north|south|east|west" +
    ")$",
  "i",
);

export {
  COMMON_STREET_NAMES_PATTERN,
  CONNECTOR_WORDS,
  FACILITY_DELIMITER_PATTERNS,
  GENERAL_DELIVERY_PATTERNS,
  ISLAND_TYPE_PATTERN,
  VALIDATION_PATTERNS,
  ZIP_VALIDATION_PATTERNS,
};
