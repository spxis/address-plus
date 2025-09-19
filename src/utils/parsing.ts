// Core parsing utilities and regex patterns
import { COUNTRIES } from "../constants";
import {
  DIRECTIONAL_MAP,
  US_STREET_TYPES,
  CA_STREET_TYPES,
  US_STATES,
  CA_PROVINCES,
  SECONDARY_UNIT_TYPES,
  FACILITY_PATTERNS,
  getProvinceFromPostalCode,
} from '../data';
import { ZIP_CODE_PATTERN, CANADIAN_POSTAL_CODE_PATTERN } from '../validation';
import { ParsedAddress, ParseOptions } from '../types';
import { capitalizeStreetName, capitalizeWords } from './capitalization';

// Regex patterns for parsing components
const ZIP_MATCH_PATTERN = /\b(\d{5})(?:[-\s]?(\d{4}))?\b/;
const POSTAL_MATCH_PATTERN = /\b([A-Za-z]\d[A-Za-z])\s?(\d[A-Za-z]\d)\b/;
const UNIT_NUMBER_PATTERN = /\b(apt|apartment|unit|ste|suite|#)\s*(\d+\w*)\b/i;
const FRACTIONAL_NUMBER_PATTERN = new RegExp(
  "^\\s*(\\d+(?:\\s*[-\\/]\\s*\\d+\\/\\d+|\\s+\\d+\\/\\d+)?)\\b"
);

// Normalize text for consistent parsing
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.,;]/g, ' ')
    .trim();
}

