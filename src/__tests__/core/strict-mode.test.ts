// Tests for strict mode functionality
// Validates ZIP/postal code parsing behavior in strict vs permissive modes
// Covers US ZIP codes and Canadian postal codes with various validation scenarios

import { describe, expect, test } from "vitest";

import { parseLocation } from "../../parser";

import usStrictModeTestDataFile from "../../../test-data/us/strict-mode.json";
import canadaStrictModeTestDataFile from "../../../test-data/canada/strict-mode.json";

// Helper function to extract test data from objects with $schema
function loadSchemaTestData<T>(testDataFile: any): T {
  // If the imported data has $schema property, extract everything except $schema
  if (testDataFile && typeof testDataFile === "object" && "$schema" in testDataFile) {
    const { $schema, ...data } = testDataFile;
    return data as T;
  }
  return testDataFile;
}

// Extract test data
const usStrictModeData = loadSchemaTestData<any>(usStrictModeTestDataFile);
const usStrictModeTestData = usStrictModeData.strictModeTests || usStrictModeData.testCases || usStrictModeData;
const canadaStrictModeData = loadSchemaTestData<any>(canadaStrictModeTestDataFile);
const canadaStrictModeTestData = canadaStrictModeData.strictModeTests || canadaStrictModeData.testCases || canadaStrictModeData;

// Expected result interface for postal/ZIP validation
interface PostalExpectedResult {
  zip: string | null; // ZIP/postal code value
  zipValid: boolean; // Whether the code is valid
  plus4?: string; // US ZIP+4 extension if present
}

// Test case structure for strict mode validation
interface StrictModeTestCase {
  description: string; // Test case description
  address: string; // Input address to parse
  expected: {
    strict?: PostalExpectedResult; // Expected result in strict mode
    permissive?: PostalExpectedResult; // Expected result in permissive mode
    zip?: string; // Direct ZIP value for simple cases
    zipValid?: boolean; // Direct validation for simple cases
    plus4?: string; // Direct plus4 for simple cases
  };
}

describe("Strict Mode - Core Working Functionality", () => {
  describe("US ZIP Code Validation", () => {
    usStrictModeTestData.forEach((testCase: StrictModeTestCase) => {
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
    canadaStrictModeTestData.forEach((testCase: StrictModeTestCase) => {
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