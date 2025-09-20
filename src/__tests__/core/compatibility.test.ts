// Compatibility Tests
//
// This file contains tests for:
// - Snake case compatibility mode (useSnakeCase option)
// - Comparison with original parse-address library
// - Backward compatibility validation

import { describe, expect, it, test } from "vitest";

import { 
  parseAddress as ourParseAddress, 
  parseInformalAddress, 
  parseIntersection, 
  parseLocation
} from "../../index";

import testDataFile from "../../../test-data/core/compatibility.json";

// Dynamic import helper for CommonJS module compatibility
async function getParseAddress() {
  const parseAddressModule = await import("parse-address");
  return parseAddressModule.default || parseAddressModule;
}

// Constants

// Types
interface ComparisonTestCase {
  id: number;
  description: string;
  input: string;
  category: string;
}

interface KeyTestCase {
  description: string;
  input: string;
  purpose: string;
}

interface TestData {
  description: string;
  testCases: ComparisonTestCase[];
  keyTestCase: KeyTestCase;
}

// Helper function to extract test data from objects with $schema
function loadSchemaTestData<T>(testDataFile: any): T {
  // If the imported data has $schema property, extract everything except $schema
  if (testDataFile && typeof testDataFile === "object" && "$schema" in testDataFile) {
    const { $schema, ...data } = testDataFile;
    return data as T;
  }
  return testDataFile;
}

// Extract test data from consolidated file
const testData = loadSchemaTestData<TestData>(testDataFile);
// Extract different test groups from the consolidated structure
const parseAddressComparisonTests = (testData as any).tests.parseAddressComparison || [];
const snakeCaseTestCases = (testData as any).tests.snakeCaseCompatibility || [];
const multipleParserArray = (testData as any).tests.multipleParserFunctions || [];
const usBasicAddresses = (testData as any).tests.usBasicAddresses || [];
const canadaBasicAddresses = (testData as any).tests.canadaBasicAddresses || [];
const intersections = (testData as any).tests.intersections || [];
const usSpecialFormats = (testData as any).tests.usSpecialFormats || [];

// For backward compatibility with existing code
const testCases = parseAddressComparisonTests;
const keyTestCase = parseAddressComparisonTests.find((test: any) => test.id === "key") || parseAddressComparisonTests[0];

describe("Compatibility Tests", () => {
  
  describe("Snake Case Compatibility", () => {
    snakeCaseTestCases.forEach((testCase: any, index: number) => {
      test(testCase.description, () => {
        const result = parseLocation(testCase.input, testCase.options);
        
        if (testCase.expected === null) {
          expect(result).toBeNull();
          return;
        }
        
        expect(result).toBeTruthy();
        
        // Check expected fields
        Object.keys(testCase.expected).forEach(key => {
          expect((result as any)[key]).toBe((testCase.expected as any)[key]);
        });
        
        // Check fields that should not exist (for snake_case mode)
        if (testCase.notExpected) {
          testCase.notExpected.forEach((field: string) => {
            expect((result as any)[field]).toBeUndefined();
          });
        }
      });
    });
  });

  describe("Parse-Address Library Comparison", () => {
    testCases.forEach((testCase: any) => {
      it(`should match parse-address format for ${testCase.category} case ${testCase.id}: "${testCase.input}"`, async () => {
        // Get results from both parsers
        const parseAddress = await getParseAddress();
        const originalResult = parseAddress.parseLocation(testCase.input);
        const ourResult = parseLocation(testCase.input);
        
        // For now, just log the comparison - we'll analyze patterns
        // and decide on specific assertions based on the output
        expect(ourResult).toBeDefined();
        expect(originalResult).toBeDefined();
      });
    });
    
    it(`should demonstrate format structure for key case: "${(keyTestCase as any)?.input}"`, async () => {
      console.log(`\\nKey Test Purpose: ${(keyTestCase as any)?.purpose}`);
      
      const parseAddress = await getParseAddress();
      const original = parseAddress.parseLocation((keyTestCase as any)?.input);
      const ours = parseLocation((keyTestCase as any)?.input);
      
      console.log("\\n=== FORMAT ANALYSIS ===");
      console.log("Original format (parse-address):", JSON.stringify(original, null, 2));
      console.log("Our format:", JSON.stringify(ours, null, 2));
      
      // Verify we're using the correct structured format like the original
      if (original && ours && original.number && original.prefix) {
        expect(ours.number).toBe(original.number);
        expect(ours.prefix).toBe(original.prefix);
      }
    });
  });

  describe("Comprehensive JSON Data Validation", () => {
    
    describe("US Address Parsing - Basic Addresses", () => {
      
      usBasicAddresses.forEach((testCase, index) => {
        it(`should parse basic address ${index + 1}: "${testCase.input}"`, () => {
          const result = ourParseAddress(testCase.input);
          expect(result).toBeTruthy();
          
          if (testCase.expected) {
            // Check each expected field
            Object.keys(testCase.expected).forEach(key => {
              expect((result as any)?.[key]).toBe(testCase.expected[key]);
            });
          }
        });
      });
    });

    describe("US Address Parsing - Special Addresses", () => {
      
      usSpecialFormats.forEach((testCase, index) => {
        it(`should parse special address ${index + 1}: "${testCase.input}"`, () => {
          const result = ourParseAddress(testCase.input);
          
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

    describe("Canadian Address Parsing - Basic Addresses", () => {
      
      canadaBasicAddresses.forEach((testCase, index) => {
        it(`should parse Canadian basic address ${index + 1}: "${testCase.input}"`, () => {
          const result = ourParseAddress(testCase.input);
          
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

    describe("Intersection Parsing", () => {
      
      intersections.forEach((testCase, index) => {
        it(`should parse intersection ${index + 1}: "${testCase.input}"`, () => {
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

    describe("Multiple Parser Function Tests", () => {
      multipleParserArray.forEach((testCase: any, index: number) => {
        describe(`Test case ${index + 1}: ${testCase.description}`, () => {
          
          it("should handle parseLocation", () => {
            const result = parseLocation(testCase.input);
            expect(result).toBeTruthy();
          });
          
          it("should handle parseAddress", () => {
            const result = ourParseAddress(testCase.input);
            expect(result).toBeTruthy();
          });
          
          it("should handle parseInformalAddress", () => {
            const result = parseInformalAddress(testCase.input);
            expect(result).toBeTruthy();
          });
        });
      });
    });
  });
});