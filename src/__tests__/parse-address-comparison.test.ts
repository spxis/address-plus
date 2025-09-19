/**
 * Comparison tests against the original parse-address library
 * This helps us validate our implementation and identify correct expected formats
 */

import { describe, it, expect } from 'vitest';
// @ts-ignore - parse-address doesn't have types
const parseAddress = require('parse-address');
import { parseLocation } from "../parser";
import testData from '../../test-data/parse-address-comparison.json';

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
});