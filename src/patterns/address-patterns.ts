// Address-specific patterns for components, units, and facilities

// Secondary unit designators that take a number or letter after them (USPS Publication 28 Appendix C2,
// Canada Post's English and French unit words, and a few spellings people write). Longest first, so
// "apartment" is tried before "apt" and "suite" before "su".
const UNIT_TYPE_KEYWORDS =
  "appartement|workstation|department|apartment|building|penthouse|hangar|hanger|trailer|office|" +
  "bureau|suite|floor|lobby|level|space|stall|unité|unite|booth|apt|ste|bldg|dept|hngr|trlr|unit|" +
  "pier|slip|stop|gate|room|desk|bay|lot|spc|flr|fl|lt|rm|lv|off|ofc|pmb|app|key";

// Designators that stand alone, with no number (Pub 28: BSMT, FRNT, LBBY, LOWR, OFC, PH, REAR, SIDE, UPPR).
const STANDALONE_UNIT_KEYWORDS =
  "basement|penthouse|lobby|front|lower|upper|office|rear|side|bsmt|frnt|lbby|lowr|uppr|ofc|ph";

// What may follow a designator: "Apt 4B", "Apt. 7", "Apt #4B", "Apt No. 456", "Ste D304". A value holds a
// digit or is a single letter, so "Office Rd" in "Old Post Office Rd" is not a unit.
const UNIT_VALUE = String.raw`(?:[a-z]?\d[a-z0-9-]*|[a-z])(?![\p{L}\p{N}])`;
const UNIT_SEPARATOR = String.raw`\.?(?:\s*#\s*|\s+(?:no\.?|n°)\s*|\s+)`;

// Written numbers that can appear as street numbers
// Includes comprehensive ordinal support, plurals, and compound numbers
// Supports both English and French
const WRITTEN_NUMBERS_EN =
  "one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|" +
  "thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|" +
  "twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|" +
  "hundred(?:s)?|thousand(?:s)?|" +
  "first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|" +
  "eleventh|twelfth|thirteenth|fourteenth|fifteenth|sixteenth|" +
  "seventeenth|eighteenth|nineteenth|" +
  "(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)" +
  "(?:[-\\s]?(?:one|two|three|four|five|six|seven|eight|nine))?";

const WRITTEN_NUMBERS_FR =
  "deux|trois|quatre|cinq|sept|huit|neuf|onze|douze|" +
  "treize|quatorze|quinze|seize|dix-sept|dix-huit|dix-neuf|" +
  "vingt|trente|quarante|cinquante|soixante|soixante-dix|quatre-vingt|quatre-vingt-dix|" +
  "mille|" +
  "deuxième|troisième|quatrième|cinquième|septième|huitième|neuvième|" +
  "onzième|douzième|treizième|quatorzième|quinzième|seizième|" +
  "dix-septième|dix-huitième|dix-neuvième";

const WRITTEN_NUMBERS = WRITTEN_NUMBERS_EN + "|" + WRITTEN_NUMBERS_FR;

// Secondary unit parsing patterns
// A unit at the end of a street line: group 1 is the street before it, group 2 the unit text.
const SECONDARY_UNIT_PATTERN = new RegExp(
  `^(.*?)\\s+((?:${UNIT_TYPE_KEYWORDS})${UNIT_SEPARATOR}${UNIT_VALUE}|(?:lt|lot)[a-z0-9]+|#\\s*[a-z0-9-]+)\\s*$`,
  "iu",
);

// A comma part, or a line, that is only a unit: "Unit 4", "app. 4", "#12", "Bsmt".
const UNIT_PART_PATTERN = new RegExp(
  `^(?:(?:${UNIT_TYPE_KEYWORDS})${UNIT_SEPARATOR}${UNIT_VALUE}|#\\s*[a-z0-9-]+|(?:${STANDALONE_UNIT_KEYWORDS})\\.?)$`,
  "iu",
);

// Pattern for detecting common street types in addresses
// Used to determine if parsed address has valid street component
const STREET_TYPE_DETECTION_PATTERN =
  /\b(street|st|avenue|ave|road|rd|drive|dr|boulevard|blvd|lane|ln|court|ct|place|pl|way|highway|hwy|parkway|pkwy|circle|cir|terrace|ter|trail|trl)\b/i;

// Pattern for extracting unit type and number from a unit's text.
// Groups: 1 designator and 2 value ("apt 123", "Apt. #4B"), 3 and 4 a lot run together ("lt42"), 5 the value
// after a bare "#".
const UNIT_TYPE_NUMBER_PATTERN = new RegExp(
  `(?<![\\p{L}\\p{N}])(${UNIT_TYPE_KEYWORDS})${UNIT_SEPARATOR}(${UNIT_VALUE})|(?<![\\p{L}\\p{N}])(lt|lot)([a-z0-9]+)|#\\s*([a-z0-9-]+)`,
  "iu",
);

// Pattern for extracting parenthetical information
// Matches content within parentheses
const PARENTHETICAL_PATTERN = /\(([^)]+)\)/g;

// Common facility type keywords used for identifying facility names
const FACILITY_INDICATORS = [
  "center",
  "centre",
  "building",
  "tower",
  "plaza",
  "square",
  "garden",
  "gardens",
  "park",
  "university",
  "college",
  "school",
  "hospital",
  "library",
  "museum",
  "station",
  "airport",
  "mall",
  "market",
  "stadium",
  "arena",
  "theater",
  "theatre",
  "hotel",
  "resort",
  "memorial",
  "monument",
  "bridge",
  "tunnel",
  "complex",
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
const FACILITY_DELIMITER_PATTERN = /(?:[:;|\u2013\u2014-]|\s{2,})/;

// Pattern for Music Square East special case
const MUSIC_SQUARE_EAST_PATTERN = /^(.*square)\s+(east)\s*$/i;

export {
  FACILITY_DELIMITER_PATTERN,
  FACILITY_INDICATORS,
  FACILITY_PATTERNS,
  MUSIC_SQUARE_EAST_PATTERN,
  PARENTHETICAL_PATTERN,
  SECONDARY_UNIT_PATTERN,
  STANDALONE_UNIT_KEYWORDS,
  STREET_TYPE_DETECTION_PATTERN,
  UNIT_PART_PATTERN,
  UNIT_SEPARATOR,
  UNIT_TYPE_KEYWORDS,
  UNIT_TYPE_NUMBER_PATTERN,
  UNIT_VALUE,
  WRITTEN_NUMBERS,
};
