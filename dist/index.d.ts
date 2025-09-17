/**
 * Types for address parsing results - compatible with parse-address npm package
 */
/**
 * Parsed address result with all possible fields
 */
interface ParsedAddress {
    /** Street number */
    number?: string;
    /** Fractional address number (e.g., 1/2 in "123 1/2 Main St") */
    fraction?: string;
    /** Directional prefix (N, S, E, W, etc.) */
    prefix?: string;
    /** Street name */
    street?: string;
    /** Street type/suffix (St, Ave, Rd, etc.) */
    type?: string;
    /** Directional suffix */
    suffix?: string;
    /** City name */
    city?: string;
    /** State/Province code */
    state?: string;
    /** ZIP or postal code */
    zip?: string;
    /** Extended ZIP+4 code */
    plus4?: string;
    /** Secondary unit type (apt, suite, etc.) */
    sec_unit_type?: string;
    /** Secondary unit number */
    sec_unit_num?: string;
    /** Detected country (US, CA) */
    country?: "CA" | "US";
    /** Facility name (e.g., building name, complex name) */
    facility?: string;
    /** Rural route or similar */
    rural_route?: string;
    /** Site or compartment number */
    site?: string;
    /** General delivery indicator */
    general_delivery?: boolean;
    /** Legacy properties for backward compatibility */
    secondary?: string;
    unit?: string;
    zipext?: string;
}

/**
 * Result from intersection address parsing
 */
/**
 * Parsed intersection result containing two streets and location info
 */
interface ParsedIntersection {
    /** First street */
    street1?: string;
    /** First street type */
    type1?: string;
    /** First street prefix */
    prefix1?: string;
    /** First street suffix */
    suffix1?: string;
    /** Second street */
    street2?: string;
    /** Second street type */
    type2?: string;
    /** Second street prefix */
    prefix2?: string;
    /** Second street suffix */
    suffix2?: string;
    /** City */
    city?: string;
    /** State/Province */
    state?: string;
    /** ZIP/Postal code */
    zip?: string;
    /** Extended ZIP+4 code */
    zipext?: string;
    /** Country */
    country?: "CA" | "US";
}

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
}

/**
 * Address parser interface for API compatibility
 */

/**
 * Main address parser interface providing all parsing methods
 */
interface AddressParser {
    parseAddress(address: string, options?: ParseOptions): ParsedAddress | null;
    parseInformalAddress(address: string, options?: ParseOptions): ParsedAddress | null;
    parseIntersection(address: string, options?: ParseOptions): ParsedIntersection | null;
    parseLocation(address: string, options?: ParseOptions): ParsedAddress | null;
}

/**
 * Region type definition for state/province data with fuzzy matching support
 */
/**
 * Represents a geographic region (state or province) with standardized fields
 */
type Region = {
    abbr: string;
    country: "CA" | "US";
    name: string;
};

/**
 * Main address parser implementation
 * Based on the original parse-address library patterns
 */

/**
 * Parse a location string into address components
 */
declare function parseLocation(address: string, options?: ParseOptions): ParsedAddress | null;
/**
 * Parse informal addresses (fallback)
 */
declare function parseInformalAddress(address: string, options?: ParseOptions): ParsedAddress | null;
/**
 * Parse intersection addresses
 */
declare function parseIntersection(address: string, options?: ParseOptions): ParsedIntersection | null;
/**
 * Parse address (compatibility alias)
 */
declare function parseAddress(address: string, options?: ParseOptions): ParsedAddress | null;

/**
 * Canadian provinces and territories mapping
 */
/**
 * Official Canadian province and territory names in English mapped to their abbreviations
 */
declare const CA_PROVINCE_NAMES_EN: Record<string, string>;
/**
 * Official Canadian province and territory names in French mapped to their abbreviations
 */
declare const CA_PROVINCE_NAMES_FR: Record<string, string>;
/**
 * Combined official Canadian province and territory names (English and French)
 */
declare const CA_PROVINCE_NAMES: Record<string, string>;
/**
 * Common shortened forms, abbreviations, and alternative names for Canadian provinces
 */
declare const CA_PROVINCE_ALTERNATIVES: Record<string, string>;
/**
 * Combined mapping of all Canadian province names and alternatives to their abbreviations
 */
declare const CA_PROVINCES: Record<string, string>;
/**
 * Array of Canadian provinces and territories as Region objects for fuzzy matching
 */
