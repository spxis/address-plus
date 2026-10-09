import { describe, it } from "vitest";

import japaneseData from "../../../test-data/japan/parsing-japanese.json";
import romajiData from "../../../test-data/japan/parsing-romaji.json";
import { parseJapaneseAddress } from "../../jp";
import { parseLocation } from "../../parser";
import type { ParseOptions } from "../../types";
import type { JapaneseParseCase } from "./japan-cases";
import { expectFields } from "./japan-cases";

const japaneseGroups = japaneseData.tests as Record<string, JapaneseParseCase[]>;
const romajiGroups = romajiData.tests as Record<string, JapaneseParseCase[]>;

describe("Japanese addresses in Japanese", () => {
  for (const [group, cases] of Object.entries(japaneseGroups)) {
    describe(group, () => {
      cases.forEach(({ name, input, options, expected }) => {
        it(`should ${name}`, () => {
          expectFields(parseLocation(input, options as ParseOptions), expected);
        });
      });
    });
  }

  describe("parseJapaneseAddress", () => {
    japaneseGroups.marunouchi.forEach(({ name, input, expected }) => {
      it(`should ${name} on its own`, () => {
        expectFields(parseJapaneseAddress(input), expected);
      });
    });
  });
});

describe("Japanese addresses in romaji", () => {
  for (const [group, cases] of Object.entries(romajiGroups)) {
    describe(group, () => {
      cases.forEach(({ name, input, options, expected }) => {
        it(`should ${name}`, () => {
          expectFields(parseLocation(input, options as ParseOptions), expected);
        });
      });
    });
  }
});
