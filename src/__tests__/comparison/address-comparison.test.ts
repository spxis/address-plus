import { describe, expect, it } from "vitest";

import testData from "../../../test-data/comparison/address-comparison.json";
import type { ParsedAddress } from "../../types";
import type { ComparisonTestCase, ComparisonTestData } from "../../types/test-data-types";
import { compareAddresses, getAddressSimilarity, isSameAddress } from "../../utils/address-comparison";

// Extract test cases from new structure
const typedTestData = testData as ComparisonTestData;
const allTests = typedTestData.tests ? Object.values(typedTestData.tests).flat() : [];
const compareAddressesTests = typedTestData.tests?.compareAddresses || allTests;
const edgeCasesTests = typedTestData.tests?.edgeCases || [];

describe("Address Comparison API", () => {
  describe("compareAddresses", () => {
    compareAddressesTests.forEach((testCase: ComparisonTestCase, index: number) => {
      it(`should ${testCase.description} (test ${index + 1})`, () => {
        const result = compareAddresses(
          testCase.input.address1 as ParsedAddress,
          testCase.input.address2 as ParsedAddress,
        );

        expect(result.isSame).toBe(testCase.expected.isSame);
        if (testCase.expected.similarity !== undefined) {
          expect(result.similarity.score).toBeCloseTo(testCase.expected.similarity, 1);
        }
      });
    });
  });

  describe("isSameAddress", () => {
    compareAddressesTests.forEach((testCase: ComparisonTestCase, index: number) => {
      it(`should ${testCase.description} (test ${index + 1})`, () => {
        const result = isSameAddress(
          testCase.input.address1 as ParsedAddress,
          testCase.input.address2 as ParsedAddress,
        );
        expect(result).toBe(testCase.expected.isSame);
      });
    });
  });

  describe("getAddressSimilarity", () => {
    compareAddressesTests.forEach((testCase: ComparisonTestCase, index: number) => {
      it(`should ${testCase.description} (test ${index + 1})`, () => {
        const result = getAddressSimilarity(
          testCase.input.address1 as ParsedAddress,
          testCase.input.address2 as ParsedAddress,
        );
        if (testCase.expected.similarity !== undefined) {
          expect(result.score).toBeCloseTo(testCase.expected.similarity, 1);
        }
      });
    });
  });

  describe("Edge Cases", () => {
    edgeCasesTests.forEach((testCase: ComparisonTestCase, index: number) => {
      it(`should ${testCase.description} (test ${index + 1})`, () => {
        const result = compareAddresses(
          testCase.input.address1 as ParsedAddress,
          testCase.input.address2 as ParsedAddress,
          testCase.input.options,
        );

        if (testCase.expected.isSame !== undefined) {
          expect(result.isSame).toBe(testCase.expected.isSame);
        }

        if (testCase.expected.similarity !== undefined) {
          expect(result.similarity.score).toBeCloseTo(testCase.expected.similarity, 1);
        }

        if (testCase.expected.similarityLessThan !== undefined) {
          expect(result.similarity.score).toBeLessThan(testCase.expected.similarityLessThan);
        }

        if (testCase.expected.comparison?.score !== undefined) {
          expect(result.similarity.score).toBe(testCase.expected.comparison.score);
        }
      });
    });
  });
});
