// Postal Code to Province Mapping Tests
// Tests Canadian postal code to province detection functionality
// Based on Canada Post guidelines for postal code prefixes

import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

import { getProvinceFromPostalCode } from "../../data/postal-code-provinces.js";

// Test case interface for postal code mapping
interface PostalCodeTestCase {
  input: string; // Input postal code in various formats
  expected: string | null; // Expected province code or null
  description: string; // Test case description
}

// Test data structure for postal code province mapping
interface PostalCodeTestData {
  name: string; // Test suite name
  description: string; // Test suite description
  provinceMapping: PostalCodeTestCase[]; // Basic province mapping tests
  formatVariations: PostalCodeTestCase[]; // Format variation tests
  invalidCases: PostalCodeTestCase[]; // Invalid input tests
}

// Helper function to load JSON test data with proper typing
function loadTestData(filePath: string): PostalCodeTestData {
  const fullPath: string = join(__dirname, filePath);
  const rawData: string = readFileSync(fullPath, "utf-8");
  
  return JSON.parse(rawData) as PostalCodeTestData;
}

describe("Postal Code to Province Mapping", () => {
  const testData: PostalCodeTestData = loadTestData("../../../test-data/canada/postal-code-provinces.json");

  describe(testData.name, () => {
    describe("Province Mapping", () => {
      testData.provinceMapping.forEach((testCase: PostalCodeTestCase) => {
        it(`should map ${testCase.input} to ${testCase.expected}`, () => {
          const result: string | null = getProvinceFromPostalCode(testCase.input);
          expect(result).toBe(testCase.expected);
        });
      });
    });

    describe("Format Variations", () => {
      testData.formatVariations.forEach((testCase: PostalCodeTestCase) => {
        it(`should handle ${testCase.input} format`, () => {
          const result: string | null = getProvinceFromPostalCode(testCase.input);
          expect(result).toBe(testCase.expected);
        });
      });
    });

    describe("Invalid Cases", () => {
      testData.invalidCases.forEach((testCase: PostalCodeTestCase) => {
        it(`should return null for ${testCase.input}`, () => {
          const result: string | null = getProvinceFromPostalCode(testCase.input);
          expect(result).toBe(testCase.expected);
        });
      });
    });
  });
});