/**
 * Test parsing of famous addresses using JSON test data
 */

import { describe, test, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseAddress } from '../index';

interface AddressTestCase {
  input: string;
  expected: {
    number?: string;
    prefix?: string;
    street?: string;
    type?: string;
    suffix?: string;
    city?: string;
    state?: string;
    zip?: string;
    zipext?: string;
    country?: string;
    [key: string]: any;
  };
}

describe('Famous Address Parsing (JSON Data)', () => {
  // Load test data from JSON file
  const testDataPath = join(process.cwd(), 'test-data', 'us', 'famous.json');
  const testCases: AddressTestCase[] = JSON.parse(readFileSync(testDataPath, 'utf-8'));

  // Test each case from the JSON file
  testCases.forEach((testCase, index) => {
    test(`${testCase.input} (${index + 1})`, () => {
      const result = parseAddress(testCase.input);
      
      // Check that we got a result
      expect(result).toBeTruthy();
      
      // Check each expected field
      Object.keys(testCase.expected).forEach(key => {
        if (testCase.expected[key] !== undefined) {
          const actualValue = (result as any)?.[key];
          const expectedValue = testCase.expected[key];
          expect(actualValue, `Expected ${key} to be "${expectedValue}" but got "${actualValue}"`).toBe(expectedValue);
        }
      });
    });
  });
});