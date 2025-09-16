/**
 * address-plus - A modern, TypeScript-first address parser and normalizer
 * API-compatible with parse-address for seamless upgrades
 */

import { ParsedAddress, ParsedIntersection, ParseOptions, AddressParser } from './types';
import { parseLocation, parseIntersection, parseInformalAddress, parseAddress } from './parser';

// Export all types
export * from './types';

// Export parser functions
export { parseLocation, parseIntersection, parseInformalAddress, parseAddress };

// Export data and utilities for advanced usage
export * from './data';
export * from './utils';

/**
 * Default export for API compatibility with parse-address
 * Usage: const parser = require('address-plus');
 *        parser.parseLocation('123 Main St, New York, NY 10001')
 */
const parser: AddressParser = {
  parseLocation,
  parseIntersection, 
  parseInformalAddress,
  parseAddress,
};

export default parser;

/**
 * For CommonJS compatibility with parse-address
 * This allows: const parser = require('address-plus');
 */
module.exports = parser;
module.exports.default = parser;
module.exports.parseLocation = parseLocation;
module.exports.parseIntersection = parseIntersection;
module.exports.parseInformalAddress = parseInformalAddress;
module.exports.parseAddress = parseAddress;