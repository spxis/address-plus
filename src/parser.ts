/**
 * Main address parser implementation
 * Based on the original parse-address library patterns
 */

import type { AddressParser, ParsedAddress, ParsedIntersection, ParseOptions } from "./types";
import {
  CA_PROVINCES,
  CA_STREET_TYPES,
  DIRECTIONAL_MAP,
  SECONDARY_UNIT_TYPES,
  US_STATES,
  US_STREET_TYPES,
} from "./data";
import {
  detectCountry,
  normalizeText,
  parseDirectional,
  parseFacility,
  parseParenthetical,
  parsePostalCode,
  parseSecondaryUnit,
  parseStateProvince,
  parseStreetNumber,
  parseStreetType,
} from "./utils";

// Build regex patterns similar to original parse-address
const buildPatterns = () => {
  const streetTypes = Object.keys(US_STREET_TYPES).concat(Object.values(US_STREET_TYPES))
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .sort((a, b) => b.length - a.length)
    .join('|');
  
  const directionals = Object.keys(DIRECTIONAL_MAP).concat(Object.values(DIRECTIONAL_MAP))
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .sort((a, b) => b.length - a.length)
    .join('|');
  
  const states = Object.keys(US_STATES).concat(Object.values(US_STATES))
    .concat(Object.keys(CA_PROVINCES)).concat(Object.values(CA_PROVINCES))
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .join('|');

  return {
    number: String.raw`(\d+[-\w]*|\w\d+\w\d+)`,
    fraction: String.raw`(\d+\/\d+)`,
    directional: `(${directionals})`,
    streetType: `(${streetTypes})`,
    state: `\\b(${states})\\b`,
    zip: String.raw`(\d{5}(?:[-\s]\d{4})?)`,
    poBox: String.raw`(?:p\.?o\.?\s*box|post\s*office\s*box|pobox)\s*(\d+)`,
    intersection: String.raw`\s+(?:and|&|at|\@)\s+`,
    secUnit: String.raw`(?:(suite?|ste?|apt|apartment|unit|#)\s*([a-z0-9-]+))`
  };
};

/**
 * Parse a location string into address components
 */
function parseLocation(address: string, options: ParseOptions = {}): ParsedAddress | null {
  if (!address || typeof address !== 'string') {
    return null;
  }

  const original = address.trim();

  // Check for intersection first
  const patterns = buildPatterns();
  if (new RegExp(patterns.intersection, 'i').test(original)) {
    return parseIntersection(original, options);
  }

  // Check for PO Box
  const poBoxMatch = original.match(new RegExp(`^\\s*${patterns.poBox}`, 'i'));
  if (poBoxMatch) {
    return parsePoBox(original, options);
  }

  // Try standard address parsing
  return parseStandardAddress(original, options) || parseInformalAddress(original, options);
}

/**
 * Parse PO Box addresses
 */
function parsePoBox(address: string, options: ParseOptions = {}): ParsedAddress | null {
  const patterns = buildPatterns();
  const match = address.match(new RegExp(
    `^\\s*${patterns.poBox}\\s*,?\\s*` +
    `(?:([^\\d,]+?)\\s*,?\\s*)?` +  // city
    `(?:${patterns.state}\\s*)?` +   // state
    `(?:${patterns.zip})?\\s*$`, 'i'
  ));

  if (!match) return null;

  const result: ParsedAddress = {
    sec_unit_type: match[0].replace(/\s*\d+.*$/, '').trim(),
    sec_unit_num: match[1]
  };

  if (match[2]) result.city = match[2].trim();
  if (match[3]) result.state = match[3].toUpperCase();
  if (match[4]) result.zip = match[4];

  // Detect country
  result.country = detectCountry(result);

  return result;
}

/**
 * Parse standard addresses with number, street, type, city, state, zip
 */
