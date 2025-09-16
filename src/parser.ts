/**
 * Main address parser implementation
 */

import { ParsedAddress, ParsedIntersection, ParseOptions, AddressParser } from './types';
import {
  normalizeText,
  parseDirectional,
  parseStreetType,
  parseStateProvince,
  parsePostalCode,
  parseSecondaryUnit,
  parseFacility,
  parseParenthetical,
  parseStreetNumber,
  detectCountry,
} from './utils';
import { US_STREET_TYPES, CA_STREET_TYPES } from './data';

/**
 * Parse a location string into address components
 */
export function parseLocation(address: string, options: ParseOptions = {}): ParsedAddress | null {
  if (!address || typeof address !== 'string') {
    return null;
  }

  const {
    country = 'auto',
    normalize = true,
    validatePostalCode = true,
    language = 'auto',
    extractFacilities = true,
    parseParenthetical: enableParenthetical = true,
  } = options;

  let text = normalizeText(address);
  const result: ParsedAddress = {};

  // Parse parenthetical information first if enabled
  if (enableParenthetical) {
    const { secondary, remaining } = parseParenthetical(text);
    if (secondary) {
      result.secondary = secondary;
      text = remaining;
    }
  }

  // Extract facility names if enabled
  if (extractFacilities) {
    const { facility, remaining } = parseFacility(text);
    if (facility) {
      result.facility = facility;
      text = remaining;
    }
  }

  // Split by commas to help parse structure
  const commaParts = text.split(',').map(s => s.trim()).filter(Boolean);
  
  let streetAndNumber = '';
  let cityStateZip = '';

  if (commaParts.length >= 2) {
    streetAndNumber = commaParts[0];
    cityStateZip = commaParts.slice(1).join(' ');
  } else {
    // No commas, need to parse the whole string
    streetAndNumber = text;
  }

  // Parse city, state, zip from the end
  let workingText = cityStateZip;
  
  // Extract postal/ZIP code first
  if (workingText) {
    const postalResult = parsePostalCode(workingText);
    if (postalResult.zip) {
      result.zip = postalResult.zip;
      result.zipext = postalResult.zipext;
      workingText = postalResult.remaining;
      
      if (country === 'auto' && postalResult.detectedCountry) {
        result.country = postalResult.detectedCountry;
      }
    }

    // Extract state/province from what remains
    const stateResult = parseStateProvince(workingText, country === 'auto' ? undefined : country);
    if (stateResult.state) {
      result.state = stateResult.state;
      workingText = stateResult.remaining;
      
      if (country === 'auto' && stateResult.detectedCountry && !result.country) {
        result.country = stateResult.detectedCountry;
      }
    }

    // What remains after removing state and ZIP should be the city
    if (workingText.trim()) {
      result.city = workingText.trim();
    }
  }

  // Parse street and number
  workingText = streetAndNumber;

  // If we don't have city/state/zip yet, try to extract them from the whole string
  if (!result.city && !result.state && !result.zip) {
    // Extract postal code from anywhere
    const postalResult = parsePostalCode(workingText);
    if (postalResult.zip) {
      result.zip = postalResult.zip;
      result.zipext = postalResult.zipext;
      workingText = postalResult.remaining;
      
      if (country === 'auto' && postalResult.detectedCountry) {
        result.country = postalResult.detectedCountry;
      }
    }

    // Extract state/province
    const stateResult = parseStateProvince(workingText, country === 'auto' ? undefined : country);
    if (stateResult.state) {
      result.state = stateResult.state;
      workingText = stateResult.remaining;
      
      if (country === 'auto' && stateResult.detectedCountry && !result.country) {
        result.country = stateResult.detectedCountry;
      }
    }
  }

  // Extract secondary unit information
  const unitResult = parseSecondaryUnit(workingText);
  if (unitResult.unit) {
    result.unit = unitResult.unit;
    result.sec_unit_type = unitResult.sec_unit_type;
    result.sec_unit_num = unitResult.sec_unit_num;
    workingText = unitResult.remaining;
  }

  // Extract street number from the beginning
  const numberResult = parseStreetNumber(workingText);
  if (numberResult.number) {
    result.number = numberResult.number;
    workingText = numberResult.remaining;
  }

  // Extract prefix directional
  const prefixResult = parseDirectional(workingText);
  if (prefixResult.direction) {
    result.prefix = prefixResult.direction;
    workingText = prefixResult.remaining;
  }

  // Determine country for street type parsing
  const parseCountry = result.country || (country !== 'auto' ? country : 'US');

  // Extract street type
  const typeResult = parseStreetType(workingText, parseCountry);
  if (typeResult.type) {
    result.type = typeResult.type;
    workingText = typeResult.remaining;
  }

  // Extract suffix directional
  const suffixResult = parseDirectional(workingText);
  if (suffixResult.direction) {
    result.suffix = suffixResult.direction;
    workingText = suffixResult.remaining;
  }

  // What remains should be street name and possibly city if not already extracted
  const remainingParts = workingText.split(/\s+/).filter(Boolean);
  
  if (remainingParts.length > 0) {
    if (!result.city && remainingParts.length > 1 && result.number) {
      // If we have a number and multiple parts, last part might be city
      result.street = remainingParts.slice(0, -1).join(' ');
      result.city = remainingParts.slice(-1)[0];
    } else {
      // All remaining text is street name
      result.street = remainingParts.join(' ');
    }
  }

  // Auto-detect country if not already determined
  if (!result.country) {
    result.country = detectCountry(result);
  }

  // Validate postal code if requested
  if (validatePostalCode && result.zip && result.country) {
    const isValid = result.country === 'US' 
      ? /^\d{5}(?:-\d{4})?$/.test(result.zip)
      : /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/.test(result.zip);
    
    if (!isValid) {
      delete result.zip;
      delete result.zipext;
    }
  }

  // Return null if we couldn't parse any meaningful components
  const hasComponents = result.number || result.street || result.city || result.state || result.zip;
  return hasComponents ? result : null;
}

