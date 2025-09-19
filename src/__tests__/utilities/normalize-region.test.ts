import { describe, expect, it } from "vitest";

import { normalizeRegion } from "../../utils/normalize-region.js";
import { 
  loadCanadianProvincesFuzzyTests,
  loadEdgeCases,
  loadExactMatchTests, 
  loadUSStatesFuzzyTests,
} from "../utils/test-data-loader.js";

describe("normalizeRegion", () => {
  // Load test data from JSON files
  const exactMatchData = loadExactMatchTests();
  const edgeCasesData = loadEdgeCases();
  const usStatesFuzzyData = loadUSStatesFuzzyTests();
  const canadianProvincesFuzzyData = loadCanadianProvincesFuzzyTests();

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