function parseStandardAddress(address: string, options: ParseOptions = {}): ParsedAddress | null {
  const patterns = buildPatterns();
  
  // Split by comma to handle comma-separated components
  const commaParts = address.split(',').map(p => p.trim());
  
  // Extract ZIP from end
  let zipPart = '';
  let cityStatePart = '';
  let addressPart = commaParts[0];
  
  if (commaParts.length > 1) {
    const lastPart = commaParts[commaParts.length - 1];
    const zipMatch = lastPart.match(new RegExp(patterns.zip));
    if (zipMatch) {
      zipPart = zipMatch[1];
      cityStatePart = lastPart.replace(zipMatch[0], '').trim();
      if (commaParts.length > 2) {
        cityStatePart = commaParts[commaParts.length - 2] + ' ' + cityStatePart;
      }
    } else {
      cityStatePart = commaParts.slice(1).join(' ');
    }
  }
  
  const result: ParsedAddress = {};
  
  // Parse address part (number, street, type, etc.)
  const addressMatch = addressPart.match(new RegExp(
    `^\\s*` +
    `(?:${patterns.number}\\s+)?` +           // number
    `(?:${patterns.fraction}\\s+)?` +         // fraction
    `(?:${patterns.directional}\\s+)?` +      // prefix directional
    `([^\\s]+(?:\\s+[^\\s]+)*)\\s*` +         // street name (capture everything else)
    `(?:${patterns.streetType}\\b\\s*)?` +    // street type
    `(?:${patterns.directional}\\s*)?` +      // suffix directional
    `(?:${patterns.secUnit}\\s*)?` +          // secondary unit
    `$`, 'i'
  ));

  if (addressMatch) {
    let i = 1;
    if (addressMatch[i]) result.number = addressMatch[i++];
    if (addressMatch[i]) result.fraction = addressMatch[i++];
    if (addressMatch[i]) result.prefix = addressMatch[i++].toUpperCase();
    
    // Parse street name and type from remaining text
    let streetText = addressMatch[i++];
    if (streetText) {
      // Extract street type from end of street text
      const streetTypeMatch = streetText.match(new RegExp(`\\b(${patterns.streetType.slice(1, -1)})\\b\\s*$`, 'i'));
      if (streetTypeMatch) {
        result.type = normalizeStreetType(streetTypeMatch[1]);
        result.street = streetText.replace(streetTypeMatch[0], '').trim();
      } else {
        result.street = streetText.trim();
      }
    }
    
    if (addressMatch[i]) result.suffix = addressMatch[i++].toUpperCase();
    if (addressMatch[i] && addressMatch[i + 1]) {
      result.sec_unit_type = addressMatch[i++].toLowerCase();
      result.sec_unit_num = addressMatch[i++];
      result.unit = `${result.sec_unit_type} ${result.sec_unit_num}`;
    }
  }
  
  // Parse city/state part
  if (cityStatePart) {
    const cityStateMatch = cityStatePart.match(new RegExp(`^(.+?)\\s+${patterns.state}\\s*$`, 'i'));
    if (cityStateMatch) {
      result.city = cityStateMatch[1].trim();
      result.state = cityStateMatch[2].toUpperCase();
    } else {
      // Just state, no city
      const stateMatch = cityStatePart.match(new RegExp(`^${patterns.state}\\s*$`, 'i'));
      if (stateMatch) {
        result.state = stateMatch[1].toUpperCase();
      } else {
        result.city = cityStatePart;
      }
    }
  }
  
  // Add ZIP
  if (zipPart) {
    result.zip = zipPart;
  }

  // Detect country if not set
  result.country = detectCountry(result);

  // Return result if we have meaningful components
  return (result.number || result.street) ? result : null;
}

/**
 * Parse informal addresses (fallback)
 */
function parseInformalAddress(address: string, options: ParseOptions = {}): ParsedAddress | null {
  const patterns = buildPatterns();
  
  // Simple fallback pattern
  const parts = address.split(/\s*,\s*/);
  if (parts.length === 0) return null;

  const result: ParsedAddress = {};
  
  // Try to extract number from first part
  const firstPart = parts[0];
  const numberMatch = firstPart.match(new RegExp(`^\\s*${patterns.number}\\s+(.+)$`));
  if (numberMatch) {
    result.number = numberMatch[1];
    result.street = numberMatch[2];
  } else {
    result.street = firstPart;
  }

  // Extract ZIP from last part
  if (parts.length > 1) {
    const lastPart = parts[parts.length - 1];
    const zipMatch = lastPart.match(new RegExp(patterns.zip));
    if (zipMatch) {
      result.zip = zipMatch[1];
      result.country = 'US';
    }
  }

  return result;
}

