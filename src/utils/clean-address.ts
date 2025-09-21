// Clean address string functionality
// Provides string-based cleaning and normalization of address data

import { COUNTRIES } from "../constants";
import {
  DIRECTION_EXPANSIONS,
  PROVINCE_EXPANSIONS,
  SECONDARY_UNIT_TYPES,
  STREET_TYPE_DETECTION_PATTERN,
  STREET_TYPE_EXPANSIONS,
  US_STATE_EXPANSIONS,
} from "../constants/index.js";
import { parseLocation } from "../index.js";
import { UTILITY_PATTERNS } from "../patterns/parser-patterns";
import type { CleanAddressOptions, CleanAddressResult } from "../types/clean-address.js";
import type { ParsedAddress } from "../types/index.js";

import { formatAddress, formatCanadaPost, formatUSPS } from "./address-formatting.js";

// Clean and normalize an address string with various formatting options
function cleanAddress(addressString: string, options: CleanAddressOptions = {}): string {
  const result = cleanAddressDetailed(addressString, options);
  return result.cleanedAddress;
}

// Clean and normalize an address string with detailed change tracking
function cleanAddressDetailed(addressString: string, options: CleanAddressOptions = {}): CleanAddressResult {
  // Set default options
  const opts = {
    format: "standard" as const,
    removeExtraSpaces: true,
    standardizeCase: "none" as const,
    expandAbbreviations: false,
    ...options,
  };

  const changes: string[] = [];

  // Handle empty or whitespace-only input
  if (!addressString || !addressString.trim()) {
    return {
      cleanedAddress: addressString.trim(),
      wasModified: false,
      changes: [],
    };
  }

  // Parse the address
  const parsedAddress = parseLocation(addressString.trim());

  // Check if parsing was successful
  if (!parsedAddress || Object.keys(parsedAddress).length === 0 || !hasValidAddressComponents(parsedAddress)) {
    return {
      cleanedAddress: addressString.trim(),
      wasModified: false,
      changes: ["Could not parse address"],
    };
  }

  // Apply expansion of abbreviations if requested
  if (opts.expandAbbreviations) {
    expandAddressAbbreviations(parsedAddress);
    changes.push("Expanded abbreviations to full names");
  }

  // Start with basic formatting - always use standard format initially
  const formattedResult = formatAddress(parsedAddress);
  let formattedAddress = formattedResult.singleLine;

  // Apply expansion of abbreviations to the formatted result if requested
  // This is done on the string level for simplicity
  if (opts.expandAbbreviations) {
    formattedAddress = expandStringAbbreviations(formattedAddress);
  }

  // Apply all formatting and cleaning options at the end for clean architecture
  formattedAddress = applyFinalFormatting(formattedAddress, parsedAddress, opts, changes);

  const wasModified = formattedAddress !== addressString.trim();

  return {
    cleanedAddress: formattedAddress,
    wasModified,
    changes,
  };
}

// Helper function to check if parsed address has valid components
function hasValidAddressComponents(parsedAddress: ParsedAddress): boolean {
  // Must have either a number or street, or be a recognized address type
  return !!(
    parsedAddress.number ||
    parsedAddress.street ||
    parsedAddress.city ||
    parsedAddress.state ||
    parsedAddress.zip ||
    parsedAddress.generalDelivery ||
    (parsedAddress.street && STREET_TYPE_DETECTION_PATTERN.test(parsedAddress.street))
  );
}

// Helper function to expand address abbreviations in parsed address
function expandAddressAbbreviations(address: ParsedAddress): void {
  // Street type expansions
  if (address.type) {
    const expanded = STREET_TYPE_EXPANSIONS[address.type.toLowerCase()];
    if (expanded) address.type = expanded;
  }

  // Direction expansions
  if (address.prefix) {
    const expanded = DIRECTION_EXPANSIONS[address.prefix.toLowerCase()];
    if (expanded) address.prefix = expanded;
  }

  if (address.suffix) {
    const expanded = DIRECTION_EXPANSIONS[address.suffix.toLowerCase()];
    if (expanded) address.suffix = expanded;
  }

  // State/province expansions
  if (address.state) {
    const lowerState = address.state.toLowerCase();
    const expanded =
      address.country === COUNTRIES.CANADA ? PROVINCE_EXPANSIONS[lowerState] : US_STATE_EXPANSIONS[lowerState];
    if (expanded) address.state = expanded;
  }

  // Unit type expansions
  if (address.secUnitType) {
    const expanded = SECONDARY_UNIT_TYPES[address.secUnitType.toLowerCase().replace(UTILITY_PATTERNS.NON_ALPHA, "")];
    if (expanded) address.secUnitType = expanded;
  }
}

