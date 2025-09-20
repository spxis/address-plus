// Pattern building utilities for address parsing
// Constructs regex patterns from data constants

import { CA_PROVINCES, CA_STREET_TYPES, DIRECTIONAL_MAP, US_STATES, US_STREET_TYPES } from "../constants";

import { UNIT_TYPE_KEYWORDS, WRITTEN_NUMBERS } from "./address-patterns";
import { VALIDATION_PATTERNS } from "./core-patterns";
import { ZIP_CODE_REGEX_PATTERN } from "./location-patterns";

interface AddressPatterns {
  number: string;
  fraction: string;
  directional: string;
  streetType: string;
  state: string;
  stateAbbrev: string;
  stateFullName: string;
  zip: string;
  poBox: string;
  intersection: string;
  secUnit: string;
}

// Build regex patterns for address parsing
function buildPatterns(): AddressPatterns {
  const streetTypes = Object.keys(US_STREET_TYPES)
    .concat(Object.values(US_STREET_TYPES))
    .concat(Object.keys(CA_STREET_TYPES))
    .concat(Object.values(CA_STREET_TYPES))
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .sort((a, b) => b.length - a.length)
    .map((s) => s.replace(VALIDATION_PATTERNS.REGEX_ESCAPE, "\\$&")) // Escape regex special characters
    .join("|");

  const directionals = Object.keys(DIRECTIONAL_MAP)
    .concat(Object.values(DIRECTIONAL_MAP))
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .sort((a, b) => b.length - a.length)
    .map((d) => d.replace(VALIDATION_PATTERNS.REGEX_ESCAPE, "\\$&")) // Escape regex special characters
    .join("|");

  const states = Object.keys(US_STATES)
    .concat(Object.values(US_STATES))
    .concat(Object.keys(CA_PROVINCES))
    .concat(Object.values(CA_PROVINCES))
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .join("|");

  // Create separate pattern for state abbreviations (2-3 chars) vs full names
  const stateAbbrevs = (Object.values(US_STATES).concat(Object.values(CA_PROVINCES)) as string[])
    .filter((v, i, arr) => arr.indexOf(v) === i && v.length <= 3)
    .sort((a, b) => b.length - a.length)
    .join("|");

  const stateFullNames = Object.keys(US_STATES)
    .concat(Object.keys(CA_PROVINCES))
    .filter((v, i, arr) => arr.indexOf(v) === i && v.length > 3)
    .sort((a, b) => b.length - a.length)
    .join("|");

  return {
    number: String.raw`(\d+[-\/]*\d*|\w\d+\w\d+|${WRITTEN_NUMBERS})`, // Include written numbers
    fraction: String.raw`(\d+\/\d+)`,
    directional: `(${directionals})`,
    streetType: `(${streetTypes})`,
    state: `\\b(${states})\\b`,
    stateAbbrev: `\\b(${stateAbbrevs})\\b`,
    stateFullName: `\\b(${stateFullNames})\\b`,
    zip: ZIP_CODE_REGEX_PATTERN, // Use pattern from validation.ts for DRY compliance
    // Extend to include Canadian variants: C.P./CP, Case/Boîte postale, POBox, Box, and loose 'P.O. box'
    // We'll still capture the box number in group 2 when present
    poBox: String.raw`(p\.?\s*o\.?\s*box|post\s*office\s*box|pobox|po\s*box|c\.?p\.?|cp|case\s*postale|bo[iî]te\s*postale|boite\s*postale|box)\s*(\d+)?`,
    intersection: String.raw`\s+(?:and|&|at|\@)\s+`,
    secUnit: String.raw`(?:(${UNIT_TYPE_KEYWORDS}|#)\s+([a-z0-9-]+))`,
  };
}

export { buildPatterns };
export type { AddressPatterns };
