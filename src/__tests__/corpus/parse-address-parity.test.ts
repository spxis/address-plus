// How closely address-plus follows parse-address, the library it replaces, over every corpus input.
// Two figures come out. Raw parity counts the fields on which the two parsers agree, right or wrong.
// Compatibility counts, of the field values parse-address gets right, how many address-plus also gets
// right. Only compatibility is held to its recorded figure: raw parity can fall when address-plus fixes
// something both parsers used to get wrong in the same way, and that must not fail the build. Run with
// CORPUS_PARITY_RECORD=1 to write the current figures after an improvement.

import { readFileSync, writeFileSync } from "fs";
import { createRequire } from "module";
import { join } from "path";

import { describe, expect, it } from "vitest";

import { SECONDARY_UNIT_TYPES } from "../../constants";
import type { ParsedAddress } from "../../types";
import type { CorpusCase } from "./corpus-support";
import { allCases, parseCase } from "./corpus-support";

// parse-address ships no types; this is the one function the comparison calls.
interface ParseAddressModule {
  parseLocation: (input: string) => Record<string, string> | null;
}

// The figures written to test-data/corpus/parity.json.
interface ParityFigures {
  inputs: number; // Corpus inputs run through both parsers
  inputsInFullAgreement: number; // Inputs on which every compared field agrees
  fieldsCompared: number; // Fields either parser filled, summed over the inputs
  fieldsAgreeing: number; // Of those, the fields on which the two agree
  fieldsParseAddressGetsRight: number; // Expected field values parse-address reproduces
  fieldsBothGetRight: number; // Of those, the values address-plus reproduces as well
}

// parse-address's snake_case names beside this library's names, for the fields both report.
const COMPARED_FIELDS: [string, keyof ParsedAddress][] = [
  ["number", "number"],
  ["prefix", "prefix"],
  ["street", "street"],
  ["type", "type"],
  ["suffix", "suffix"],
  ["sec_unit_type", "secUnitType"],
  ["sec_unit_num", "secUnitNum"],
  ["city", "city"],
  ["state", "state"],
  ["zip", "zip"],
  ["plus4", "plus4"],
];

const PARITY_FILE: string = join(__dirname, "../../../test-data/corpus/parity.json");
const requireFromHere: NodeRequire = createRequire(__filename);
const parseAddress: ParseAddressModule = requireFromHere("parse-address") as ParseAddressModule;

// Both libraries write the same unit in different words (Apt and Apartment, PO box and PO Box), and
// either may change letter case, so values are compared on a common spelling.
function normalize(field: string, value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const text: string = String(value).trim().toLowerCase();
  if (field === "secUnitType") {
    if (/^p\.?\s*o\.?\s*box$|^post office box$|^pobox$/.test(text)) {
      return "po box";
    }

    return (SECONDARY_UNIT_TYPES[text] ?? text).toLowerCase();
  }

  return text;
}

function parseAddressResult(input: string): Record<string, string> | null {
  try {
    return parseAddress.parseLocation(input);
  } catch (_error) {
    // A parser that throws on an input has, for this comparison, returned nothing.
    return null;
  }
}

function measureParity(cases: CorpusCase[]): ParityFigures {
  const figures: ParityFigures = {
    fieldsAgreeing: 0,
    fieldsBothGetRight: 0,
    fieldsCompared: 0,
    fieldsParseAddressGetsRight: 0,
    inputs: 0,
    inputsInFullAgreement: 0,
  };

  for (const testCase of cases) {
    figures.inputs += 1;
    const theirs: Record<string, string> | null = parseAddressResult(testCase.input);
    const ours: Record<string, unknown> | null = parseCase(testCase) as Record<string, unknown> | null;
    let agreesFully: boolean = true;

    for (const [theirName, ourName] of COMPARED_FIELDS) {
      const theirValue: string | undefined = normalize(ourName, theirs?.[theirName]);
      const ourValue: string | undefined = normalize(ourName, ours?.[ourName]);
      if (theirValue !== undefined || ourValue !== undefined) {
        figures.fieldsCompared += 1;
        if (theirValue === ourValue) {
          figures.fieldsAgreeing += 1;
        } else {
          agreesFully = false;
        }
      }

      const expectedValue: unknown = testCase.expected?.[ourName];
      if (expectedValue !== undefined && expectedValue !== null && typeof expectedValue === "string") {
        const wanted: string | undefined = normalize(ourName, expectedValue);
        if (theirValue === wanted) {
          figures.fieldsParseAddressGetsRight += 1;
          if (ourValue === wanted) {
            figures.fieldsBothGetRight += 1;
          }
        }
      }
    }
    if (agreesFully) {
      figures.inputsInFullAgreement += 1;
    }
  }

  return figures;
}

function percent(part: number, whole: number): string {
  return whole === 0 ? "0.0" : ((100 * part) / whole).toFixed(1);
}

const cases: CorpusCase[] = [...allCases("us"), ...allCases("canada")];
const current: ParityFigures = measureParity(cases);
const recordedFile: { tests: { parity: ParityFigures } } = JSON.parse(readFileSync(PARITY_FILE, "utf-8"));
const recorded: ParityFigures = recordedFile.tests.parity;

if (process.env.CORPUS_PARITY_RECORD === "1") {
  recordedFile.tests.parity = current;
  writeFileSync(PARITY_FILE, `${JSON.stringify(recordedFile, null, 2)}\n`);
}

describe("parse-address parity over the corpus", () => {
  it(
    `agrees on ${current.fieldsAgreeing} of ${current.fieldsCompared} fields (${percent(current.fieldsAgreeing, current.fieldsCompared)}%) ` +
      `and fully on ${current.inputsInFullAgreement} of ${current.inputs} inputs; keeps ${current.fieldsBothGetRight} of the ` +
      `${current.fieldsParseAddressGetsRight} field values parse-address gets right ` +
      `(${percent(current.fieldsBothGetRight, current.fieldsParseAddressGetsRight)}%, recorded ${recorded.fieldsBothGetRight})`,
    () => {
      expect(
        current.fieldsBothGetRight,
        "address-plus lost field values parse-address gets right; fix the regression, or re-record if the corpus shrank",
      ).toBeGreaterThanOrEqual(recorded.fieldsBothGetRight);
    },
  );
});
