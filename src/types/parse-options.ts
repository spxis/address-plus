/**
 * Configuration options for address parsing
 */

/**
 * Options to control address parsing behavior
 */
interface ParseOptions {
  /** Country to optimize parsing for */
  country?: "CA" | "US" | "auto";
  /** Whether to normalize street types and directions */
  normalize?: boolean;
  /** Whether to validate postal/ZIP codes */
  validatePostalCode?: boolean;
  /** Language preference for bilingual parsing (Canada) */
  language?: "auto" | "en" | "fr";
  /** Whether to extract facility names */
  extractFacilities?: boolean;
  /** Whether to parse parenthetical information */
  parseParenthetical?: boolean;
  /** 
   * Whether to only extract valid ZIP/postal codes (strict mode)
   * - true: Only extract codes that pass format validation
   * - false (default): Extract all codes but indicate validity with zipValid field
   */
  strict?: boolean;
}

export type { ParseOptions };