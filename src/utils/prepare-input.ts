// Tidying an address before it is parsed.
//
// Each step here rewrites one way of writing an address into the form the parser reads, so the parser
// does not need a branch for every spelling of the same thing. Every step leaves an address it does not
// recognise exactly as it was.

import { CA_PROVINCES } from "../constants/ca-provinces";
import { US_STATES } from "../constants/us-states";
import { UNIT_PART_PATTERN } from "../patterns/address-patterns";
import { WORD_START } from "../patterns/word-boundary";

// What the tidying found out on the way.
interface PreparedInput {
  text: string; // The address, rewritten
  country?: "US" | "CA"; // A trailing country name that was removed
}

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Every state and province name or code, longest first, for the steps that look for one.
const REGION_NAMES: string = Object.keys({ ...US_STATES, ...CA_PROVINCES })
  .concat(Object.values({ ...US_STATES, ...CA_PROVINCES }))
  .filter((name: string, index: number, all: string[]) => all.indexOf(name) === index)
  .sort((a: string, b: string) => b.length - a.length)
  .map((name: string) => escapeRegExp(name).replace(/ /g, "\\s+"))
  .join("|");

const ZIP_ONLY = /^\d{5}(?:[-\s]*\d{4})?$/;
const POSTAL_ONLY = /^[A-Z]\d[A-Z][-\s]*\d[A-Z]\d$/i;
const ZIP_OR_POSTAL_AT_END = /(?:\d{5}(?:[-\s]*\d{4})?|[A-Z]\d[A-Z][-\s]*\d[A-Z]\d)$/i;

// A country written after the address: on a line of its own, after a comma, or after the ZIP or postal
// code. "US" alone is taken only after a ZIP, where it cannot be part of a street or a city.
const TRAILING_COUNTRY = new RegExp(
  String.raw`(?:^|[\s,]+)(u\.?\s?s\.?\s?a\.?|united\s+states(?:\s+of\s+america)?|canada)\s*$`,
  "i",
);
const TRAILING_US_AFTER_ZIP = /(\d{5}(?:[-\s]*\d{4})?)[\s,]+(us|u\.s\.)\s*$/i;

// A province or state in parentheses after the city, the traditional French form: "Montréal (Québec)".
const REGION_IN_PARENTHESES = new RegExp(String.raw`\s*\(\s*(${REGION_NAMES})\.?\s*\)(?=\s|,|$)`, "iu");

// A part that is only a civic number, as in Canada Post's French form "275, rue Notre-Dame Est".
const CIVIC_NUMBER_ONLY = /^\d+[A-Za-z]?(?:-\d+[A-Za-z]?)?$/;

// A part that ends with a state or province code, before a part that is only the ZIP or postal code. Full
// names are left alone: in "New York, 10001" the name is as likely the city as the state.
const REGION_CODES: string = Object.values({ ...US_STATES, ...CA_PROVINCES })
  .filter((code: string, index: number, all: string[]) => all.indexOf(code) === index)
  .concat(["p\\.?q", "n\\.?f", "que", "nfld", "p\\.?e\\.?i"])
  .join("|");
const ENDS_WITH_REGION = new RegExp(String.raw`${WORD_START}(?:${REGION_CODES})\.?$`, "iu");

// Collapse runs of spaces and tabs, trim every line and drop empty ones.
function tidySpaces(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line: string) => line.replace(/[ \t\u00a0]+/g, " ").trim())
    .filter((line: string) => line.length > 0)
    .join("\n");
}

// Remove a trailing country name and say which country it was.
function takeTrailingCountry(text: string): PreparedInput {
  const usAfterZip = text.match(TRAILING_US_AFTER_ZIP);
  if (usAfterZip) {
    return { country: "US", text: text.slice(0, usAfterZip.index! + usAfterZip[1].length) };
  }

  const match = text.match(TRAILING_COUNTRY);
  if (!match) return { text };

  const before = text.slice(0, match.index).replace(/[\s,]+$/, "");
  // Nothing before it, or nothing but a street: "Canada" may be the whole input or a street's name.
  if (!before || !/[,\n]|\d{5}|[A-Z]\d[A-Z][-\s]*\d[A-Z]\d/i.test(before)) return { text };

  return { country: /canada/i.test(match[1]) ? "CA" : "US", text: before };
}

// Split on commas and line breaks, remembering which separator followed each part.
function splitParts(text: string): string[] {
  return text
    .replace(/\n/g, ", ")
    .split(",")
    .map((part: string) => part.trim())
    .filter((part: string) => part.length > 0);
}

// Rewrite the parts of an address. The text is re-joined with ", ", the form the parser splits on.
function rewriteParts(text: string): string {
  let parts: string[] = splitParts(text);
  if (parts.length < 2) return text;

  // "275, rue Notre-Dame Est": the comma after the civic number is Canada Post's French form, not a break.
  if (CIVIC_NUMBER_ONLY.test(parts[0]) && /^\p{L}/u.test(parts[1])) {
    parts = [`${parts[0]} ${parts[1]}`, ...parts.slice(2)];
  }

  // "Apt 4, 123 Main St": a unit written on the line above the street goes after it.
  if (parts.length >= 2 && UNIT_PART_PATTERN.test(parts[0]) && /^\d/.test(parts[1])) {
    parts = [`${parts[1]} ${parts[0]}`, ...parts.slice(2)];
  }

  // "Fayetteville, AR, 72704": a comma between the state and the ZIP.
  const last = parts.length - 1;
  if (parts.length >= 2 && (ZIP_ONLY.test(parts[last]) || POSTAL_ONLY.test(parts[last]))) {
    if (ENDS_WITH_REGION.test(parts[last - 1]) && !ZIP_OR_POSTAL_AT_END.test(parts[last - 1])) {
      parts = [...parts.slice(0, last - 1), `${parts[last - 1]} ${parts[last]}`];
    }
  }

  return parts.join(", ");
}

// Tidy an address for parsing. Line breaks are kept until the parts are rewritten.
function prepareInput(address: string): PreparedInput {
  let text = tidySpaces(address);

  // Quotes around the whole address.
  const quoted = text.match(/^(["'])(.*)\1$/s);
  if (quoted) text = quoted[2].trim();

  const { country, text: withoutCountry } = takeTrailingCountry(text);
  text = withoutCountry;

  // "Montréal (Québec) H2Y 1C6" reads as "Montréal QC H2Y 1C6".
  text = text.replace(REGION_IN_PARENTHESES, (_whole: string, region: string) => {
    const key = region.toLowerCase().replace(/\s+/g, " ");
    const code = CA_PROVINCES[key] ?? US_STATES[key] ?? region.toUpperCase();
    return ` ${code}`;
  });

  // Semicolons, and a spaced dash after a street that starts with its number, separate parts as commas do.
  if (/^\d/.test(text)) {
    text = text.replace(/\s*;\s*/g, ", ").replace(/(?<!\d)\s+[-\u2013\u2014]\s+(?!\d)/g, ", ");
  }

  if (/[,\n]/.test(text)) {
    text = rewriteParts(text);
  }

  return { country, text };
}

export { prepareInput };
export type { PreparedInput };
