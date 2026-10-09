import { describe, expect, it } from "vitest";

import testData from "../../../test-data/japan/format.json";
import type { JapaneseEnglishFormattingOptions, JapaneseFormattingOptions } from "../../jp";
import { formatJapanese, formatJapaneseEnglish } from "../../jp";
import { parseLocation } from "../../parser";
import type { JapaneseValueCase } from "./japan-cases";

const japanese: JapaneseValueCase[] = testData.tests.japanese;
const english: JapaneseValueCase[] = testData.tests.english;

describe("Formatting Japanese addresses", () => {
  describe("formatJapanese", () => {
    japanese.forEach(({ name, input, options, expected }) => {
      it(`should ${name}`, () => {
        const address = parseLocation(input);
        expect(address).not.toBeNull();
        expect(formatJapanese(address!, options as JapaneseFormattingOptions)).toBe(expected);
      });
    });
  });

  describe("formatJapaneseEnglish", () => {
    english.forEach(({ name, input, options, expected }) => {
      it(`should ${name}`, () => {
        const address = parseLocation(input);
        expect(address).not.toBeNull();
        expect(formatJapaneseEnglish(address!, options as JapaneseEnglishFormattingOptions)).toBe(expected);
      });
    });
  });
});
