/**
 * Types for address comparison and similarity functions
 */

import type { ParsedAddress } from "./index";

// Address comparison options
export interface AddressComparisonOptions {
  ignoreCase?: boolean;
  ignorePunctuation?: boolean;
  normalizeStreetTypes?: boolean;
  normalizeDirections?: boolean;
  normalizeStates?: boolean;
  fuzzyMatching?: boolean;
  strictPostalCode?: boolean;
  requireExactMatch?: boolean;
}

// Address similarity result
export interface AddressSimilarityResult {
  score: number; // 0-1 similarity score
  isMatch: boolean; // Whether addresses are considered a match
  confidence: number; // 0-1 confidence in the match
  details: {
    streetScore: number;
    cityScore: number;
    stateScore: number;
    postalScore: number;
    overallScore: number;
  };
  differences: AddressDifference[];
  suggestions?: string[];
}

// Address difference details
export interface AddressDifference {
  field: keyof ParsedAddress;
  value1: string | undefined;
  value2: string | undefined;
  type: "missing" | "different" | "similar" | "typo";
  confidence: number;
}

// Address match types
export type AddressMatchType = "exact" | "strong" | "moderate" | "weak" | "none";

// Address comparison result
export interface AddressComparisonResult {
  isSame: boolean;
  matchType: AddressMatchType;
  similarity: AddressSimilarityResult;
  normalizedAddress1: ParsedAddress;
  normalizedAddress2: ParsedAddress;
}

// Fuzzy matching options
export interface FuzzyMatchOptions {
  threshold: number; // 0-1 minimum similarity threshold
  maxDistance: number; // Maximum edit distance for string matching
  enableSoundex?: boolean; // Use soundex for phonetic matching
  enableMetaphone?: boolean; // Use metaphone for phonetic matching
}