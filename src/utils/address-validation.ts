// Address validation functions

import { validatePostalCode, VALIDATION_PATTERNS } from "../constants";
import { buildPatterns } from "../patterns/pattern-builder";
import type { ParsedAddress, ParsedIntersection, ParseOptions } from "../types";

// Check if input contains recognizable address components
function hasValidAddressComponents(address: string): boolean {
  const patterns = buildPatterns();

  // Basic validation
  if (!VALIDATION_PATTERNS.HAS_LETTERS.test(address) || address.trim().length < 3) {
    return false;
  }

  // Reject if mostly special characters
  const alphanumericCount = (address.match(VALIDATION_PATTERNS.ALPHANUMERIC) || []).length;
  if (alphanumericCount < address.length * 0.3) {
    return false;
  }

  // Check for address-like patterns
  const hasNumber = VALIDATION_PATTERNS.HAS_DIGITS.test(address);
  const hasStreetType = new RegExp(`\\b(${patterns.streetType})\\b`, "i").test(address);
  const hasDirectional = new RegExp(`\\b(${patterns.directional.slice(1, -1)})\\b`, "i").test(address);
  const hasState = new RegExp(`\\b(${patterns.state.slice(2, -2)})\\b`, "i").test(address);
  const hasZip = new RegExp(patterns.zip, "i").test(address);
  const hasCommaStructure = address.includes(",");
  const isIntersection = new RegExp(patterns.intersection, "i").test(address);
  const hasPoBox = new RegExp(patterns.poBox, "i").test(address);

  // Valid if has any address indicators
  if (
    hasNumber ||
    hasStreetType ||
    hasDirectional ||
    hasState ||
    hasZip ||
    hasCommaStructure ||
    isIntersection ||
    hasPoBox
  ) {
    return true;
  }

  // Be lenient with longer phrases (might be facility names)
  if (address.trim().split(VALIDATION_PATTERNS.WHITESPACE_SPLIT).length >= 3) {
    return true;
  }

  return false;
}

// Validate and set postal code if validation is enabled
function setValidatedPostalCode(
  result: ParsedAddress | ParsedIntersection,
  zipCode: string,
  options: ParseOptions,
): void {
  const validation = validatePostalCode(zipCode);

  // In strict mode, only set ZIP if valid
  if (options.strict && !validation.isValid) {
    if ("number" in result) {
      (result as ParsedAddress).zipValid = false;
    }
    if (options.validatePostalCode && validation.type && "number" in result) {
      (result as ParsedAddress).postalType = validation.type;
    }
    return;
  }

  // Set the ZIP code
  result.zip = validation.isValid && validation.formatted ? validation.formatted : zipCode;

  // Set validation info if requested
  if (options.validatePostalCode) {
    if ("number" in result) {
      (result as ParsedAddress).zipValid = validation.isValid;
    }
    if (validation.type && "number" in result) {
      (result as ParsedAddress).postalType = validation.type;
    }
  } else if ("number" in result) {
    // Always set zipValid for developer awareness
    (result as ParsedAddress).zipValid = validation.isValid;
  }
}

export { hasValidAddressComponents, setValidatedPostalCode };
