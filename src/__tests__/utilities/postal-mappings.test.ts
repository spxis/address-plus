/**
 * Postal Code to Province Mapping Tests
 */

import { describe, expect, it } from "vitest";

import { getProvinceFromPostalCode } from "../../data/postal-code-provinces.js";
import { loadPostalCodeProvinceTests } from "../utils/test-data-loader.js";

describe("Postal Code to Province Mapping", () => {
  const testData = loadPostalCodeProvinceTests();

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