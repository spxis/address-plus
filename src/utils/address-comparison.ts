// Address comparison and similarity utilities for deduplication and matching

import type { 
  ParsedAddress,
  AddressComparisonOptions,
  AddressSimilarityResult,
  AddressDifference,
  AddressMatchType,
  AddressComparisonResult,
  FuzzyMatchOptions
} from "../types";

import { US_STREET_TYPES, DIRECTIONAL_MAP } from "../constants";

// Default comparison options
const DEFAULT_COMPARISON_OPTIONS: Required<AddressComparisonOptions> = {
  ignoreCase: true,
  ignorePunctuation: true,
  normalizeStreetTypes: true,
  normalizeDirections: true,
  normalizeStates: true,
  fuzzyMatching: true,
  strictPostalCode: false,
  requireExactMatch: false,
};

// Compare two addresses and determine if they are the same
function compareAddresses(
  address1: ParsedAddress,
  address2: ParsedAddress,
  options: AddressComparisonOptions = {}
): AddressComparisonResult {
  // Handle null/undefined addresses
  if (!address1 || !address2) {
    return {
      isSame: false,
      matchType: "none",
      similarity: { 
        score: 0, 
        isMatch: false, 
        confidence: 0, 
        details: { streetScore: 0, cityScore: 0, stateScore: 0, postalScore: 0, overallScore: 0 },
        differences: []
      },
      normalizedAddress1: address1 || {} as ParsedAddress,
      normalizedAddress2: address2 || {} as ParsedAddress
    };
  }
  
  const opts = { ...DEFAULT_COMPARISON_OPTIONS, ...options };
  
  // Normalize both addresses for comparison
  const normalized1 = normalizeAddressForComparison(address1, opts);
  const normalized2 = normalizeAddressForComparison(address2, opts);
  
  // Calculate similarity
  const similarity = getAddressSimilarity(normalized1, normalized2, opts);
  
  // Determine match type
  const matchType = determineMatchType(similarity);
  
  // Determine if addresses are the same
  const isSame = opts.requireExactMatch 
    ? matchType === "exact"
    : matchType === "exact" || matchType === "strong";

  return {
    isSame,
    matchType,
    similarity,
    normalizedAddress1: normalized1,
    normalizedAddress2: normalized2,
  };
}

// Simple boolean check if two addresses are the same
function isSameAddress(
  address1: ParsedAddress,
  address2: ParsedAddress,
  options: AddressComparisonOptions = {}
): boolean {
  const result = compareAddresses(address1, address2, options);
  return result.isSame;
}

// Get detailed similarity analysis between two addresses
function getAddressSimilarity(
  address1: ParsedAddress,
  address2: ParsedAddress,
  options: AddressComparisonOptions = {}
): AddressSimilarityResult {
  // Handle null/undefined addresses
  if (!address1 || !address2) {
    return {
      score: 0,
      isMatch: false,
      confidence: 0,
      details: { streetScore: 0, cityScore: 0, stateScore: 0, postalScore: 0, overallScore: 0 },
      differences: []
    };
  }
  
  const opts = { ...DEFAULT_COMPARISON_OPTIONS, ...options };
  
  const normalized1 = normalizeAddressForComparison(address1, opts);
  const normalized2 = normalizeAddressForComparison(address2, opts);
  
  // Calculate individual field scores
  const streetScore = calculateFieldSimilarity(
    buildStreetString(normalized1),
    buildStreetString(normalized2),
    opts
  );
  
  const cityScore = calculateFieldSimilarity(
    normalized1.city || "",
    normalized2.city || "",
    opts
  );
  
  const stateScore = calculateFieldSimilarity(
    normalized1.state || "",
    normalized2.state || "",
    opts
  );
  
  const postalScore = calculatePostalSimilarity(
    normalized1.zip || "",
    normalized2.zip || "",
    opts
  );
  
  // Calculate weighted overall score
  const overallScore = calculateOverallScore({
    streetScore,
    cityScore,
    stateScore,
    postalScore,
  });
  
  // Generate differences
  const differences = findDifferences(normalized1, normalized2);
  
  // Determine if it's a match
  const isMatch = overallScore >= 0.8;
  
  // Calculate confidence based on completeness and agreement
  const confidence = calculateConfidence({
    streetScore,
    cityScore,
    stateScore,
    postalScore,
    overallScore,
  }, normalized1, normalized2);

  return {
    score: overallScore,
    isMatch,
    confidence,
    details: {
      streetScore,
      cityScore,
      stateScore,
      postalScore,
      overallScore,
    },
    differences,
    suggestions: generateSuggestions(differences),
  };
}

// Helper functions

