// What the country modules share: tidying the text they are given, snake_case results, the severity of a finding,
// and comparing two addresses field by field. Nothing here reads the US or Canadian tables, so a country entry point
// carries only this and its own country.

import type { CountryComparison, CountryDifference } from "../types/country-module";
import type { ParsedAddress } from "../types/parsed-address";
import type { ValidationError } from "../types/validation";
import { toSnakeCase } from "../utils/case-converter";

const CAMEL_CASE_CAPITAL = /[A-Z]/g;
const LINE_BREAKS = /\s*[\r\n]+\s*/g;
const SPACE_RUN = /[ \t\u00a0\u3000]+/g;
const SPACE_BEFORE_COMMA = /\s+,/g;
const COMMA_RUN = /,(?:\s*,)+/g;
const EDGE_COMMAS = /^[\s,]+|[\s,]+$/g;
const PUNCTUATION = /[.,'’]/g;
const HYPHEN_SPACING = /\s*-\s*/g;

// One line of text: line breaks become commas, runs of spaces one space, doubled commas one.
function tidyAddressText(text: string): string {
  return text
    .replace(LINE_BREAKS, ", ")
    .replace(SPACE_RUN, " ")
    .replace(SPACE_BEFORE_COMMA, ",")
    .replace(COMMA_RUN, ",")
    .replace(EDGE_COMMAS, "")
    .trim();
}

// The comma-separated parts of a tidied address, each trimmed, none empty.
function partsOf(text: string): string[] {
  return text
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part !== "");
}

// The result with snake_case keys, as parseLocation gives with useSnakeCase: sec_unit_type, floor_type.
function snakeCased(address: ParsedAddress): ParsedAddress {
  return Object.fromEntries(
    Object.entries(toSnakeCase(address)).map(([key, value]) => [
      key.replace(CAMEL_CASE_CAPITAL, (capital) => `_${capital.toLowerCase()}`),
      value,
    ]),
  ) as ParsedAddress;
}

// A finding as a warning, or as an error when the caller asked for strict postal codes and the finding is about one.
function finding(
  field: string,
  code: string,
  message: string,
  strict: boolean,
): ValidationError & { severity: "error" | "warning" } {
  return { field, code, message, severity: strict ? "error" : "warning" };
}

// The same value in the same form: capitals, no full stops, commas or apostrophes, one space, no spaces around a
// hyphen. A missing value stays missing.
function comparable(value: string | undefined): string | undefined {
  if (value === undefined || value === "") return undefined;

  return value.toUpperCase().replace(PUNCTUATION, "").replace(HYPHEN_SPACING, "-").replace(SPACE_RUN, " ").trim();
}

// Compare two addresses on the fields that make a delivery point, each first put in the same form by `normalize`
// (which also turns a street type or a state written out into its code). They are the same when no field differs.
function compareFields(
  first: ParsedAddress,
  second: ParsedAddress,
  fields: readonly (keyof ParsedAddress)[],
  normalize: (field: keyof ParsedAddress, value: string | undefined) => string | undefined,
): CountryComparison {
  if (!first || !second) return { isSame: false, differences: [] };
  const differences: CountryDifference[] = [];
  for (const field of fields) {
    const one = normalize(field, valueOf(first, field));
    const two = normalize(field, valueOf(second, field));
    if (one !== two) differences.push({ field, ...(one ? { first: one } : {}), ...(two ? { second: two } : {}) });
  }

  return { isSame: differences.length === 0, differences };
}

function valueOf(address: ParsedAddress, field: keyof ParsedAddress): string | undefined {
  const value = address[field];

  return typeof value === "string" ? value : undefined;
}

export { comparable, compareFields, finding, partsOf, snakeCased, tidyAddressText };
