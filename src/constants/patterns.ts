// Common street names that should not be captured as part of city names
// Prevents false city detection for addresses with generic street names
export const COMMON_STREET_NAMES_PATTERN = new RegExp(
  "^(" +
    "broadway|main|first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|" +
    "market|church|park|oak|elm|pine|maple|cedar|" +
    "washington|lincoln|madison|jefferson|jackson|franklin|harrison|" +
    "central|mill|spring|hill|river|lake|green|" +
    "north|south|east|west" +
  ")$",
  "i"
);

// General Delivery patterns
export const GENERAL_DELIVERY_PATTERNS = {
  STANDARD: /^general\s+delivery$/i,
  WITH_CITY: /^\s*general\s+delivery\s+([^,]+?)\s+([A-Za-z]{2})\b/i
} as const;

// ZIP code validation patterns
export const ZIP_VALIDATION_PATTERNS = {
  POTENTIAL_ZIP: /\b([A-Z0-9]{3,9}(?:[-\s][A-Z0-9]{1,4})?)\s*$/i
} as const;

// Facility delimiter patterns for inline address parsing
export const FACILITY_DELIMITER_PATTERNS = {
  PARENTHETICAL: /^(.*?)\s*\(([^)]+)\)\s*$/, // "Facility Name (address)"
  DELIMITED: /^(.*?)\s*([:;|\u2013\u2014\-])\s*(.+)$/, // "Facility Name: address"
  TRAILING_ISLAND: /^(.*?)(\s+)(\b.+\s+(?:Island|Isl\.?|Is\.?)\b.*)$/i // "Facility  Liberty Island"
} as const;

// Island type variations for special facility handling
export const ISLAND_TYPE_PATTERN = /^(island|is\.?|isl\.?|isle\.?|ils\.?)$/i;

// Connector words to ignore when checking Title Case in facility names
export const CONNECTOR_WORDS = new Set([
  'of','the','and','at','on','in','for','to','from','by','with','without',
  'de','la','le','les','du','des','l\'',"d'","o'","y'"
]);