/**
 * Tests for strict mode functionality
 */

import { describe, expect, test } from "vitest";

import { parseLocation } from "../../parser";

import usStrictModeTestData from "../../../test-data/us/strict-mode.json";
import canadaStrictModeTestData from "../../../test-data/canada/strict-mode.json";

describe("Strict Mode - Core Working Functionality", () => {
  describe("US ZIP Code Validation", () => {
    usStrictModeTestData.forEach((testCase: any) => {
      test(`${testCase.description}`, () => {
        if (testCase.expected.strict) {
          const strictResult = parseLocation(testCase.address, { strict: true });
          
          if (testCase.expected.strict.zip === null) {
            expect(strictResult?.zip).toBeUndefined();
            expect(strictResult?.zipValid).toBe(false);
          } else {
            expect(strictResult?.zip).toBe(testCase.expected.strict.zip);
            expect(strictResult?.zipValid).toBe(testCase.expected.strict.zipValid);
          }
        }
        
        if (testCase.expected.permissive) {
          const permissiveResult = parseLocation(testCase.address, { strict: false });
          
          expect(permissiveResult?.zip).toBe(testCase.expected.permissive.zip);
          expect(permissiveResult?.zipValid).toBe(testCase.expected.permissive.zipValid);
        }
        
        if (!testCase.expected.strict && !testCase.expected.permissive) {
          const strictResult = parseLocation(testCase.address, { strict: true });
          const permissiveResult = parseLocation(testCase.address, { strict: false });
          
          expect(strictResult?.zip).toBe(testCase.expected.zip);
          expect(strictResult?.zipValid).toBe(testCase.expected.zipValid);
          expect(permissiveResult?.zip).toBe(testCase.expected.zip);
          expect(permissiveResult?.zipValid).toBe(testCase.expected.zipValid);
          
          if (testCase.expected.plus4) {
            expect(strictResult?.plus4).toBe(testCase.expected.plus4);
            expect(permissiveResult?.plus4).toBe(testCase.expected.plus4);
          }
        }
      });
    });
  });

  describe("Canadian Postal Code Validation", () => {
    canadaStrictModeTestData.forEach((testCase: any) => {
      test(`${testCase.description}`, () => {
        // Test strict mode if specified
        if (testCase.expected.strict) {
          const strictResult = parseLocation(testCase.address, { strict: true });
          
          if (testCase.expected.strict.zip === null) {
            expect(strictResult?.zip).toBeUndefined();
            expect(strictResult?.zipValid).toBe(false);
          } else {
            expect(strictResult?.zip).toBe(testCase.expected.strict.zip);
            expect(strictResult?.zipValid).toBe(testCase.expected.strict.zipValid);
          }
        }
        
        // Test permissive mode if specified
        if (testCase.expected.permissive) {
          const permissiveResult = parseLocation(testCase.address, { strict: false });
          
          expect(permissiveResult?.zip).toBe(testCase.expected.permissive.zip);
          expect(permissiveResult?.zipValid).toBe(testCase.expected.permissive.zipValid);
        }
        
        // Test both modes for basic cases
        if (!testCase.expected.strict && !testCase.expected.permissive) {
          const strictResult = parseLocation(testCase.address, { strict: true });
          const permissiveResult = parseLocation(testCase.address, { strict: false });
          
          expect(strictResult?.zip).toBe(testCase.expected.zip);
          expect(strictResult?.zipValid).toBe(testCase.expected.zipValid);
          expect(permissiveResult?.zip).toBe(testCase.expected.zip);
          expect(permissiveResult?.zipValid).toBe(testCase.expected.zipValid);
        }
      });
    });
  });
});