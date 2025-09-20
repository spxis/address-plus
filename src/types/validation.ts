// Types for address validation results and confidence scoring

interface ValidationError {
  field: string;
  code: string;
  message: string;
  severity: "error" | "warning" | "info";
}

interface AddressValidationResult {
  isValid: boolean;
  confidence: number; // 0-1 score indicating parsing confidence
  completeness: number; // 0-1 score indicating how complete the address is
  errors: ValidationError[];
  warnings: ValidationError[];
  suggestions: string[];
  parsedAddress: import("./parsed-address").ParsedAddress | null;
}

interface ValidationOptions {
  requireStreetNumber?: boolean;
  requireStreetName?: boolean;
  requireCity?: boolean;
  requireState?: boolean;
  requirePostalCode?: boolean;
  allowPOBox?: boolean;
  allowRuralRoute?: boolean;
  allowGeneralDelivery?: boolean;
  strictPostalValidation?: boolean;
  country?: "CA" | "US" | "auto";
}

export type { ValidationError, AddressValidationResult, ValidationOptions };