/**
 * Normalize street type using mapping
 */
function normalizeStreetType(type: string): string {
  const normalized = type.toLowerCase().replace(/\./g, '');
  return US_STREET_TYPES[normalized] || type.toLowerCase();
}

/**
 * Parse intersection addresses 
 */
function parseIntersection(address: string, options: ParseOptions = {}): ParsedIntersection | null {
  const patterns = buildPatterns();
  
  // Split on intersection indicators
  const intersectionPattern = new RegExp(patterns.intersection, 'i');
  const parts = address.split(intersectionPattern);
  
  if (parts.length !== 2) return null;

  const result: ParsedIntersection = {};
  
  // Parse location info from the end of the address
  let locationText = parts[1].trim();
  
  // Extract city, state, zip
  const locationMatch = locationText.match(new RegExp(
    `(.+?)\\s*,?\\s*([^,]+?)\\s*,?\\s*${patterns.state}\\s*(?:${patterns.zip})?\\s*$`, 'i'
  ));
  
  if (locationMatch) {
    result.city = locationMatch[2].trim();
    result.state = locationMatch[3].toUpperCase();
    if (locationMatch[4]) result.zip = locationMatch[4];
    locationText = locationMatch[1].trim();
  } else {
    // Try just city and state
    const simpleLocationMatch = locationText.match(new RegExp(
      `(.+?)\\s+${patterns.state}\\s*$`, 'i'
    ));
    if (simpleLocationMatch) {
      result.city = simpleLocationMatch[1].trim();
      result.state = simpleLocationMatch[2].toUpperCase();
      locationText = '';
    }
  }
  
  // Parse first street
  const street1Text = parts[0].trim();
  const street1Match = street1Text.match(new RegExp(
    `^([^\\s]+(?:\\s+[^\\s]+)*)\\s*(?:(${patterns.streetType.slice(1, -1)})\\b)?\\s*$`, 'i'
  ));
  if (street1Match) {
    result.street1 = street1Match[1].trim();
    result.type1 = street1Match[2] ? normalizeStreetType(street1Match[2]) : '';
  }

  // Parse second street
  const street2Text = locationText || parts[1].trim();
  const street2Match = street2Text.match(new RegExp(
    `^([^\\s]+(?:\\s+[^\\s]+)*)\\s*(?:(${patterns.streetType.slice(1, -1)})\\b)?`, 'i'
  ));
  if (street2Match) {
    result.street2 = street2Match[1].trim();
    result.type2 = street2Match[2] ? normalizeStreetType(street2Match[2]) : '';
  }

  // Ensure we have required fields
  if (!result.street1 || !result.street2) return null;

  // Set default empty types if not found
  if (!result.type1) result.type1 = '';
  if (!result.type2) result.type2 = '';

  return result;
}

/**
 * Parse address (compatibility alias)
 */
function parseAddress(address: string, options: ParseOptions = {}): ParsedAddress | null {
  return parseLocation(address, options);
}

/**
 * Parse informal address (compatibility export)
 */
// NOTE: parseInformalAddress is imported from utils

/**
 * Create address parser instance
 */
function createParser(defaultOptions: ParseOptions = {}): AddressParser {
  return {
    parseAddress: (address: string, options?: ParseOptions) => 
      parseAddress(address, { ...defaultOptions, ...options }),
    parseInformalAddress: (address: string, options?: ParseOptions) => 
      parseInformalAddress(address, { ...defaultOptions, ...options }),
    parseIntersection: (address: string, options?: ParseOptions) => 
      parseIntersection(address, { ...defaultOptions, ...options }),
    parseLocation: (address: string, options?: ParseOptions) => 
      parseLocation(address, { ...defaultOptions, ...options }),
  };
}

// Export default parser instance
const parser = createParser();

export {
  createParser,
  parseAddress,
  parseInformalAddress,
  parseIntersection,
  parseLocation,
  parser,
};
