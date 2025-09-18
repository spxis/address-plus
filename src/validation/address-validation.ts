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
  // Always validate to determine if code is valid
  const validation = validatePostalCode(zipCode);
  
  // In strict mode, only set ZIP if it's valid, but always set zipValid for ParsedAddress
  if (options.strict && !validation.isValid) {
    // For ParsedAddress, always set zipValid to indicate the code was invalid
    if ('number' in result) { // ParsedAddress has number, ParsedIntersection doesn't
      (result as ParsedAddress).zipValid = false;
    }
    if (options.validatePostalCode && validation.type && ('number' in result)) {
      (result as ParsedAddress).postalType = validation.type;
    }
    return; // Don't set zip field for invalid codes in strict mode
  }
  
  // Set the ZIP code (either valid in strict mode, or any code in permissive mode)
  result.zip = validation.isValid && validation.formatted ? validation.formatted : zipCode;
  
  // Set validation info if requested
  if (options.validatePostalCode) {
    if ('number' in result) { // ParsedAddress
      (result as ParsedAddress).zipValid = validation.isValid;
    }
    if (validation.type && ('number' in result)) {
      (result as ParsedAddress).postalType = validation.type;
    }
  } else if (!options.strict) {
    // In permissive mode without validatePostalCode, still set zipValid for developer awareness
    if ('number' in result) { // ParsedAddress
      (result as ParsedAddress).zipValid = validation.isValid;
    }
  } else if (options.strict) {
    // In strict mode without validatePostalCode, still set zipValid for developer awareness
    if ('number' in result) { // ParsedAddress
      (result as ParsedAddress).zipValid = validation.isValid;
    }
  }
}