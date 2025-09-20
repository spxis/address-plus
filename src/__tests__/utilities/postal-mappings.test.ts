import { describe, expect, it } from "vitest";
import { getProvinceFromPostalCode } from "../../data/postal-code-provinces.js";
import testData from "../../../test-data/utilities/postal-mappings.json";

describe("Postal Code to Province Mapping", () => {
  describe("Province Mapping", () => {
    testData.provinceMapping.forEach(({ name, description, input, expected }) => {
      it(`should ${name}`, () => {
        const result = getProvinceFromPostalCode(input);
        expect(result).toBe(expected);
      });
    });
  });

  describe("Format Variations", () => {
    testData.formatVariations.forEach(({ name, description, input, expected }) => {
      it(`should handle ${name}`, () => {
        const result = getProvinceFromPostalCode(input);
        expect(result).toBe(expected);
      });
    });
  });

  describe("Invalid Cases", () => {
    testData.invalidCases.forEach(({ name, description, input, expected }) => {
      it(`should handle ${name}`, () => {
        const result = getProvinceFromPostalCode(input);
        expect(result).toBe(expected);
      });
    });
  });
});