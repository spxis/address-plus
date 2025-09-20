import levenshtein from "fast-levenshtein";

import { REGIONS } from "../constants/regions.js";
import type { Region } from "../types/region.js";

// Region normalization utilities for fuzzy matching

// Normalizes a region input string to find the best matching state/province
// Supports exact matches and fuzzy matching for misspellings
// @param input - The input string to normalize (state/province name or abbreviation)  
// @returns Object with abbreviation and country, or null if no match found
// @example normalizeRegion('Calfornia') → { abbr: 'CA', country: 'US' }
function normalizeRegion(input: string): { abbr: string; country: "CA" | "US" } | null {
  if (!input) {
    return null;
  }

  const clean = input.trim().replace(/\./g, "").toLowerCase();
  
  // Return null for empty strings after trimming
  if (clean === "") {
    return null;
  }

  // 1. Exact match on abbreviation
  const exactAbbr = REGIONS.find((r) => r.abbr.toLowerCase() === clean);
  if (exactAbbr) {
    return { abbr: exactAbbr.abbr, country: exactAbbr.country };
  }

  // 2. Exact match on full name
  const exactName = REGIONS.find((r) => r.name.toLowerCase() === clean);
  if (exactName) {
    return { abbr: exactName.abbr, country: exactName.country };
  }

  // 3. Fuzzy match on name
  let best: { region: Region; dist: number } | null = null;
  for (const region of REGIONS) {
    const dist = levenshtein.get(clean, region.name.toLowerCase());
    if (!best || dist < best.dist) {
      best = { region, dist };
    }
  }

  // Accept if reasonably close (tune threshold)
  // Additional check: for short inputs (3 chars or less), require a closer match
  // to avoid false positives with random strings
  const threshold = clean.length <= 3 ? 1 : 3;
  if (best && best.dist <= threshold) {
    return { abbr: best.region.abbr, country: best.region.country };
  }

  return null;
}

export { normalizeRegion };