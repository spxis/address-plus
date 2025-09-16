/**
 * Core parsing utilities and regex patterns
 */
import { ParsedAddress } from './types';
/**
 * Normalize text for consistent parsing
 */
export declare function normalizeText(text: string): string;
/**
 * Build regex patterns from dictionary
 */
export declare function buildRegexFromDict(dict: Record<string, string>, capture?: boolean): RegExp;
/**
 * Extract and normalize directional
 */
export declare function parseDirectional(text: string): {
    direction: string | undefined;
    remaining: string;
};
/**
 * Extract and normalize street type
 */
export declare function parseStreetType(text: string, country?: 'US' | 'CA'): {
    type: string | undefined;
    remaining: string;
};
/**
 * Extract state or province
 */
export declare function parseStateProvince(text: string, country?: 'US' | 'CA'): {
    state: string | undefined;
    remaining: string;
    detectedCountry?: 'US' | 'CA';
};
/**
 * Extract ZIP or postal code
 */
export declare function parsePostalCode(text: string): {
    zip: string | undefined;
    zipext: string | undefined;
    remaining: string;
    detectedCountry?: 'US' | 'CA';
};
/**
 * Extract secondary unit information
 */
export declare function parseSecondaryUnit(text: string): {
    unit: string | undefined;
    sec_unit_type: string | undefined;
    sec_unit_num: string | undefined;
    remaining: string;
};
/**
 * Extract facility names
 */
export declare function parseFacility(text: string): {
    facility: string | undefined;
    remaining: string;
};
/**
 * Parse parenthetical information
 */
export declare function parseParenthetical(text: string): {
    secondary: string | undefined;
    remaining: string;
};
/**
 * Extract street number (including fractional)
 */
export declare function parseStreetNumber(text: string): {
    number: string | undefined;
    remaining: string;
};
/**
 * Detect country from address components
 */
export declare function detectCountry(address: ParsedAddress): 'US' | 'CA' | undefined;
