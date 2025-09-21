// Core Parser Tests - Comprehensive Address Parsing Functionality
//
// This file contains all core address parsing tests including:
// - Basic address parsing (US & Canada)
// - Complex address formats (facilities, intersections, edge cases)
// - Famous addresses validation
// - Secondary units and PO boxes
// - Regional variations and compatibility
//
// All tests use JSON data files for maintainability and consistency.

import { readFileSync } from "fs";
import { join } from "path";

import { describe, expect, test } from "vitest";

import { parseAddress, parseInformalAddress, parseIntersection, parseLocation } from "../../parser";

// Helper Functions
interface TestCase {
  input: string;
  expected?: Record<string, any>;
  description?: string;
}

// Test data files
const testFiles = {
  us: {
    basic: "../../../test-data/us/basic.json",
    compatibility: "../../../test-data/us/compatibility.json",
    intersections: "../../../test-data/us/intersections.json",
    "secondary-units": "../../../test-data/us/secondary-units.json",
    "special-cases": "../../../test-data/us/special-cases.json",
    "unusual-types": "../../../test-data/us/unusual-types.json",
    "null-cases": "../../../test-data/us/null-cases.json",
    "strict-mode": "../../../test-data/us/strict-mode.json",
  },
  canada: {
    basic: "../../../test-data/canada/basic.json",
    "special-postal": "../../../test-data/canada/special-postal.json",
    "special-cases": "../../../test-data/canada/special-cases.json",
    "null-cases": "../../../test-data/canada/null-cases.json",
    "strict-mode": "../../../test-data/canada/strict-mode.json",
  },
  core: {
    "legacy-null-cases": "../../../test-data/core/legacy-null-cases.json",
    "informal-address-tests": "../../../test-data/core/informal-address-tests.json",
  },
};

describe("Core Address Parser Tests", () => {
  describe("US Address Parsing", () => {
    Object.entries(testFiles.us).forEach(([fileKey, filePath]) => {
      const data = JSON.parse(readFileSync(join(__dirname, filePath), "utf-8"));
      
      Object.entries(data.tests).forEach(([groupName, testCases]) => {
        const tests = testCases as TestCase[];
        // Use parseIntersection for intersections, parseAddress for famous addresses, parseLocation for everything else
        let parserFunction = parseLocation;
        if (fileKey === "intersections") {
          parserFunction = parseIntersection;
        } else if (fileKey.includes("famous")) {
          parserFunction = parseAddress;
        }

        describe(`${fileKey} - ${groupName}`, () => {
          tests.forEach((testCase, index) => {
            test(`should parse ${groupName} ${index + 1}: "${testCase.input}"`, () => {
              // Use strict mode for strict-mode tests
              const parseOptions = fileKey.includes("strict") ? { strict: true } : {};
              const result = parserFunction(testCase.input, parseOptions);

              if (fileKey.includes("null")) {
                expect(result).toBeNull();
              } else {
                expect(result).toBeTruthy();

                if (testCase.expected) {
                  // Handle strict mode expectations
                  const expectations = testCase.expected.strict || testCase.expected;
                  Object.keys(expectations).forEach((key) => {
                    const expectedValue = expectations[key];
                    const actualValue = (result as any)?.[key];
                    
                    // Handle null expectations for missing fields (e.g., zip: null when no zip field exists)
                    if (expectedValue === null && actualValue === undefined) {
                      expect(actualValue).toBeUndefined(); // This passes
                    } else {
                      expect(actualValue).toBe(expectedValue);
                    }
                  });
                }
              }
            });
          });
        });
      });
    });
  });

  describe("Canada Address Parsing", () => {
    Object.entries(testFiles.canada).forEach(([fileKey, filePath]) => {
      const data = JSON.parse(readFileSync(join(__dirname, filePath), "utf-8"));
      
      Object.entries(data.tests).forEach(([groupName, testCases]) => {
        const tests = testCases as TestCase[];
        describe(`${fileKey} - ${groupName}`, () => {
          tests.forEach((testCase, index) => {
            test(`should parse ${groupName} ${index + 1}: "${testCase.input}"`, () => {
              // Use strict mode for strict-mode tests
              const parseOptions = fileKey.includes("strict") ? { strict: true } : {};
              const result = parseLocation(testCase.input, parseOptions);

              if (fileKey.includes("null")) {
                expect(result).toBeNull();
              } else {
                expect(result).toBeTruthy();

                if (testCase.expected) {
                  // Handle strict mode expectations
                  const expectations = testCase.expected.strict || testCase.expected;
                  Object.keys(expectations).forEach((key) => {
                    const expectedValue = expectations[key];
                    const actualValue = (result as any)?.[key];
                    
                    // Handle null expectations for missing fields (e.g., zip: null when no zip field exists)
                    if (expectedValue === null && actualValue === undefined) {
                      expect(actualValue).toBeUndefined(); // This passes
                    } else {
                      expect(actualValue).toBe(expectedValue);
                    }
                  });
                }
              }
            });
          });
        });
      });
    });
  });

  describe("Core Function Testing", () => {
    Object.entries(testFiles.core).forEach(([fileKey, filePath]) => {
      const data = JSON.parse(readFileSync(join(__dirname, filePath), "utf-8"));
      
      Object.entries(data.tests).forEach(([groupName, testCases]) => {
        const tests = testCases as TestCase[];
        
        // Determine parser function based on file type
        let parserFunction = parseLocation;
        if (fileKey.includes("informal")) {
          parserFunction = parseInformalAddress;
        }

        describe(`${fileKey} - ${groupName}`, () => {
          tests.forEach((testCase, index) => {
            test(`should ${testCase.expected ? 'parse' : 'return null for'} ${testCase.description || testCase.input}`, () => {
              const result = parserFunction(testCase.input);

              if (testCase.expected) {
                expect(result).toBeTruthy();
                Object.keys(testCase.expected).forEach((key) => {
                  expect((result as any)?.[key]).toBe(testCase.expected![key]);
                });
              } else {
                expect(result).toBeNull();
              }
            });
          });
        });
      });
    });
  });
});