import { VALIDATION_PATTERNS } from "../constants";
import { COMMON_PARSER_PATTERNS, PO_BOX_PATTERNS } from "../constants/parser-patterns";
import { CANADIAN_POSTAL_LIBERAL_PATTERN } from "../patterns/location-patterns";
import { buildPatterns } from "../patterns/pattern-builder";
import type { ParsedAddress, ParseOptions } from "../types";
import { detectCountry, parseStateProvince } from "../utils";
import { setValidatedPostalCode } from "../utils/address-validation";

// Parse PO Box addresses
function parsePoBox(address: string, options: ParseOptions = {}): ParsedAddress | null {
  const patterns = buildPatterns();

  // Try a flexible parse that supports both US and CA formats, with optional commas
  // Examples handled:
  //  - Post office Box 3094 Collierville TN 38027
  //  - P.O. Box 9999, Station Main, Halifax, NS B3J 3A7
  //  - C.P. 5678, Succursale A, Ville-Marie, QC H3B 1X9
  //  - PO Box 123 Station A Toronto ON M5W 1A1
  //  - RR 2 Site 10 Comp 5 Whitehorse YT Y1A 0C1 (not a pure PO Box, but special postal)

  const text = address.trim();
  const poMatch = text.match(new RegExp(`^\s*${patterns.poBox}`, "i"));
  if (!poMatch) return null;

  // First, try a strict US PO Box pattern: indicator + number + city + state + zip
  const usMatch = address.match(PO_BOX_PATTERNS.US_PO_BOX);
  if (usMatch) {
    const result: ParsedAddress = {
      secUnitType: "PO Box",
      secUnitNum: usMatch[1],
      city: usMatch[2].trim(),
      state: usMatch[3].toUpperCase(),
    };
    if (usMatch[4]) setValidatedPostalCode(result, usMatch[4], options || {});
    result.country = detectCountry(result);
    return result;
  }

  const after = text.slice(poMatch[0].length).trim().replace(/^,\s*/, "");

  const result: ParsedAddress = {};
  const poType = normalizePoBoxType(poMatch[1]);
  result.secUnitType = poType;

  // Prefer number captured inside the initial poBox pattern
  if (poMatch[2]) {
    result.secUnitNum = poMatch[2];
  }

  // Otherwise, capture an immediate box number if present right after the PO indicator
  const leadingBoxNum = !result.secUnitNum ? after.match(PO_BOX_PATTERNS.LEADING_BOX_NUMBER) : null;
  let rest = after;
  if (leadingBoxNum) {
    result.secUnitNum = leadingBoxNum[1];
    rest = after.slice(leadingBoxNum[0].length).trim();
  }

  // Optional station/succursale/RPO/RR segments
  // Capture patterns like: Station A | Succursale Centre-ville | RPO University Village | RR 2 | R.R. 3
  // Look for these at the beginning of the remaining string after the PO Box number
  let stationPart: RegExpMatchArray | null = null;
  const stationMatch = rest.match(PO_BOX_PATTERNS.STATION_PATTERN);
  if (stationMatch) {
    stationPart = stationMatch;
    // Remove the matched station part from rest
    rest = rest.slice(stationMatch[0].length).trim().replace(/^,\s*/, "");
    const kind = stationMatch[1].toLowerCase();
    const value = (stationMatch[2] || "").trim();
    if (kind.startsWith("rr")) {
      result.rr = value || undefined;
      if (value) {
        (result as any).ruralRoute = `RR ${value}`;
      }
    } else if (kind === "rpo") {
      result.rpo = value || undefined;
      if (value) {
        result.place = `RPO ${value}`;
      }
    } else {
      // Station or Succursale
      result.station = value || undefined;
      if (value) {
        const label = kind.startsWith("succ") ? "Succursale" : "Station";
        result.place = `${label} ${value}`.trim();
      }
    }
  }

  // Now parse remaining: expect optional city, province/state, postal/zip
  // Try to pull postal code (US or CA) from the end first
  const caPostal = rest.match(COMMON_PARSER_PATTERNS.POSTAL_AT_END(CANADIAN_POSTAL_LIBERAL_PATTERN.source));
  const usZip = rest.match(COMMON_PARSER_PATTERNS.POSTAL_AT_END(patterns.zip));
  if (caPostal) {
    setValidatedPostalCode(result, caPostal[1], options || {});
    rest = rest
      .slice(0, rest.length - caPostal[0].length)
      .trim()
      .replace(/[,\s]+$/, "");
  } else if (usZip) {
    setValidatedPostalCode(result, usZip[1], options || {});
    rest = rest
      .slice(0, rest.length - usZip[0].length)
      .trim()
      .replace(/[,\s]+$/, "");
  }

  // Try to get trailing province/state abbreviation
  // Look for city + state pattern at the end
  const cityStateAbbrevMatch = rest.match(COMMON_PARSER_PATTERNS.CITY_STATE_PATTERN(patterns.stateAbbrev));
  if (cityStateAbbrevMatch) {
    const cityPart = cityStateAbbrevMatch[1].trim().replace(PO_BOX_PATTERNS.TRAILING_COMMA, ""); // Remove trailing comma
    const stateInfo = parseStateProvince(cityStateAbbrevMatch[2]);
    result.city = cityPart;
    result.state = stateInfo.state || cityStateAbbrevMatch[2].toUpperCase();
    rest = ""; // consumed all remaining text
  } // Whatever remains at the end is likely the city (last token group)
  if (rest) {
    // Remove trailing comma
    rest = rest.replace(PO_BOX_PATTERNS.TRAILING_COMMA, "");
    // If comma-separated segments remain, try to split out city/state
    const pieces = rest
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (pieces.length >= 2) {
      // Typically: City, ST or Station Main, City, ST
      const last = pieces[pieces.length - 1];
      const prev = pieces[pieces.length - 2];
      const stateGuess = parseStateProvince(last);
      if (stateGuess.state) {
        result.state = result.state || stateGuess.state;
        result.city = prev;
      } else {
        result.city = pieces.join(", ");
      }
    } else {
      result.city = rest;
    }
  }

  // Detect country at the end
  result.country = detectCountry(result);

  return result;
}

// Normalize PO Box type to standard format
function normalizePoBoxType(type: string): string {
  // Normalize to proper case format - capitalize first letter of each word
  const cleaned = type.replace(VALIDATION_PATTERNS.NORMALIZE_SPACES, " ").trim();

  const normalizedType = cleaned.toLowerCase();
  if (
    /^p\.?\s*o\.?\s*box$/.test(normalizedType) ||
    /^po\s*box$/.test(normalizedType) ||
    /^post\s*office\s*box$/.test(normalizedType)
  ) {
    return "PO Box";
  }
  if (/^c\.?p\.?$/.test(normalizedType) || normalizedType === "cp") {
    return "CP"; // Case postale abbreviation
  }
  if (/^case\s*postale$/.test(normalizedType)) {
    return "Case Postale";
  }
  if (/^bo[iî]te\s*postale$/.test(normalizedType) || /^boite\s*postale$/.test(normalizedType)) {
    return "Boîte Postale";
  }
  if (normalizedType === "rpo") return "RPO";
  if (normalizedType === "rr" || normalizedType === "r.r." || /^r\.?r\.?$/.test(normalizedType)) return "RR";
  if (normalizedType === "box") return "Box"; // Simple Canadian Box

  return cleaned
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export { normalizePoBoxType, parsePoBox };
