// Address parser interface for API compatibility

import type { ParseOptions } from "./parse-options";
import type { ParsedAddress } from "./parsed-address";
import type { ParsedIntersection } from "./parsed-intersection";

// Main address parser interface providing all parsing methods
interface AddressParser {
  parseAddress(address: string, options?: ParseOptions): ParsedAddress | null;
  parseInformalAddress(address: string, options?: ParseOptions): ParsedAddress | null;
  parseIntersection(address: string, options?: ParseOptions): ParsedIntersection | null;
  parseLocation(address: string, options?: ParseOptions): ParsedAddress | null;
}

export type { AddressParser };
