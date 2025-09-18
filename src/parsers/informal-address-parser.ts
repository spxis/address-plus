import { COUNTRIES } from "../constants";
import { buildPatterns } from "../patterns/pattern-builder";
import type { ParsedAddress, ParseOptions } from "../types";
import { hasValidAddressComponents, setValidatedPostalCode } from "../validation/address-validation";

/**
 * Parse informal addresses as a fallback when standard parsing fails
 */
export function parseInformalAddress(address: string, options: ParseOptions = {}): ParsedAddress | null {
  const patterns = buildPatterns();
  
  // Check if input contains valid address components
  if (!hasValidAddressComponents(address)) {
    return null;
  }
  
  // Simple fallback pattern
  const parts = address.split(/\s*,\s*/);
  if (parts.length === 0) return null;

  const result: ParsedAddress = {};
  
  // Try to extract number from first part
  const firstPart = parts[0];
  const numberMatch = firstPart.match(new RegExp(`^\\s*${patterns.number}\\s+(.+)$`));
  if (numberMatch) {
    result.number = numberMatch[1];
    result.street = numberMatch[2];
  } else {
    result.street = firstPart;
  }

  // Extract ZIP from last part
  if (parts.length > 1) {
    const lastPart = parts[parts.length - 1];
    const zipMatch = lastPart.match(new RegExp(patterns.zip));
    if (zipMatch) {
      setValidatedPostalCode(result, zipMatch[1], options);
      result.country = COUNTRIES.UNITED_STATES;
    }
  }

  return result;
}