/**
 * address-plus - A modern, TypeScript-first address parser and normalizer
 * API-compatible with parse-address for seamless upgrades
 */

import type { AddressParser } from "./types";
import { parseAddress, parseInformalAddress, parseIntersection, parseLocation } from "./parser";

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

// Export all types
export type * from "./types";

// Export parser functions
export { parseAddress, parseInformalAddress, parseIntersection, parseLocation };

// Export data and utilities for advanced usage
export * from "./data";
export * from "./utils";

export default parser;