function normalizeAddressForComparison(
  address: ParsedAddress,
  options: Required<AddressComparisonOptions>
): ParsedAddress {
  const normalized: ParsedAddress = { ...address };
  
  // Normalize case
  if (options.ignoreCase) {
    if (normalized.street) normalized.street = normalized.street.toLowerCase();
    if (normalized.type) normalized.type = normalized.type.toLowerCase();
    if (normalized.city) normalized.city = normalized.city.toLowerCase();
    if (normalized.state) normalized.state = normalized.state.toLowerCase();
    if (normalized.prefix) normalized.prefix = normalized.prefix.toLowerCase();
    if (normalized.suffix) normalized.suffix = normalized.suffix.toLowerCase();
  }
  
  // Remove punctuation
  if (options.ignorePunctuation) {
    const removePunctuation = (str: string) => str.replace(/[^\w\s]/g, "").trim();
    if (normalized.street) normalized.street = removePunctuation(normalized.street);
    if (normalized.city) normalized.city = removePunctuation(normalized.city);
  }
  
  // Normalize street types
  if (options.normalizeStreetTypes && normalized.type) {
    const normalizedType = US_STREET_TYPES[normalized.type.toLowerCase()];
    if (normalizedType) normalized.type = normalizedType;
  }
  
  // Normalize directions
  if (options.normalizeDirections) {
    if (normalized.prefix) {
      const normalizedPrefix = DIRECTIONAL_MAP[normalized.prefix.toLowerCase()];
      if (normalizedPrefix) normalized.prefix = normalizedPrefix;
    }
    if (normalized.suffix) {
      const normalizedSuffix = DIRECTIONAL_MAP[normalized.suffix.toLowerCase()];
      if (normalizedSuffix) normalized.suffix = normalizedSuffix;
    }
  }
  
  // Normalize states (simple implementation)
  if (options.normalizeStates && normalized.state) {
    // Convert full state names to abbreviations for comparison
    const stateMap: Record<string, string> = {
      "california": "ca", "texas": "tx", "florida": "fl", "new york": "ny",
      "illinois": "il", "pennsylvania": "pa", "ohio": "oh", "georgia": "ga",
      "north carolina": "nc", "michigan": "mi", "new jersey": "nj", "virginia": "va",
      "washington": "wa", "arizona": "az", "massachusetts": "ma", "tennessee": "tn",
      "indiana": "in", "missouri": "mo", "maryland": "md", "wisconsin": "wi",
      "colorado": "co", "minnesota": "mn", "south carolina": "sc", "alabama": "al",
      "louisiana": "la", "kentucky": "ky", "oregon": "or", "oklahoma": "ok",
      "connecticut": "ct", "utah": "ut", "iowa": "ia", "nevada": "nv",
      "arkansas": "ar", "mississippi": "ms", "kansas": "ks", "new mexico": "nm",
      "nebraska": "ne", "west virginia": "wv", "idaho": "id", "hawaii": "hi",
      "new hampshire": "nh", "maine": "me", "montana": "mt", "rhode island": "ri",
      "delaware": "de", "south dakota": "sd", "north dakota": "nd", "alaska": "ak",
      "vermont": "vt", "wyoming": "wy", "district of columbia": "dc",
      // Canadian provinces
      "ontario": "on", "quebec": "qc", "british columbia": "bc", "alberta": "ab",
      "manitoba": "mb", "saskatchewan": "sk", "nova scotia": "ns", "new brunswick": "nb",
      "newfoundland and labrador": "nl", "prince edward island": "pe",
      "northwest territories": "nt", "nunavut": "nu", "yukon": "yt",
    };
    
    const normalizedState = normalized.state.toLowerCase().replace(/\./g, "").trim();
    const mappedState = stateMap[normalizedState];
    if (mappedState) {
      normalized.state = mappedState;
    } else {
      // If already an abbreviation, normalize to lowercase
      normalized.state = normalizedState;
    }
  }
  
  return normalized;
}

function buildStreetString(address: ParsedAddress): string {
  const parts: string[] = [];
  
  if (address.number) parts.push(address.number);
  if (address.prefix) parts.push(address.prefix);
  if (address.street) parts.push(address.street);
  if (address.type) parts.push(address.type);
  if (address.suffix) parts.push(address.suffix);
  if (address.unit) parts.push(address.unit);
  
  return parts.join(" ").trim();
}

function calculateFieldSimilarity(
  field1: string,
  field2: string,
  options: Required<AddressComparisonOptions>
): number {
  if (!field1 && !field2) return 1.0;
  if (!field1 || !field2) return 0.0;
  
  let norm1 = field1.trim();
  let norm2 = field2.trim();
  
  // Apply case normalization only if option is enabled
  if (options.ignoreCase) {
    norm1 = norm1.toLowerCase();
    norm2 = norm2.toLowerCase();
  }
  
  if (norm1 === norm2) return 1.0;
  
  if (options.fuzzyMatching) {
    return calculateStringSimilarity(norm1, norm2);
  }
  
  return 0.0;
}