declare const CA_REGIONS: Region[];

/**
 * Canadian Street Types (Canada Post official abbreviations) - bilingual
 */
/**
 * Mapping of Canadian street types and their variations to official Canada Post abbreviations
 * Includes both English and French terms
 */
declare const CA_STREET_TYPES: Record<string, string>;

/**
 * Directional abbreviations for US and Canadian addresses
 */
/**
 * Mapping of directional words to their standard abbreviations
 * Supports both English and French (for Canada)
 */
declare const DIRECTIONAL_MAP: Record<string, string>;

/**
 * Facility name recognition patterns
 */
/**
 * Common facility name patterns for extraction
 */
declare const FACILITY_PATTERNS: RegExp[];
/**
 * Pattern for detecting delimiter-separated facility addresses
 * Matches: "Any text, address components"
 * This is a simple delimiter-based approach - if we have comma-separated parts
 * and the first part doesn't look like typical address components (no numbers, street types),
 * we treat it as a facility name and parse from the second part.
 */
declare const FACILITY_DELIMITER_PATTERN: RegExp;

/**
 * Regular expressions for postal code patterns
 */
/**
 * Pattern for US ZIP codes (5 digits, optionally followed by +4)
 */
declare const ZIP_CODE_PATTERN: RegExp;
/**
 * Pattern for Canadian postal codes (A1A 1A1 format)
 */
declare const CANADIAN_POSTAL_CODE_PATTERN: RegExp;

/**
 * Regular expression patterns for address parsing
 */
/**
 * Unit type keywords pattern (for building regex patterns)
 */
declare const UNIT_TYPE_KEYWORDS = "suite|ste|apt|apartment|unit|floor|fl|building|bldg|gate";
/**
 * Written numbers that can appear as street numbers
 * Keep it simple to avoid false matches
 */
declare const WRITTEN_NUMBERS = "one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:[-\\s]?(?:one|two|three|four|five|six|seven|eight|nine))?";
/**
 * Pattern for secondary unit types and numbers
 * Matches: "apt 123", "suite 5A", "unit 12", "floor 86", "building 4", "gate B", "#45", "# 45", etc.
 */
declare const SECONDARY_UNIT_PATTERN: RegExp;
/**
 * Pattern for extracting unit type and number
 * Used to parse the secondary unit match
 */
declare const UNIT_TYPE_NUMBER_PATTERN: RegExp;
/**
 * Pattern for Canadian postal codes (more liberal matching)
 * Matches formats like: A1A 1A1, A1A1A1, a1a 1a1, etc.
 */
declare const CANADIAN_POSTAL_LIBERAL_PATTERN: RegExp;
/**
 * Pattern for extracting parenthetical information
 * Matches content within parentheses
 */
declare const PARENTHETICAL_PATTERN: RegExp;

/**
 * Secondary unit types and abbreviations
 */
/**
 * Mapping of secondary unit types to their standard abbreviations
 */
declare const SECONDARY_UNIT_TYPES: Record<string, string>;

/**
 * US States and territories mapping
 */
/**
 * Official US state and territory names mapped to their abbreviations
 */
declare const US_STATE_NAMES: Record<string, string>;
/**
 * Common shortened forms, abbreviations, and alternative names for US states
 */
declare const US_STATE_ALTERNATIVES: Record<string, string>;
/**
 * Combined mapping of all US state names and alternatives to their abbreviations
 */
declare const US_STATES: Record<string, string>;
/**
 * Array of US states and territories as Region objects for fuzzy matching
 */
declare const US_REGIONS: Region[];

/**
 * US Street Types (USPS official abbreviations)
 */
/**
 * Mapping of US street types and their variations to official USPS abbreviations
 */
declare const US_STREET_TYPES: Record<string, string>;

/**
 * Street type proper case mapping (USPS standards)
 * Maps lowercase abbreviations to their proper case equivalents
 */
declare const STREET_TYPE_PROPER_CASE: Record<string, string>;

/**
 * Region normalization utilities for fuzzy matching
 */
