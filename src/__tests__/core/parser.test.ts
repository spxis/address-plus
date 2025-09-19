/**
 * Core Parser Tests - Comprehensive Address Parsing Functionality
 * 
 * This file contains all core address parsing tests including:
 * - Basic address parsing (US & Canada)
 * - Complex address formats (facilities, intersections, edge cases)
 * - Famous addresses validation
 * - Secondary units and PO boxes
 * - Regional variations and compatibility
 * 
 * All tests use JSON data files for maintainability and consistency.
 */

import { describe, expect, test } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

import { 
  parseAddress, 
  parseInformalAddress, 
  parseIntersection, 
  parseLocation 
} from "../../parser";
import type { ParsedAddress, ParsedIntersection } from "../../types";

// Constants
const TEST_DATA_BASE_PATH = "../../../test-data";

// Helper Functions
function loadTestData(country: "us" | "canada", filename: string): any[] {
  const filePath = join(__dirname, TEST_DATA_BASE_PATH, country, filename);
  const data = JSON.parse(readFileSync(filePath, "utf-8"));
  
  // If it's already an array, return it directly
  if (Array.isArray(data)) {
    return data;
  }
  
  // Otherwise, extract the array from the first key that isn't 'description'
  const firstKey = Object.keys(data).find(key => key !== "description");
  
  return firstKey ? data[firstKey] || [] : [];
}

function loadRegionTestData(filename: string): any {
  const filePath = join(__dirname, TEST_DATA_BASE_PATH, "regions", filename);
  
  return JSON.parse(readFileSync(filePath, "utf-8"));
}

// Load all test data once at the top
const usBasicAddresses = loadTestData("us", "basic.json");
const usCompatibilityTests = loadTestData("us", "compatibility.json");
const usIntersections = loadTestData("us", "intersections.json");
const usFacilities = loadTestData("us", "facilities.json");
const usUnitsAndBoxes = loadTestData("us", "units-and-boxes.json");
const usEdgeCases = loadTestData("us", "edge-cases.json");
const usFamousAddresses = loadTestData("us", "famous.json");
const usFamousEdgeAddresses = loadTestData("us", "famous-edge.json");
const usSpecialAddresses = loadTestData("us", "special.json");
const usUnusualTypes = loadTestData("us", "unusual-types.json");

const canadaBasicAddresses = loadTestData("canada", "basic.json");
const canadaFacilities = loadTestData("canada", "facilities.json");
const canadaSpecialPostal = loadTestData("canada", "special-postal.json");
const canadaEdgeCases = loadTestData("canada", "edge-cases.json");
const canadaFamousAddresses = loadTestData("canada", "famous.json");
const canadaFamousEdgeAddresses = loadTestData("canada", "famous-edge.json");
const canadaSpecialAlt = loadTestData("canada", "special.json");

const regionsUSStatesFuzzy = loadRegionTestData("us-states-fuzzy.json");
const regionsCAProvincesFuzzy = loadRegionTestData("ca-provinces-fuzzy.json");
const regionsEdgeCases = loadRegionTestData("edge-cases.json");
const regionsExactMatch = loadRegionTestData("exact-match-cases.json");

