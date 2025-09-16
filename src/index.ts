/**
 * address-plus - A modern, TypeScript-first address parser and normalizer
 * API-compatible with parse-address for seamless upgrades
 */

import type { AddressParser } from './types.js';
import { parseLocation, parseIntersection, parseInformalAddress, parseAddress } from './parser.js';

// Export all types
export type * from './types.js';

// Export parser functions
export { parseLocation, parseIntersection, parseInformalAddress, parseAddress };

// Export data and utilities for advanced usage
export * from './data.js';
export * from './utils.js';

/**
 * Default export for API compatibility with parse-address
 * Usage: import parser from 'address-plus';
 *        parser.parseLocation('123 Main St, New York, NY 10001')
 * 
 * Or: import { parseLocation } from 'address-plus';
 */
const parser: AddressParser = {
  parseLocation,
  parseIntersection, 
  parseInformalAddress,
  parseAddress,
};

export default parser;