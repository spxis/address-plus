/**
 * Address validation functions
 * Pure validation logic with no parsing dependencies
 */

import type { ParsedAddress, ParsedIntersection, ParseOptions } from "../types";
import { VALIDATION_PATTERNS } from "../constants";
import { validatePostalCode } from "../validation";
import { buildPatterns } from "../patterns/pattern-builder";

/**
 * Check if input contains recognizable address components
 */
export function hasValidAddressComponents(address: string): boolean {
  const patterns = buildPatterns();
  
  // Basic validation - must have letters and be reasonable length
  if (!VALIDATION_PATTERNS.HAS_LETTERS.test(address) || address.trim().length < 3) {
    return false;
  }
  
  // If it's mostly special characters, reject
  const alphanumericCount = (address.match(VALIDATION_PATTERNS.ALPHANUMERIC) || []).length;
  if (alphanumericCount < address.length * 0.3) {
    return false;
  }
  
  // Check for address-like patterns
  const hasNumber = VALIDATION_PATTERNS.HAS_DIGITS.test(address);
  const hasStreetType = new RegExp(`\\b(${patterns.streetType})\\b`, 'i').test(address);
  const hasDirectional = new RegExp(`\\b(${patterns.directional.slice(1, -1)})\\b`, 'i').test(address);
  const hasState = new RegExp(`\\b(${patterns.state.slice(2, -2)})\\b`, 'i').test(address);
  const hasZip = new RegExp(patterns.zip, 'i').test(address);
  const hasCommaStructure = address.includes(',');
  const isIntersection = new RegExp(patterns.intersection, 'i').test(address);
  const hasPoBox = new RegExp(patterns.poBox, 'i').test(address);
  
  // Valid if it has:
  // 1. Numbers (potential house number), OR
  // 2. Street type words (St, Ave, etc.), OR  
  // 3. Directional words (N, South, etc.), OR
  // 4. State abbreviations, OR
  // 5. ZIP codes, OR
  // 6. Comma structure (city, state format), OR
  // 7. Intersection indicators, OR
  // 8. PO Box indicators
  if (hasNumber || hasStreetType || hasDirectional || hasState || hasZip || hasCommaStructure || isIntersection || hasPoBox) {
    return true;
  }
  
  // For longer phrases, be more lenient (might be facility names)
  if (address.trim().split(VALIDATION_PATTERNS.WHITESPACE_SPLIT).length >= 3) {
    return true;
  }
  
  return false;
}

/**
 * Validate and set postal code if validation is enabled
 */
export function setValidatedPostalCode(result: ParsedAddress | ParsedIntersection, zipCode: string, options: ParseOptions): void {
  result.zip = zipCode;
  
  if (options.validatePostalCode) {
    const validation = validatePostalCode(zipCode);
    result.postalValid = validation.isValid;
    if (validation.type) {
      result.postalType = validation.type;
    }
    if (validation.isValid && validation.formatted) {
      result.zip = validation.formatted;
    }
  }
}