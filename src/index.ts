// address-plus - A modern, TypeScript-first address parser and normalizer
// API-compatible with parse-address for seamless upgrades

import type { AddressParser } from "./types";
import { parseAddress, parseInformalAddress, parseIntersection, parseLocation } from "./parser";

// Default export for API compatibility with parse-address
// Usage: import parser from 'address-plus';
//        parser.parseLocation('123 Main St, New York, NY 10001')
// 
// Or: import { parseLocation } from 'address-plus';
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

// Validation functions
export {
  validateAddress,
  isValidAddress,
  getValidationErrors,
} from "./validation/comprehensive-validation";

// Formatting functions
export {
  formatAddress,
  formatUSPS,
  formatCanadaPost,
  getAddressAbbreviations,
} from "./formatting/address-formatting";

// Comparison functions
export {
  compareAddresses,
  isSameAddress,
  getAddressSimilarity,
} from "./comparison/address-comparison";

// Clean address functions
export {
  cleanAddress,
  cleanAddressDetailed,
} from "./utilities/clean-address";

// Export batch processing functions
export { 
  parseLocations,
  parseAddresses,
  parseInformalAddresses, 
  parseIntersections,
  parseLocationsBatch,
  parseAddressesBatch,
  parseInformalAddressesBatch,
  parseIntersectionsBatch
} from "./batch-parser";

// Export data and utilities for advanced usage
export * from "./constants";
export * from "./utils";

export default parser;