/**
 * Parse an intersection string
 */
export function parseIntersection(address: string, options: ParseOptions = {}): ParsedIntersection | null {
  if (!address || typeof address !== 'string') {
    return null;
  }

  const text = normalizeText(address);
  const result: ParsedIntersection = {};

  // Look for intersection indicators
  const intersectionMarkers = /\b(?:and|&|at|@|\/|\\|intersection of|corner of)\b/i;
  const match = text.match(intersectionMarkers);
  
  if (!match) {
    return null; // No intersection indicator found
  }

  const parts = text.split(intersectionMarkers);
  if (parts.length !== 2) {
    return null;
  }

  const street1Text = parts[0].trim();
  const street2Text = parts[1].trim();

  // Parse each street
  const parseCountry = options.country !== 'auto' ? options.country : 'US';

  // Parse first street
  let s1Text = street1Text;
  const s1PrefixResult = parseDirectional(s1Text);
  if (s1PrefixResult.direction) {
    result.prefix1 = s1PrefixResult.direction;
    s1Text = s1PrefixResult.remaining;
  }

  const s1TypeResult = parseStreetType(s1Text, parseCountry);
  if (s1TypeResult.type) {
    result.type1 = s1TypeResult.type;
    s1Text = s1TypeResult.remaining;
  }

  const s1SuffixResult = parseDirectional(s1Text);
  if (s1SuffixResult.direction) {
    result.suffix1 = s1SuffixResult.direction;
    s1Text = s1SuffixResult.remaining;
  }

  if (s1Text.trim()) {
    result.street1 = s1Text.trim();
  }

  // Parse second street (may include city, state, zip)
  let s2Text = street2Text;
  
  // Extract postal code from second street
  const postalResult = parsePostalCode(s2Text);
  if (postalResult.zip) {
    result.zip = postalResult.zip;
    s2Text = postalResult.remaining;
  }

  // Extract state from second street
  const stateResult = parseStateProvince(s2Text);
  if (stateResult.state) {
    result.state = stateResult.state;
    s2Text = stateResult.remaining;
    
    if (stateResult.detectedCountry) {
      result.country = stateResult.detectedCountry;
    }
  }

  const s2PrefixResult = parseDirectional(s2Text);
  if (s2PrefixResult.direction) {
    result.prefix2 = s2PrefixResult.direction;
    s2Text = s2PrefixResult.remaining;
  }

  const s2TypeResult = parseStreetType(s2Text, parseCountry);
  if (s2TypeResult.type) {
    result.type2 = s2TypeResult.type;
    s2Text = s2TypeResult.remaining;
  }

  const s2SuffixResult = parseDirectional(s2Text);
  if (s2SuffixResult.direction) {
    result.suffix2 = s2SuffixResult.direction;
    s2Text = s2SuffixResult.remaining;
  }

  // Remaining text could be street name and/or city
  const s2Parts = s2Text.split(/\s+/).filter(Boolean);
  if (s2Parts.length > 0) {
    if (s2Parts.length === 1) {
      result.street2 = s2Parts[0];
    } else {
      // Assume last word is city if we don't have state/zip to help determine
      if (!result.state && !result.zip) {
        result.street2 = s2Parts.slice(0, -1).join(' ');
        result.city = s2Parts.slice(-1)[0];
      } else {
        result.street2 = s2Parts.join(' ');
      }
    }
  }

  // Return result if we have at least two streets
  return (result.street1 && result.street2) ? result : null;
}

/**
 * Parse an informal address (more lenient parsing)
 */
export function parseInformalAddress(address: string, options: ParseOptions = {}): ParsedAddress | null {
  // For informal addresses, be more lenient with parsing
  const informalOptions: ParseOptions = {
    ...options,
    validatePostalCode: false, // Don't validate postal codes strictly
    parseParenthetical: true,  // Always parse parenthetical info
    extractFacilities: true,   // Always extract facilities
  };

  return parseLocation(address, informalOptions);
}

/**
 * Main parse function (alias for parseLocation for API compatibility)
 */
export function parseAddress(address: string, options: ParseOptions = {}): ParsedAddress | null {
  return parseLocation(address, options);
}

/**
 * Create the parser object with all methods
 */
export const addressParser: AddressParser = {
  parseLocation,
  parseIntersection,
  parseInformalAddress,
  parseAddress,
};