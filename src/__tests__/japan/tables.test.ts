// Whole-table checks: every prefecture's postal prefixes resolve back to it, every postal exception
// resolves to its own prefecture, and every municipality is found both by its Japanese name after its
// prefecture and by its romaji within its prefecture.

import { describe, expect, it } from "vitest";

import {
  findMunicipalitiesByRomaji,
  findPrefecture,
  getPostalPrefixesForPrefecture,
  getPrefectureFromJapanesePostalCode,
  JP_DESIGNATED_CITIES,
  JP_MUNICIPALITIES,
  JP_POSTAL_EXCEPTIONS,
  JP_PREFECTURES,
  parseJapaneseAddress,
} from "../../jp";

// Codes within a prefix sampled at its first, middle and last number. A sampled code that is itself an
// exception belongs to the neighbouring prefecture, which is the point of the exception list.
const SAMPLE_SUFFIXES = ["0000", "5000", "9999"];
const EXPECTED_PREFECTURES = 47;
const EXPECTED_MUNICIPALITIES = 1894;
const EXPECTED_EXCEPTIONS = 236;

// A block appended to each municipality, so the parser has a whole address to read.
const BLOCK = "1-1";

describe("Japanese tables, whole", () => {
  it("should hold the expected number of rows", () => {
    expect(JP_PREFECTURES).toHaveLength(EXPECTED_PREFECTURES);
    expect(JP_MUNICIPALITIES).toHaveLength(EXPECTED_MUNICIPALITIES);
    expect(Object.keys(JP_POSTAL_EXCEPTIONS)).toHaveLength(EXPECTED_EXCEPTIONS);
  });

  it.each(JP_PREFECTURES.map((prefecture) => [prefecture.code, prefecture.name]))(
    "should give %s %s postal prefixes that resolve back to it",
    (code) => {
      const prefixes = getPostalPrefixesForPrefecture(code);
      expect(prefixes.length).toBeGreaterThan(0);
      for (const prefix of prefixes) {
        for (const suffix of SAMPLE_SUFFIXES) {
          const postalCode = `${prefix}${suffix}`;
          if (JP_POSTAL_EXCEPTIONS[postalCode]) continue;
          expect(getPrefectureFromJapanesePostalCode(postalCode), postalCode).toBe(code);
        }
      }
    },
  );

  it("should resolve every postal exception to its own prefecture, not its prefix's", () => {
    for (const [postalCode, prefecture] of Object.entries(JP_POSTAL_EXCEPTIONS)) {
      expect(getPrefectureFromJapanesePostalCode(postalCode), postalCode).toBe(prefecture);
      expect(getPrefectureFromJapanesePostalCode(`${postalCode.slice(0, 3)}-${postalCode.slice(3)}`)).toBe(prefecture);
    }
  });

  it("should find every municipality by its name after its prefecture's", () => {
    const missed: string[] = [];
    for (const municipality of [...JP_MUNICIPALITIES, ...JP_DESIGNATED_CITIES]) {
      const prefecture = findPrefecture(municipality.prefecture)!;
      const parsed = parseJapaneseAddress(`${prefecture.name}${municipality.name}${BLOCK}`);
      if (parsed?.municipalityCode !== municipality.code || parsed.block !== BLOCK) {
        missed.push(`${prefecture.name}${municipality.name}: ${parsed?.municipalityCode} ${parsed?.block}`);
      }
    }
    expect(missed).toEqual([]);
  });

  it("should find every municipality, and only it, by its romaji within its prefecture", () => {
    const missed: string[] = [];
    for (const municipality of [...JP_MUNICIPALITIES, ...JP_DESIGNATED_CITIES]) {
      const found = findMunicipalitiesByRomaji(municipality.romaji, municipality.prefecture);
      if (found.length !== 1 || found[0].code !== municipality.code) {
        missed.push(`${municipality.romaji} (${municipality.name}): ${found.map((other) => other.name).join(", ")}`);
      }
    }
    expect(missed).toEqual([]);
  });
});
