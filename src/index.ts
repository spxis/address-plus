// address-plus - A modern, TypeScript-first address parser and normalizer
// API-compatible with parse-address for seamless upgrades

import { parseAddress, parseInformalAddress, parseIntersection, parseLocation } from "./parser";
import type { AddressParser } from "./types";

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

// Export batch processing functions
export {
  parseAddresses,
  parseAddressesBatch,
  parseInformalAddresses,
  parseInformalAddressesBatch,
  parseIntersections,
  parseIntersectionsBatch,
  parseLocations,
  parseLocationsBatch,
} from "./batch-parser";

// Export parser functions
export { parseAddress, parseInformalAddress, parseIntersection, parseLocation };

// Export data and utilities for advanced usage
export * from "./constants";

// Export all types
export type * from "./types";

export * from "./utils";

// Comparison functions
export { compareAddresses, getAddressSimilarity, isSameAddress } from "./utils/address-comparison";

// Formatting functions
export { formatAddress, formatCanadaPost, formatUSPS, getAddressAbbreviations } from "./utils/address-formatting";

// Clean address functions
export { cleanAddress, cleanAddressDetailed } from "./utils/clean-address";
// Validation functions
export { getValidationErrors, isValidAddress, validateAddress } from "./utils/comprehensive-validation";

export default parser;
