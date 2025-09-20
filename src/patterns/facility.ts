// Facility name recognition patterns

// Common facility type keywords used for identifying facility names
const FACILITY_INDICATORS = [
  'center', 'centre', 'building', 'tower', 'plaza', 'square', 'garden', 'gardens',
  'park', 'university', 'college', 'school', 'hospital', 'library', 'museum',
  'station', 'airport', 'mall', 'market', 'stadium', 'arena', 'theater', 'theatre',
  'hotel', 'resort', 'memorial', 'monument', 'bridge', 'tunnel', 'complex'
] as const;

// Common facility name patterns for extraction
const FACILITY_PATTERNS_EN = [
  /\b(hospital|medical center|clinic|mall|shopping center|plaza|tower|building|center|centre)\b/i,
  /\b(school|university|college|library|church|temple|mosque|synagogue)\b/i,
  /\b(airport|station|terminal|depot|port|harbor|harbour)\b/i,
  /\b(park|recreation|rec center|community center|civic center)\b/i,
];

const FACILITY_PATTERNS_FR = [ 
  /\b(hôpital|centre médical|clinique|centre commercial|place|tour|bâtiment|centre)\b/i,
  /\b(école|université|collège|bibliothèque|église|temple|mosquée|synagogue)\b/i,
  /\b(aéroport|gare|terminal|dépôt|port|havre)\b/i,
  /\b(parc|récréation|centre récréatif|centre communautaire|centre civique)\b/i,
];

// Combined facility patterns for English and French
const FACILITY_PATTERNS: RegExp[] = [...FACILITY_PATTERNS_EN, ...FACILITY_PATTERNS_FR];

// Pattern for detecting delimiter-separated facility addresses
// Matches: "Any text, address components"
// This is a simple delimiter-based approach - if we have comma-separated parts
// and the first part doesn't look like typical address components (no numbers, street types),
// we treat it as a facility name and parse from the second part.
const FACILITY_DELIMITER_PATTERN = /^([^,]+),\s*(.+)$/;

// Pattern for Music Square East special case
const MUSIC_SQUARE_EAST_PATTERN = /^(.*square)\s+(east)\s*$/i;

export { FACILITY_INDICATORS, FACILITY_PATTERNS, FACILITY_DELIMITER_PATTERN, MUSIC_SQUARE_EAST_PATTERN };