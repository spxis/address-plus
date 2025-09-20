// Sub-region type definition for address parsing
// Represents administrative subdivisions like boroughs, parishes, districts, etc.

interface SubRegion {
  name: string; // Primary normalized name (lowercase, trimmed)
  parentCity: string; // Parent city name (empty if not applicable)
  state: string; // State/province code (e.g., "NY", "QC")
  country: "US" | "CA"; // Country code
  type: "borough" | "parish" | "district" | "ward" | "arrondissement" | "quadrant"; // Administrative type
  aliases?: string[]; // Alternative names, abbreviations, bilingual variants, no-space versions
}

export type { SubRegion };
