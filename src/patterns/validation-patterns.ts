// Regex patterns for address validation
const VALIDATION_PATTERNS = {
  HAS_LETTERS: /[a-zA-Z]/,
  ALPHANUMERIC: /[a-zA-Z0-9]/g,
  HAS_DIGITS: /\d/,
  HOUSE_NUMBER_START: /^(\d+|\w\d+\w\d+)\b/, // Including complex alphanumeric like N95W18855
  STARTS_WITH_NUMBER: /^\s*(\d|\w\d+\w\d+)/,
  WHITESPACE_SPLIT: /\s+/,
  TITLE_CASE: /^[A-Z]/,
  NUMERIC_ONLY: /^\d+$/,
  NON_WORD: /[^\w]/g,
  REGEX_ESCAPE: /[.*+?^${}()|[\]\\]/g,
  NORMALIZE_SPACES: /\s+/g,
  PO_BOX_NORMALIZE: /^p\.o\.\s*box$/i
} as const;

export { VALIDATION_PATTERNS };