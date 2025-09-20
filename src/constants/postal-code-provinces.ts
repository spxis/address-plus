// Canadian postal code to province mapping
// Based on Canada Post guidelines: https://www.canadapost-postescanada.ca/cpc/en/support/articles/addressing-guidelines/postal-codes.page

// Map postal code first letter to province abbreviation
// Canadian postal codes follow the pattern: Letter-Digit-Letter Digit-Letter-Digit
// The first letter indicates the province/territory
const POSTAL_CODE_TO_PROVINCE: Record<string, string> = {
  // Newfoundland and Labrador
  A: "NL",
  
  // Nova Scotia
  B: "NS",
  
  // Prince Edward Island  
  C: "PE",
  
  // New Brunswick
  E: "NB",
  
  // Quebec (Eastern)
  G: "QC",
  H: "QC",
  J: "QC",
  
  // Ontario (Eastern)
  K: "ON",
  L: "ON",
  M: "ON", // Toronto area
  N: "ON",
  P: "ON",
  
  // Manitoba
  R: "MB",
  
  // Saskatchewan
  S: "SK",
  
  // Alberta
  T: "AB",
  
  // British Columbia
  V: "BC",
  
  // Northwest Territories, Nunavut, Yukon
  X: "NT", // Also covers NU and YT - more specific mapping needed
  Y: "YT"
};

// More specific postal code ranges for territories
// These ranges help distinguish between NT, NU, and YT within X prefix
const TERRITORY_POSTAL_RANGES: Array<{ pattern: RegExp; province: string }> = [
  // Yukon Territory - Y prefix
  { pattern: /^Y/, province: "YT" },
  
  // Nunavut - X0A, X0B, X0C ranges
  { pattern: /^X0[ABC]/, province: "NU" },
  
  // Northwest Territories - X0E, X0G, X1A ranges  
  { pattern: /^X[01]/, province: "NT" }
];

// Extract province from Canadian postal code
// @param postalCode - Canadian postal code (e.g., "M5V 3A8", "K1A 0A6")
// @returns Province abbreviation (e.g., "ON", "QC") or null if not Canadian
function getProvinceFromPostalCode(postalCode: string): string | null {
  if (!postalCode) return null;
  
  // Clean and normalize postal code
  const cleaned = postalCode.replace(/\s+/g, '').toUpperCase();
  
  // Validate Canadian postal code format (Letter-Digit-Letter Digit-Letter-Digit)
  if (!/^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(cleaned)) {
    return null;
  }
  
  const firstLetter = cleaned.charAt(0);
  
  // Check territory ranges first (for X prefix codes)
  if (firstLetter === 'X' || firstLetter === 'Y') {
    for (const range of TERRITORY_POSTAL_RANGES) {
      if (range.pattern.test(cleaned)) {
        return range.province;
      }
    }
  }
  
  // Use standard first-letter mapping
  const province = POSTAL_CODE_TO_PROVINCE[firstLetter];
  return province || null;
}

export { 
  POSTAL_CODE_TO_PROVINCE, 
  TERRITORY_POSTAL_RANGES,
  getProvinceFromPostalCode 
};