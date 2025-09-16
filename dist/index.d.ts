/**
 * address-plus - A modern, TypeScript-first address parser and normalizer
 * API-compatible with parse-address for seamless upgrades
 */
import { AddressParser } from './types';
import { parseLocation, parseIntersection, parseInformalAddress, parseAddress } from './parser';
export * from './types';
export { parseLocation, parseIntersection, parseInformalAddress, parseAddress };
export * from './data';
export * from './utils';
/**
 * Default export for API compatibility with parse-address
 * Usage: const parser = require('address-plus');
 *        parser.parseLocation('123 Main St, New York, NY 10001')
 */
declare const parser: AddressParser;
export default parser;
