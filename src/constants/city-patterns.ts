/**
 * City name extraction patterns
 */

// City name extraction patterns
export const CITY_PATTERNS = {
  BASIC_CITY: /\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)$/,
  MULTI_WORD_CITY: /\s+([A-Za-z]+(?: [A-Za-z]+)*?)(?:\s+[A-Z]{2,3})?\s*$/,
  SINGLE_WORD_CITY: /\s+([A-Za-z]+)$/,
  TWO_WORD_CITY: /\s+([A-Za-z]+\s+[A-Za-z]+)$/
} as const;