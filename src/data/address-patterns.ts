/**
 * Regular expression patterns for address parsing
 */

/**
 * Unit type keywords pattern (for building regex patterns)
 */
export const UNIT_TYPE_KEYWORDS = 'suite|ste|apt|apartment|unit|floor|fl|building|bldg|gate';

/**
 * Written numbers that can appear as street numbers
 * Includes comprehensive ordinal support, plurals, and compound numbers
 */
export const WRITTEN_NUMBERS = 
  'one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|' +
  'thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|' +
  'twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|' +
  'hundred(?:s)?|thousand(?:s)?|' +
  'first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|' +
  'eleventh|twelfth|thirteenth|fourteenth|fifteenth|sixteenth|' +
  'seventeenth|eighteenth|nineteenth|' +
  '(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)' +
  '(?:[-\\s]?(?:one|two|three|four|five|six|seven|eight|nine))?';

/**
 * Pattern for secondary unit types and numbers
 * Matches: "apt 123", "suite 5A", "unit 12", "floor 86", "building 4", "gate B", "#45", "# 45", etc.
 */
export const SECONDARY_UNIT_PATTERN = new RegExp(`^(.*?)\\s+((?:${UNIT_TYPE_KEYWORDS})\\s+[a-z0-9-]+|#\\s*[a-z0-9-]+)\\s*$`, 'i');

/**
 * Pattern for extracting unit type and number
 * Used to parse the secondary unit match
 */
export const UNIT_TYPE_NUMBER_PATTERN = new RegExp(`(${UNIT_TYPE_KEYWORDS})\\s+([a-z0-9-]+)|#\\s*([a-z0-9-]+)`, 'i');

/**
 * Pattern for Canadian postal codes (more liberal matching)
 * Matches formats like: A1A 1A1, A1A1A1, a1a 1a1, etc.
 */
export const CANADIAN_POSTAL_LIBERAL_PATTERN = /([A-Z]\d[A-Z]\s*\d[A-Z]\d)/i;

/**
 * Pattern for extracting parenthetical information
 * Matches content within parentheses
 */
export const PARENTHETICAL_PATTERN = /\(([^)]+)\)/g;