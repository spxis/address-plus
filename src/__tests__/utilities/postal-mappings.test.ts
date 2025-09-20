import { describe, expect, it } from "vitest";

import testData from "../../../test-data/utilities/postal-mappings.json";
import type { PostalMappingTestCase, PostalMappingTestData } from "../../types/test-data-types";
import { getProvinceFromPostalCode } from "../../constants/postal-code-provinces.js";

// Extract test cases from new structure
const typedTestData = testData as PostalMappingTestData;
const allTests = typedTestData.tests ? Object.values(typedTestData.tests).flat() : [];
const provinceMappingTests = typedTestData.tests?.provinceMapping || allTests;
const formatVariationsTests = typedTestData.tests?.formatVariations || [];
const invalidCasesTests = typedTestData.tests?.invalidCases || [];

describe("Postal Code to Province Mapping", () => {
  describe("Province Mapping", () => {
    provinceMappingTests.forEach(({ name, description, input, expected }: PostalMappingTestCase) => {
      it(`should ${name}`, () => {
        const result = getProvinceFromPostalCode(input);
        expect(result).toBe(expected);
      });
    });
  });

  describe("Format Variations", () => {
    formatVariationsTests.forEach(({ name, description, input, expected }: PostalMappingTestCase) => {
      it(`should handle ${name}`, () => {
        const result = getProvinceFromPostalCode(input);
        expect(result).toBe(expected);
      });
    });
  });

  describe("Invalid Cases", () => {
    invalidCasesTests.forEach(({ name, description, input, expected }: PostalMappingTestCase) => {
      it(`should handle ${name}`, () => {
        const result = getProvinceFromPostalCode(input);
        expect(result).toBe(expected);
      });
    });
  });
});
