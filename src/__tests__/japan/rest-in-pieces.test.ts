// A thousand generated Japanese records from REST in Pieces, in the shapes Faker's Japanese locale
// writes. At least 99% must parse with a prefecture, a municipality code and a postal code.

import { describe, expect, it } from "vitest";

import testData from "../../../test-data/japan/rest-in-pieces-ja.json";
import { parseJapaneseAddress } from "../../jp";
import { parseLocation } from "../../parser";

interface RestInPiecesRecord {
  input: { address: string; city: string; country: string; postal: string; province: string };
  name: string;
}

const MINIMUM_PARSE_RATE = 0.99;
const records: RestInPiecesRecord[] = testData.tests.records;

// The record as one line, as a form would join it: 〒546-2806 東京都新宿区2丁目4番4号.
const lineOf = ({ input }: RestInPiecesRecord): string =>
  `〒${input.postal} ${input.province}${input.city}${input.address}`;

describe("REST in Pieces Japanese records", () => {
  it("should hold the thousand records", () => {
    expect(records).toHaveLength(1000);
  });

  it(`should parse at least ${MINIMUM_PARSE_RATE * 100}% with prefecture, municipality code and postal code`, () => {
    const failures = records.map(lineOf).filter((line) => {
      const parsed = parseJapaneseAddress(line);

      return !parsed?.prefecture || !parsed.municipalityCode || !parsed.postalCode;
    });
    // Printed so a fall in the rate says which shapes stopped parsing.
    if (failures.length > 0) console.log(`REST in Pieces records not parsed:\n${failures.join("\n")}`);
    expect(1 - failures.length / records.length).toBeGreaterThanOrEqual(MINIMUM_PARSE_RATE);
  });

  it("should read each record's own prefecture, municipality and block", () => {
    const misread = records.filter((record) => {
      const parsed = parseLocation(lineOf(record));

      return (
        parsed?.country !== "JP" ||
        parsed.prefecture !== record.input.province ||
        parsed.municipality !== record.input.city ||
        parsed.postalCode !== record.input.postal ||
        parsed.block === undefined
      );
    });
    expect(misread.map(lineOf)).toEqual([]);
  });
});
