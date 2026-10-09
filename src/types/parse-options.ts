/**
 * Options for every parser: the country, strict postal codes, snake_case keys and the rest. Every one is optional.
 *
 * @example
 * ```ts
 * parseLocation("東京都千代田区丸の内1-2-3", { country: "JP", useSnakeCase: true })?.prefecture_code
 * // → "13"
 * ```
 */
interface ParseOptions {
  country?: "CA" | "US" | "JP" | "auto"; // Country to optimize parsing for; JP skips the detection and parses as Japanese
  normalize?: boolean; // Whether to normalize street types and directions
  validatePostalCode?: boolean; // Whether to validate postal/ZIP codes
  language?: "auto" | "en" | "fr"; // Language preference for bilingual parsing (Canada)
  extractFacilities?: boolean; // Whether to extract facility names
  parseParenthetical?: boolean; // Whether to parse parenthetical information
  strict?: boolean; // Whether to only extract valid ZIP/postal codes (strict mode) - true: Only extract codes that pass format validation, false (default): Extract all codes but indicate validity with zipValid field
  useSnakeCase?: boolean; // Whether to return field names in snake_case format for backward compatibility - true: Return snake_case field names (sec_unit_type, sec_unit_num, etc.), false (default): Return camelCase field names (secUnitType, secUnitNum, etc.)
}

export type { ParseOptions };