function calculateStringSimilarity(str1: string, str2: string): number {
  // Implement Levenshtein distance-based similarity
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  
  if (maxLength === 0) return 1.0;
  
  return 1 - (distance / maxLength);
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

function calculatePostalSimilarity(
  postal1: string,
  postal2: string,
  options: Required<AddressComparisonOptions>
): number {
  if (!postal1 && !postal2) return 1.0;
  if (!postal1 || !postal2) return 0.0;
  
  // Extract just the main postal code (before any dash)
  const main1 = postal1.split("-")[0];
  const main2 = postal2.split("-")[0];
  
  if (main1 === main2) {
    return options.strictPostalCode && postal1 !== postal2 ? 0.9 : 1.0;
  }
  
  if (options.fuzzyMatching) {
    return calculateStringSimilarity(main1, main2);
  }
  
  return 0.0;
}

function calculateOverallScore(scores: {
  streetScore: number;
  cityScore: number;
  stateScore: number;
  postalScore: number;
}): number {
  // Weighted scoring - street address is most important
  const weights = {
    street: 0.4,
    city: 0.25,
    state: 0.15,
    postal: 0.2,
  };
  
  return (
    scores.streetScore * weights.street +
    scores.cityScore * weights.city +
    scores.stateScore * weights.state +
    scores.postalScore * weights.postal
  );
}

function calculateConfidence(
  scores: {
    streetScore: number;
    cityScore: number;
    stateScore: number;
    postalScore: number;
    overallScore: number;
  },
  address1: ParsedAddress,
  address2: ParsedAddress
): number {
  // Base confidence on overall score
  let confidence = scores.overallScore;
  
  // Reduce confidence if addresses are incomplete
  const completeness1 = calculateAddressCompleteness(address1);
  const completeness2 = calculateAddressCompleteness(address2);
  const avgCompleteness = (completeness1 + completeness2) / 2;
  
  confidence *= avgCompleteness;
  
  // Boost confidence for exact matches on important fields
  if (scores.postalScore === 1.0) confidence += 0.1;
  if (scores.streetScore === 1.0) confidence += 0.1;
  
  return Math.min(1.0, confidence);
}

function calculateAddressCompleteness(address: ParsedAddress): number {
  const fields = ["number", "street", "city", "state", "zip"];
  const presentFields = fields.filter(field => 
    address[field as keyof ParsedAddress]
  ).length;
  
  return presentFields / fields.length;
}

function findDifferences(
  address1: ParsedAddress,
  address2: ParsedAddress
): AddressDifference[] {
  const differences: AddressDifference[] = [];
  const fields: (keyof ParsedAddress)[] = [
    "number", "street", "type", "city", "state", "zip", "prefix", "suffix"
  ];
  
  for (const field of fields) {
    const value1 = address1[field] as string | undefined;
    const value2 = address2[field] as string | undefined;
    
    if (value1 !== value2) {
      let type: AddressDifference["type"] = "different";
      let confidence = 1.0;
      
      if (!value1 || !value2) {
        type = "missing";
      } else if (calculateStringSimilarity(value1, value2) > 0.8) {
        type = "similar";
        confidence = 0.8;
      } else if (calculateStringSimilarity(value1, value2) > 0.6) {
        type = "typo";
        confidence = 0.6;
      }
      
      differences.push({
        field,
        value1,
        value2,
        type,
        confidence,
      });
    }
  }
  
  return differences;
}

function generateSuggestions(differences: AddressDifference[]): string[] {
  const suggestions: string[] = [];
  
  for (const diff of differences) {
    switch (diff.type) {
      case "missing":
        if (!diff.value1) {
          suggestions.push(`Consider adding ${diff.field}: ${diff.value2}`);
        } else {
          suggestions.push(`Consider adding ${diff.field}: ${diff.value1}`);
        }
        break;
      case "typo":
        suggestions.push(`Possible typo in ${diff.field}: "${diff.value1}" vs "${diff.value2}"`);
        break;
      case "similar":
        suggestions.push(`Similar ${diff.field} values may indicate same address`);
        break;
    }
  }
  
  return suggestions;
}

function determineMatchType(similarity: AddressSimilarityResult): AddressMatchType {
  const score = similarity.score;
  
  if (score >= 0.98) return "exact";
  if (score >= 0.85) return "strong";
  if (score >= 0.6) return "moderate";
  if (score >= 0.3) return "weak";
  return "none";
}

export { compareAddresses, isSameAddress, getAddressSimilarity };