/**
 * Normalizes a region input string to find the best matching state/province
 * Supports exact matches and fuzzy matching for misspellings
 *
 * @param input - The input string to normalize (state/province name or abbreviation)
 * @returns Object with abbreviation and country, or null if no match found
 *
 * @example
 * normalizeRegion('Calfornia'); // → { abbr: 'CA', country: 'US' }
 * normalizeRegion('Texes');     // → { abbr: 'TX', country: 'US' }
 * normalizeRegion('Ontaroi');   // → { abbr: 'ON', country: 'CA' }
 * normalizeRegion('qc');        // → { abbr: 'QC', country: 'CA' }
 * normalizeRegion('quebec');    // → { abbr: 'QC', country: 'CA' }
 */
declare function normalizeRegion(input: string): {
    abbr: string;
    country: "CA" | "US";
} | null;

/**
 * Core parsing utilities and regex patterns
 */

/**
 * Normalize text for consistent parsing
 */
declare function normalizeText(text: string): string;
/**
 * Build regex patterns from dictionary
 */
declare function buildRegexFromDict(dict: Record<string, string>, capture?: boolean): RegExp;
/**
 * Extract and normalize directional
 */
declare function parseDirectional(text: string): {
    direction: string | undefined;
    remaining: string;
};
/**
 * Extract and normalize street type
 */
declare function parseStreetType(text: string, country?: 'US' | 'CA'): {
    type: string | undefined;
    remaining: string;
};
/**
 * Extract state or province
 */
declare function parseStateProvince(text: string, country?: 'US' | 'CA'): {
    state: string | undefined;
    remaining: string;
    detectedCountry?: 'US' | 'CA';
};
/**
 * Extract postal code (ZIP or Canadian postal code)
 */
declare function parsePostalCode(text: string): {
    zip: string | undefined;
    zipext: string | undefined;
    remaining: string;
    detectedCountry?: 'US' | 'CA';
};
/**
 * Parse secondary unit information (apartment, suite, etc.)
 */
declare function parseSecondaryUnit(text: string): {
    unit: string | undefined;
    sec_unit_type: string | undefined;
    sec_unit_num: string | undefined;
    remaining: string;
};
/**
 * Extract facility names
 */
/**
 * Parse facility information from address
 */
declare function parseFacility(text: string): {
    facility: string | undefined;
    remaining: string;
};
/**
 * Parse parenthetical information
 */
declare function parseParenthetical(text: string): {
    secondary: string | undefined;
    remaining: string;
};
/**
 * Extract street number (including fractional)
 */
declare function parseStreetNumber(text: string): {
    number: string | undefined;
    remaining: string;
};
/**
 * Detect country from address components
 */
declare function detectCountry(address: ParsedAddress): 'US' | 'CA' | undefined;

/**
 * address-plus - A modern, TypeScript-first address parser and normalizer
 * API-compatible with parse-address for seamless upgrades
 */

/**
 * Default export for API compatibility with parse-address
 * Usage: import parser from 'address-plus';
 *        parser.parseLocation('123 Main St, New York, NY 10001')
 *
 * Or: import { parseLocation } from 'address-plus';
 */
declare const parser: AddressParser;

export { type AddressParser, CANADIAN_POSTAL_CODE_PATTERN, CANADIAN_POSTAL_LIBERAL_PATTERN, CA_PROVINCES, CA_PROVINCE_ALTERNATIVES, CA_PROVINCE_NAMES, CA_PROVINCE_NAMES_EN, CA_PROVINCE_NAMES_FR, CA_REGIONS, CA_STREET_TYPES, DIRECTIONAL_MAP, FACILITY_DELIMITER_PATTERN, FACILITY_PATTERNS, PARENTHETICAL_PATTERN, type ParseOptions, type ParsedAddress, type ParsedIntersection, type Region, SECONDARY_UNIT_PATTERN, SECONDARY_UNIT_TYPES, STREET_TYPE_PROPER_CASE, UNIT_TYPE_KEYWORDS, UNIT_TYPE_NUMBER_PATTERN, US_REGIONS, US_STATES, US_STATE_ALTERNATIVES, US_STATE_NAMES, US_STREET_TYPES, WRITTEN_NUMBERS, ZIP_CODE_PATTERN, buildRegexFromDict, parser as default, detectCountry, normalizeRegion, normalizeText, parseAddress, parseDirectional, parseFacility, parseInformalAddress, parseIntersection, parseLocation, parseParenthetical, parsePostalCode, parseSecondaryUnit, parseStateProvince, parseStreetNumber, parseStreetType };
