import type { AddressParser, ParsedAddress, ParsedIntersection, ParseOptions } from "../types";
import { parseInformalAddress } from "./informal-address-parser";
import { parseIntersection } from "./intersection-parser";

// Forward declaration - parseLocation will be injected
let parseLocationImpl: (address: string, options?: ParseOptions) => ParsedAddress | null;

/**
 * Set the parseLocation implementation (used to break circular dependency)
 */
export function setParseLocationImpl(impl: (address: string, options?: ParseOptions) => ParsedAddress | null) {
  parseLocationImpl = impl;
}

/**
 * Parse address (compatibility alias)
 */
export function parseAddress(address: string, options: ParseOptions = {}): ParsedAddress | null {
  if (!parseLocationImpl) {
    throw new Error("parseLocation implementation not set");
  }
  return parseLocationImpl(address, options);
}

/**
 * Create address parser instance
 */
export function createParser(defaultOptions: ParseOptions = {}): AddressParser {
  return {
    parseAddress: (address: string, options?: ParseOptions) => 
      parseAddress(address, { ...defaultOptions, ...options }),
    parseInformalAddress: (address: string, options?: ParseOptions) => 
      parseInformalAddress(address, { ...defaultOptions, ...options }),
    parseIntersection: (address: string, options?: ParseOptions) => 
      parseIntersection(address, { ...defaultOptions, ...options }),
    parseLocation: (address: string, options?: ParseOptions) => 
      parseLocationImpl(address, { ...defaultOptions, ...options }),
  };
}

// Export default parser instance
export const parser = createParser();