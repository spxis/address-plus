/**
 * Comparison tests against the original parse-address library
 * This helps us validate our implementation and identify correct expected formats
 */

import { describe, it, expect } from 'vitest';
// @ts-ignore - parse-address doesn't have types
const parseAddress = require('parse-address');
import { parseLocation } from "../parser";

// Test cases that were causing format conflicts
const comparisonTestCases = [
  '48S 400E, Salt Lake City UT',
  '550 S 400 E #3206, Salt Lake City UT 84111',
  '233 S Wacker Dr 60606-6306',
  '1005 Gravenstein Hwy 95472',
  '123 Main St, Anytown CA 12345',
  '#42 233 S Wacker Dr 60606',
  'Mission & Valencia San Francisco CA'
];

describe('Parse-Address Compatibility Comparison', () => {
  comparisonTestCases.forEach((address, index) => {
    it(`should match parse-address format for case ${index + 1}: "${address}"`, () => {
      console.log(`\nTesting: ${address}`);
      
      // Get results from both parsers
      const originalResult = parseAddress.parseLocation(address);
      const ourResult = parseLocation(address);
      
      console.log('Original parse-address result:', JSON.stringify(originalResult, null, 2));
      console.log('Our result:', JSON.stringify(ourResult, null, 2));
      
      // For now, just log the comparison - we'll analyze patterns
      // and decide on specific assertions based on the output
      expect(ourResult).toBeDefined();
      expect(originalResult).toBeDefined();
    });
  });
  
  it('should demonstrate format structure for key cases', () => {
    const keyTestCase = '48S 400E, Salt Lake City UT';
    const original = parseAddress.parseLocation(keyTestCase);
    const ours = parseLocation(keyTestCase);
    
    console.log('\n=== FORMAT ANALYSIS ===');
    console.log('Original format (parse-address):', JSON.stringify(original, null, 2));
    console.log('Our format:', JSON.stringify(ours, null, 2));
    
    // Verify we're using the correct structured format like the original
    if (original && ours && original.number && original.prefix) {
      expect(ours.number).toBe(original.number);
      expect(ours.prefix).toBe(original.prefix);
    }
  });
});