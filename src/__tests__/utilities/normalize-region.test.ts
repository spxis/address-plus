import { readFileSync } from "fs";
import { join } from "path";

import { describe, expect, it } from "vitest";

import { normalizeRegion } from "../../utils/normalize-region";
import type { RegionTestCase, FuzzyMatchTestCase, NullTestCase } from "../types/test-interfaces";

// Test data files
const testFiles = {
  "exact-match-cases": "../../../test-data/regions/exact-match-cases.json",
  "edge-cases": "../../../test-data/regions/edge-cases.json",
  "fuzzy-matching": "../../../test-data/regions/fuzzy-matching.json",
};

describe("Normalize Region", () => {
  Object.entries(testFiles).forEach(([fileKey, filePath]) => {
    const data = JSON.parse(readFileSync(join(__dirname, filePath), "utf-8"));
    const tests = data.tests;

    // Handle all test structures with generic iteration
    Object.entries(tests).forEach(([groupName, testGroup]: [string, any]) => {
      if (Array.isArray(testGroup)) {
        // Direct array - check if it's fuzzy matching or regular cases
        describe(groupName.replace(/([A-Z])/g, ' $1').toLowerCase(), () => {
          testGroup.forEach((testCase: any) => {
            const { input, expected, description } = testCase;
            if (expected?.abbr) {
              // Fuzzy matching case
              it(`should fuzzy match: "${input}" → ${expected.abbr} (${description})`, () => {
                expect(normalizeRegion(input)).toEqual(expected);
              });
            } else {
              // Regular case
              it(`should ${expected ? 'match' : 'return null for'} ${description}`, () => {
                const result = normalizeRegion(input);
                if (expected) {
                  expect(result).toEqual(expected);
                } else {
                  expect(result).toBe(null);
                }
              });
            }
          });
        });
      } else if (testGroup?.cases) {
        // Object with cases array
        describe(groupName.replace(/([A-Z])/g, ' $1').toLowerCase().replace('tests', 'matches'), () => {
          testGroup.cases.forEach((testCase: any) => {
            const { input, expected, description } = testCase;
            it(`should match ${description}`, () => {
              expect(normalizeRegion(input)).toEqual(expected);
            });
          });
        });
      }
    });
  });
});