import { CITY_PATTERNS } from "../constants";
import { buildPatterns } from "../patterns/pattern-builder";
import type { ParsedIntersection, ParseOptions } from "../types";
import { normalizeStreetType } from "../utils/street-type-normalizer";
import { setValidatedPostalCode } from "../validation/address-validation";

/**
 * Parse intersection addresses (e.g., "Main St & Elm Ave")
 */
export function parseIntersection(address: string, options: ParseOptions = {}): ParsedIntersection | null {
  const patterns = buildPatterns();
  
  // Split on intersection indicators
  const intersectionPattern = new RegExp(patterns.intersection, 'i');
  const parts = address.split(intersectionPattern);
  
  if (parts.length !== 2) return null;

  const result: ParsedIntersection = {};
  
  // Parse location info from the end of the address
  let locationText = parts[1].trim();
  
  // For intersections, try to extract city/state/zip from the end differently
  // Pattern: "Street2Name City State ZIP" or "Street2Name City State"
  const zipMatch = locationText.match(new RegExp(`\\s+(${patterns.zip.slice(1, -1)})\\s*$`));
  if (zipMatch) {
    setValidatedPostalCode(result, zipMatch[1], options);
    locationText = locationText.replace(zipMatch[0], '').trim();
  }
  
  // Extract state from the end
  const stateMatch = locationText.match(new RegExp(`\\s+(${patterns.state.slice(2, -2)})\\s*$`, 'i'));
  if (stateMatch) {
    result.state = stateMatch[1].toUpperCase();
    locationText = locationText.replace(stateMatch[0], '').trim();
  }
  
  // Extract city (1-2 words before state) - only if we have a state
  if (result.state) {
    // Remove trailing comma first
    locationText = locationText.replace(/,\s*$/, '').trim();
    
    // Look for city pattern: comma followed by 1-3 words at the end, or 1-3 words at the end
    let cityMatch = locationText.match(/,\s+([A-Za-z\s]+)$/);
    if (cityMatch) {
      result.city = cityMatch[1].trim();
      locationText = locationText.replace(cityMatch[0], '').trim();
    } else {
      // Try without comma - look for 1-2 words before the state
      cityMatch = locationText.match(CITY_PATTERNS.BASIC_CITY);
      if (cityMatch) {
        result.city = cityMatch[1].trim();
        locationText = locationText.replace(cityMatch[0], '').trim();
      }
    }
  } else {
    // No state, so clean up any trailing comma from the full locationText
    locationText = locationText.replace(/,\s*$/, '').trim();
  }
  
  // Parse first street
  const street1Text = parts[0].trim();
  const street1Match = street1Text.match(new RegExp(
    `^(?:(${patterns.directional.slice(1, -1)})\\s+)?([^\\s]+(?:\\s+[^\\s]+)*)\\s+(${patterns.streetType.slice(1, -1)})\\b`, 'i'
  ));
  if (street1Match) {
    if (street1Match[1]) result.prefix1 = street1Match[1].toUpperCase();
    result.street1 = street1Match[2].trim();
    result.type1 = normalizeStreetType(street1Match[3]);
  } else {
    // No type found, treat entire text as street name
    const simpleMatch = street1Text.match(new RegExp(
      `^(?:(${patterns.directional.slice(1, -1)})\\s+)?(.+)$`, 'i'
    ));
    if (simpleMatch) {
      if (simpleMatch[1]) result.prefix1 = simpleMatch[1].toUpperCase();
      result.street1 = simpleMatch[2].trim();
      result.type1 = '';
    }
  }

  // Parse second street
  const street2Text = locationText || parts[1].trim();
  const street2Match = street2Text.match(new RegExp(
    `^(?:(${patterns.directional.slice(1, -1)})\\s+)?([^\\s]+(?:\\s+[^\\s]+)*)\\s+(${patterns.streetType.slice(1, -1)})\\b`, 'i'
  ));
  if (street2Match) {
    if (street2Match[1]) result.prefix2 = street2Match[1].toUpperCase();
    result.street2 = street2Match[2].trim();
    result.type2 = normalizeStreetType(street2Match[3]);
  } else {
    // No type found, treat entire text as street name
    const simpleMatch = street2Text.match(new RegExp(
      `^(?:(${patterns.directional.slice(1, -1)})\\s+)?(.+)$`, 'i'
    ));
    if (simpleMatch) {
      if (simpleMatch[1]) result.prefix2 = simpleMatch[1].toUpperCase();
      result.street2 = simpleMatch[2].trim();
      result.type2 = '';
    }
  }

  // Ensure we have required fields
  if (!result.street1 || !result.street2) return null;

  // Set default empty types if not found
  if (!result.type1) result.type1 = '';
  if (!result.type2) result.type2 = '';

  return result;
}