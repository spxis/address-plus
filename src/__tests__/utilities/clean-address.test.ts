import { describe, expect, it } from "vitest";
import { cleanAddress, cleanAddressDetailed } from "../../utils/clean-address";
import type { CleanAddressOptions } from "../../types/clean-address";
import testData from "../../../test-data/utilities/clean-address.json";

// Extract test cases from new structure
const allTests = testData.tests ? Object.values(testData.tests).flat() : [];
const cleanAddressTests = testData.tests?.cleanAddress || allTests;
const cleanAddressDetailedTests = testData.tests?.cleanAddressDetailed || [];
const formatSpecificTests = testData.tests?.formatSpecific || [];
const edgeCasesTests = testData.tests?.edgeCases || [];
const additionalTests = testData.tests?.additionalTests || [];

describe("Clean Address API", () => {
  describe("cleanAddress", () => {
    cleanAddressTests.forEach(({ name, input, expected, options }: any) => {
      it(`should handle ${name}`, () => {
        const result = cleanAddress(input, options as CleanAddressOptions);
        expect(result).toBe(expected);
      });
    });

  });

  describe("cleanAddressDetailed", () => {
    cleanAddressDetailedTests.forEach(({ name, input, expected, options }: any) => {
      it(`should ${name}`, () => {
        const result = cleanAddressDetailed(input, options as CleanAddressOptions);
        
        if (expected.cleaned !== undefined) {
          expect(result.cleaned).toBe(expected.cleaned);
        }
        
        if (expected.changes) {
          expected.changes.forEach((change: any) => {
            expect(result.changes.some((c: any) => c.type === change.type)).toBe(true);
          });
        }
      });
    });
  });

  describe("Format Specific", () => {
    formatSpecificTests.forEach(({ name, input, expected, expectContains, options }: any) => {
      it(`should ${name}`, () => {
        const result = cleanAddress(input, options as CleanAddressOptions);
        
        if (expected) {
          expect(result).toBe(expected);
        }
        
        if (expectContains) {
          expectContains.forEach((expectedText: any) => {
            expect(result).toContain(expectedText);
          });
        }
      });
    });
  });

  describe("Edge Cases", () => {
    edgeCasesTests.forEach(({ name, input, expected, options }: any) => {
      it(`should handle ${name}`, () => {
        const result = cleanAddress(input, options as CleanAddressOptions);
        expect(result).toBe(expected);
      });
    });
  });

  describe("Additional Tests", () => {
    additionalTests.forEach(({ name, description, input, expected }: any) => {
      it(`should ${name}`, () => {
        const result = cleanAddress(input);
        expect(result).toBe(expected);
      });
    });
  });
});