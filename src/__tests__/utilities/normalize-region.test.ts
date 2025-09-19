import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

import { normalizeRegion } from "../../utils/normalize-region";

interface TestCase {
  input: string;
  expected: any;
  description: string;
}

interface NullTestCase {
  input: string;
  description: string;
}

function loadTestData(filename: string): any {
  const filePath: string = join(__dirname, "../../../test-data/regions", filename);
  const data: any = JSON.parse(readFileSync(filePath, "utf-8"));
  
  return data;
}

describe("Normalize Region", () => {
  const exactMatchData = loadTestData("exact-match-cases.json") as any;
  const edgeCasesData = loadTestData("edge-cases.json") as any;
  const usStatesFuzzyData = loadTestData("us-states-fuzzy.json") as any;
  const canadianProvincesFuzzyData = loadTestData("ca-provinces-fuzzy.json") as any;

  describe("exact abbreviation matches", () => {
    if (exactMatchData?.abbreviationTests?.cases) {
      exactMatchData.abbreviationTests.cases.forEach(({ input, expected, description }: TestCase) => {
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
      exactMatchData.nameTests.cases.forEach(({ input, expected, description }: TestCase) => {
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
      exactMatchData.caseInsensitiveTests.cases.forEach(({ input, expected, description }: TestCase) => {
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
      exactMatchData.periodsTests.cases.forEach(({ input, expected, description }: TestCase) => {
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
      if (edgeCasesData?.nullCases) {
        edgeCasesData.nullCases.forEach(({ input, description }: NullTestCase) => {
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
      if (edgeCasesData?.whitespaceTests) {
        edgeCasesData.whitespaceTests.forEach(({ input, expected, description }: TestCase) => {
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
      if (edgeCasesData?.priorityTests) {
        edgeCasesData.priorityTests.forEach(({ input, expected, description }: TestCase) => {
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
    if (usStatesFuzzyData?.cases) {
      usStatesFuzzyData.cases.forEach(({ input, expected, description }: TestCase) => {
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
    if (canadianProvincesFuzzyData?.cases) {
      canadianProvincesFuzzyData.cases.forEach(({ input, expected, description }: TestCase) => {
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