/**
 * Simplified, more accurate address parser
 */

import { ParsedAddress, ParseOptions } from './types';
import { 
  US_STREET_TYPES, 
  CA_STREET_TYPES, 
  US_STATES, 
  CA_PROVINCES,
  SECONDARY_UNIT_TYPES,
  DIRECTIONAL_MAP
} from './data';

/**
 * Normalize text but preserve original for final output
 */
function normalize(text: string): string {
  return text.toLowerCase().replace(/[.,;]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Create proper-case version of text
 */
function properCase(text: string): string {
  return text.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
}

/**
 * Build pattern for matching dictionary terms
 */
function buildPattern(dict: Record<string, string>): RegExp {
  const keys = Object.keys(dict).sort((a, b) => b.length - a.length);
  const pattern = keys.map(key => key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  return new RegExp(`\\b(${pattern})\\b`, 'i');
}

/**
 * Simple, accurate address parser
 */
export function parseLocationSimple(address: string, options: ParseOptions = {}): ParsedAddress | null {
  if (!address || typeof address !== 'string') {
    return null;
  }

  const original = address.trim();
  const normalized = normalize(original);
  const result: ParsedAddress = {};

  // Parse from the original text to preserve case
  let workingOriginal = original;
  let workingNormalized = normalized;

  // Extract ZIP/Postal code first
  const zipMatch = workingNormalized.match(/\b(\d{5})(?:[-\s]?(\d{4}))?\b/);
  const postalMatch = workingNormalized.match(/\b([a-z]\d[a-z])\s?(\d[a-z]\d)\b/i);
  
  if (zipMatch) {
    result.zip = zipMatch[1];
    if (zipMatch[2]) result.zipext = zipMatch[2];
    result.country = 'US';
    // Remove from both versions
    workingOriginal = workingOriginal.replace(new RegExp(zipMatch[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), ' ');
    workingNormalized = workingNormalized.replace(zipMatch[0], ' ');
  } else if (postalMatch) {
    result.zip = `${postalMatch[1]} ${postalMatch[2]}`.toUpperCase();
    result.country = 'CA';
    workingOriginal = workingOriginal.replace(new RegExp(postalMatch[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), ' ');
    workingNormalized = workingNormalized.replace(postalMatch[0], ' ');
  }

  // Extract state/province
  const usStates = Object.values(US_STATES).join('|');
  const caProvinces = Object.values(CA_PROVINCES).join('|');
  
  const stateMatch = workingNormalized.match(new RegExp(`\\b(${usStates}|${caProvinces})\\b`, 'i'));
  if (stateMatch) {
    result.state = stateMatch[1].toUpperCase();
    if (!result.country) {
      result.country = Object.values(US_STATES).includes(result.state) ? 'US' : 'CA';
    }
    workingOriginal = workingOriginal.replace(new RegExp(stateMatch[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), ' ');
    workingNormalized = workingNormalized.replace(stateMatch[0], ' ');
  }

  // Clean up extra spaces
  workingOriginal = workingOriginal.replace(/\s+/g, ' ').trim();
  workingNormalized = workingNormalized.replace(/\s+/g, ' ').trim();

  // Split by comma if present
  const parts = workingOriginal.split(',').map(p => p.trim()).filter(Boolean);
  
  let streetPart = '';
  let cityPart = '';

  if (parts.length >= 2) {
    streetPart = parts[0];
    cityPart = parts[1];
  } else if (parts.length === 1) {
    // No comma - need to parse more carefully
    const words = parts[0].split(/\s+/);
    
    // If we have state/zip, we can be more confident about what's city vs street
    if (result.state || result.zip) {
      // Look for street number at the beginning
      const numberMatch = words[0].match(/^\d+/);
      if (numberMatch && words.length > 1) {
        // Has street number, so this is probably all street
        streetPart = parts[0];
      } else {
        // No street number, might be city only
        cityPart = parts[0];
      }
    } else {
      // No state/zip context, harder to determine
      streetPart = parts[0];
    }
  }

  // Parse street components
  if (streetPart) {
    const streetNorm = normalize(streetPart);
    
    // Extract street number
    const numMatch = streetPart.match(/^(\d+(?:\s*[-\/]\s*\d+\/\d+|\s+\d+\/\d+)?)/);
    if (numMatch) {
      result.number = numMatch[1].trim();
      streetPart = streetPart.replace(numMatch[0], ' ').trim();
    }

    // Extract directional prefix
    const dirPattern = buildPattern(DIRECTIONAL_MAP);
    const prefixMatch = streetPart.match(new RegExp(`^\\s*(${dirPattern.source.slice(3, -3)})\\s+`, 'i'));
    if (prefixMatch) {
      result.prefix = DIRECTIONAL_MAP[prefixMatch[1].toLowerCase()];
      streetPart = streetPart.replace(prefixMatch[0], ' ').trim();
    }

    // Extract street type and suffix directional
    const streetTypes = result.country === 'CA' ? {...US_STREET_TYPES, ...CA_STREET_TYPES} : US_STREET_TYPES;
    const typePattern = buildPattern(streetTypes);
    
    const streetWords = streetPart.split(/\s+/);
    let typeIndex = -1;
    let suffixIndex = -1;

    // Look for street type
    for (let i = 0; i < streetWords.length; i++) {
      if (typePattern.test(streetWords[i])) {
        typeIndex = i;
        break;
      }
    }

    if (typeIndex >= 0) {
      result.type = streetTypes[streetWords[typeIndex].toLowerCase()];
      
      // Check for suffix directional after street type
      if (typeIndex + 1 < streetWords.length) {
        const suffixCandidate = streetWords[typeIndex + 1];
        if (dirPattern.test(suffixCandidate)) {
          result.suffix = DIRECTIONAL_MAP[suffixCandidate.toLowerCase()];
          suffixIndex = typeIndex + 1;
        }
      }

      // Street name is everything before the type
      if (typeIndex > 0) {
        result.street = streetWords.slice(0, typeIndex).join(' ');
      }

      // If there's remaining text after type/suffix, it might be city
      const remainingStart = suffixIndex >= 0 ? suffixIndex + 1 : typeIndex + 1;
      if (remainingStart < streetWords.length && !cityPart) {
        cityPart = streetWords.slice(remainingStart).join(' ');
      }
    } else {
      // No street type found, assume it's all street name
      result.street = streetPart;
    }
  }

  // Set city
  if (cityPart) {
    result.city = cityPart;
  }

  // Auto-detect country if not set
  if (!result.country) {
    if (result.state) {
      result.country = Object.values(US_STATES).includes(result.state) ? 'US' : 'CA';
    }
  }

  // Return only if we have meaningful components
  const hasComponents = result.number || result.street || result.city || result.state || result.zip;
  return hasComponents ? result : null;
}