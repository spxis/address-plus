/**
 * Tests for strict mode functionality - Core Working Features
 * All test cases loaded from JSON files as per project standards
 */

import { describe, expect, test } from "vitest";

import { parseLocation } from "../parser";

// Import working test data
import workingTestData from "../../test-data/us/strict-mode-working.json";

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
    test("should default to permissive mode when strict is not specified", () => {
      const address = "123 Main St, New York NY 12345";
      const defaultResult = parseLocation(address);
      const explicitPermissive = parseLocation(address, { strict: false });

      expect(defaultResult?.zip).toBe("12345");
      expect(defaultResult?.zipValid).toBe(true);
      expect(defaultResult).toEqual(explicitPermissive);
    });

    test("should include zipValid field in permissive mode", () => {
      const validResult = parseLocation("123 Main St, New York NY 12345", { strict: false });
      
      expect(validResult?.zipValid).toBe(true);
    });
  });

  describe("Postal Code Normalization", () => {
    test("should normalize Canadian postal codes to XXX XXX format", () => {
      const tests = [
        { input: "123 Main St, Toronto ON M5V1A1", expected: "M5V 1A1" },
        { input: "123 Main St, Toronto ON M5V-1A1", expected: "M5V 1A1" },
        { input: "123 Main St, Toronto ON M5V 1A1", expected: "M5V 1A1" }
      ];

      tests.forEach(({ input, expected }) => {
        const result = parseLocation(input, { strict: false });
        expect(result?.zip).toBe(expected);
        expect(result?.zipValid).toBe(true);
      });
    });

    test("should handle flexible ZIP+4 spacing", () => {
      const tests = [
        { input: "123 Main St, New York NY 12345-6789", expected: { zip: "12345", plus4: "6789" } },
        { input: "123 Main St, New York NY 12345 6789", expected: { zip: "12345", plus4: "6789" } },
        { input: "123 Main St, New York NY 123456789", expected: { zip: "12345", plus4: "6789" } }
      ];

      tests.forEach(({ input, expected }) => {
        const result = parseLocation(input, { strict: false });
        expect(result?.zip).toBe(expected.zip);
        expect(result?.plus4).toBe(expected.plus4);
        expect(result?.zipValid).toBe(true);
      });
    });
  });
});