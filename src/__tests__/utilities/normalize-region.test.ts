import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

import { normalizeRegion } from "../../utils/normalize-region";

function loadTestData(filename: string): any[] {
  const filePath = join(__dirname, "../../../test-data/regions", filename);
  const data = JSON.parse(readFileSync(filePath, "utf-8"));
  
  if (Array.isArray(data)) {
    return data;
  }
  
  const firstKey = Object.keys(data).find(key => key !== "description");
  
  return firstKey ? data[firstKey] || [] : [];
}

describe("Normalize Region", () => {
  const exactMatchData = loadTestData("exact-match-cases.json") as any;
  const edgeCasesData = loadTestData("edge-cases.json") as any;
  const usStatesFuzzyData = loadTestData("us-states-fuzzy.json") as any;
  const canadianProvincesFuzzyData = loadTestData("ca-provinces-fuzzy.json") as any;

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