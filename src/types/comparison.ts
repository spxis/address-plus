// Types for address comparison and similarity functions

import type { ParsedAddress } from "./index";

// Address comparison options
interface AddressComparisonOptions {
  ignoreCase?: boolean; // Whether to ignore case when comparing text
  ignorePunctuation?: boolean; // Whether to ignore punctuation marks
  normalizeStreetTypes?: boolean; // Whether to normalize street type abbreviations
  normalizeDirections?: boolean; // Whether to normalize directional abbreviations
  normalizeStates?: boolean; // Whether to normalize state/province names
  fuzzyMatching?: boolean; // Whether to use fuzzy string matching
  strictPostalCode?: boolean; // Whether postal codes must match exactly
  requireExactMatch?: boolean; // Whether all fields must match exactly
}

// Address similarity result
interface AddressSimilarityResult {
  score: number; // 0-1 similarity score
  isMatch: boolean; // Whether addresses are considered a match
  confidence: number; // 0-1 confidence in the match
  details: {
    streetScore: number; // Street name similarity score
    cityScore: number; // City name similarity score
    stateScore: number; // State/province similarity score
    postalScore: number; // Postal code similarity score
    overallScore: number; // Combined overall similarity score
  };
  differences: AddressDifference[];
  suggestions?: string[];
}

// Address difference details
interface AddressDifference {
  field: keyof ParsedAddress; // Which address field differs
  value1: string | undefined; // Value from first address
  value2: string | undefined; // Value from second address
  type: "missing" | "different" | "similar" | "typo"; // Type of difference
  confidence: number; // Confidence in the difference assessment
}

// Address match types
type AddressMatchType = "exact" | "strong" | "moderate" | "weak" | "none";

// Address comparison result
interface AddressComparisonResult {
  isSame: boolean; // Whether addresses are considered the same
  matchType: AddressMatchType; // Type of match found
  similarity: AddressSimilarityResult; // Detailed similarity analysis
  normalizedAddress1: ParsedAddress; // First address after normalization
  normalizedAddress2: ParsedAddress; // Second address after normalization
}

// Fuzzy matching options
interface FuzzyMatchOptions {
  threshold: number; // 0-1 minimum similarity threshold
  maxDistance: number; // Maximum edit distance for string matching
  enableSoundex?: boolean; // Use soundex for phonetic matching
  enableMetaphone?: boolean; // Use metaphone for phonetic matching
}

export type { 
  AddressComparisonOptions,
  AddressSimilarityResult,
  AddressDifference,
  AddressMatchType,
  AddressComparisonResult,
  FuzzyMatchOptions
};