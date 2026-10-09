// Geographic and postal code patterns for location parsing

// US ZIP code patterns
const ZIP_CODE_PATTERN = /^(\d{5})(?:[-\s]*(\d{4}))?$/;

// US ZIP code pattern for string interpolation
const ZIP_CODE_REGEX_PATTERN = String.raw`(\d{5}(?:[-\s]*\d{4})?)`;

// Canadian postal code patterns
const CANADIAN_POSTAL_CODE_PATTERN = /^([A-Z]\d[A-Z])[-\s]*(\d[A-Z]\d)$/i;

// Liberal Canadian postal code pattern for broader matching
const CANADIAN_POSTAL_LIBERAL_PATTERN = /([A-Z]\d[A-Z][-\s]*\d[A-Z]\d)/i;

// City name extraction patterns. A word is letters of any alphabet, with apostrophes and hyphens inside
// it (Montréal, Trois-Rivières, Coeur d'Alene's "d'Alene"), so the patterns carry the `u` flag.
const CITY_WORD = String.raw`\p{L}[\p{L}'’-]*`;
const CITY_PATTERNS = {
  BASIC_CITY: new RegExp(String.raw`\s+(${CITY_WORD}(?:\s+${CITY_WORD})?)$`, "u"),
  MULTI_WORD_CITY: new RegExp(String.raw`\s+(${CITY_WORD}(?: ${CITY_WORD})*?)(?:\s+[A-Z]{2,3})?\s*$`, "u"),
  SINGLE_WORD_CITY: new RegExp(String.raw`\s+(${CITY_WORD})$`, "u"),
  TWO_WORD_CITY: new RegExp(String.raw`\s+(${CITY_WORD}\s+${CITY_WORD})$`, "u"),
} as const;

export {
  CANADIAN_POSTAL_CODE_PATTERN,
  CANADIAN_POSTAL_LIBERAL_PATTERN,
  CITY_PATTERNS,
  ZIP_CODE_PATTERN,
  ZIP_CODE_REGEX_PATTERN,
};
