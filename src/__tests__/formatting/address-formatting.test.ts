import { describe, expect, it } from "vitest";

import testData from "../../../test-data/formatting/address-formatting.json";
import type { ParsedAddress } from "../../types";
import type { FormattingTestCase, FormattingTestData } from "../../types/test-data-types";
import { formatAddress, formatCanadaPost, formatUSPS, getAddressAbbreviations } from "../../utils/address-formatting";

// Extract test cases from new structure
const typedTestData = testData as FormattingTestData;
const allTests = typedTestData.tests ? Object.values(typedTestData.tests).flat() : [];
const formatAddressTests = typedTestData.tests?.formatAddress || allTests;
const formatUSPSTests = typedTestData.tests?.formatUSPS || [];
const formatCanadaPostTests = typedTestData.tests?.formatCanadaPost || [];
const getAddressAbbreviationsTests = typedTestData.tests?.getAddressAbbreviations || [];
const edgeCasesTests = typedTestData.tests?.edgeCases || [];

describe("Address Formatting API", () => {
  describe("formatAddress", () => {
    formatAddressTests.forEach((testCase: FormattingTestCase, index: number) => {
      it(`should ${testCase.description} (test ${index + 1})`, () => {
        const result = formatAddress(testCase.input as ParsedAddress, testCase.options);

        if (testCase.expected.lines) {
          expect(result.lines).toEqual(testCase.expected.lines);
        }

        if (testCase.expected.singleLine) {
          expect(result.singleLine).toBe(testCase.expected.singleLine);
        }

        if (testCase.expected.format) {
          expect(result.format).toBe(testCase.expected.format);
        }

        if (testCase.expected.shouldNotContain) {
          expect(result.lines.join(" ")).not.toContain(testCase.expected.shouldNotContain);
        }

        if (testCase.expected.shouldContain) {
          expect(result.lines.join(" ")).toContain(testCase.expected.shouldContain);
        }

        if (testCase.expected.regex) {
          expect(result.lines.join(" ")).toMatch(new RegExp(testCase.expected.regex));
        }
      });
    });
  });

  describe("formatUSPS", () => {
    formatUSPSTests.forEach((testCase: FormattingTestCase, index: number) => {
      it(`should ${testCase.description} (test ${index + 1})`, () => {
        const result = formatUSPS(testCase.input as ParsedAddress, testCase.options);

        if (testCase.expected.lines) {
          expect(result.lines).toEqual(testCase.expected.lines);
        }

        if (testCase.expected.format) {
          expect(result.format).toBe(testCase.expected.format);
        }
      });
    });
  });

  describe("formatCanadaPost", () => {
    formatCanadaPostTests.forEach((testCase: FormattingTestCase, index: number) => {
      it(`should ${testCase.description} (test ${index + 1})`, () => {
        const result = formatCanadaPost(testCase.input as ParsedAddress, testCase.options);

        if (testCase.expected.lines) {
          expect(result.lines).toEqual(testCase.expected.lines);
        }

        if (testCase.expected.format) {
          expect(result.format).toBe(testCase.expected.format);
        }

        if (testCase.expected.country) {
          expect(result.country).toBe(testCase.expected.country);
        }

        if (testCase.expected.regex) {
          expect(result.lines.join(" ")).toMatch(new RegExp(testCase.expected.regex));
        }
      });
    });
  });

  describe("getAddressAbbreviations", () => {
    getAddressAbbreviationsTests.forEach((testCase: FormattingTestCase, index: number) => {
      it(`should ${testCase.description} (test ${index + 1})`, () => {
        const result = getAddressAbbreviations();

        if (testCase.expected.hasProperties) {
          testCase.expected.hasProperties.forEach((prop: string) => {
            expect(result).toHaveProperty(prop);
          });
        }

        if (testCase.expected.streetTypes) {
          Object.keys(testCase.expected.streetTypes).forEach((key) => {
            expect((result.streetTypes as Record<string, unknown>)[key]).toBe((testCase.expected.streetTypes as Record<string, unknown>)[key]);
          });
        }

        if (testCase.expected.directions) {
          Object.keys(testCase.expected.directions).forEach((key) => {
            expect((result.directions as Record<string, unknown>)[key]).toBe((testCase.expected.directions as Record<string, unknown>)[key]);
          });
        }

        if (testCase.expected.states) {
          Object.keys(testCase.expected.states).forEach((key) => {
            expect((result.states as Record<string, unknown>)[key]).toBe((testCase.expected.states as Record<string, unknown>)[key]);
          });
        }

        if (testCase.expected.provinces) {
          Object.keys(testCase.expected.provinces).forEach((key) => {
            expect((result.provinces as Record<string, unknown>)[key]).toBe((testCase.expected.provinces as Record<string, unknown>)[key]);
          });
        }

        if (testCase.expected.unitTypes) {
          Object.keys(testCase.expected.unitTypes).forEach((key) => {
            expect((result.unitTypes as Record<string, unknown>)[key]).toBe((testCase.expected.unitTypes as Record<string, unknown>)[key]);
          });
        }
      });
    });
  });

  describe("Edge Cases", () => {
    edgeCasesTests.forEach((testCase: FormattingTestCase, index: number) => {
      it(`should ${testCase.description} (test ${index + 1})`, () => {
        const result = formatAddress(testCase.input as ParsedAddress, testCase.options);

        if (testCase.expected.lines) {
          expect(result.lines).toEqual(testCase.expected.lines);
        }

        if (testCase.expected.singleLine !== undefined) {
          expect(result.singleLine).toBe(testCase.expected.singleLine);
        }
      });
    });
  });
});
