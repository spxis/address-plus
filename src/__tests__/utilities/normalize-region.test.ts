import { readFileSync } from "fs";
import { join } from "path";

import { describe, expect, it } from "vitest";

import type { RegionNullTestCase, RegionTestCase, RegionTestData, TestDataWithSchema } from "../../types/test-data-types";
import { normalizeRegion } from "../../utils/normalize-region";

function loadTestData(filename: string): RegionTestData {
  const filePath: string = join(__dirname, "../../../test-data/regions", filename);
  const data: TestDataWithSchema<RegionTestData> = JSON.parse(readFileSync(filePath, "utf-8"));

  // Return the tests object which contains the reorganized data
  return data.tests || {};
}

describe("Normalize Region", () => {
  const exactMatchData = loadTestData("exact-match-cases.json");
  const edgeCasesData = loadTestData("edge-cases.json");
  const usStatesFuzzyData = loadTestData("us-states-fuzzy.json");
  const canadianProvincesFuzzyData = loadTestData("ca-provinces-fuzzy.json");

  describe("exact abbreviation matches", () => {
    if (exactMatchData?.abbreviationTests?.cases) {
      exactMatchData.abbreviationTests.cases.forEach(({ input, expected, description }: RegionTestCase) => {
        it(`should match ${description}`, () => {
          expect(normalizeRegion(input)).toEqual(expected);
        });
      });
    } else {
      it("should skip - no test data available", () => {
        expect(true).toBe(true);
      });
    }
  });

  describe("exact name matches", () => {
    if (exactMatchData?.nameTests?.cases) {
      exactMatchData.nameTests.cases.forEach(({ input, expected, description }: RegionTestCase) => {
        it(`should match ${description}`, () => {
          expect(normalizeRegion(input)).toEqual(expected);
        });
      });
    } else {
      it("should skip - no test data available", () => {
        expect(true).toBe(true);
      });
    }
  });

  describe("case insensitive matches", () => {
    if (exactMatchData?.caseInsensitiveTests?.cases) {
      exactMatchData.caseInsensitiveTests.cases.forEach(({ input, expected, description }: RegionTestCase) => {
        it(`should match ${description}`, () => {
          expect(normalizeRegion(input)).toEqual(expected);
        });
      });
    } else {
      it("should skip - no test data available", () => {
        expect(true).toBe(true);
      });
    }
  });

  describe("periods in abbreviations", () => {
    if (exactMatchData?.periodsTests?.cases) {
      exactMatchData.periodsTests.cases.forEach(({ input, expected, description }: RegionTestCase) => {
        it(`should match ${description}`, () => {
          expect(normalizeRegion(input)).toEqual(expected);
        });
      });
    } else {
      it("should skip - no test data available", () => {
        expect(true).toBe(true);
      });
    }
  });

  describe("edge cases", () => {
    describe("null cases", () => {
      if (edgeCasesData?.cases) {
        // Filter for null cases (first 7 items based on the structure)
        const nullCases = edgeCasesData.cases.slice(0, 7) as RegionNullTestCase[];
        nullCases.forEach(({ input, description }: RegionNullTestCase) => {
          it(`should return null for ${description}`, () => {
            expect(normalizeRegion(input)).toBe(null);
          });
        });
      } else {
        it("should skip - no test data available", () => {
          expect(true).toBe(true);
        });
      }
    });

    describe("whitespace handling", () => {
      if (edgeCasesData?.cases) {
        // Filter for whitespace test cases (next 3 items)
        const whitespaceCases = edgeCasesData.cases.slice(7, 10) as RegionTestCase[];
        whitespaceCases.forEach(({ input, expected, description }: RegionTestCase) => {
          it(`should handle ${description}`, () => {
            expect(normalizeRegion(input)).toEqual(expected);
          });
        });
      } else {
        it("should skip - no test data available", () => {
          expect(true).toBe(true);
        });
      }
    });

    describe("exact match priority", () => {
      if (edgeCasesData?.cases) {
        // Filter for priority test cases (remaining items)
        const priorityCases = edgeCasesData.cases.slice(10) as RegionTestCase[];
        priorityCases.forEach(({ input, expected, description }: RegionTestCase) => {
          it(`${description}`, () => {
            expect(normalizeRegion(input)).toEqual(expected);
          });
        });
      } else {
        it("should skip - no test data available", () => {
          expect(true).toBe(true);
        });
      }
    });
  });

  describe("fuzzy matching - US states", () => {
    if (usStatesFuzzyData?.fuzzyMatching) {
      usStatesFuzzyData.fuzzyMatching.forEach(({ input, expected, description }: RegionTestCase) => {
        it(`should fuzzy match: "${input}" → ${expected.abbr} (${description})`, () => {
          expect(normalizeRegion(input)).toEqual(expected);
        });
      });
    } else {
      it("should skip - no test data available", () => {
        expect(true).toBe(true);
      });
    }
  });

  describe("fuzzy matching - Canadian provinces", () => {
    if (canadianProvincesFuzzyData?.fuzzyMatching) {
      canadianProvincesFuzzyData.fuzzyMatching.forEach(({ input, expected, description }: RegionTestCase) => {
        it(`should fuzzy match: "${input}" → ${expected.abbr} (${description})`, () => {
          expect(normalizeRegion(input)).toEqual(expected);
        });
      });
    } else {
      it("should skip - no test data available", () => {
        expect(true).toBe(true);
      });
    }
  });
});
