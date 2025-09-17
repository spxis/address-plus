/**
 * Facility name recognition patterns
 */

/**
 * Common facility name patterns for extraction
 */
const FACILITY_PATTERNS = [
  /\b(hospital|medical center|clinic|mall|shopping center|plaza|tower|building|center|centre)\b/i,
  /\b(school|university|college|library|church|temple|mosque|synagogue)\b/i,
  /\b(airport|station|terminal|depot|port|harbor|harbour)\b/i,
  /\b(park|recreation|rec center|community center|civic center)\b/i,
];

/**
 * Pattern for detecting delimiter-separated facility addresses
 * Matches: "Any text, address components"
 * This is a simple delimiter-based approach - if we have comma-separated parts
 * and the first part doesn't look like typical address components (no numbers, street types),
 * we treat it as a facility name and parse from the second part.
 */
const FACILITY_DELIMITER_PATTERN = /^([^,]+),\s*(.+)$/;

export { FACILITY_PATTERNS, FACILITY_DELIMITER_PATTERN };