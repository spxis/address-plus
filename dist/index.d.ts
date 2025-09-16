/**
 * Types for address parsing results
 */
interface ParsedAddress {
    /** Street number */
    number?: string;
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
    zipext?: string;
    /** Apartment, unit, or suite number */
    unit?: string;
    /** Building or facility name */
    facility?: string;
    /** Country (US or CA) */
    country?: 'US' | 'CA';
    /** Secondary address info (floor, apt, etc.) */
    secondary?: string;
    /** Address line as parsed for secondary info */
    sec_unit_type?: string;
    /** Secondary unit number */
    sec_unit_num?: string;
}
/**
 * Configuration options for address parsing
 */
interface ParseOptions {
    /** Country to optimize parsing for */
    country?: 'US' | 'CA' | 'auto';
    /** Whether to normalize street types and directions */
    normalize?: boolean;
    /** Whether to validate postal/ZIP codes */
    validatePostalCode?: boolean;
    /** Language preference for bilingual parsing (Canada) */
    language?: 'en' | 'fr' | 'auto';
    /** Whether to extract facility names */
    extractFacilities?: boolean;
    /** Whether to parse parenthetical information */
    parseParenthetical?: boolean;
}
/**
 * Result from intersection parsing
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
    /** Country */
    country?: 'US' | 'CA';
}
/**
 * Address parser interface for API compatibility
 */
interface AddressParser {
    parseLocation(address: string, options?: ParseOptions): ParsedAddress | null;
    parseIntersection(address: string, options?: ParseOptions): ParsedIntersection | null;
    parseInformalAddress(address: string, options?: ParseOptions): ParsedAddress | null;
    parseAddress(address: string, options?: ParseOptions): ParsedAddress | null;
}

/**
 * Main address parser implementation
 */

/**
 * Parse a location string into address components
 */
declare function parseLocation(address: string, options?: ParseOptions): ParsedAddress | null;
/**
 * Parse an intersection string
 */
declare function parseIntersection(address: string, options?: ParseOptions): ParsedIntersection | null;
/**
 * Parse an informal address (more lenient parsing)
 */
declare function parseInformalAddress(address: string, options?: ParseOptions): ParsedAddress | null;
/**
 * Main parse function (alias for parseLocation for API compatibility)
 */
declare function parseAddress(address: string, options?: ParseOptions): ParsedAddress | null;

/**
 * Address parsing patterns and data for US and Canada
 */
declare const DIRECTIONAL_MAP: Record<string, string>;
declare const US_STREET_TYPES: Record<string, string>;
declare const CA_STREET_TYPES: Record<string, string>;
declare const US_STATES: Record<string, string>;
declare const CA_PROVINCES: Record<string, string>;
declare const SECONDARY_UNIT_TYPES: Record<string, string>;
declare const ZIP_CODE_PATTERN: RegExp;
declare const CANADIAN_POSTAL_CODE_PATTERN: RegExp;
declare const FACILITY_PATTERNS: RegExp[];

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
 * Extract ZIP or postal code
 */
declare function parsePostalCode(text: string): {
    zip: string | undefined;
    zipext: string | undefined;
    remaining: string;
    detectedCountry?: 'US' | 'CA';
};
/**
 * Extract secondary unit information
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

export { type AddressParser, CANADIAN_POSTAL_CODE_PATTERN, CA_PROVINCES, CA_STREET_TYPES, DIRECTIONAL_MAP, FACILITY_PATTERNS, type ParseOptions, type ParsedAddress, type ParsedIntersection, SECONDARY_UNIT_TYPES, US_STATES, US_STREET_TYPES, ZIP_CODE_PATTERN, buildRegexFromDict, parser as default, detectCountry, normalizeText, parseAddress, parseDirectional, parseFacility, parseInformalAddress, parseIntersection, parseLocation, parseParenthetical, parsePostalCode, parseSecondaryUnit, parseStateProvince, parseStreetNumber, parseStreetType };
