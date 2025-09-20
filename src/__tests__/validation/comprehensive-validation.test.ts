import { describe, expect, it } from "vitest";
import { 
  validateAddress, 
  isValidAddress, 
  getValidationErrors 
} from "../../validation/comprehensive-validation";
import testData from "../../../test-data/validation/comprehensive-validation.json";

describe("Address Validation API", () => {
  describe("validateAddress", () => {
    testData.validateAddress.forEach(({ name, description, input, expected, options }) => {
      it(`should ${name}`, () => {
        const result = validateAddress(input, options);
        
        // Handle different types of expected results
        if (expected.isValid !== undefined) {
          expect(result.isValid).toBe(expected.isValid);
        }
        
        if (expected.confidenceGreaterThan !== undefined) {
          expect(result.confidence).toBeGreaterThan(expected.confidenceGreaterThan);
        } else if (typeof expected.confidence === "number") {
          expect(result.confidence).toBe(expected.confidence);
        }
        
        if (expected.completenessGreaterThan !== undefined) {
          expect(result.completeness).toBeGreaterThan(expected.completenessGreaterThan);
        } else if (expected.completenessLessThan !== undefined) {
          expect(result.completeness).toBeLessThan(expected.completenessLessThan);
        } else if (typeof expected.completeness === "number") {
          expect(result.completeness).toBe(expected.completeness);
        }
        
        if (expected.errorsLength !== undefined) {
          expect(result.errors).toHaveLength(expected.errorsLength);
        }
        
        if (expected.errorsLengthGreaterThan !== undefined) {
          expect(result.errors.length).toBeGreaterThan(expected.errorsLengthGreaterThan);
        }
        
        if (expected.warningsLengthGreaterThan !== undefined) {
          expect(result.warnings.length).toBeGreaterThan(expected.warningsLengthGreaterThan);
        }
        
        if (expected.parsedAddress) {
          expect(result.parsedAddress).toBeDefined();
          Object.entries(expected.parsedAddress).forEach(([key, value]) => {
            expect((result.parsedAddress as any)?.[key]).toBe(value);
          });
        }
        
        if (expected.parsedAddressNull) {
          expect(result.parsedAddress).toBeNull();
        }
        
        if (expected.errorCodes) {
          expected.errorCodes.forEach(code => {
            expect(result.errors.some(e => e.code === code)).toBe(true);
          });
        }
        
        if (expected.firstErrorCode) {
          expect(result.errors[0].code).toBe(expected.firstErrorCode);
        }
        
        if (expected.suggestionsLengthGreaterThan !== undefined) {
          expect(result.suggestions.length).toBeGreaterThan(expected.suggestionsLengthGreaterThan);
        }
        
        if (expected.suggestionContains) {
          expect(result.suggestions.some(s => s.includes(expected.suggestionContains))).toBe(true);
        }
      });
    });
  });

  describe("isValidAddress", () => {
    testData.isValidAddress.forEach(({ name, description, input, expected, tests }) => {
      if (Array.isArray(input) && Array.isArray(expected)) {
        it(`should ${name}`, () => {
          input.forEach((addr, index) => {
            expect(isValidAddress(addr)).toBe(expected[index]);
          });
        });
      } else if (tests) {
        it(`should ${name}`, () => {
          tests.forEach(({ input: testInput, options, expected: testExpected }) => {
            expect(isValidAddress(testInput, options)).toBe(testExpected);
          });
        });
      }
    });
  });

  describe("getValidationErrors", () => {
    testData.getValidationErrors.forEach(({ name, description, input, expected, options }) => {
      it(`should ${name}`, () => {
        const errors = getValidationErrors(input, options);
        
        if (expected.errorsLengthGreaterThan !== undefined) {
          expect(errors.length).toBeGreaterThan(expected.errorsLengthGreaterThan);
        }
        
        if (expected.allSeverityTypes) {
          expect(errors.every(e => expected.allSeverityTypes.includes(e.severity))).toBe(true);
        }
        
        if (expected.errorSeverityCount !== undefined) {
          expect(errors.filter(e => e.severity === "error")).toHaveLength(expected.errorSeverityCount);
        }
      });
    });
  });

  describe("confidence scoring", () => {
    testData.confidenceScoring.forEach(({ name, description, inputs, expected }) => {
      it(`should ${name}`, () => {
        if (expected.confidenceComparison === "complete > incomplete" && inputs.complete && inputs.incomplete) {
          const complete = validateAddress(inputs.complete);
          const incomplete = validateAddress(inputs.incomplete);
          expect(complete.confidence).toBeGreaterThan(incomplete.confidence);
        }
        
        if (expected.completenessComparison === "withZip > withoutZip" && inputs.withZip && inputs.withoutZip) {
          const withZip = validateAddress(inputs.withZip);
          const withoutZip = validateAddress(inputs.withoutZip);
          expect(withZip.completeness).toBeGreaterThan(withoutZip.completeness);
        }
      });
    });
  });
});