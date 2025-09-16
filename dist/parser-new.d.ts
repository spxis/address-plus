/**
 * Improved address parser implementation
 */
import { ParsedAddress, ParseOptions } from './types';
/**
 * Parse a location string into address components
 */
export declare function parseLocationNew(address: string, options?: ParseOptions): ParsedAddress | null;
