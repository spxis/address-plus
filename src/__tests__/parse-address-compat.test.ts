/**
 * Comprehensive tests for parse-address compatibility
 * Uses JSON test data files for maintainable test cases
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

import { 
  parseAddress, 
  parseInformalAddress, 
  parseIntersection, 
  parseLocation
} from "../parser";
import type { ParsedAddress, ParsedIntersection } from "../types";

// Constants for test data paths
const TEST_DATA_ROOT_PATH = "../../test-data";

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

describe('Parse-Address Compatibility Tests', () => {
  describe('US Address Parsing - Basic Addresses', () => {
    const basicAddresses = loadTestData('us', 'basic.json');
    
    basicAddresses.forEach((testCase, index) => {
      it(`should parse basic address ${index + 1}: "${testCase.input}"`, () => {
        const result = parseAddress(testCase.input);
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

  describe('US Address Parsing - PO Box and Unit Addresses', () => {
    const unitAddresses = loadTestData('us', 'units-and-boxes.json');
    
    unitAddresses.forEach((testCase, index) => {
      it(`should parse unit/PO box address ${index + 1}: "${testCase.input}"`, () => {
        const result = testCase.input.toLowerCase().includes('box') 
          ? parseLocation(testCase.input) 
          : parseAddress(testCase.input);
        
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

  describe('US Address Parsing - Unusual Street Types', () => {
    const unusualTypes = loadTestData('us', 'unusual-types.json');
    
    unusualTypes.forEach((testCase, index) => {
      it(`should parse unusual street type ${index + 1}: "${testCase.input}"`, () => {
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

  describe('US Address Parsing - Edge Cases', () => {
    const edgeCases = loadTestData('us', 'edge-cases.json');
    
    edgeCases.forEach((testCase, index) => {
      it(`should handle edge case ${index + 1}: "${testCase.input}"`, () => {
        const result = parseLocation(testCase.input);
        
        if (testCase.shouldParse) {
          expect(result).toBeTruthy();
          
          if (testCase.expected) {
            Object.keys(testCase.expected).forEach(key => {
              expect((result as any)?.[key]).toBe(testCase.expected[key]);
            });
          }
        } else {
          // Some edge cases might return null for invalid input
          if (testCase.expected === null) {
            expect(result).toBeNull();
          }
        }
      });
    });
  });

  describe('parseLocation Function - Main Entry Point', () => {
    it('should detect and parse standard addresses', () => {
      const result = parseLocation('123 Main St, Anytown, NY 12345');
      expect(result).toBeTruthy();
      const address = result as ParsedAddress;
      expect(address?.number).toBe('123');
      expect(address?.street).toBe('Main');
      expect(address?.type).toBe('St');
    });

    it('should detect and parse intersections', () => {
      const result = parseLocation('Main St and Oak Ave, Anytown, NY');
      expect(result).toBeTruthy();
      const intersection = result as ParsedIntersection;
      expect(intersection?.street1).toBe('Main');
      expect(intersection?.type1).toBe('St');
      expect(intersection?.street2).toBe('Oak');
      expect(intersection?.type2).toBe('Ave');
    });

    it('should detect and parse PO boxes', () => {
      const result = parseLocation('PO Box 123, Anytown, NY 12345');
      expect(result).toBeTruthy();
      const address = result as ParsedAddress;
      expect(address?.secUnitType).toBe('PO Box');
      expect(address?.secUnitNum).toBe('123');
    });
  });

  describe('Error Handling', () => {
    it('should return null for empty input', () => {
      expect(parseAddress('')).toBeNull();
      expect(parseAddress('   ')).toBeNull();
      expect(parseIntersection('')).toBeNull();
      expect(parseLocation('')).toBeNull();
      expect(parseLocation('')).toBeNull();
    });

    it('should return null for non-string input', () => {
      expect(parseAddress(null as any)).toBeNull();
      expect(parseAddress(undefined as any)).toBeNull();
      expect(parseAddress(123 as any)).toBeNull();
    });

    it('should handle malformed addresses gracefully', () => {
      // These should either parse what they can or return null
      const results = [
        parseAddress('not an address'),
        parseAddress('123'),
        parseAddress('Main St'),
        parseIntersection('not an intersection'),
      ];
      
      // Results should either be null or have minimal valid data
      results.forEach(result => {
        if (result) {
          // If it parsed something, it should have at least one meaningful field
          const hasData = Object.values(result).some(value => value && value.trim());
          expect(hasData).toBe(true);
        }
      });
    });
  });

  describe('Street Type Normalization', () => {
    it('should normalize common street type variations', () => {
      const variations = [
        { input: '123 Main Street', expected: 'St' },
        { input: '123 Main Ave', expected: 'Ave' },
        { input: '123 Main Avenue', expected: 'Ave' },
        { input: '123 Main Blvd', expected: 'Blvd' },
        { input: '123 Main Boulevard', expected: 'Blvd' },
        { input: '123 Main Dr', expected: 'Dr' },
        { input: '123 Main Drive', expected: 'Dr' },
      ];

      variations.forEach(({ input, expected }) => {
        const result = parseAddress(input);
        expect(result?.type).toBe(expected);
      });
    });
  });

  describe('Directional Normalization', () => {
    it('should normalize directional prefixes and suffixes', () => {
      const variations = [
        { input: '123 North Main St', expectedPrefix: 'N' },
        { input: '123 N Main St', expectedPrefix: 'N' },
        { input: '123 Main St South', expectedSuffix: 'S' },
        { input: '123 Main St S', expectedSuffix: 'S' },
        { input: '123 Northeast Main St', expectedPrefix: 'NE' },
        { input: '123 NE Main St', expectedPrefix: 'NE' },
      ];

      variations.forEach(({ input, expectedPrefix, expectedSuffix }) => {
        const result = parseAddress(input);
        if (expectedPrefix) {
          expect(result?.prefix).toBe(expectedPrefix);
        }
        if (expectedSuffix) {
          expect(result?.suffix).toBe(expectedSuffix);
        }
      });
    });
  });

  describe('State Normalization', () => {
    it('should normalize state names to codes', () => {
      const variations = [
        { input: '123 Main St, Anytown, California 90210', expected: 'CA' },
        { input: '123 Main St, Anytown, CA 90210', expected: 'CA' },
        { input: '123 Main St, Anytown, New York 10001', expected: 'NY' },
        { input: '123 Main St, Anytown, NY 10001', expected: 'NY' },
      ];

      variations.forEach(({ input, expected }) => {
        const result = parseAddress(input);
        expect(result?.state).toBe(expected);
      });
    });
  });

  describe('Canadian Address Parsing - Basic Addresses', () => {
    const canadaBasicAddresses = loadTestData('canada', 'basic.json');
    
    canadaBasicAddresses.forEach((testCase, index) => {
      it(`should parse Canadian basic address ${index + 1}: "${testCase.input}"`, () => {
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

  describe('Canadian Address Parsing - Facilities', () => {
    const canadaFacilities = loadTestData('canada', 'facilities.json');
    
    canadaFacilities.forEach((testCase, index) => {
      it(`should parse Canadian facility address ${index + 1}: "${testCase.input}"`, () => {
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

  describe('Canadian Address Parsing - Special Postal', () => {
    const canadaSpecial = loadTestData('canada', 'special-postal.json');
    
    canadaSpecial.forEach((testCase, index) => {
      it(`should parse Canadian special postal address ${index + 1}: "${testCase.input}"`, () => {
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