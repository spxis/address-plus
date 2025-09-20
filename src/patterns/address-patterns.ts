// Address-specific patterns for components, units, and facilities

// Unit type keywords pattern (for building regex patterns)
// Updated to include more comprehensive unit types
const UNIT_TYPE_KEYWORDS = 'suite|ste|apt|apartment|unit|floor|fl|building|bldg|gate|lobby|lot|lt|rm|room|office|off|level|lv|desk|workstation|booth|stall|bay';

// Written numbers that can appear as street numbers
// Includes comprehensive ordinal support, plurals, and compound numbers
// Supports both English and French
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

// Secondary unit parsing patterns
// Pattern for secondary unit types and numbers
// Matches: "apt 123", "suite 5A", "unit 12", "floor 86", "building 4", "gate B", "#45", "# 45", "lt42"
// Conservative update to handle specific cases without breaking existing patterns
const SECONDARY_UNIT_PATTERN = new RegExp(`^(.*?)\\s+((?:${UNIT_TYPE_KEYWORDS})\\s+[a-z0-9-]+|(?:lt|lot)[a-z0-9]+|#\\s*[a-z0-9-]+)\\s*$`, 'i');

// Pattern for detecting common street types in addresses
// Used to determine if parsed address has valid street component
const STREET_TYPE_DETECTION_PATTERN = /\b(street|st|avenue|ave|road|rd|drive|dr|boulevard|blvd|lane|ln|court|ct|place|pl|way|highway|hwy|parkway|pkwy|circle|cir|terrace|ter|trail|trl)\b/i;

// Pattern for extracting unit type and number
// Used to parse the secondary unit match
// Conservative update to handle specific cases like lt42
const UNIT_TYPE_NUMBER_PATTERN = new RegExp(`(${UNIT_TYPE_KEYWORDS})\\s+([a-z0-9-]+)|(lt|lot)([a-z0-9]+)|#\\s*([a-z0-9-]+)`, 'i');

// Pattern for extracting parenthetical information
// Matches content within parentheses
const PARENTHETICAL_PATTERN = /\(([^)]+)\)/g;

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
  /\b(aéroport|gare|terminal|dépôt|port)\b/i,
  /\b(parc|récréation|centre récréatif|centre communautaire|centre civique)\b/i,
];

// Combined facility patterns for English and French
const FACILITY_PATTERNS: RegExp[] = [...FACILITY_PATTERNS_EN, ...FACILITY_PATTERNS_FR];

// Facility delimiter pattern for inline address parsing
const FACILITY_DELIMITER_PATTERN = /(?:[:;|\u2013\u2014\-]|\s{2,})/;

// Pattern for Music Square East special case
const MUSIC_SQUARE_EAST_PATTERN = /^(.*square)\s+(east)\s*$/i;

export {
  UNIT_TYPE_KEYWORDS,
  WRITTEN_NUMBERS,
  SECONDARY_UNIT_PATTERN,
  STREET_TYPE_DETECTION_PATTERN,
  UNIT_TYPE_NUMBER_PATTERN,
  PARENTHETICAL_PATTERN,
  FACILITY_INDICATORS,
  FACILITY_PATTERNS,
  FACILITY_DELIMITER_PATTERN,
  MUSIC_SQUARE_EAST_PATTERN,
};