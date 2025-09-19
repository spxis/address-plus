/**
 * Strategic tests for snake_case compatibility mode
 * Tests the useSnakeCase option to ensure backward compatibility with parse-address NPM module
 */

import { describe, expect, test } from "vitest";

import { parseLocation } from "../index";

// Import test data from JSON file
import snakeCaseTests from "./test-data/snake-case-compatibility.json";

describe('Snake Case Compatibility Tests', () => {
  
  snakeCaseTests.forEach((testCase, index) => {
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
        testCase.notExpected.forEach(field => {
          expect((result as any)[field]).toBeUndefined();
        });
      }
    });
  });

});