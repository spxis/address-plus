import { describe, expect, it } from "vitest";
import { getProvinceFromPostalCode } from "../../constants/postal-code-provinces.js";
import testData from "../../../test-data/utilities/postal-mappings.json";

// Extract test cases from new structure
const allTests = testData.tests ? Object.values(testData.tests).flat() : [];
const provinceMappingTests = testData.tests?.provinceMapping || allTests;
const formatVariationsTests = testData.tests?.formatVariations || [];
const invalidCasesTests = testData.tests?.invalidCases || [];

describe("Postal Code to Province Mapping", () => {
  describe("Province Mapping", () => {
    provinceMappingTests.forEach(({ name, description, input, expected }: any) => {
      it(`should ${name}`, () => {
        const result = getProvinceFromPostalCode(input);
        expect(result).toBe(expected);
      });
    });
  });

  describe("Format Variations", () => {
    formatVariationsTests.forEach(({ name, description, input, expected }: any) => {
      it(`should handle ${name}`, () => {
        const result = getProvinceFromPostalCode(input);
        expect(result).toBe(expected);
      });
    });
  });

  describe("Invalid Cases", () => {
    invalidCasesTests.forEach(({ name, description, input, expected }: any) => {
      it(`should handle ${name}`, () => {
        const result = getProvinceFromPostalCode(input);
        expect(result).toBe(expected);
      });
    });
  });
});