/**
 * Core parsing utilities and regex patterns
 */

import {
  DIRECTIONAL_MAP,
  US_STREET_TYPES,
  CA_STREET_TYPES,
  US_STATES,
  CA_PROVINCES,
  SECONDARY_UNIT_TYPES,
  ZIP_CODE_PATTERN,
  CANADIAN_POSTAL_CODE_PATTERN,
  FACILITY_PATTERNS,
} from '../data';
import { ParsedAddress, ParseOptions } from '../types';

/**
 * Normalize text for consistent parsing
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.,;]/g, ' ')
    .trim();
}

/**
 * Build regex patterns from dictionary
 */
function buildRegexFromDict(dict: Record<string, string>, capture = true): RegExp {
  const keys = Object.keys(dict).sort((a, b) => b.length - a.length);
  const pattern = keys.map(key => key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  return new RegExp(capture ? `\\b(${pattern})\\b` : `\\b(?:${pattern})\\b`, 'i');
}

/**
 * Extract and normalize directional
 */
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

/**
 * Extract and normalize street type
 */
function parseStreetType(text: string, country: 'US' | 'CA' = 'US'): { type: string | undefined; remaining: string } {
  const typeMap = country === 'CA' ? { ...US_STREET_TYPES, ...CA_STREET_TYPES } : US_STREET_TYPES;
  const typePattern = buildRegexFromDict(typeMap);
  const match = text.match(typePattern);
  
  if (match) {
    const type = typeMap[match[1].toLowerCase()];
    const remaining = text.replace(typePattern, ' ').replace(/\s+/g, ' ').trim();
    return { type, remaining };
  }
  
  return { type: undefined, remaining: text };
}

/**
 * Extract state or province  
 */
function parseStateProvince(text: string, country?: 'US' | 'CA'): { state: string | undefined; remaining: string; detectedCountry?: 'US' | 'CA' } {
  // Try US state abbreviations first (more specific than full names)
  const usAbbrevPattern = new RegExp(`\\b(${Object.values(US_STATES).join('|')})\\b`, 'i');
  let match = text.match(usAbbrevPattern);
  if (match) {
    const state = match[1].toUpperCase();
    const remaining = text.replace(new RegExp(`\\b${match[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i'), ' ').replace(/\s+/g, ' ').trim();
    return { state, remaining, detectedCountry: 'US' };
  }
  
  // Try Canadian province abbreviations
  const caAbbrevPattern = new RegExp(`\\b(${Object.values(CA_PROVINCES).join('|')})\\b`, 'i');
  match = text.match(caAbbrevPattern);
  if (match) {
    const state = match[1].toUpperCase();
    const remaining = text.replace(new RegExp(`\\b${match[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i'), ' ').replace(/\s+/g, ' ').trim();
    return { state, remaining, detectedCountry: 'CA' };
  }
  
  // Try US states full names (only if no abbreviation found)
  const usPattern = buildRegexFromDict(US_STATES);
  match = text.match(usPattern);
  if (match) {
    const state = US_STATES[match[1].toLowerCase()];
    const remaining = text.replace(new RegExp(`\\b${match[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'), ' ').replace(/\s+/g, ' ').trim();
    return { state, remaining, detectedCountry: 'US' };
  }
  
  // Try Canadian provinces full names
  const caPattern = buildRegexFromDict(CA_PROVINCES);
  match = text.match(caPattern);
  if (match) {
    const state = CA_PROVINCES[match[1].toLowerCase()];
    const remaining = text.replace(new RegExp(`\\b${match[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'), ' ').replace(/\s+/g, ' ').trim();
    return { state, remaining, detectedCountry: 'CA' };
  }
  
  return { state: undefined, remaining: text };
}

/**
 * Extract postal code (ZIP or Canadian postal code)
 */
function parsePostalCode(text: string): { zip: string | undefined; zipext: string | undefined; remaining: string; detectedCountry?: 'US' | 'CA' } {
  // Try US ZIP code - look for it anywhere in the text
  const zipMatch = text.match(/\b(\d{5})(?:[-\s]?(\d{4}))?\b/);
  if (zipMatch) {
    const zip = zipMatch[1];
    const zipext = zipMatch[2];
    const remaining = text.replace(zipMatch[0], ' ').replace(/\s+/g, ' ').trim();
    return { zip, zipext, remaining, detectedCountry: 'US' };
  }
  
  // Try Canadian postal code - look for it anywhere in the text
  const postalMatch = text.match(/\b([A-Za-z]\d[A-Za-z])\s?(\d[A-Za-z]\d)\b/);
  if (postalMatch) {
    const zip = `${postalMatch[1]} ${postalMatch[2]}`.toUpperCase();
    const remaining = text.replace(postalMatch[0], ' ').replace(/\s+/g, ' ').trim();
    return { zip, zipext: undefined, remaining, detectedCountry: 'CA' };
  }
  
  return { zip: undefined, zipext: undefined, remaining: text };
}

/**
 * Parse secondary unit information (apartment, suite, etc.)
 */
function parseSecondaryUnit(text: string): { 
  unit: string | undefined; 
  sec_unit_type: string | undefined; 
  sec_unit_num: string | undefined; 
  remaining: string;
} {
  const unitPattern = buildRegexFromDict(SECONDARY_UNIT_TYPES);
  
  // Look for unit type followed by number
  const unitMatch = text.match(new RegExp(`${unitPattern.source}\\s*(\\d+\\w*|[a-zA-Z]+\\d*)`));
  if (unitMatch) {
    const sec_unit_type = SECONDARY_UNIT_TYPES[unitMatch[1].toLowerCase()];
    const sec_unit_num = unitMatch[2];
    const unit = `${sec_unit_type} ${sec_unit_num}`;
    const remaining = text.replace(unitMatch[0], ' ').replace(/\s+/g, ' ').trim();
    return { unit, sec_unit_type, sec_unit_num, remaining };
  }
  
  // Look for just numbers that might be unit numbers
  const numberMatch = text.match(/\b(apt|apartment|unit|ste|suite|#)\s*(\d+\w*)\b/i);
  if (numberMatch) {
    const sec_unit_type = SECONDARY_UNIT_TYPES[numberMatch[1].toLowerCase()] || numberMatch[1].toLowerCase();
    const sec_unit_num = numberMatch[2];
    const unit = `${sec_unit_type} ${sec_unit_num}`;
    const remaining = text.replace(numberMatch[0], ' ').replace(/\s+/g, ' ').trim();
    return { unit, sec_unit_type, sec_unit_num, remaining };
  }
  
  return { unit: undefined, sec_unit_type: undefined, sec_unit_num: undefined, remaining: text };
}

/**
 * Extract facility names
 */
/**
 * Parse facility information from address
 */
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

/**
 * Parse parenthetical information
 */
function parseParenthetical(text: string): { secondary: string | undefined; remaining: string } {
  const parenMatch = text.match(/\(([^)]+)\)/);
  if (parenMatch) {
    const secondary = parenMatch[1].trim();
    const remaining = text.replace(parenMatch[0], ' ').replace(/\s+/g, ' ').trim();
    return { secondary, remaining };
  }
  
  return { secondary: undefined, remaining: text };
}

/**
 * Extract street number (including fractional)
 */
function parseStreetNumber(text: string): { number: string | undefined; remaining: string } {
  // Handle fractional numbers like "123 1/2" or "123-1/2"
  const fracMatch = text.match(/^\s*(\d+(?:\s*[-\/]\s*\d+\/\d+|\s+\d+\/\d+)?)\b/);
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

/**
 * Detect country from address components
 */
function detectCountry(address: ParsedAddress): 'US' | 'CA' | undefined {
  if (address.state) {
    if (Object.values(US_STATES).includes(address.state) || Object.keys(US_STATES).includes(address.state.toLowerCase())) {
      return 'US';
    }
    if (Object.values(CA_PROVINCES).includes(address.state) || Object.keys(CA_PROVINCES).includes(address.state.toLowerCase())) {
      return 'CA';
    }
  }
  
  if (address.zip) {
    if (ZIP_CODE_PATTERN.test(address.zip)) {
      return 'US';
    }
    if (CANADIAN_POSTAL_CODE_PATTERN.test(address.zip)) {
      return 'CA';
    }
  }
  
  return undefined;
}

export {
  buildRegexFromDict,
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
};