// Types for address validation results and confidence scoring

interface ValidationError {
  field: string; // Field name where error occurred
  code: string; // Error code identifier
  message: string; // Human-readable error message
  severity: "error" | "warning" | "info"; // Severity level of the validation issue
}

interface AddressValidationResult {
  isValid: boolean; // Whether the address passed validation
  confidence: number; // 0-1 score indicating parsing confidence
  completeness: number; // 0-1 score indicating how complete the address is
  errors: ValidationError[]; // List of validation errors found
  warnings: ValidationError[]; // List of validation warnings
  suggestions: string[]; // Suggestions for improving the address
  parsedAddress: import("./parsed-address").ParsedAddress | null; // Parsed address result or null if parsing failed
}

interface ValidationOptions {
  requireStreetNumber?: boolean; // Whether street number is required
  requireStreetName?: boolean; // Whether street name is required
  requireCity?: boolean; // Whether city is required
  requireState?: boolean; // Whether state/province is required
  requirePostalCode?: boolean; // Whether postal code is required
  allowPOBox?: boolean; // Whether PO Box addresses are allowed
  allowRuralRoute?: boolean; // Whether rural route addresses are allowed
  allowGeneralDelivery?: boolean; // Whether general delivery addresses are allowed
  strictPostalValidation?: boolean; // Whether to use strict postal code validation
  country?: "CA" | "US" | "auto"; // Country context for validation rules
}

export type { AddressValidationResult, ValidationError, ValidationOptions };
