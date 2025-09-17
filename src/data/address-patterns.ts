/**
 * Regular expression patterns for address parsing
 */

/**
 * Pattern for secondary unit types and numbers
 * Matches: "apt 123", "suite 5A", "unit 12", "#45", "# 45", etc.
 */
export const SECONDARY_UNIT_PATTERN = /^(.*?)\s+((?:suite|ste|apt|apartment|unit)\s+[a-z0-9-]+|#\s*[a-z0-9-]+)\s*$/i;

/**
 * Pattern for extracting unit type and number
 * Used to parse the secondary unit match
 */
export const UNIT_TYPE_NUMBER_PATTERN = /(suite|ste|apt|apartment|unit)\s+([a-z0-9-]+)|#\s*([a-z0-9-]+)/i;

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