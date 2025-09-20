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

import { describe, expect, test } from "vitest";

import { parseAddress, parseInformalAddress, parseIntersection, parseLocation } from "../../parser";

// Import all test data from JSON files
import usBasicTestData from "../../../test-data/us/basic.json";
import usCompatibilityTestData from "../../../test-data/us/compatibility.json";
import usIntersectionTestData from "../../../test-data/us/intersections.json";
import usSecondaryUnitsTestData from "../../../test-data/us/secondary-units.json";
import usSpecialCasesTestData from "../../../test-data/us/special-cases.json";
import usFamousTestData from "../../../test-data/us/famous-addresses.json";
import usUnusualTypesTestData from "../../../test-data/us/unusual-types.json";
import usNullCasesTestData from "../../../test-data/us/null-cases.json";
import usStrictModeTestData from "../../../test-data/us/strict-mode.json";
import canadaBasicTestData from "../../../test-data/canada/basic.json";
import canadaFamousTestData from "../../../test-data/canada/famous-addresses.json";
import canadaSpecialCasesTestData from "../../../test-data/canada/special-cases.json";
import canadaSpecialPostalTestData from "../../../test-data/canada/special-postal.json";
import canadaNullCasesTestData from "../../../test-data/canada/null-cases.json";
import canadaStrictModeTestData from "../../../test-data/canada/strict-mode.json";

