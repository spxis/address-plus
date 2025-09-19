import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

import { normalizeRegion } from "../../utils/normalize-region.js";

// Helper function to load JSON test data
function loadTestData<T>(filePath: string): T {
  const fullPath = join(__dirname, filePath);
  const rawData = readFileSync(fullPath, "utf-8");
  return JSON.parse(rawData) as T;
}

describe("normalizeRegion", () => {
  // Load test data from JSON files
  const exactMatchData = loadTestData("../../../test-data/regions/exact-match-cases.json") as any;
  const edgeCasesData = loadTestData("../../../test-data/regions/edge-cases.json") as any;
  const usStatesFuzzyData = loadTestData("../../../test-data/regions/us-states-fuzzy.json") as any;
  const canadianProvincesFuzzyData = loadTestData("../../../test-data/regions/ca-provinces-fuzzy.json") as any;

  describe("exact abbreviation matches", () => {
    exactMatchData.abbreviationTests.cases.forEach(({ input, expected, description }) => {
      it(`should match ${description}`, () => {
        expect(normalizeRegion(input)).toEqual(expected);
      });
    });
  });

  describe("exact name matches", () => {
    exactMatchData.nameTests.cases.forEach(({ input, expected, description }) => {
      it(`should match ${description}`, () => {
        expect(normalizeRegion(input)).toEqual(expected);
      });
    });
  });

  describe("case insensitive matches", () => {
    exactMatchData.caseInsensitiveTests.cases.forEach(({ input, expected, description }) => {
      it(`should match ${description}`, () => {
        expect(normalizeRegion(input)).toEqual(expected);
      });
    });
  });

  describe("periods in abbreviations", () => {
    exactMatchData.periodsTests.cases.forEach(({ input, expected, description }) => {
      it(`should match ${description}`, () => {
        expect(normalizeRegion(input)).toEqual(expected);
      });
    });
  });

  describe("edge cases", () => {
    describe("null cases", () => {
      edgeCasesData.nullCases.forEach(({ input, description }) => {
        it(`should return null for ${description}`, () => {
          expect(normalizeRegion(input)).toBe(null);
        });
      });
    });

    describe("whitespace handling", () => {
      edgeCasesData.whitespaceTests.forEach(({ input, expected, description }) => {
        it(`should handle ${description}`, () => {
          expect(normalizeRegion(input)).toEqual(expected);
        });
      });
    });

    describe("exact match priority", () => {
      edgeCasesData.priorityTests.forEach(({ input, expected, description }) => {
        it(`${description}`, () => {
          expect(normalizeRegion(input)).toEqual(expected);
        });
      });
    });
  });

  describe("fuzzy matching - US states", () => {
    usStatesFuzzyData.cases.forEach(({ input, expected, description }) => {
      it(`should fuzzy match: "${input}" → ${expected.abbr} (${description})`, () => {
        expect(normalizeRegion(input)).toEqual(expected);
      });
    });
  });

  describe("fuzzy matching - Canadian provinces", () => {
    canadianProvincesFuzzyData.cases.forEach(({ input, expected, description }) => {
      it(`should fuzzy match: "${input}" → ${expected.abbr} (${description})`, () => {
        expect(normalizeRegion(input)).toEqual(expected);
      });
    });
  });
});