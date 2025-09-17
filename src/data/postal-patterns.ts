/**
 * Regular expressions for postal code patterns
 */

/**
 * Pattern for US ZIP codes (5 digits, optionally followed by +4)
 */
const ZIP_CODE_PATTERN = /^(\d{5})(?:[-\s]?(\d{4}))?$/;

/**
 * Pattern for Canadian postal codes (A1A 1A1 format)
 */
const CANADIAN_POSTAL_CODE_PATTERN = /^([A-Za-z]\d[A-Za-z])\s?(\d[A-Za-z]\d)$/;

export { CANADIAN_POSTAL_CODE_PATTERN, ZIP_CODE_PATTERN };