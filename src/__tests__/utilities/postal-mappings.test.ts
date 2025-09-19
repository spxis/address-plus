/**
 * Postal Code to Province Mapping Tests
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

import { getProvinceFromPostalCode } from "../../data/postal-code-provinces.js";

// Helper function to load JSON test data
function loadTestData(filePath: string): any {
  const fullPath = join(__dirname, filePath);
  const rawData = readFileSync(fullPath, "utf-8");
  return JSON.parse(rawData);
}

describe("Postal Code to Province Mapping", () => {
  const testData = loadTestData("../../../test-data/canada/postal-code-provinces.json");

  describe(testData.name, () => {
    describe("Province Mapping", () => {
      testData.provinceMapping.forEach((testCase) => {
        it(`should map ${testCase.input} to ${testCase.expected}`, () => {
          const result = getProvinceFromPostalCode(testCase.input);
          expect(result).toBe(testCase.expected);
        });
      });
    });

    describe("Format Variations", () => {
      testData.formatVariations.forEach((testCase) => {
        it(`should handle ${testCase.input} format`, () => {
          const result = getProvinceFromPostalCode(testCase.input);
          expect(result).toBe(testCase.expected);
        });
      });
    });

    describe("Invalid Cases", () => {
      testData.invalidCases.forEach((testCase) => {
        it(`should return null for ${testCase.input}`, () => {
          const result = getProvinceFromPostalCode(testCase.input);
          expect(result).toBe(testCase.expected);
        });
      });
    });
  });
});