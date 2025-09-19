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
const usNullCases = loadTestData("us", "null-cases.json");

const canadaBasicAddresses = loadTestData("canada", "basic.json");
const canadaFacilities = loadTestData("canada", "facilities.json");
const canadaSpecialPostal = loadTestData("canada", "special-postal.json");
const canadaEdgeCases = loadTestData("canada", "edge-cases.json");
const canadaFamousAddresses = loadTestData("canada", "famous.json");
const canadaFamousEdgeAddresses = loadTestData("canada", "famous-edge.json");
const canadaSpecialAlt = loadTestData("canada", "special.json");
const canadaNullCases = loadTestData("canada", "null-cases.json");

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
    
    describe("parseAddress Function Tests", () => {
      describe("US Basic Addresses with parseAddress", () => {
        usBasicAddresses.forEach((testCase, index) => {
          test(`parseAddress basic ${index + 1}: "${testCase.input}"`, () => {
            const result = parseAddress(testCase.input);
            expect(result).toBeTruthy();
            if (testCase.expected) {
              Object.keys(testCase.expected).forEach(key => {
                expect((result as any)?.[key]).toBe(testCase.expected[key]);
              });
            }
          });
        });
      });

      describe("US Facilities with parseAddress", () => {
        usFacilities.forEach((testCase, index) => {
          test(`parseAddress facility ${index + 1}: "${testCase.input}"`, () => {
            const result = parseAddress(testCase.input);
            expect(result).toBeTruthy();
          });
        });
      });

      describe("US Edge Cases with parseAddress", () => {
        usEdgeCases.forEach((testCase, index) => {
          test(`parseAddress edge case ${index + 1}: "${testCase.input}"`, () => {
            const result = parseAddress(testCase.input);
            expect(result).toBeTruthy();
          });
        });
      });

      describe("US Famous Addresses with parseAddress", () => {
        usFamousAddresses.forEach((testCase, index) => {
          test(`parseAddress famous ${index + 1}: "${testCase.input}"`, () => {
            const result = parseAddress(testCase.input);
            expect(result).toBeTruthy();
          });
        });
      });

      describe("Canadian Basic with parseAddress", () => {
        canadaBasicAddresses.forEach((testCase, index) => {
          test(`parseAddress CA basic ${index + 1}: "${testCase.input}"`, () => {
            const result = parseAddress(testCase.input);
            expect(result).toBeTruthy();
          });
        });
      });

      describe("Canadian Facilities with parseAddress", () => {
        canadaFacilities.forEach((testCase, index) => {
          test(`parseAddress CA facility ${index + 1}: "${testCase.input}"`, () => {
            const result = parseAddress(testCase.input);
            expect(result).toBeTruthy();
          });
        });
      });

      describe("US Compatibility with parseAddress", () => {
        usCompatibilityTests.forEach((testCase, index) => {
          test(`parseAddress compatibility ${index + 1}: "${testCase.input}"`, () => {
            const result = parseAddress(testCase.input);
            expect(result).toBeTruthy();
          });
        });
      });

      describe("US Intersections with parseAddress", () => {
        usIntersections.forEach((testCase, index) => {
          test(`parseAddress intersection ${index + 1}: "${testCase.input}"`, () => {
            const result = parseAddress(testCase.input);
            expect(result).toBeTruthy();
          });
        });
      });

      describe("US Units and Boxes with parseAddress", () => {
        usUnitsAndBoxes.forEach((testCase, index) => {
          test(`parseAddress units ${index + 1}: "${testCase.input}"`, () => {
            const result = parseAddress(testCase.input);
            expect(result).toBeTruthy();
          });
        });
      });

      describe("US Famous Edge with parseAddress", () => {
        usFamousEdgeAddresses.forEach((testCase, index) => {
          test(`parseAddress famous edge ${index + 1}: "${testCase.input}"`, () => {
            const result = parseAddress(testCase.input);
            expect(result).toBeTruthy();
          });
        });
      });

      describe("US Special with parseAddress", () => {
        usSpecialAddresses.forEach((testCase, index) => {
          test(`parseAddress special ${index + 1}: "${testCase.input}"`, () => {
            const result = parseAddress(testCase.input);
            expect(result).toBeTruthy();
          });
        });
      });

      describe("US Unusual Types with parseAddress", () => {
        usUnusualTypes.forEach((testCase, index) => {
          test(`parseAddress unusual ${index + 1}: "${testCase.input}"`, () => {
            const result = parseAddress(testCase.input);
            expect(result).toBeTruthy();
          });
        });
      });

      describe("Canadian Special Postal with parseAddress", () => {
        canadaSpecialPostal.forEach((testCase, index) => {
          test(`parseAddress CA special postal ${index + 1}: "${testCase.input}"`, () => {
            const result = parseAddress(testCase.input);
            expect(result).toBeTruthy();
          });
        });
      });

      describe("Canadian Famous with parseAddress", () => {
        canadaFamousAddresses.forEach((testCase, index) => {
          test(`parseAddress CA famous ${index + 1}: "${testCase.input}"`, () => {
            const result = parseAddress(testCase.input);
            expect(result).toBeTruthy();
          });
        });
      });

      describe("Canadian Famous Edge with parseAddress", () => {
        canadaFamousEdgeAddresses.forEach((testCase, index) => {
          test(`parseAddress CA famous edge ${index + 1}: "${testCase.input}"`, () => {
            const result = parseAddress(testCase.input);
            expect(result).toBeTruthy();
          });
        });
      });

      describe("Canadian Special Alt with parseAddress", () => {
        canadaSpecialAlt.forEach((testCase, index) => {
          test(`parseAddress CA special alt ${index + 1}: "${testCase.input}"`, () => {
            const result = parseAddress(testCase.input);
            expect(result).toBeTruthy();
          });
        });
      });
    });

    describe("parseInformalAddress Function Tests", () => {
      describe("US Basic Addresses with parseInformalAddress", () => {
        usBasicAddresses.forEach((testCase, index) => {
          test(`parseInformalAddress basic ${index + 1}: "${testCase.input}"`, () => {
            const result = parseInformalAddress(testCase.input);
            expect(result).toBeTruthy();
          });
        });
      });

      describe("US Facilities with parseInformalAddress", () => {
        usFacilities.forEach((testCase, index) => {
          test(`parseInformalAddress facility ${index + 1}: "${testCase.input}"`, () => {
            const result = parseInformalAddress(testCase.input);
            expect(result).toBeTruthy();
          });
        });
      });

      describe("US Edge Cases with parseInformalAddress", () => {
        usEdgeCases.forEach((testCase, index) => {
          test(`parseInformalAddress edge case ${index + 1}: "${testCase.input}"`, () => {
            const result = parseInformalAddress(testCase.input);
            expect(result).toBeTruthy();
          });
        });
      });

      describe("Canadian Basic with parseInformalAddress", () => {
        canadaBasicAddresses.forEach((testCase, index) => {
          test(`parseInformalAddress CA basic ${index + 1}: "${testCase.input}"`, () => {
            const result = parseInformalAddress(testCase.input);
            expect(result).toBeTruthy();
          });
        });
      });

      describe("Canadian Edge Cases with parseInformalAddress", () => {
        canadaEdgeCases.forEach((testCase, index) => {
          test(`parseInformalAddress CA edge ${index + 1}: "${testCase.input}"`, () => {
            const result = parseInformalAddress(testCase.input);
            expect(result).toBeTruthy();
          });
        });
      });

      describe("US Compatibility with parseInformalAddress", () => {
        usCompatibilityTests.forEach((testCase, index) => {
          test(`parseInformalAddress compatibility ${index + 1}: "${testCase.input}"`, () => {
            const result = parseInformalAddress(testCase.input);
            expect(result).toBeTruthy();
          });
        });
      });

      describe("US Intersections with parseInformalAddress", () => {
        usIntersections.forEach((testCase, index) => {
          test(`parseInformalAddress intersection ${index + 1}: "${testCase.input}"`, () => {
            const result = parseInformalAddress(testCase.input);
            expect(result).toBeTruthy();
          });
        });
      });

      describe("US Units and Boxes with parseInformalAddress", () => {
        usUnitsAndBoxes.forEach((testCase, index) => {
          test(`parseInformalAddress units ${index + 1}: "${testCase.input}"`, () => {
            const result = parseInformalAddress(testCase.input);
            expect(result).toBeTruthy();
          });
        });
      });

      describe("US Famous Edge with parseInformalAddress", () => {
        usFamousEdgeAddresses.forEach((testCase, index) => {
          test(`parseInformalAddress famous edge ${index + 1}: "${testCase.input}"`, () => {
            const result = parseInformalAddress(testCase.input);
            expect(result).toBeTruthy();
          });
        });
      });

      describe("US Special with parseInformalAddress", () => {
        usSpecialAddresses.forEach((testCase, index) => {
          test(`parseInformalAddress special ${index + 1}: "${testCase.input}"`, () => {
            const result = parseInformalAddress(testCase.input);
            expect(result).toBeTruthy();
          });
        });
      });

      describe("US Unusual Types with parseInformalAddress", () => {
        usUnusualTypes.forEach((testCase, index) => {
          test(`parseInformalAddress unusual ${index + 1}: "${testCase.input}"`, () => {
            const result = parseInformalAddress(testCase.input);
            expect(result).toBeTruthy();
          });
        });
      });

      describe("Canadian Facilities with parseInformalAddress", () => {
        canadaFacilities.forEach((testCase, index) => {
          test(`parseInformalAddress CA facility ${index + 1}: "${testCase.input}"`, () => {
            const result = parseInformalAddress(testCase.input);
            expect(result).toBeTruthy();
          });
        });
      });

      describe("Canadian Special Postal with parseInformalAddress", () => {
        canadaSpecialPostal.forEach((testCase, index) => {
          test(`parseInformalAddress CA special postal ${index + 1}: "${testCase.input}"`, () => {
            const result = parseInformalAddress(testCase.input);
            expect(result).toBeTruthy();
          });
        });
      });

      describe("Canadian Famous with parseInformalAddress", () => {
        canadaFamousAddresses.forEach((testCase, index) => {
          test(`parseInformalAddress CA famous ${index + 1}: "${testCase.input}"`, () => {
            const result = parseInformalAddress(testCase.input);
            expect(result).toBeTruthy();
          });
        });
      });

      describe("Canadian Famous Edge with parseInformalAddress", () => {
        canadaFamousEdgeAddresses.forEach((testCase, index) => {
          test(`parseInformalAddress CA famous edge ${index + 1}: "${testCase.input}"`, () => {
            const result = parseInformalAddress(testCase.input);
            expect(result).toBeTruthy();
          });
        });
      });

      describe("Canadian Special Alt with parseInformalAddress", () => {
        canadaSpecialAlt.forEach((testCase, index) => {
          test(`parseInformalAddress CA special alt ${index + 1}: "${testCase.input}"`, () => {
            const result = parseInformalAddress(testCase.input);
            expect(result).toBeTruthy();
          });
        });
      });
    });
  });

  describe("Null Cases", () => {
    describe("US Null Cases", () => {
      usNullCases.forEach((testCase, index) => {
        test(`should return null for US invalid input ${index + 1}: "${testCase.input}"`, () => {
          const result = parseLocation(testCase.input);
          expect(result).toBeNull();
        });
      });
    });

    describe("Canadian Null Cases", () => {
      canadaNullCases.forEach((testCase, index) => {
        test(`should return null for Canadian invalid input ${index + 1}: "${testCase.input}"`, () => {
          const result = parseLocation(testCase.input);
          expect(result).toBeNull();
        });
      });
    });

    // Legacy hardcoded null cases
    const legacyNullTestCases = [
      "",
      "   ",
      "xyz",
      "abcdef", 
      "completely wrong",
      "12345",
      "!@#$%"
    ];

    legacyNullTestCases.forEach((testInput, index) => {
      test(`should return null for legacy invalid input ${index + 1}: "${testInput}"`, () => {
        const result = parseLocation(testInput);
        expect(result).toBeNull();
      });
    });
  });
});