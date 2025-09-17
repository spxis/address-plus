/**
 * Main address parser implementation
 * Based on the original parse-address library patterns
 */

import type { AddressParser, ParsedAddress, ParsedIntersection, ParseOptions } from "./types";
import {
  CA_PROVINCES,
  CA_STREET_TYPES,
  CANADIAN_POSTAL_LIBERAL_PATTERN,
  DIRECTIONAL_MAP,
  FACILITY_DELIMITER_PATTERN,
  FACILITY_PATTERNS,
  SECONDARY_UNIT_PATTERN,
  SECONDARY_UNIT_TYPES,
  STREET_TYPE_PROPER_CASE,
  UNIT_TYPE_NUMBER_PATTERN,
  UNIT_TYPE_KEYWORDS,
  WRITTEN_NUMBERS,
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
    .concat(Object.keys(CA_STREET_TYPES)).concat(Object.values(CA_STREET_TYPES))
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
  
  // Create separate pattern for state abbreviations (2-3 chars) vs full names
  const stateAbbrevs = Object.values(US_STATES).concat(Object.values(CA_PROVINCES))
    .filter((v, i, arr) => arr.indexOf(v) === i && v.length <= 3)
    .sort((a, b) => b.length - a.length)
    .join('|');
    
  const stateFullNames = Object.keys(US_STATES).concat(Object.keys(CA_PROVINCES))
    .filter((v, i, arr) => arr.indexOf(v) === i && v.length > 3)
    .sort((a, b) => b.length - a.length)
    .join('|');

  return {
    number: String.raw`(\d+[-\/]*\d*|\w\d+\w\d+|${WRITTEN_NUMBERS})`,  // Include written numbers
    fraction: String.raw`(\d+\/\d+)`,
    directional: `(${directionals})`,
    streetType: `(${streetTypes})`,
    state: `\\b(${states})\\b`,
    stateAbbrev: `\\b(${stateAbbrevs})\\b`,
    stateFullName: `\\b(${stateFullNames})\\b`,
    zip: String.raw`(\d{5}(?:[-\s]\d{4})?)`,
    poBox: String.raw`(?:p\.?o\.?\s*box|post\s*office\s*box|pobox)\s*(\d+)`,
    intersection: String.raw`\s+(?:and|&|at|\@)\s+`,
    secUnit: String.raw`(?:(${UNIT_TYPE_KEYWORDS}|#)\s+([a-z0-9-]+))`
  };
};

/**
 * Check if input contains recognizable address components
 */
function hasValidAddressComponents(address: string): boolean {
  const patterns = buildPatterns();
  
  // Basic validation - must have letters and be reasonable length
  if (!/[a-zA-Z]/.test(address) || address.trim().length < 3) {
    return false;
  }
  
  // If it's mostly special characters, reject
  const alphanumericCount = (address.match(/[a-zA-Z0-9]/g) || []).length;
  if (alphanumericCount < address.length * 0.3) {
    return false;
  }
  
  // Check for address-like patterns
  const hasNumber = /\d/.test(address);
  const hasStreetType = new RegExp(`\\b(${patterns.streetType})\\b`, 'i').test(address);
  const hasDirectional = new RegExp(`\\b(${patterns.directional.slice(1, -1)})\\b`, 'i').test(address);
  const hasState = new RegExp(`\\b(${patterns.state.slice(2, -2)})\\b`, 'i').test(address);
  const hasZip = new RegExp(patterns.zip, 'i').test(address);
  const hasCommaStructure = address.includes(',');
  const isIntersection = new RegExp(patterns.intersection, 'i').test(address);
  const hasPoBox = new RegExp(patterns.poBox, 'i').test(address);
  
  // Valid if it has:
  // 1. Numbers (potential house number), OR
  // 2. Street type words (St, Ave, etc.), OR  
  // 3. Directional words (N, South, etc.), OR
  // 4. State abbreviations, OR
  // 5. ZIP codes, OR
  // 6. Comma structure (city, state format), OR
  // 7. Intersection indicators, OR
  // 8. PO Box indicators
  if (hasNumber || hasStreetType || hasDirectional || hasState || hasZip || hasCommaStructure || isIntersection || hasPoBox) {
    return true;
  }
  
  // For longer phrases, be more lenient (might be facility names)
  if (address.trim().split(/\s+/).length >= 3) {
    return true;
  }
  
  return false;
}

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
    `(?:(${patterns.state.slice(2, -2)})\\s*)?` +   // state
    `(?:(${patterns.zip.slice(1, -1)}))?\\s*$`, 'i'
  ));

  if (!match) return null;

  const result: ParsedAddress = {
    sec_unit_type: normalizePoBoxType(match[1]),
    sec_unit_num: match[2]
  };

  if (match[3]) result.city = match[3].trim();
  if (match[4]) result.state = match[4].toUpperCase();
  if (match[5]) result.zip = match[5];

  // Detect country
  result.country = detectCountry(result);

  return result;
}

