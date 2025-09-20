// Parsed intersection result containing two streets and location info
interface ParsedIntersection {
  street1?: string; // First street
  type1?: string; // First street type
  prefix1?: string; // First street prefix
  suffix1?: string; // First street suffix
  street2?: string; // Second street
  type2?: string; // Second street type
  prefix2?: string; // Second street prefix
  suffix2?: string; // Second street suffix
  city?: string; // City
  state?: string; // State/Province
  zip?: string; // ZIP/Postal code
  plus4?: string; // Extended ZIP+4 code
  country?: "CA" | "US"; // Country
  postalValid?: boolean; // Postal code validation status
  postalType?: "zip" | "postal"; // Postal code type (zip or postal)
}

export type { ParsedIntersection };
