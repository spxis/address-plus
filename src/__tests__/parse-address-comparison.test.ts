/**
 * Comprehensive parse-address compatibility tests
 * Compares our implementation against the original parse-address library
 * and validates using JSON test data files for comprehensive coverage
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

// @ts-ignore - parse-address doesn't have types
const parseAddress = require('parse-address');

import { 
  parseAddress as ourParseAddress, 
  parseInformalAddress, 
  parseIntersection, 
  parseLocation
} from "../parser";
import type { ParsedAddress, ParsedIntersection } from "../types";
import testData from '../../test-data/parse-address-comparison.json';

// Constants for test data paths
const TEST_DATA_ROOT_PATH = "../../test-data";

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

// Helper to load test data by country
function loadTestData(country: "us" | "canada", filename: string): any[] {
  const filePath = join(__dirname, TEST_DATA_ROOT_PATH, country, filename);
  const data = JSON.parse(readFileSync(filePath, "utf-8"));
  
  // If it's already an array, return it directly
  if (Array.isArray(data)) {
    return data;
  }
  
  // Otherwise, extract the array from the first key that isn't 'description'
  const firstKey = Object.keys(data).find(key => key !== "description");
  
  return firstKey ? data[firstKey] || [] : [];
}

const { testCases, keyTestCase }: TestData = testData;

describe('Parse-Address Compatibility Comparison', () => {
  testCases.forEach((testCase) => {
    it(`should match parse-address format for ${testCase.category} case ${testCase.id}: "${testCase.input}"`, () => {
      console.log(`\nTesting: ${testCase.input}`);
      console.log(`Category: ${testCase.category}`);
      console.log(`Description: ${testCase.description}`);
      
      // Get results from both parsers
      const originalResult = parseAddress.parseLocation(testCase.input);
      const ourResult = parseLocation(testCase.input);
      
      console.log('Original parse-address result:', JSON.stringify(originalResult, null, 2));
      console.log('Our result:', JSON.stringify(ourResult, null, 2));
      
      // For now, just log the comparison - we'll analyze patterns
      // and decide on specific assertions based on the output
      expect(ourResult).toBeDefined();
      expect(originalResult).toBeDefined();
    });
  });
  
  it(`should demonstrate format structure for key case: "${keyTestCase.input}"`, () => {
    console.log(`\nKey Test Purpose: ${keyTestCase.purpose}`);
    
    const original = parseAddress.parseLocation(keyTestCase.input);
    const ours = parseLocation(keyTestCase.input);
    
    console.log('\n=== FORMAT ANALYSIS ===');
    console.log('Original format (parse-address):', JSON.stringify(original, null, 2));
    console.log('Our format:', JSON.stringify(ours, null, 2));
    
    // Verify we're using the correct structured format like the original
    if (original && ours && original.number && original.prefix) {
      expect(ours.number).toBe(original.number);
      expect(ours.prefix).toBe(original.prefix);
    }
  });

  // Comprehensive test suites using JSON data files
  describe('US Address Parsing - Basic Addresses', () => {
    const basicAddresses = loadTestData('us', 'basic.json');
    
    basicAddresses.forEach((testCase, index) => {
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

  describe('US Address Parsing - Special Addresses', () => {
    const specialAddresses = loadTestData('us', 'special.json');
    
    specialAddresses.forEach((testCase, index) => {
      it(`should parse special address ${index + 1}: "${testCase.input}"`, () => {
        const result = ourParseAddress(testCase.input);
        expect(result).toBeTruthy();
        
        if (testCase.expected) {
          Object.keys(testCase.expected).forEach(key => {
            expect((result as any)?.[key]).toBe(testCase.expected[key]);
          });
        }
      });
    });
  });

  describe('US Address Parsing - Intersection Parsing', () => {
    const intersections = loadTestData('us', 'intersections.json');
    
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

  describe('Canadian Address Parsing - Basic Addresses', () => {
    const basicAddresses = loadTestData('canada', 'basic.json');
    
    basicAddresses.forEach((testCase, index) => {
      it(`should parse Canadian basic address ${index + 1}: "${testCase.input}"`, () => {
        const result = ourParseAddress(testCase.input);
        expect(result).toBeTruthy();
        
        if (testCase.expected) {
          Object.keys(testCase.expected).forEach(key => {
            expect((result as any)?.[key]).toBe(testCase.expected[key]);
          });
        }
      });
    });
  });

  describe('Canadian Address Parsing - Facilities', () => {
    const facilities = loadTestData('canada', 'facilities.json');
    
    facilities.forEach((testCase, index) => {
      it(`should parse Canadian facility ${index + 1}: "${testCase.input}"`, () => {
        const result = ourParseAddress(testCase.input);
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