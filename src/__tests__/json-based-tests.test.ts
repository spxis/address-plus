/**
 * Comprehensive test cases using JSON test data files
 * This replaces hardcoded tests with maintainable JSON-based test data
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { 
  parseLocation, 
  parseAddress, 
  parseIntersection, 
  parseInformalAddress
} from "../parser";
import type { ParsedAddress, ParsedIntersection } from "../types";

// Helper to load test data by country and filename
function loadTestData(country: 'us' | 'canada', filename: string): any[] {
  const filePath = join(__dirname, '../../test-data', country, filename);
  const data = JSON.parse(readFileSync(filePath, 'utf-8'));
  
  // If it's already an array, return it directly
  if (Array.isArray(data)) {
    return data;
  }
  
  // Otherwise, extract the array from the first key
  const firstKey = Object.keys(data).find(key => key !== 'description');
  return firstKey ? data[firstKey] || [] : [];
}

describe('JSON-Based Address Parser Tests', () => {
  describe('US Basic Address Parsing', () => {
    const basicAddresses = loadTestData('us', 'basic.json');
    
    basicAddresses.forEach((testCase, index) => {
      it(`should parse basic address ${index + 1}: "${testCase.input}"`, () => {
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

  describe('US Compatibility Tests', () => {
    const compatibilityTests = loadTestData('us', 'compatibility.json');
    
    compatibilityTests.forEach((testCase, index) => {
      it(`should parse compatibility case ${index + 1}: "${testCase.input}"`, () => {
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

  describe('US Intersection Parsing', () => {
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

  describe('US Facilities', () => {
    const facilities = loadTestData('us', 'facilities.json');
    
    facilities.forEach((testCase, index) => {
      it(`should parse facility ${index + 1}: "${testCase.input}"`, () => {
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

  describe('US Units and PO Boxes', () => {
    const unitsAndBoxes = loadTestData('us', 'units-and-boxes.json');
    
    unitsAndBoxes.forEach((testCase, index) => {
      it(`should parse unit/PO box ${index + 1}: "${testCase.input}"`, () => {
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

  describe('US Edge Cases', () => {
    const edgeCases = loadTestData('us', 'edge-cases.json');
    
    edgeCases.forEach((testCase, index) => {
      it(`should parse edge case ${index + 1}: "${testCase.input}"`, () => {
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

  describe('Canadian Basic Address Parsing', () => {
    const basicAddresses = loadTestData('canada', 'basic.json');
    
    basicAddresses.forEach((testCase, index) => {
      it(`should parse Canadian basic address ${index + 1}: "${testCase.input}"`, () => {
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

  describe('Canadian Facilities', () => {
    const facilities = loadTestData('canada', 'facilities.json');
    
    facilities.forEach((testCase, index) => {
      it(`should parse Canadian facility ${index + 1}: "${testCase.input}"`, () => {
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

  describe('Canadian Special Postal', () => {
    const specialPostal = loadTestData('canada', 'special-postal.json');
    
    specialPostal.forEach((testCase, index) => {
      it(`should parse Canadian special postal ${index + 1}: "${testCase.input}"`, () => {
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
});