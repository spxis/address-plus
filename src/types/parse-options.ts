// Options to control address parsing behavior
interface ParseOptions {
  country?: "CA" | "US" | "auto"; // Country to optimize parsing for
  normalize?: boolean; // Whether to normalize street types and directions
  validatePostalCode?: boolean; // Whether to validate postal/ZIP codes
  language?: "auto" | "en" | "fr"; // Language preference for bilingual parsing (Canada)
  extractFacilities?: boolean; // Whether to extract facility names
  parseParenthetical?: boolean; // Whether to parse parenthetical information
  strict?: boolean; // Whether to only extract valid ZIP/postal codes (strict mode) - true: Only extract codes that pass format validation, false (default): Extract all codes but indicate validity with zipValid field
  useSnakeCase?: boolean; // Whether to return field names in snake_case format for backward compatibility - true: Return snake_case field names (sec_unit_type, sec_unit_num, etc.), false (default): Return camelCase field names (secUnitType, secUnitNum, etc.)
  useCamelCase?: boolean; // Whether to ensure field names are in camelCase format - true: Convert any snake_case field names to camelCase (secUnitType, secUnitNum, etc.), false (default): Return field names as-is. Takes precedence over useSnakeCase if both are specified.
}

export type { ParseOptions };