// Helper function to apply case standardization
function applyCaseStandardization(text: string, caseType: "upper" | "lower" | "title" | "none"): string {
  switch (caseType) {
    case "upper":
      return text.toUpperCase();
    case "lower":
      return text.toLowerCase();
    case "title":
      return applySmartTitleCase(text);
    default:
      return text;
  }
}

// Smart title case that preserves state/province codes
function applySmartTitleCase(text: string): string {
  // First apply regular title case
  let result = text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

  // Then fix known state/province codes that should be uppercase
  const stateProvinceCodes = [
    // US States
    "AL",
    "AK",
    "AZ",
    "AR",
    "CA",
    "CO",
    "CT",
    "DE",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MD",
    "MA",
    "MI",
    "MN",
    "MS",
    "MO",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
    "WY",
    "DC",
    // Canadian Provinces
    "AB",
    "BC",
    "MB",
    "NB",
    "NL",
    "NS",
    "NT",
    "NU",
    "ON",
    "PE",
    "QC",
    "SK",
    "YT",
  ];

  // Fix state codes that got converted to title case
  stateProvinceCodes.forEach((code) => {
    const titleCaseCode = code.charAt(0) + code.substr(1).toLowerCase(); // e.g. "Ca" for "CA"
    // Use word boundaries to avoid replacing parts of other words
    const regex = new RegExp(`\\b${titleCaseCode}\\b`, "g");
    result = result.replace(regex, code);
  });

  return result;
}

// Apply string-level abbreviation expansion
function expandStringAbbreviations(addressString: string): string {
  let result = addressString;

  // Expand street types
  Object.entries(STREET_TYPE_EXPANSIONS).forEach(([abbr, expansion]) => {
    const regex = new RegExp(`\\b${abbr}\\b`, "gi");
    result = result.replace(regex, expansion);
  });

  // Expand directions
  Object.entries(DIRECTION_EXPANSIONS).forEach(([abbr, expansion]) => {
    const regex = new RegExp(`\\b${abbr}\\b`, "gi");
    result = result.replace(regex, expansion);
  });

  // Expand unit types
  Object.entries(SECONDARY_UNIT_TYPES).forEach(([abbr, expansion]) => {
    const regex = new RegExp(`\\b${abbr}\\b`, "gi");
    result = result.replace(regex, expansion);
  });

  // Expand US states
  Object.entries(US_STATE_EXPANSIONS).forEach(([abbr, expansion]) => {
    const regex = new RegExp(`\\b${abbr}\\b`, "gi");
    result = result.replace(regex, expansion);
  });

  // Expand provinces
  Object.entries(PROVINCE_EXPANSIONS).forEach(([abbr, expansion]) => {
    const regex = new RegExp(`\\b${abbr}\\b`, "gi");
    result = result.replace(regex, expansion);
  });

  return result;
}

// Apply all final formatting options in the correct order
function applyFinalFormatting(
  addressString: string,
  parsedAddress: ParsedAddress,
  opts: CleanAddressOptions,
  changes: string[],
): string {
  let result = addressString;

  // 1. Remove extra spaces and punctuation first
  if (opts.removeExtraSpaces) {
    const beforeSpaces = result;
    result = result
      .replace(/[.!@#$%^&*]+/g, "") // Remove extra punctuation marks
      .replace(/,+/g, ",") // Replace multiple commas with single comma
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .trim();

    if (beforeSpaces !== result) {
      changes.push("Removed extra spaces");
    }
  }

  // 2. Apply format-specific formatting (USPS/Canada Post)
  if (opts.format && opts.format !== "standard") {
    const beforeFormat = result;
    let formattedResult;

    switch (opts.format) {
      case "usps":
        formattedResult = formatUSPS(parsedAddress);
        result = formattedResult.lines.join(", ");
        break;
      case "canada-post":
        formattedResult = formatCanadaPost(parsedAddress);
        result = formattedResult.lines.join(", ");
        break;
    }

    if (beforeFormat !== result) {
      const formatName = opts.format === "canada-post" ? "Canada Post" : opts.format.toUpperCase();
      changes.push(`Applied ${formatName} formatting standards`);
    }
  }

  // 3. Apply case standardization last (or smart title case for standard format)
  if (opts.standardizeCase && opts.standardizeCase !== "none") {
    const originalCase = result;
    result = applyCaseStandardization(result, opts.standardizeCase);
    if (originalCase !== result) {
      changes.push(`Applied ${opts.standardizeCase} case standardization`);
    }
  } else if (opts.format === "standard" || !opts.format) {
    // Apply smart title case for standard format when no explicit case is set
    const originalCase = result;
    result = applySmartTitleCase(result);
    if (originalCase !== result) {
      changes.push("Applied smart title case");
    }
  }

  return result;
}

export { cleanAddress, cleanAddressDetailed };
