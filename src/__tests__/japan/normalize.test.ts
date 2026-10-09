import { describe, expect, it } from "vitest";

import testData from "../../../test-data/japan/normalize.json";
import { kanjiNumeralsToDigits, looksJapanese, normalizeJapaneseAddressText } from "../../jp";
import type { JapaneseValueCase } from "./japan-cases";

const normalizeText: JapaneseValueCase[] = testData.tests.normalizeText;
const kanjiNumerals: JapaneseValueCase[] = testData.tests.kanjiNumerals;
const looksJapaneseCases: JapaneseValueCase<string, boolean>[] = testData.tests.looksJapanese;

describe("Normalising Japanese address text", () => {
  describe("normalizeJapaneseAddressText", () => {
    normalizeText.forEach(({ name, input, expected }) => {
      it(`should ${name}`, () => {
        expect(normalizeJapaneseAddressText(input)).toBe(expected);
      });
    });
  });

  describe("kanjiNumeralsToDigits", () => {
    kanjiNumerals.forEach(({ name, input, expected }) => {
      it(`should ${name}`, () => {
        expect(kanjiNumeralsToDigits(input)).toBe(expected);
      });
    });
  });

  describe("looksJapanese", () => {
    looksJapaneseCases.forEach(({ name, input, expected }) => {
      it(`should ${name}`, () => {
        expect(looksJapanese(input)).toBe(expected);
      });
    });
  });
});