describe("Address Plus Parser", () => {
  describe("parseLocation", () => {
    // US Basic Addresses
    describe("US Basic Addresses", () => {
      usBasicTestData.tests.basic.forEach((testCase: any, index: number) => {
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

    // US Compatibility Tests
    describe("US Compatibility Tests", () => {
      usCompatibilityTestData.tests.compatibility.forEach((testCase: any, index: number) => {
        test(`should parse US compatibility case ${index + 1}: "${testCase.input}"`, () => {
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

    // US Secondary Units
    describe("US Secondary Units", () => {
      usSecondaryUnitsTestData.tests.unitsAndBoxes.forEach((testCase: any, index: number) => {
        test(`should parse US secondary unit ${index + 1}: "${testCase.input}"`, () => {
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

    // US Special Cases
    describe("US Special Cases", () => {
      usSpecialCasesTestData.tests.formats.forEach((testCase: any, index: number) => {
        test(`should parse US special format ${index + 1}: "${testCase.input}"`, () => {
          const result = parseLocation(testCase.input);
          if (testCase.should_parse === false) {
            expect(result).toBeNull();
          } else {
            expect(result).toBeTruthy();
            
            if (testCase.expected) {
              Object.keys(testCase.expected).forEach(key => {
                expect((result as any)?.[key]).toBe(testCase.expected[key]);
              });
            }
          }
        });
      });
      
      usSpecialCasesTestData.tests.edgeCases.forEach((testCase: any, index: number) => {
        test(`should parse US special edge case ${index + 1}: "${testCase.input}"`, () => {
          const result = parseLocation(testCase.input);
          if (testCase.should_parse === false) {
            expect(result).toBeNull();
          } else {
            expect(result).toBeTruthy();
            
            if (testCase.expected) {
              Object.keys(testCase.expected).forEach(key => {
                expect((result as any)?.[key]).toBe(testCase.expected[key]);
              });
            }
          }
        });
      });
    });

    // US Famous Addresses
    describe("US Famous Addresses", () => {
      usFamousTestData.tests.standard.forEach((testCase: any, index: number) => {
        test(`should parse US famous address ${index + 1}: "${testCase.input}"`, () => {
          const result = parseLocation(testCase.input);
          expect(result).toBeTruthy();
          
          if (testCase.expected) {
            Object.keys(testCase.expected).forEach(key => {
              expect((result as any)?.[key]).toBe(testCase.expected[key]);
            });
          }
        });
      });
      
      usFamousTestData.tests.edgeCases.forEach((testCase: any, index: number) => {
        test(`should parse US famous edge case ${index + 1}: "${testCase.input}"`, () => {
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

    // US Unusual Types
    describe("US Unusual Types", () => {
      usUnusualTypesTestData.tests.unusualTypes.forEach((testCase: any, index: number) => {
        test(`should parse US unusual type ${index + 1}: "${testCase.input}"`, () => {
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

    // US Null Cases
    describe("US Null Cases", () => {
      usNullCasesTestData.tests.nullCases.forEach((testCase: any, index: number) => {
        test(`should handle US null case ${index + 1}: "${testCase.input}"`, () => {
          const result = parseLocation(testCase.input);
          if (testCase.should_parse === false) {
            expect(result).toBeNull();
          } else {
            expect(result).toBeTruthy();
          }
        });
      });
    });

    // Canada Basic Addresses
    describe("Canada Basic Addresses", () => {
      canadaBasicTestData.tests.basic.forEach((testCase: any, index: number) => {
        test(`should parse Canada basic address ${index + 1}: "${testCase.input}"`, () => {
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

    // Canada Famous Addresses
    describe("Canada Famous Addresses", () => {
      canadaFamousTestData.tests.standard.forEach((testCase: any, index: number) => {
        test(`should parse Canada famous address ${index + 1}: "${testCase.input}"`, () => {
          const result = parseLocation(testCase.input);
          expect(result).toBeTruthy();
          
          if (testCase.expected) {
            Object.keys(testCase.expected).forEach(key => {
              expect((result as any)?.[key]).toBe(testCase.expected[key]);
            });
          }
        });
      });
      
      canadaFamousTestData.tests.edgeCases.forEach((testCase: any, index: number) => {
        test(`should parse Canada famous edge case ${index + 1}: "${testCase.input}"`, () => {
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

    // Canada Special Cases
    describe("Canada Special Cases", () => {
      canadaSpecialCasesTestData.tests.formats.forEach((testCase: any, index: number) => {
        test(`should parse Canada special format ${index + 1}: "${testCase.input}"`, () => {
          const result = parseLocation(testCase.input);
          if (testCase.should_parse === false) {
            expect(result).toBeNull();
          } else {
            expect(result).toBeTruthy();
            
            if (testCase.expected) {
              Object.keys(testCase.expected).forEach(key => {
                expect((result as any)?.[key]).toBe(testCase.expected[key]);
              });
            }
          }
        });
      });
      
      canadaSpecialCasesTestData.tests.edgeCases.forEach((testCase: any, index: number) => {
        test(`should parse Canada special edge case ${index + 1}: "${testCase.input}"`, () => {
          const result = parseLocation(testCase.input);
          if (testCase.should_parse === false) {
            expect(result).toBeNull();
          } else {
            expect(result).toBeTruthy();
            
            if (testCase.expected) {
              Object.keys(testCase.expected).forEach(key => {
                expect((result as any)?.[key]).toBe(testCase.expected[key]);
              });
            }
          }
        });
      });
    });

    // Canada Special Postal
    describe("Canada Special Postal", () => {
      canadaSpecialPostalTestData.tests.specialPostal.forEach((testCase: any, index: number) => {
        test(`should parse Canada special postal ${index + 1}: "${testCase.input}"`, () => {
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

    // Canada Null Cases
    describe("Canada Null Cases", () => {
      canadaNullCasesTestData.tests.nullCases.forEach((testCase: any, index: number) => {
        test(`should handle Canada null case ${index + 1}: "${testCase.input}"`, () => {
          const result = parseLocation(testCase.input);
          if (testCase.should_parse === false) {
            expect(result).toBeNull();
          } else {
            expect(result).toBeTruthy();
          }
        });
      });
    });
  });

  describe("parseIntersection", () => {
    // US Intersections
    describe("US Intersections", () => {
      usIntersectionTestData.tests.intersections.forEach((testCase: any, index: number) => {
        test(`should parse US intersection ${index + 1}: "${testCase.input}"`, () => {
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
  });

  describe("parseAddress (Strict Mode)", () => {
    // US Strict Mode Tests
    describe("US Strict Mode", () => {
      usStrictModeTestData.tests.strictMode.forEach((testCase: any, index: number) => {
        test(`should parse US strict mode ${index + 1}: "${testCase.input}"`, () => {
          const result = parseAddress(testCase.input);
          if (testCase.should_parse === false) {
            expect(result).toBeNull();
          } else {
            expect(result).toBeTruthy();
            
            if (testCase.expected) {
              Object.keys(testCase.expected).forEach(key => {
                expect((result as any)?.[key]).toBe(testCase.expected[key]);
              });
            }
          }
        });
      });
    });

    // Canada Strict Mode Tests
    describe("Canada Strict Mode", () => {
      canadaStrictModeTestData.tests.strictMode.forEach((testCase: any, index: number) => {
        test(`should parse Canada strict mode ${index + 1}: "${testCase.input}"`, () => {
          const result = parseAddress(testCase.input);
          if (testCase.should_parse === false) {
            expect(result).toBeNull();
          } else {
            expect(result).toBeTruthy();
            
            if (testCase.expected) {
              Object.keys(testCase.expected).forEach(key => {
                expect((result as any)?.[key]).toBe(testCase.expected[key]);
              });
            }
          }
        });
      });
    });
  });

  describe("parseInformalAddress", () => {
    // Test informal parsing with basic US addresses
    describe("Informal US Addresses", () => {
      usBasicTestData.tests.basic.slice(0, 10).forEach((testCase: any, index: number) => {
        test(`should informally parse US address ${index + 1}: "${testCase.input}"`, () => {
          const result = parseInformalAddress(testCase.input);
          // Informal parsing should be more lenient
          expect(result).toBeTruthy();
        });
      });
    });

    // Test informal parsing with basic Canada addresses
    describe("Informal Canada Addresses", () => {
      canadaBasicTestData.tests.basic.slice(0, 10).forEach((testCase: any, index: number) => {
        test(`should informally parse Canada address ${index + 1}: "${testCase.input}"`, () => {
          const result = parseInformalAddress(testCase.input);
          // Informal parsing should be more lenient
          expect(result).toBeTruthy();
        });
      });
    });
  });
});
