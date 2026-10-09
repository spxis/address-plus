import { describe, expect, it } from "vitest";

import testData from "../../../test-data/japan/lookups.json";
import {
  findMunicipalitiesByName,
  findMunicipalitiesByRomaji,
  findPrefecture,
  getPostalPrefixesForPrefecture,
  getPrefectureFromJapanesePostalCode,
  JP_DESIGNATED_CITIES,
} from "../../jp";
import type { JapaneseValueCase } from "./japan-cases";

const { findPrefecture: prefectureCases, postalToPrefecture, prefixesForPrefecture } = testData.tests;
const byRomaji: JapaneseValueCase<string, string[]>[] = testData.tests.municipalitiesByRomaji;
const byName: JapaneseValueCase<string, string[]>[] = testData.tests.municipalitiesByName;
const designated: JapaneseValueCase<string, Record<string, string>>[] = testData.tests.designatedCities;

const codesOf = (municipalities: readonly { code: string }[]): string[] =>
  municipalities.map((municipality) => municipality.code).sort();

describe("Japanese lookups", () => {
  describe("findPrefecture", () => {
    (prefectureCases as JapaneseValueCase<string, string | null>[]).forEach(({ name, input, expected }) => {
      it(`should ${name}`, () => {
        expect(findPrefecture(input)?.code ?? null).toBe(expected);
      });
    });
  });

  describe("getPrefectureFromJapanesePostalCode", () => {
    (postalToPrefecture as JapaneseValueCase<string, string | null>[]).forEach(({ name, input, expected }) => {
      it(`should ${name}`, () => {
        expect(getPrefectureFromJapanesePostalCode(input)).toBe(expected);
      });
    });
  });

  describe("getPostalPrefixesForPrefecture", () => {
    (prefixesForPrefecture as (JapaneseValueCase<string, string[]> & { sameAs?: string })[]).forEach(
      ({ name, input, expected, sameAs }) => {
        it(`should ${name}`, () => {
          const prefixes = getPostalPrefixesForPrefecture(input);
          if (sameAs) {
            expect(prefixes.length).toBeGreaterThan(0);
            expect(prefixes).toEqual(getPostalPrefixesForPrefecture(sameAs));
          } else {
            expect(prefixes).toEqual(expected);
          }
        });
      },
    );
  });

  describe("findMunicipalitiesByRomaji", () => {
    byRomaji.forEach(({ name, input, prefecture, expected }) => {
      it(`should ${name}`, () => {
        expect(codesOf(findMunicipalitiesByRomaji(input, prefecture))).toEqual(expected);
      });
    });
  });

  describe("findMunicipalitiesByName", () => {
    byName.forEach(({ name, input, prefecture, expected }) => {
      it(`should ${name}`, () => {
        expect(codesOf(findMunicipalitiesByName(input, prefecture))).toEqual(expected);
      });
    });
  });

  describe("JP_DESIGNATED_CITIES", () => {
    it("should hold the twenty designated cities", () => {
      expect(JP_DESIGNATED_CITIES).toHaveLength(20);
    });

    designated.forEach(({ name, input, expected }) => {
      it(`should ${name}`, () => {
        expect(JP_DESIGNATED_CITIES.find((city) => city.name === input)).toMatchObject(expected);
      });
    });
  });
});
