/**
 * Tests for strict mode functionality - Core Working Features
 * All test cases loaded from JSON files as per project standards
 */

import { describe, expect, test } from "vitest";

import { parseLocation } from "../parser";

// Import working test data
import workingTestData from "../../test-data/us/strict-mode-working.json";
import comprehensiveTestData from "../../test-data/us/strict-mode-comprehensive.json";

describe("Strict Mode - Core Working Functionality", () => {
  describe("ZIP/Postal Code Validation", () => {
    workingTestData.forEach((testCase: any) => {
      test(`${testCase.description}`, () => {
        // Test strict mode if specified
        if (testCase.expected.strict) {
          const strictResult = parseLocation(testCase.address, { strict: true });
          
          if (testCase.expected.strict.zip === null) {
            expect(strictResult?.zip).toBeUndefined();
            expect(strictResult?.zipValid).toBe(false);
          } else {
            expect(strictResult?.zip).toBe(testCase.expected.strict.zip);
            expect(strictResult?.zipValid).toBe(testCase.expected.strict.zipValid);
          }
        }
        
        // Test both modes for basic cases
        if (!testCase.expected.strict) {
          const strictResult = parseLocation(testCase.address, { strict: true });
          const permissiveResult = parseLocation(testCase.address, { strict: false });
          
          expect(strictResult?.zip).toBe(testCase.expected.zip);
          expect(strictResult?.zipValid).toBe(testCase.expected.zipValid);
          expect(permissiveResult?.zip).toBe(testCase.expected.zip);
          expect(permissiveResult?.zipValid).toBe(testCase.expected.zipValid);
          
          if (testCase.expected.plus4) {
            expect(strictResult?.plus4).toBe(testCase.expected.plus4);
            expect(permissiveResult?.plus4).toBe(testCase.expected.plus4);
          }
        }
      });
    });
  });

  describe("Default Behavior", () => {
    comprehensiveTestData.defaultBehavior.forEach((testCase: any) => {
      test(testCase.description, () => {
        const defaultResult = parseLocation(testCase.input);
        const explicitPermissive = parseLocation(testCase.input, { strict: false });

        // Check expected fields
        Object.keys(testCase.expected).forEach(key => {
          expect((defaultResult as any)?.[key]).toBe(testCase.expected[key]);
        });
        
        // Ensure default equals explicit permissive
        expect(defaultResult).toEqual(explicitPermissive);
      });
    });
  });

  describe("Postal Code Normalization", () => {
    comprehensiveTestData.postalCodeNormalization.forEach((testGroup: any) => {
      describe(testGroup.description, () => {
        testGroup.testCases.forEach((testCase: any) => {
          test(testCase.description, () => {
            const result = parseLocation(testCase.input, { strict: false });
            
            Object.keys(testCase.expected).forEach(key => {
              expect((result as any)?.[key]).toBe(testCase.expected[key]);
            });
          });
        });
      });
    });
  });

  describe("ZIP+4 Flexible Spacing", () => {
    comprehensiveTestData.zipPlusFourSpacing.forEach((testGroup: any) => {
      describe(testGroup.description, () => {
        testGroup.testCases.forEach((testCase: any) => {
          test(testCase.description, () => {
            const result = parseLocation(testCase.input, { strict: false });
            
            Object.keys(testCase.expected).forEach(key => {
              expect((result as any)?.[key]).toBe(testCase.expected[key]);
            });
          });
        });
      });
    });
  });
});