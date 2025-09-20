import { describe, expect, it } from "vitest";

import testData from "../../../test-data/utilities/clean-address.json";
import type { CleanAddressOptions } from "../../types/clean-address";
import type { CleanAddressChange, CleanAddressTestCase, CleanAddressTestData } from "../../types/test-data-types";
import { cleanAddress, cleanAddressDetailed } from "../../utils/clean-address";

// Extract test cases from new structure
const typedTestData = testData as CleanAddressTestData;
const allTests = typedTestData.tests ? Object.values(typedTestData.tests).flat() : [];
const cleanAddressTests = typedTestData.tests?.cleanAddress || allTests;
const cleanAddressDetailedTests = typedTestData.tests?.cleanAddressDetailed || [];
const formatSpecificTests = typedTestData.tests?.formatSpecific || [];
const edgeCasesTests = typedTestData.tests?.edgeCases || [];
const additionalTests = typedTestData.tests?.additionalTests || [];

describe("Clean Address API", () => {
  describe("cleanAddress", () => {
    cleanAddressTests.forEach(({ name, input, expected, options }: CleanAddressTestCase) => {
      it(`should handle ${name}`, () => {
        const result = cleanAddress(input, options as CleanAddressOptions);
        expect(result).toBe(expected as string);
      });
    });
  });

  describe("cleanAddressDetailed", () => {
    cleanAddressDetailedTests.forEach(({ name, input, expected, options }: CleanAddressTestCase) => {
      it(`should ${name}`, () => {
        const result = cleanAddressDetailed(input, options as CleanAddressOptions);

        if (typeof expected === "object" && expected !== null) {
          if (expected.cleaned !== undefined) {
            expect(result.cleaned).toBe(expected.cleaned);
          }

          if (expected.changes) {
            expected.changes.forEach((change: CleanAddressChange) => {
              expect(result.changes.some((c: CleanAddressChange) => c.type === change.type)).toBe(true);
            });
          }
        }
      });
    });
  });

  describe("Format Specific", () => {
    formatSpecificTests.forEach(({ name, input, expected, expectContains, options }: CleanAddressTestCase) => {
      it(`should ${name}`, () => {
        const result = cleanAddress(input, options as CleanAddressOptions);

        if (expected) {
          expect(result).toBe(expected as string);
        }

        if (expectContains) {
          expectContains.forEach((expectedText: string) => {
            expect(result).toContain(expectedText);
          });
        }
      });
    });
  });

  describe("Edge Cases", () => {
    edgeCasesTests.forEach(({ name, input, expected, options }: CleanAddressTestCase) => {
      it(`should handle ${name}`, () => {
        const result = cleanAddress(input, options as CleanAddressOptions);
        expect(result).toBe(expected as string);
      });
    });
  });

  describe("Additional Tests", () => {
    additionalTests.forEach(({ name, description, input, expected }: CleanAddressTestCase) => {
      it(`should ${name}`, () => {
        const result = cleanAddress(input);
        expect(result).toBe(expected as string);
      });
    });
  });
});
