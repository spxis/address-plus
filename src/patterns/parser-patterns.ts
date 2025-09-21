// Parser-specific regex patterns
// These patterns are used exclusively by the main parser logic

// Basic validation patterns for address parsing
const BASIC_VALIDATION_PATTERNS = {
  // Check if text contains digits
  HAS_DIGITS: /\d/,
  
  // Check if text contains letters  
  HAS_LETTERS: /[a-zA-Z]/,
  
  // Newline replacement pattern
  NEWLINE_TO_COMMA: /\n/g,
  
  // General delivery pattern at start of address
  LEADING_GENERAL_DELIVERY: /^\s*(general\s+delivery)\b[\s,]*/i,
  
  // Letter-only pattern for number validation
  LETTERS_ONLY: /^[a-zA-Z]+$/,
  
  // Trailing comma cleanup pattern
  TRAILING_COMMAS: /,+\s*$/,
  
  // Period removal pattern
  REMOVE_PERIODS: /\./g,
  
  // Dot removal for directional normalization
  TRAILING_DOT: /\.$/,
};

// Utility patterns used across the codebase
const UTILITY_PATTERNS = {
  // Remove periods from text (for normalization)
  REMOVE_PERIODS: /\./g,
  
  // Non-alphanumeric characters (for secondary unit type cleaning)
  NON_ALPHA: /[^a-z]/g,
};

// Road name validation patterns - used to prevent false directional extraction
const ROAD_NAME_PATTERNS = {
  // Pattern to detect road names with numbers like "County Road 250 East"
  NUMBERED_ROAD: /\b(road|rd|route|rte|highway|hwy|street|st|avenue|ave)\s+\w+$/i,
  
  // Pattern to detect ordinal street names like "1st Street North West"  
  ORDINAL_STREET: /\b\d+(st|nd|rd|th)\s+(street|st|avenue|ave|road|rd)$/i,
  
  // Pattern to detect directional street names like "North Street East"
  DIRECTIONAL_STREET: /\b(north|south|east|west)\s+(street|st|avenue|ave|road|rd)$/i,
};

// Digit detection patterns for parts validation
const DIGIT_PATTERNS = {
  // Simple digit detection
  HAS_DIGIT: /\d/,
};

export { BASIC_VALIDATION_PATTERNS, DIGIT_PATTERNS, ROAD_NAME_PATTERNS, UTILITY_PATTERNS };