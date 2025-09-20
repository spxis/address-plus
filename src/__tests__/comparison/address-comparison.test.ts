import { describe, expect, it } from "vitest";
import {
  compareAddresses,
  isSameAddress,
  getAddressSimilarity,
} from "../../comparison/address-comparison";
import type { ParsedAddress } from "../../types";
import testData from "../../../test-data/comparison/address-comparison-unified.json";

describe("Address Comparison API", () => {
  describe("compareAddresses", () => {
    testData.compareAddresses.forEach((testCase, index) => {
      it(`should ${testCase.description} (test ${index + 1})`, () => {
        const result = compareAddresses(
          testCase.input.address1 as ParsedAddress, 
          testCase.input.address2 as ParsedAddress
        );
        
        expect(result.isSame).toBe(testCase.expected.isSame);
        expect(result.similarity.score).toBeCloseTo(testCase.expected.similarity, 1);
      });
    });
  });

  describe("isSameAddress", () => {
    testData.compareAddresses.forEach((testCase, index) => {
      it(`should ${testCase.description} (test ${index + 1})`, () => {
        const result = isSameAddress(
          testCase.input.address1 as ParsedAddress, 
          testCase.input.address2 as ParsedAddress
        );
        expect(result).toBe(testCase.expected.isSame);
      });
    });
  });

  describe("getAddressSimilarity", () => {
    testData.compareAddresses.forEach((testCase, index) => {
      it(`should ${testCase.description} (test ${index + 1})`, () => {
        const result = getAddressSimilarity(
          testCase.input.address1 as ParsedAddress, 
          testCase.input.address2 as ParsedAddress
        );
        expect(result.score).toBeCloseTo(testCase.expected.similarity, 1);
      });
    });
  });

  describe("Edge Cases", () => {
    testData.edgeCases.forEach((testCase, index) => {
      it(`should ${testCase.description} (test ${index + 1})`, () => {
        const result = compareAddresses(
          testCase.input.address1 as ParsedAddress, 
          testCase.input.address2 as ParsedAddress,
          (testCase.input as any).options
        );
        
        if (testCase.expected.isSame !== undefined) {
          expect(result.isSame).toBe(testCase.expected.isSame);
        }
        
        if (testCase.expected.similarity !== undefined) {
          expect(result.similarity.score).toBeCloseTo(testCase.expected.similarity, 1);
        }
        
        if ((testCase.expected as any).similarityLessThan !== undefined) {
          expect(result.similarity.score).toBeLessThan((testCase.expected as any).similarityLessThan);
        }
        
        if (testCase.expected.comparison?.score !== undefined) {
          expect(result.similarity.score).toBe(testCase.expected.comparison.score);
        }
      });
    });
  });
});