describe("Core Address Parser Tests", () => {
  
  describe("US Address Parsing", () => {
    
    describe("Basic Addresses", () => {
      usBasicAddresses.forEach((testCase, index) => {
        test(`should parse US basic address ${index + 1}: "${testCase.input}"`, () => {
          const result = parseLocation(testCase.input);
          
          expect(result).toBeTruthy();
          
          if (testCase.expected) {
            Object.keys(testCase.expected).forEach(key => {
              expect((result as any)?.[key]).toBe(testCase.expected[key]);
            });
          }
        });
      });
    });

    describe("Compatibility Tests", () => {
      usCompatibilityTests.forEach((testCase, index) => {
        test(`should handle compatibility case ${index + 1}: "${testCase.input}"`, () => {
          const result = parseLocation(testCase.input);
          
          expect(result).toBeTruthy();
          
          if (testCase.expected) {
            Object.keys(testCase.expected).forEach(key => {
              expect((result as any)?.[key]).toBe(testCase.expected[key]);
            });
          }
        });
      });
    });

    describe("Intersection Parsing", () => {
      usIntersections.forEach((testCase, index) => {
        test(`should parse intersection ${index + 1}: "${testCase.input}"`, () => {
          const result = parseIntersection(testCase.input);
          
          expect(result).toBeTruthy();
          
          if (testCase.expected) {
            Object.keys(testCase.expected).forEach(key => {
              expect((result as any)?.[key]).toBe(testCase.expected[key]);
            });
          }
        });
      });
    });

    describe("Facilities", () => {
      usFacilities.forEach((testCase, index) => {
        test(`should parse facility ${index + 1}: "${testCase.input}"`, () => {
          const result = parseLocation(testCase.input);
          
          expect(result).toBeTruthy();
          
          if (testCase.expected) {
            Object.keys(testCase.expected).forEach(key => {
              expect((result as any)?.[key]).toBe(testCase.expected[key]);
            });
          }
        });
      });
    });

    describe("Units and PO Boxes", () => {
      usUnitsAndBoxes.forEach((testCase, index) => {
        test(`should parse unit/box ${index + 1}: "${testCase.input}"`, () => {
          const result = parseLocation(testCase.input);
          
          expect(result).toBeTruthy();
          
          if (testCase.expected) {
            Object.keys(testCase.expected).forEach(key => {
              expect((result as any)?.[key]).toBe(testCase.expected[key]);
            });
          }
        });
      });
    });

    describe("Edge Cases", () => {
      usEdgeCases.forEach((testCase, index) => {
        test(`should handle edge case ${index + 1}: "${testCase.input}"`, () => {
          const result = parseLocation(testCase.input);
          
          expect(result).toBeTruthy();
          
          if (testCase.expected) {
            Object.keys(testCase.expected).forEach(key => {
              expect((result as any)?.[key]).toBe(testCase.expected[key]);
            });
          }
        });
      });
    });

    describe("Famous Addresses", () => {
      usFamousAddresses.forEach((testCase, index) => {
        test(`should parse famous address ${index + 1}: "${testCase.input}"`, () => {
          const result = parseAddress(testCase.input);
          
          expect(result).toBeTruthy();
          
          if (testCase.expected) {
            Object.keys(testCase.expected).forEach(key => {
              if (testCase.expected[key] !== undefined) {
                const actualValue = (result as any)?.[key];
                const expectedValue = testCase.expected[key];
                expect(actualValue, `Expected ${key} to be "${expectedValue}" but got "${actualValue}"`).toBe(expectedValue);
              }
            });
          }
        });
      });
    });

    describe("Famous Edge Cases", () => {
      usFamousEdgeAddresses.forEach((testCase, index) => {
        test(`should parse famous edge case ${index + 1}: "${testCase.input}"`, () => {
          const result = parseLocation(testCase.input);
          
          if (testCase.expected === null) {
            expect(result).toBeNull();
            return;
          }
          
          expect(result).toBeTruthy();
          
          if (testCase.expected) {
            Object.keys(testCase.expected).forEach(key => {
              expect((result as any)?.[key]).toBe(testCase.expected[key]);
            });
          }
        });
      });
    });

    describe("Special Addresses", () => {
      usSpecialAddresses.forEach((testCase, index) => {
        test(`should parse special address ${index + 1}: "${testCase.input}"`, () => {
          const result = parseLocation(testCase.input);
          
          if (testCase.expected === null) {
            expect(result).toBeNull();
            return;
          }
          
          expect(result).toBeTruthy();
          
          if (testCase.expected) {
            Object.keys(testCase.expected).forEach(key => {
              expect((result as any)?.[key]).toBe(testCase.expected[key]);
            });
          }
        });
      });
    });

    describe("Unusual Types", () => {
      usUnusualTypes.forEach((testCase, index) => {
        test(`should parse unusual type ${index + 1}: "${testCase.input}"`, () => {
          const result = parseLocation(testCase.input);
          
          if (testCase.expected === null) {
            expect(result).toBeNull();
            return;
          }
          
          expect(result).toBeTruthy();
          
          if (testCase.expected) {
            Object.keys(testCase.expected).forEach(key => {
              expect((result as any)?.[key]).toBe(testCase.expected[key]);
            });
          }
        });
      });
    });
  });

  describe("Canadian Address Parsing", () => {
    
    describe("Basic Addresses", () => {
      canadaBasicAddresses.forEach((testCase, index) => {
        test(`should parse Canadian basic address ${index + 1}: "${testCase.input}"`, () => {
          const result = parseLocation(testCase.input);
          
          expect(result).toBeTruthy();
          
          if (testCase.expected) {
            Object.keys(testCase.expected).forEach(key => {
              expect((result as any)?.[key]).toBe(testCase.expected[key]);
            });
          }
        });
      });
    });

    describe("Facilities", () => {
      canadaFacilities.forEach((testCase, index) => {
        test(`should parse Canadian facility ${index + 1}: "${testCase.input}"`, () => {
          const result = parseLocation(testCase.input);
          
          expect(result).toBeTruthy();
          
          if (testCase.expected) {
            Object.keys(testCase.expected).forEach(key => {
              expect((result as any)?.[key]).toBe(testCase.expected[key]);
            });
          }
        });
      });
    });

    describe("Special Postal Code Handling", () => {
      canadaSpecialPostal.forEach((testCase, index) => {
        test(`should handle Canadian special postal ${index + 1}: "${testCase.input}"`, () => {
          const result = parseLocation(testCase.input);
          
          expect(result).toBeTruthy();
          
          if (testCase.expected) {
            Object.keys(testCase.expected).forEach(key => {
              expect((result as any)?.[key]).toBe(testCase.expected[key]);
            });
          }
        });
      });
    });

    describe("Edge Cases", () => {
      canadaEdgeCases.forEach((testCase, index) => {
        test(`should handle Canadian edge case ${index + 1}: "${testCase.input}"`, () => {
          const result = parseLocation(testCase.input);
          
          if (testCase.expected === null) {
            expect(result).toBeNull();
            return;
          }
          
          expect(result).toBeTruthy();
          
          if (testCase.expected) {
            Object.keys(testCase.expected).forEach(key => {
              expect((result as any)?.[key]).toBe(testCase.expected[key]);
            });
          }
        });
      });
    });

    describe("Famous Addresses", () => {
      canadaFamousAddresses.forEach((testCase, index) => {
        test(`should parse Canadian famous address ${index + 1}: "${testCase.input}"`, () => {
          const result = parseLocation(testCase.input);
          
          if (testCase.expected === null) {
            expect(result).toBeNull();
            return;
          }
          
          expect(result).toBeTruthy();
          
          if (testCase.expected) {
            Object.keys(testCase.expected).forEach(key => {
              expect((result as any)?.[key]).toBe(testCase.expected[key]);
            });
          }
        });
      });
    });

    describe("Famous Edge Cases", () => {
      canadaFamousEdgeAddresses.forEach((testCase, index) => {
        test(`should parse Canadian famous edge case ${index + 1}: "${testCase.input}"`, () => {
          const result = parseLocation(testCase.input);
          
          if (testCase.expected === null) {
            expect(result).toBeNull();
            return;
          }
          
          expect(result).toBeTruthy();
          
          if (testCase.expected) {
            Object.keys(testCase.expected).forEach(key => {
              expect((result as any)?.[key]).toBe(testCase.expected[key]);
            });
          }
        });
      });
    });

    describe("Special Alt", () => {
      canadaSpecialAlt.forEach((testCase, index) => {
        test(`should parse Canadian special alt ${index + 1}: "${testCase.input}"`, () => {
          const result = parseLocation(testCase.input);
          
          if (testCase.expected === null) {
            expect(result).toBeNull();
            return;
          }
          
          expect(result).toBeTruthy();
          
          if (testCase.expected) {
            Object.keys(testCase.expected).forEach(key => {
              expect((result as any)?.[key]).toBe(testCase.expected[key]);
            });
          }
        });
      });
    });
  });

  describe("Alternative Parser Functions", () => {
    
    describe("parseAddress function", () => {
      // Test a representative sample using parseAddress instead of parseLocation
      usBasicAddresses.slice(0, 5).forEach((testCase, index) => {
        test(`parseAddress should handle case ${index + 1}: "${testCase.input}"`, () => {
          const result = parseAddress(testCase.input);
          
          expect(result).toBeTruthy();
        });
      });
    });

    describe("parseInformalAddress function", () => {
      // Test informal address parsing with some basic cases
      usBasicAddresses.slice(0, 3).forEach((testCase, index) => {
        test(`parseInformalAddress should handle case ${index + 1}: "${testCase.input}"`, () => {
          const result = parseInformalAddress(testCase.input);
          
          expect(result).toBeTruthy();
        });
      });
    });
  });

  describe("Null Cases", () => {
    const nullTestCases = [
      "",
      "   ",
      "xyz",
      "abcdef", 
      "completely wrong",
      "12345",
      "!@#$%"
    ];

    nullTestCases.forEach((testInput, index) => {
      test(`should return null for invalid input ${index + 1}: "${testInput}"`, () => {
        const result = parseLocation(testInput);
        
        expect(result).toBeNull();
      });
    });
  });
});