// Build regex patterns from dictionary
function buildRegexFromDict(dict: Record<string, string>, capture = true): RegExp {
  const keys = Object.keys(dict).sort((a, b) => b.length - a.length);
  const pattern = keys.map(key => key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  return new RegExp(capture ? `\\b(${pattern})\\b` : `\\b(?:${pattern})\\b`, 'i');
}

// Extract and normalize directional
function parseDirectional(text: string): { direction: string | undefined; remaining: string } {
  const dirPattern = buildRegexFromDict(DIRECTIONAL_MAP);
  const match = text.match(dirPattern);
  
  if (match) {
    const direction = DIRECTIONAL_MAP[match[1].toLowerCase()];
    const remaining = text.replace(dirPattern, ' ').replace(/\s+/g, ' ').trim();
    return { direction, remaining };
  }
  
  return { direction: undefined, remaining: text };
}

// Extract and normalize street type
function parseStreetType(text: string, country: 'US' | 'CA' = COUNTRIES.UNITED_STATES): { type: string | undefined; remaining: string } {
  const typeMap = country === COUNTRIES.CANADA ? { ...US_STREET_TYPES, ...CA_STREET_TYPES } : US_STREET_TYPES;
  const typePattern = buildRegexFromDict(typeMap);
  const match = text.match(typePattern);
  
  if (match) {
    const type = typeMap[match[1].toLowerCase()];
    const remaining = text.replace(typePattern, ' ').replace(/\s+/g, ' ').trim();
    return { type, remaining };
  }
  
  return { type: undefined, remaining: text };
}

// Extract state or province  
function parseStateProvince(text: string, country?: 'US' | 'CA'): { state: string | undefined; remaining: string; detectedCountry?: 'US' | 'CA' } {
  // Try US state abbreviations first (more specific than full names)
  const usAbbrevPattern = new RegExp(`\\b(${Object.values(US_STATES).join('|')})\\b`, 'i');
  let match = text.match(usAbbrevPattern);
  if (match) {
    const state = match[1].toUpperCase();
    const remaining = text.replace(new RegExp(`\\b${match[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i'), ' ').replace(/\s+/g, ' ').trim();
    return { state, remaining, detectedCountry: COUNTRIES.UNITED_STATES };
  }
  
  // Try Canadian province abbreviations
  const caAbbrevPattern = new RegExp(`\\b(${Object.values(CA_PROVINCES).join('|')})\\b`, 'i');
  match = text.match(caAbbrevPattern);
  if (match) {
    const state = match[1].toUpperCase();
    const remaining = text.replace(new RegExp(`\\b${match[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i'), ' ').replace(/\s+/g, ' ').trim();
    return { state, remaining, detectedCountry: COUNTRIES.CANADA };
  }
  
  // Try US states full names (only if no abbreviation found)
  const usPattern = buildRegexFromDict(US_STATES);
  match = text.match(usPattern);
  if (match) {
    const state = US_STATES[match[1].toLowerCase()];
    const remaining = text.replace(new RegExp(`\\b${match[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'), ' ').replace(/\s+/g, ' ').trim();
    return { state, remaining, detectedCountry: COUNTRIES.UNITED_STATES };
  }
  
  // Try Canadian provinces full names
  const caPattern = buildRegexFromDict(CA_PROVINCES);
  match = text.match(caPattern);
  if (match) {
    const state = CA_PROVINCES[match[1].toLowerCase()];
    const remaining = text.replace(new RegExp(`\\b${match[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'), ' ').replace(/\s+/g, ' ').trim();
    return { state, remaining, detectedCountry: COUNTRIES.CANADA };
  }
  
  return { state: undefined, remaining: text };
}

// Extract postal code (ZIP or Canadian postal code)
function parsePostalCode(text: string): { zip: string | undefined; plus4: string | undefined; remaining: string; detectedCountry?: 'US' | 'CA'; detectedProvince?: string } {
  // Try US ZIP code - use centralized pattern
  const zipMatch = text.match(ZIP_MATCH_PATTERN);
  if (zipMatch) {
    // Validate with the proper pattern from validation.ts
    const fullZip = zipMatch[0].replace(/\s+/g, '');
    if (ZIP_CODE_PATTERN.test(fullZip)) {
      const zip = zipMatch[1];
      const plus4 = zipMatch[2];
      const remaining = text.replace(zipMatch[0], '').trim();
      return { zip, plus4, remaining, detectedCountry: COUNTRIES.UNITED_STATES };
    }
  }
  
  // Try Canadian postal code - use centralized pattern
  const postalMatch = text.match(POSTAL_MATCH_PATTERN);
  if (postalMatch) {
    // Validate with the proper pattern from validation.ts
    const fullPostal = `${postalMatch[1]} ${postalMatch[2]}`.toUpperCase();
    if (CANADIAN_POSTAL_CODE_PATTERN.test(fullPostal)) {
      const zip = fullPostal;
      const remaining = text.replace(postalMatch[0], ' ').replace(/\s+/g, ' ').trim();
      const detectedProvince = getProvinceFromPostalCode(zip) || undefined;
      return { zip, plus4: undefined, remaining, detectedCountry: COUNTRIES.CANADA, detectedProvince };
    }
  }
  
  return { zip: undefined, plus4: undefined, remaining: text };
}

// Parse secondary unit information (apartment, suite, etc.)
export function parseSecondaryUnit(text: string): { 
  unit: string | undefined; 
  secUnitType: string | undefined; 
  secUnitNum: string | undefined; 
  remaining: string;
} {
  const unitPattern = buildRegexFromDict(SECONDARY_UNIT_TYPES);
  
  // Look for unit type followed by number
  const unitMatch = text.match(new RegExp(`${unitPattern.source}\\s*(\\d+\\w*|[a-zA-Z]+\\d*)`));
  if (unitMatch) {
    const secUnitType = SECONDARY_UNIT_TYPES[unitMatch[1].toLowerCase()];
    const secUnitNum = unitMatch[2];
    const unit = `${secUnitType} ${secUnitNum}`;
    const remaining = text.replace(unitMatch[0], ' ').replace(/\s+/g, ' ').trim();
    return { unit, secUnitType, secUnitNum, remaining };
  }
  
  // Look for numbers that might be unit numbers
  const numberMatch = text.match(UNIT_NUMBER_PATTERN);
  if (numberMatch) {
    const secUnitType = SECONDARY_UNIT_TYPES[numberMatch[1].toLowerCase()] || numberMatch[1].toLowerCase();
    const secUnitNum = numberMatch[2];
    const unit = `${secUnitType} ${secUnitNum}`;
    const remaining = text.replace(numberMatch[0], ' ').replace(/\s+/g, ' ').trim();
    return { unit, secUnitType, secUnitNum, remaining };
  }
  
  return { unit: undefined, secUnitType: undefined, secUnitNum: undefined, remaining: text };
}

// Extract facility names
// Parse facility information from address
function parseFacility(text: string): { facility: string | undefined; remaining: string } {
  for (const pattern of FACILITY_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      // Try to extract the full facility name (word before + match + word after if relevant)
      const fullMatch = text.match(new RegExp(`\\b[\\w\\s]*${match[0]}[\\w\\s]*\\b`, 'i'));
      if (fullMatch) {
        const facility = fullMatch[0].trim();
        const remaining = text.replace(fullMatch[0], ' ').replace(/\s+/g, ' ').trim();
        return { facility, remaining };
      }
    }
  }
  
  return { facility: undefined, remaining: text };
}

// Parse parenthetical information
function parseParenthetical(text: string): { secondary: string | undefined; remaining: string } {
  const parenMatch = text.match(/\(([^)]+)\)/);
  if (parenMatch) {
    const secondary = parenMatch[1].trim();
    const remaining = text.replace(parenMatch[0], ' ').replace(/\s+/g, ' ').trim();
    return { secondary, remaining };
  }
  
  return { secondary: undefined, remaining: text };
}

// Extract street number (including fractional)
function parseStreetNumber(text: string): { number: string | undefined; remaining: string } {
  // Handle fractional numbers like "123 1/2" or "123-1/2"
  const fracMatch = text.match(FRACTIONAL_NUMBER_PATTERN);
  if (fracMatch) {
    const number = fracMatch[1].replace(/\s+/g, ' ').trim();
    const remaining = text.replace(fracMatch[0], ' ').replace(/\s+/g, ' ').trim();
    return { number, remaining };
  }
  
  // Handle simple numbers
  const numMatch = text.match(/^\s*(\d+)\b/);
  if (numMatch) {
    const number = numMatch[1];
    const remaining = text.replace(numMatch[0], ' ').replace(/\s+/g, ' ').trim();
    return { number, remaining };
  }
  
  return { number: undefined, remaining: text };
}

// Detect country from address components
function detectCountry(address: ParsedAddress): 'US' | 'CA' | undefined {
  if (address.state) {
    if (Object.values(US_STATES).includes(address.state) || Object.keys(US_STATES).includes(address.state.toLowerCase())) {
      return COUNTRIES.UNITED_STATES;
    }
    if (Object.values(CA_PROVINCES).includes(address.state) || Object.keys(CA_PROVINCES).includes(address.state.toLowerCase())) {
      return COUNTRIES.CANADA;
    }
  }
  
  if (address.zip) {
    if (ZIP_CODE_PATTERN.test(address.zip)) {
      return COUNTRIES.UNITED_STATES;
    }
    if (CANADIAN_POSTAL_CODE_PATTERN.test(address.zip)) {
      return COUNTRIES.CANADA;
    }
  }
  
  return undefined;
}

export {
  buildRegexFromDict,
  capitalizeStreetName,
  capitalizeWords,
  detectCountry,
  normalizeText,
  parseDirectional,
  parseFacility,
  parseParenthetical,
  parsePostalCode,
  parseStateProvince,
  parseStreetNumber,
  parseStreetType,
};

