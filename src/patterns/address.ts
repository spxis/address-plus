/**
 * Regular expression patterns for address parsing
 */

/**
 * Unit type keywords pattern (for building regex patterns)
 * Updated to include more comprehensive unit types
 */
const UNIT_TYPE_KEYWORDS = 'suite|ste|apt|apartment|unit|floor|fl|building|bldg|gate|lobby|lot|lt|rm|room|office|off|level|lv|desk|workstation|booth|stall|bay';

/**
 * Written numbers that can appear as street numbers
 * Includes comprehensive ordinal support, plurals, and compound numbers
 * Supports both English and French
 */
const WRITTEN_NUMBERS_EN = 
  'one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|' +
  'thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|' +
  'twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|' +
  'hundred(?:s)?|thousand(?:s)?|' +
  'first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|' +
  'eleventh|twelfth|thirteenth|fourteenth|fifteenth|sixteenth|' +
  'seventeenth|eighteenth|nineteenth|' +
  '(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)' +
  '(?:[-\\s]?(?:one|two|three|four|five|six|seven|eight|nine))?';

const WRITTEN_NUMBERS_FR = 
  'deux|trois|quatre|cinq|sept|huit|neuf|onze|douze|' +
  'treize|quatorze|quinze|seize|dix-sept|dix-huit|dix-neuf|' +
  'vingt|trente|quarante|cinquante|soixante|soixante-dix|quatre-vingt|quatre-vingt-dix|' +
  'mille|' +
  'deuxième|troisième|quatrième|cinquième|septième|huitième|neuvième|' +
  'onzième|douzième|treizième|quatorzième|quinzième|seizième|' +
  'dix-septième|dix-huitième|dix-neuvième';

const WRITTEN_NUMBERS = WRITTEN_NUMBERS_EN + '|' + WRITTEN_NUMBERS_FR;

/**
 * Pattern for secondary unit types and numbers
 * Matches: "apt 123", "suite 5A", "unit 12", "floor 86", "building 4", "gate B", "#45", "# 45", "lt42"
 * Conservative update to handle specific cases without breaking existing patterns
 */
const SECONDARY_UNIT_PATTERN = new RegExp(`^(.*?)\\s+((?:${UNIT_TYPE_KEYWORDS})\\s+[a-z0-9-]+|(?:lt|lot)[a-z0-9]+|#\\s*[a-z0-9-]+)\\s*$`, 'i');

/**
 * Pattern for extracting unit type and number
 * Used to parse the secondary unit match
 * Conservative update to handle specific cases like lt42
 */
const UNIT_TYPE_NUMBER_PATTERN = new RegExp(`(${UNIT_TYPE_KEYWORDS})\\s+([a-z0-9-]+)|(lt|lot)([a-z0-9]+)|#\\s*([a-z0-9-]+)`, 'i');

/**
 * Pattern for Canadian postal codes (more liberal matching)
 * Matches formats like: A1A 1A1, A1A1A1, a1a 1a1, etc.
 */
const CANADIAN_POSTAL_LIBERAL_PATTERN = /([A-Z]\d[A-Z]\s*\d[A-Z]\d)/i;

/**
 * Pattern for extracting parenthetical information
 * Matches content within parentheses
 */
const PARENTHETICAL_PATTERN = /\(([^)]+)\)/g;

export {
  CANADIAN_POSTAL_LIBERAL_PATTERN,
  PARENTHETICAL_PATTERN,
  SECONDARY_UNIT_PATTERN,
  UNIT_TYPE_KEYWORDS,
  UNIT_TYPE_NUMBER_PATTERN,
  WRITTEN_NUMBERS,
};