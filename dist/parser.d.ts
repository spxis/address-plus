/**
 * Main address parser implementation
 */
import { ParsedAddress, ParsedIntersection, ParseOptions, AddressParser } from './types';
/**
 * Parse a location string into address components
 */
export declare function parseLocation(address: string, options?: ParseOptions): ParsedAddress | null;
/**
 * Parse an intersection string
 */
export declare function parseIntersection(address: string, options?: ParseOptions): ParsedIntersection | null;
/**
 * Parse an informal address (more lenient parsing)
 */
export declare function parseInformalAddress(address: string, options?: ParseOptions): ParsedAddress | null;
/**
 * Main parse function (alias for parseLocation for API compatibility)
 */
export declare function parseAddress(address: string, options?: ParseOptions): ParsedAddress | null;
/**
 * Create the parser object with all methods
 */
export declare const addressParser: AddressParser;