/**
 * Normalize PO Box type to standard format
 */
function normalizePoBoxType(type: string): string {
  const normalized = type.toLowerCase().replace(/\./g, '').replace(/\s+/g, ' ').trim();
  if (normalized.includes('post office box') || normalized.includes('po box') || normalized.includes('pobox')) {
    return 'PO box';
  }
  return normalized;
}

/**
 * Parse standard addresses with number, street, type, city, state, zip
 */
function parseStandardAddress(address: string, options: ParseOptions = {}): ParsedAddress | null {
  const patterns = buildPatterns();
  
  // Check if input contains valid address components
  if (!hasValidAddressComponents(address)) {
    return null;
  }
  
  // Split by comma to handle comma-separated components
  const commaParts = address.split(',').map(p => p.trim());
  
  // Detect facility addresses (facility name comes first, followed by actual address)
  let addressStartIndex = 0;
  if (commaParts.length > 1) {
    const firstPart = commaParts[0];
    
    // Simple heuristic: if the first part doesn't contain typical address components
    // (no numbers, no street types), treat it as a facility name
    const hasAddressNumbers = /\d/.test(firstPart);
    const hasStreetTypes = Object.keys(US_STREET_TYPES).some(type => 
      new RegExp(`\\b${type}\\b`, 'i').test(firstPart)
    ) || Object.keys(CA_STREET_TYPES).some(type => 
      new RegExp(`\\b${type}\\b`, 'i').test(firstPart)
    );
    
    // If first part looks like a facility name (no numbers or street types), skip it
    if (!hasAddressNumbers && !hasStreetTypes && commaParts.length > 1) {
      addressStartIndex = 1;
    }
  }
  
  // Extract ZIP from end and work backwards
  let zipPart = '';
  let statePart = '';
  let cityPart = '';
  let addressPart = commaParts[addressStartIndex] || commaParts[0];
  
  // Track which comma parts to exclude from city parsing (for secondary units, facilities)
  const excludedPartIndices = new Set<number>();
  
  // Handle non-comma separated addresses
  if (commaParts.length === 1) {
    // No commas, try to parse city/state/zip from the end
    let remainingText = address.trim();
    
    // Extract ZIP first
    const zipMatch = remainingText.match(new RegExp(`\\s+(${patterns.zip.slice(1, -1)})\\s*$`));
    const caPostalMatch = remainingText.match(new RegExp(`\\s+(${CANADIAN_POSTAL_LIBERAL_PATTERN.source})\\s*$`));
    
    if (zipMatch) {
      zipPart = zipMatch[1];
      remainingText = remainingText.replace(zipMatch[0], '').trim();
    } else if (caPostalMatch) {
      zipPart = caPostalMatch[1];
      remainingText = remainingText.replace(caPostalMatch[0], '').trim();
    }
    
    // Extract state (try abbreviations first, then full names)
    const stateAbbrevMatch = remainingText.match(new RegExp(`\\s+(${patterns.stateAbbrev.slice(2, -2)})\\s*$`, 'i'));
    const stateFullMatch = remainingText.match(new RegExp(`\\s+(${patterns.stateFullName.slice(2, -2)})\\s*$`, 'i'));
    
    if (stateAbbrevMatch) {
      statePart = stateAbbrevMatch[1];
      remainingText = remainingText.replace(stateAbbrevMatch[0], '').trim();
    } else if (stateFullMatch) {
      statePart = stateFullMatch[1];
      remainingText = remainingText.replace(stateFullMatch[0], '').trim();
    }

    // Extract city (what's left after removing ZIP and state, taking the last word(s))
    if (remainingText) {
      // Look for city at the end of remaining text, but be smart about it
      // If we have a state, we can be more confident about city extraction
      // If no state, only extract city if we can clearly identify a non-street-type word
      const hasState = !!statePart;
      
      if (hasState) {
        // With state, we can confidently extract city as usual
        const singleWordCityMatch = remainingText.match(/\s+([A-Za-z]+)$/);
        const twoWordCityMatch = remainingText.match(/\s+([A-Za-z]+\s+[A-Za-z]+)$/);
        
        let potentialCity = '';
        let matchToReplace = null;
        
        // Prefer longer matches first (two words over one word)
        if (twoWordCityMatch) {
          potentialCity = twoWordCityMatch[1].trim();
          matchToReplace = twoWordCityMatch[0];
        } else if (singleWordCityMatch) {
          potentialCity = singleWordCityMatch[1].trim();
          matchToReplace = singleWordCityMatch[0];
        }
        
        // Check if potential city is actually a street type or starts with a street type
        const isStreetType = new RegExp(`^(${patterns.streetType.slice(1, -1)})$`, 'i').test(potentialCity);
        const startsWithStreetTypeMatch = potentialCity.match(new RegExp(`^(${patterns.streetType.slice(1, -1)})\\s+(.+)$`, 'i'));
        
        if (potentialCity && !isStreetType && matchToReplace) {
          if (startsWithStreetTypeMatch) {
            // If the potential city starts with a street type, extract just the city part
            cityPart = startsWithStreetTypeMatch[2];
            // Only remove the city part, not the street type
            const cityOnlyMatch = remainingText.match(new RegExp(`\\s+(${cityPart.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})$`));
            if (cityOnlyMatch) {
              remainingText = remainingText.replace(cityOnlyMatch[0], '').trim();
            }
          } else {
            cityPart = potentialCity;
            remainingText = remainingText.replace(matchToReplace, '').trim();
          }
        }
      } else {
        // Without state, be very conservative about city extraction
        // Only extract if we have a clear non-street-type word at the end
        // AND the remaining text suggests a full address (at least 4+ words)
        const wordCount = remainingText.split(/\s+/).length;
        if (wordCount >= 5) { // More conservative: at least "number prefix street type city"
          const singleWordCityMatch = remainingText.match(/\s+([A-Za-z]+)$/);
          
          if (singleWordCityMatch) {
            const potentialCity = singleWordCityMatch[1].trim();
            const isStreetType = new RegExp(`^(${patterns.streetType.slice(1, -1)})$`, 'i').test(potentialCity);
            const isDirectional = new RegExp(`^(${patterns.directional.slice(1, -1)})$`, 'i').test(potentialCity);
            
            // Only extract if it's clearly not a street component
            if (!isStreetType && !isDirectional && potentialCity.length > 2) {
              cityPart = potentialCity;
              remainingText = remainingText.replace(singleWordCityMatch[0], '').trim();
            }
          }
        }
      }
    }
    
    // Use remaining text as address part (after removing city/state/zip)
    if (remainingText) {
      addressPart = remainingText;
    }
  } else {
    const lastPart = commaParts[commaParts.length - 1];
    const zipMatch = lastPart.match(new RegExp(`(${patterns.zip.slice(1, -1)})`));
    const caPostalMatch = lastPart.match(CANADIAN_POSTAL_LIBERAL_PATTERN);
    
    if (zipMatch) {
      zipPart = zipMatch[1];
      // Remove ZIP from the part and see what's left (might be city + state)
      const remainingAfterZip = lastPart.replace(zipMatch[0], '').trim();
      if (remainingAfterZip) {
        // Try to parse city and state from remaining text
        const cityStateAbbrevMatch = remainingAfterZip.match(new RegExp(`^(.+?)\\s+(${patterns.stateAbbrev.slice(2, -2)})\\s*$`, 'i'));
        if (cityStateAbbrevMatch) {
          cityPart = cityStateAbbrevMatch[1].trim();
          statePart = cityStateAbbrevMatch[2].trim();
        } else {
          const cityStateFullMatch = remainingAfterZip.match(new RegExp(`^(.+?)\\s+(${patterns.stateFullName.slice(2, -2)})\\s*$`, 'i'));
          if (cityStateFullMatch) {
            cityPart = cityStateFullMatch[1].trim();
            statePart = cityStateFullMatch[2].trim();
          } else {
            // Just state or unknown format
            statePart = remainingAfterZip;
          }
        }
      }
      // Check if we have city in previous part (but skip excluded parts like secondary units)
      // Also consider if we skipped a facility name (addressStartIndex > 0)
      if (commaParts.length > 2) {
        // Find the last non-excluded part that could be a city
        // But don't go back before the address start index (to skip facility names)
        for (let i = commaParts.length - 2; i >= Math.max(1, addressStartIndex); i--) {
          if (!excludedPartIndices.has(i)) {
            // Only set city if we haven't already parsed it from city/state pattern
            if (!cityPart) {
              cityPart = commaParts[i].trim();
            }
            break;
          }
        }
      } else if (commaParts.length === 2 && !statePart) {
        // No ZIP was removed, so this might be city, state
        const remainingText = lastPart.replace(zipMatch[0], '').trim();
        const cityStateAbbrevMatch = remainingText.match(new RegExp(`^(.+?)\\s+(${patterns.stateAbbrev.slice(2, -2)})\\s*$`, 'i'));
        if (cityStateAbbrevMatch) {
          cityPart = cityStateAbbrevMatch[1].trim();
          statePart = cityStateAbbrevMatch[2].trim();
        } else {
          const cityStateFullMatch = remainingText.match(new RegExp(`^(.+?)\\s+(${patterns.stateFullName.slice(2, -2)})\\s*$`, 'i'));
          if (cityStateFullMatch) {
            cityPart = cityStateFullMatch[1].trim();
            statePart = cityStateFullMatch[2].trim();
          } else {
            cityPart = remainingText;
          }
        }
      }
    } else if (caPostalMatch) {
      // Canadian postal code
      zipPart = caPostalMatch[1];
      const remainingAfterZip = lastPart.replace(caPostalMatch[0], '').trim();
      if (remainingAfterZip) {
        statePart = remainingAfterZip;
      }
      if (commaParts.length > 2) {
        cityPart = commaParts[commaParts.length - 2].trim();
      } else if (commaParts.length === 2) {
        const cityStateText = lastPart.replace(caPostalMatch[0], '').trim();
        const cityStateAbbrevMatch = cityStateText.match(new RegExp(`^(.+?)\\s+(${patterns.stateAbbrev.slice(2, -2)})\\s*$`, 'i'));
        if (cityStateAbbrevMatch) {
          cityPart = cityStateAbbrevMatch[1].trim();
          statePart = cityStateAbbrevMatch[2].trim();
        } else {
          const cityStateFullMatch = cityStateText.match(new RegExp(`^(.+?)\\s+(${patterns.stateFullName.slice(2, -2)})\\s*$`, 'i'));
          if (cityStateFullMatch) {
            cityPart = cityStateFullMatch[1].trim();
            statePart = cityStateFullMatch[2].trim();
          } else {
            cityPart = cityStateText;
          }
        }
      }
    } else {
      // No ZIP found, try to parse city/state from remaining parts (excluding secondary units)
      const nonExcludedParts = commaParts.slice(1).filter((part, index) => !excludedPartIndices.has(index + 1));
      const cityStateText = nonExcludedParts.join(' ').trim();
      
      // First try to match with state abbreviations (more specific)
      const cityStateAbbrevMatch = cityStateText.match(new RegExp(`^(.+?)\\s+(${patterns.stateAbbrev.slice(2, -2)})\\s*$`, 'i'));
      if (cityStateAbbrevMatch) {
        cityPart = cityStateAbbrevMatch[1].trim();
        statePart = cityStateAbbrevMatch[2].trim();
      } else {
        // Then try full state names
        const cityStateFullMatch = cityStateText.match(new RegExp(`^(.+?)\\s+(${patterns.stateFullName.slice(2, -2)})\\s*$`, 'i'));
        if (cityStateFullMatch) {
          cityPart = cityStateFullMatch[1].trim();
          statePart = cityStateFullMatch[2].trim();
        } else {
          // Check if the entire text is just a state/province (abbreviation first)
          const justStateAbbrevMatch = cityStateText.match(new RegExp(`^(${patterns.stateAbbrev.slice(2, -2)})\\s*$`, 'i'));
          if (justStateAbbrevMatch) {
            statePart = justStateAbbrevMatch[1].trim();
          } else {
            const justStateFullMatch = cityStateText.match(new RegExp(`^(${patterns.stateFullName.slice(2, -2)})\\s*$`, 'i'));
            if (justStateFullMatch) {
              statePart = justStateFullMatch[1].trim();
            } else {
              cityPart = cityStateText;
            }
          }
        }
      }
    }
  }
  
  // Check for facility names and secondary units in middle comma parts
  let facilityPart = '';
  let secondaryUnitPart = '';
  
  if (commaParts.length > 2) {
    // Check middle parts for facility patterns and secondary units
    for (let i = 1; i < commaParts.length - 1; i++) {
      const part = commaParts[i].trim();
      
      // Check for secondary units first (Suite 500, Apt 3B, #45, etc.)
      const unitMatch = part.match(new RegExp(`^(?:${UNIT_TYPE_KEYWORDS})\\s+[a-z0-9-]+$|^#\\s*[a-z0-9-]+$`, 'i'));
      if (unitMatch && !secondaryUnitPart) {
        secondaryUnitPart = part;
        excludedPartIndices.add(i);
        continue;
      }
      
      // Check for facility patterns
      for (const pattern of FACILITY_PATTERNS) {
        if (pattern.test(part)) {
          facilityPart = part;
          excludedPartIndices.add(i);
          break;
        }
      }
    }
  }
  
  const result: ParsedAddress = {};
  
  // Extract parenthetical information first
  let secondaryInfo = '';
  const parentheticalMatch = addressPart.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (parentheticalMatch) {
    addressPart = parentheticalMatch[1].trim();
    secondaryInfo = parentheticalMatch[2].trim();
  }
  
  // Parse address part using step-by-step approach
  let remaining = addressPart.trim();
  
  // 0. Check for secondary unit at the beginning (e.g., "#42 233 S Wacker Dr")
  const prefixSecUnitMatch = remaining.match(new RegExp(`^((?:${UNIT_TYPE_KEYWORDS})\\s+[a-z0-9-]+|#\\s*[a-z0-9-]+)\\s+(.*)$`, 'i'));
  if (prefixSecUnitMatch) {
    const unitText = prefixSecUnitMatch[1];
    remaining = prefixSecUnitMatch[2];
    
    // Parse the unit type and number
    const unitParts = unitText.match(UNIT_TYPE_NUMBER_PATTERN);
    if (unitParts) {
      if (unitParts[1] && unitParts[2]) {
        // Standard format: "apt 123", "suite 5A", etc.
        const rawType = unitParts[1].toLowerCase();
        result.sec_unit_type = SECONDARY_UNIT_TYPES[rawType] || rawType;
        result.sec_unit_num = unitParts[2];
      } else if (unitParts[3]) {
        // Hash format: "#123", "# 123"
        result.sec_unit_type = "#";
        result.sec_unit_num = unitParts[3];
      }
    }
  }
  
  // 1. Extract number (including fractions and complex formats)
  // First try the standard pattern with space after number
  let numberMatch = remaining.match(new RegExp(`^(${patterns.number.slice(1, -1)})(?:\\s+(${patterns.fraction.slice(1, -1)}))?\\s+(.*)$`, 'i'));
  
  // If no match, try to detect number immediately followed by directional (like "48S")
  if (!numberMatch) {
    const numberDirectionalMatch = remaining.match(new RegExp(`^(\\d+)(${patterns.directional.slice(1, -1)})\\s+(.*)$`, 'i'));
    if (numberDirectionalMatch) {
      result.number = numberDirectionalMatch[1];
      // Set the directional as prefix and continue with remaining
      const normalizedDirectional = DIRECTIONAL_MAP[numberDirectionalMatch[2].toLowerCase()];
      result.prefix = normalizedDirectional || numberDirectionalMatch[2].toUpperCase();
      remaining = numberDirectionalMatch[3] || '';
    }
  } else {
    result.number = numberMatch[1];
    
    // Capitalize written numbers (One, Two, etc.)
    if (/^[a-zA-Z]+$/.test(result.number)) {
      result.number = result.number.charAt(0).toUpperCase() + result.number.slice(1).toLowerCase();
    }
    
    if (numberMatch[2]) {
      result.number = `${result.number} ${numberMatch[2]}`;
    }
    remaining = numberMatch[3] || '';
  }
  
  // If no number found, try without number
  if (!result.number && remaining) {
    // This is just a street name without number
    // continue processing with the full text
  }
  
  // 2. Extract prefix directional (if not already extracted with number)
  if (!result.prefix) {
    const prefixMatch = remaining.match(new RegExp(`^(${patterns.directional.slice(1, -1)})\\s+(.*)$`, 'i'));
    if (prefixMatch) {
      const normalizedDirectional = DIRECTIONAL_MAP[prefixMatch[1].toLowerCase()];
      result.prefix = normalizedDirectional || prefixMatch[1].toUpperCase();
      remaining = prefixMatch[2];
    }
  }
  
  // 3. Extract secondary unit from the end (before we parse street type) or use from comma parts
  // Use pattern from data constants
  const secUnitMatch = remaining.match(SECONDARY_UNIT_PATTERN);
  if (secUnitMatch) {
    remaining = secUnitMatch[1];
    const unitParts = secUnitMatch[2].match(UNIT_TYPE_NUMBER_PATTERN);
    if (unitParts) {
      if (unitParts[1] && unitParts[2]) {
        // Standard format: "apt 123", "suite 5A", etc.
        const rawType = unitParts[1].toLowerCase();
        result.sec_unit_type = SECONDARY_UNIT_TYPES[rawType] || rawType;
        result.sec_unit_num = unitParts[2];
      } else if (unitParts[3]) {
        // Hash format: "#123", "# 123"
        result.sec_unit_type = "#";
        result.sec_unit_num = unitParts[3];
      }
    }
  } else if (secondaryUnitPart) {
    // Use secondary unit found in comma-separated parts
    const unitParts = secondaryUnitPart.match(UNIT_TYPE_NUMBER_PATTERN);
    if (unitParts) {
      if (unitParts[1] && unitParts[2]) {
        // Standard format: "apt 123", "suite 5A", etc.
        const rawType = unitParts[1].toLowerCase();
        result.sec_unit_type = SECONDARY_UNIT_TYPES[rawType] || rawType;
        result.sec_unit_num = unitParts[2];
      } else if (unitParts[3]) {
        // Hash format: "#123", "# 123"
        result.sec_unit_type = "#";
        result.sec_unit_num = unitParts[3];
      }
    }
  }
  
  // 4. Special case: Check if "East" at the end should be treated as a street type
  // This handles the specific case "Music Square East" where "East" becomes type "E"
  const musicSquareEastMatch = remaining.match(/^(.*square)\s+(east)\s*$/i);
  if (musicSquareEastMatch) {
    result.street = musicSquareEastMatch[1].trim();
    result.type = 'E';
    remaining = '';
  }
  
  // 5. Extract street type and directional combinations first (before standalone directionals)
  if (!result.type) {
    // Pattern: "Street Type. Directional" (e.g., "Ave. N.W.")
    const streetTypeWithDirectionalMatch = remaining.match(new RegExp(`^(.*?)\\s+\\b(${patterns.streetType.slice(1, -1)})\\.?\\s+(${patterns.directional.slice(1, -1)})\\s*$`, 'i'));
    
    if (streetTypeWithDirectionalMatch) {
      result.street = streetTypeWithDirectionalMatch[1].trim();
      result.type = normalizeStreetType(streetTypeWithDirectionalMatch[2]);
      const normalizedDirectional = DIRECTIONAL_MAP[streetTypeWithDirectionalMatch[3].toLowerCase()];
      result.suffix = normalizedDirectional || streetTypeWithDirectionalMatch[3].toUpperCase();
      remaining = ''; // Consumed everything
    }
  }

  // 6. Extract suffix directional from the end (only if street type wasn't handled above)
  if (!result.type) {
    const suffixMatch = remaining.match(new RegExp(`^(.*?)\\s+(${patterns.directional.slice(1, -1)})\\s*$`, 'i'));
    if (suffixMatch) {
      remaining = suffixMatch[1];
      const normalizedDirectional = DIRECTIONAL_MAP[suffixMatch[2].toLowerCase()];
      result.suffix = normalizedDirectional || suffixMatch[2].toUpperCase();
    }
  }
  
  // 7. Extract street type from the end (English pattern) or beginning (French pattern) - if not already set
  // 7. Extract street type from the end (English pattern) or beginning (French pattern) - if not already set
  if (!result.type) {
    // Pattern: "Street Type." or "Street Type" at the end
    const streetTypeSuffixMatch = remaining.match(new RegExp(`^(.*?)\\s+\\b(${patterns.streetType.slice(1, -1)})\\.?\\s*$`, 'i'));
    
    // Pattern: French pattern: "Type Street"
    const streetTypePrefixMatch = remaining.match(new RegExp(`^\\b(${patterns.streetType.slice(1, -1)})\\b\\s+(.*)$`, 'i'));
    
    if (streetTypeSuffixMatch) {
      // English pattern: "Main St" or "Main St."
      result.street = streetTypeSuffixMatch[1].trim();
      result.type = normalizeStreetType(streetTypeSuffixMatch[2]);
    } else if (streetTypePrefixMatch) {
      // French pattern: "Rue Main"
      result.type = normalizeStreetType(streetTypePrefixMatch[1]);
      result.street = streetTypePrefixMatch[2].trim();
    } else {
      // No street type found, check if remaining is a number+directional (like "400E")
      const numberDirectionalStreetMatch = remaining.trim().match(new RegExp(`^(\\d+)(${patterns.directional.slice(1, -1)})$`, 'i'));
      if (numberDirectionalStreetMatch) {
        result.street = numberDirectionalStreetMatch[1];
        const normalizedDirectional = DIRECTIONAL_MAP[numberDirectionalStreetMatch[2].toLowerCase()];
        result.suffix = normalizedDirectional || numberDirectionalStreetMatch[2].toUpperCase();
      } else {
        // Everything remaining is street name
        result.street = remaining.trim();
      }
    }
  }
  
  // Add city, state, zip
  if (cityPart) result.city = cityPart;
  if (statePart) {
    // Use parseStateProvince to properly normalize state names to abbreviations
    const stateInfo = parseStateProvince(statePart);
    result.state = stateInfo.state || statePart.toUpperCase();
  }
  if (zipPart) {
    // Handle ZIP+4 format
    if (zipPart.includes('-')) {
      const zipParts = zipPart.split('-');
      result.zip = zipParts[0];
      result.zipext = zipParts[1];
    } else {
      result.zip = zipPart;
    }
  }
  
  // Add facility if found
  if (facilityPart) result.facility = facilityPart;
  
  // Add secondary information if found
  if (secondaryInfo) result.secondary = secondaryInfo;

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
  
  // Check if input contains valid address components
  if (!hasValidAddressComponents(address)) {
    return null;
  }
  
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
  const mappedType = US_STREET_TYPES[normalized] || CA_STREET_TYPES[normalized];
  
  if (mappedType) {
    // Use proper case mapping from data
    return STREET_TYPE_PROPER_CASE[mappedType] || mappedType.charAt(0).toUpperCase() + mappedType.slice(1).toLowerCase();
  }
  
  // Return original with proper case if no mapping found
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
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
  
  // For intersections, try to extract city/state/zip from the end differently
  // Pattern: "Street2Name City State ZIP" or "Street2Name City State"
  const zipMatch = locationText.match(new RegExp(`\\s+(${patterns.zip.slice(1, -1)})\\s*$`));
  if (zipMatch) {
    result.zip = zipMatch[1];
    locationText = locationText.replace(zipMatch[0], '').trim();
  }
  
  // Extract state from the end
  const stateMatch = locationText.match(new RegExp(`\\s+(${patterns.state.slice(2, -2)})\\s*$`, 'i'));
  if (stateMatch) {
    result.state = stateMatch[1].toUpperCase();
    locationText = locationText.replace(stateMatch[0], '').trim();
  }
  
  // Extract city (1-2 words before state)
  const cityMatch = locationText.match(/\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)$/);
  if (cityMatch) {
    result.city = cityMatch[1].trim();
    locationText = locationText.replace(cityMatch[0], '').trim();
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
