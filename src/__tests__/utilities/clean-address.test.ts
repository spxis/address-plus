import { describe, expect, it } from "vitest";
import { cleanAddress, cleanAddressDetailed } from "../../utilities/clean-address";
import type { CleanAddressOptions } from "../../types/clean-address";
import testData from "../../../test-data/utilities/clean-address.json";

describe("Clean Address API", () => {
  describe("cleanAddress", () => {
    testData.cleanAddress.forEach(({ name, input, expected, options }) => {
      it(`should handle ${name}`, () => {
        const result = cleanAddress(input, options as CleanAddressOptions);
        expect(result).toBe(expected);
      });
    });

  });

  describe("cleanAddressDetailed", () => {
    testData.cleanAddressDetailed.forEach(({ name, input, expected, options }) => {
      it(`should ${name}`, () => {
        const result = cleanAddressDetailed(input, options as CleanAddressOptions);
        expect(result.cleanedAddress).toBe(expected.cleanedAddress);
        expect(result.wasModified).toBe(expected.wasModified);
        expected.changes.forEach(change => {
          expect(result.changes).toContain(change);
        });
      });
    });
  });

  describe("format-specific options", () => {
    testData.formatSpecific.forEach(({ name, input, expected, expectContains, options }) => {
      it(`should handle ${name}`, () => {
        const result = cleanAddress(input, options as CleanAddressOptions);
        
        if (expected) {
          expect(result).toBe(expected);
        }
        
        if (expectContains) {
          expectContains.forEach(expectedText => {
            expect(result).toContain(expectedText);
          });
        }
      });
    });
  });

  describe("edge cases", () => {
    testData.edgeCases.forEach(({ name, input, expected, options }) => {
      it(`should handle ${name}`, () => {
        const result = cleanAddress(input, options as CleanAddressOptions);
        expect(result).toBe(expected);
      });
    });
  });

  describe("additional tests", () => {
    testData.additionalTests.forEach(({ name, description, input, expected }) => {
      it(`should handle ${name}`, () => {
        const result = cleanAddress(input);
        expect(result).toBe(expected);
      });
    });
  });
});